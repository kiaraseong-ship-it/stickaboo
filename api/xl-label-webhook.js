const { google } = require('googleapis');
const { createCanvas, loadImage } = require('canvas');

function getDriveClient() {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive'],
    });
    return google.drive({ version: 'v3', auth });
}

const SIZE_CONFIG = {
    '4-inch': { w: 1200, h: 360 },
    '5-inch': { w: 1500, h: 450 },
    '6-inch': { w: 1800, h: 540 },
};

const COLOR_MAP = {
    black: '#000000', white: '#ffffff', navy: '#1a2e5a',
    blue: '#4db8e8', green: '#2d6e3e', pink: '#f4a7c3', brown: '#8b5e3c',
};

async function generateLabelImage(order) {
    const { firstName = 'Name', lastName = '', size = '4-inch', design = '', fontColor = 'black', fontStyle = 'Nunito' } = order;
    const cfg = SIZE_CONFIG[size] || SIZE_CONFIG['4-inch'];
    const W = cfg.w, H = cfg.h;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    const hasTwo = lastName.trim().length > 0;
    const color = COLOR_MAP[fontColor] || fontColor;
    const padding = Math.round(W * 0.04);
    const iconSize = Math.round(H * (hasTwo ? 0.70 : 0.78));
    let textX = padding;

    if (design && design !== 'name-only') {
        try {
            const iconUrl = `https://stickaboo.shop/cdn/shop/files/theme-${design}.png`;
            const img = await loadImage(iconUrl);
            ctx.drawImage(img, padding, (H - iconSize) / 2, iconSize, iconSize);
            textX = padding + iconSize + Math.round(H * 0.06);
        } catch (e) {
            console.log('Icon load failed:', e.message);
        }
    }

    const availW = W - textX - padding;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    if (!hasTwo) {
        let fontSize = Math.round(H * 0.58);
        ctx.font = `bold ${fontSize}px sans-serif`;
        while (ctx.measureText(firstName).width > availW * 0.95 && fontSize > 20) {
            fontSize -= 2;
            ctx.font = `bold ${fontSize}px sans-serif`;
        }
        ctx.fillText(firstName, textX, H / 2);
    } else {
        let fontSize = Math.round(H * 0.40);
        const longer = firstName.length >= lastName.length ? firstName : lastName;
        ctx.font = `bold ${fontSize}px sans-serif`;
        while (ctx.measureText(longer).width > availW * 0.95 && fontSize > 14) {
            fontSize -= 2;
            ctx.font = `bold ${fontSize}px sans-serif`;
        }
        const lineH = fontSize * 1.15;
        const startY = (H - lineH * 2) / 2 + lineH * 0.5;
        ctx.fillText(firstName, textX, startY);
        ctx.fillText(lastName, textX, startY + lineH);
    }

    return canvas.toBuffer('image/png');
}

async function uploadToDrive(buffer, fileName) {
    const drive = getDriveClient();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const myEmail = process.env.MY_GOOGLE_EMAIL;
    const { Readable } = require('stream');

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    // 1. Service Account 드라이브에 파일 생성
    const res = await drive.files.create({
        requestBody: {
            name: fileName,
            mimeType: 'image/png',
        },
        media: {
            mimeType: 'image/png',
            body: stream,
        },
        fields: 'id',
    });

    const fileId = res.data.id;

    // 2. 내 Google 계정으로 소유권 이전
    if (myEmail) {
        await drive.permissions.create({
            fileId,
            requestBody: {
                role: 'writer',
                type: 'user',
                emailAddress: myEmail,
            },
            transferOwnership: false,
        });

        // 3. 내 드라이브 폴더로 이동
        await drive.files.update({
            fileId,
            addParents: folderId,
            fields: 'id, parents',
        });
    }

    return fileId;
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const lineItems = body.line_items || [];
        const xlItems = lineItems.filter(item =>
            item.properties && item.properties.some(p => p.name === 'Selected Size' || p.name === 'Size')
        );

        if (xlItems.length === 0) {
            return res.status(200).json({ message: 'No XL label items' });
        }

        const orderNumber = body.order_number || body.name || 'unknown';
        const results = [];

        for (const item of xlItems) {
            const props = {};
            (item.properties || []).forEach(p => { props[p.name] = p.value; });

            const orderData = {
                firstName: props['First Name'] || '',
                lastName: props['Last Name'] || '',
                size: props['Selected Size'] || props['Size'] || '4-inch',
                design: props['Design'] || '',
                fontColor: props['Font Color'] || 'black',
                fontStyle: props['Font Style'] || 'Nunito',
            };

            const qty = item.quantity || 1;
            const imgBuffer = await generateLabelImage(orderData);

            for (let i = 0; i < qty; i++) {
                const suffix = qty > 1 ? `-${i + 1}` : '';
                const fileName = `Order${orderNumber}_${orderData.firstName}${orderData.lastName ? '_' + orderData.lastName : ''}_${orderData.size}${suffix}.png`;
                const fileId = await uploadToDrive(imgBuffer, fileName);
                results.push({ fileName, fileId });
                console.log(`Saved: ${fileName}`);
            }
        }

        return res.status(200).json({ success: true, saved: results });

    } catch (err) {
        console.error('XL Label Webhook Error:', err);
        return res.status(500).json({ error: err.message });
    }
}; 
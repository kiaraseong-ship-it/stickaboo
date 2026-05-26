const { google } = require('googleapis');
const { createCanvas, loadImage } = require('canvas');

// ── Google Drive 인증 ──
function getDriveClient() {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    return google.drive({ version: 'v3', auth });
}

// ── 폰트 매핑 ──
const FONT_MAP = {
    'Nunito': 'bold 700 {size}px Nunito, sans-serif',
    'Fredoka': 'bold 700 {size}px "Fredoka One", cursive',
    'Baloo 2': 'bold 800 {size}px "Baloo 2", cursive',
    'Poppins ExtraBold': 'bold 800 {size}px Poppins, sans-serif',
    'Poppins Bold': 'bold 700 {size}px Poppins, sans-serif',
    'Bubblegum Sans': 'bold 700 {size}px "Bubblegum Sans", cursive',
    'Chewy': 'bold 700 {size}px Chewy, cursive',
    'Comic Sans': 'bold 700 {size}px "Comic Sans MS", cursive',
    'Pacifico': 'bold 700 {size}px Pacifico, cursive',
    'Comfortaa': 'bold 700 {size}px Comfortaa, cursive',
};

// ── 사이즈 설정 (300 DPI 인쇄용) ──
const SIZE_CONFIG = {
    '4-inch': { w: 1200, h: 360 },  // 4" x 1.2" @ 300dpi
    '5-inch': { w: 1500, h: 450 },  // 5" x 1.5" @ 300dpi
    '6-inch': { w: 1800, h: 540 },  // 6" x 1.8" @ 300dpi
};

// ── 컬러 매핑 ──
const COLOR_MAP = {
    black: '#000000', white: '#ffffff', navy: '#1a2e5a',
    blue: '#4db8e8', green: '#2d6e3e', pink: '#f4a7c3', brown: '#8b5e3c',
};

// ── 라벨 이미지 생성 ──
async function generateLabelImage(order) {
    const {
        firstName = 'Name',
        lastName = '',
        size = '4-inch',
        design = '',
        fontColor = 'black',
        fontStyle = 'Nunito',
    } = order;

    const cfg = SIZE_CONFIG[size] || SIZE_CONFIG['4-inch'];
    const W = cfg.w;
    const H = cfg.h;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');

    // 흰 배경
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    const hasTwo = lastName.trim().length > 0;
    const color = COLOR_MAP[fontColor] || fontColor;
    const padding = Math.round(W * 0.04);
    const iconSize = Math.round(H * (hasTwo ? 0.70 : 0.78));

    let textX = padding;

    // 아이콘 이미지 그리기
    if (design && design !== 'name-only') {
        try {
            // Shopify asset URL에서 이미지 로드
            const iconUrl = `https://stickaboo.shop/cdn/shop/files/theme-${design}.png`;
            const img = await loadImage(iconUrl);
            const iconY = (H - iconSize) / 2;
            ctx.drawImage(img, padding, iconY, iconSize, iconSize);
            textX = padding + iconSize + Math.round(H * 0.06);
        } catch (e) {
            console.log('Icon load failed:', e.message);
            textX = padding;
        }
    }

    // 텍스트 영역
    const availW = W - textX - padding;
    const fontFamily = FONT_MAP[fontStyle] || FONT_MAP['Nunito'];

    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    if (!hasTwo) {
        // 한 줄
        let fontSize = Math.round(H * 0.58);
        ctx.font = fontFamily.replace('{size}', fontSize);
        while (ctx.measureText(firstName).width > availW * 0.95 && fontSize > 20) {
            fontSize -= 2;
            ctx.font = fontFamily.replace('{size}', fontSize);
        }
        ctx.fillText(firstName, textX, H / 2);
    } else {
        // 두 줄 — 같은 폰트 사이즈
        let fontSize = Math.round(H * 0.40);
        const longer = firstName.length >= lastName.length ? firstName : lastName;
        ctx.font = fontFamily.replace('{size}', fontSize);
        while (ctx.measureText(longer).width > availW * 0.95 && fontSize > 14) {
            fontSize -= 2;
            ctx.font = fontFamily.replace('{size}', fontSize);
        }
        const lineH = fontSize * 1.15;
        const totalH = lineH * 2;
        const startY = (H - totalH) / 2 + lineH * 0.5;

        ctx.font = fontFamily.replace('{size}', fontSize);
        ctx.fillText(firstName, textX, startY);
        ctx.fillText(lastName, textX, startY + lineH);
    }

    // White 폰트면 아웃라인
    if (color === '#ffffff') {
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 1;
    }

    return canvas.toBuffer('image/png');
}

// ── Google Drive에 업로드 ──
async function uploadToDrive(buffer, fileName) {
    const drive = getDriveClient();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const { Readable } = require('stream');

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const res = await drive.files.create({
        requestBody: {
            name: fileName,
            parents: [folderId],
            mimeType: 'image/png',
        },
        media: {
            mimeType: 'image/png',
            body: stream,
        },
    });

    return res.data.id;
}

// ── 메인 핸들러 ──
module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        // Shopify 주문에서 XL Label 항목만 필터
        const lineItems = body.line_items || [];
        const xlItems = lineItems.filter(item =>
            item.properties && item.properties.some(p => p.name === 'Selected Size' || p.name === 'Size')
        );

        if (xlItems.length === 0) {
            return res.status(200).json({ message: 'No XL label items in this order' });
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

            // 수량만큼 파일 저장
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
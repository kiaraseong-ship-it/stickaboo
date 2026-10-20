document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.querySelector("#save-png-btn");
  if (!saveBtn) return;

  const slug = (t) =>
    t.trim().toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  // 화면에 "실제로 보이는" 이미지 영역 (object-fit 반영, viewport 기준)
  function visibleImageRect(img) {
    const r = img.getBoundingClientRect();
    const k = r.width / (img.offsetWidth || r.width) || 1; // transform scale 보정
    const bw = img.clientWidth, bh = img.clientHeight;
    const nw = img.naturalWidth, nh = img.naturalHeight;
    const cs = getComputedStyle(img);
    const fit = cs.objectFit;

    let w = bw, h = bh, x = 0, y = 0;
    if (fit !== "fill" && nw && nh) {
      let s = 1;
      if (fit === "contain") s = Math.min(bw / nw, bh / nh);
      else if (fit === "cover") s = Math.max(bw / nw, bh / nh);
      else if (fit === "scale-down") s = Math.min(1, bw / nw, bh / nh);
      w = nw * s; h = nh * s;
      const [ox = "50%", oy = "50%"] = cs.objectPosition.split(" ");
      const pos = (v, free) => (v.endsWith("%") ? (free * parseFloat(v)) / 100 : parseFloat(v) || 0);
      x = pos(ox, bw - w); y = pos(oy, bh - h);
    }
    return {
      left: r.left + (img.clientLeft + x) * k,
      top: r.top + (img.clientTop + y) * k,
      w: w * k,
      h: h * k,
      k,
    };
  }

  // 텍스트 노드에서 앞뒤 공백 제외한 실제 글자 영역
  function textBox(node) {
    const t = node.textContent || "";
    const s = t.search(/\S/);
    if (s < 0) return null;
    const e = t.length - t.match(/\s*$/)[0].length;
    const range = document.createRange();
    range.setStart(node, s);
    range.setEnd(node, e);
    return { text: t.slice(s, e), rect: range.getBoundingClientRect() };
  }

  async function exportPNG() {
    const img = document.querySelector(".print-capture .preview-image");
    if (!img) return;

    if (document.fonts?.ready) await document.fonts.ready;
    if (!img.complete) await new Promise((r) => (img.onload = r));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const vr = visibleImageRect(img);
    const S = img.naturalWidth / vr.w; // 화면 px → 원본 px

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    document.querySelectorAll(".print-capture .text-overlay > div").forEach((line) => {
      const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const box = textBox(node);
        if (!box || !box.rect.width) continue;

        const cs = getComputedStyle(node.parentElement);
        const fontPx = parseFloat(cs.fontSize) * vr.k * S;

        ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${fontPx}px ${cs.fontFamily}`;
        ctx.fillStyle = cs.color;
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        if ("letterSpacing" in ctx) {
          ctx.letterSpacing = cs.letterSpacing === "normal"
            ? "0px"
            : `${parseFloat(cs.letterSpacing) * vr.k * S}px`;
        }

        const m = ctx.measureText(box.text);
        const asc = m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent;
        const desc = m.fontBoundingBoxDescent ?? m.actualBoundingBoxDescent;

        const x = (box.rect.left - vr.left) * S;
        const top = (box.rect.top - vr.top) * S;
        const y = top + (box.rect.height * S - (asc + desc)) / 2 + asc;

        ctx.fillText(box.text, x, y);
      }
    });

    const first = document.querySelector("#user-text")?.value || "firstname";
    const last = document.querySelector("#user-text-last-name")?.value || "";
    const size = document.querySelector(".size-btn.active")?.dataset.size || "size";
    const theme = document.querySelector(".theme-btn.active")?.dataset.theme || "theme";
    const baseName = `${slug(first)}${last ? "-" + slug(last) : ""}-${slug(size)}-${slug(theme)}`;

    canvas.toBlob((blob) => {
      if (!blob) return alert("저장 실패 (이미지 CORS) — 콘솔 확인");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseName}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }

  saveBtn.textContent = "Save PNG (원본 해상도)";
  saveBtn.addEventListener("click", () => exportPNG().catch((e) => {
    console.error("[export]", e);
    alert("PNG 저장 실패 — 콘솔 확인");
  }));
});
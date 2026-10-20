document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.querySelector("#save-png-btn");
  if (!saveBtn) return;

  const CAPTURE_SCALE = 4;

  // html2canvas 텍스트 baseline 보정 (필요 없으면 0)
  const TEXT_Y_FIX = -1; // px

  const slug = (txt) =>
    txt
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  function waitForImages(root) {
    const imgs = [...root.querySelectorAll("img")];
    return Promise.all(
      imgs.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      })
    );
  }

  // ✅ 실제 화면 레이아웃을 px로 스냅샷
  function snapshotLayout(capture) {
    const wrapper = capture.querySelector(".preview-wrapper");
    const container = capture.querySelector("#overlay-container");
    const img = capture.querySelector(".preview-image");
    if (!wrapper || !container) return null;

    const cr = container.getBoundingClientRect();
    // CSS transform(scale)이 걸려 있어도 원래 px로 환산
    const k = cr.width / (container.offsetWidth || cr.width) || 1;

    const items = [...container.querySelectorAll(".overlay-item")].map((el) => {
      const r = el.getBoundingClientRect();
      return {
        left: (r.left - cr.left) / k - container.clientLeft,
        top: (r.top - cr.top) / k - container.clientTop,
        width: r.width / k,
      };
    });

    return {
      capture: { w: capture.offsetWidth, h: capture.offsetHeight },
      wrapper: { w: wrapper.offsetWidth, h: wrapper.offsetHeight },
      container: { w: container.offsetWidth, h: container.offsetHeight },
      img: img ? { w: img.offsetWidth, h: img.offsetHeight } : null,
      items,
    };
  }

  // ✅ 복제본에 px 고정 적용
  function applyLayout(clonedCapture, snap) {
    const px = (n) => `${n}px`;

    clonedCapture.style.width = px(snap.capture.w);
    clonedCapture.style.height = px(snap.capture.h);

    const wrapper = clonedCapture.querySelector(".preview-wrapper");
    if (wrapper) {
      wrapper.style.width = px(snap.wrapper.w);
      wrapper.style.height = px(snap.wrapper.h);
    }

    const img = clonedCapture.querySelector(".preview-image");
    if (img && snap.img) {
      img.style.width = px(snap.img.w);
      img.style.height = px(snap.img.h);
      img.style.maxWidth = "none";
    }

    const container = clonedCapture.querySelector("#overlay-container");
    if (container) {
      container.style.width = px(snap.container.w);
      container.style.height = px(snap.container.h);
    }

    const items = clonedCapture.querySelectorAll("#overlay-container .overlay-item");
    items.forEach((el, i) => {
      const s = snap.items[i];
      if (!s) return;
      el.style.position = "absolute";
      el.style.left = px(s.left);
      el.style.top = px(s.top);   // translateY(-50%) 이미 반영된 값
      el.style.width = px(s.width);
      el.style.margin = "0";
      el.style.transform = "none";
    });

    if (TEXT_Y_FIX) {
      clonedCapture.querySelectorAll(".text-overlay > div").forEach((line) => {
        line.style.position = "relative";
        line.style.top = px(TEXT_Y_FIX);
      });
    }
  }

  saveBtn.textContent = "Save PNG (4x size)";

  saveBtn.addEventListener("click", async () => {
    const capture = document.querySelector(".print-capture");
    if (!capture) return;

    const first = document.querySelector("#user-text")?.value || "firstname";
    const last = document.querySelector("#user-text-last-name")?.value || "";
    const size = document.querySelector(".size-btn.active")?.dataset.size || "size";
    const theme = document.querySelector(".theme-btn.active")?.dataset.theme || "theme";

    const baseName =
      `${slug(first)}${last ? "-" + slug(last) : ""}-${slug(size)}-${slug(theme)}`;

    if (document.fonts?.ready) await document.fonts.ready;
    await waitForImages(capture);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    // 폰트/이미지 로드 끝난 "최종" 화면 기준으로 측정
    const snap = snapshotLayout(capture);

    const canvas = await html2canvas(capture, {
      backgroundColor: null,
      scale: CAPTURE_SCALE,
      useCORS: true,
      width: capture.offsetWidth,
      height: capture.offsetHeight,
      onclone: (clonedDoc) => {
        const clonedCapture = clonedDoc.querySelector(".print-capture");
        if (clonedCapture && snap) applyLayout(clonedCapture, snap);
      },
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${baseName}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
});
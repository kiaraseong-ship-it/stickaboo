document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.querySelector("#save-png-btn");
  if (!saveBtn) return;

  const TEXT_Y_FIX = 0; // 저장본 글자가 아래로 밀리면 -1

  const slug = (t) =>
    t.trim().toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const waitForImages = (root) =>
    Promise.all([...root.querySelectorAll("img")].map((img) =>
      img.complete ? null : new Promise((r) => {
        img.addEventListener("load", r, { once: true });
        img.addEventListener("error", r, { once: true });
      })
    ));

  saveBtn.textContent = "Save PNG (300dpi)";

  saveBtn.addEventListener("click", async () => {
    const capture = document.querySelector(".print-capture");
    const img = capture?.querySelector(".preview-image");
    if (!capture || !img) return;

    const first = document.querySelector("#user-text")?.value || "firstname";
    const last = document.querySelector("#user-text-last-name")?.value || "";
    const size = document.querySelector(".size-btn.active")?.dataset.size || "size";
    const theme = document.querySelector(".theme-btn.active")?.dataset.theme || "theme";
    const baseName = `${slug(first)}${last ? "-" + slug(last) : ""}-${slug(size)}-${slug(theme)}`;

    if (document.fonts?.ready) await document.fonts.ready;
    await waitForImages(capture);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    // ✅ 원본 PNG 픽셀 = 출력 픽셀 (5.25"×7.75" @300dpi → 1575×2325)
    const scale = img.naturalWidth / img.clientWidth;

    const canvas = await html2canvas(capture, {
      backgroundColor: null,
      scale,
      useCORS: true,
      onclone: (doc) => {
        if (!TEXT_Y_FIX) return;
        doc.querySelectorAll(".print-capture .text-overlay > div").forEach((l) => {
          l.style.position = "relative";
          l.style.top = `${TEXT_Y_FIX}px`;
        });
      },
    });

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${baseName}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
});
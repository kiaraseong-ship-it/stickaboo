document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.querySelector("#save-png-btn");
  if (!saveBtn) return;

  const CAPTURE_SCALE = 4;

  // 일단 보정 끄고 테스트
  const TEXT_Y_FIX = 0;

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

  saveBtn.textContent = "Save PNG (4x size)";

  saveBtn.addEventListener("click", async () => {
    const capture = document.querySelector(".print-capture");
    if (!capture) return;

    const first =
      document.querySelector("#user-text")?.value || "firstname";

    const last =
      document.querySelector("#user-text-last-name")?.value || "";

    const size =
      document.querySelector(".size-btn.active")?.dataset.size || "size";

    const theme =
      document.querySelector(".theme-btn.active")?.dataset.theme || "theme";

    const baseName =
      `${slug(first)}${last ? "-" + slug(last) : ""}-${slug(size)}-${slug(theme)}`;

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    await waitForImages(capture);

    await new Promise((resolve) =>
      requestAnimationFrame(() =>
        requestAnimationFrame(resolve)
      )
    );

    const rect = capture.getBoundingClientRect();

    const canvas = await html2canvas(capture, {
      backgroundColor: null,
      scale: CAPTURE_SCALE,
      useCORS: true,

      width: Math.round(rect.width),
      height: Math.round(rect.height),
      windowWidth: Math.round(rect.width),
      windowHeight: Math.round(rect.height),

      onclone: (clonedDoc) => {
        const clonedCapture = clonedDoc.querySelector(".print-capture");
        if (!clonedCapture) return;

        clonedCapture.style.transform = "none";
        clonedCapture.style.zoom = "1";

        clonedCapture
          .querySelectorAll(".text-overlay > div")
          .forEach((line) => {
            line.style.position = "relative";
            line.style.top = `${TEXT_Y_FIX}px`;
          });
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
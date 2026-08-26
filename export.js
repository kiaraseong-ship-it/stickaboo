document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.querySelector("#save-png-btn");
  if (!saveBtn) return;

  const CAPTURE_SCALE = 4;

  // ✅ html2canvas 텍스트 baseline 보정
  // PNG에서 글자가 아래로 밀리는 만큼 위로 올림
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

    // ✅ 폰트 완전히 로드
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    // ✅ 이미지 완전히 로드
    await waitForImages(capture);

    // ✅ 렌더링 반영 완료
    await new Promise((resolve) =>
      requestAnimationFrame(() =>
        requestAnimationFrame(resolve)
      )
    );

    const canvas = await html2canvas(capture, {
      backgroundColor: null,
      scale: CAPTURE_SCALE,
      useCORS: true,

      // ✅ 실제 페이지는 안 건드리고
      // html2canvas가 캡처하는 복제본에서만 글자 위로 보정
      onclone: (clonedDoc) => {
        const clonedCapture =
          clonedDoc.querySelector(".print-capture");

        if (!clonedCapture) return;

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
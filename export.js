document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.querySelector("#save-png-btn");
  if (!saveBtn) return;

  const CAPTURE_SCALE = 4; // ✅ "크기(해상도) 4배"
  const DOWNLOAD_COUNT = 1; // ✅ 파일은 1장만

  // ✅ html2canvas 텍스트 baseline 버그 보정 (캡처본만 ~1px 아래로 찍힘)
  //    화면은 안 건드리고 캡처용 복제 DOM에서만 올림
  const TEXT_Y_FIX = "-0.9px";

  const slug = (txt) =>
    txt
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  saveBtn.textContent = "Save PNG (4x size)"; // 버튼 텍스트도 오해 없게

  saveBtn.addEventListener("click", async () => {
    const capture = document.querySelector(".print-capture");
    if (!capture) return;

    const first = document.querySelector("#user-text")?.value || "firstname";
    const last = document.querySelector("#user-text-last-name")?.value || "";
    const size =
      document.querySelector(".size-btn.active")?.dataset.size || "size";
    const theme =
      document.querySelector(".theme-btn.active")?.dataset.theme || "theme";

    const baseName =
      `${slug(first)}${last ? "-" + slug(last) : ""}-${slug(size)}-${slug(theme)}`;

    // ✅ 웹폰트 로딩 대기 (fallback 폰트로 찍히는 거 방지)
    if (document.fonts?.ready) await document.fonts.ready;

    for (let i = 1; i <= DOWNLOAD_COUNT; i++) {
      const canvas = await html2canvas(capture, {
        backgroundColor: null,
        scale: CAPTURE_SCALE,
        useCORS: true,
        onclone: (doc) => {
          doc.querySelectorAll(".text-overlay").forEach((el) => {
            el.style.position = "relative";
            el.style.top = TEXT_Y_FIX;
          });
        },
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${baseName}.png`;
      link.click();
    }
  });
});
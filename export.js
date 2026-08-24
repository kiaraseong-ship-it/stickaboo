document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.querySelector("#save-png-btn");
  if (!saveBtn) return;

  const CAPTURE_SCALE = 4; // ✅ "크기(해상도) 4배"
  const DOWNLOAD_COUNT = 1; // ✅ 파일은 1장만

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

    for (let i = 1; i <= DOWNLOAD_COUNT; i++) {
      const canvas = await html2canvas(capture, {
        backgroundColor: null,
        scale: CAPTURE_SCALE,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${baseName}.png`;
      link.click();
    }
  });
});

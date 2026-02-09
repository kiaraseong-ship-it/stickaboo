document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.querySelector("#save-png-btn");
  if (!saveBtn) return;

  const DOWNLOAD_COUNT = 4; // ✅ x4
  const CAPTURE_SCALE = 2;  // ✅ 해상도(2배 선명). x4랑 무관

  saveBtn.addEventListener("click", async () => {
    const capture = document.querySelector(".print-capture");
    if (!capture) return;

    const first = document.querySelector("#user-text")?.value || "firstname";
    const last = document.querySelector("#user-text-last-name")?.value || "";
    const size = document.querySelector(".size-btn.active")?.dataset.size || "size";
    const theme = document.querySelector(".theme-btn.active")?.dataset.theme || "theme";

    const slug = (txt) =>
      txt
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

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
      link.download = `${baseName}-${i}.png`; // ✅ test 절대 없음
      link.click();
    }
  });
});

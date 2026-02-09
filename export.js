document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.querySelector("#save-png-btn");
  if (!saveBtn) return;

  saveBtn.addEventListener("click", async () => {
    const capture = document.querySelector(".print-capture");
    if (!capture) return;

    // 🔹 customizer.js에서 관리 중인 input 값 직접 읽기
    const first = document.querySelector("#user-text")?.value || "firstname";
    const last = document.querySelector("#user-text-last-name")?.value || "";
    const size = document.querySelector(".size-btn.active")?.dataset.size || "size";
    const theme = document.querySelector(".theme-btn.active")?.dataset.theme || "theme";

    const slug = txt =>
      txt
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    const baseName =
      `${slug(first)}${last ? "-" + slug(last) : ""}-${slug(size)}-${slug(theme)}`;

    // 🔹 x4 저장
    for (let i = 1; i <= 4; i++) {
      const canvas = await html2canvas(capture, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${baseName}-${i}.png`; // ⭐ 핵심
      link.click();
    }
  });
});

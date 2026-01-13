document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("save-png-btn");

  saveBtn.addEventListener("click", async () => {
    const target = document.querySelector(".preview-wrapper");
    if (!target) {
      alert("print-capture not found");
      return;
    }

    // 이미지 로드 대기
    const img = target.querySelector(".preview-image");
    if (img && !img.complete) {
      await new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }

    const canvas = await html2canvas(target, {
      scale: 4,
      backgroundColor: null,
      useCORS: true,
    });

    const link = document.createElement("a");
    link.download = "test.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});

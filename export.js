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
    const canvas = await html2canvas(capture, {
      backgroundColor: null,
      scale: CAPTURE_SCALE,
      useCORS: true,

      // ✅ 화면 크기 고정 (캡처 시 재배치 방지)
      width: capture.offsetWidth,
      height: capture.offsetHeight,
      windowWidth: document.documentElement.offsetWidth,
      windowHeight: document.documentElement.offsetHeight,
      scrollX: 0,
      scrollY: 0,

      // ✅ 복제본에만 적용 (화면에는 영향 없음)
      onclone: (doc) => {
        const liveLines = capture.querySelectorAll(".text-overlay div");
        const cloneLines = doc.querySelectorAll(".text-overlay div");

        cloneLines.forEach((cl, i) => {
          const live = liveLines[i];
          if (!live) return;

          // 브라우저가 실제로 쓴 값을 정수 px로 고정해서 복제본에 심음
          const cs = getComputedStyle(live);
          cl.style.fontSize = Math.round(parseFloat(cs.fontSize)) + "px";
          cl.style.lineHeight = Math.round(parseFloat(cs.lineHeight)) + "px";
        });

        // ✅ 밀림 미세보정 (px). 아래로 밀리면 음수, 위로 밀리면 양수
        const OFFSET_Y = 0;
        if (OFFSET_Y !== 0) {
          doc.querySelectorAll(".text-overlay").forEach(el => {
            el.style.marginTop = OFFSET_Y + "px";
          });
        }
      },
    });
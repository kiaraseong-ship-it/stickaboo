document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.querySelector("#save-png-btn");
  if (!saveBtn) return;

  const CAPTURE_SCALE = 4;
  const DOWNLOAD_COUNT = 1;

  const slug = (txt) =>
    txt
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  // ✅ 캡처 전에 이미지 로딩 완료 대기
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

    // =========================================================
    // ✅ 1. 웹폰트 / 이미지 로딩 끝날 때까지 기다림
    // =========================================================
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    await waitForImages(capture);

    // 브라우저 렌더 한 프레임 완전히 반영
    await new Promise((resolve) =>
      requestAnimationFrame(() =>
        requestAnimationFrame(resolve)
      )
    );

    // =========================================================
    // ✅ 2. 현재 화면에서 보이는 overlay의 실제 최종 좌표 저장
    //
    // 기존:
    // top: %
    // transform: translateY(-50%)
    //
    // 브라우저가 최종 계산한 실제 위치를 px로 저장한 뒤
    // html2canvas clone에서는 transform을 제거하고
    // 그 위치를 그대로 사용함.
    // =========================================================
    const captureRect = capture.getBoundingClientRect();

    const overlaySnapshot =
      [...capture.querySelectorAll(".overlay-item")].map((el) => {
        const rect = el.getBoundingClientRect();

        return {
          top: rect.top - captureRect.top,
          left: rect.left - captureRect.left,
          width: rect.width,
          height: rect.height,
        };
      });

    // =========================================================
    // ✅ 3. PNG 캡처
    // =========================================================
    for (let i = 1; i <= DOWNLOAD_COUNT; i++) {
      const canvas = await html2canvas(capture, {
        backgroundColor: null,
        scale: CAPTURE_SCALE,
        useCORS: true,

        // =====================================================
        // ✅ html2canvas가 만든 복제본에서만 위치 고정
        //
        // 실제 화면은 전혀 건드리지 않음.
        // =====================================================
        onclone: (clonedDoc) => {
          const clonedCapture =
            clonedDoc.querySelector(".print-capture");

          if (!clonedCapture) return;

          const clonedItems =
            clonedCapture.querySelectorAll(".overlay-item");

          overlaySnapshot.forEach((snap, index) => {
            const el = clonedItems[index];
            if (!el) return;

            // 실제 브라우저에서 계산된 최종 좌표 사용
            el.style.top = `${snap.top}px`;
            el.style.left = `${snap.left}px`;

            // 기존 translateY(-50%) 제거
            el.style.transform = "none";

            // 크기도 현재 화면 렌더 값으로 고정
            el.style.width = `${snap.width}px`;

            // 브라우저가 임의로 margin 등 추가하지 않도록
            el.style.margin = "0";
          });
        },
      });

      // =========================================================
      // ✅ 4. 다운로드
      // =========================================================
      const link = document.createElement("a");

      link.href = canvas.toDataURL("image/png");
      link.download = `${baseName}.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  });
});
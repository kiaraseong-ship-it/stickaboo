function initCustomizer(root) {
  if (!root) return;

  // ✅ Just Character면 텍스트 섹션 제거
  const isCharacter = root.dataset.isCharacter === "true";
  if (isCharacter) {
    const textSection = root.querySelector("#text-section");
    if (textSection) textSection.remove();

    const textInputs = root.querySelectorAll(
      "#user-text, #user-text-last-name"
    );
    textInputs.forEach(input => input.remove());
  }

  // ----- data from Liquid -----
  const placeholderUrl = root.dataset.placeholder || "";
  const variantId = root.dataset.variantId
    ? Number(root.dataset.variantId)
    : null;

  // ----- cache DOM (scoped to section) -----
  const previewImage = root.querySelector(".preview-image");
  const overlayContainer = root.querySelector("#overlay-container");
  const firstNameInput = root.querySelector("#user-text");
  const lastNameInput = root.querySelector("#user-text-last-name");

  const qtyMinus = root.querySelector("#qty-minus");
  const qtyPlus = root.querySelector("#qty-plus");
  const qtyValue = root.querySelector("#qty-value");
  const addBtn = root.querySelector(".add-btn");
  const form = root.querySelector("#custom-product-form");

  const hiddenFirst = root.querySelector("#hidden-first-name");
  const hiddenLast = root.querySelector("#hidden-last-name");
  const hiddenSize = root.querySelector("#hidden-size");
  const hiddenTheme = root.querySelector("#hidden-theme");
  const hiddenFontColor = root.querySelector("#hidden-font-color");

  // Font color state
  let selectedFontColor = "#000000"; // default black
  if (hiddenFontColor) hiddenFontColor.value = selectedFontColor;

  // Font color code → name map (for cart display)
  const fontColorMap = {
    "#000000": "Black",
    "#FFFFFF": "White",
    "#1F3A5F": "Navy",
    "#43BBEC": "Blue",
    "#2F6B4F": "Green",
    "#F5A3B7": "Pink",
    "#8B5E3C": "Brown",
  };

  // ----- local state (per section instance) -----
  let selectedSize = isCharacter ? "medium" : "small";
  let selectedTheme = "undertheocean";
  let quantity = 1;
  let currentOverlays = [];

  // ✅ 여기에서 isCharacter 적용
  function updatePreview() {
    if (!previewImage || !placeholderUrl) return;
    if (selectedSize && selectedTheme) {
      const suffix = isCharacter ? "-co" : "";
      const fileName = `${selectedSize}-${selectedTheme}${suffix}.png`;

      // ✅ 캐시 방지 파라미터 추가한 버전
      const newSrc =
        placeholderUrl.replace(/[^/]+$/, fileName) + `?v=${Date.now()}`;

      previewImage.src = newSrc;
    }
  }

  // ========== Overlay Generators (your existing logic, unchanged except scope) ==========
  function generateSmallOverlays() {
    const overlays = [];
    let idCounter = 1;

    const isMobile = window.innerWidth <= 600;

    const topRows = 6,
      topCols = 4;
    const bottomRows = 4,
      bottomCols = 3;

    let topHeight, bottomHeight, cellWidthTop, cellWidthBottom;
    let spacingFactorTop, spacingFactorBottom;
    let topOffsetTop, topOffsetBottom;
    let leftOffsetTop, leftOffsetBottom;

    if (isMobile) {
      topHeight = 54.5;
      bottomHeight = 74.5;
      cellWidthTop = 94 / topCols;
      cellWidthBottom = 95 / bottomCols;
      spacingFactorTop = 0.84;
      spacingFactorBottom = 0.42;
      topOffsetTop = 2.3;
      topOffsetBottom = 0.67;
      leftOffsetTop = 0.9;
      leftOffsetBottom = 0.72;
    } else {
      topHeight = 60;
      bottomHeight = 34;
      cellWidthTop = (96) / topCols; // 0.9 = 간격 10% 줄이기
      cellWidthBottom = (96) / bottomCols;
      spacingFactorTop = 0.81;
      spacingFactorBottom = 0.95;
      topOffsetTop = 2.18;
      topOffsetBottom = 1.2;
      leftOffsetTop = 0.85;
      leftOffsetBottom = 0.72;
    }

    const cellHeightTop = topHeight / topRows;
    for (let row = 0; row < topRows; row++) {
      for (let col = 0; col < topCols; col++) {
        overlays.push({
          id: `small-text${idCounter++}`,
          top: `calc(${(row * spacingFactorTop + topOffsetTop) * cellHeightTop
            }%)`,
          left: `${(col + leftOffsetTop) * cellWidthTop}%`,
          width: isMobile ? "70px" : "80px",
          textAlign: "left",
          area: "top",
        });
      }
    }

    const cellHeightBottom = bottomHeight / bottomRows;
    for (let row = 0; row < bottomRows; row++) {
      for (let col = 0; col < bottomCols; col++) {
        overlays.push({
          id: `small-text${idCounter++}`,
          top: `${topHeight +
            (row * spacingFactorBottom + topOffsetBottom) * cellHeightBottom
            }%`,
          left: `${(col + leftOffsetBottom) * cellWidthBottom}%`,
          width: isMobile ? "85px" : "100px",
          textAlign: "left",
          area: "bottom",
        });
      }
    }
    return overlays;
  }

  function generateMediumOverlays() {
    const overlays = [];
    let idCounter = 1;

    const topRows = 8,
      topCols = 3;
    const isMobile = window.innerWidth <= 600;

    let topHeight, cellWidthTop, spacingFactor, topOffset, leftOffset, fontSize;

    if (isMobile) {
      topHeight = 109;
      cellWidthTop = 95 / topCols;
      spacingFactor = 0.68;
      topOffset = 1.8;
      leftOffset = 0.8;
    } else {
      topHeight = 93;
      cellWidthTop = (95) / topCols;
      spacingFactor = 0.84;
      topOffset = 2.2;
      leftOffset = 0.78;
    }

    const cellHeightTop = topHeight / topRows;

    for (let row = 0; row < topRows; row++) {
      for (let col = 0; col < topCols; col++) {
        const adjustedRow = row * spacingFactor;
        overlays.push({
          id: `medium-text${idCounter++}`,
          top: `calc(${(adjustedRow + topOffset) * cellHeightTop}%)`,
          left: `${(col + leftOffset) * cellWidthTop}%`,
          width: isMobile ? "80px" : "100px",
          textAlign: "left",
        });
      }
    }
    return overlays;
  }

  function generateLargeOverlays() {
    const overlays = [];
    let idCounter = 1;

    const isMobile = window.innerWidth <= 600;

    const topRows = 3,
      topCols = 3;
    const bottomRows = 2,
      bottomCols = 2;

    let topHeight, bottomHeight;
    let cellWidthTop, cellWidthBottom;
    let spacingFactorTop, spacingFactorBottom;
    let topOffsetTop, topOffsetBottom;
    let leftOffsetTop, leftOffsetBottom;
    let widthTop, widthBottom;
    let fontSizeTop, fontSizeBottom;

    if (isMobile) {
      topHeight = 32;
      bottomHeight = 86;
      cellWidthTop = 94 / topCols;
      cellWidthBottom = 92.5 / bottomCols;
      spacingFactorTop = 1.75;
      spacingFactorBottom = 0.45;
      topOffsetTop = 1.5;
      topOffsetBottom = 0.79;
      leftOffsetTop = 0.58;
      leftOffsetBottom = 0.86;
      widthTop = "100px";
      widthBottom = "120px";
    } else {
      topHeight = 24;
      bottomHeight = 71;
      cellWidthTop = (115 * 0.7) / topCols;
      cellWidthBottom = (114 * 0.7) / bottomCols;
      spacingFactorTop = 2.33;
      spacingFactorBottom = 0.53;
      topOffsetTop = 2.0;
      topOffsetBottom = 1.2;
      leftOffsetTop = 0.78;
      leftOffsetBottom = 0.9;
      widthTop = "120px";
      widthBottom = "140px";
    }

    const cellHeightTop = topHeight / topRows;
    for (let row = 0; row < topRows; row++) {
      for (let col = 0; col < topCols; col++) {
        overlays.push({
          id: `large-text${idCounter++}`,
          top: `${(row * spacingFactorTop + topOffsetTop) * cellHeightTop}%`,
          left: `${(col + leftOffsetTop) * cellWidthTop}%`,
          width: widthTop,
          textAlign: "center",
          area: "top",
        });
      }
    }

    const cellHeightBottom = bottomHeight / bottomRows;
    for (let row = 0; row < bottomRows; row++) {
      for (let col = 0; col < bottomCols; col++) {
        overlays.push({
          id: `large-text${idCounter++}`,
          top: `${topHeight +
            (row * spacingFactorBottom + topOffsetBottom) * cellHeightBottom
            }%`,
          left: `${(col + leftOffsetBottom) * cellWidthBottom}%`,
          width: widthBottom,
          textAlign: "left",
          area: "bottom",
        });
      }
    }
    return overlays;
  }

  function generateSmlMixOverlays() {
    const overlays = [];
    let idCounter = 1;

    const isMobile = window.innerWidth <= 600;

    // ------------------ Large Top (1×3) ------------------
    const largeTopRows = 1,
      largeTopCols = 3;
    let largeTopHeight,
      cellWidthLargeTop,
      leftOffsetLargeTop,
      fontSizeLargeTop,
      widthLargeTop,
      topOffsetLargeTop;

    if (isMobile) {
      largeTopHeight = 13.5;
      cellWidthLargeTop = 94 / largeTopCols;
      leftOffsetLargeTop = 0.58;
      fontSizeLargeTop = "22px";
      widthLargeTop = "100px";
      topOffsetLargeTop = 1.2;
    } else {
      largeTopHeight = 16.5;
      cellWidthLargeTop = 95 / largeTopCols;
      leftOffsetLargeTop = 0.57;
      fontSizeLargeTop = "32px";
      widthLargeTop = "120px";
      topOffsetLargeTop = 1.0;
    }

    for (let row = 0; row < largeTopRows; row++) {
      for (let col = 0; col < largeTopCols; col++) {
        overlays.push({
          id: `smlmix-large-top${idCounter++}`,
          top: `${(row + topOffsetLargeTop) * largeTopHeight}%`,
          left: `${(col + leftOffsetLargeTop) * cellWidthLargeTop}%`,
          width: widthLargeTop,
          fontSize: fontSizeLargeTop,
          textAlign: "center",
          area: "large-top",
        });
      }
    }

    // Large Bottom (1x2)
    const largeBottomRows = 1,
      largeBottomCols = 2;
    let largeBottomHeight,
      cellWidthLargeBottom,
      leftOffsetLargeBottom,
      fontSizeLargeBottom,
      widthLargeBottom,
      topOffsetLargeBottom;
    if (isMobile) {
      largeBottomHeight = 26.5;
      cellWidthLargeBottom = 95 / largeBottomCols;
      leftOffsetLargeBottom = 0.82;
      widthLargeBottom = "120px";
      topOffsetLargeBottom = 1.0;
    } else {
      largeBottomHeight = 28;
      cellWidthLargeBottom = 96 / largeBottomCols;
      leftOffsetLargeBottom = 0.75;
      widthLargeBottom = "140px";
      topOffsetLargeBottom = 1.0;
    }
    for (let row = 0; row < largeBottomRows; row++) {
      for (let col = 0; col < largeBottomCols; col++) {
        overlays.push({
          id: `smlmix-large-bottom${idCounter++}`,
          top: `${(row + topOffsetLargeBottom) * largeBottomHeight}%`,
          left: `${(col + leftOffsetLargeBottom) * cellWidthLargeBottom}%`,
          width: widthLargeBottom,
          textAlign: "left",
          area: "large-bottom",
        });
      }
    }

    // Medium (3x3)
    const mediumRows = 3,
      mediumCols = 3;
    let mediumHeight,
      cellWidthMedium,
      spacingFactorMedium,
      topOffsetMedium,
      leftOffsetMedium,
      fontSizeMedium,
      widthMedium;
    if (isMobile) {
      mediumHeight = 44.2;
      cellWidthMedium = 95.5 / mediumCols;
      spacingFactorMedium = 0.61;
      topOffsetMedium = 1.3;
      leftOffsetMedium = 0.82;
      fontSizeMedium = "16px";
      widthMedium = "85px";
    } else {
      mediumHeight = 41;
      cellWidthMedium = 96 / mediumCols;
      spacingFactorMedium = 0.72;
      topOffsetMedium = 1.5;
      leftOffsetMedium = 0.76;
      fontSizeMedium = "22px";
      widthMedium = "100px";
    }
    const cellHeightMedium = mediumHeight / mediumRows;
    for (let row = 0; row < mediumRows; row++) {
      for (let col = 0; col < mediumCols; col++) {
        overlays.push({
          id: `smlmix-medium${idCounter++}`,
          top: `${20 +
            (row * spacingFactorMedium + topOffsetMedium) * cellHeightMedium
            }%`,
          left: `${(col + leftOffsetMedium) * cellWidthMedium}%`,
          width: widthMedium,
          fontSize: fontSizeMedium,
          textAlign: "left",
          area: "medium",
        });
      }
    }

    // Small (4x4)
    const smallRows = 4,
      smallCols = 4;
    let smallHeight,
      cellWidthSmall,
      spacingFactorSmall,
      topOffsetSmall,
      leftOffsetSmall,
      fontSizeSmall,
      widthSmall;
    if (isMobile) {
      smallHeight = 57;
      cellWidthSmall = 94 / smallCols;
      spacingFactorSmall = 0.52;
      topOffsetSmall = 4.6;
      leftOffsetSmall = 0.9;
      fontSizeSmall = "14px";
      widthSmall = "70px";
    } else {
      smallHeight = 54.9;
      cellWidthSmall = 96 / smallCols;
      spacingFactorSmall = 0.58;
      topOffsetSmall = 5.0;
      leftOffsetSmall = 0.86;
      fontSizeSmall = "18px";
      widthSmall = "80px";
    }
    const cellHeightSmall = smallHeight / smallRows;
    for (let row = 0; row < smallRows; row++) {
      for (let col = 0; col < smallCols; col++) {
        overlays.push({
          id: `smlmix-small${idCounter++}`,
          top: `${(row * spacingFactorSmall + topOffsetSmall) * cellHeightSmall + 2.0
            }%`,
          left: `${(col + leftOffsetSmall) * cellWidthSmall}%`,
          width: widthSmall,
          fontSize: fontSizeSmall,
          textAlign: "left",
          area: "small",
        });
      }
    }
    return overlays;
  }

  function generateMlMixOverlays() {
    const overlays = [];
    let idCounter = 1;

    const isMobile = window.innerWidth <= 600;

    // Large Top (2x3)
    const largeTopRows = 2,
      largeTopCols = 3;
    let largeTopHeight,
      cellWidthLargeTop,
      spacingFactorTop,
      topOffsetTop,
      leftOffsetTop,
      fontSizeLargeTop,
      widthLargeTop;
    if (isMobile) {
      largeTopHeight = 28;
      cellWidthLargeTop = 96 / largeTopCols;
      spacingFactorTop = 1.38;
      topOffsetTop = 1.2;
      leftOffsetTop = 0.56;
      fontSizeLargeTop = "22px";
      widthLargeTop = "100px";
    } else {
      largeTopHeight = 22;
      cellWidthLargeTop = 82 / largeTopCols;
      spacingFactorTop = 1.65;
      topOffsetTop = 1.5;
      leftOffsetTop = 0.75;
      fontSizeLargeTop = "32px";
      widthLargeTop = "120px";
    }
    const cellHeightLargeTop = largeTopHeight / largeTopRows;
    for (let row = 0; row < largeTopRows; row++) {
      for (let col = 0; col < largeTopCols; col++) {
        overlays.push({
          id: `mlmix-large-top${idCounter++}`,
          top: `${(row * spacingFactorTop + topOffsetTop) * cellHeightLargeTop
            }%`,
          left: `${(col + leftOffsetTop) * cellWidthLargeTop}%`,
          width: widthLargeTop,
          fontSize: fontSizeLargeTop,
          textAlign: "center",
          area: "large-top",
        });
      }
    }

    // Large Bottom (1x2)
    const largeBottomRows = 1,
      largeBottomCols = 2;
    let largeBottomHeight,
      cellWidthLargeBottom,
      spacingFactorBottom,
      topOffsetBottom,
      leftOffsetBottom,
      fontSizeLargeBottom,
      widthLargeBottom;
    if (isMobile) {
      largeBottomHeight = 21;
      cellWidthLargeBottom = 98 / largeBottomCols;
      spacingFactorBottom = 0.5;
      topOffsetBottom = 1.0;
      leftOffsetBottom = 0.78;
      fontSizeLargeBottom = "26px";
      widthLargeBottom = "120px";
    } else {
      largeBottomHeight = 22.5;
      cellWidthLargeBottom = 96 / largeBottomCols;
      spacingFactorBottom = 0.53;
      topOffsetBottom = 1.25;
      leftOffsetBottom = 0.76;
      fontSizeLargeBottom = "40px";
      widthLargeBottom = "140px";
    }
    const cellHeightLargeBottom = largeBottomHeight / largeBottomRows;
    for (let row = 0; row < largeBottomRows; row++) {
      for (let col = 0; col < largeBottomCols; col++) {
        overlays.push({
          id: `mlmix-large-bottom${idCounter++}`,
          top: `${(row * spacingFactorBottom + topOffsetBottom) *
            cellHeightLargeBottom +
            largeTopHeight
            }%`,
          left: `${(col + leftOffsetBottom) * cellWidthLargeBottom}%`,
          width: widthLargeBottom,
          fontSize: fontSizeLargeBottom,
          textAlign: "left",
          area: "large-bottom",
        });
      }
    }

    // Medium (4x3)
    const mediumRows = 4,
      mediumCols = 3;
    let mediumHeight,
      cellWidthMedium,
      spacingFactorMedium,
      topOffsetMedium,
      leftOffsetMedium,
      fontSizeMedium,
      widthMedium;
    if (isMobile) {
      mediumHeight = 59.5;
      cellWidthMedium = 94 / mediumCols;
      spacingFactorMedium = 0.62;
      topOffsetMedium = 2.8;
      leftOffsetMedium = 0.85;
      fontSizeMedium = "16px";
      widthMedium = "85px";
    } else {
      mediumHeight = 55.5;
      cellWidthMedium = 81 / mediumCols;
      spacingFactorMedium = 0.67;
      topOffsetMedium = 3.0;
      leftOffsetMedium = 0.98;
      fontSizeMedium = "22px";
      widthMedium = "100px";
    }
    const cellHeightMedium = mediumHeight / mediumRows;
    for (let row = 0; row < mediumRows; row++) {
      for (let col = 0; col < mediumCols; col++) {
        overlays.push({
          id: `mlmix-medium${idCounter++}`,
          top: `${20 +
            (row * spacingFactorMedium + topOffsetMedium) * cellHeightMedium
            }%`,
          left: `${(col + leftOffsetMedium) * cellWidthMedium}%`,
          width: widthMedium,
          fontSize: fontSizeMedium,
          textAlign: "left",
          area: "medium",
        });
      }
    }
    return overlays;
  }

  // ----- nameonly generators (unchanged structure) -----
  function generateNameOnlySmall() {
    const overlays = [];
    const isMobile = window.innerWidth <= 768;

    const rows = 12,
      cols = 4;
    let rowGap, colGap, widthSmall, fontSizeSmall, topOffset, leftOffset;

    if (isMobile) {
      rowGap = 7.66;
      colGap = 23.5;
      widthSmall = "100px";
      fontSizeSmall = "16px";
      topOffset = 5.0; // 📱 모바일: 살짝 위쪽으로 이동
      leftOffset = 15; // 📱 모바일: 왼쪽 여백 줄이기
    } else {
      rowGap = 7.66;
      colGap = 20.1;
      widthSmall = "100px";
      fontSizeSmall = "28px";
      topOffset = 5.2; // 💻 데스크탑 기준
      leftOffset = 18;
    }

    let id = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        overlays.push({
          id: `nameonly-text${id++}`,
          top: `${topOffset + r * rowGap}%`,
          left: `${leftOffset + c * colGap}%`,
          width: widthSmall,
          fontSize: fontSizeSmall,
          textAlign: "center",
        });
      }
    }

    return overlays;
  }

  function generateNameOnlyMedium() {
    const overlays = [];
    const isMobile = window.innerWidth <= 768; // 📱 모바일 감지

    const rows = 10,
      cols = 3;
    let rowGap, colGap, widthMedium, fontSizeMedium, topOffset, leftOffset;

    // 💻 / 📱 구조만 분리 (현재 수치 동일)
    if (isMobile) {
      rowGap = 9.22;
      colGap = 31.5;
      widthMedium = "130px";
      fontSizeMedium = "28px";
      topOffset = 6; // 시작 y 위치
      leftOffset = 18.5; // 시작 x 위치
    } else {
      rowGap = 9.25;
      colGap = 27;
      widthMedium = "130px";
      fontSizeMedium = "32px";
      topOffset = 6;
      leftOffset = 21;
    }

    let id = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        overlays.push({
          id: `nameonly-medium-text${id++}`,
          top: `${topOffset + r * rowGap}%`,
          left: `${leftOffset + c * colGap}%`,
          width: widthMedium,
          fontSize: fontSizeMedium,
          textAlign: "center",
        });
      }
    }

    return overlays;
  }

  function generateNameOnlyLarge() {
    const overlays = [];
    const isMobile = window.innerWidth <= 768; // 📱 모바일 감지
    let id = 1;

    // ----- Top section -----
    const topRows = 5,
      topCols = 3;
    let rowGapTop,
      colGapTop,
      widthTop,
      fontSizeTop,
      topOffsetTop,
      leftOffsetTop;

    if (isMobile) {
      rowGapTop = 10.3;
      colGapTop = 31.5;
      widthTop = "160px";
      fontSizeTop = "36px";
      topOffsetTop = 6.2; // 시작 y 위치
      leftOffsetTop = 18; // 시작 x 위치
    } else {
      rowGapTop = 10.3;
      colGapTop = 27;
      widthTop = "160px";
      fontSizeTop = "36px";
      topOffsetTop = 6.2;
      leftOffsetTop = 21;
    }

    for (let r = 0; r < topRows; r++) {
      for (let c = 0; c < topCols; c++) {
        overlays.push({
          id: `nameonly-large-top${id++}`,
          top: `${topOffsetTop + r * rowGapTop}%`,
          left: `${leftOffsetTop + c * colGapTop}%`,
          width: widthTop,
          fontSize: fontSizeTop,
          textAlign: "center",
          area: "top",
        });
      }
    }

    // ----- Bottom section -----
    const bottomRows = 3,
      bottomCols = 2;
    let rowGapBottom,
      colGapBottom,
      widthBottom,
      fontSizeBottom,
      topOffsetBottom,
      leftOffsetBottom;

    if (isMobile) {
      rowGapBottom = 14;
      colGapBottom = 48;
      widthBottom = "240px";
      fontSizeBottom = "52px";
      topOffsetBottom = 59; // 시작 y 위치
      leftOffsetBottom = 26; // 시작 x 위치
    } else {
      rowGapBottom = 13.8;
      colGapBottom = 40;
      widthBottom = "240px";
      fontSizeBottom = "52px";
      topOffsetBottom = 59;
      leftOffsetBottom = 28;
    }

    for (let r = 0; r < bottomRows; r++) {
      for (let c = 0; c < bottomCols; c++) {
        overlays.push({
          id: `nameonly-large-bottom${id++}`,
          top: `${topOffsetBottom + r * rowGapBottom}%`,
          left: `${leftOffsetBottom + c * colGapBottom}%`,
          width: widthBottom,
          fontSize: fontSizeBottom,
          textAlign: "center",
          area: "bottom",
        });
      }
    }

    return overlays;
  }

  function generateNameOnlySmlMix() {
    const overlays = [];
    const isMobile = window.innerWidth <= 768; // 📱 모바일 감지
    let id = 1;

    // ----- Large Top -----
    const topRows = 2,
      topCols = 3;
    let rowGapTop,
      colGapTop,
      widthTop,
      fontSizeTop,
      topOffsetTop,
      leftOffsetTop;

    if (isMobile) {
      rowGapTop = 10.2;
      colGapTop = 32;
      widthTop = "160px";
      fontSizeTop = "36px";
      topOffsetTop = 6.5; // 시작 y 위치
      leftOffsetTop = 18; // 시작 x 위치
    } else {
      rowGapTop = 10.2;
      colGapTop = 27.2;
      widthTop = "160px";
      fontSizeTop = "36px";
      topOffsetTop = 6.5;
      leftOffsetTop = 21;
    }

    for (let r = 0; r < topRows; r++) {
      for (let c = 0; c < topCols; c++) {
        overlays.push({
          id: `nameonly-smlmix-large-top${id++}`,
          top: `${topOffsetTop + r * rowGapTop}%`,
          left: `${leftOffsetTop + c * colGapTop}%`,
          width: widthTop,
          fontSize: fontSizeTop,
          textAlign: "center",
          area: "large-top",
        });
      }
    }

    // ----- Large Bottom -----
    const bottomRows = 1,
      bottomCols = 2;
    let rowGapBottom,
      colGapBottom,
      widthBottom,
      fontSizeBottom,
      topOffsetBottom,
      leftOffsetBottom;

    if (isMobile) {
      rowGapBottom = 14;
      colGapBottom = 48;
      widthBottom = "220px";
      fontSizeBottom = "52px";
      topOffsetBottom = 28.2;
      leftOffsetBottom = 26;
    } else {
      rowGapBottom = 14;
      colGapBottom = 40.5;
      widthBottom = "220px";
      fontSizeBottom = "52px";
      topOffsetBottom = 28.2;
      leftOffsetBottom = 28;
    }

    for (let r = 0; r < bottomRows; r++) {
      for (let c = 0; c < bottomCols; c++) {
        overlays.push({
          id: `nameonly-smlmix-large-bottom${id++}`,
          top: `${topOffsetBottom + r * rowGapBottom}%`,
          left: `${leftOffsetBottom + c * colGapBottom}%`,
          width: widthBottom,
          fontSize: fontSizeBottom,
          textAlign: "center",
          area: "large-bottom",
        });
      }
    }

    // ----- Medium -----
    const mediumRows = 3,
      mediumCols = 3;
    let rowGapMedium, colGapMedium, topStart, fontSizeMedium, leftOffsetMedium;

    if (isMobile) {
      rowGapMedium = 9.5;
      colGapMedium = 31.2;
      topStart = 40;
      leftOffsetMedium = 18.5;
      fontSizeMedium = "26px";
    } else {
      rowGapMedium = 9.3;
      colGapMedium = 27;
      topStart = 40;
      leftOffsetMedium = 21;
      fontSizeMedium = "32px";
    }

    for (let r = 0; r < mediumRows; r++) {
      for (let c = 0; c < mediumCols; c++) {
        overlays.push({
          id: `nameonly-smlmix-medium${id++}`,
          top: `${topStart + r * rowGapMedium}%`,
          left: `${leftOffsetMedium + c * colGapMedium}%`,
          width: "130px",
          fontSize: fontSizeMedium,
          textAlign: "center",
          area: "medium",
        });
      }
    }

    // ----- Small -----
    const smallRows = 4,
      smallCols = 4;
    let rowGapSmall,
      colGapSmall,
      widthSmall,
      fontSizeSmall,
      topOffsetSmall,
      leftOffsetSmall;

    if (isMobile) {
      rowGapSmall = 7.65;
      colGapSmall = 23.5;
      widthSmall = "100px";
      fontSizeSmall = "28px";
      topOffsetSmall = 67;
      leftOffsetSmall = 14.5;
    } else {
      rowGapSmall = 7.65;
      colGapSmall = 20;
      widthSmall = "100px";
      fontSizeSmall = "28px";
      topOffsetSmall = 67;
      leftOffsetSmall = 18;
    }

    for (let r = 0; r < smallRows; r++) {
      for (let c = 0; c < smallCols; c++) {
        overlays.push({
          id: `nameonly-smlmix-small${id++}`,
          top: `${topOffsetSmall + r * rowGapSmall}%`,
          left: `${leftOffsetSmall + c * colGapSmall}%`,
          width: widthSmall,
          fontSize: fontSizeSmall,
          textAlign: "center",
          area: "small",
        });
      }
    }

    return overlays;
  }

  function generateNameOnlyMlMix() {
    const overlays = [];
    const isMobile = window.innerWidth <= 768; // 📱 모바일 감지
    let id = 1;

    // ----- Large Top -----
    const topRows = 3,
      topCols = 3;
    let rowGapTop,
      colGapTop,
      widthTop,
      fontSizeTop,
      topOffsetTop,
      leftOffsetTop;

    if (isMobile) {
      rowGapTop = 9.8;
      colGapTop = 31.5;
      widthTop = "160px";
      fontSizeTop = "36px";
      topOffsetTop = 6.2; // 시작 y 위치
      leftOffsetTop = 18.5; // 시작 x 위치
    } else {
      rowGapTop = 9.8;
      colGapTop = 27;
      widthTop = "160px";
      fontSizeTop = "36px";
      topOffsetTop = 6.2;
      leftOffsetTop = 21;
    }

    for (let r = 0; r < topRows; r++) {
      for (let c = 0; c < topCols; c++) {
        overlays.push({
          id: `nameonly-mlmix-large-top${id++}`,
          top: `${topOffsetTop + r * rowGapTop}%`,
          left: `${leftOffsetTop + c * colGapTop}%`,
          width: widthTop,
          fontSize: fontSizeTop,
          textAlign: "center",
          area: "large-top",
        });
      }
    }

    // ----- Large Bottom -----
    const bottomRows = 2,
      bottomCols = 2;
    let rowGapBottom,
      colGapBottom,
      widthBottom,
      fontSizeBottom,
      topOffsetBottom,
      leftOffsetBottom;

    if (isMobile) {
      rowGapBottom = 13.5;
      colGapBottom = 47.5;
      widthBottom = "220px";
      fontSizeBottom = "52px";
      topOffsetBottom = 37;
      leftOffsetBottom = 26;
    } else {
      rowGapBottom = 13.2;
      colGapBottom = 40.5;
      widthBottom = "220px";
      fontSizeBottom = "52px";
      topOffsetBottom = 37;
      leftOffsetBottom = 28;
    }

    for (let r = 0; r < bottomRows; r++) {
      for (let c = 0; c < bottomCols; c++) {
        overlays.push({
          id: `nameonly-mlmix-large-bottom${id++}`,
          top: `${topOffsetBottom + r * rowGapBottom}%`,
          left: `${leftOffsetBottom + c * colGapBottom}%`,
          width: widthBottom,
          fontSize: fontSizeBottom,
          textAlign: "center",
          area: "large-bottom",
        });
      }
    }

    // ----- Medium -----
    const mediumRows = 4,
      mediumCols = 3;
    let rowGapMedium,
      colGapMedium,
      topOffsetMedium,
      leftOffsetMedium,
      widthMedium,
      fontSizeMedium;

    if (isMobile) {
      rowGapMedium = 9.2;
      colGapMedium = 31.5;
      topOffsetMedium = 61.5;
      leftOffsetMedium = 18.5;
      widthMedium = "130px";
      fontSizeMedium = "32px";
    } else {
      rowGapMedium = 9.2;
      colGapMedium = 27;
      topOffsetMedium = 61.5;
      leftOffsetMedium = 21;
      widthMedium = "130px";
      fontSizeMedium = "32px";
    }

    for (let r = 0; r < mediumRows; r++) {
      for (let c = 0; c < mediumCols; c++) {
        overlays.push({
          id: `nameonly-mlmix-medium${id++}`,
          top: `${topOffsetMedium + r * rowGapMedium}%`,
          left: `${leftOffsetMedium + c * colGapMedium}%`,
          width: widthMedium,
          fontSize: fontSizeMedium,
          textAlign: "center",
          area: "medium",
        });
      }
    }

    return overlays;
  }

  // theme overrides (unchanged)
  const isMobile = window.innerWidth <= 768; // 📱 모바일 감지

  let themeOverrides;

  if (isMobile) {
    // ----- 📱 MOBILE -----
    themeOverrides = {
      dino: {
        large: {
          "large-text7": {
            top: "50.3%",
            left: "16%",
            width: "120px",
            fontSize: "9px",
          },
          "large-text8": {
            top: "52%",
            left: "51%",
            width: "120px",
            fontSize: "9px",
          },
          "large-text9": {
            top: "52%",
            left: "80%",
            width: "120px",
            fontSize: "9px",
          },
        },
        "sml-mix": {
          "smlmix-large-top2": {
            fontSize: "9px",
            top: "14.5%",
            left: "50.5%",
            width: "120px",
            textAlign: "center",
          },
        },
        "ml-mix": {
          "mlmix-large-top2": {
            fontSize: "9px",
            top: "14.4%",
            left: "50.5%",
            width: "120px",
            textAlign: "center",
          },
        },
      },
      unicorn: {
        large: {
          "large-text7": {
            top: "54%",
            left: "18%",
            width: "120px",
            fontSize: "20px",
          },
        },
      },
    };
  } else {
    // ----- 💻 DESKTOP -----
    themeOverrides = {
      dino: {
        large: {
          "large-text7": {
            top: "50%",
            left: "18%",
            width: "140px",
            fontSize: "10px",
          },
          "large-text8": {
            top: "52%",
            left: "49%",
            width: "140px",
            fontSize: "10px",
          },
          "large-text9": {
            top: "52%",
            left: "74%",
            width: "140px",
            fontSize: "10px",
          },
        },
        "sml-mix": {
          "smlmix-large-top2": {
            fontSize: "10px",
            top: "14.5%",
            left: "49%",
            width: "130px",
            textAlign: "center",
          },
        },
        "ml-mix": {
          "mlmix-large-top2": {
            fontSize: "10px",
            top: "14.5%",
            left: "49%",
            width: "130px",
            textAlign: "center",
          },
        },
      },
      unicorn: {
        large: {
          "large-text7": {
            top: "54%",
            left: "21%",
            width: "140px",
            fontSize: "22px",
          },
        },
      },
    };
  }

  // base configs
  const overlayConfigsBySize = {
    small: generateSmallOverlays(),
    medium: generateMediumOverlays(),
    large: generateLargeOverlays(),
    "sml-mix": generateSmlMixOverlays(),
    "ml-mix": generateMlMixOverlays(),
    "nameonly-small": generateNameOnlySmall(),
    "nameonly-medium": generateNameOnlyMedium(),
    "nameonly-large": generateNameOnlyLarge(),
    "nameonly-sml-mix": generateNameOnlySmlMix(),
    "nameonly-ml-mix": generateNameOnlyMlMix(),
  };

  // -------- renderer --------
  function renderOverlays(size) {
    if (!overlayContainer) return;
    overlayContainer.innerHTML = "";

    let overlays;
    if (selectedTheme === "nameonly") {
      const base = overlayConfigsBySize[size] || [];
      const overrides = overlayConfigsBySize[`nameonly-${size}`] || [];
      overlays = base.map(cfg => ({
        ...cfg,
        ...(overrides.find(o => o.id === cfg.id) || {}),
      }));
    } else {
      overlays = overlayConfigsBySize[size] || [];
    }

    const key = selectedTheme === "nameonly" ? `nameonly-${size}` : size;
    currentOverlays = (overlayConfigsBySize[key] || []).map(c => ({ ...c }));

    currentOverlays.forEach(config => {
      if (
        themeOverrides[selectedTheme] &&
        themeOverrides[selectedTheme][size]
      ) {
        const override = themeOverrides[selectedTheme][size][config.id];
        if (override) Object.assign(config, override);
      }

      const wrapper = document.createElement("div");
      wrapper.className = "overlay-item";
      wrapper.style.position = "absolute";
      wrapper.style.top = config.top;
      wrapper.style.left = config.left;
      wrapper.style.width = config.width;
      wrapper.style.transform = "translateY(-50%)";

      const text = document.createElement("div");
      text.className = "text-overlay";
      text.id = config.id;
      text.style.fontSize = config.fontSize || "22px";
      text.style.textAlign = config.textAlign || "left";
      text.style.width = "100%";
      text.textContent = "";
      text.style.color = selectedFontColor;

      // White일 경우 outline
      if (selectedFontColor === "#FFFFFF") {
        text.style.textShadow = "0 0 1px #000, 0 0 1px #000";
      } else {
        text.style.textShadow = "none";
      }

      wrapper.appendChild(text);
      overlayContainer.appendChild(wrapper);
    });
  }

  // -------- text update --------
  function updateOverlayText() {
    if (isCharacter) return;
    const first = (firstNameInput?.value || "").trim();
    const last = (lastNameInput?.value || "").trim();
    const name1 = first || "Your name";
    const name2 = last || "";
    const isTwoLines = !!name2;

    // ✅ 모바일 여부 감지 (여기서 한 번만 정의)
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    function getFontSize(len, size, twoLines, area) {
      // ✅ 모바일일 경우 폰트 전체 축소 비율
      const scale = 1.0;

      if (selectedTheme === "nameonly") {
        const isMobile = window.innerWidth <= 768;

        // 📱 모바일
        if (isMobile) {
          if (selectedSize === "sml-mix" || selectedSize === "ml-mix") {
            if (area === "large-top")
              return len <= 5 ? "24px" : len <= 7 ? "21px" : "16px";
            if (area === "large-bottom")
              return len <= 5 ? "35px" : len <= 7 ? "31px" : "25px";
            if (area === "medium")
              return len <= 5 ? "23px" : len <= 7 ? "20px" : "16px";
            if (area === "small")
              return len <= 5 ? "20px" : len <= 7 ? "16px" : "12px";
          }

          if (selectedSize === "large") {
            if (area === "top")
              return len <= 5 ? "24px" : len <= 7 ? "21px" : "16px";
            if (area === "bottom")
              return len <= 5 ? "35px" : len <= 7 ? "31px" : "25px";
            return "28px";
          } else if (selectedSize === "medium") {
            return len <= 5 ? "23px" : len <= 8 ? "20px" : "16px";
          } else if (selectedSize === "small") {
            return len <= 5 ? "20px" : len <= 8 ? "16px" : "12px";
          }
          return "22px";
        }

        // 💻 데스크탑 (원본 유지)
        if (selectedSize === "sml-mix" || selectedSize === "ml-mix") {
          if (area === "large-top")
            return len <= 5 ? "36px" : len <= 7 ? "32px" : "24px";
          if (area === "large-bottom")
            return len <= 5 ? "52px" : len <= 7 ? "46px" : "36px";
          if (area === "medium")
            return len <= 5 ? "32px" : len <= 7 ? "28px" : "24px";
          if (area === "small")
            return len <= 5 ? "28px" : len <= 7 ? "22px" : "18px";
        }

        if (selectedSize === "large") {
          if (area === "top")
            return len <= 5 ? "36px" : len <= 7 ? "32px" : "24px";
          if (area === "bottom")
            return len <= 5 ? "52px" : len <= 7 ? "46px" : "36px";
          return "36px";
        } else if (selectedSize === "medium") {
          return len <= 5 ? "32px" : len <= 8 ? "28px" : "22px";
        } else if (selectedSize === "small") {
          return len <= 5 ? "28px" : len <= 8 ? "24px" : "18px";
        }
        return "28px";
      }

      // non-nameonly themes

      // 📱 모바일 (폰트 크기 살짝 줄인 버전)
      if (isMobile) {
        if (size === "small") {
          if (area === "bottom")
            return len <= 8 ? "16px" : len <= 10 ? "13px" : "10px";
          return len <= 4 ? "16px" : len <= 7 ? "13px" : "10px";
        } else if (size === "medium") {
          return len <= 5 ? "20px" : len <= 8 ? "16px" : "12px";
        } else if (size === "large") {
          if (area === "top" && twoLines) {
            return len <= 5 ? "18px" : len <= 7 ? "16px" : "14px";
          } else if (area === "bottom" && twoLines) {
            return len <= 5 ? "26px" : len <= 7 ? "22px" : "20px";
          } else if (area === "bottom") {
            return len <= 5
              ? "28px"
              : len <= 7
                ? "24px"
                : len <= 9
                  ? "20px"
                  : "16px";
          } else {
            return len <= 5 ? "24px" : len <= 7 ? "20px" : "16px";
          }
        } else if (size === "sml-mix" || size === "ml-mix") {
          if (area === "large-top" && twoLines)
            return len <= 5 ? "18px" : len <= 7 ? "16px" : "14px";
          if (area === "large-top")
            return len <= 5 ? "20px" : len <= 7 ? "18px" : "16px";
          if (area === "large-bottom" && twoLines)
            return len <= 5
              ? "26px"
              : len <= 7
                ? "22px"
                : len <= 9
                  ? "20px"
                  : "18px";
          if (area === "large-bottom")
            return len <= 5
              ? "28px"
              : len <= 7
                ? "24px"
                : len <= 9
                  ? "20px"
                  : "16px";
          if (area === "medium")
            return len <= 5 ? "20px" : len <= 8 ? "16px" : "12px";
          if (area === "small")
            return len <= 4 ? "16px" : len <= 7 ? "13px" : "10px";
          return "14px";
        }
      }

      // 💻 데스크탑 (원본 그대로)
      if (size === "small") {
        if (area === "bottom")
          return len <= 8 ? "22px" : len <= 10 ? "20px" : "14px";
        return len <= 4 ? "22px" : len <= 7 ? "18px" : "14px";
      } else if (size === "medium") {
        return len <= 5 ? "28px" : len <= 8 ? "22px" : "16px";
      } else if (size === "large") {
        if (area === "top" && twoLines) {
          return len <= 5 ? "24px" : len <= 7 ? "22px" : "18px";
        } else if (area === "bottom" && twoLines) {
          return len <= 5
            ? "38px"
            : len <= 7
              ? "34px"
              : len <= 9
                ? "30px"
                : "28px";
        } else if (area === "bottom") {
          return len <= 5
            ? "40px"
            : len <= 7
              ? "35px"
              : len <= 9
                ? "28px"
                : "24px";
        } else {
          return len <= 5 ? "32px" : len <= 7 ? "28px" : "20px";
        }
      } else if (size === "sml-mix" || size === "ml-mix") {
        if (area === "large-top" && twoLines)
          return len <= 5 ? "24px" : len <= 7 ? "22px" : "18px";
        if (area === "large-top")
          return len <= 5 ? "32px" : len <= 7 ? "28px" : "20px";
        if (area === "large-bottom")
          return len <= 5
            ? "40px"
            : len <= 7
              ? "35px"
              : len <= 9
                ? "28px"
                : "24px";
        if (area === "medium")
          return len <= 5 ? "28px" : len <= 8 ? "22px" : "16px";
        if (area === "small")
          return len <= 4 ? "22px" : len <= 7 ? "18px" : "12px";
        return "20px";
      }
    }

    // 🦕 DINO THEME
    if (
      selectedTheme === "dino" &&
      (selectedSize === "large" ||
        selectedSize === "sml-mix" ||
        selectedSize === "ml-mix")
    ) {
      setTimeout(() => {
        const len = (name1 + name2).length;
        const targetIds =
          selectedSize === "large"
            ? ["large-text7", "large-text8", "large-text9"]
            : ["smlmix-large-top2", "mlmix-large-top2"];

        targetIds.forEach(id => {
          const el = root.querySelector(`#${id}`);
          if (!el) return;

          el.querySelectorAll("div").forEach(div => {
            let size;

            if (isMobile) {
              // 📱 모바일 폰트 (약간 작게)
              if (id === "large-text7")
                size = len <= 5 ? "16px" : len <= 7 ? "14px" : "11px";
              else size = len <= 5 ? "18px" : len <= 7 ? "16px" : "13px";
              div.style.lineHeight = "1.05";
            } else {
              // 💻 데스크탑 폰트 (원본)
              if (id === "large-text7")
                size = len <= 5 ? "24px" : len <= 7 ? "22px" : "18px";
              else size = len <= 5 ? "28px" : len <= 7 ? "24px" : "20px";
              div.style.lineHeight = "1.1";
            }

            div.style.fontSize = size;
          });
        });
      }, 0);
    }

    // 🦄 UNICORN THEME
    if (selectedTheme === "unicorn" && selectedSize === "large") {
      setTimeout(() => {
        const wrapper = root.querySelector("#large-text7")?.parentElement;
        const el = root.querySelector("#large-text7");

        if (wrapper) {
          if (isMobile) {
            // 📱 모바일 위치값 (살짝 압축)
            wrapper.style.top = "56%";
            wrapper.style.left = "22%";
            wrapper.style.width = "110px";
          } else {
            // 💻 데스크탑 원본 위치값
            wrapper.style.top = "54%";
            wrapper.style.left = "20%";
            wrapper.style.width = "140px";
          }
        }

        if (el) {
          el.querySelectorAll("div").forEach(div => {
            if (isMobile) {
              div.style.fontSize = "12px";
              div.style.lineHeight = "0.9";
            } else {
              div.style.fontSize = "20px";
              div.style.lineHeight = "0.9";
            }
          });
        }
      }, 0);
    }

    currentOverlays.forEach(config => {
      const el = root.querySelector(`#${config.id}`);
      if (!el) return;

      let displayName1 = name1;
      let displayName2 = name2;

      if (selectedSize === "large" && config.area === "top") {
        if (displayName1.length > 12)
          displayName1 = displayName1.substring(0, 12);
        if (displayName2.length > 12)
          displayName2 = displayName2.substring(0, 12);
      }
      if (selectedSize === "large" && config.area === "bottom") {
        if (displayName1.length > 10)
          displayName1 = displayName1.substring(0, 10);
        if (displayName2.length > 10)
          displayName2 = displayName2.substring(0, 10);
      }

      const len = (name1 + name2).length;
      const fontSize1 = getFontSize(len, selectedSize, isTwoLines, config.area);
      const fontSize2 = name2
        ? getFontSize(len, selectedSize, isTwoLines, config.area)
        : null;

      const lineHeight =
        // ----- Large -----
        selectedSize === "large" && config.area === "top" && len <= 5
          ? isMobile
            ? "16px"
            : "22px"
          : selectedSize === "large" && config.area === "top" && len <= 9
            ? isMobile
              ? "14px"
              : "20px"
            : selectedSize === "large" && config.area === "top"
              ? isMobile
                ? "14px"
                : "18px"
              : selectedSize === "large" && config.area === "bottom" && len <= 5
                ? isMobile
                  ? "16px"
                  : "34px"
                : selectedSize === "large" && config.area === "bottom" && len <= 9
                  ? isMobile
                    ? "18px"
                    : "30px"
                  : selectedSize === "large" && config.area === "bottom"
                    ? isMobile
                      ? "20px"
                      : "28px"
                    : // ----- Medium -----
                    selectedSize === "medium" && len <= 5
                      ? isMobile
                        ? "16px"
                        : "22px"
                      : selectedSize === "medium" && len <= 9
                        ? isMobile
                          ? "14px"
                          : "20px"
                        : selectedSize === "medium"
                          ? isMobile
                            ? "12px"
                            : "18px"
                          : // ----- Small -----
                          selectedSize === "small" && config.area === "top" && len <= 4
                            ? isMobile
                              ? "16px"
                              : "18px"
                            : selectedSize === "small" && config.area === "top" && len <= 8
                              ? isMobile
                                ? "12px"
                                : "16px"
                              : selectedSize === "small" && config.area === "top"
                                ? isMobile
                                  ? "10px"
                                  : "14px"
                                : selectedSize === "small" && config.area === "bottom" && len <= 4
                                  ? isMobile
                                    ? "16px"
                                    : "18px"
                                  : selectedSize === "small" && config.area === "bottom" && len <= 8
                                    ? isMobile
                                      ? "14px"
                                      : "18px"
                                    : selectedSize === "small" && config.area === "bottom"
                                      ? isMobile
                                        ? "11px"
                                        : "16px"
                                      : // ----- Mix (SML or ML) -----
                                      (selectedSize === "sml-mix" || selectedSize === "ml-mix") &&
                                        config.area === "large-top" &&
                                        len <= 5
                                        ? isMobile
                                          ? "16px"
                                          : "22px"
                                        : (selectedSize === "sml-mix" || selectedSize === "ml-mix") &&
                                          config.area === "large-top" &&
                                          len <= 9
                                          ? isMobile
                                            ? "14px"
                                            : "20px"
                                          : (selectedSize === "sml-mix" || selectedSize === "ml-mix") &&
                                            config.area === "large-top"
                                            ? isMobile
                                              ? "14px"
                                              : "18px"
                                            : (selectedSize === "sml-mix" || selectedSize === "ml-mix") &&
                                              config.area === "large-bottom" &&
                                              len <= 5
                                              ? isMobile
                                                ? "20px"
                                                : "34px"
                                              : (selectedSize === "sml-mix" || selectedSize === "ml-mix") &&
                                                config.area === "large-bottom" &&
                                                len <= 9
                                                ? isMobile
                                                  ? "18px"
                                                  : "30px"
                                                : (selectedSize === "sml-mix" || selectedSize === "ml-mix") &&
                                                  config.area === "large-bottom"
                                                  ? isMobile
                                                    ? "20px"
                                                    : "28px"
                                                  : (selectedSize === "sml-mix" || selectedSize === "ml-mix") &&
                                                    config.area === "medium" &&
                                                    len <= 5
                                                    ? isMobile
                                                      ? "16px"
                                                      : "22px"
                                                    : (selectedSize === "sml-mix" || selectedSize === "ml-mix") &&
                                                      config.area === "medium" &&
                                                      len <= 9
                                                      ? isMobile
                                                        ? "14px"
                                                        : "20px"
                                                      : (selectedSize === "sml-mix" || selectedSize === "ml-mix") &&
                                                        config.area === "medium"
                                                        ? isMobile
                                                          ? "12px"
                                                          : "20px"
                                                        : (selectedSize === "sml-mix" || selectedSize === "ml-mix") &&
                                                          config.area === "small" &&
                                                          len <= 4
                                                          ? isMobile
                                                            ? "16px"
                                                            : "18px"
                                                          : (selectedSize === "sml-mix" || selectedSize === "ml-mix") &&
                                                            config.area === "small" &&
                                                            len <= 8
                                                            ? isMobile
                                                              ? "12px"
                                                              : "16px"
                                                            : (selectedSize === "sml-mix" || selectedSize === "ml-mix") &&
                                                              config.area === "small"
                                                              ? isMobile
                                                                ? "10px"
                                                                : "14px"
                                                              : // ----- Default -----
                                                              isMobile
                                                                ? "28px"
                                                                : "35px";

      el.innerHTML = `
          <div style="font-size:${fontSize1}; line-height:${lineHeight}; text-align:${config.textAlign || "left"
        };">
            ${displayName1}
          </div>
          ${displayName2
          ? `
            <div style="font-size:${fontSize2}; line-height:${lineHeight}; text-align:${config.textAlign || "left"
          };">
              ${displayName2}
            </div>`
          : ""
        }
        `;
    });
  }

  // -------- handlers --------
  function onSizeClick(btn) {
    const siblings = btn.parentElement.querySelectorAll(".size-btn");
    siblings.forEach(sib => sib.classList.remove("active"));
    btn.classList.add("active");
    selectedSize = btn.dataset.size;
    hiddenSize && (hiddenSize.value = selectedSize);
    renderOverlays(selectedSize);
    updateOverlayText();
    updatePreview();
  }

  function onThemeClick(btn) {
    const siblings = btn.parentElement.querySelectorAll(".option-btn");
    siblings.forEach(sib => sib.classList.remove("active"));
    btn.classList.add("active");
    selectedTheme = btn.dataset.theme;
    hiddenTheme && (hiddenTheme.value = selectedTheme);
    updatePreview();
    if (selectedSize) {
      renderOverlays(selectedSize);
      updateOverlayText();
    }
  }

  // -------- bind events (scoped) --------
  root
    .querySelectorAll(".size-btn")
    .forEach(btn => btn.addEventListener("click", () => onSizeClick(btn)));
  root
    .querySelectorAll(".theme-btn")
    .forEach(btn => btn.addEventListener("click", () => onThemeClick(btn)));

  // -------- font color handlers --------
  root.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const siblings = btn.parentElement.querySelectorAll(".color-btn");
      siblings.forEach(sib => sib.classList.remove("active"));
      btn.classList.add("active");

      selectedFontColor = btn.dataset.color;
      if (hiddenFontColor) hiddenFontColor.value = selectedFontColor;

      // apply color to existing overlays
      root.querySelectorAll(".text-overlay").forEach(text => {
        text.style.color = selectedFontColor;
        if (selectedFontColor === "#FFFFFF") {
          text.style.textShadow = "0 0 1px #000, 0 0 1px #000";
        } else {
          text.style.textShadow = "none";
        }
      });
    });
  });

  firstNameInput?.addEventListener("input", updateOverlayText);
  lastNameInput?.addEventListener("input", updateOverlayText);

  qtyMinus?.addEventListener("click", () => {
    if (quantity > 1) {
      quantity--;
      if (qtyValue) qtyValue.textContent = String(quantity);
    }
  });
  qtyPlus?.addEventListener("click", () => {
    quantity++;
    if (qtyValue) qtyValue.textContent = String(quantity);
  });

  if (form) {
    form.addEventListener("submit", e => e.preventDefault());
  }

  addBtn?.addEventListener("click", async e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (!variantId) {
      alert("Variant is unavailable on this template.");
      return;
    }

    // sync hidden properties
    if (hiddenFirst) hiddenFirst.value = firstNameInput?.value.trim() || "";
    if (hiddenLast) hiddenLast.value = lastNameInput?.value.trim() || "";
    if (hiddenSize) hiddenSize.value = selectedSize || "";
    if (hiddenTheme) hiddenTheme.value = selectedTheme || "";

    const fontColorName = fontColorMap[selectedFontColor] || selectedFontColor;

    // add to cart
    const res = await fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: variantId,
        quantity: quantity,
        properties: {
          "First Name": hiddenFirst?.value || "",
          "Last Name": hiddenLast?.value || "",
          "Selected Size": hiddenSize?.value || "",
          "Selected Theme": hiddenTheme?.value || "",
          "Font Color": fontColorName,
        },
      }),
    });

    if (!res.ok) {
      alert("Error adding item to cart 😭");
      return;
    }

    // open / refresh drawer
    const drawer = document.querySelector("cart-drawer-component");
    if (drawer && typeof drawer.open === "function") {
      drawer.open();
    } else {
      document.querySelector('[aria-label="Cart"]')?.click();
    }
    setTimeout(() => {
      fetch(window.location.href)
        .then(r => r.text())
        .then(html => {
          const doc = new DOMParser().parseFromString(html, "text/html");
          const newItems = doc.querySelector(
            "cart-drawer-component cart-items-component"
          );
          const curItems = document.querySelector(
            "cart-drawer-component cart-items-component"
          );
          if (newItems && curItems) curItems.innerHTML = newItems.innerHTML;
        })
        .catch(err => console.error("Drawer refresh failed", err));
    }, 150);
  });

  // -------- initial UI state --------
  // set initial active buttons (if present)
  const defaultSizeBtn = root.querySelector(
    `.size-btn[data-size="${selectedSize}"]`
  );

  defaultSizeBtn?.classList.add("active");
  const defaultThemeBtn = root.querySelector(
    `.theme-btn[data-theme="undertheocean"]`
  );
  defaultThemeBtn?.classList.add("active");

  if (hiddenSize) hiddenSize.value = selectedSize;
  if (hiddenTheme) hiddenTheme.value = selectedTheme;

  updatePreview();
  renderOverlays(selectedSize);
  updateOverlayText();
}

// mount on normal page load
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll('[data-section-type="customizer"]')
    .forEach(initCustomizer);
});

// re-mount in Theme Editor
document.addEventListener("shopify:section:load", e => {
  if (e.target?.dataset?.sectionType === "customizer") initCustomizer(e.target);
});
document.addEventListener("shopify:section:select", e => {
  if (e.target?.dataset?.sectionType === "customizer") {
    initCustomizer(e.target);
  }
});

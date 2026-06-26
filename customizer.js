function initCustomizer(root) {
  if (!root) return;

  // ✅ Just Character면 텍스트 섹션 제거
  const isCharacter = root.dataset.isCharacter === "true";
  if (isCharacter) {
    const textSection = root.querySelector("#text-section");
    if (textSection) textSection.remove();

    const textInputs = root.querySelectorAll("#user-text, #user-text-last-name");
    textInputs.forEach(input => input.remove());
  }

  // ----- data from Liquid -----
  const placeholderUrl = root.dataset.placeholder || "";
  const variantId = root.dataset.variantId ? Number(root.dataset.variantId) : null;

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

      const themeFile =
        selectedTheme?.toLowerCase() === "Puppy" ? "Puppy" :
          selectedTheme?.toLowerCase() === "Kitty" ? "Kitty" :
            selectedTheme;

      const fileName = `${selectedSize}-${themeFile}${suffix}.png`;
      const newSrc = placeholderUrl.replace(/[^/]+$/, fileName);

      previewImage.src = newSrc;
    }
  }

  function buildFileName() {
    const first = (firstNameInput?.value || "firstname").trim();
    const last = (lastNameInput?.value || "").trim();

    const safeFirst = first.toLowerCase().replace(/\s+/g, "-");
    const safeLast = last.toLowerCase().replace(/\s+/g, "-");

    const size = selectedSize || "size";
    const theme = selectedTheme || "theme";

    return `${safeFirst}${safeLast ? "-" + safeLast : ""}-${size}-${theme}.png`;
  }


  // =========================================================
  // ✅ Overlay Generators (DESKTOP ONLY: 모바일 로직 제거)
  // =========================================================
  function generateSmallOverlays() {
    const overlays = [];
    let idCounter = 1;

    const rows = 10;
    const cols = 4;

    const totalHeight = 94; // 기존 top + bottom 합친 높이
    const cellWidth = 96 / cols;
    const cellHeight = totalHeight / rows;

    const spacingFactor = 0.86;   // 세로 간격 미세 조정
    const topOffset = 2.3;          // 전체 위 여백 조정
    const leftOffset = 0.87;      // 좌측 여백 조정

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        overlays.push({
          id: `small-text${idCounter++}`,
          top: `calc(${(row * spacingFactor + topOffset) * cellHeight}%)`,
          left: `${(col + leftOffset) * cellWidth}%`,
          width: "85px",
          textAlign: "left",
          area: "full", // 이제 top/bottom 구분 없음
        });
      }
    }

    return overlays;
  }

  function generateMediumOverlays() {
    const overlays = [];
    let idCounter = 1;

    const topRows = 8, topCols = 3;

    const topHeight = 93;
    const cellWidthTop = 95.5 / topCols;

    const spacingFactor = 0.835;
    const topOffset = 2.2;
    const leftOffset = 0.78;

    const cellHeightTop = topHeight / topRows;

    for (let row = 0; row < topRows; row++) {
      for (let col = 0; col < topCols; col++) {
        const adjustedRow = row * spacingFactor;
        overlays.push({
          id: `medium-text${idCounter++}`,
          top: `calc(${(adjustedRow + topOffset) * cellHeightTop}%)`,
          left: `${(col + leftOffset) * cellWidthTop}%`,
          width: "100px",
          textAlign: "left",
        });
      }
    }
    return overlays;
  }

  function generateLargeOverlays() {
    const overlays = [];
    let idCounter = 1;

    const topRows = 3, topCols = 3;
    const bottomRows = 2, bottomCols = 2;

    const topHeight = 24.5;
    const bottomHeight = 74;

    const cellWidthTop = 96 / topCols;
    const cellWidthBottom = 96 / bottomCols;

    const spacingFactorTop = 2.37;
    const spacingFactorBottom = 0.53;

    const topOffsetTop = 2.0;
    const topOffsetBottom = 1.2;

    const leftOffsetTop = 0.56;
    const leftOffsetBottom = 0.75;

    const widthTop = "120px";
    const widthBottom = "140px";

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
          top: `${topHeight + (row * spacingFactorBottom + topOffsetBottom) * cellHeightBottom}%`,
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

    // Large Top (1×3)
    const largeTopRows = 1, largeTopCols = 3;
    const largeTopHeight = 16.5;
    const cellWidthLargeTop = 96 / largeTopCols;
    const leftOffsetLargeTop = 0.56;
    const widthLargeTop = "120px";
    const topOffsetLargeTop = 1.0;

    for (let row = 0; row < largeTopRows; row++) {
      for (let col = 0; col < largeTopCols; col++) {
        overlays.push({
          id: `smlmix-large-top${idCounter++}`,
          top: `${(row + topOffsetLargeTop) * largeTopHeight}%`,
          left: `${(col + leftOffsetLargeTop) * cellWidthLargeTop}%`,
          width: widthLargeTop,
          textAlign: "center",
          area: "large-top",
        });
      }
    }

    // Large Bottom (1×2)
    const largeBottomRows = 1, largeBottomCols = 2;
    const largeBottomHeight = 27.5;
    const cellWidthLargeBottom = 96 / largeBottomCols;
    const leftOffsetLargeBottom = 0.75;
    const widthLargeBottom = "140px";
    const topOffsetLargeBottom = 1.0;

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

    // Medium (3×3)
    const mediumRows = 3, mediumCols = 3;
    const mediumHeight = 41;
    const cellWidthMedium = 96 / mediumCols;
    const spacingFactorMedium = 0.71;
    const topOffsetMedium = 1.5;
    const leftOffsetMedium = 0.76;
    const widthMedium = "100px";

    const cellHeightMedium = mediumHeight / mediumRows;
    for (let row = 0; row < mediumRows; row++) {
      for (let col = 0; col < mediumCols; col++) {
        overlays.push({
          id: `smlmix-medium${idCounter++}`,
          top: `${20 + (row * spacingFactorMedium + topOffsetMedium) * cellHeightMedium}%`,
          left: `${(col + leftOffsetMedium) * cellWidthMedium}%`,
          width: widthMedium,
          textAlign: "left",
          area: "medium",
        });
      }
    }

    // Small (4×4)
    const smallRows = 4, smallCols = 4;
    const smallHeight = 54.7;
    const cellWidthSmall = 95.5 / smallCols;
    const spacingFactorSmall = 0.585;
    const topOffsetSmall = 5.0;
    const leftOffsetSmall = 0.86;
    const widthSmall = "80px";

    const cellHeightSmall = smallHeight / smallRows;
    for (let row = 0; row < smallRows; row++) {
      for (let col = 0; col < smallCols; col++) {
        overlays.push({
          id: `smlmix-small${idCounter++}`,
          top: `${(row * spacingFactorSmall + topOffsetSmall) * cellHeightSmall + 2.0}%`,
          left: `${(col + leftOffsetSmall) * cellWidthSmall}%`,
          width: widthSmall,
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

    // Large Top (2×3)
    const largeTopRows = 2, largeTopCols = 3;
    const largeTopHeight = 21.8;
    const cellWidthLargeTop = 96.5 / largeTopCols;
    const spacingFactorTop = 1.75;
    const topOffsetTop = 1.5;
    const leftOffsetTop = 0.55;
    const widthLargeTop = "120px";

    const cellHeightLargeTop = largeTopHeight / largeTopRows;
    for (let row = 0; row < largeTopRows; row++) {
      for (let col = 0; col < largeTopCols; col++) {
        overlays.push({
          id: `mlmix-large-top${idCounter++}`,
          top: `${(row * spacingFactorTop + topOffsetTop) * cellHeightLargeTop}%`,
          left: `${(col + leftOffsetTop) * cellWidthLargeTop}%`,
          width: widthLargeTop,
          textAlign: "center",
          area: "large-top",
        });
      }
    }

    // Large Bottom (1×2)
    const largeBottomRows = 1, largeBottomCols = 2;
    const largeBottomHeight = 22.5;
    const cellWidthLargeBottom = 96 / largeBottomCols;
    const spacingFactorBottom = 0.53;
    const topOffsetBottom = 1.25;
    const leftOffsetBottom = 0.76;
    const widthLargeBottom = "140px";

    const cellHeightLargeBottom = largeBottomHeight / largeBottomRows;
    for (let row = 0; row < largeBottomRows; row++) {
      for (let col = 0; col < largeBottomCols; col++) {
        overlays.push({
          id: `mlmix-large-bottom${idCounter++}`,
          top: `${(row * spacingFactorBottom + topOffsetBottom) * cellHeightLargeBottom + largeTopHeight}%`,
          left: `${(col + leftOffsetBottom) * cellWidthLargeBottom}%`,
          width: widthLargeBottom,
          textAlign: "left",
          area: "large-bottom",
        });
      }
    }

    // Medium (4×3)
    const mediumRows = 4, mediumCols = 3;
    const mediumHeight = 59.5;
    const cellWidthMedium = 96 / mediumCols;
    const spacingFactorMedium = 0.65;
    const topOffsetMedium = 3.0;
    const leftOffsetMedium = 0.75;
    const widthMedium = "100px";

    const cellHeightMedium = mediumHeight / mediumRows;
    for (let row = 0; row < mediumRows; row++) {
      for (let col = 0; col < mediumCols; col++) {
        overlays.push({
          id: `mlmix-medium${idCounter++}`,
          top: `${20 + (row * spacingFactorMedium + topOffsetMedium) * cellHeightMedium}%`,
          left: `${(col + leftOffsetMedium) * cellWidthMedium}%`,
          width: widthMedium,
          textAlign: "left",
          area: "medium",
        });
      }
    }

    return overlays;
  }

  // =========================================================
  // ✅ Nameonly Generators (DESKTOP ONLY)
  // =========================================================
  function generateNameOnlySmall() {
    const overlays = [];

    const rows = 12, cols = 4;
    const rowGap = 8.05;
    const colGap = 23.8;
    const widthSmall = "100px";
    const fontSizeSmall = "28px";
    const topOffset = 5.4;
    const leftOffset = 14.2;

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

    const rows = 10, cols = 3;
    const rowGap = 9.7;
    const colGap = 32;
    const widthMedium = "130px";
    const fontSizeMedium = "32px";
    const topOffset = 6.1;
    const leftOffset = 18;

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
    let id = 1;

    // Top
    const topRows = 6, topCols = 2;
    const rowGapTop = 16.2;
    const colGapTop = 49;
    const widthTop = "200px";
    const fontSizeTop = "36px";
    const topOffsetTop = 9;
    const leftOffsetTop = 26;

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
    return overlays;
  }

  function generateNameOnlySmlMix() {
    const overlays = [];
    let id = 1;

    // Large Top
    const topRows = 2, topCols = 2;
    const rowGapTop = 18;
    const colGapTop = 50;
    const widthTop = "400px";
    const fontSizeTop = "50px";
    const topOffsetTop = 9;
    const leftOffsetTop = 26;

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

    // Medium
    const mediumRows = 3, mediumCols = 3;
    const rowGapMedium = 9.8;
    const colGapMedium = 31.9;
    const topStart = 42;
    const leftOffsetMedium = 18;
    const fontSizeMedium = "32px";

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

    // Small
    const smallRows = 4, smallCols = 4;
    const rowGapSmall = 8;
    const colGapSmall = 23.8;
    const widthSmall = "100px";
    const fontSizeSmall = "28px";
    const topOffsetSmall = 70.5;
    const leftOffsetSmall = 14.2;

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
    let id = 1;

    // Large Top
    const topRows = 4, topCols = 2;
    const rowGapTop = 14;
    const colGapTop = 50;
    const widthTop = "160px";
    const fontSizeTop = "36px";
    const topOffsetTop = 8.5;
    const leftOffsetTop = 24;

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

    // Medium
    const mediumRows = 4, mediumCols = 3;
    const rowGapMedium = 9.6;
    const colGapMedium = 32;
    const topOffsetMedium = 64.5;
    const leftOffsetMedium = 18;
    const widthMedium = "130px";
    const fontSizeMedium = "32px";

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

  const isMobile = window.innerWidth <= 768; // 📱 모바일 감지

  let themeOverrides;

  if (isMobile) {
    // ----- 📱 MOBILE -----
    themeOverrides = {
      dino: {
        large: {
          "large-text7": { top: "50.3%", left: "16%", width: "120px", fontSize: "9px" },
          "large-text8": { top: "52%", left: "51%", width: "120px", fontSize: "9px" },
          "large-text9": { top: "52%", left: "80%", width: "120px", fontSize: "9px" },
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
          "large-text7": { top: "54%", left: "18%", width: "120px", fontSize: "20px" },
        },
      },
      "jesus loves": {
        large: {
          "large-text5": { top: "31%", left: "49.5%", width: "120px", fontSize: "9px" },
          "large-text6": { top: "32%", left: "81.6%", width: "120px", fontSize: "9px" },
        },
        "sml-mix": {
          "smlmix-large-top2": {
            fontSize: "9px",
            top: "13.3%",
            left: "51%",
            width: "120px",
            textAlign: "center",
          },
        },
        "ml-mix": {
          "mlmix-large-top5": {
            top: "31.2%",
            left: "49%",
            width: "120px",
            fontSize: "9px",
            textAlign: "center",
          },
          "mlmix-large-top6": {
            top: "32.6%",
            left: "80.8%",
            width: "120px",
            fontSize: "9px",
            textAlign: "center",
          },
        },
      },
      Puppy: {
        "sml-mix": {
          "smlmix-large-bottom4": { fontSize: "10px", top: "27.8%", left: "29%", width: "130px", textAlign: "center" },
          "smlmix-large-bottom5": { fontSize: "10px", top: "29%", left: "72%", width: "130px", textAlign: "center" },
        },
        "ml-mix": {
          "mlmix-large-top4": { top: "32.5%", left: "19%", width: "140px", fontSize: "10px", textAlign: "center" },
          "mlmix-large-top5": { top: "33%", left: "50%", width: "140px", fontSize: "10px", textAlign: "center" },
          "mlmix-large-top6": { top: "25%", left: "82%", width: "140px", fontSize: "10px", textAlign: "center" },
          "mlmix-large-bottom7": { top: "52%", left: "26%", width: "140px", fontSize: "10px", textAlign: "center" },
          "mlmix-large-bottom8": { top: "50.5%", left: "74%", width: "140px", fontSize: "10px", textAlign: "center" },
        },
      },
      Kitty: {
        "sml-mix": {
          "smlmix-large-bottom4": { fontSize: "10px", top: "27%", left: "38%", width: "130px", textAlign: "left" },
          "smlmix-large-bottom5": { fontSize: "10px", top: "27%", left: "75%", width: "130px", textAlign: "center" },
        },
        "ml-mix": {
          "mlmix-large-top4": { top: "33%", left: "18%", width: "140px", fontSize: "10px", textAlign: "center" },
          "mlmix-large-top5": { top: "34.5%", left: "50%", width: "140px", fontSize: "10px", textAlign: "center" },
          "mlmix-large-top6": { top: "24.5%", left: "82%", width: "140px", fontSize: "10px", textAlign: "center" },
          "mlmix-large-bottom7": { top: "50%", left: "44%", width: "140px", fontSize: "10px", textAlign: "left" },
          "mlmix-large-bottom8": { top: "48%", left: "89%", width: "140px", fontSize: "10px", textAlign: "left" },
        },
      },
    };
  } else {
    // ----- 💻 DESKTOP -----
    themeOverrides = {
      dino: {
        large: {
          "large-text7": { top: "52.8%", left: "15.5%", width: "140px", fontSize: "10px" },
          "large-text8": { top: "54.5%", left: "51.5%", width: "140px", fontSize: "10px" },
          "large-text9": { top: "54.5%", left: "81%", width: "140px", fontSize: "10px" },
        },
        "sml-mix": {
          "smlmix-large-top2": {
            fontSize: "10px",
            top: "15.5%",
            left: "51%",
            width: "130px",
            textAlign: "center",
          },
        },
        "ml-mix": {
          "mlmix-large-top2": {
            fontSize: "10px",
            top: "15.5%",
            left: "51%",
            width: "130px",
            textAlign: "center",
          },
        },
      },
      unicorn: {
        large: {
          "large-text7": { top: "56.5%", left: "17.5%", width: "140px", fontSize: "22px" },
        },
      },
      "jesus loves": {
        large: {
          "large-text5": { top: "30.8%", left: "48%", width: "140px", fontSize: "10px" },
          "large-text6": { top: "31.8%", left: "75.6%", width: "140px", fontSize: "10px" },
        },
        "sml-mix": {
          "smlmix-large-top2": { fontSize: "10px", top: "13.2%", left: "49.5%", width: "130px", textAlign: "center" },
        },
        "ml-mix": {
          "mlmix-large-top5": { top: "31.3%", left: "47.6%", width: "140px", fontSize: "10px", textAlign: "center" },
          "mlmix-large-top6": { top: "32.4%", left: "75.1%", width: "140px", fontSize: "10px", textAlign: "center" },
        },
      },
      puppy: {
        "sml-mix": {
          "smlmix-large-bottom4": { fontSize: "10px", top: "29%", left: "29%", width: "130px", textAlign: "center" },
          "smlmix-large-bottom5": { fontSize: "10px", top: "30.5%", left: "73%", width: "130px", textAlign: "center" },
        },
        "ml-mix": {
          "mlmix-large-top4": { top: "34%", left: "18.5%", width: "140px", fontSize: "10px", textAlign: "center" },
          "mlmix-large-top5": { top: "34%", left: "50%", width: "140px", fontSize: "10px", textAlign: "center" },
          "mlmix-large-top6": { top: "25.5%", left: "83%", width: "140px", fontSize: "10px", textAlign: "center" },
          "mlmix-large-bottom7": { top: "53%", left: "27.5%", width: "140px", fontSize: "10px", textAlign: "center" },
          "mlmix-large-bottom8": { top: "53%", left: "72.5%", width: "140px", fontSize: "10px", textAlign: "center" },
        },
      },
      kitty: {
        "sml-mix": {
          "smlmix-large-bottom4": { fontSize: "10px", top: "27.8%", left: "36%", width: "130px", textAlign: "left" },
          "smlmix-large-bottom5": { fontSize: "10px", top: "28%", left: "76%", width: "130px", textAlign: "center" },
        },
        "ml-mix": {
          "mlmix-large-top4": { top: "34%", left: "18%", width: "140px", fontSize: "10px", textAlign: "center" },
          "mlmix-large-top5": { top: "36.5%", left: "51%", width: "140px", fontSize: "10px", textAlign: "center" },
          "mlmix-large-top6": { top: "25%", left: "83%", width: "140px", fontSize: "10px", textAlign: "center" },
          "mlmix-large-bottom7": { top: "52%", left: "28.5%", width: "140px", fontSize: "10px", textAlign: "center" },
          "mlmix-large-bottom8": { top: "50%", left: "76%", width: "140px", fontSize: "10px", textAlign: "center" },
        },
      },
    };
  }

  function generateSmallPetOverlays() {
    const overlays = [];
    let id = 1;
    const isMobile = window.innerWidth <= 600;

    const cols = 4;

    // ----- TOP (8 rows) -----
    const topRows = 8;
    const topHeight = isMobile ? 64 : 64.5;

    const cellWidth = (isMobile ? 94 : 96) / cols;
    const cellHeightTop = topHeight / topRows;

    const topOffset = isMobile ? 0.7 : 0.68;
    const leftOffset = isMobile ? 0.9 : 0.89;

    for (let r = 0; r < topRows; r++) {
      for (let c = 0; c < cols; c++) {
        overlays.push({
          id: `small-text${id++}`,
          top: `${(r + topOffset) * cellHeightTop}%`,
          left: `${(c + leftOffset) * cellWidth}%`,
          width: isMobile ? "70px" : "85px",
          textAlign: "left",
          area: "top"
        });
      }
    }

    // ----- BOTTOM (4 rows) -----
    const bottomRows = 4;
    const bottomHeight = isMobile ? 31 : 32.2;

    const cellHeightBottom = bottomHeight / bottomRows;

    const cellWidthBottom = (isMobile ? 95 : 96) / cols;
    const bottomOffset = isMobile ? 0.7 : 0.7;
    const leftOffsetBottom = isMobile ? 0.98 : 0.94;

    for (let r = 0; r < bottomRows; r++) {
      for (let c = 0; c < cols; c++) {
        overlays.push({
          id: `small-text${id++}`,
          top: `${topHeight + (r + bottomOffset) * cellHeightBottom}%`,
          left: `${(c + leftOffsetBottom) * cellWidthBottom}%`,
          width: isMobile ? "75px" : "90px",
          textAlign: "left",
          area: "bottom",
          forceSingleLine: true
        });
      }
    }

    return overlays;
  }

  function generateMediumPetOverlays() {
    const overlays = [];
    let id = 1;
    const isMobile = window.innerWidth <= 600;

    const cols = 3;

    // ----- TOP (6 rows) -----
    const topRows = 6;
    const topHeight = isMobile ? 55.5 : 58;

    const cellWidth = (isMobile ? 95 : 95) / cols;
    const cellHeightTop = topHeight / topRows;

    const topOffset = isMobile ? 0.65 : 0.66;
    const leftOffset = isMobile ? 0.77 : 0.77;

    for (let r = 0; r < topRows; r++) {
      for (let c = 0; c < cols; c++) {
        overlays.push({
          id: `medium-text${id++}`,
          top: `${(r + topOffset) * cellHeightTop}%`,
          left: `${(c + leftOffset) * cellWidth}%`,
          width: isMobile ? "80px" : "100px",
          textAlign: "left",
          area: "top"
        });
      }
    }

    // ----- BOTTOM (4 rows) -----
    const bottomRows = 4;
    const bottomHeight = isMobile ? 37.2 : 39;

    const cellHeightBottom = bottomHeight / bottomRows;

    const bottomOffset = isMobile ? 0.66 : 0.69;
    const leftOffsetBottom = isMobile ? 0.88 : 0.88;

    for (let r = 0; r < bottomRows; r++) {
      for (let c = 0; c < cols; c++) {
        overlays.push({
          id: `medium-text${id++}`,
          top: `${topHeight + (r + bottomOffset) * cellHeightBottom}%`,
          left: `${(c + leftOffsetBottom) * cellWidth}%`,
          width: isMobile ? "85px" : "105px",
          textAlign: "left",
          area: "bottom",
          forceSingleLine: true  // ✅ 수정: medium pet bottom도 한 줄 고정
        });
      }
    }

    return overlays;
  }

  function generateLargePetOverlays(theme) {
    const overlays = [];
    const isMobile = window.innerWidth <= 600;
    const themeKey = theme?.toLowerCase();

    const fontSize = isMobile ? "18px" : "28px";

    // ======================
    // DESKTOP
    // ======================
    const kittyCoords = [
      { top: "16%", left: "21%", width: "140px" },
      { top: "16%", left: "48%", width: "140px" },
      { top: "16%", left: "75%", width: "140px" },

      { top: "32.5%", left: "21.8%", width: "160px" },
      { top: "34.5%", left: "48%", width: "150px" },
      { top: "24.5%", left: "75.8%", width: "150px" },

      { top: "48%", left: "33%", width: "140px", textAlign: "left" },
      { top: "48%", left: "70%", width: "260px" },

      { top: "69%", left: "30%", width: "250px" },
      { top: "67.5%", left: "72.5%", width: "260px" },

      { top: "84.5%", left: "35%", width: "260px" },
      { top: "88%", left: "68.5%", width: "260px" },
    ];

    const puppyCoords = [
      { top: "16%", left: "21%", width: "150px" },
      { top: "16%", left: "48%", width: "150px" },
      { top: "16%", left: "75%", width: "150px" },

      { top: "32.5%", left: "21.5%", width: "150px" },
      { top: "33%", left: "48%", width: "150px" },
      { top: "25%", left: "76%", width: "150px" },

      { top: "48%", left: "39%", width: "170px", textAlign: "left" },
      { top: "49%", left: "71%", width: "270px" },

      { top: "68%", left: "30%", width: "250px" },
      { top: "68.5%", left: "67%", width: "260px" },

      { top: "84.2%", left: "36%", width: "260px" },
      { top: "87.5%", left: "68.5%", width: "260px" },
    ];

    // ======================
    // 선택
    // ======================
    let coords;

    coords = themeKey === "kitty" ? kittyCoords : puppyCoords;

    coords.forEach((cfg, index) => {
      overlays.push({
        id: `large-text${index + 1}`,
        top: cfg.top,
        left: cfg.left,
        width: cfg.width,
        fontSize,
        textAlign: cfg.textAlign || "center",
        area: "large-pet"
      });
    });

    return overlays;
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
    "nameonly-ml-mix": generateNameOnlyMlMix()
  };

  function getOverlayConfig(size, theme) {
    const themeKey = theme?.toLowerCase();

    if (themeKey === "puppy" || themeKey === "kitty") {
      if (size === "small") return generateSmallPetOverlays();
      if (size === "medium") return generateMediumPetOverlays();
      if (size === "large") return generateLargePetOverlays(theme);
      if (size === "sml-mix") return generateSmlMixOverlays();
      if (size === "ml-mix") return generateMlMixOverlays();
    }

    return overlayConfigsBySize[size];
  }

  // =========================================================
  // ✅ Renderer
  // =========================================================
  function renderOverlays(size) {
    if (!overlayContainer) return;
    overlayContainer.innerHTML = "";

    const key = selectedTheme === "nameonly" ? `nameonly-${size}` : size;

    const baseConfig =
      selectedTheme === "nameonly"
        ? overlayConfigsBySize[key]
        : getOverlayConfig(size, selectedTheme);

    currentOverlays = (baseConfig || []).map(c => ({ ...c }));

    currentOverlays.forEach(config => {
      const themeKey = selectedTheme?.toLowerCase();

      if (themeOverrides[themeKey] && themeOverrides[themeKey][size]) {
        const override = themeOverrides[themeKey][size][config.id];
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
      text.style.textShadow = "none";

      wrapper.appendChild(text);
      overlayContainer.appendChild(wrapper);
    });
  }

  // =========================================================
  // ✅ Line-height logic
  // =========================================================
  function getLineHeightPx({ theme, size, area, twoLines, fontSizePx }) {
    const fs = Math.round(Number(fontSizePx));

    const byFont = (map, fallback = null) => {
      if (map[fs] != null) return map[fs] + "px";
      if (fallback) return fallback(fs);
      return Math.max(10, fs - 2) + "px";
    };

    // ✅ 2줄
    if (twoLines) {
      // NAMEONLY: 비율(너가 요청한 방식)
      if (theme === "nameonly") {
        return Math.max(10, fs - 2) + "px";
      }

      // =========================
      // ✅ NORMAL
      // =========================
      if (size === "small" && area === "top") {
        return byFont({ 20: 22, 18: 20, 16: 18, 14: 16, 12: 14 });
      }

      if (size === "medium" && area === "top") {
        return byFont({ 24: 23, 22: 21, 20: 19, 18: 17, 16: 15, 14: 13, 12: 11 });
      }

      if (size === "large" && area === "top") {
        return byFont({ 24: 22, 22: 20, 20: 18, 18: 16 });
      }

      if (size === "large" && area === "bottom") {
        // ✅ 규칙: line-height = font-size - 2px
        return Math.max(10, fs - 2) + "px";
      }

      // =========================
      // ✅ MIX (SML 규칙처럼 "분리해서" 명시)
      // =========================
      if ((size === "sml-mix" || size === "ml-mix") && area === "large-top") {
        return byFont({ 24: 22, 22: 20, 20: 18, 18: 16 });
      }

      if ((size === "sml-mix" || size === "ml-mix") && area === "large-bottom") {
        // ✅ 규칙: line-height = font-size
        return Math.max(10, fs - 4) + "px";
      }

      if ((size === "sml-mix" || size === "ml-mix") && area === "medium") {
        return Math.max(10, fs - 2) + "px";
      }

      if ((size === "sml-mix" || size === "ml-mix") && area === "small") {
        return Math.max(10, fs - 2) + "px";
      }

      // fallback
      return Math.max(10, fs - 2) + "px";
    }

    // ✅ 1줄 (기존 비율 유지)
    if (area === "large-bottom") return "1.05";
    return "1.1";
  }

  // =========================================================
  // ✅ Text update (두 줄이면 둘 다 같이 작아지게 적용)
  // =========================================================
  function updateOverlayText() {
    if (isCharacter) return;

    const first = (firstNameInput?.value || "").trim();
    const last = (lastNameInput?.value || "").trim();
    const name1 = first || "Your name";
    const name2 = last || "";
    const isTwoLines = !!name2;

    function getLineFontSize({ size, area, len, twoLines, theme }) {
      const step = (a, b, c, d) => (len <= 5 ? a : len <= 7 ? b : len <= 9 ? c : d);

      // ✅ NAMEONLY
      if (theme === "nameonly") {
        if (size === "small") return step(20, 18, 16, 14);
        if (area === "medium") return twoLines ? step(20, 18, 16, 14) : step(24, 22, 20, 18);

        if (size === "large") {
          if (area === "top") return twoLines ? step(36, 34, 28, 24) : step(48, 42, 40, 36);
        }

        if (size === "sml-mix" || size === "ml-mix") {
          if (area === "large-top") return twoLines ? step(40, 34, 28, 24) : step(48, 44, 42, 36);
          if (area === "medium") return twoLines ? step(20, 18, 16, 14) : step(24, 22, 20, 18);
          if (area === "small") return twoLines ? step(18, 16, 14, 12) : step(20, 18, 16, 14);
        }
      }

      // ✅ NORMAL
      if (size === "small") {
        if (area === "bottom") return step(19, 18, 16, 16);
        return step(16, 14, 13, 11.5); // top
      }

      if (size === "medium") return step(22, 20, 18, 17);
      if (size === "large") {
        if (area === "top") return twoLines ? step(20, 20, 20, 18) : step(32, 26, 24, 20);
        if (area === "bottom") return twoLines ? step(38, 28, 26, 26) : step(40, 32, 28, 28);
      }

      // ✅ MIX (너가 준 sml 규칙)
      if (size === "sml-mix" || size === "ml-mix") {
        if (area === "large-top") return twoLines ? step(20, 20, 20, 18) : step(34, 26, 24, 22);
        if (area === "large-bottom") return twoLines ? step(36, 28, 26, 22) : step(40, 34, 30, 28);
        if (area === "medium") return twoLines ? step(22, 20, 18, 18) : step(22, 20, 18, 18);
        if (area === "small") return step(16, 14, 13, 13);
      }

      return 22;
    }

    // 글로벌 스케일(기존 유지)
    function getGlobalScale(len) {
      if (len <= 6) return 1;
      if (len === 7) return 0.95;
      if (len === 8) return 0.9;
      if (len === 9) return 0.86;
      return 0.82;
    }

    // ✅ Special font/line-height rules for specific overlays
    function getSpecialTypography({ theme, size, id, len, twoLines }) {
      // helpers
      const clampPx = (n) => `${Math.max(1, Math.round(n))}px`;

      // ------------------------
      // DINO - LARGE
      // ------------------------
      if (theme === "dino" && size === "large") {
        // large-text7
        if (id === "large-text7") {
          if (twoLines) {
            const fs = len <= 9 ? 10 : 6;
            const lh = len <= 9 ? 10 : 6;
            return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
          } else {
            const fs = len <= 5 ? 16 : len <= 7 ? 12 : len <= 9 ? 10 : 8;
            return { fs, lh1: clampPx(Math.max(6, fs)) };
          }
        }

        // large-text8 / large-text9
        if (id === "large-text8" || id === "large-text9") {
          if (twoLines) {
            const fs = len <= 9 ? 14 : 10;
            const lh = len <= 9 ? 12 : 8;
            return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
          } else {
            const fs = len <= 5 ? 22 : len <= 9 ? 16 : len <= 12 ? 14 : 12;
            return { fs, lh1: clampPx(Math.max(8, fs - 2)) };
          }
        }
      }

      // ------------------------
      // DINO - SML/ML MIX large-top2
      // ------------------------
      if (theme === "dino" && (size === "sml-mix" || size === "ml-mix")) {
        if (id === "smlmix-large-top2" || id === "mlmix-large-top2") {
          if (twoLines) {
            const fs = len <= 9 ? 14 : 10;
            const lh = len <= 9 ? 12 : 8;
            return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
          } else {
            const fs = len <= 5 ? 22 : len <= 9 ? 15 : len <= 12 ? 14 : 12;
            return { fs, lh1: clampPx(Math.max(8, fs - 2)) };
          }
        }
      }

      // ------------------------
      // UNICORN - LARGE large-text7
      // ------------------------
      if (theme === "unicorn" && size === "large" && id === "large-text7") {
        if (twoLines) {
          const fs = len <= 8 ? 10 : len <= 12 ? 8 : 6;
          const lh = len <= 8 ? 8 : len <= 12 ? 8 : 6;
          return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
        } else {
          const fs = len <= 5 ? 16 : len <= 7 ? 12 : len <= 9 ? 11 : 9;
          return { fs, lh1: clampPx(Math.max(6, fs - 2)) };
        }
      }

      // ------------------------
      // jesus loves - LARGE
      // ------------------------
      if (theme === "jesus loves" && size === "large") {
        if (id === "large-text5") {
          if (twoLines) {
            const fs = len <= 9 ? 10 : 6;
            const lh = len <= 9 ? 10 : 6;
            return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
          } else {
            const fs = len <= 5 ? 20 : len <= 7 ? 16 : len <= 9 ? 14 : 10;
            return { fs, lh1: clampPx(Math.max(6, fs)) };
          }
        }

        if (id === "large-text6") {
          if (twoLines) {
            const fs = len <= 9 ? 10 : 6;
            const lh = len <= 9 ? 10 : 6;
            return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
          } else {
            const fs = len <= 5 ? 20 : len <= 7 ? 16 : len <= 9 ? 14 : 10;
            return { fs, lh1: clampPx(Math.max(6, fs)) };
          }
        }
      }

      // ------------------------
      // jesus loves - SML MIX
      // ------------------------
      if (theme === "jesus loves" && (size === "sml-mix")) {
        if (id === "smlmix-large-top2") {
          if (twoLines) {
            const fs = len <= 5 ? 13 : len <= 7 ? 14 : len <= 9 ? 10 : 8;
            const lh = len <= 5 ? 11 : len <= 7 ? 12 : len <= 9 ? 10 : 6;
            return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
          } else {
            const fs = len <= 5 ? 20 : len <= 7 ? 16 : len <= 9 ? 14 : 10;
            return { fs, lh1: clampPx(Math.max(6, fs)) };
          }
        }
      }

      if (theme === "jesus loves" && (size === "ml-mix")) {
        if (id === "mlmix-large-top5" || id === "mlmix-large-top6") {
          if (twoLines) {
            const fs = len <= 9 ? 10 : 6;
            const lh = len <= 9 ? 10 : 6;
            return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
          } else {
            const fs = len <= 5 ? 20 : len <= 7 ? 16 : len <= 9 ? 14 : 10;
            return { fs, lh1: clampPx(Math.max(6, fs)) };
          }
        }
      }

      // ------------------------
      // PUPPY + KITTY - LARGE large-text4 / mlmix-large-top4
      // ------------------------
      if (
        (theme?.toLowerCase() === "puppy" || theme?.toLowerCase() === "kitty") &&
        (
          (size === "large" && id === "large-text4") ||
          (size === "ml-mix" && id === "mlmix-large-top4")
        )
      ) {
        if (twoLines) {
          const fs = isMobile
            ? (len <= 5 ? 10 : len <= 7 ? 9 : len <= 9 ? 8 : 7)
            : (len <= 5 ? 14 : len <= 7 ? 12 : len <= 9 ? 10 : 8);
          const lh = fs;
          return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
        } else {
          const fs = isMobile
            ? (len <= 5 ? 15 : len <= 7 ? 13 : len <= 9 ? 11 : 8)
            : (len <= 5 ? 20 : len <= 7 ? 18 : len <= 9 ? 16 : 10);
          return { fs, lh1: clampPx(Math.max(6, fs - 2)) };
        }
      }

      // ------------------------
      // PUPPY - large-text6 / mlmix-large-top6
      // ------------------------
      if (
        (theme?.toLowerCase() === "puppy") &&
        (
          (size === "large" && id === "large-text6") ||
          (size === "ml-mix" && id === "mlmix-large-top6")
        )
      ) {
        if (twoLines) {
          const fs = isMobile
            ? (len <= 5 ? 13 : len <= 7 ? 12 : len <= 9 ? 10 : 9)
            : (len <= 5 ? 18 : len <= 7 ? 16 : len <= 9 ? 14 : 12);
          const lh = fs;
          return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
        } else {
          const fs = isMobile
            ? (len <= 5 ? 20 : len <= 7 ? 17 : len <= 9 ? 15 : 11)
            : (len <= 5 ? 26 : len <= 7 ? 22 : len <= 9 ? 20 : 14);
          return { fs, lh1: clampPx(Math.max(8, fs - 2)) };
        }
      }

      // ------------------------
      // KITTY - large-text6 / mlmix-large-top6
      // ------------------------
      if (
        (theme?.toLowerCase() === "kitty") &&
        (
          (size === "large" && id === "large-text6") ||
          (size === "ml-mix" && id === "mlmix-large-top6")
        )
      ) {
        if (twoLines) {
          const fs = isMobile
            ? (len <= 5 ? 13 : len <= 7 ? 12 : len <= 9 ? 10 : 9)
            : (len <= 5 ? 18 : len <= 7 ? 16 : len <= 9 ? 14 : 12);
          const lh = fs;
          return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
        } else {
          const fs = isMobile
            ? (len <= 5 ? 20 : len <= 7 ? 17 : len <= 9 ? 15 : 11)
            : (len <= 5 ? 24 : len <= 7 ? 22 : len <= 9 ? 20 : 14);
          return { fs, lh1: clampPx(Math.max(8, fs - 2)) };
        }
      }

      // ------------------------
      // PUPPY + KITTY - large-text7
      // ------------------------
      if (
        (theme?.toLowerCase() === "puppy" || theme?.toLowerCase() === "kitty") &&
        (size === "large" && id === "large-text7")
      ) {
        if (twoLines) {
          const fs = isMobile
            ? (len <= 5 ? 24 : len <= 7 ? 20 : len <= 9 ? 18 : 16)
            : (len <= 5 ? 32 : len <= 7 ? 26 : len <= 9 ? 22 : 20);
          const lh = isMobile ? fs - 2 : fs;
          return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
        } else {
          const fs = isMobile
            ? (len <= 5 ? 28 : len <= 7 ? 24 : len <= 9 ? 20 : 18)
            : (len <= 5 ? 38 : len <= 7 ? 34 : len <= 9 ? 28 : 23);
          return { fs, lh1: clampPx(Math.max(8, fs - 2)) };
        }
      }

      // ------------------------
      // PUPPY - large-text8 + smlmix-large-bottom4
      // ------------------------
      if (
        theme?.toLowerCase() === "puppy" &&
        (
          (size === "large" && id === "large-text8") ||
          (size === "sml-mix" && id === "smlmix-large-bottom4")
        )
      ) {
        const fullLen = isTwoLines ? (name1 + " " + name2).length : len;

        const fs = isMobile
          ? (fullLen <= 5 ? 20 : fullLen <= 7 ? 17 : fullLen <= 9 ? 15 : fullLen <= 12 ? 12 : 10)
          : (fullLen <= 5 ? 26 : fullLen <= 7 ? 20 : fullLen <= 9 ? 18 : fullLen <= 12 ? 14 : 12);

        return {
          fs,
          lh1: clampPx(Math.max(8, fs - 2)),
          forceSingleLine: true
        };
      }

      // ------------------------
      // PUPPY + KITTY - large-text9 / mlmix-large-bottom7
      // ------------------------
      if (
        (theme?.toLowerCase() === "puppy" || theme?.toLowerCase() === "kitty") &&
        (
          (size === "large" && id === "large-text9") ||
          (size === "ml-mix" && id === "mlmix-large-bottom7")
        )
      ) {
        if (twoLines) {
          const fs = isMobile
            ? (len <= 5 ? 12 : len <= 7 ? 10 : len <= 9 ? 9 : 8)
            : (len <= 5 ? 16 : len <= 7 ? 14 : len <= 9 ? 12 : 10);
          const lh = fs;
          return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
        } else {
          const fs = isMobile
            ? (len <= 5 ? 18 : len <= 7 ? 14 : len <= 9 ? 13 : 11)
            : (len <= 5 ? 20 : len <= 7 ? 18 : len <= 9 ? 17 : 15);
          return { fs, lh1: clampPx(Math.max(8, fs - 2)) };
        }
      }

      // ------------------------
      // PUPPY - large-text10 + smlmix-large-bottom5 + mlmix-large-bottom8
      // ------------------------
      if (
        theme?.toLowerCase() === "puppy" &&
        (
          (size === "large" && id === "large-text10") ||
          (size === "sml-mix" && id === "smlmix-large-bottom5") ||
          (size === "ml-mix" && id === "mlmix-large-bottom8")
        )
      ) {
        if (twoLines) {
          const fs = isMobile
            ? (len <= 5 ? 12 : len <= 7 ? 10 : len <= 9 ? 7 : 7)
            : (len <= 5 ? 16 : len <= 7 ? 14 : len <= 9 ? 12 : 10);
          const lh = fs - 2;
          return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
        } else {
          const fs = isMobile
            ? (len <= 5 ? 17 : len <= 7 ? 13 : len <= 9 ? 12 : 10)
            : (len <= 5 ? 22 : len <= 7 ? 16 : len <= 9 ? 12 : 12);
          return { fs, lh1: clampPx(Math.max(8, fs - 2)) };
        }
      }

      // ------------------------
      // PUPPY - large-text11
      // ------------------------
      if (
        theme?.toLowerCase() === "puppy" &&
        size === "large" &&
        id === "large-text11"
      ) {
        if (twoLines) {
          const fs = isMobile
            ? (len <= 5 ? 12 : len <= 7 ? 10 : len <= 9 ? 9 : 8)
            : (len <= 5 ? 16 : len <= 7 ? 14 : len <= 9 ? 12 : 10);
          const lh = fs;
          return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
        } else {
          const fs = isMobile
            ? (len <= 5 ? 18 : len <= 7 ? 14 : len <= 9 ? 13 : 11)
            : (len <= 5 ? 24 : len <= 7 ? 18 : len <= 9 ? 17 : 15);
          return { fs, lh1: clampPx(Math.max(8, fs - 2)) };
        }
      }

      // ------------------------
      // PUPPY - large-text12
      // ------------------------
      if (
        theme?.toLowerCase() === "puppy" &&
        size === "large" &&
        id === "large-text12"
      ) {
        if (twoLines) {
          const fs = isMobile
            ? (len <= 5 ? 18 : len <= 7 ? 14 : len <= 9 ? 12 : 10)
            : (len <= 5 ? 32 : len <= 7 ? 24 : len <= 9 ? 22 : 20);
          const lh = isMobile ? fs - 3 : fs - 3;
          return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
        } else {
          const fs = isMobile
            ? (len <= 5 ? 28 : len <= 7 ? 24 : len <= 9 ? 20 : 18)
            : (len <= 5 ? 38 : len <= 7 ? 34 : len <= 9 ? 28 : 23);
          const lh = fs - 2;
          return { fs, lh1: clampPx(Math.max(8, lh)) };
        }
      }

      // ------------------------
      // KITTY (ml-mix) + PUPPY (large) top 1,2,3,5
      // ------------------------
      if (
        (
          theme?.toLowerCase() === "kitty" &&
          size === "ml-mix" &&
          (
            id === "mlmix-large-top1" ||
            id === "mlmix-large-top2" ||
            id === "mlmix-large-top3" ||
            id === "mlmix-large-top5"
          )
        )
        ||
        (
          theme?.toLowerCase() === "puppy" &&
          size === "large" &&
          (
            id === "large-text1" ||
            id === "large-text2" ||
            id === "large-text3" ||
            id === "large-text5"
          )
        )
      ) {
        if (twoLines) {
          const fs = isMobile
            ? (len <= 5 ? 20 : len <= 7 ? 18 : len <= 9 ? 16 : 13)
            : (len <= 5 ? 20 : len <= 7 ? 20 : len <= 9 ? 20 : 18);
          const lh = fs - 2;
          return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
        } else {
          const fs = isMobile
            ? (len <= 5 ? 24 : len <= 7 ? 21 : len <= 9 ? 18 : 15)
            : (len <= 5 ? 32 : len <= 7 ? 28 : len <= 9 ? 24 : 20);
          return { fs, lh1: clampPx(Math.max(8, fs - 2)) };
        }
      }

      // ------------------------
      // KITTY - smlmix-large-bottom5 / mlmix-large-bottom8
      // ------------------------
      if (
        theme?.toLowerCase() === "kitty" &&
        (
          (size === "sml-mix" && id === "smlmix-large-bottom5") ||
          (size === "ml-mix" && id === "mlmix-large-bottom8")
        )
      ) {
        if (twoLines) {
          const fs = isMobile
            ? (len <= 5 ? 12 : len <= 7 ? 10 : len <= 9 ? 9 : 8)
            : (len <= 5 ? 16 : len <= 7 ? 14 : len <= 9 ? 12 : 10);
          const lh = fs - 1;
          return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
        } else {
          const fs = isMobile
            ? (len <= 5 ? 16 : len <= 7 ? 13 : len <= 9 ? 11 : 12)
            : (len <= 5 ? 26 : len <= 7 ? 22 : len <= 9 ? 20 : 13);
          return { fs, lh1: clampPx(Math.max(8, fs - 2)) };
        }
      }

      // ------------------------
      // 🐶🐱 PUPPY + KITTY - SMALL TOP / BOTTOM
      // ------------------------
      if (
        (theme?.toLowerCase() === "puppy" || theme?.toLowerCase() === "kitty") &&
        size === "small"
      ) {
        const area = currentOverlays.find(o => o.id === id)?.area;

        if (area === "top") {
          if (twoLines) {
            const fs = len <= 5 ? 13 : len <= 7 ? 11 : len <= 9 ? 10 : 8;
            const lh = fs - 1;
            return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
          } else {
            const fs = len <= 5 ? 16 : len <= 7 ? 14 : len <= 9 ? 12 : 10;
            const lh = fs - 2;
            return { fs, lh1: clampPx(lh) };
          }
        }

        if (area === "bottom") {
          if (twoLines) {
            const fs = len <= 5 ? 12 : len <= 7 ? 10 : len <= 9 ? 9 : 7;
            const lh = fs - 1;
            return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
          } else {
            const fs = len <= 5 ? 15 : len <= 7 ? 13 : len <= 9 ? 11 : 9;
            const lh = fs - 2;
            return { fs, lh1: clampPx(lh) };
          }
        }
      }

      // ------------------------
      // 🐶🐱 PUPPY + KITTY - MEDIUM TOP / BOTTOM
      // ------------------------
      if (
        (theme?.toLowerCase() === "puppy" || theme?.toLowerCase() === "kitty") &&
        size === "medium"
      ) {
        const area = currentOverlays.find(o => o.id === id)?.area;

        if (area === "top") {
          if (twoLines) {
            const fs = len <= 5 ? 18 : len <= 7 ? 15 : len <= 9 ? 13 : 11;
            const lh = fs - 2;
            return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
          } else {
            const fs = len <= 5 ? 22 : len <= 7 ? 20 : len <= 9 ? 16 : 12;
            const lh = fs - 2;
            return { fs, lh1: clampPx(lh) };
          }
        }

        if (area === "bottom") {
          if (twoLines) {
            const fs = len <= 5 ? 12 : len <= 7 ? 10 : len <= 9 ? 8 : 6;
            const lh = fs - 1;
            return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
          } else {
            const fs = len <= 5 ? 20 : len <= 7 ? 18 : len <= 9 ? 14 : 12;
            const lh = fs - 2;
            return { fs, lh1: clampPx(lh) };
          }
        }

        return null;
      }

      return null;
    }

    currentOverlays.forEach(config => {
      const el = root.querySelector(`#${config.id}`);
      if (!el) return;

      // ⭐ 특정 위치 색 강제 변경 (puppy + kitty)
      const forceBlack =
        // 기존: puppy+kitty 흰색일 때 특정 슬롯 검정 강제
        (
          (selectedTheme?.toLowerCase() === "puppy" || selectedTheme?.toLowerCase() === "kitty") &&
          (
            (selectedSize === "ml-mix" && (
              config.id === "mlmix-large-top4" ||
              config.id === "mlmix-large-top6"
            )) ||
            (selectedSize === "large" && (
              config.id === "large-text4" ||
              config.id === "large-text6"
            ))
          ) &&
          selectedFontColor === "#FFFFFF"
        ) ||
        // ✅ 추가: kitty sml-mix 5번(smlmix-large-bottom5) 핑크일 때 검정 강제
        (
          selectedTheme?.toLowerCase() === "kitty" &&
          selectedSize === "sml-mix" &&
          config.id === "smlmix-large-bottom5" &&
          selectedFontColor === "#F5A3B7"
        );

      el.style.color = forceBlack ? "#000000" : selectedFontColor;

      let d1 = name1;
      let d2 = name2;

      if (config.forceSingleLine && d2) {
        d1 = `${d1} ${d2}`;
        d2 = "";
      }

      // 글자수 컷 (기존 유지)
      if (selectedSize === "large" && config.area === "top") {
        if (d1.length > 12) d1 = d1.slice(0, 12);
        if (d2.length > 12) d2 = d2.slice(0, 12);
      }
      if (selectedSize === "large" && config.area === "bottom") {
        if (d1.length > 10) d1 = d1.slice(0, 14);
        if (d2.length > 10) d2 = d2.slice(0, 14);
      }

      // ✅ 두 줄이면 긴 줄 기준으로 둘 다 같이 작아지게
      const dominantLen = Math.max(d1.length, d2.length || 0);
      const scale = dominantLen >= 7 ? getGlobalScale(dominantLen) : 1;
      const effectiveTwoLines = !!d2;
      const effectiveLen = effectiveTwoLines ? dominantLen : d1.length;

      // ✅ Special override typography
      const special = getSpecialTypography({
        theme: selectedTheme,
        size: selectedSize,
        id: config.id,
        len: effectiveLen,
        twoLines: effectiveTwoLines,
      });

      if (special) {
        const fs1 = special.fs;
        const fs2 = d2 ? (special.fs2 ?? special.fs) : null;

        const lh1 = special.lh1 ?? getLineHeightPx({
          theme: selectedTheme,
          twoLines: effectiveTwoLines,
          size: selectedSize,
          area: config.area,
          fontSizePx: fs1,
        });

        const lh2 = fs2 != null
          ? (special.lh2 ?? getLineHeightPx({
            theme: selectedTheme,
            twoLines: effectiveTwoLines,
            size: selectedSize,
            area: config.area,
            fontSizePx: fs2,
          }))
          : null;

        if (special?.forceSingleLine) {
          el.innerHTML = `
            <div style="font-size:${fs1}px; line-height:${lh1}; text-align:${config.textAlign || "left"};">
              ${d1}${d2 ? " " + d2 : ""}
            </div>
          `;
          return;
        }

        el.innerHTML = `
          <div style="font-size:${fs1}px; line-height:${lh1}; text-align:${config.textAlign || "left"};">
            ${d1}
          </div>
          ${d2
            ? `<div style="font-size:${fs2}px; line-height:${lh2}; text-align:${config.textAlign || "left"};">
                ${d2}
              </div>`
            : ""
          }
        `;
        return;
      }

      const fs1 = Number(
        getLineFontSize({
          size: selectedSize,
          area: config.area,
          len: effectiveLen,
          twoLines: effectiveTwoLines,
          theme: selectedTheme,
        }) * scale
      );

      const rawFs2 = d2
        ? Number(
          getLineFontSize({
            size: selectedSize,
            area: config.area,
            len: effectiveLen,
            twoLines: effectiveTwoLines,
            theme: selectedTheme,
          }) * scale
        )
        : null;

      const fs2 = rawFs2 != null ? Math.min(rawFs2, fs1) : null;

      const lh1 = getLineHeightPx({
        theme: selectedTheme,
        twoLines: effectiveTwoLines,
        size: selectedSize,
        area: config.area,
        fontSizePx: fs1,
      });

      const lh2 = fs2 != null
        ? getLineHeightPx({
          theme: selectedTheme,
          twoLines: effectiveTwoLines,
          size: selectedSize,
          area: config.area,
          fontSizePx: fs2,
        })
        : null;

      el.innerHTML = `
        <div style="font-size:${fs1}px; line-height:${lh1}; text-align:${config.textAlign || "left"};">
          ${d1}
        </div>
        ${d2
          ? `<div style="font-size:${fs2}px; line-height:${lh2}; text-align:${config.textAlign || "left"};">
              ${d2}
            </div>`
          : ""
        }
      `;
    });
  }

  // =========================================================
  // ✅ Handlers
  // =========================================================
  function onSizeClick(btn) {
    const siblings = btn.parentElement.querySelectorAll(".size-btn");
    siblings.forEach(sib => sib.classList.remove("active"));
    btn.classList.add("active");

    selectedSize = btn.dataset.size;
    if (hiddenSize) hiddenSize.value = selectedSize;

    renderOverlays(selectedSize);
    updateOverlayText();
    updatePreview();
  }

  function onThemeClick(btn) {
    const siblings = btn.parentElement.querySelectorAll(".option-btn, .theme-btn");
    siblings.forEach(sib => sib.classList.remove("active"));
    btn.classList.add("active");

    selectedTheme = btn.dataset.theme;
    if (hiddenTheme) hiddenTheme.value = selectedTheme;

    updatePreview();
    renderOverlays(selectedSize);
    updateOverlayText();
  }

  // bind events
  root.querySelectorAll(".size-btn").forEach(btn => btn.addEventListener("click", () => onSizeClick(btn)));
  root.querySelectorAll(".theme-btn").forEach(btn => btn.addEventListener("click", () => onThemeClick(btn)));

  // font color handlers
  root.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const siblings = btn.parentElement.querySelectorAll(".color-btn");
      siblings.forEach(sib => sib.classList.remove("active"));
      btn.classList.add("active");

      selectedFontColor = btn.dataset.color;
      if (hiddenFontColor) hiddenFontColor.value = selectedFontColor;

      root.querySelectorAll(".text-overlay").forEach(text => {
        text.style.color = selectedFontColor;
        text.style.textShadow = "none";
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

  if (form) form.addEventListener("submit", e => e.preventDefault());

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
          const newItems = doc.querySelector("cart-drawer-component cart-items-component");
          const curItems = document.querySelector("cart-drawer-component cart-items-component");
          if (newItems && curItems) curItems.innerHTML = newItems.innerHTML;
        })
        .catch(err => console.error("Drawer refresh failed", err));
    }, 150);
  });

  // =========================================================
  // ✅ Initial state
  // =========================================================
  const defaultSizeBtn = root.querySelector(`.size-btn[data-size="${selectedSize}"]`);
  defaultSizeBtn?.classList.add("active");

  const defaultThemeBtn = root.querySelector(`.theme-btn[data-theme="undertheocean"]`);
  defaultThemeBtn?.classList.add("active");

  if (hiddenSize) hiddenSize.value = selectedSize;
  if (hiddenTheme) hiddenTheme.value = selectedTheme;

  updatePreview();
  renderOverlays(selectedSize);
  updateOverlayText();
}

// mount on normal page load
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('[data-section-type="customizer"]').forEach(initCustomizer);
});

// re-mount in Theme Editor
document.addEventListener("shopify:section:load", e => {
  if (e.target?.dataset?.sectionType === "customizer") initCustomizer(e.target);
});

document.addEventListener("shopify:section:select", e => {
  if (e.target?.dataset?.sectionType === "customizer") initCustomizer(e.target);
});
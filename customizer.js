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
      const fileName = `${selectedSize}-${selectedTheme}${suffix}.png`;

      // ✅ 캐시 방지 파라미터
      const newSrc = placeholderUrl.replace(/[^/]+$/, fileName) + `?v=${Date.now()}`;
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
    const leftOffsetLargeTop = 0.57;
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
    const topRows = 5, topCols = 3;
    const rowGapTop = 10.8;
    const colGapTop = 32;
    const widthTop = "200px";
    const fontSizeTop = "36px";
    const topOffsetTop = 6.7;
    const leftOffsetTop = 18;

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

    // Bottom
    const bottomRows = 3, bottomCols = 2;
    const rowGapBottom = 14.5;
    const colGapBottom = 48;
    const widthBottom = "500px";
    const fontSizeBottom = "52px";
    const topOffsetBottom = 62;
    const leftOffsetBottom = 26;

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
    let id = 1;

    // Large Top
    const topRows = 2, topCols = 3;
    const rowGapTop = 10.8;
    const colGapTop = 32.2;
    const widthTop = "200px";
    const fontSizeTop = "36px";
    const topOffsetTop = 6.5;
    const leftOffsetTop = 18;

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

    // Large Bottom
    const bottomRows = 1, bottomCols = 2;
    const rowGapBottom = 14;
    const colGapBottom = 48;
    const widthBottom = "400px";
    const fontSizeBottom = "52px";
    const topOffsetBottom = 30;
    const leftOffsetBottom = 26;

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
    const topRows = 3, topCols = 3;
    const rowGapTop = 10.4;
    const colGapTop = 32;
    const widthTop = "160px";
    const fontSizeTop = "36px";
    const topOffsetTop = 6.2;
    const leftOffsetTop = 18;

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

    // Large Bottom
    const bottomRows = 2, bottomCols = 2;
    const rowGapBottom = 14;
    const colGapBottom = 48;
    const widthBottom = "220px";
    const fontSizeBottom = "52px";
    const topOffsetBottom = 39;
    const leftOffsetBottom = 26;

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

  // =========================================================
  // ✅ Theme Overrides (DESKTOP ONLY)
  // =========================================================
  const themeOverrides = {
    dino: {
      large: {
        "large-text7": { top: "52.8%", left: "15.4%", width: "140px", fontSize: "8px" },
        "large-text8": { top: "54.5%", left: "51%", width: "140px", fontSize: "10px" },
        "large-text9": { top: "54.5%", left: "81%", width: "140px", fontSize: "10px" },
      },
      "sml-mix": {
        "smlmix-large-top2": { fontSize: "10px", top: "15.3%", left: "51%", width: "130px", textAlign: "center" },
      },
      "ml-mix": {
        "mlmix-large-top2": { fontSize: "10px", top: "15.3%", left: "51%", width: "130px", textAlign: "center" },
      },
    },
    unicorn: {
      large: {
        "large-text7": { fontSize: "6px", top: "56.2%", left: "18%", width: "130px", textAlign: "center" },
      },
    },
  };

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

  // =========================================================
  // ✅ Renderer
  // =========================================================
  function renderOverlays(size) {
    if (!overlayContainer) return;
    overlayContainer.innerHTML = "";

    const key = selectedTheme === "nameonly" ? `nameonly-${size}` : size;
    currentOverlays = (overlayConfigsBySize[key] || []).map(c => ({ ...c }));

    currentOverlays.forEach(config => {
      if (themeOverrides[selectedTheme] && themeOverrides[selectedTheme][size]) {
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

      if (selectedFontColor === "#FFFFFF") {
        text.style.textShadow = "0 0 1px #000, 0 0 1px #000";
      } else {
        text.style.textShadow = "none";
      }

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
        return byFont({ 20: 18, 18: 16, 16: 14, 14: 12, 12: 10 });
      }

      if (size === "small" && area === "bottom") {
        return byFont({ 20: 18, 18: 16, 16: 14, 14: 12 });
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
        // large-top은 top처럼 타이트하게 (-2 느낌)
        // (원하면 매핑으로 더 정확히 박아도 됨)
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
        // small-top/ small-bottom 개념이 없어서, small은 그냥 타이트하게 (-2)
        // (원하면 너가 쓰는 small 폰트 step에 맞춰 매핑도 가능)
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
          if (area === "top") return twoLines ? step(24, 22, 20, 18) : step(38, 28, 24, 22);
          if (area === "bottom") return twoLines ? step(40, 34, 28, 24) : step(48, 44, 42, 36);
        }

        if (size === "sml-mix" || size === "ml-mix") {
          if (area === "large-top") return twoLines ? step(24, 22, 20, 18) : step(38, 28, 24, 22);
          if (area === "large-bottom") return twoLines ? step(40, 34, 28, 24) : step(48, 44, 42, 36);
          if (area === "medium") return twoLines ? step(20, 18, 16, 14) : step(24, 22, 20, 18);
          if (area === "small") return twoLines ? step(18, 16, 14, 12) : step(20, 18, 16, 14);
        }
      }

      // ✅ NORMAL
      if (size === "small") {
        if (area === "bottom") return step(19, 18, 16, 16);
        return step(16, 14, 12, 11); // top
      }

      if (size === "medium") return step(22, 20, 18, 16);
      if (size === "large") {
        if (area === "top") return twoLines ? step(20, 20, 20, 18) : step(32, 28, 24, 20);
        if (area === "bottom") return twoLines ? step(36, 30, 28, 22) : step(38, 30, 28, 22);
      }

      // ✅ MIX (너가 준 sml 규칙)
      if (size === "sml-mix" || size === "ml-mix") {
        if (area === "large-top") return twoLines ? step(20, 20, 20, 18) : step(32, 28, 24, 20);
        if (area === "large-bottom") return twoLines ? step(36, 30, 28, 22) : step(38, 30, 28, 22);
        if (area === "medium") return step(22, 20, 18, 16);
        if (area === "small") return step(16, 14, 12, 11);
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
      const is = (t, s, i) => theme === t && size === s && id === i;

      // ------------------------
      // DINO - LARGE
      // ------------------------
      if (theme === "dino" && size === "large") {
        // large-text7
        if (id === "large-text7") {
          if (twoLines) {
            // 두 줄: 9글자 이하 10px lh10, 그 이상 6px lh6
            const fs = len <= 9 ? 10 : 6;
            const lh = len <= 9 ? 10 : 6;
            return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
          } else {
            // 한 줄: <=5 16px, <=7 12px, <=9 8px, 그 이상 6px
            const fs = len <= 5 ? 16 : len <= 7 ? 12 : len <= 9 ? 8 : 6;
            // 한 줄은 기존 비율로 두되, 작은 텍스트라 픽셀 라인하이트가 더 안전함
            return { fs, lh1: clampPx(Math.max(6, fs)) };
          }
        }

        // large-text8 / large-text9
        if (id === "large-text8" || id === "large-text9") {
          if (twoLines) {
            // 두 줄: 9글자 이하 14px lh12, 그 이상 10px lh8
            const fs = len <= 9 ? 14 : 10;
            const lh = len <= 9 ? 12 : 8;
            return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
          } else {
            // 한 줄: <=5 22px, <=8 16px, <=12 12px, 그 이상 10px
            const fs = len <= 5 ? 22 : len <= 8 ? 16 : len <= 12 ? 12 : 10;
            return { fs, lh1: clampPx(Math.max(8, fs - 2)) };
          }
        }
      }

      // ------------------------
      // DINO - SML/M L MIX large-top2 (smlmix-large-top2 / mlmix-large-top2)
      // ------------------------
      if (theme === "dino" && (size === "sml-mix" || size === "ml-mix")) {
        if (id === "smlmix-large-top2" || id === "mlmix-large-top2") {
          if (twoLines) {
            // 두 줄: 9글자 이하 14px lh12, 그 이상 10px lh8
            const fs = len <= 9 ? 14 : 10;
            const lh = len <= 9 ? 12 : 8;
            return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
          } else {
            // 한 줄: <=5 22px, <=8 16px, <=12 12px, 그 이상 10px
            const fs = len <= 5 ? 22 : len <= 8 ? 16 : len <= 12 ? 12 : 10;
            return { fs, lh1: clampPx(Math.max(8, fs - 2)) };
          }
        }
      }

      // ------------------------
      // UNICORN - LARGE large-text7
      // ------------------------
      if (theme === "unicorn" && size === "large" && id === "large-text7") {
        if (twoLines) {
          // 두줄: <=8 10px lh8, <=12 8px lh8, 그 이상 6px lh6
          const fs = len <= 8 ? 10 : len <= 12 ? 8 : 6;
          const lh = len <= 8 ? 8 : len <= 12 ? 8 : 6;
          return { fs, lh1: clampPx(lh), fs2: fs, lh2: clampPx(lh) };
        } else {
          // 한줄: <=5 16px, <=7 12px, <=9 10px, 그 이상 8px
          const fs = len <= 5 ? 16 : len <= 7 ? 12 : len <= 9 ? 10 : 8;
          return { fs, lh1: clampPx(Math.max(6, fs - 2)) };
        }
      }

      return null; // no special rule
    }


    currentOverlays.forEach(config => {
      const el = root.querySelector(`#${config.id}`);
      if (!el) return;

      let d1 = name1;
      let d2 = name2;

      // 글자수 컷 (기존 유지)
      if (selectedSize === "large" && config.area === "top") {
        if (d1.length > 12) d1 = d1.slice(0, 12);
        if (d2.length > 12) d2 = d2.slice(0, 12);
      }
      if (selectedSize === "large" && config.area === "bottom") {
        if (d1.length > 10) d1 = d1.slice(0, 10);
        if (d2.length > 10) d2 = d2.slice(0, 10);
      }

      // ✅ 두 줄이면 긴 줄 기준으로 둘 다 같이 작아지게
      const dominantLen = Math.max(d1.length, d2.length || 0);
      const scale = dominantLen >= 7 ? getGlobalScale(dominantLen) : 1;

      const effectiveLen = isTwoLines ? dominantLen : d1.length;

      // ✅ Special override typography (dino/unicorn specific overlays)
      const special = getSpecialTypography({
        theme: selectedTheme,
        size: selectedSize,
        id: config.id,
        len: effectiveLen,   // ✅ 두 줄일 땐 긴 줄 기준
        twoLines: isTwoLines,
      });

      if (special) {
        const fs1 = special.fs;
        const fs2 = d2 ? (special.fs2 ?? special.fs) : null;

        const lh1 = special.lh1 ?? getLineHeightPx({
          theme: selectedTheme,
          twoLines: isTwoLines,
          size: selectedSize,
          area: config.area,
          fontSizePx: fs1,
        });

        const lh2 = fs2 != null
          ? (special.lh2 ?? getLineHeightPx({
            theme: selectedTheme,
            twoLines: isTwoLines,
            size: selectedSize,
            area: config.area,
            fontSizePx: fs2,
          }))
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
        return; // ✅ 이 overlay는 예외 규칙으로 끝 (아래 일반 로직 타지 않음)
      }


      const fs1 = Number(
        getLineFontSize({
          size: selectedSize,
          area: config.area,
          len: effectiveLen,
          twoLines: isTwoLines,
          theme: selectedTheme,
        }) * scale
      );

      const rawFs2 = d2
        ? Number(
          getLineFontSize({
            size: selectedSize,
            area: config.area,
            len: effectiveLen, // ✅ 핵심: d2.length 쓰지 않음
            twoLines: isTwoLines,
            theme: selectedTheme,
          }) * scale
        )
        : null;

      // ✅ 안전장치: 2번째 줄이 1번째 줄보다 커지지 않게
      const fs2 = rawFs2 != null ? Math.min(rawFs2, fs1) : null;

      const lh1 = getLineHeightPx({
        theme: selectedTheme,
        twoLines: isTwoLines,
        size: selectedSize,
        area: config.area,
        fontSizePx: fs1,
      });

      const lh2 = fs2 != null
        ? getLineHeightPx({
          theme: selectedTheme,
          twoLines: isTwoLines,
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
        if (selectedFontColor === "#FFFFFF") {
          text.style.textShadow = "none";
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

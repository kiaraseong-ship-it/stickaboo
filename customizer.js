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

    const topRows = 6, topCols = 4;
    const bottomRows = 4, bottomCols = 3;

    const topHeight = 60;
    const bottomHeight = 33.6;

    const cellWidthTop = 96 / topCols;
    const cellWidthBottom = 96 / bottomCols;

    const spacingFactorTop = 0.80;
    const spacingFactorBottom = 0.96;

    const topOffsetTop = 2.18;
    const topOffsetBottom = 1.2;

    const leftOffsetTop = 0.85;
    const leftOffsetBottom = 0.72;

    const cellHeightTop = topHeight / topRows;
    for (let row = 0; row < topRows; row++) {
      for (let col = 0; col < topCols; col++) {
        overlays.push({
          id: `small-text${idCounter++}`,
          top: `calc(${(row * spacingFactorTop + topOffsetTop) * cellHeightTop}%)`,
          left: `${(col + leftOffsetTop) * cellWidthTop}%`,
          width: "80px",
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
          top: `${topHeight + (row * spacingFactorBottom + topOffsetBottom) * cellHeightBottom}%`,
          left: `${(col + leftOffsetBottom) * cellWidthBottom}%`,
          width: "100px",
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

    const topHeight = 24.8;
    const bottomHeight = 73;

    const cellWidthTop = 96 / topCols;
    const cellWidthBottom = 96 / bottomCols;

    const spacingFactorTop = 2.35;
    const spacingFactorBottom = 0.55;

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
    const largeBottomHeight = 28;
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
    const spacingFactorMedium = 0.72;
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
    const smallHeight = 54.9;
    const cellWidthSmall = 96 / smallCols;
    const spacingFactorSmall = 0.58;
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
    const largeTopHeight = 22;
    const cellWidthLargeTop = 96.5 / largeTopCols;
    const spacingFactorTop = 1.78;
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
    const widthTop = "160px";
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
    const widthBottom = "240px";
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
    const widthTop = "160px";
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
    const widthBottom = "220px";
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
        "smlmix-large-top2": { fontSize: "10px", top: "15%", left: "51%", width: "130px", textAlign: "center" },
      },
      "ml-mix": {
        "mlmix-large-top2": { fontSize: "10px", top: "15.2%", left: "51%", width: "130px", textAlign: "center" },
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

      // NORMAL
      if (size === "small" && area === "top") {
        // 18→16, 16→14, 14→12, 12→10
        return byFont({ 18: 16, 16: 14, 14: 12, 12: 10 });
      }
      if (size === "small" && area === "bottom") {
        // 20→18, 18→16, 16→14, 14→12
        return byFont({ 20: 18, 18: 16, 16: 14, 14: 13 });
      }
      if (size === "large" && area === "top") {
        // 24→22, 22→20, 20→18, 18→16
        return byFont({ 24: 22, 22: 20, 20: 18, 18: 16 });
      }
      if (size === "large" && area === "bottom") {
        // 너 규칙: line-height = font-size
        return fs + "px";
      }

      // MIX: sml 규칙처럼(large-bottom은 font=lh, 나머진 살짝 타이트하게 -2)
      if ((size === "sml-mix" || size === "ml-mix") && area === "large-bottom") {
        return fs + "px";
      }
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
        if (size === "medium") return step(24, 22, 20, 18);

        if (size === "large") {
          if (area === "top") return step(40, 32, 24, 18);
          if (area === "bottom") return twoLines ? step(40, 34, 28, 24) : step(48, 44, 36, 28);
        }

        if (size === "sml-mix" || size === "ml-mix") {
          if (area === "large-top") return step(40, 32, 24, 18);
          if (area === "large-bottom") return twoLines ? step(40, 34, 28, 24) : step(48, 44, 36, 28);
          if (area === "medium") return step(24, 22, 20, 18);
          if (area === "small") return step(20, 18, 16, 14);
        }
      }

      // ✅ NORMAL
      if (size === "small") {
        if (area === "bottom") return step(22, 20, 18, 16);
        return step(20, 18, 16, 14); // top
      }

      if (size === "medium") return step(22, 20, 18, 16);

      if (size === "large") {
        if (area === "top") return twoLines ? step(24, 22, 20, 18) : step(32, 28, 24, 20);
        if (area === "bottom") return step(40, 34, 28, 20);
      }

      // ✅ MIX (너가 준 sml 규칙)
      if (size === "sml-mix" || size === "ml-mix") {
        if (area === "large-top") return step(32, 28, 24, 20);
        if (area === "large-bottom") return step(40, 35, 28, 24);
        if (area === "medium") return len <= 5 ? 28 : len <= 8 ? 22 : 16;
        if (area === "small") return len <= 4 ? 22 : len <= 7 ? 18 : 12;
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

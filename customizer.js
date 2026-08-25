function initCustomizer(root) {

  if (!root) return;

  // ✅ 한글 감지 헬퍼
  function hasKorean(text) {
    return /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(text || "");
  }

  // ✅ 텍스트 실제 렌더 폭 측정 (canvas)
  function measureTextWidth(text, font) {
    const ctx =
      measureTextWidth._ctx ||
      (measureTextWidth._ctx = document.createElement("canvas").getContext("2d"));
    ctx.font = font;
    return ctx.measureText(text || "").width;
  }

  // ✅ 짝수 정수 px 헬퍼 (small/medium: 요소 높이를 짝수로 → translateY(-50%)가 정수 px)
  function evenPx(n) {
    let v = Math.max(6, Math.round(Number(n) || 0));
    if (v % 2 !== 0) v -= 1;
    return Math.max(6, v) + "px";
  }

  function toEvenLineHeight(lhValue, fontSizePx) {
    const s = String(lhValue);
    const num = parseFloat(s);
    if (!num) return lhValue;
    const px = s.includes("px") ? num : num * Number(fontSizePx);
    return evenPx(px);
  }

  // =========================================================
  // ✅ WIDTH-BASED SIZING
  //   글자수 대신 실제 렌더 폭으로 폰트 결정.
  //   max 폰트로 재서 박스 폭(config.width)을 넘치면 비례 축소 (정수 px).
  //   두 줄이면 넓은 줄 기준 → 둘 다 같은 fs.
  //
  //   ⬇️ 튜닝은 아래 표만: one = 한 줄일 때 max px, two = 두 줄일 때 max px
  //      (값 = 기존 코드에서 5글자 이하 이름에 쓰이던 값 → 짧은 이름은 그대로)
  // =========================================================
  const MIN_FS = 8;     // 아무리 길어도 이 밑으론 안 줄임
  const SIDE_PAD = 0;   // 박스 좌우 여유 필요하면 2~4

  // 일반 테마: size → area → { one, two }
  const WIDTH_SIZING = {
    small: {
      top: { one: 16, two: 16 },
      bottom: { one: 16, two: 14 },
    },
    medium: {
      top: { one: 22, two: 22 },
      bottom: { one: 20, two: 18 },
    },
    large: {
      top: { one: 34, two: 20 },
      bottom: { one: 42, two: 36 },
      "large-pet": { one: 22, two: 22 },   // puppy/kitty large에서 special 규칙 없는 칸
    },
    "sml-mix": {
      "large-top": { one: 30, two: 20 },
      "large-bottom": { one: 32, two: 36 },
      medium: { one: 22, two: 22 },
      small: { one: 16, two: 16 },
    },
    "ml-mix": {
      "large-top": { one: 30, two: 20 },
      "large-bottom": { one: 32, two: 36 },
      medium: { one: 22, two: 22 },
      small: { one: 16, two: 16 },
    },
  };

  // Name Only 테마: size → area(없으면 default) → { one, two }
  const NAMEONLY_SIZING = {
    small: { default: { one: 20, two: 20 } },
    medium: { default: { one: 22, two: 22 } },
    large: { top: { one: 48, two: 36 } },
    "sml-mix": {
      "large-top": { one: 48, two: 40 },
      medium: { one: 22, two: 22 },
      small: { one: 20, two: 18 },
    },
    "ml-mix": {
      "large-top": { one: 48, two: 40 },
      medium: { one: 22, two: 22 },
      small: { one: 20, two: 18 },
    },
  };

  // 특정 칸 전용 규칙 (dino / jesus loves / puppy / kitty)
  //   max: [desktop, mobile]  lh: fs → line-height px  min: 최소 폰트
  //   forceSingleLine: 성 있어도 한 줄로 합침
  const lhSame = fs => fs;
  const lhMinus1 = fs => fs - 1;
  const lhMinus2 = fs => Math.max(6, fs - 2);
  const lhMinus3 = fs => Math.max(6, fs - 3);

  const SPECIAL_SIZING = {
    dino: {
      large: {
        "large-text7": { one: { max: [16, 16], lh: lhSame }, two: { max: [10, 10], lh: lhSame }, min: 6 },
        "large-text8": { one: { max: [22, 22], lh: lhMinus2 }, two: { max: [14, 14], lh: lhMinus2 } },
        "large-text9": { one: { max: [22, 22], lh: lhMinus2 }, two: { max: [14, 14], lh: lhMinus2 } },
      },
      "sml-mix": {
        "smlmix-large-top2": { one: { max: [22, 22], lh: lhMinus2 }, two: { max: [14, 14], lh: lhMinus2 } },
      },
      "ml-mix": {
        "mlmix-large-top2": { one: { max: [22, 22], lh: lhMinus2 }, two: { max: [14, 14], lh: lhMinus2 } },
      },
    },

    "jesus loves": {
      large: {
        "large-text5": { one: { max: [20, 20], lh: lhSame }, two: { max: [10, 10], lh: lhSame }, min: 6 },
        "large-text6": { one: { max: [20, 20], lh: lhSame }, two: { max: [10, 10], lh: lhSame }, min: 6 },
      },
      "sml-mix": {
        "smlmix-large-top2": { one: { max: [20, 20], lh: lhSame }, two: { max: [14, 14], lh: lhMinus2 } },
      },
      "ml-mix": {
        "mlmix-large-top5": { one: { max: [20, 20], lh: lhSame }, two: { max: [10, 10], lh: lhSame }, min: 6 },
        "mlmix-large-top6": { one: { max: [20, 20], lh: lhSame }, two: { max: [10, 10], lh: lhSame }, min: 6 },
      },
    },

    puppy: {
      large: {
        "large-text1": { one: { max: [32, 24], lh: lhMinus2 }, two: { max: [20, 20], lh: lhMinus2 } },
        "large-text2": { one: { max: [32, 24], lh: lhMinus2 }, two: { max: [20, 20], lh: lhMinus2 } },
        "large-text3": { one: { max: [32, 24], lh: lhMinus2 }, two: { max: [20, 20], lh: lhMinus2 } },
        "large-text4": { one: { max: [20, 15], lh: lhMinus2 }, two: { max: [14, 10], lh: lhSame }, min: 6 },
        "large-text5": { one: { max: [32, 24], lh: lhMinus2 }, two: { max: [20, 20], lh: lhMinus2 } },
        "large-text6": { one: { max: [26, 20], lh: lhMinus2 }, two: { max: [18, 13], lh: lhSame } },
        "large-text7": { one: { max: [38, 28], lh: lhMinus2 }, two: { max: [32, 24], lh: lhSame } },   // 두 줄 lh는 아래에서 모바일 보정
        "large-text8": { one: { max: [26, 20], lh: lhMinus2 }, forceSingleLine: true },
        "large-text9": { one: { max: [20, 18], lh: lhMinus2 }, two: { max: [16, 12], lh: lhSame } },
        "large-text10": { one: { max: [22, 17], lh: lhMinus2 }, two: { max: [16, 12], lh: lhMinus2 } },
        "large-text11": { one: { max: [24, 18], lh: lhMinus2 }, two: { max: [16, 12], lh: lhSame } },
        "large-text12": { one: { max: [38, 28], lh: lhMinus2 }, two: { max: [32, 18], lh: lhMinus3 } },
      },
      "sml-mix": {
        "smlmix-large-top4": { one: { max: [20, 15], lh: lhMinus2 }, two: { max: [14, 10], lh: lhSame }, min: 6 },
        "smlmix-large-bottom4": { one: { max: [26, 20], lh: lhMinus2 }, forceSingleLine: true },
        "smlmix-large-bottom5": { one: { max: [22, 17], lh: lhMinus2 }, two: { max: [16, 12], lh: lhMinus2 } },
      },
      "ml-mix": {
        "mlmix-large-top4": { one: { max: [20, 15], lh: lhMinus2 }, two: { max: [14, 10], lh: lhSame }, min: 6 },
        "mlmix-large-top6": { one: { max: [26, 20], lh: lhMinus2 }, two: { max: [18, 13], lh: lhSame } },
        "mlmix-large-bottom7": { one: { max: [20, 18], lh: lhMinus2 }, two: { max: [16, 12], lh: lhSame } },
        "mlmix-large-bottom8": { one: { max: [22, 17], lh: lhMinus2 }, two: { max: [16, 12], lh: lhMinus2 } },
      },
    },

    kitty: {
      large: {
        "large-text4": { one: { max: [20, 15], lh: lhMinus2 }, two: { max: [14, 10], lh: lhSame }, min: 6 },
        "large-text6": { one: { max: [24, 20], lh: lhMinus2 }, two: { max: [18, 13], lh: lhSame } },
        "large-text7": { one: { max: [38, 28], lh: lhMinus2 }, two: { max: [32, 24], lh: lhSame } },
        "large-text9": { one: { max: [20, 18], lh: lhMinus2 }, two: { max: [16, 12], lh: lhSame } },
      },
      "sml-mix": {
        "smlmix-large-top4": { one: { max: [20, 15], lh: lhMinus2 }, two: { max: [14, 10], lh: lhSame }, min: 6 },
        "smlmix-large-bottom5": { one: { max: [26, 16], lh: lhMinus2 }, two: { max: [16, 12], lh: lhMinus1 } },
      },
      "ml-mix": {
        "mlmix-large-top1": { one: { max: [32, 24], lh: lhMinus2 }, two: { max: [20, 20], lh: lhMinus2 } },
        "mlmix-large-top2": { one: { max: [32, 24], lh: lhMinus2 }, two: { max: [20, 20], lh: lhMinus2 } },
        "mlmix-large-top3": { one: { max: [32, 24], lh: lhMinus2 }, two: { max: [20, 20], lh: lhMinus2 } },
        "mlmix-large-top4": { one: { max: [20, 15], lh: lhMinus2 }, two: { max: [14, 10], lh: lhSame }, min: 6 },
        "mlmix-large-top5": { one: { max: [32, 24], lh: lhMinus2 }, two: { max: [20, 20], lh: lhMinus2 } },
        "mlmix-large-top6": { one: { max: [24, 20], lh: lhMinus2 }, two: { max: [18, 13], lh: lhSame } },
        "mlmix-large-bottom7": { one: { max: [20, 18], lh: lhMinus2 }, two: { max: [16, 12], lh: lhSame } },
        "mlmix-large-bottom8": { one: { max: [26, 16], lh: lhMinus2 }, two: { max: [16, 12], lh: lhMinus1 } },
      },
    },
  };
  // puppy large-text7 두 줄 lh: 데스크탑 fs, 모바일 fs-2 (기존 규칙)
  SPECIAL_SIZING.puppy.large["large-text7"].two.lh = fs => (isMobile ? fs - 2 : fs);

  // max 폰트 기준으로 폭 재서 넘치면 비례 축소
  function fitFontSize({ text1, text2, maxFs, minFs, maxW, family }) {
    const font = `900 ${maxFs}px ${family}`;
    const w1 = measureTextWidth(text1, font);
    const w2 = text2 ? measureTextWidth(text2, font) : 0;
    const widest = Math.max(w1, w2);
    if (maxW <= 0 || widest <= maxW) return maxFs;
    return Math.max(minFs, Math.floor((maxFs * maxW) / widest));
  }

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
    let id = 1;
    const cols = 4;

    // ----- TOP (8줄) — 배경 없음 -----
    const topRows = 8;
    const topHeight = 64.6;
    const cellWidth = 96.5 / cols;               // 24
    const cellHeightTop = topHeight / topRows;
    const topOffset = 0.68;
    const leftOffset = 0.845;                   // ← 아이콘과 이름 간격(키우면 오른쪽으로)

    for (let r = 0; r < topRows; r++) {
      for (let c = 0; c < cols; c++) {
        overlays.push({
          id: `small-text${id++}`,
          top: `${(r + topOffset) * cellHeightTop}%`,
          left: `${(c + leftOffset) * cellWidth}%`,
          width: "85px",
          textAlign: "left",
          area: "top",
        });
      }
    }

    // ----- BOTTOM (4줄) — 뱃지(배경) 있음 -----
    const bottomRows = 4;
    const bottomHeight = 32.5;
    const cellWidthBottom = 96 / cols;   // ⬅️ bottom 전용 가로 폭 (top과 독립적으로 조절 가능)
    const cellHeightBottom = bottomHeight / bottomRows;
    const bottomOffset = 0.65;
    const leftOffsetBottom = 0.865;

    for (let r = 0; r < bottomRows; r++) {
      for (let c = 0; c < cols; c++) {
        overlays.push({
          id: `small-text${id++}`,
          top: `${topHeight + (r + bottomOffset) * cellHeightBottom}%`,
          left: `${(c + leftOffsetBottom) * cellWidthBottom}%`,
          width: "90px",
          textAlign: "left",
          area: "bottom",
        });
      }
    }
    return overlays;
  }

  function generateMediumOverlays() {
    const overlays = [];
    let id = 1;
    const cols = 3;

    // ----- TOP (6줄) -----
    const topRows = 6;
    const topHeight = 58.5;
    const cellWidth = 96 / cols;               // 32
    const cellHeightTop = topHeight / topRows;
    const topOffset = 0.65;
    const leftOffset = 0.76;

    for (let r = 0; r < topRows; r++) {
      for (let c = 0; c < cols; c++) {
        overlays.push({
          id: `medium-text${id++}`,
          top: `${(r + topOffset) * cellHeightTop}%`,
          left: `${(c + leftOffset) * cellWidth}%`,
          width: "100px",
          textAlign: "left",
          area: "top",
        });
      }
    }

    // ----- BOTTOM (4줄) -----
    const bottomRows = 4;
    const bottomHeight = 38.7;
    const cellHeightBottom = bottomHeight / bottomRows;
    const bottomOffset = 0.62;
    const leftOffsetBottom = 0.76;

    for (let r = 0; r < bottomRows; r++) {
      for (let c = 0; c < cols; c++) {
        overlays.push({
          id: `medium-text${id++}`,
          top: `${topHeight + (r + bottomOffset) * cellHeightBottom}%`,
          left: `${(c + leftOffsetBottom) * cellWidth}%`,
          width: "105px",
          textAlign: "left",
          area: "bottom",
        });
      }
    }
    return overlays;
  }

  function generateLargeOverlays() {
    const overlays = [];
    let id = 1;

    // ----- TOP (2줄 × 3칸) — 아이콘 아래 이름(가운데) -----
    const topRows = 2, topCols = 3;
    const topHeight = 39;
    const cellWidthTop = 96 / topCols;         // 32
    const cellHeightTop = topHeight / topRows;
    const spacingFactorTop = 1.0;
    const topOffsetTop = 0.85;                  // ← 아이콘 바로 아래. 이 값으로 위아래 조정
    const leftOffsetTop = 0.56;

    for (let row = 0; row < topRows; row++) {
      for (let col = 0; col < topCols; col++) {
        overlays.push({
          id: `large-text${id++}`,
          top: `${(row * spacingFactorTop + topOffsetTop) * cellHeightTop}%`,
          left: `${(col + leftOffsetTop) * cellWidthTop}%`,
          width: "120px",
          textAlign: "center",
          area: "top",
        });
      }
    }

    // ----- BOTTOM (3줄 × 2칸) — 아이콘 오른쪽 이름 -----
    const bottomRows = 3, bottomCols = 2;
    const bottomHeight = 58;
    const cellWidthBottom = 96 / bottomCols;   // 48
    const cellHeightBottom = bottomHeight / bottomRows;
    const spacingFactorBottom = 1.0;
    const topOffsetBottom = 0.55;
    const leftOffsetBottom = 0.76;

    for (let row = 0; row < bottomRows; row++) {
      for (let col = 0; col < bottomCols; col++) {
        overlays.push({
          id: `large-text${id++}`,
          top: `${topHeight + (row * spacingFactorBottom + topOffsetBottom) * cellHeightBottom}%`,
          left: `${(col + leftOffsetBottom) * cellWidthBottom}%`,
          width: "140px",
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
    const topOffsetTop = 1.55;
    const leftOffsetTop = 0.58;
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
          "large-text7": { top: "50.3%", left: "21.5%", width: "120px", fontSize: "9px", textAlign: "center", },
          "large-text8": { top: "52%", left: "55.5%", width: "120px", fontSize: "9px", textAlign: "center", },
          "large-text9": { top: "52%", left: "87%", width: "120px", fontSize: "9px", textAlign: "center", },
          "large-text10": { top: "XX%", left: "XX%", width: "140px", fontSize: "10px", textAlign: "center" },
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
          "mlmix-large-top6": { top: "25.5%", left: "82%", width: "140px", fontSize: "10px", textAlign: "center" },
          "mlmix-large-bottom7": { top: "50%", left: "26%", width: "140px", fontSize: "10px", textAlign: "center" },
          "mlmix-large-bottom8": { top: "49%", left: "74%", width: "140px", fontSize: "10px", textAlign: "center" },
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
          "large-text7": { top: "52.8%", left: "15.5%", width: "140px", fontSize: "10px", textAlign: "center", },
          "large-text8": { top: "54.5%", left: "51%", width: "140px", fontSize: "10px", textAlign: "center", },
          "large-text9": { top: "54.5%", left: "81%", width: "140px", fontSize: "10px", textAlign: "center", },
          // "large-text10": { top: "68.5%", left: "36.5%", width: "140px", fontSize: "10px", textAlign: "left" },
          // "large-text11": { top: "68.5%", left: "84.5%", width: "140px", fontSize: "10px", textAlign: "left" },
          // "large-text12": { top: "88.5%", left: "36.5%", width: "140px", fontSize: "10px", textAlign: "left" },
          // "large-text13": { top: "88.5%", left: "84.5%", width: "140px", fontSize: "10px", textAlign: "left" },
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
          "mlmix-large-top6": { top: "26%", left: "83%", width: "140px", fontSize: "10px", textAlign: "center" },
          "mlmix-large-bottom7": { top: "52.5%", left: "27.5%", width: "140px", fontSize: "10px", textAlign: "center" },
          "mlmix-large-bottom8": { top: "52.5%", left: "72.5%", width: "140px", fontSize: "10px", textAlign: "center" },
        },
      },
      kitty: {
        "sml-mix": {
          "smlmix-large-bottom4": { fontSize: "10px", top: "27.8%", left: "36%", width: "130px", textAlign: "left" },
          "smlmix-large-bottom5": { fontSize: "10px", top: "29%", left: "76%", width: "130px", textAlign: "center" },
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

  function generateLargeDinoOverlays() {
    const overlays = [];
    let id = 1;

    // ----- TOP (3×3 = 9개) -----
    const topRows = 3, topCols = 3;
    const topHeight = 58;
    const cellWidthTop = 97 / topCols;
    const cellHeightTop = topHeight / topRows;
    const topOffsetTop = 0.85;
    const leftOffsetTop = 0.52;

    for (let row = 0; row < topRows; row++) {
      for (let col = 0; col < topCols; col++) {
        overlays.push({
          id: `large-text${id++}`,
          top: `${(row + topOffsetTop) * cellHeightTop}%`,
          left: `${(col + leftOffsetTop) * cellWidthTop}%`,
          width: "120px",
          textAlign: "center",
          area: "top",
        });
      }
    }

    // ----- BOTTOM (2×2 = 4개) -----
    const bottomRows = 2, bottomCols = 2;
    const bottomHeight = 40;
    const cellWidthBottom = 96 / bottomCols;
    const cellHeightBottom = bottomHeight / bottomRows;
    const bottomOffset = 0.55;
    const leftOffsetBottom = 0.76;

    for (let row = 0; row < bottomRows; row++) {
      for (let col = 0; col < bottomCols; col++) {
        overlays.push({
          id: `large-text${id++}`,   // text10~13
          top: `${topHeight + (row + bottomOffset) * cellHeightBottom}%`,
          left: `${(col + leftOffsetBottom) * cellWidthBottom}%`,
          width: "140px",
          textAlign: "left",
          area: "bottom",
        });
      }
    }
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
      if (size === "large") return generateLargePetOverlays(theme);
      if (size === "sml-mix") return generateSmlMixOverlays();
      if (size === "ml-mix") return generateMlMixOverlays();
    }

    // ✅ dino large만 예외
    if (themeKey === "dino" && size === "large") {
      return generateLargeDinoOverlays();
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
  // ✅ Line-height logic (폰트 크기 기준 — 그대로)
  // =========================================================
  function getLineHeightPxRaw({ theme, size, area, twoLines, fontSizePx }) {
    const fs = Math.round(Number(fontSizePx));

    const byFont = (map, fallback = null) => {
      if (map[fs] != null) return map[fs] + "px";
      if (fallback) return fallback(fs);
      return Math.max(10, fs - 2) + "px";
    };

    // ✅ 2줄
    if (twoLines) {
      if (theme === "nameonly") {
        return Math.max(10, fs - 2) + "px";
      }

      if (size === "small") {
        return Math.max(10, Math.round(fs * 0.9)) + "px";
      }

      if (size === "medium") {
        return Math.max(10, Math.round(fs * 0.9)) + "px";
      }

      if (size === "large" && area === "top") {
        return byFont({ 24: 22, 22: 20, 20: 18, 18: 16 });
      }

      if (size === "large" && area === "bottom") {
        return Math.max(10, fs - 2) + "px";
      }

      if ((size === "sml-mix" || size === "ml-mix") && area === "large-top") {
        return Math.max(10, fs - 1) + "px";
      }

      if ((size === "sml-mix" || size === "ml-mix") && area === "large-bottom") {
        return Math.max(10, fs - 2) + "px";
      }

      if ((size === "sml-mix" || size === "ml-mix") && area === "medium") {
        return Math.max(10, fs - 2) + "px";
      }

      if ((size === "sml-mix" || size === "ml-mix") && area === "small") {
        return Math.max(10, fs - 2) + "px";
      }

      return Math.max(10, fs - 2) + "px";
    }

    // ✅ 1줄
    if (area === "large-bottom") return "1.05";
    return "1.1";
  }

  // ✅ small/medium은 line-height를 짝수 px로 정규화 (두 줄 top은 높이가 2×lh라 제외)
  function getLineHeightPx(args) {
    const raw = getLineHeightPxRaw(args);
    const smallMedium = args.size === "small" || args.size === "medium";
    if (!smallMedium) return raw;
    if (args.area !== "bottom" && args.twoLines) return raw;
    return toEvenLineHeight(raw, args.fontSizePx);
  }

  function shouldForceBlack(config) {
    return (
      (
        selectedTheme?.toLowerCase() === "dino" &&
        (
          (selectedSize === "large" && (
            config.id === "large-text7" ||
            config.id === "large-text8" ||
            config.id === "large-text9"
          )) ||
          ((selectedSize === "sml-mix" || selectedSize === "ml-mix") && (
            config.id === "smlmix-large-top2" ||
            config.id === "mlmix-large-top2"
          ))
        ) &&
        selectedFontColor === "#FFFFFF"
      ) ||
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
      (
        selectedTheme?.toLowerCase() === "kitty" &&
        selectedSize === "sml-mix" &&
        config.id === "smlmix-large-bottom5" &&
        selectedFontColor === "#F5A3B7"
      ) ||
      (
        selectedTheme?.toLowerCase() === "puppy" &&
        selectedSize === "sml-mix" &&
        (config.id === "smlmix-large-bottom4" || config.id === "smlmix-large-bottom5") &&
        selectedFontColor === "#F5A3B7"
      ) ||
      (
        (selectedSize === "small" || selectedSize === "medium") &&
        config.area === "bottom" &&
        selectedFontColor === "#FFFFFF"
      )
    );
  }

  // =========================================================
  // ✅ Text update — 폰트는 전부 width 기준
  // =========================================================
  function updateOverlayText() {
    if (isCharacter) return;

    const first = (firstNameInput?.value || "").trim();
    const last = (lastNameInput?.value || "").trim();
    const name1 = first || "Your name";
    const name2 = last || "";
    const themeKey = selectedTheme?.toLowerCase();

    // 이 칸에 적용할 규칙 찾기
    function getSizingRule(config, twoLines) {
      // 1) 특정 칸 전용 규칙
      const special = SPECIAL_SIZING[themeKey]?.[selectedSize]?.[config.id];
      if (special) {
        const rule = (twoLines && special.two) ? special.two : special.one;
        return {
          maxFs: rule.max[isMobile ? 1 : 0],
          minFs: special.min ?? 6,
          lh: rule.lh,
          forceSingleLine: !!special.forceSingleLine,
        };
      }

      // 2) 일반 / nameonly 표
      const table = selectedTheme === "nameonly" ? NAMEONLY_SIZING : WIDTH_SIZING;
      const bySize = table[selectedSize] || {};
      const entry = bySize[config.area] || bySize.default;
      if (!entry) return { maxFs: 22, minFs: MIN_FS };
      return { maxFs: twoLines ? entry.two : entry.one, minFs: MIN_FS };
    }

    currentOverlays.forEach(config => {
      const el = root.querySelector(`#${config.id}`);
      if (!el) return;

      let d1 = name1;
      let d2 = name2;

      // 성 있어도 한 줄로 합치는 칸
      const preRule = getSizingRule(config, !!d2);
      if ((config.forceSingleLine || preRule.forceSingleLine) && d2) {
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

      const twoLines = !!d2;
      const rule = getSizingRule(config, twoLines);

      // ✅ width 기준 폰트 결정 (두 줄이면 넓은 줄 기준, 둘 다 같은 fs)
      const maxW = (parseFloat(config.width) || 0) - SIDE_PAD;
      const family = getComputedStyle(el).fontFamily || "sans-serif";
      const fs = fitFontSize({
        text1: d1,
        text2: d2,
        maxFs: rule.maxFs,
        minFs: rule.minFs,
        maxW,
        family,
      });

      // line-height: 특정 칸 규칙 있으면 그걸로, 없으면 기존 로직
      let lh = rule.lh
        ? `${Math.max(1, Math.round(rule.lh(fs)))}px`
        : getLineHeightPx({
          theme: selectedTheme,
          twoLines,
          size: selectedSize,
          area: config.area,
          fontSizePx: fs,
        });

      const fw = hasKorean(d1) || hasKorean(d2) ? "900" : "900";
      const align = config.textAlign || "left";

      el.innerHTML = `
          <div style="font-size:${fs}px; line-height:${lh}; text-align:${align}; font-weight:${fw};">
            ${d1}
          </div>
          ${d2
          ? `<div style="font-size:${fs}px; line-height:${lh}; text-align:${align}; font-weight:${fw};">
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

      currentOverlays.forEach(config => {
        const text = root.querySelector(`#${config.id}`);
        if (!text) return;
        const forceBlack = shouldForceBlack(config);
        text.style.color = forceBlack ? "#000000" : selectedFontColor;
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

  // ✅ 웹폰트 로드 완료 후 폭 재측정 (fallback 폰트로 잰 값 보정)
  if (document.fonts?.ready) document.fonts.ready.then(updateOverlayText);
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
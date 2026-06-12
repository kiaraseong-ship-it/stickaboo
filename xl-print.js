(function () {
  'use strict';

  /* ─── PREVIEW CONFIG ─── */
  var PX_PER_INCH = 72;
  var RULER_LEFT   = 28;
  var RULER_BOTTOM = 22;

  var SIZE_CONFIG = {
    '4-inch': { labelW: 4, labelH: 1.2, cols: 4, rows: 6 },
    '5-inch': { labelW: 5, labelH: 1.5, cols: 3, rows: 5 },
    '6-inch': { labelW: 6, labelH: 1.8, cols: 2, rows: 4 }
  };

  /* ─── COLOR MAP ─── */
  var COLOR_MAP = {
    black: '#000000', white: '#ffffff', navy: '#1a2e5a',
    blue:  '#4db8e8', green: '#2d6e3e', pink: '#f4a7c3', brown: '#8b5e3c'
  };

  /* ─── FONT MAP ─── */
  var FONT_WEIGHT = {
    'Poppins ExtraBold': '800',
    'Quicksand Bold':    '700'
  };

  var FONT_MAP = {
    'Nunito':           "'Nunito', sans-serif",
    'Cloudsofa':        "'Cloudsofa', cursive",
    'Genty':            "'Baloo 2', cursive",
    'Fredoka':          "'Fredoka One', cursive",
    'Baloo 2':          "'Baloo 2', cursive",
    'Poppins ExtraBold':"'Poppins', sans-serif",
    'Bubblegum Sans':   "'Bubblegum Sans', cursive",
    'Quicksand Bold':   "'Quicksand', sans-serif",
    'Chewy':            "'Chewy', cursive",
    'Cooper Black':     "'Cooper Black', serif",
    'Balsamiq Sans':    "'Balsamiq Sans', cursive",
    'BMJUA':            "'Jua', sans-serif",
    'Comic Sans':       "'Comic Sans MS', cursive",
    'Cursive':          "'Dancing Script', cursive",
    'Poppins Bold':     "'Poppins', sans-serif",
    'Josefin Sans':     "'Josefin Sans', sans-serif",
    'Paytone One':      "'Paytone One', cursive",
    'Titan One':        "'Titan One', cursive",
    'Lilita One':       "'Lilita One', cursive",
    'Sacramento':       "'Sacramento', cursive",
    'Great Vibes':      "'Great Vibes', cursive",
    'Pacifico':         "'Pacifico', cursive",
    'Satisfy':          "'Satisfy', cursive",
    'Yellowtail':       "'Yellowtail', cursive",
    'Comfortaa':        "'Comfortaa', cursive"
  };

  var FONT_WEIGHT = {
    'Poppins ExtraBold': '800',
    'Poppins Bold':      '700',
    'Quicksand Bold':    '700',
    'Josefin Sans':      '700'
  };

  /* ─── STATE ─── */
  var state = {
    size:       '4-inch',
    themeImg:   null,
    nameOnly:   false,
    firstName:  'Your name',
    lastName:   '',
    color:      '#000000',
    fontFamily: "'Nunito', sans-serif",
    fontWeight: '700'
  };

  /* ══════════════════════════════════════
     PREVIEW RENDER — single label
  ══════════════════════════════════════ */
  function renderPreview() {
    var cfg   = SIZE_CONFIG[state.size];

    /* Single label dimensions */
    var labelW = cfg.labelW * PX_PER_INCH;
    var labelH = cfg.labelH * PX_PER_INCH;

    var mobile   = typeof isMobile === 'function' && isMobile();
    var totalW   = mobile ? labelW : labelW + RULER_LEFT;
    var totalH   = mobile ? labelH : labelH + RULER_BOTTOM;

    /* Show/hide rulers */
    var xAxis = document.getElementById('xl-ruler-x-axis');
    var yAxis = document.getElementById('xl-ruler-y-axis');
    if (xAxis) xAxis.style.display = mobile ? 'none' : '';
    if (yAxis) yAxis.style.display = mobile ? 'none' : '';

    /* Outer wrap */
    var wrap = document.getElementById('xl-preview-wrap');
    wrap.style.width  = totalW + 'px';
    wrap.style.height = totalH + 'px';

    /* Canvas */
    var cv = document.getElementById('xl-label-canvas');
    cv.style.left         = mobile ? '0' : RULER_LEFT + 'px';
    cv.style.top          = '0';
    cv.style.borderRadius = mobile ? '14px' : '0';
    cv.style.border = mobile ? '2px solid #b8d8f0' : 'none';
    cv.style.border       = mobile ? '1.5px solid #33AEFF' : 'none';
    cv.width  = labelW;
    cv.height = labelH;
    var ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, labelW, labelH);

    /* Mobile: subtle rounded background */
    if (mobile) {
      ctx.fillStyle = '#f0f7ff';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(0, 0, labelW, labelH, 14);
      } else {
        ctx.rect(0, 0, labelW, labelH);
      }
      ctx.fill();
    }

    /* Grid div — single cell */
    var grid = document.getElementById('xl-label-grid');
    grid.style.left     = mobile ? '0' : RULER_LEFT + 'px';
    grid.style.top      = '0';
    grid.style.width    = labelW + 'px';
    grid.style.height   = labelH + 'px';
    grid.style.overflow = 'visible';
    grid.innerHTML      = '';

    var firstName = state.firstName || 'Your name';
    var lastName  = state.lastName  || '';
    var hasTwo    = lastName.length > 0;

    /* Icon: smaller when two lines to leave more vertical room */
    var iconSize  = Math.round(labelH * (hasTwo ? 0.55 : 0.62));

    /* ── Font size lookup tables ── */
    /* Lookup tables: 1-char steps, strictly decreasing, per-size scaled */
    var SINGLE = {
      '4-inch': function(n){
        return n <= 1  ? 80
             : n === 2 ? 76
             : n === 3 ? 70
             : n === 4 ? 64
             : n === 5 ? 58
             : n === 6 ? 52
             : n === 7 ? 47
             : n === 8 ? 43
             : n === 9 ? 39
             : n === 10? 36
             : n === 11? 33
             : n === 12? 30
             : n === 13? 27
             : n === 14? 25
             :           23;
      },
      '5-inch': function(n){
        return n <= 1  ? 100
             : n === 2 ? 95
             : n === 3 ? 88
             : n === 4 ? 80
             : n === 5 ? 72
             : n === 6 ? 65
             : n === 7 ? 59
             : n === 8 ? 54
             : n === 9 ? 49
             : n === 10? 45
             : n === 11? 41
             : n === 12? 38
             : n === 13? 34
             : n === 14? 31
             :           29;
      },
      '6-inch': function(n){
        return n <= 1  ? 120
             : n === 2 ? 114
             : n === 3 ? 105
             : n === 4 ? 96
             : n === 5 ? 86
             : n === 6 ? 78
             : n === 7 ? 70
             : n === 8 ? 64
             : n === 9 ? 58
             : n === 10? 53
             : n === 11? 49
             : n === 12? 45
             : n === 13? 41
             : n === 14? 38
             :           35;
      }
    };
    var TWO_LINE1 = {
      '4-inch': function(n){
        return n <= 1  ? 64
             : n === 2 ? 60
             : n === 3 ? 56
             : n === 4 ? 52
             : n === 5 ? 48
             : n === 6 ? 44
             : n === 7 ? 40
             : n === 8 ? 37
             : n === 9 ? 34
             : n === 10? 31
             : n === 11? 28
             : n === 12? 26
             : n === 13? 24
             : n === 14? 22
             :           20;
      },
      '5-inch': function(n){
        return n <= 1  ? 80
             : n === 2 ? 75
             : n === 3 ? 70
             : n === 4 ? 65
             : n === 5 ? 60
             : n === 6 ? 55
             : n === 7 ? 50
             : n === 8 ? 46
             : n === 9 ? 42
             : n === 10? 39
             : n === 11? 36
             : n === 12? 33
             : n === 13? 30
             : n === 14? 27
             :           25;
      },
      '6-inch': function(n){
        return n <= 1  ? 96
             : n === 2 ? 90
             : n === 3 ? 84
             : n === 4 ? 78
             : n === 5 ? 72
             : n === 6 ? 66
             : n === 7 ? 60
             : n === 8 ? 55
             : n === 9 ? 50
             : n === 10? 46
             : n === 11? 43
             : n === 12? 40
             : n === 13? 37
             : n === 14? 34
             :           31;
      }
    };
    var TWO_LINE2 = {
      '4-inch': function(n){
        return n <= 1  ? 44
             : n === 2 ? 42
             : n === 3 ? 40
             : n === 4 ? 37
             : n === 5 ? 34
             : n === 6 ? 31
             : n === 7 ? 28
             : n === 8 ? 26
             : n === 9 ? 24
             : n === 10? 22
             : n === 11? 20
             : n === 12? 18
             : n === 13? 17
             : n === 14? 16
             :           15;
      },
      '5-inch': function(n){
        return n <= 1  ? 54
             : n === 2 ? 52
             : n === 3 ? 50
             : n === 4 ? 46
             : n === 5 ? 42
             : n === 6 ? 38
             : n === 7 ? 35
             : n === 8 ? 32
             : n === 9 ? 30
             : n === 10? 27
             : n === 11? 25
             : n === 12? 23
             : n === 13? 21
             : n === 14? 20
             :           18;
      },
      '6-inch': function(n){
        return n <= 1  ? 64
             : n === 2 ? 62
             : n === 3 ? 58
             : n === 4 ? 54
             : n === 5 ? 50
             : n === 6 ? 46
             : n === 7 ? 42
             : n === 8 ? 38
             : n === 9 ? 35
             : n === 10? 32
             : n === 11? 30
             : n === 12? 28
             : n === 13? 26
             : n === 14? 24
             :           22;
      }
    };

    /* Available dimensions */
    var hPad   = PX_PER_INCH * 0.1;
    var availW = labelW - (state.nameOnly ? 0 : iconSize) - Math.round(labelH * 0.1) - hPad * 2;
    var availH = labelH - hPad * 2;

    /* Per-font char width ratios (empirical) */
    var FONT_RATIO = {
      "'Nunito', sans-serif":       0.64,
      "'Cloudsofa', cursive":        0.60,
      "'Baloo 2', cursive":         0.68,
      "'Fredoka One', cursive":     0.66,
      "'Poppins', sans-serif":      0.64,
      "'Bubblegum Sans', cursive":  0.68,
      "'Quicksand', sans-serif":    0.62,
      "'Chewy', cursive":           0.70,
      "'Cooper Black', serif":      0.74,
      "'Balsamiq Sans', cursive":   0.66,
      "'Jua', sans-serif":          0.68,
      "'Comic Sans MS', cursive":   0.66,
      "'Dancing Script', cursive":  0.64,
      "'Josefin Sans', sans-serif": 0.62,
      "'Paytone One', cursive":     0.70,
      "'Titan One', cursive":       0.72,
      "'Lilita One', cursive":      0.70,
      "'Sacramento', cursive":      0.62,
      "'Great Vibes', cursive":     0.62,
      "'Pacifico', cursive":        0.74,
      "'Satisfy', cursive":         0.66,
      "'Yellowtail', cursive":      0.68,
      "'Comfortaa', cursive":        0.62
    };
    var cRatio = FONT_RATIO[state.fontFamily] || 0.62;
    var sRatio = cRatio * 0.45; /* space is ~45% of a normal char */

    /* Non-space char count for lookup (spaces don't count as real chars) */
    function nonSpaceLen(text) {
      return text.replace(/\s/g, '').length;
    }

    /* Estimate real pixel width accounting for spaces separately */
    function estimateWidth(text, fontSize) {
      var chars  = text.replace(/\s/g, '').length;
      var spaces = text.length - chars;
      return fontSize * (chars * cRatio + spaces * sRatio);
    }

    /* Fit: loop shrink until text fits inside availW */
    function fitFontSize(text, startSize, minSize) {
      var fs = startSize;
      while (fs > minSize) {
        var w = estimateWidth(text, fs);
        if (w <= availW) break;
        fs = Math.max(minSize, Math.floor(fs * availW / w) - 1);
      }
      return fs;
    }

    var fontSizeLine1, fontSizeLine2;
    if (!hasTwo) {
      fontSizeLine1 = fitFontSize(firstName, SINGLE[state.size](nonSpaceLen(firstName)), 14);
    } else {
      fontSizeLine1 = fitFontSize(firstName, TWO_LINE1[state.size](nonSpaceLen(firstName)), 12);
      fontSizeLine2 = fitFontSize(lastName,  TWO_LINE2[state.size](nonSpaceLen(lastName)),  10);

      /* line2 must not exceed line1 font size — but never shrink it just because line1 is wider */
      fontSizeLine2 = Math.min(fontSizeLine2, fontSizeLine1);
      fontSizeLine2 = Math.max(10, fontSizeLine2);

      /* Vertical cap */
      var totalH = fontSizeLine1 * 1.1 + fontSizeLine2 * 1.1;
      if (totalH > availH) {
        var vScale    = availH / totalH;
        fontSizeLine1 = Math.max(12, Math.floor(fontSizeLine1 * vScale));
        fontSizeLine2 = Math.max(10, Math.floor(fontSizeLine2 * vScale));
      }
    }


    /* Single label cell */
    var cell = document.createElement('div');
    cell.className            = 'xl-label-cell';
    cell.style.left           = '0';
    cell.style.top            = '0';
    cell.style.width          = labelW + 'px';
    cell.style.height         = labelH + 'px';
    cell.style.flexDirection  = 'row';
    cell.style.justifyContent = 'center';
    cell.style.alignItems     = 'center';
    cell.style.gap            = Math.round(labelH * 0.1) + 'px';
    cell.style.padding        = Math.round(PX_PER_INCH * 0.1) + 'px';
    cell.style.boxSizing      = 'border-box';
    cell.style.border         = 'none';
    cell.style.overflow       = 'visible';
    cell.style.borderRadius   = '0';
    cell.style.background     = '#fff';

    /* Icon wrapper */
    var iconWrap = document.createElement('div');
    iconWrap.style.cssText = 'flex-shrink:0;width:' + iconSize + 'px;height:' + iconSize + 'px;display:flex;align-items:center;justify-content:center;';

    if (state.themeImg && !state.nameOnly) {
      var img = document.createElement('img');
      img.src             = state.themeImg;
      img.style.width     = iconSize + 'px';
      img.style.height    = iconSize + 'px';
      img.style.objectFit = 'contain';
      img.alt             = '';
      iconWrap.appendChild(img);
    }
    if (!state.nameOnly) cell.appendChild(iconWrap);

    /* Text column — stacks first name + last name vertically */
    var textCol = document.createElement('div');
    textCol.style.cssText = 'flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:0px;overflow-x:hidden;overflow-y:visible;';

    /* First name line */
    var line1 = document.createElement('span');
    line1.textContent        = firstName;
    line1.style.fontSize     = fontSizeLine1 + 'px';
    line1.style.color      = state.color;
    line1.style.textShadow = state.color === '#ffffff' ? '-1px -1px 0 #999, 1px -1px 0 #999, -1px 1px 0 #999, 1px 1px 0 #999' : 'none';
    line1.style.fontFamily   = state.fontFamily;
    line1.style.fontWeight   = state.fontWeight || '700';
    line1.style.whiteSpace   = 'nowrap';
    line1.style.overflow     = 'hidden';
    line1.style.textOverflow = 'ellipsis';
    line1.style.maxWidth     = '100%';
    line1.style.lineHeight   = '1.1';
    textCol.appendChild(line1);

    /* Last name line — only shown when lastName has content */
    if (lastName) {
      var line2 = document.createElement('span');
      line2.textContent        = lastName;
      line2.style.fontSize     = fontSizeLine2 + 'px';
      line2.style.color      = state.color;
      line2.style.textShadow = state.color === '#ffffff' ? '-1px -1px 0 #999, 1px -1px 0 #999, -1px 1px 0 #999, 1px 1px 0 #999' : 'none';
      line2.style.fontFamily   = state.fontFamily;
      line2.style.fontWeight   = state.fontWeight || '700';
      line2.style.whiteSpace   = 'nowrap';
      line2.style.overflow     = 'hidden';
      line2.style.textOverflow = 'ellipsis';
      line2.style.maxWidth     = '100%';
      line2.style.lineHeight   = '1.1';
      line2.style.marginTop    = '-0.15em';
      line2.style.paddingBottom = '0.1em';
      textCol.appendChild(line2);
    }

    cell.appendChild(textCol);
    grid.appendChild(cell);

    renderRulers(labelW, labelH, cfg);
  }


  function renderRulers(labelW, labelH, cfg) {
    /* X ruler — 0 to label width in inches */
    var xAxis = document.getElementById('xl-ruler-x-axis');
    xAxis.innerHTML      = '';
    xAxis.style.position = 'absolute';
    xAxis.style.left     = RULER_LEFT + 'px';
    xAxis.style.top      = labelH + 'px';
    xAxis.style.width    = labelW + 'px';
    xAxis.style.height   = RULER_BOTTOM + 'px';

    for (var ix = 0; ix <= cfg.labelW; ix++) {
      var tx = document.createElement('span');
      tx.className   = 'tick-x';
      tx.textContent = ix;
      tx.style.left  = (ix * PX_PER_INCH - 3) + 'px';
      tx.style.top   = '4px';
      xAxis.appendChild(tx);
    }
    var xLabel = document.createElement('span');
    xLabel.textContent   = '0 (inch)';
    xLabel.style.cssText = 'position:absolute;left:-24px;top:4px;font-size:9px;color:#999;';
    xAxis.appendChild(xLabel);

    /* Y ruler — 0 to label height in inches */
    var yAxis = document.getElementById('xl-ruler-y-axis');
    yAxis.innerHTML      = '';
    yAxis.style.position = 'absolute';
    yAxis.style.left     = '0';
    yAxis.style.top      = '0';
    yAxis.style.width    = RULER_LEFT + 'px';
    yAxis.style.height   = labelH + 'px';

    var steps = 4;
    for (var iy = 0; iy <= steps; iy++) {
      var ty = document.createElement('span');
      ty.className   = 'tick-y';
      ty.textContent = (cfg.labelH - iy * (cfg.labelH / steps)).toFixed(1).replace('.0', '');
      ty.style.right = '4px';
      ty.style.top   = (iy * (labelH / steps) - 6) + 'px';
      yAxis.appendChild(ty);
    }
  }


  /* ══════════════════════════════════════
     SECTION 1: SIZE
  ══════════════════════════════════════ */
  document.querySelectorAll('.xl-size-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.xl-size-btn').forEach(function (b) { b.classList.remove('xl-active'); });
      btn.classList.add('xl-active');
      state.size = btn.dataset.size;
      document.getElementById('xl-hidden-size').value = state.size;

      /* Update form variant ID so correct price is charged */
      var variantId = btn.dataset.variantId;
      if (variantId) {
        var formVariant = document.getElementById('xl-form-variant-id');
        if (formVariant) formVariant.value = variantId;
      }

      renderPreview();
    });
  });

  /* Set initial variant ID from first xl-active size button */
  (function () {
    var activeSize = document.querySelector('.xl-size-btn.xl-active');
    if (activeSize && activeSize.dataset.variantId) {
      var formVariant = document.getElementById('xl-form-variant-id');
      if (formVariant) formVariant.value = activeSize.dataset.variantId;
    }
  })();

  /* ══════════════════════════════════════
     SECTION 2: CATEGORY FILTER + DESIGN
  ══════════════════════════════════════ */
  var allThemeBtns = document.querySelectorAll('.xl-theme-btn');

  function filterCategory(cat) {
    allThemeBtns.forEach(function (btn) {
      if (btn.dataset.category === cat) {
        btn.classList.remove('xl-hidden');
      } else {
        btn.classList.add('xl-hidden');
      }
    });
    if (typeof window._resetThemeCarousel === 'function') {
      setTimeout(window._resetThemeCarousel, 10);
    }
    /* Auto-select first image in this category */
    allThemeBtns.forEach(function (b) { b.classList.remove('xl-active'); });
    var firstBtn = document.querySelector('.xl-theme-btn[data-category="' + cat + '"]');
    if (firstBtn) {
      firstBtn.classList.add('xl-active');
      document.getElementById('xl-hidden-design').value = firstBtn.dataset.theme;
      var img = firstBtn.querySelector('img');
      state.themeImg = img ? img.src : null;
      state.nameOnly = firstBtn.dataset.noIcon === 'true';
      renderPreview();
    }
  }

  document.querySelectorAll('.xl-category-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.xl-category-btn').forEach(function (b) { b.classList.remove('xl-active'); });
      btn.classList.add('xl-active');
      filterCategory(btn.dataset.category);
    });
  });

  allThemeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      allThemeBtns.forEach(function (b) { b.classList.remove('xl-active'); });
      btn.classList.add('xl-active');
      document.getElementById('xl-hidden-design').value = btn.dataset.theme;
      var img = btn.querySelector('img');
      state.themeImg = img ? img.src : null;
      state.nameOnly = btn.dataset.noIcon === 'true';
      renderPreview();
    });
  });

  /* ══════════════════════════════════════
     SECTION 3: NAME TEXT
  ══════════════════════════════════════ */
  function updateCharCount(inputEl, countEl) {
    var len   = inputEl.value.length;
    var max   = parseInt(inputEl.getAttribute('maxlength')) || 15;
    countEl.textContent = len + '/' + max;
    countEl.classList.remove('warn', 'limit');
    if (len >= max)          countEl.classList.add('limit');
    else if (len >= max - 3) countEl.classList.add('warn');
  }

  function onNameInput() {
    var first = (document.getElementById('xl-first-name') || {}).value || '';
    var last  = (document.getElementById('xl-last-name')  || {}).value || '';
    state.firstName = first.trim() || 'Your name';
    state.lastName  = last.trim();

    var fnCount = document.getElementById('xl-first-name-count');
    var lnCount = document.getElementById('xl-last-name-count');
    if (fnCount) updateCharCount(document.getElementById('xl-first-name'), fnCount);
    if (lnCount) updateCharCount(document.getElementById('xl-last-name'),  lnCount);

    renderPreview();
  }
  var fnEl = document.getElementById('xl-first-name');
  var lnEl = document.getElementById('xl-last-name');
  if (fnEl) fnEl.addEventListener('input', onNameInput);
  if (lnEl) lnEl.addEventListener('input', onNameInput);

  /* ══════════════════════════════════════
     SECTION 4: FONT COLOR
  ══════════════════════════════════════ */
  document.querySelectorAll('.xl-color-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.xl-color-btn').forEach(function (b) { b.classList.remove('xl-active'); });
      btn.classList.add('xl-active');
      var c = btn.dataset.color;
      state.color = COLOR_MAP[c] || c;
      document.getElementById('xl-hidden-font-color').value = c;
      renderPreview();
    });
  });

  /* ══════════════════════════════════════
     SECTION 5: FONT STYLE
  ══════════════════════════════════════ */
  document.querySelectorAll('.xl-font-style-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.xl-font-style-btn').forEach(function (b) { b.classList.remove('xl-active'); });
      btn.classList.add('xl-active');
      var f = btn.dataset.font;
      state.fontFamily = FONT_MAP[f] || f;
      state.fontWeight = FONT_WEIGHT[f] || '700';
      document.getElementById('xl-hidden-font-style').value = f;
      /* Expose hook for any external overlay system */
      if (typeof window.updateOverlayFont === 'function') {
        window.updateOverlayFont(state.fontFamily);
      }
      renderPreview();
    });
  });


  function isMobile() { return window.innerWidth <= 600; }

  /* Mobile preview — separate DOM element, no rulers */
  function renderMobilePreview() {
    var cfg    = SIZE_CONFIG[state.size];
    var mPrev  = document.getElementById('xl-mobile-preview');
    var col    = document.querySelector('.xl-preview-col');
    if (!col) return;

    /* Create mobile preview container if not exists */
    if (!mPrev) {
      mPrev = document.createElement('div');
      mPrev.id = 'xl-mobile-preview';
      col.appendChild(mPrev);
    }

    /* Size: 90vw wide, height proportional */
    var W = window.innerWidth * 0.90;
    var H = W * (cfg.labelH / cfg.labelW);

    mPrev.style.cssText = [
      'width:' + W + 'px',
      'height:' + H + 'px',
      'border-radius:12px',
      'border:2px solid #33AEFF',
      'background:#ffffff',
      'position:relative',
      'overflow:visible',
      'box-shadow:0 4px 16px rgba(51,174,255,0.15)'
    ].join(';');

    /* Re-render label contents inside mobile preview */
    mPrev.innerHTML = '';

    var firstName = state.firstName || 'Your name';
    var lastName  = state.lastName  || '';
    var hasTwo    = lastName.length > 0;
    var iconSize  = Math.round(H * (hasTwo ? 0.55 : 0.62));
    var hPad      = W * 0.05;
    var gap       = W * 0.04;
    var availW    = W - iconSize - gap - hPad * 2;

    /* Scale font sizes proportionally to mobile preview */
    var scale     = W / (cfg.labelW * PX_PER_INCH);
    var FONT_RATIO = { "'Nunito', sans-serif":0.64,"'Cloudsofa', cursive":0.60,"'Baloo 2', cursive":0.68,"'Fredoka One', cursive":0.66,"'Poppins', sans-serif":0.64,"'Bubblegum Sans', cursive":0.68,"'Quicksand', sans-serif":0.62,"'Chewy', cursive":0.70,"'Cooper Black', serif":0.74,"'Balsamiq Sans', cursive":0.66,"'Jua', sans-serif":0.68,"'Comic Sans MS', cursive":0.66,"'Dancing Script', cursive":0.64,"'Josefin Sans', sans-serif":0.62,"'Paytone One', cursive":0.70,"'Titan One', cursive":0.72,"'Lilita One', cursive":0.70,"'Sacramento', cursive":0.62,"'Great Vibes', cursive":0.62,"'Pacifico', cursive":0.74,"'Satisfy', cursive":0.66,"'Yellowtail', cursive":0.68,"'Comfortaa', cursive":0.62 };
    var cRatio = FONT_RATIO[state.fontFamily] || 0.62;

    function estW(text, fs) {
      var chars = text.replace(/\s/g,'').length;
      var spaces = text.length - chars;
      return fs * (chars * cRatio + spaces * cRatio * 0.45);
    }
    function fitFs(text, start, min) {
      var fs = start;
      while (fs > min && estW(text, fs) > availW) fs--;
      return fs;
    }

    /* Both lines same font size — shrink together based on longer text */
    var baseFs = !hasTwo ? Math.round(H * 0.54) : Math.round(H * 0.40);
    var longerText = (firstName.length >= (lastName || '').length) ? firstName : lastName;
    var fs1 = fitFs(longerText, baseFs, 10);
    var fs2 = hasTwo ? fs1 : 0;

    /* Row container */
    var row = document.createElement('div');
    row.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:row;align-items:center;padding:0 ' + hPad + 'px;gap:' + gap + 'px;';

    /* Icon */
    if (!state.nameOnly) {
      var iconWrap = document.createElement('div');
      iconWrap.style.cssText = 'flex-shrink:0;width:' + iconSize + 'px;height:' + iconSize + 'px;display:flex;align-items:center;justify-content:center;';
      if (state.themeImg) {
        var img = document.createElement('img');
        img.src = state.themeImg;
        img.style.cssText = 'width:' + iconSize + 'px;height:' + iconSize + 'px;object-fit:contain;';
        iconWrap.appendChild(img);
      }
      row.appendChild(iconWrap);
    }

    /* Text */
    var textCol = document.createElement('div');
    textCol.style.cssText = 'flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;overflow:visible;';

    var line1 = document.createElement('span');
    line1.textContent = firstName;
    line1.style.cssText = 'font-size:' + fs1 + 'px;font-family:' + state.fontFamily + ';font-weight:' + (state.fontWeight||'700') + ';color:' + state.color + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;line-height:0.8;overflow:visible;';
    if (state.color === '#ffffff') line1.style.textShadow = '-1px -1px 0 #999,1px -1px 0 #999,-1px 1px 0 #999,1px 1px 0 #999';
    textCol.appendChild(line1);

    if (hasTwo && lastName) {
      var line2 = document.createElement('span');
      line2.textContent = lastName;
      line2.style.cssText = 'font-size:' + fs2 + 'px;font-family:' + state.fontFamily + ';font-weight:' + (state.fontWeight||'700') + ';color:' + state.color + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;line-height:0.8;overflow:visible;';
      if (state.color === '#ffffff') line2.style.textShadow = '-1px -1px 0 #999,1px -1px 0 #999,-1px 1px 0 #999,1px 1px 0 #999';
      textCol.appendChild(line2);
    }

    row.appendChild(textCol);
    mPrev.appendChild(row);

    /* Size guide */
    var guide = document.getElementById('xl-mobile-size-guide');
    if (!guide) {
      guide = document.createElement('div');
      guide.id = 'xl-mobile-size-guide';
      guide.style.cssText = 'text-align:center;font-size:12px;color:#aab8c2;margin-top:8px;font-family:Helvetica Neue,sans-serif;letter-spacing:0.5px;';
      col.appendChild(guide);
    }
    guide.textContent = cfg.labelW + '" × ' + cfg.labelH + '"';
  }

  /* Scale preview to fit column */
  function scalePreview() {
    var col    = document.querySelector('.xl-preview-col');
    var scaler = document.getElementById('xl-preview-scaler');
    if (!col || !scaler) return;

    if (isMobile()) {
      /* Hide desktop ruler preview */
      scaler.style.display = 'none';
      renderMobilePreview();
      return;
    }

    /* Desktop: show ruler preview, hide mobile preview */
    scaler.style.display = '';
    var mPrev = document.getElementById('xl-mobile-preview');
    if (mPrev) mPrev.style.display = 'none';
    var guide = document.getElementById('xl-mobile-size-guide');
    if (guide) guide.style.display = 'none';

    var cfg      = SIZE_CONFIG[state.size];
    var naturalW = cfg.labelW * PX_PER_INCH + RULER_LEFT;
    var naturalH = cfg.labelH * PX_PER_INCH + RULER_BOTTOM;
    var colW     = col.getBoundingClientRect().width;
    if (colW === 0) return;

    var scale = colW / naturalW;
    scaler.style.transform       = 'scale(' + scale + ')';
    scaler.style.transformOrigin = 'top left';
    col.style.height = Math.round(naturalH * scale) + 'px';
  }

  /* ══════════════════════════════════════
     SWIPE HELPER
  ══════════════════════════════════════ */
  /* Smooth drag swipe — follows finger in real time */
  function addSwipe(el, getOffset, setOffset, getMax) {
    var startX   = 0;
    var startOff = 0;
    var track    = el.querySelector('[id]') || el.firstElementChild;

    el.addEventListener('touchstart', function(e) {
      startX   = e.touches[0].clientX;
      startOff = getOffset();
      /* Disable transition while dragging */
      if (track) track.style.transition = 'none';
    }, { passive: true });

    el.addEventListener('touchmove', function(e) {
      var dx  = startX - e.touches[0].clientX;
      var off = Math.max(0, Math.min(getMax(), startOff + dx));
      setOffset(off);
    }, { passive: true });

    el.addEventListener('touchend', function(e) {
      /* Re-enable transition for snap */
      if (track) track.style.transition = 'transform 0.3s ease';
      /* Snap to nearest position */
      var off = getOffset();
      setOffset(Math.max(0, Math.min(getMax(), off)));
    }, { passive: true });
  }

  /* ══════════════════════════════════════
     FONT CAROUSEL
  ══════════════════════════════════════ */
  (function () {
    var track     = document.getElementById('xl-font-track');
    var outer     = document.querySelector('.xl-font-carousel-track-outer');
    var prevBtn   = document.getElementById('xl-font-prev');
    var nextBtn   = document.getElementById('xl-font-next');
    if (!track || !prevBtn || !nextBtn) return;

    var COLS_VISIBLE = window.innerWidth <= 600 ? 3 : 4;
    var CARD_W       = 88;
    var current      = 0;
    var total        = track.querySelectorAll('.xl-font-style-btn').length;
    var totalCols    = Math.ceil(total / 2);
    var maxIndex     = Math.max(0, totalCols - COLS_VISIBLE);

    function updateCarousel() {
      track.style.transform = 'translateX(-' + (current * CARD_W) + 'px)';
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current >= maxIndex;
    }

    prevBtn.addEventListener('click', function () {
      if (current > 0) { current--; updateCarousel(); }
    });

    nextBtn.addEventListener('click', function () {
      if (current < maxIndex) { current++; updateCarousel(); }
    });

    var _fontOffset = 0;
    function getFontOffset() { return _fontOffset; }
    function setFontOffset(v) {
      _fontOffset = v;
      track.style.transform = 'translateX(-' + v + 'px)';
      prevBtn.disabled = v <= 0;
      nextBtn.disabled = v >= maxIndex * CARD_W;
    }
    function getFontMax() { return maxIndex * CARD_W; }

    /* Sync arrow buttons with pixel offset */
    prevBtn.removeEventListener('click', prevBtn._handler);
    nextBtn.removeEventListener('click', nextBtn._handler);
    prevBtn._handler = function() {
      _fontOffset = Math.max(0, _fontOffset - CARD_W);
      track.style.transition = 'transform 0.3s ease';
      setFontOffset(_fontOffset);
    };
    nextBtn._handler = function() {
      _fontOffset = Math.min(getFontMax(), _fontOffset + CARD_W);
      track.style.transition = 'transform 0.3s ease';
      setFontOffset(_fontOffset);
    };
    prevBtn.addEventListener('click', prevBtn._handler);
    nextBtn.addEventListener('click', nextBtn._handler);

    if (outer) addSwipe(outer, getFontOffset, setFontOffset, getFontMax);

    updateCarousel();
  })();

  /* ══════════════════════════════════════
     QUANTITY + FORM SYNC
  ══════════════════════════════════════ */
  (function () {
    var qty      = 1;
    var qtyVal   = document.getElementById('xl-qty-value');
    var qtyInput = document.getElementById('xl-form-quantity');

    document.getElementById('xl-qty-minus').addEventListener('click', function () {
      if (qty > 1) { qty--; qtyVal.textContent = qty; qtyInput.value = qty; }
    });
    document.getElementById('xl-qty-plus').addEventListener('click', function () {
      qty++; qtyVal.textContent = qty; qtyInput.value = qty;
    });

    /* Intercept the Add to Cart BUTTON CLICK directly before any form submit */
    var addBtn = document.querySelector('#xl-custom-product-form .xl-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        var variantId = document.getElementById('xl-form-variant-id').value;
        var qty       = parseInt(document.getElementById('xl-form-quantity').value) || 1;

        var items = [{
          id: parseInt(variantId),
          quantity: qty,
          properties: {
            'First Name': state.firstName === 'Your name' ? '' : state.firstName,
            'Last Name':  state.lastName,
            'Size':       state.size,
            'Design':     document.getElementById('xl-hidden-design').value,
            'Font Color': document.getElementById('xl-hidden-font-color').value,
            'Font Style': document.getElementById('xl-hidden-font-style').value
          }
        }];

        var res = await fetch('/cart/add.js', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ items: items })
        });

        if (!res.ok) {
          alert('Error adding to cart');
          return;
        }

        /* Open drawer — exact same as Name Label theme */
        var drawer = document.querySelector('cart-drawer-component');
        if (drawer && typeof drawer.open === 'function') {
          drawer.open();
        } else {
          document.querySelector('[aria-label="Cart"]')?.click();
        }

        /* Refresh drawer contents */
        setTimeout(function() {
          fetch(window.location.href)
            .then(function(r) { return r.text(); })
            .then(function(html) {
              var doc = new DOMParser().parseFromString(html, 'text/html');
              var newItems = doc.querySelector('cart-drawer-component cart-items-component');
              var curItems = document.querySelector('cart-drawer-component cart-items-component');
              if (newItems && curItems) curItems.innerHTML = newItems.innerHTML;
            })
            .catch(function(err) { console.error('Drawer refresh failed', err); });
        }, 150);

      }, true); /* capture phase */
    }
  })();

  /* ══════════════════════════════════════
     THEME CAROUSEL
  ══════════════════════════════════════ */
  (function () {
    var track    = document.getElementById('xl-theme-options');
    var prevBtn  = document.getElementById('xl-theme-prev');
    var nextBtn  = document.getElementById('xl-theme-next');
    if (!track || !prevBtn || !nextBtn) return;

    var COLS_VISIBLE = window.innerWidth <= 600 ? 3 : 5;
    var CARD_W       = window.innerWidth <= 400 ? 58 : 62;
    var current      = 0;

    function getVisibleBtns() {
      return Array.from(track.querySelectorAll('.xl-theme-btn:not(.xl-hidden)'));
    }

    function updateThemeCarousel() {
      var btns     = getVisibleBtns();
      var totalCols = Math.ceil(btns.length / 2);
      var maxIndex  = Math.max(0, totalCols - COLS_VISIBLE);
      current = Math.min(current, maxIndex);
      track.style.transform = 'translateX(-' + (current * CARD_W) + 'px)';
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current >= maxIndex;
    }

    prevBtn.addEventListener('click', function () {
      if (current > 0) { current--; updateThemeCarousel(); }
    });

    nextBtn.addEventListener('click', function () {
      var btns     = getVisibleBtns();
      var totalCols = Math.ceil(btns.length / 2);
      var maxIndex  = Math.max(0, totalCols - COLS_VISIBLE);
      if (current < maxIndex) { current++; updateThemeCarousel(); }
    });

    /* Reset is handled by the category filter below via window._updateThemeCarousel */

    var themeOuter = document.querySelector('.xl-theme-carousel-outer');
    var _themeOffset = 0;

    function getThemeOffset() { return _themeOffset; }
    function setThemeOffset(v) {
      _themeOffset = v;
      track.style.transform = 'translateX(-' + v + 'px)';
      var btns = getVisibleBtns();
      var maxIdx = Math.max(0, Math.ceil(btns.length / 2) - COLS_VISIBLE);
      prevBtn.disabled = v <= 0;
      nextBtn.disabled = v >= maxIdx * CARD_W;
    }
    function getThemeMax() {
      var btns = getVisibleBtns();
      var maxIdx = Math.max(0, Math.ceil(btns.length / 2) - COLS_VISIBLE);
      return maxIdx * CARD_W;
    }

    if (themeOuter) addSwipe(themeOuter, getThemeOffset, setThemeOffset, getThemeMax);

    window._updateThemeCarousel = updateThemeCarousel;
    window._resetThemeCarousel = function() {
      current = 0;
      updateThemeCarousel();
    };
    updateThemeCarousel();
  })();

  /* ══════════════════════════════════════
     CATEGORY CAROUSEL
  ══════════════════════════════════════ */
  (function () {
    var nav     = document.getElementById('xl-category-nav');
    var prevBtn = document.getElementById('xl-cat-prev');
    var nextBtn = document.getElementById('xl-cat-next');
    if (!nav || !prevBtn || !nextBtn) return;

    var current  = 0;
    var STEP     = 90; /* px per scroll step */

    function getMaxScroll() {
      var outer = nav.parentElement;
      return Math.max(0, nav.scrollWidth - outer.offsetWidth);
    }

    function updateCarousel() {
      var max = getMaxScroll();
      current = Math.max(0, Math.min(current, max));
      nav.style.transform = 'translateX(-' + current + 'px)';
      prevBtn.disabled = current <= 0;
      nextBtn.disabled = current >= max;
    }

    prevBtn.addEventListener('click', function () {
      current = Math.max(0, current - STEP);
      updateCarousel();
    });

    nextBtn.addEventListener('click', function () {
      current = Math.min(getMaxScroll(), current + STEP);
      updateCarousel();
    });

    var catOuter = document.querySelector('.xl-category-carousel-outer');
    var _catOffset = 0;

    function getCatOffset() { return _catOffset; }
    function setCatOffset(v) {
      _catOffset = v;
      nav.style.transform = 'translateX(-' + v + 'px)';
      prevBtn.disabled = v <= 0;
      nextBtn.disabled = v >= getMaxScroll();
    }

    if (catOuter) addSwipe(catOuter, getCatOffset, setCatOffset, getMaxScroll);

    updateCarousel();
  })();

  /* INIT — select ocean category and auto-select first image */
  filterCategory('ocean');
  renderPreview();
  setTimeout(scalePreview, 60);
  window.addEventListener('resize', function() {
    scalePreview();
    /* Re-render preview on orientation change */
    if (typeof renderPreview === 'function') renderPreview();
  });

  /* Re-scale after every render */
  (function () {
    var orig = renderPreview;
    renderPreview = function () {
      orig();
      setTimeout(function() {
        scalePreview();
        if (isMobile()) renderMobilePreview();
      }, 20);
    };
  })();

})();

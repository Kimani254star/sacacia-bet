/* Acacia Appearance - Theme, colour, font and text size, same as Acacia Stock Count.
   Used by Acacia Rides and Acacia Bet. Settings are saved on this device (localStorage "acxst_look"). */
(function () {
  'use strict';
  var APP = (document.currentScript && document.currentScript.getAttribute('data-app')) || 'app';
  var KEY = 'acxst_look';
  var DEFAULT_ACCENT = APP === 'bet' ? '#F2A93B' : '#16a34a';
  var ACCENTS = { app: DEFAULT_ACCENT, blue: '#1e3a8a', green: '#166534', purple: '#6d28d9', teal: '#0f766e', red: '#b91c1c', slate: '#334155' };
  var ACCENT_NAMES = { app: 'Default', blue: 'Blue', green: 'Green', purple: 'Purple', teal: 'Teal', red: 'Red', slate: 'Slate' };
  var FONTS = {"cambria": ["Cambria", "Cambria,Georgia,serif"], "arial": ["Arial", "Arial,Helvetica,sans-serif"], "roboto": ["Roboto", "Roboto,Arial,sans-serif"], "open-sans": ["Open Sans", "\"Open Sans\",Arial,sans-serif"], "lato": ["Lato", "Lato,Arial,sans-serif"], "inter": ["Inter", "Inter,Arial,sans-serif"], "poppins": ["Poppins", "Poppins,Arial,sans-serif"], "montserrat": ["Montserrat", "Montserrat,Arial,sans-serif"], "nunito": ["Nunito", "Nunito,Arial,sans-serif"], "raleway": ["Raleway", "Raleway,Arial,sans-serif"], "georgia": ["Georgia", "Georgia,serif"], "garamond": ["Garamond", "Garamond,\"Times New Roman\",serif"], "times-new-roman": ["Times New Roman", "\"Times New Roman\",serif"], "calibri": ["Calibri", "Calibri,Arial,sans-serif"], "aptos": ["Aptos", "Aptos,Calibri,Arial,sans-serif"], "segoe-ui": ["Segoe UI", "\"Segoe UI\",Arial,sans-serif"], "verdana": ["Verdana", "Verdana,sans-serif"], "tahoma": ["Tahoma", "Tahoma,sans-serif"], "trebuchet": ["Trebuchet MS", "\"Trebuchet MS\",Arial,sans-serif"], "palatino": ["Palatino Linotype", "\"Palatino Linotype\",Palatino,serif"], "baskerville": ["Baskerville", "Baskerville,\"Times New Roman\",serif"], "merriweather": ["Merriweather", "Merriweather,Georgia,serif"], "playfair": ["Playfair Display", "\"Playfair Display\",Georgia,serif"], "libre-baskerville": ["Libre Baskerville", "\"Libre Baskerville\",Georgia,serif"], "source-sans": ["Source Sans 3", "\"Source Sans 3\",Arial,sans-serif"], "ibm-plex": ["IBM Plex Sans", "\"IBM Plex Sans\",Arial,sans-serif"], "ubuntu": ["Ubuntu", "Ubuntu,Arial,sans-serif"], "fira-sans": ["Fira Sans", "\"Fira Sans\",Arial,sans-serif"], "work-sans": ["Work Sans", "\"Work Sans\",Arial,sans-serif"], "dm-sans": ["DM Sans", "\"DM Sans\",Arial,sans-serif"], "manrope": ["Manrope", "Manrope,Arial,sans-serif"], "rubik": ["Rubik", "Rubik,Arial,sans-serif"], "mulish": ["Mulish", "Mulish,Arial,sans-serif"], "quicksand": ["Quicksand", "Quicksand,Arial,sans-serif"], "cabin": ["Cabin", "Cabin,Arial,sans-serif"], "pt-sans": ["PT Sans", "\"PT Sans\",Arial,sans-serif"], "noto-sans": ["Noto Sans", "\"Noto Sans\",Arial,sans-serif"], "oswald": ["Oswald", "Oswald,Arial,sans-serif"], "roboto-slab": ["Roboto Slab", "\"Roboto Slab\",Georgia,serif"], "bitter": ["Bitter", "Bitter,Georgia,serif"], "libre-franklin": ["Libre Franklin", "\"Libre Franklin\",Arial,sans-serif"], "karla": ["Karla", "Karla,Arial,sans-serif"], "archivo": ["Archivo", "Archivo,Arial,sans-serif"], "public-sans": ["Public Sans", "\"Public Sans\",Arial,sans-serif"], "figtree": ["Figtree", "Figtree,Arial,sans-serif"], "plus-jakarta": ["Plus Jakarta Sans", "\"Plus Jakarta Sans\",Arial,sans-serif"], "sora": ["Sora", "Sora,Arial,sans-serif"], "urbanist": ["Urbanist", "Urbanist,Arial,sans-serif"], "outfit": ["Outfit", "Outfit,Arial,sans-serif"], "lexend": ["Lexend", "Lexend,Arial,sans-serif"], "spectral": ["Spectral", "Spectral,Georgia,serif"], "cormorant": ["Cormorant Garamond", "\"Cormorant Garamond\",Georgia,serif"], "crimson-text": ["Crimson Text", "\"Crimson Text\",Georgia,serif"], "lora": ["Lora", "Lora,Georgia,serif"], "eb-garamond": ["EB Garamond", "\"EB Garamond\",Georgia,serif"], "arvo": ["Arvo", "Arvo,Georgia,serif"], "zilla-slab": ["Zilla Slab", "\"Zilla Slab\",Georgia,serif"], "inconsolata": ["Inconsolata", "Inconsolata,monospace"], "space-grotesk": ["Space Grotesk", "\"Space Grotesk\",Arial,sans-serif"], "exo-2": ["Exo 2", "\"Exo 2\",Arial,sans-serif"]};
  var SYSTEM = { cambria: 1, arial: 1, georgia: 1, garamond: 1, verdana: 1, tahoma: 1, trebuchet: 1, times: 1, courier: 1, helvetica: 1, calibri: 1 };
  var SIZES = { s: 0.9, m: 1, l: 1.1 };
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function lget() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function lset(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/(.)/g, '$1$1'); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function mix(a, b, t) { var A = hex2rgb(a), B = hex2rgb(b); return 'rgb(' + A.map(function (v, i) { return Math.round(v * t + B[i] * (1 - t)); }).join(',') + ')'; }

  function resolved(L) { return L.theme === 'dark' ? 'dark' : L.theme === 'light' ? 'light' : (mq && mq.matches ? 'dark' : 'light'); }

  var fontLink = null;
  function loadFont(k) {
    if (SYSTEM[k] || !FONTS[k]) return;
    var id = 'acx-font-' + k; if (document.getElementById(id)) return;
    var l = document.createElement('link'); l.id = id; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(FONTS[k][0]).replace(/%20/g, '+') + ':wght@400;500;600;700&display=swap';
    (document.head || root).appendChild(l);
  }

  var applying = false;
  function apply() {
    var L = lget(), th = resolved(L), s = root.style;
    applying = true;
    root.setAttribute('data-acx-theme', th);
    root.setAttribute('data-theme', th); /* keeps the older dark-mode rules in step */
    root.style.colorScheme = th;
    var hex = ACCENTS[L.accent];
    if (hex && L.accent !== 'app') {
      var dark = th === 'dark';
      root.setAttribute('data-acx-accent', L.accent);
      s.setProperty('--acx-pri', hex);
      s.setProperty('--acx-pri-dk', mix(hex, '#000000', 0.75));
      s.setProperty('--acx-pri-lt', mix(hex, '#ffffff', 0.75));
      s.setProperty('--acx-pri-xd', mix(hex, '#000000', 0.2));
      s.setProperty('--acx-t1', dark ? mix(hex, '#0b1020', 0.14) : mix(hex, '#ffffff', 0.07));
      s.setProperty('--acx-t2', dark ? mix(hex, '#0b1020', 0.2) : mix(hex, '#ffffff', 0.14));
      s.setProperty('--acx-t3', dark ? mix(hex, '#0b1020', 0.28) : mix(hex, '#ffffff', 0.27));
    } else {
      root.removeAttribute('data-acx-accent');
      ['--acx-pri', '--acx-pri-dk', '--acx-pri-lt', '--acx-pri-xd', '--acx-t1', '--acx-t2', '--acx-t3'].forEach(function (p) { s.removeProperty(p); });
    }
    var f = FONTS[L.font];
    if (f && L.font !== 'cambria') { loadFont(L.font); root.setAttribute('data-acx-font', L.font); s.setProperty('--acx-font', f[1]); }
    else { root.removeAttribute('data-acx-font'); s.removeProperty('--acx-font'); }
    var z = SIZES[L.size] || 1;
    if (z === 1) s.removeProperty('zoom'); else s.setProperty('zoom', String(z));
    var m = document.querySelector('meta[name=theme-color]');
    if (m) { if (!m.getAttribute('data-acx-orig')) m.setAttribute('data-acx-orig', m.getAttribute('content') || ''); m.setAttribute('content', hex && L.accent !== 'app' ? hex : (m.getAttribute('data-acx-orig') || DEFAULT_ACCENT)); }
    applying = false;
  }

  var CSS = '' +
  /* --- the look of the site in dark mode (Stock's dark palette) --- */
  'html[data-acx-theme=dark] body{--bg:#0b1020!important;--bg-rgb:11,16,32!important;--bg-alt:#101830!important;--surface:#151b2e!important;--surface-alt:#1b2340!important;--text:#e5e7eb!important;--text-rgb:229,231,235!important;--line:rgba(229,231,235,.14)!important;--mint:#4fd1a5!important;--coral:#ff6b52!important}' +
  'html[data-acx-theme=dark] body.page-index{background:#0b1020!important;color:#e5e7eb!important}' +
  /* --- chosen colour: Bet uses --gold, Rides uses green --- */
  'html[data-acx-accent] body{--gold:var(--acx-pri)!important;--gold-dim:var(--acx-pri-dk)!important}' +
  'html[data-acx-accent] .btn-gold,html[data-acx-accent] .btn-gold *{color:#fff!important}' +
  /* --- chosen font (icons keep their own font) --- */
  'html[data-acx-font] body,html[data-acx-font] body *:not(i):not(svg):not(svg *):not([class*="fa-"]):not(.fa):not(.fas):not(.far):not(.fab):not(.material-icons):not(code):not(pre){font-family:var(--acx-font)!important}' +
  /* --- the panel, styled like Stock's Appearance screen --- */
  '#acx-root{--c-bg:#f3f4f6;--c-card:#fff;--c-ink:#111827;--c-mute:#6b7280;--c-line:#e5e7eb;--c-pri:#1e3a8a;--c-pri2:#1d4ed8}' +
  'html[data-acx-theme=dark] #acx-root{--c-bg:#0b1020;--c-card:#151b2e;--c-ink:#e5e7eb;--c-mute:#9ca3af;--c-line:#27304a;--c-pri:#3b5bdb;--c-pri2:#5c7cfa}' +
  '#acx-root,#acx-root *{box-sizing:border-box}' +
  '#acx-fab{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:2147482000;width:46px;height:46px;border-radius:50%;border:1px solid var(--c-line);background:var(--c-card);color:var(--c-ink);font-size:21px;line-height:1;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.2)}' +
  '#acx-scrim{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2147482500;display:none}#acx-scrim.on{display:block}' +
  '#acx-panel{position:fixed;top:0;right:0;bottom:0;width:380px;max-width:100%;background:var(--c-bg);color:var(--c-ink);z-index:2147483000;display:flex;flex-direction:column;transform:translateX(105%);transition:transform .2s;box-shadow:-8px 0 30px rgba(0,0,0,.25);font-size:16px;line-height:1.35;visibility:hidden}' +
  '#acx-panel.on{transform:none;visibility:visible}' +
  '#acx-panel .top{background:var(--c-pri);color:#fff;padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top,0px));display:flex;align-items:center;gap:10px}' +
  '#acx-panel .top h1{font-size:17px;margin:0;flex:1;line-height:1.2;color:#fff}#acx-panel .top small{display:block;font-weight:400;opacity:.8;font-size:12px}' +
  '#acx-panel .ib{background:rgba(255,255,255,.16);border:0;color:#fff;border-radius:10px;min-width:40px;height:40px;font-size:18px;cursor:pointer}' +
  '#acx-panel .wrap{padding:14px;overflow-y:auto;flex:1;overscroll-behavior:contain}' +
  '#acx-panel .card{background:var(--c-card);border:1px solid var(--c-line);border-radius:14px;padding:14px;margin:0 0 12px}' +
  '#acx-panel .card h2{font-size:14px;margin:0 0 10px;color:var(--c-mute);text-transform:uppercase;letter-spacing:.04em;font-weight:700}' +
  '#acx-panel .tabs{display:flex;gap:6px}' +
  '#acx-panel .tabs button{flex:1;border:1px solid var(--c-line);background:var(--c-card);color:var(--c-ink);border-radius:10px;padding:9px 6px;font-size:14px;cursor:pointer}' +
  '#acx-panel .tabs button.on{background:var(--c-pri);color:#fff;border-color:var(--c-pri)}' +
  '#acx-panel .swatches{display:flex;gap:12px;flex-wrap:wrap}' +
  '#acx-panel .swatch{width:42px;height:42px;border-radius:50%;border:3px solid transparent;outline:1px solid var(--c-line);cursor:pointer;padding:0}' +
  '#acx-panel .swatch.on{border-color:var(--c-card);outline:3px solid var(--c-ink)}' +
  '#acx-panel label{display:block;font-size:13px;color:var(--c-mute);margin:0 0 6px}' +
  '#acx-panel select{width:100%;padding:12px;border:1px solid var(--c-line);border-radius:10px;background:var(--c-card);color:var(--c-ink);font-size:16px}' +
  '#acx-panel .prev{margin-top:10px;padding:14px;border:1px dashed var(--c-line);border-radius:10px;background:var(--c-bg);font-size:20px;text-align:center}' +
  '#acx-panel .reset{display:block;width:100%;border:1px solid var(--c-line);background:transparent;color:var(--c-pri2);border-radius:12px;padding:13px;font-weight:700;font-size:16px;cursor:pointer}' +
  '@media (prefers-reduced-motion:reduce){#acx-panel{transition:none}}';

  function injectCss() {
    if (document.getElementById('acx-css')) return;
    var st = document.createElement('style'); st.id = 'acx-css'; st.textContent = CSS; (document.head || root).appendChild(st);
  }

  /* ---------- panel ---------- */
  var panel, scrim, fab;
  function seg(a, cur, opts) { return '<div class="tabs">' + opts.map(function (o) { return '<button type="button" data-a="' + a + '" data-v="' + o[0] + '" class="' + (cur === o[0] ? 'on' : '') + '">' + o[1] + '</button>'; }).join('') + '</div>'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function draw() {
    var L = lget(), th = L.theme || 'auto', ac = ACCENTS[L.accent] ? L.accent : 'app', sz = L.size || 'm', fn = FONTS[L.font] ? L.font : 'cambria';
    var sw = Object.keys(ACCENTS).map(function (k) { return '<button type="button" class="swatch' + (ac === k ? ' on' : '') + '" data-a="accent" data-v="' + k + '" style="background:' + ACCENTS[k] + '" aria-label="' + ACCENT_NAMES[k] + '" title="' + ACCENT_NAMES[k] + '"></button>'; }).join('');
    var opts = Object.keys(FONTS).map(function (k) { return '<option value="' + k + '"' + (fn === k ? ' selected' : '') + '>' + esc(FONTS[k][0]) + '</option>'; }).join('');
    panel.innerHTML = '<div class="top"><h1>Appearance<small>Saved on this device</small></h1><button type="button" class="ib" data-a="close" aria-label="Close">&#10005;</button></div>' +
      '<div class="wrap"><div class="card"><h2>Theme</h2>' + seg('theme', th, [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']]) + '</div>' +
      '<div class="card"><h2>Colour</h2><div class="swatches">' + sw + '</div></div>' +
      '<div class="card"><h2>Font</h2><label for="acx-font">Choose from ' + Object.keys(FONTS).length + ' font types</label><select id="acx-font">' + opts + '</select><div class="prev" id="acx-prev" style="font-family:' + esc(FONTS[fn][1]) + '">Acacia ' + (APP === 'bet' ? 'Bet' : 'Rides &amp; Food') + ' &middot; Aa Bb 123</div></div>' +
      '<div class="card"><h2>Text size</h2>' + seg('size', sz, [['s', 'Small'], ['m', 'Medium'], ['l', 'Large']]) + '</div>' +
      '<button type="button" class="reset" data-a="reset">Reset to default</button></div>';
  }
  function open() { if (!panel) build(); draw(); panel.classList.add('on'); scrim.classList.add('on'); var c = panel.querySelector('[data-a=close]'); if (c) c.focus(); }
  function close() { if (!panel) return; panel.classList.remove('on'); scrim.classList.remove('on'); if (fab) fab.focus(); }
  function change(k, v) { var L = lget(); L[k] = v; lset(L); apply(); draw(); }
  function build() {
    if (panel) return;
    injectCss();
    var box = document.createElement('div'); box.id = 'acx-root';
    box.innerHTML = '<div id="acx-scrim"></div><aside id="acx-panel" role="dialog" aria-modal="true" aria-label="Appearance"></aside>';
    document.body.appendChild(box);
    panel = box.querySelector('#acx-panel'); scrim = box.querySelector('#acx-scrim');
    scrim.addEventListener('click', close);
    panel.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]'); if (!b) return; var a = b.getAttribute('data-a');
      if (a === 'close') close();
      else if (a === 'reset') { try { localStorage.removeItem(KEY); } catch (er) {} apply(); draw(); }
      else change(a, b.getAttribute('data-v'));
    });
    panel.addEventListener('change', function (e) { if (e.target && e.target.id === 'acx-font') change('font', e.target.value); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('on')) close(); });
  }

  var TOGGLE = '#theme-toggle,#themeToggle,.theme-toggle';
  function init() {
    injectCss(); build();
    if (!document.querySelector(TOGGLE)) {
      fab = document.createElement('button'); fab.id = 'acx-fab'; fab.type = 'button'; fab.setAttribute('aria-label', 'Appearance'); fab.title = 'Appearance'; fab.innerHTML = '&#9788;';
      fab.addEventListener('click', open);
      panel.parentNode.appendChild(fab);
    } else {
      document.querySelectorAll(TOGGLE).forEach(function (b) { b.setAttribute('aria-label', 'Appearance'); b.title = 'Appearance'; });
    }
  }
  /* the old light/dark button now opens the Appearance panel */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest(TOGGLE); if (!b) return;
    e.preventDefault(); e.stopImmediatePropagation(); open();
  }, true);

  apply();
  injectCss();
  if (mq) { var h = function () { if (!lget().theme || lget().theme === 'auto') apply(); }; if (mq.addEventListener) mq.addEventListener('change', h); else if (mq.addListener) mq.addListener(h); }
  window.addEventListener('storage', function (e) { if (e.key === KEY) { apply(); if (panel && panel.classList.contains('on')) draw(); } });
  /* if an older script changes data-theme, put it back in step */
  new MutationObserver(function () { if (!applying && root.getAttribute('data-theme') !== root.getAttribute('data-acx-theme')) apply(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.AcaciaAppearance = { open: open, close: close };
})();

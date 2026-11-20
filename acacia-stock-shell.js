/* Acacia Stock Count shell: blue top bar + slide-in sidebar for Acacia Bet and Acacia Rides. */
(function () {
  'use strict';
  var sc = document.currentScript, APP = (sc && sc.getAttribute('data-app')) || 'bet';
  var TITLE = APP === 'rides' ? 'Acacia Rides & Food' : 'Acacia Bet';
  var ICON = (sc && sc.getAttribute('data-icon')) || 'favicon-32.png';
  var EMOJI = { home: '\u2302', markets: '\uD83D\uDCC8', games: '\uD83C\uDFAE', wallet: '\uD83D\uDC5B', how: '\u2753', trading: '\uD83D\uDCB9', ride: '\uD83D\uDE97', food: '\uD83C\uDF54', reviews: '\u2B50', drivers: '\uD83E\uDDD1', restaurants: '\uD83C\uDF7D', support: '\uD83D\uDEDF', activity: '\uD83D\uDCDC' };
  function icon(label) { var k = (label || '').toLowerCase(); for (var n in EMOJI) if (k.indexOf(n) === 0) return EMOJI[n]; return '\u2022'; }
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function shown(el) { return !!el && getComputedStyle(el).display !== 'none'; }

  var side, scrim, top, items = [];
  function session() {
    if (APP === 'rides') { try { var u = JSON.parse(localStorage.getItem('acaciaActiveSession') || 'null'); return u ? { name: u.name || u.email, role: u.role } : null; } catch (e) { return null; } }
    var m = $('accountMenu'); return m && shown(m) ? { name: ($('accountName') || {}).textContent || 'Account' } : null;
  }
  function collect() {
    items = [];
    if (APP === 'rides') {
      var dash = ['customerDashboard', 'driverDashboard', 'restaurantDashboard', 'adminDashboard'].map($).filter(shown)[0];
      if (dash) {
        dash.querySelectorAll('.dashboard-sidebar li').forEach(function (li) {
          if (li.getAttribute('onclick') && /logout|Appearance/.test(li.getAttribute('onclick'))) return;
          items.push({ label: li.textContent.trim(), on: li.classList.contains('active'), go: function () { li.click(); } });
        });
        return;
      }
      document.querySelectorAll('header .menu a').forEach(function (a) {
        items.push({ label: a.textContent.trim(), go: function () { if (a.getAttribute('href') && !a.getAttribute('onclick')) location.href = a.getAttribute('href'); else a.click(); } });
      });
      return;
    }
    var here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('header nav a[href]').forEach(function (a) {
      var h = a.getAttribute('href'); items.push({ label: a.textContent.trim(), on: h === here || (here === '' && h === 'index.html'), go: function () { location.href = h; } });
    });
  }
  function title() {
    var cur = items.filter(function (i) { return i.on; })[0]; return cur ? cur.label : (APP === 'rides' ? 'Book rides, food and parcels' : 'Sports & markets demo');
  }
  function render() {
    collect(); var s = session();
    side.innerHTML = '<div class="sh"><img src="' + ICON + '" alt=""><div><b>' + TITLE + '</b><small>' + esc(s ? s.name : 'Welcome') + '</small></div></div><nav>' +
      items.map(function (it, i) { return '<button class="nav' + (it.on ? ' on' : '') + '" data-i="' + i + '"><span>' + icon(it.label) + '</span>' + esc(it.label) + '</button>'; }).join('') +
      '</nav><div class="sf"><button class="nav" data-a="look"><span>\u263C</span>Appearance</button>' +
      (s ? '<div class="mute">' + esc(s.name) + '</div><button class="nav out" data-a="logout"><span>\u23FB</span>Log out</button>'
         : '<button class="nav" data-a="login"><span>\u21AA</span>Log in</button><button class="nav" data-a="signup"><span>\u271A</span>Register</button>') +
      (APP === 'bet' ? '<button class="nav" data-a="staff"><span>\u2699</span>Staff login</button>' : '') + '</div>';
    var sub = $('acxSub'); if (sub) sub.textContent = title();
  }
  function open() { render(); side.classList.add('open'); scrim.classList.add('on'); }
  function close() { side.classList.remove('open'); scrim.classList.remove('on'); }

  function build() {
    document.body.classList.add('acx-stock');
    top = document.createElement('div'); top.className = 'acx-top';
    top.innerHTML = '<button class="ib" id="acxMenu" aria-label="Menu">\u2630</button><h1>' + TITLE + '<small id="acxSub"></small></h1><button class="ib" id="acxLook" aria-label="Appearance" title="Appearance">\u263C</button>';
    side = document.createElement('aside'); side.className = 'acx-side'; side.id = 'acxSide';
    scrim = document.createElement('div'); scrim.className = 'acx-scrim';
    document.body.insertBefore(top, document.body.firstChild); document.body.appendChild(side); document.body.appendChild(scrim);
    $('acxMenu').addEventListener('click', open); $('acxLook').addEventListener('click', function () { window.AcaciaAppearance && AcaciaAppearance.open(); });
    scrim.addEventListener('click', close);
    side.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var a = b.getAttribute('data-a');
      close();
      if (b.hasAttribute('data-i')) { items[+b.getAttribute('data-i')].go(); return; }
      if (a === 'look') { window.AcaciaAppearance && AcaciaAppearance.open(); }
      else if (a === 'staff') { location.href = 'admin.html'; }
      else if (APP === 'rides') { if (a === 'login') window.openAuth && openAuth('login'); else if (a === 'signup') window.openAuth && openAuth('register'); else if (a === 'logout') window.logout && logout(); }
      else { var id = a === 'login' ? 'loginBtn' : a === 'signup' ? 'signupBtn' : 'logoutBtn'; var el = $(id); if (el) el.click(); }
    });
    render();
    setInterval(function () { var sub = $('acxSub'); if (sub) sub.textContent = title(); if (!side.classList.contains('open')) collect(); }, 800);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();

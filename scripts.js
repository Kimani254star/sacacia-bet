/* JavaScript for page-games */
(function(){
  if (!document.body.classList.contains('page-games')) return;

  // ===== Auth modal — cosmetic only. Client-side validation + a fake per-tab session (sessionStorage). =====
  // No account is ever created, no credentials are sent anywhere or persisted beyond this browser tab.
  const backdrop = document.getElementById('modalBackdrop');
  const modalTitle = document.getElementById('modalTitle');

  function switchModalTab(formId){
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.form === formId));
    document.querySelectorAll('.modal-form').forEach(f => f.classList.toggle('active', f.id === formId));
    modalTitle.textContent = formId === 'signupForm' ? 'Create demo account' : 'Welcome back';
  }
  document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => switchModalTab(tab.dataset.form));
  });

  const openModal = (formId) => { switchModalTab(formId || 'loginForm'); backdrop.classList.add('open'); };
  document.getElementById('loginBtn').addEventListener('click', () => openModal('loginForm'));
  document.getElementById('signupBtn').addEventListener('click', () => openModal('signupForm'));
  document.getElementById('heroSignup')?.addEventListener('click', () => openModal('signupForm'));
  document.getElementById('modalClose').addEventListener('click', () => backdrop.classList.remove('open'));
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.classList.remove('open'); });

  function setError(fieldId, show){
    document.getElementById(fieldId).classList.toggle('has-error', show);
  }
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const emailOk = isValidEmail(email);
    const passOk = password.length >= 6;
    setError('loginEmailField', !emailOk);
    setError('loginPasswordField', !passOk);
    if(!emailOk || !passOk) return;
    startFakeSession(email.split('@')[0]);
  });

  document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const nameOk = name.length > 0;
    const emailOk = isValidEmail(email);
    const passOk = password.length >= 6;
    const confirmOk = passOk && password === confirm;
    setError('signupNameField', !nameOk);
    setError('signupEmailField', !emailOk);
    setError('signupPasswordField', !passOk);
    setError('signupConfirmField', !confirmOk);
    if(!nameOk || !emailOk || !passOk || !confirmOk) return;
    startFakeSession(name);
  });

  function startFakeSession(name){
    sessionStorage.setItem('saccaia-demo-user', name);
    backdrop.classList.remove('open');
    applySessionUI(name);
    showToast('Signed in as ' + name + ' — demo session only, nothing was sent to a server');
  }

  function applySessionUI(name){
    document.getElementById('loggedOutActions').style.display = 'none';
    document.getElementById('accountMenu').style.display = 'block';
    document.getElementById('accountName').textContent = name;
    document.getElementById('accountAvatar').textContent = name.charAt(0).toUpperCase();
  }

  function clearSessionUI(){
    document.getElementById('loggedOutActions').style.display = 'flex';
    document.getElementById('accountMenu').style.display = 'none';
    document.getElementById('accountDropdown').classList.remove('open');
  }

  document.getElementById('accountChip').addEventListener('click', () => {
    document.getElementById('accountDropdown').classList.toggle('open');
  });
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('saccaia-demo-user');
    clearSessionUI();
    showToast('Logged out (demo session ended)');
  });
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('accountMenu');
    if(menu.style.display !== 'none' && !menu.contains(e.target)){
      document.getElementById('accountDropdown').classList.remove('open');
    }
  });

  // Restore session on reload within the same tab
  const existingUser = sessionStorage.getItem('saccaia-demo-user');
  if(existingUser) applySessionUI(existingUser);

  // Odds selection — cosmetic only, toggles style, updates bet slip pane, shows toast
  function renderSlip(){
    const selected = document.querySelectorAll('.odd-btn.selected');
    const pane = document.getElementById('slipPane');
    if(!pane) return;
    if(selected.length === 0){
      pane.innerHTML = '<div class="wallet-balance-lbl">Bet slip</div><div class="slip-empty" id="slipEmptyMsg">No selections yet — tap any odds button to add it here (demo only).</div>';
      return;
    }
    let rows = '';
    selected.forEach(btn => {
      const match = btn.closest('.match');
      const liveCard = btn.closest('.live-card');
      let teams = 'Selection';
      if(match) teams = match.querySelector('.match-teams').textContent.trim();
      else if(liveCard) teams = liveCard.querySelector('.live-fixture').textContent.trim();
      const lbl = btn.querySelector('.lbl').textContent;
      const val = btn.querySelector('.val').textContent;
      rows += `<div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--line); font-size:13.5px;">
        <span>${teams} <span style="color:rgba(var(--text-rgb),0.5);">(${lbl})</span></span>
        <span style="font-family:var(--mono); font-weight:600; color:var(--gold-dim);">${val}</span>
      </div>`;
    });
    pane.innerHTML = '<div class="wallet-balance-lbl">Bet slip (' + selected.length + ')</div>' + rows +
      '<button class="btn btn-gold" style="width:100%; margin-top:16px;" id="placeSlipBtn">Place bet (demo)</button>';
    const placeBtn = document.getElementById('placeSlipBtn');
    if(placeBtn) placeBtn.addEventListener('click', () => showToast('This is a demo — no real bet was placed'));
  }

  document.querySelectorAll('.odd-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
      if (btn.classList.contains('selected')) showToast('Added to bet slip (demo only)');
      renderSlip();
    });
  });

  // Sport tabs — cosmetic only
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Wallet <-> Bet Slip switcher
  document.querySelectorAll('.wallet-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll('.wallet-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.wallet-pane').forEach(p => p.classList.remove('active'));
      tabBtn.classList.add('active');
      document.getElementById(tabBtn.dataset.pane).classList.add('active');
    });
  });
  document.getElementById('depositBtn')?.addEventListener('click', () => showToast('This is a demo — no real deposit was made'));
  document.getElementById('withdrawBtn')?.addEventListener('click', () => showToast('This is a demo — no real withdrawal was made'));

  // ===== Spin & Win — cosmetic wheel, no real prizes =====
  (function(){
    const prizes = [
      { label: '2x Odds', color: '#F2A93B' },
      { label: 'Try Again', color: '#1B211F' },
      { label: 'Free Bet', color: '#D6472E' },
      { label: 'No Win', color: '#1B211F' },
      { label: '5x Odds', color: '#C98A2C' },
      { label: 'Try Again', color: '#1B211F' },
      { label: 'Cashback', color: '#D6472E' },
      { label: 'No Win', color: '#1B211F' }
    ];
    const seg = 360 / prizes.length;
    const g = document.getElementById('wheelSegments');
    if(!g) return;
    prizes.forEach((p, i) => {
      const start = i * seg;
      const end = start + seg;
      const x1 = 100 + 98 * Math.cos(Math.PI * (start - 90) / 180);
      const y1 = 100 + 98 * Math.sin(Math.PI * (start - 90) / 180);
      const x2 = 100 + 98 * Math.cos(Math.PI * (end - 90) / 180);
      const y2 = 100 + 98 * Math.sin(Math.PI * (end - 90) / 180);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M100,100 L${x1},${y1} A98,98 0 0,1 ${x2},${y2} Z`);
      path.setAttribute('fill', p.color);
      path.setAttribute('stroke', 'var(--surface)');
      path.setAttribute('stroke-width', '1');
      g.appendChild(path);

      const mid = start + seg / 2;
      const tx = 100 + 62 * Math.cos(Math.PI * (mid - 90) / 180);
      const ty = 100 + 62 * Math.sin(Math.PI * (mid - 90) / 180);
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', tx);
      text.setAttribute('y', ty);
      text.setAttribute('fill', '#F4EFE2');
      text.setAttribute('font-size', '9');
      text.setAttribute('font-family', 'IBM Plex Mono, monospace');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('transform', `rotate(${mid}, ${tx}, ${ty})`);
      text.textContent = p.label;
      g.appendChild(text);
    });

    const wheel = document.getElementById('spinWheel');
    const spinBtn = document.getElementById('spinBtn');
    const resultEl = document.getElementById('spinResult');
    let currentRotation = 0;
    let spun = false;

    spinBtn.addEventListener('click', () => {
      if(spun) return;
      spun = true;
      spinBtn.disabled = true;
      resultEl.textContent = 'Spinning…';

      const winIndex = Math.floor(Math.random() * prizes.length);
      const targetMid = winIndex * seg + seg / 2;
      // wheel spins clockwise; pointer is fixed at top (0deg)
      const extraSpins = 5 * 360;
      const rotation = currentRotation + extraSpins + (360 - targetMid);
      currentRotation = rotation;
      wheel.style.transform = `rotate(${rotation}deg)`;

      setTimeout(() => {
        const prize = prizes[winIndex];
        resultEl.textContent = 'Landed on: ' + prize.label + ' (demo only — no real bonus applied)';
        showToast('Spin result: ' + prize.label + ' (demo)');
      }, 4600);
    });
  })();

  // Live badge — flips to LIVE based on the real fixture kickoff time
  (function(){
    const card = document.getElementById('liveCard');
    if(!card) return;
    const badge = document.getElementById('liveBadge');
    const badgeText = document.getElementById('liveBadgeText');
    const kickoff = new Date(card.dataset.kickoff);
    function updateLiveState(){
      const now = new Date();
      if(now >= kickoff){
        badge.classList.add('is-live');
        badgeText.textContent = 'Live';
      } else {
        badge.classList.remove('is-live');
        badgeText.textContent = 'Pre-match';
      }
    }
    updateLiveState();
    setInterval(updateLiveState, 30000);
  })();

  // Dark mode toggle
  const themeToggle = document.getElementById('themeToggle');
  function applyTheme(theme){
    if(theme === 'dark'){
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.textContent = '🌙';
    }
  }
  const savedTheme = localStorage.getItem('saccaia-theme') || 'light';
  applyTheme(savedTheme);
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('saccaia-theme', next);
  });

  // Toast
  let toastTimer;
  // Footer newsletter — cosmetic only
  document.getElementById('footerSubscribe')?.addEventListener('click', () => {
    const val = document.getElementById('footerEmail').value.trim();
    if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)){
      document.getElementById('footerEmail').value = '';
      showToast('Demo only — no email was sent or stored');
    } else {
      showToast('Enter a valid email to try the demo signup');
    }
  });

  function showToast(msg){
    const toast = document.getElementById('slipToast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  // ===== Aviator — local, cosmetic simulation only. No real money, no server, no real RNG-backed outcome. =====
  (function(){
    const multVal = document.getElementById('multVal');
    const multStatus = document.getElementById('multStatus');
    const roundCaption = document.getElementById('roundCaption');
    const plane = document.getElementById('planeEmoji');
    const curvePath = document.getElementById('curvePath');
    const curveFill = document.getElementById('curveFill');
    const historyRow = document.getElementById('avHistory');
    const betBtn1 = document.getElementById('betBtn1');
    const allBetBtn = document.getElementById('allBetBtn');
    if(!multVal || !betBtn1 || !allBetBtn) return;

    let roundNum = 4821;
    let multiplier = 1.00;
    let crashPoint = 1.0;
    let phase = 'waiting'; // waiting | flying | crashed
    let bet1Placed = false, bet2Placed = false;
    let rafId;

    // seed some history pills
    const seedHistory = [1.24, 2.87, 1.05, 6.42, 1.98, 1.11, 3.30, 1.67, 12.05, 1.02];
    seedHistory.forEach(v => addHistoryPill(v));

    function addHistoryPill(v){
      const pill = document.createElement('div');
      pill.className = 'hist-pill' + (v >= 10 ? ' big' : v >= 2 ? ' win' : '');
      pill.textContent = v.toFixed(2) + 'x';
      historyRow.appendChild(pill);
      historyRow.scrollLeft = historyRow.scrollWidth;
    }

    function randomCrashPoint(){
      // simple demo-only distribution, skewed toward lower multipliers
      const r = Math.random();
      const val = 0.98 / (1 - r * 0.97);
      return Math.max(1.00, Math.min(val, 40));
    }

    function resetStage(){
      curvePath.setAttribute('d', 'M 0 280 L 0 280');
      curveFill.setAttribute('d', 'M 0 280 L 0 280 L 0 280 Z');
      plane.style.left = '0%';
      plane.style.bottom = '0%';
      multVal.textContent = '1.00x';
      multVal.classList.remove('flying','crashed');
    }

    function startWaiting(){
      phase = 'waiting';
      bet1Placed = false; bet2Placed = false;
      betBtn1.textContent = ''; 
      betBtn1.innerHTML = 'Place bet<span class="sub">Stake locks in when round starts</span>';
      allBetBtn.innerHTML = 'All Bet — max stake<span class="sub">Uses your full demo balance</span>';
      betBtn1.classList.remove('placed');
      allBetBtn.classList.remove('placed');
      resetStage();
      multStatus.textContent = 'Round starting…';
      roundCaption.textContent = 'Round #' + roundNum + ' · waiting for next round';
      let count = 3;
      const waitTimer = setInterval(() => {
        multStatus.textContent = 'Starts in ' + count + '…';
        count--;
        if(count < 0){
          clearInterval(waitTimer);
          startFlight();
        }
      }, 700);
    }

    function startFlight(){
      phase = 'flying';
      roundNum++;
      multiplier = 1.00;
      crashPoint = randomCrashPoint();
      multStatus.textContent = 'Flying…';
      multVal.classList.add('flying');
      roundCaption.textContent = 'Round #' + roundNum + ' · demo simulation';
      const startTime = performance.now();

      function tick(now){
        const t = (now - startTime) / 1000;
        multiplier = 1 + 0.06 * t * t + 0.15 * t;

        if(multiplier >= crashPoint){
          crashNow();
          return;
        }

        multVal.textContent = multiplier.toFixed(2) + 'x';

        // draw curve — simple ease-out path across the stage
        const progress = Math.min(t / 6, 1); // visual progress cap
        const w = 600, h = 280;
        const x = progress * w;
        const y = h - Math.min(progress * progress * h * 1.4, h - 20);
        curvePath.setAttribute('d', `M 0 ${h} Q ${x*0.5} ${h}, ${x} ${y}`);
        curveFill.setAttribute('d', `M 0 ${h} Q ${x*0.5} ${h}, ${x} ${y} L ${x} ${h} Z`);
        plane.style.left = Math.min((x/w)*100, 92) + '%';
        plane.style.bottom = Math.min(((h-y)/h)*82, 78) + '%';

        // auto cash-out check (cosmetic)
        checkAutoCashout('auto1', bet1Placed, betBtn1, (v)=>bet1Placed=v);
        checkAutoCashout('auto2', bet2Placed, allBetBtn, (v)=>bet2Placed=v);

        rafId = requestAnimationFrame(tick);
      }
      rafId = requestAnimationFrame(tick);
    }

    function checkAutoCashout(inputId, placed, btn, setter){
      if(!placed) return;
      const raw = document.getElementById(inputId).value.replace('x','').trim();
      const target = parseFloat(raw);
      if(!isNaN(target) && multiplier >= target){
        setter(false);
        btn.classList.remove('placed');
        btn.innerHTML = 'Cashed out at ' + multiplier.toFixed(2) + 'x<span class="sub">Demo winnings credited</span>';
        showToast('Cashed out at ' + multiplier.toFixed(2) + 'x (demo)');
      }
    }

    function crashNow(){
      phase = 'crashed';
      cancelAnimationFrame(rafId);
      multVal.textContent = crashPoint.toFixed(2) + 'x';
      multVal.classList.remove('flying');
      multVal.classList.add('crashed');
      multStatus.textContent = 'Flew away!';
      addHistoryPill(crashPoint);

      if(bet1Placed){
        betBtn1.innerHTML = 'Round crashed — lost stake<span class="sub">Demo balance adjusted</span>';
      }
      if(bet2Placed){
        allBetBtn.innerHTML = 'Round crashed — lost stake<span class="sub">Demo balance adjusted</span>';
      }

      setTimeout(startWaiting, 2200);
    }

    // stake chips
    document.querySelectorAll('.stake-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const target = document.getElementById(chip.dataset.target);
        if(chip.dataset.reset){
          target.value = '0';
        } else {
          const cur = parseInt(target.value) || 0;
          target.value = cur + parseInt(chip.dataset.val);
        }
      });
    });

    // place bet buttons — cosmetic
    betBtn1.addEventListener('click', () => {
      if(phase !== 'waiting'){ showToast('Wait for the next round to place a bet'); return; }
      bet1Placed = !bet1Placed;
      betBtn1.classList.toggle('placed', bet1Placed);
      betBtn1.innerHTML = bet1Placed
        ? 'Cancel bet<span class="sub">Stake: KES ' + (document.getElementById('stake1').value || 0) + '</span>'
        : 'Place bet<span class="sub">Stake locks in when round starts</span>';
      if(bet1Placed) showToast('Bet placed for next round (demo)');
    });

    allBetBtn.addEventListener('click', () => {
      if(phase !== 'waiting'){ showToast('Wait for the next round to place a bet'); return; }
      document.getElementById('stake2').value = '10000';
      bet2Placed = !bet2Placed;
      allBetBtn.classList.toggle('placed', bet2Placed);
      allBetBtn.innerHTML = bet2Placed
        ? 'Cancel All Bet<span class="sub">Full demo balance staked</span>'
        : 'All Bet — max stake<span class="sub">Uses your full demo balance</span>';
      if(bet2Placed) showToast('All Bet placed — full demo balance staked');
    });

    startWaiting();
  })();

})();

/* JavaScript for page-how */
(function(){
  if (!document.body.classList.contains('page-how')) return;

  // ===== Auth modal — cosmetic only. Client-side validation + a fake per-tab session (sessionStorage). =====
  // No account is ever created, no credentials are sent anywhere or persisted beyond this browser tab.
  const backdrop = document.getElementById('modalBackdrop');
  const modalTitle = document.getElementById('modalTitle');

  function switchModalTab(formId){
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.form === formId));
    document.querySelectorAll('.modal-form').forEach(f => f.classList.toggle('active', f.id === formId));
    modalTitle.textContent = formId === 'signupForm' ? 'Create demo account' : 'Welcome back';
  }
  document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => switchModalTab(tab.dataset.form));
  });

  const openModal = (formId) => { switchModalTab(formId || 'loginForm'); backdrop.classList.add('open'); };
  document.getElementById('loginBtn').addEventListener('click', () => openModal('loginForm'));
  document.getElementById('signupBtn').addEventListener('click', () => openModal('signupForm'));
  document.getElementById('heroSignup')?.addEventListener('click', () => openModal('signupForm'));
  document.getElementById('modalClose').addEventListener('click', () => backdrop.classList.remove('open'));
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.classList.remove('open'); });

  function setError(fieldId, show){
    document.getElementById(fieldId).classList.toggle('has-error', show);
  }
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const emailOk = isValidEmail(email);
    const passOk = password.length >= 6;
    setError('loginEmailField', !emailOk);
    setError('loginPasswordField', !passOk);
    if(!emailOk || !passOk) return;
    startFakeSession(email.split('@')[0]);
  });

  document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const nameOk = name.length > 0;
    const emailOk = isValidEmail(email);
    const passOk = password.length >= 6;
    const confirmOk = passOk && password === confirm;
    setError('signupNameField', !nameOk);
    setError('signupEmailField', !emailOk);
    setError('signupPasswordField', !passOk);
    setError('signupConfirmField', !confirmOk);
    if(!nameOk || !emailOk || !passOk || !confirmOk) return;
    startFakeSession(name);
  });

  function startFakeSession(name){
    sessionStorage.setItem('saccaia-demo-user', name);
    backdrop.classList.remove('open');
    applySessionUI(name);
    showToast('Signed in as ' + name + ' — demo session only, nothing was sent to a server');
  }

  function applySessionUI(name){
    document.getElementById('loggedOutActions').style.display = 'none';
    document.getElementById('accountMenu').style.display = 'block';
    document.getElementById('accountName').textContent = name;
    document.getElementById('accountAvatar').textContent = name.charAt(0).toUpperCase();
  }

  function clearSessionUI(){
    document.getElementById('loggedOutActions').style.display = 'flex';
    document.getElementById('accountMenu').style.display = 'none';
    document.getElementById('accountDropdown').classList.remove('open');
  }

  document.getElementById('accountChip').addEventListener('click', () => {
    document.getElementById('accountDropdown').classList.toggle('open');
  });
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('saccaia-demo-user');
    clearSessionUI();
    showToast('Logged out (demo session ended)');
  });
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('accountMenu');
    if(menu.style.display !== 'none' && !menu.contains(e.target)){
      document.getElementById('accountDropdown').classList.remove('open');
    }
  });

  // Restore session on reload within the same tab
  const existingUser = sessionStorage.getItem('saccaia-demo-user');
  if(existingUser) applySessionUI(existingUser);

  // Odds selection — cosmetic only, toggles style, updates bet slip pane, shows toast
  function renderSlip(){
    const selected = document.querySelectorAll('.odd-btn.selected');
    const pane = document.getElementById('slipPane');
    if(!pane) return;
    if(selected.length === 0){
      pane.innerHTML = '<div class="wallet-balance-lbl">Bet slip</div><div class="slip-empty" id="slipEmptyMsg">No selections yet — tap any odds button to add it here (demo only).</div>';
      return;
    }
    let rows = '';
    selected.forEach(btn => {
      const match = btn.closest('.match');
      const liveCard = btn.closest('.live-card');
      let teams = 'Selection';
      if(match) teams = match.querySelector('.match-teams').textContent.trim();
      else if(liveCard) teams = liveCard.querySelector('.live-fixture').textContent.trim();
      const lbl = btn.querySelector('.lbl').textContent;
      const val = btn.querySelector('.val').textContent;
      rows += `<div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--line); font-size:13.5px;">
        <span>${teams} <span style="color:rgba(var(--text-rgb),0.5);">(${lbl})</span></span>
        <span style="font-family:var(--mono); font-weight:600; color:var(--gold-dim);">${val}</span>
      </div>`;
    });
    pane.innerHTML = '<div class="wallet-balance-lbl">Bet slip (' + selected.length + ')</div>' + rows +
      '<button class="btn btn-gold" style="width:100%; margin-top:16px;" id="placeSlipBtn">Place bet (demo)</button>';
    const placeBtn = document.getElementById('placeSlipBtn');
    if(placeBtn) placeBtn.addEventListener('click', () => showToast('This is a demo — no real bet was placed'));
  }

  document.querySelectorAll('.odd-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
      if (btn.classList.contains('selected')) showToast('Added to bet slip (demo only)');
      renderSlip();
    });
  });

  // Sport tabs — cosmetic only
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Wallet <-> Bet Slip switcher
  document.querySelectorAll('.wallet-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll('.wallet-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.wallet-pane').forEach(p => p.classList.remove('active'));
      tabBtn.classList.add('active');
      document.getElementById(tabBtn.dataset.pane).classList.add('active');
    });
  });
  document.getElementById('depositBtn')?.addEventListener('click', () => showToast('This is a demo — no real deposit was made'));
  document.getElementById('withdrawBtn')?.addEventListener('click', () => showToast('This is a demo — no real withdrawal was made'));

  // ===== Spin & Win — cosmetic wheel, no real prizes =====
  (function(){
    const prizes = [
      { label: '2x Odds', color: '#F2A93B' },
      { label: 'Try Again', color: '#1B211F' },
      { label: 'Free Bet', color: '#D6472E' },
      { label: 'No Win', color: '#1B211F' },
      { label: '5x Odds', color: '#C98A2C' },
      { label: 'Try Again', color: '#1B211F' },
      { label: 'Cashback', color: '#D6472E' },
      { label: 'No Win', color: '#1B211F' }
    ];
    const seg = 360 / prizes.length;
    const g = document.getElementById('wheelSegments');
    if(!g) return;
    prizes.forEach((p, i) => {
      const start = i * seg;
      const end = start + seg;
      const x1 = 100 + 98 * Math.cos(Math.PI * (start - 90) / 180);
      const y1 = 100 + 98 * Math.sin(Math.PI * (start - 90) / 180);
      const x2 = 100 + 98 * Math.cos(Math.PI * (end - 90) / 180);
      const y2 = 100 + 98 * Math.sin(Math.PI * (end - 90) / 180);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M100,100 L${x1},${y1} A98,98 0 0,1 ${x2},${y2} Z`);
      path.setAttribute('fill', p.color);
      path.setAttribute('stroke', 'var(--surface)');
      path.setAttribute('stroke-width', '1');
      g.appendChild(path);

      const mid = start + seg / 2;
      const tx = 100 + 62 * Math.cos(Math.PI * (mid - 90) / 180);
      const ty = 100 + 62 * Math.sin(Math.PI * (mid - 90) / 180);
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', tx);
      text.setAttribute('y', ty);
      text.setAttribute('fill', '#F4EFE2');
      text.setAttribute('font-size', '9');
      text.setAttribute('font-family', 'IBM Plex Mono, monospace');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('transform', `rotate(${mid}, ${tx}, ${ty})`);
      text.textContent = p.label;
      g.appendChild(text);
    });

    const wheel = document.getElementById('spinWheel');
    const spinBtn = document.getElementById('spinBtn');
    const resultEl = document.getElementById('spinResult');
    let currentRotation = 0;
    let spun = false;

    spinBtn.addEventListener('click', () => {
      if(spun) return;
      spun = true;
      spinBtn.disabled = true;
      resultEl.textContent = 'Spinning…';

      const winIndex = Math.floor(Math.random() * prizes.length);
      const targetMid = winIndex * seg + seg / 2;
      // wheel spins clockwise; pointer is fixed at top (0deg)
      const extraSpins = 5 * 360;
      const rotation = currentRotation + extraSpins + (360 - targetMid);
      currentRotation = rotation;
      wheel.style.transform = `rotate(${rotation}deg)`;

      setTimeout(() => {
        const prize = prizes[winIndex];
        resultEl.textContent = 'Landed on: ' + prize.label + ' (demo only — no real bonus applied)';
        showToast('Spin result: ' + prize.label + ' (demo)');
      }, 4600);
    });
  })();

  // Live badge — flips to LIVE based on the real fixture kickoff time
  (function(){
    const card = document.getElementById('liveCard');
    if(!card) return;
    const badge = document.getElementById('liveBadge');
    const badgeText = document.getElementById('liveBadgeText');
    const kickoff = new Date(card.dataset.kickoff);
    function updateLiveState(){
      const now = new Date();
      if(now >= kickoff){
        badge.classList.add('is-live');
        badgeText.textContent = 'Live';
      } else {
        badge.classList.remove('is-live');
        badgeText.textContent = 'Pre-match';
      }
    }
    updateLiveState();
    setInterval(updateLiveState, 30000);
  })();

  // Dark mode toggle
  const themeToggle = document.getElementById('themeToggle');
  function applyTheme(theme){
    if(theme === 'dark'){
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.textContent = '🌙';
    }
  }
  const savedTheme = localStorage.getItem('saccaia-theme') || 'light';
  applyTheme(savedTheme);
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('saccaia-theme', next);
  });

  // Toast
  let toastTimer;
  // Footer newsletter — cosmetic only
  document.getElementById('footerSubscribe')?.addEventListener('click', () => {
    const val = document.getElementById('footerEmail').value.trim();
    if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)){
      document.getElementById('footerEmail').value = '';
      showToast('Demo only — no email was sent or stored');
    } else {
      showToast('Enter a valid email to try the demo signup');
    }
  });

  function showToast(msg){
    const toast = document.getElementById('slipToast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  // ===== Aviator — local, cosmetic simulation only. No real money, no server, no real RNG-backed outcome. =====
  (function(){
    const multVal = document.getElementById('multVal');
    const multStatus = document.getElementById('multStatus');
    const roundCaption = document.getElementById('roundCaption');
    const plane = document.getElementById('planeEmoji');
    const curvePath = document.getElementById('curvePath');
    const curveFill = document.getElementById('curveFill');
    const historyRow = document.getElementById('avHistory');
    const betBtn1 = document.getElementById('betBtn1');
    const allBetBtn = document.getElementById('allBetBtn');
    if(!multVal || !betBtn1 || !allBetBtn) return;

    let roundNum = 4821;
    let multiplier = 1.00;
    let crashPoint = 1.0;
    let phase = 'waiting'; // waiting | flying | crashed
    let bet1Placed = false, bet2Placed = false;
    let rafId;

    // seed some history pills
    const seedHistory = [1.24, 2.87, 1.05, 6.42, 1.98, 1.11, 3.30, 1.67, 12.05, 1.02];
    seedHistory.forEach(v => addHistoryPill(v));

    function addHistoryPill(v){
      const pill = document.createElement('div');
      pill.className = 'hist-pill' + (v >= 10 ? ' big' : v >= 2 ? ' win' : '');
      pill.textContent = v.toFixed(2) + 'x';
      historyRow.appendChild(pill);
      historyRow.scrollLeft = historyRow.scrollWidth;
    }

    function randomCrashPoint(){
      // simple demo-only distribution, skewed toward lower multipliers
      const r = Math.random();
      const val = 0.98 / (1 - r * 0.97);
      return Math.max(1.00, Math.min(val, 40));
    }

    function resetStage(){
      curvePath.setAttribute('d', 'M 0 280 L 0 280');
      curveFill.setAttribute('d', 'M 0 280 L 0 280 L 0 280 Z');
      plane.style.left = '0%';
      plane.style.bottom = '0%';
      multVal.textContent = '1.00x';
      multVal.classList.remove('flying','crashed');
    }

    function startWaiting(){
      phase = 'waiting';
      bet1Placed = false; bet2Placed = false;
      betBtn1.textContent = ''; 
      betBtn1.innerHTML = 'Place bet<span class="sub">Stake locks in when round starts</span>';
      allBetBtn.innerHTML = 'All Bet — max stake<span class="sub">Uses your full demo balance</span>';
      betBtn1.classList.remove('placed');
      allBetBtn.classList.remove('placed');
      resetStage();
      multStatus.textContent = 'Round starting…';
      roundCaption.textContent = 'Round #' + roundNum + ' · waiting for next round';
      let count = 3;
      const waitTimer = setInterval(() => {
        multStatus.textContent = 'Starts in ' + count + '…';
        count--;
        if(count < 0){
          clearInterval(waitTimer);
          startFlight();
        }
      }, 700);
    }

    function startFlight(){
      phase = 'flying';
      roundNum++;
      multiplier = 1.00;
      crashPoint = randomCrashPoint();
      multStatus.textContent = 'Flying…';
      multVal.classList.add('flying');
      roundCaption.textContent = 'Round #' + roundNum + ' · demo simulation';
      const startTime = performance.now();

      function tick(now){
        const t = (now - startTime) / 1000;
        multiplier = 1 + 0.06 * t * t + 0.15 * t;

        if(multiplier >= crashPoint){
          crashNow();
          return;
        }

        multVal.textContent = multiplier.toFixed(2) + 'x';

        // draw curve — simple ease-out path across the stage
        const progress = Math.min(t / 6, 1); // visual progress cap
        const w = 600, h = 280;
        const x = progress * w;
        const y = h - Math.min(progress * progress * h * 1.4, h - 20);
        curvePath.setAttribute('d', `M 0 ${h} Q ${x*0.5} ${h}, ${x} ${y}`);
        curveFill.setAttribute('d', `M 0 ${h} Q ${x*0.5} ${h}, ${x} ${y} L ${x} ${h} Z`);
        plane.style.left = Math.min((x/w)*100, 92) + '%';
        plane.style.bottom = Math.min(((h-y)/h)*82, 78) + '%';

        // auto cash-out check (cosmetic)
        checkAutoCashout('auto1', bet1Placed, betBtn1, (v)=>bet1Placed=v);
        checkAutoCashout('auto2', bet2Placed, allBetBtn, (v)=>bet2Placed=v);

        rafId = requestAnimationFrame(tick);
      }
      rafId = requestAnimationFrame(tick);
    }

    function checkAutoCashout(inputId, placed, btn, setter){
      if(!placed) return;
      const raw = document.getElementById(inputId).value.replace('x','').trim();
      const target = parseFloat(raw);
      if(!isNaN(target) && multiplier >= target){
        setter(false);
        btn.classList.remove('placed');
        btn.innerHTML = 'Cashed out at ' + multiplier.toFixed(2) + 'x<span class="sub">Demo winnings credited</span>';
        showToast('Cashed out at ' + multiplier.toFixed(2) + 'x (demo)');
      }
    }

    function crashNow(){
      phase = 'crashed';
      cancelAnimationFrame(rafId);
      multVal.textContent = crashPoint.toFixed(2) + 'x';
      multVal.classList.remove('flying');
      multVal.classList.add('crashed');
      multStatus.textContent = 'Flew away!';
      addHistoryPill(crashPoint);

      if(bet1Placed){
        betBtn1.innerHTML = 'Round crashed — lost stake<span class="sub">Demo balance adjusted</span>';
      }
      if(bet2Placed){
        allBetBtn.innerHTML = 'Round crashed — lost stake<span class="sub">Demo balance adjusted</span>';
      }

      setTimeout(startWaiting, 2200);
    }

    // stake chips
    document.querySelectorAll('.stake-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const target = document.getElementById(chip.dataset.target);
        if(chip.dataset.reset){
          target.value = '0';
        } else {
          const cur = parseInt(target.value) || 0;
          target.value = cur + parseInt(chip.dataset.val);
        }
      });
    });

    // place bet buttons — cosmetic
    betBtn1.addEventListener('click', () => {
      if(phase !== 'waiting'){ showToast('Wait for the next round to place a bet'); return; }
      bet1Placed = !bet1Placed;
      betBtn1.classList.toggle('placed', bet1Placed);
      betBtn1.innerHTML = bet1Placed
        ? 'Cancel bet<span class="sub">Stake: KES ' + (document.getElementById('stake1').value || 0) + '</span>'
        : 'Place bet<span class="sub">Stake locks in when round starts</span>';
      if(bet1Placed) showToast('Bet placed for next round (demo)');
    });

    allBetBtn.addEventListener('click', () => {
      if(phase !== 'waiting'){ showToast('Wait for the next round to place a bet'); return; }
      document.getElementById('stake2').value = '10000';
      bet2Placed = !bet2Placed;
      allBetBtn.classList.toggle('placed', bet2Placed);
      allBetBtn.innerHTML = bet2Placed
        ? 'Cancel All Bet<span class="sub">Full demo balance staked</span>'
        : 'All Bet — max stake<span class="sub">Uses your full demo balance</span>';
      if(bet2Placed) showToast('All Bet placed — full demo balance staked');
    });

    startWaiting();
  })();

})();

/* JavaScript for page-markets */
(function(){
  if (!document.body.classList.contains('page-markets')) return;

  // ===== Auth modal — cosmetic only. Client-side validation + a fake per-tab session (sessionStorage). =====
  // No account is ever created, no credentials are sent anywhere or persisted beyond this browser tab.
  const backdrop = document.getElementById('modalBackdrop');
  const modalTitle = document.getElementById('modalTitle');

  function switchModalTab(formId){
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.form === formId));
    document.querySelectorAll('.modal-form').forEach(f => f.classList.toggle('active', f.id === formId));
    modalTitle.textContent = formId === 'signupForm' ? 'Create demo account' : 'Welcome back';
  }
  document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => switchModalTab(tab.dataset.form));
  });

  const openModal = (formId) => { switchModalTab(formId || 'loginForm'); backdrop.classList.add('open'); };
  document.getElementById('loginBtn').addEventListener('click', () => openModal('loginForm'));
  document.getElementById('signupBtn').addEventListener('click', () => openModal('signupForm'));
  document.getElementById('heroSignup')?.addEventListener('click', () => openModal('signupForm'));
  document.getElementById('modalClose').addEventListener('click', () => backdrop.classList.remove('open'));
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.classList.remove('open'); });

  function setError(fieldId, show){
    document.getElementById(fieldId).classList.toggle('has-error', show);
  }
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const emailOk = isValidEmail(email);
    const passOk = password.length >= 6;
    setError('loginEmailField', !emailOk);
    setError('loginPasswordField', !passOk);
    if(!emailOk || !passOk) return;
    startFakeSession(email.split('@')[0]);
  });

  document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const nameOk = name.length > 0;
    const emailOk = isValidEmail(email);
    const passOk = password.length >= 6;
    const confirmOk = passOk && password === confirm;
    setError('signupNameField', !nameOk);
    setError('signupEmailField', !emailOk);
    setError('signupPasswordField', !passOk);
    setError('signupConfirmField', !confirmOk);
    if(!nameOk || !emailOk || !passOk || !confirmOk) return;
    startFakeSession(name);
  });

  function startFakeSession(name){
    sessionStorage.setItem('saccaia-demo-user', name);
    backdrop.classList.remove('open');
    applySessionUI(name);
    showToast('Signed in as ' + name + ' — demo session only, nothing was sent to a server');
  }

  function applySessionUI(name){
    document.getElementById('loggedOutActions').style.display = 'none';
    document.getElementById('accountMenu').style.display = 'block';
    document.getElementById('accountName').textContent = name;
    document.getElementById('accountAvatar').textContent = name.charAt(0).toUpperCase();
  }

  function clearSessionUI(){
    document.getElementById('loggedOutActions').style.display = 'flex';
    document.getElementById('accountMenu').style.display = 'none';
    document.getElementById('accountDropdown').classList.remove('open');
  }

  document.getElementById('accountChip').addEventListener('click', () => {
    document.getElementById('accountDropdown').classList.toggle('open');
  });
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('saccaia-demo-user');
    clearSessionUI();
    showToast('Logged out (demo session ended)');
  });
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('accountMenu');
    if(menu.style.display !== 'none' && !menu.contains(e.target)){
      document.getElementById('accountDropdown').classList.remove('open');
    }
  });

  // Restore session on reload within the same tab
  const existingUser = sessionStorage.getItem('saccaia-demo-user');
  if(existingUser) applySessionUI(existingUser);

  // Odds selection — cosmetic only, toggles style, updates bet slip pane, shows toast
  function renderSlip(){
    const selected = document.querySelectorAll('.odd-btn.selected');
    const pane = document.getElementById('slipPane');
    if(!pane) return;
    if(selected.length === 0){
      pane.innerHTML = '<div class="wallet-balance-lbl">Bet slip</div><div class="slip-empty" id="slipEmptyMsg">No selections yet — tap any odds button to add it here (demo only).</div>';
      return;
    }
    let rows = '';
    selected.forEach(btn => {
      const match = btn.closest('.match');
      const liveCard = btn.closest('.live-card');
      let teams = 'Selection';
      if(match) teams = match.querySelector('.match-teams').textContent.trim();
      else if(liveCard) teams = liveCard.querySelector('.live-fixture').textContent.trim();
      const lbl = btn.querySelector('.lbl').textContent;
      const val = btn.querySelector('.val').textContent;
      rows += `<div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--line); font-size:13.5px;">
        <span>${teams} <span style="color:rgba(var(--text-rgb),0.5);">(${lbl})</span></span>
        <span style="font-family:var(--mono); font-weight:600; color:var(--gold-dim);">${val}</span>
      </div>`;
    });
    pane.innerHTML = '<div class="wallet-balance-lbl">Bet slip (' + selected.length + ')</div>' + rows +
      '<button class="btn btn-gold" style="width:100%; margin-top:16px;" id="placeSlipBtn">Place bet (demo)</button>';
    const placeBtn = document.getElementById('placeSlipBtn');
    if(placeBtn) placeBtn.addEventListener('click', () => showToast('This is a demo — no real bet was placed'));
  }

  document.querySelectorAll('.odd-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
      if (btn.classList.contains('selected')) showToast('Added to bet slip (demo only)');
      renderSlip();
    });
  });

  // Sport tabs — cosmetic only
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Wallet <-> Bet Slip switcher
  document.querySelectorAll('.wallet-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll('.wallet-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.wallet-pane').forEach(p => p.classList.remove('active'));
      tabBtn.classList.add('active');
      document.getElementById(tabBtn.dataset.pane).classList.add('active');
    });
  });
  document.getElementById('depositBtn')?.addEventListener('click', () => showToast('This is a demo — no real deposit was made'));
  document.getElementById('withdrawBtn')?.addEventListener('click', () => showToast('This is a demo — no real withdrawal was made'));

  // ===== Spin & Win — cosmetic wheel, no real prizes =====
  (function(){
    const prizes = [
      { label: '2x Odds', color: '#F2A93B' },
      { label: 'Try Again', color: '#1B211F' },
      { label: 'Free Bet', color: '#D6472E' },
      { label: 'No Win', color: '#1B211F' },
      { label: '5x Odds', color: '#C98A2C' },
      { label: 'Try Again', color: '#1B211F' },
      { label: 'Cashback', color: '#D6472E' },
      { label: 'No Win', color: '#1B211F' }
    ];
    const seg = 360 / prizes.length;
    const g = document.getElementById('wheelSegments');
    if(!g) return;
    prizes.forEach((p, i) => {
      const start = i * seg;
      const end = start + seg;
      const x1 = 100 + 98 * Math.cos(Math.PI * (start - 90) / 180);
      const y1 = 100 + 98 * Math.sin(Math.PI * (start - 90) / 180);
      const x2 = 100 + 98 * Math.cos(Math.PI * (end - 90) / 180);
      const y2 = 100 + 98 * Math.sin(Math.PI * (end - 90) / 180);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M100,100 L${x1},${y1} A98,98 0 0,1 ${x2},${y2} Z`);
      path.setAttribute('fill', p.color);
      path.setAttribute('stroke', 'var(--surface)');
      path.setAttribute('stroke-width', '1');
      g.appendChild(path);

      const mid = start + seg / 2;
      const tx = 100 + 62 * Math.cos(Math.PI * (mid - 90) / 180);
      const ty = 100 + 62 * Math.sin(Math.PI * (mid - 90) / 180);
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', tx);
      text.setAttribute('y', ty);
      text.setAttribute('fill', '#F4EFE2');
      text.setAttribute('font-size', '9');
      text.setAttribute('font-family', 'IBM Plex Mono, monospace');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('transform', `rotate(${mid}, ${tx}, ${ty})`);
      text.textContent = p.label;
      g.appendChild(text);
    });

    const wheel = document.getElementById('spinWheel');
    const spinBtn = document.getElementById('spinBtn');
    const resultEl = document.getElementById('spinResult');
    let currentRotation = 0;
    let spun = false;

    spinBtn.addEventListener('click', () => {
      if(spun) return;
      spun = true;
      spinBtn.disabled = true;
      resultEl.textContent = 'Spinning…';

      const winIndex = Math.floor(Math.random() * prizes.length);
      const targetMid = winIndex * seg + seg / 2;
      // wheel spins clockwise; pointer is fixed at top (0deg)
      const extraSpins = 5 * 360;
      const rotation = currentRotation + extraSpins + (360 - targetMid);
      currentRotation = rotation;
      wheel.style.transform = `rotate(${rotation}deg)`;

      setTimeout(() => {
        const prize = prizes[winIndex];
        resultEl.textContent = 'Landed on: ' + prize.label + ' (demo only — no real bonus applied)';
        showToast('Spin result: ' + prize.label + ' (demo)');
      }, 4600);
    });
  })();

  // Live badge — flips to LIVE based on the real fixture kickoff time
  (function(){
    const card = document.getElementById('liveCard');
    if(!card) return;
    const badge = document.getElementById('liveBadge');
    const badgeText = document.getElementById('liveBadgeText');
    const kickoff = new Date(card.dataset.kickoff);
    function updateLiveState(){
      const now = new Date();
      if(now >= kickoff){
        badge.classList.add('is-live');
        badgeText.textContent = 'Live';
      } else {
        badge.classList.remove('is-live');
        badgeText.textContent = 'Pre-match';
      }
    }
    updateLiveState();
    setInterval(updateLiveState, 30000);
  })();

  // Dark mode toggle
  const themeToggle = document.getElementById('themeToggle');
  function applyTheme(theme){
    if(theme === 'dark'){
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.textContent = '🌙';
    }
  }
  const savedTheme = localStorage.getItem('saccaia-theme') || 'light';
  applyTheme(savedTheme);
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('saccaia-theme', next);
  });

  // Toast
  let toastTimer;
  // Footer newsletter — cosmetic only
  document.getElementById('footerSubscribe')?.addEventListener('click', () => {
    const val = document.getElementById('footerEmail').value.trim();
    if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)){
      document.getElementById('footerEmail').value = '';
      showToast('Demo only — no email was sent or stored');
    } else {
      showToast('Enter a valid email to try the demo signup');
    }
  });

  function showToast(msg){
    const toast = document.getElementById('slipToast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  // ===== Aviator — local, cosmetic simulation only. No real money, no server, no real RNG-backed outcome. =====
  (function(){
    const multVal = document.getElementById('multVal');
    const multStatus = document.getElementById('multStatus');
    const roundCaption = document.getElementById('roundCaption');
    const plane = document.getElementById('planeEmoji');
    const curvePath = document.getElementById('curvePath');
    const curveFill = document.getElementById('curveFill');
    const historyRow = document.getElementById('avHistory');
    const betBtn1 = document.getElementById('betBtn1');
    const allBetBtn = document.getElementById('allBetBtn');
    if(!multVal || !betBtn1 || !allBetBtn) return;

    let roundNum = 4821;
    let multiplier = 1.00;
    let crashPoint = 1.0;
    let phase = 'waiting'; // waiting | flying | crashed
    let bet1Placed = false, bet2Placed = false;
    let rafId;

    // seed some history pills
    const seedHistory = [1.24, 2.87, 1.05, 6.42, 1.98, 1.11, 3.30, 1.67, 12.05, 1.02];
    seedHistory.forEach(v => addHistoryPill(v));

    function addHistoryPill(v){
      const pill = document.createElement('div');
      pill.className = 'hist-pill' + (v >= 10 ? ' big' : v >= 2 ? ' win' : '');
      pill.textContent = v.toFixed(2) + 'x';
      historyRow.appendChild(pill);
      historyRow.scrollLeft = historyRow.scrollWidth;
    }

    function randomCrashPoint(){
      // simple demo-only distribution, skewed toward lower multipliers
      const r = Math.random();
      const val = 0.98 / (1 - r * 0.97);
      return Math.max(1.00, Math.min(val, 40));
    }

    function resetStage(){
      curvePath.setAttribute('d', 'M 0 280 L 0 280');
      curveFill.setAttribute('d', 'M 0 280 L 0 280 L 0 280 Z');
      plane.style.left = '0%';
      plane.style.bottom = '0%';
      multVal.textContent = '1.00x';
      multVal.classList.remove('flying','crashed');
    }

    function startWaiting(){
      phase = 'waiting';
      bet1Placed = false; bet2Placed = false;
      betBtn1.textContent = ''; 
      betBtn1.innerHTML = 'Place bet<span class="sub">Stake locks in when round starts</span>';
      allBetBtn.innerHTML = 'All Bet — max stake<span class="sub">Uses your full demo balance</span>';
      betBtn1.classList.remove('placed');
      allBetBtn.classList.remove('placed');
      resetStage();
      multStatus.textContent = 'Round starting…';
      roundCaption.textContent = 'Round #' + roundNum + ' · waiting for next round';
      let count = 3;
      const waitTimer = setInterval(() => {
        multStatus.textContent = 'Starts in ' + count + '…';
        count--;
        if(count < 0){
          clearInterval(waitTimer);
          startFlight();
        }
      }, 700);
    }

    function startFlight(){
      phase = 'flying';
      roundNum++;
      multiplier = 1.00;
      crashPoint = randomCrashPoint();
      multStatus.textContent = 'Flying…';
      multVal.classList.add('flying');
      roundCaption.textContent = 'Round #' + roundNum + ' · demo simulation';
      const startTime = performance.now();

      function tick(now){
        const t = (now - startTime) / 1000;
        multiplier = 1 + 0.06 * t * t + 0.15 * t;

        if(multiplier >= crashPoint){
          crashNow();
          return;
        }

        multVal.textContent = multiplier.toFixed(2) + 'x';

        // draw curve — simple ease-out path across the stage
        const progress = Math.min(t / 6, 1); // visual progress cap
        const w = 600, h = 280;
        const x = progress * w;
        const y = h - Math.min(progress * progress * h * 1.4, h - 20);
        curvePath.setAttribute('d', `M 0 ${h} Q ${x*0.5} ${h}, ${x} ${y}`);
        curveFill.setAttribute('d', `M 0 ${h} Q ${x*0.5} ${h}, ${x} ${y} L ${x} ${h} Z`);
        plane.style.left = Math.min((x/w)*100, 92) + '%';
        plane.style.bottom = Math.min(((h-y)/h)*82, 78) + '%';

        // auto cash-out check (cosmetic)
        checkAutoCashout('auto1', bet1Placed, betBtn1, (v)=>bet1Placed=v);
        checkAutoCashout('auto2', bet2Placed, allBetBtn, (v)=>bet2Placed=v);

        rafId = requestAnimationFrame(tick);
      }
      rafId = requestAnimationFrame(tick);
    }

    function checkAutoCashout(inputId, placed, btn, setter){
      if(!placed) return;
      const raw = document.getElementById(inputId).value.replace('x','').trim();
      const target = parseFloat(raw);
      if(!isNaN(target) && multiplier >= target){
        setter(false);
        btn.classList.remove('placed');
        btn.innerHTML = 'Cashed out at ' + multiplier.toFixed(2) + 'x<span class="sub">Demo winnings credited</span>';
        showToast('Cashed out at ' + multiplier.toFixed(2) + 'x (demo)');
      }
    }

    function crashNow(){
      phase = 'crashed';
      cancelAnimationFrame(rafId);
      multVal.textContent = crashPoint.toFixed(2) + 'x';
      multVal.classList.remove('flying');
      multVal.classList.add('crashed');
      multStatus.textContent = 'Flew away!';
      addHistoryPill(crashPoint);

      if(bet1Placed){
        betBtn1.innerHTML = 'Round crashed — lost stake<span class="sub">Demo balance adjusted</span>';
      }
      if(bet2Placed){
        allBetBtn.innerHTML = 'Round crashed — lost stake<span class="sub">Demo balance adjusted</span>';
      }

      setTimeout(startWaiting, 2200);
    }

    // stake chips
    document.querySelectorAll('.stake-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const target = document.getElementById(chip.dataset.target);
        if(chip.dataset.reset){
          target.value = '0';
        } else {
          const cur = parseInt(target.value) || 0;
          target.value = cur + parseInt(chip.dataset.val);
        }
      });
    });

    // place bet buttons — cosmetic
    betBtn1.addEventListener('click', () => {
      if(phase !== 'waiting'){ showToast('Wait for the next round to place a bet'); return; }
      bet1Placed = !bet1Placed;
      betBtn1.classList.toggle('placed', bet1Placed);
      betBtn1.innerHTML = bet1Placed
        ? 'Cancel bet<span class="sub">Stake: KES ' + (document.getElementById('stake1').value || 0) + '</span>'
        : 'Place bet<span class="sub">Stake locks in when round starts</span>';
      if(bet1Placed) showToast('Bet placed for next round (demo)');
    });

    allBetBtn.addEventListener('click', () => {
      if(phase !== 'waiting'){ showToast('Wait for the next round to place a bet'); return; }
      document.getElementById('stake2').value = '10000';
      bet2Placed = !bet2Placed;
      allBetBtn.classList.toggle('placed', bet2Placed);
      allBetBtn.innerHTML = bet2Placed
        ? 'Cancel All Bet<span class="sub">Full demo balance staked</span>'
        : 'All Bet — max stake<span class="sub">Uses your full demo balance</span>';
      if(bet2Placed) showToast('All Bet placed — full demo balance staked');
    });

    startWaiting();
  })();

})();

/* JavaScript for page-wallet */
(function(){
  if (!document.body.classList.contains('page-wallet')) return;

  // ===== Auth modal — cosmetic only. Client-side validation + a fake per-tab session (sessionStorage). =====
  // No account is ever created, no credentials are sent anywhere or persisted beyond this browser tab.
  const backdrop = document.getElementById('modalBackdrop');
  const modalTitle = document.getElementById('modalTitle');

  function switchModalTab(formId){
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.form === formId));
    document.querySelectorAll('.modal-form').forEach(f => f.classList.toggle('active', f.id === formId));
    modalTitle.textContent = formId === 'signupForm' ? 'Create demo account' : 'Welcome back';
  }
  document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => switchModalTab(tab.dataset.form));
  });

  const openModal = (formId) => { switchModalTab(formId || 'loginForm'); backdrop.classList.add('open'); };
  document.getElementById('loginBtn').addEventListener('click', () => openModal('loginForm'));
  document.getElementById('signupBtn').addEventListener('click', () => openModal('signupForm'));
  document.getElementById('heroSignup')?.addEventListener('click', () => openModal('signupForm'));
  document.getElementById('modalClose').addEventListener('click', () => backdrop.classList.remove('open'));
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.classList.remove('open'); });

  function setError(fieldId, show){
    document.getElementById(fieldId).classList.toggle('has-error', show);
  }
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const emailOk = isValidEmail(email);
    const passOk = password.length >= 6;
    setError('loginEmailField', !emailOk);
    setError('loginPasswordField', !passOk);
    if(!emailOk || !passOk) return;
    startFakeSession(email.split('@')[0]);
  });

  document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const nameOk = name.length > 0;
    const emailOk = isValidEmail(email);
    const passOk = password.length >= 6;
    const confirmOk = passOk && password === confirm;
    setError('signupNameField', !nameOk);
    setError('signupEmailField', !emailOk);
    setError('signupPasswordField', !passOk);
    setError('signupConfirmField', !confirmOk);
    if(!nameOk || !emailOk || !passOk || !confirmOk) return;
    startFakeSession(name);
  });

  function startFakeSession(name){
    sessionStorage.setItem('saccaia-demo-user', name);
    backdrop.classList.remove('open');
    applySessionUI(name);
    showToast('Signed in as ' + name + ' — demo session only, nothing was sent to a server');
  }

  function applySessionUI(name){
    document.getElementById('loggedOutActions').style.display = 'none';
    document.getElementById('accountMenu').style.display = 'block';
    document.getElementById('accountName').textContent = name;
    document.getElementById('accountAvatar').textContent = name.charAt(0).toUpperCase();
  }

  function clearSessionUI(){
    document.getElementById('loggedOutActions').style.display = 'flex';
    document.getElementById('accountMenu').style.display = 'none';
    document.getElementById('accountDropdown').classList.remove('open');
  }

  document.getElementById('accountChip').addEventListener('click', () => {
    document.getElementById('accountDropdown').classList.toggle('open');
  });
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('saccaia-demo-user');
    clearSessionUI();
    showToast('Logged out (demo session ended)');
  });
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('accountMenu');
    if(menu.style.display !== 'none' && !menu.contains(e.target)){
      document.getElementById('accountDropdown').classList.remove('open');
    }
  });

  // Restore session on reload within the same tab
  const existingUser = sessionStorage.getItem('saccaia-demo-user');
  if(existingUser) applySessionUI(existingUser);

  // Odds selection — cosmetic only, toggles style, updates bet slip pane, shows toast
  function renderSlip(){
    const selected = document.querySelectorAll('.odd-btn.selected');
    const pane = document.getElementById('slipPane');
    if(!pane) return;
    if(selected.length === 0){
      pane.innerHTML = '<div class="wallet-balance-lbl">Bet slip</div><div class="slip-empty" id="slipEmptyMsg">No selections yet — tap any odds button to add it here (demo only).</div>';
      return;
    }
    let rows = '';
    selected.forEach(btn => {
      const match = btn.closest('.match');
      const liveCard = btn.closest('.live-card');
      let teams = 'Selection';
      if(match) teams = match.querySelector('.match-teams').textContent.trim();
      else if(liveCard) teams = liveCard.querySelector('.live-fixture').textContent.trim();
      const lbl = btn.querySelector('.lbl').textContent;
      const val = btn.querySelector('.val').textContent;
      rows += `<div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--line); font-size:13.5px;">
        <span>${teams} <span style="color:rgba(var(--text-rgb),0.5);">(${lbl})</span></span>
        <span style="font-family:var(--mono); font-weight:600; color:var(--gold-dim);">${val}</span>
      </div>`;
    });
    pane.innerHTML = '<div class="wallet-balance-lbl">Bet slip (' + selected.length + ')</div>' + rows +
      '<button class="btn btn-gold" style="width:100%; margin-top:16px;" id="placeSlipBtn">Place bet (demo)</button>';
    const placeBtn = document.getElementById('placeSlipBtn');
    if(placeBtn) placeBtn.addEventListener('click', () => showToast('This is a demo — no real bet was placed'));
  }

  document.querySelectorAll('.odd-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
      if (btn.classList.contains('selected')) showToast('Added to bet slip (demo only)');
      renderSlip();
    });
  });

  // Sport tabs — cosmetic only
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Wallet <-> Bet Slip switcher
  document.querySelectorAll('.wallet-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll('.wallet-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.wallet-pane').forEach(p => p.classList.remove('active'));
      tabBtn.classList.add('active');
      document.getElementById(tabBtn.dataset.pane).classList.add('active');
    });
  });
  document.getElementById('depositBtn')?.addEventListener('click', () => showToast('This is a demo — no real deposit was made'));
  document.getElementById('withdrawBtn')?.addEventListener('click', () => showToast('This is a demo — no real withdrawal was made'));

  // ===== Spin & Win — cosmetic wheel, no real prizes =====
  (function(){
    const prizes = [
      { label: '2x Odds', color: '#F2A93B' },
      { label: 'Try Again', color: '#1B211F' },
      { label: 'Free Bet', color: '#D6472E' },
      { label: 'No Win', color: '#1B211F' },
      { label: '5x Odds', color: '#C98A2C' },
      { label: 'Try Again', color: '#1B211F' },
      { label: 'Cashback', color: '#D6472E' },
      { label: 'No Win', color: '#1B211F' }
    ];
    const seg = 360 / prizes.length;
    const g = document.getElementById('wheelSegments');
    if(!g) return;
    prizes.forEach((p, i) => {
      const start = i * seg;
      const end = start + seg;
      const x1 = 100 + 98 * Math.cos(Math.PI * (start - 90) / 180);
      const y1 = 100 + 98 * Math.sin(Math.PI * (start - 90) / 180);
      const x2 = 100 + 98 * Math.cos(Math.PI * (end - 90) / 180);
      const y2 = 100 + 98 * Math.sin(Math.PI * (end - 90) / 180);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M100,100 L${x1},${y1} A98,98 0 0,1 ${x2},${y2} Z`);
      path.setAttribute('fill', p.color);
      path.setAttribute('stroke', 'var(--surface)');
      path.setAttribute('stroke-width', '1');
      g.appendChild(path);

      const mid = start + seg / 2;
      const tx = 100 + 62 * Math.cos(Math.PI * (mid - 90) / 180);
      const ty = 100 + 62 * Math.sin(Math.PI * (mid - 90) / 180);
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', tx);
      text.setAttribute('y', ty);
      text.setAttribute('fill', '#F4EFE2');
      text.setAttribute('font-size', '9');
      text.setAttribute('font-family', 'IBM Plex Mono, monospace');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('transform', `rotate(${mid}, ${tx}, ${ty})`);
      text.textContent = p.label;
      g.appendChild(text);
    });

    const wheel = document.getElementById('spinWheel');
    const spinBtn = document.getElementById('spinBtn');
    const resultEl = document.getElementById('spinResult');
    let currentRotation = 0;
    let spun = false;

    spinBtn.addEventListener('click', () => {
      if(spun) return;
      spun = true;
      spinBtn.disabled = true;
      resultEl.textContent = 'Spinning…';

      const winIndex = Math.floor(Math.random() * prizes.length);
      const targetMid = winIndex * seg + seg / 2;
      // wheel spins clockwise; pointer is fixed at top (0deg)
      const extraSpins = 5 * 360;
      const rotation = currentRotation + extraSpins + (360 - targetMid);
      currentRotation = rotation;
      wheel.style.transform = `rotate(${rotation}deg)`;

      setTimeout(() => {
        const prize = prizes[winIndex];
        resultEl.textContent = 'Landed on: ' + prize.label + ' (demo only — no real bonus applied)';
        showToast('Spin result: ' + prize.label + ' (demo)');
      }, 4600);
    });
  })();

  // Live badge — flips to LIVE based on the real fixture kickoff time
  (function(){
    const card = document.getElementById('liveCard');
    if(!card) return;
    const badge = document.getElementById('liveBadge');
    const badgeText = document.getElementById('liveBadgeText');
    const kickoff = new Date(card.dataset.kickoff);
    function updateLiveState(){
      const now = new Date();
      if(now >= kickoff){
        badge.classList.add('is-live');
        badgeText.textContent = 'Live';
      } else {
        badge.classList.remove('is-live');
        badgeText.textContent = 'Pre-match';
      }
    }
    updateLiveState();
    setInterval(updateLiveState, 30000);
  })();

  // Dark mode toggle
  const themeToggle = document.getElementById('themeToggle');
  function applyTheme(theme){
    if(theme === 'dark'){
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.textContent = '🌙';
    }
  }
  const savedTheme = localStorage.getItem('saccaia-theme') || 'light';
  applyTheme(savedTheme);
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('saccaia-theme', next);
  });

  // Toast
  let toastTimer;
  // Footer newsletter — cosmetic only
  document.getElementById('footerSubscribe')?.addEventListener('click', () => {
    const val = document.getElementById('footerEmail').value.trim();
    if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)){
      document.getElementById('footerEmail').value = '';
      showToast('Demo only — no email was sent or stored');
    } else {
      showToast('Enter a valid email to try the demo signup');
    }
  });

  function showToast(msg){
    const toast = document.getElementById('slipToast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  // ===== Aviator — local, cosmetic simulation only. No real money, no server, no real RNG-backed outcome. =====
  (function(){
    const multVal = document.getElementById('multVal');
    const multStatus = document.getElementById('multStatus');
    const roundCaption = document.getElementById('roundCaption');
    const plane = document.getElementById('planeEmoji');
    const curvePath = document.getElementById('curvePath');
    const curveFill = document.getElementById('curveFill');
    const historyRow = document.getElementById('avHistory');
    const betBtn1 = document.getElementById('betBtn1');
    const allBetBtn = document.getElementById('allBetBtn');
    if(!multVal || !betBtn1 || !allBetBtn) return;

    let roundNum = 4821;
    let multiplier = 1.00;
    let crashPoint = 1.0;
    let phase = 'waiting'; // waiting | flying | crashed
    let bet1Placed = false, bet2Placed = false;
    let rafId;

    // seed some history pills
    const seedHistory = [1.24, 2.87, 1.05, 6.42, 1.98, 1.11, 3.30, 1.67, 12.05, 1.02];
    seedHistory.forEach(v => addHistoryPill(v));

    function addHistoryPill(v){
      const pill = document.createElement('div');
      pill.className = 'hist-pill' + (v >= 10 ? ' big' : v >= 2 ? ' win' : '');
      pill.textContent = v.toFixed(2) + 'x';
      historyRow.appendChild(pill);
      historyRow.scrollLeft = historyRow.scrollWidth;
    }

    function randomCrashPoint(){
      // simple demo-only distribution, skewed toward lower multipliers
      const r = Math.random();
      const val = 0.98 / (1 - r * 0.97);
      return Math.max(1.00, Math.min(val, 40));
    }

    function resetStage(){
      curvePath.setAttribute('d', 'M 0 280 L 0 280');
      curveFill.setAttribute('d', 'M 0 280 L 0 280 L 0 280 Z');
      plane.style.left = '0%';
      plane.style.bottom = '0%';
      multVal.textContent = '1.00x';
      multVal.classList.remove('flying','crashed');
    }

    function startWaiting(){
      phase = 'waiting';
      bet1Placed = false; bet2Placed = false;
      betBtn1.textContent = ''; 
      betBtn1.innerHTML = 'Place bet<span class="sub">Stake locks in when round starts</span>';
      allBetBtn.innerHTML = 'All Bet — max stake<span class="sub">Uses your full demo balance</span>';
      betBtn1.classList.remove('placed');
      allBetBtn.classList.remove('placed');
      resetStage();
      multStatus.textContent = 'Round starting…';
      roundCaption.textContent = 'Round #' + roundNum + ' · waiting for next round';
      let count = 3;
      const waitTimer = setInterval(() => {
        multStatus.textContent = 'Starts in ' + count + '…';
        count--;
        if(count < 0){
          clearInterval(waitTimer);
          startFlight();
        }
      }, 700);
    }

    function startFlight(){
      phase = 'flying';
      roundNum++;
      multiplier = 1.00;
      crashPoint = randomCrashPoint();
      multStatus.textContent = 'Flying…';
      multVal.classList.add('flying');
      roundCaption.textContent = 'Round #' + roundNum + ' · demo simulation';
      const startTime = performance.now();

      function tick(now){
        const t = (now - startTime) / 1000;
        multiplier = 1 + 0.06 * t * t + 0.15 * t;

        if(multiplier >= crashPoint){
          crashNow();
          return;
        }

        multVal.textContent = multiplier.toFixed(2) + 'x';

        // draw curve — simple ease-out path across the stage
        const progress = Math.min(t / 6, 1); // visual progress cap
        const w = 600, h = 280;
        const x = progress * w;
        const y = h - Math.min(progress * progress * h * 1.4, h - 20);
        curvePath.setAttribute('d', `M 0 ${h} Q ${x*0.5} ${h}, ${x} ${y}`);
        curveFill.setAttribute('d', `M 0 ${h} Q ${x*0.5} ${h}, ${x} ${y} L ${x} ${h} Z`);
        plane.style.left = Math.min((x/w)*100, 92) + '%';
        plane.style.bottom = Math.min(((h-y)/h)*82, 78) + '%';

        // auto cash-out check (cosmetic)
        checkAutoCashout('auto1', bet1Placed, betBtn1, (v)=>bet1Placed=v);
        checkAutoCashout('auto2', bet2Placed, allBetBtn, (v)=>bet2Placed=v);

        rafId = requestAnimationFrame(tick);
      }
      rafId = requestAnimationFrame(tick);
    }

    function checkAutoCashout(inputId, placed, btn, setter){
      if(!placed) return;
      const raw = document.getElementById(inputId).value.replace('x','').trim();
      const target = parseFloat(raw);
      if(!isNaN(target) && multiplier >= target){
        setter(false);
        btn.classList.remove('placed');
        btn.innerHTML = 'Cashed out at ' + multiplier.toFixed(2) + 'x<span class="sub">Demo winnings credited</span>';
        showToast('Cashed out at ' + multiplier.toFixed(2) + 'x (demo)');
      }
    }

    function crashNow(){
      phase = 'crashed';
      cancelAnimationFrame(rafId);
      multVal.textContent = crashPoint.toFixed(2) + 'x';
      multVal.classList.remove('flying');
      multVal.classList.add('crashed');
      multStatus.textContent = 'Flew away!';
      addHistoryPill(crashPoint);

      if(bet1Placed){
        betBtn1.innerHTML = 'Round crashed — lost stake<span class="sub">Demo balance adjusted</span>';
      }
      if(bet2Placed){
        allBetBtn.innerHTML = 'Round crashed — lost stake<span class="sub">Demo balance adjusted</span>';
      }

      setTimeout(startWaiting, 2200);
    }

    // stake chips
    document.querySelectorAll('.stake-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const target = document.getElementById(chip.dataset.target);
        if(chip.dataset.reset){
          target.value = '0';
        } else {
          const cur = parseInt(target.value) || 0;
          target.value = cur + parseInt(chip.dataset.val);
        }
      });
    });

    // place bet buttons — cosmetic
    betBtn1.addEventListener('click', () => {
      if(phase !== 'waiting'){ showToast('Wait for the next round to place a bet'); return; }
      bet1Placed = !bet1Placed;
      betBtn1.classList.toggle('placed', bet1Placed);
      betBtn1.innerHTML = bet1Placed
        ? 'Cancel bet<span class="sub">Stake: KES ' + (document.getElementById('stake1').value || 0) + '</span>'
        : 'Place bet<span class="sub">Stake locks in when round starts</span>';
      if(bet1Placed) showToast('Bet placed for next round (demo)');
    });

    allBetBtn.addEventListener('click', () => {
      if(phase !== 'waiting'){ showToast('Wait for the next round to place a bet'); return; }
      document.getElementById('stake2').value = '10000';
      bet2Placed = !bet2Placed;
      allBetBtn.classList.toggle('placed', bet2Placed);
      allBetBtn.innerHTML = bet2Placed
        ? 'Cancel All Bet<span class="sub">Full demo balance staked</span>'
        : 'All Bet — max stake<span class="sub">Uses your full demo balance</span>';
      if(bet2Placed) showToast('All Bet placed — full demo balance staked');
    });

    startWaiting();
  })();

})();

/* JavaScript for page-index */
(function(){
  if (!document.body.classList.contains('page-index')) return;

  // ============ State ============
  let balance = 5000;
  const selections = new Map();

  function formatKsh(n){ return 'KSh ' + Math.round(n).toLocaleString(); }
  function updateHeaderBalance(){ document.getElementById('header-balance').textContent = formatKsh(balance); }

  function showToast(msg){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  // ============ Theme toggle ============
  const themeToggle = document.getElementById('theme-toggle');
  const iconMoon = document.getElementById('theme-icon-moon');
  const iconSun = document.getElementById('theme-icon-sun');
  themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    iconMoon.style.display = isLight ? 'none' : 'inline';
    iconSun.style.display = isLight ? 'inline' : 'none';
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
  });

  // ============ Promotions carousel ============
  const promoTrack = document.getElementById('promo-track');
  const promoDots = document.querySelectorAll('#promo-dots span');
  let promoIndex = 0;
  function goToPromo(i){
    promoIndex = i;
    const card = promoTrack.children[i];
    if (card) promoTrack.scrollTo({ left: card.offsetLeft - 20, behavior: 'smooth' });
    promoDots.forEach((d, idx) => d.classList.toggle('active', idx === i));
  }
  promoDots.forEach(dot => dot.addEventListener('click', () => goToPromo(parseInt(dot.getAttribute('data-i')))));
  setInterval(() => { goToPromo((promoIndex + 1) % promoDots.length); }, 6000);

  // ============ Market toggle (+ more markets) ============
  document.querySelectorAll('.market-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      const isOpen = panel.classList.toggle('open');
      btn.classList.toggle('open', isOpen);
      btn.firstChild.textContent = isOpen ? 'Hide markets ' : '+ more markets ';
    });
  });

  // ============ Fixture search ============
  const fixtureSearch = document.getElementById('fixture-search');
  if (fixtureSearch){
    fixtureSearch.addEventListener('input', applyFixtureFilters);
  }

  // ============ Quick stake buttons ============
  document.querySelectorAll('.quick-stakes button').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.closest('.slip-footer');
      const input = panel.querySelector('input[type="number"]');
      if (btn.hasAttribute('data-add')){
        const add = parseFloat(btn.getAttribute('data-add'));
        input.value = (parseFloat(input.value) || 0) + add;
      } else if (btn.hasAttribute('data-max')){
        input.value = Math.max(20, Math.floor(balance));
      }
      renderSlip();
    });
  });

  // ============ My Bets ============
  let placedBets = [];
  let betIdCounter = 1;

  function renderMyBets(){
    const list = document.getElementById('mybets-list');
    if (placedBets.length === 0){
      list.innerHTML = '<div class="mybets-empty">No bets placed yet this session.</div>';
      return;
    }
    list.innerHTML = placedBets.slice().reverse().map(bet => `
      <div class="mybet-card">
        <div class="row-top">
          <span class="mybet-status ${bet.status === 'pending' ? 'pending' : 'cashed'}">${bet.status === 'pending' ? 'Pending' : 'Cashed out'}</span>
          <span style="font-size:0.78rem; color:var(--text-muted);">#${bet.id}</span>
        </div>
        ${bet.selections.map(s => `<div class="mybet-sel">${s.pick} <span style="color:var(--gold)">@ ${s.odds.toFixed(2)}</span></div>`).join('')}
        <div class="mybet-nums">
          <span>Stake <b>${formatKsh(bet.stake)}</b></span>
          <span>Potential <b>${formatKsh(bet.potentialWin)}</b></span>
        </div>
        ${bet.status === 'pending' ? `<button class="btn btn-gold btn-sm" style="width:100%; margin-top:10px;" data-cashout="${bet.id}">Cash out for ${formatKsh(bet.stake * bet.totalOdds * 0.85)}</button>` : ''}
      </div>
    `).join('');
  }

  document.getElementById('mybets-list').addEventListener('click', (e) => {
    const id = e.target.getAttribute('data-cashout');
    if (!id) return;
    const bet = placedBets.find(b => b.id === parseInt(id));
    if (!bet || bet.status !== 'pending') return;
    const cashOutValue = Math.round(bet.stake * bet.totalOdds * 0.85);
    balance += cashOutValue;
    bet.status = 'cashed_out';
    updateHeaderBalance();
    renderMyBets();
    showToast('Cashed out for ' + formatKsh(cashOutValue));
  });

  const mybetsOverlay = document.getElementById('mybets-overlay');
  document.getElementById('menu-mybets').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('account-dropdown').classList.remove('open');
    renderMyBets();
    mybetsOverlay.classList.add('open');
  });
  document.getElementById('mybets-close').addEventListener('click', () => mybetsOverlay.classList.remove('open'));
  mybetsOverlay.addEventListener('click', (e) => { if (e.target === mybetsOverlay) mybetsOverlay.classList.remove('open'); });

  // ============ Responsible gambling modal ============
  const rgOverlay = document.getElementById('rg-overlay');
  document.getElementById('menu-rg').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('account-dropdown').classList.remove('open');
    rgOverlay.classList.add('open');
  });
  document.getElementById('rg-close').addEventListener('click', () => rgOverlay.classList.remove('open'));
  rgOverlay.addEventListener('click', (e) => { if (e.target === rgOverlay) rgOverlay.classList.remove('open'); });
  document.getElementById('rg-save').addEventListener('click', () => {
    const val = document.getElementById('rg-deposit-limit').value;
    if (val) showToast('Daily deposit limit set to ' + formatKsh(parseFloat(val)));
    rgOverlay.classList.remove('open');
  });
  document.getElementById('rg-selfexclude').addEventListener('click', (e) => {
    e.preventDefault();
    rgOverlay.classList.remove('open');
    document.getElementById('logout-btn').click();
    showToast('You are self-excluded for 24 hours.');
  });

  // ============ Deposit modal ============
  const depositOverlay = document.getElementById('deposit-overlay');
  const depositFormWrap = document.getElementById('deposit-form-wrap');
  const depositProcessing = document.getElementById('deposit-processing');
  const depositProcessingText = document.getElementById('deposit-processing-text');
  const depositConfirm = document.getElementById('deposit-confirm');
  const depositAmountInput = document.getElementById('deposit-amount');
  const stkPhone = document.getElementById('deposit-stk');
  const pinDots = document.querySelectorAll('#pin-dots .dot');
  let pinDigits = [];
  let pendingDepositAmount = 0;

  function resetPin(){
    pinDigits = [];
    pinDots.forEach(d => d.classList.remove('filled'));
  }

  function openDeposit(){
    depositFormWrap.style.display = 'block';
    depositProcessing.classList.remove('show');
    stkPhone.classList.remove('show');
    depositConfirm.classList.remove('show');
    resetPin();
    depositOverlay.classList.add('open');
  }
  function closeDeposit(){
    depositOverlay.classList.remove('open');
    stkPhone.classList.remove('show');
    depositProcessing.classList.remove('show');
    depositFormWrap.style.display = 'block';
  }

  document.getElementById('deposit-close').addEventListener('click', closeDeposit);
  document.getElementById('deposit-confirm-close').addEventListener('click', closeDeposit);
  depositOverlay.addEventListener('click', (e) => { if (e.target === depositOverlay) closeDeposit(); });

  document.querySelectorAll('.header-actions .btn-ghost.btn-sm').forEach(b => b.addEventListener('click', openDeposit));
  document.querySelectorAll('#hero-cta-auth .btn-gold').forEach(b => b.addEventListener('click', openDeposit));

  document.querySelectorAll('#amount-chips button').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#amount-chips button').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      depositAmountInput.value = chip.getAttribute('data-amount');
    });
  });

  document.getElementById('deposit-submit').addEventListener('click', () => {
    const amount = parseFloat(depositAmountInput.value) || 0;
    const phone = document.getElementById('deposit-phone').value.trim();
    if (amount < 20 || !phone) { showToast('Enter a phone number and an amount of at least KSh 20.'); return; }
    pendingDepositAmount = amount;
    depositFormWrap.style.display = 'none';
    depositProcessingText.textContent = 'Sending payment request to ' + phone + '…';
    depositProcessing.classList.add('show');
    setTimeout(() => {
      depositProcessing.classList.remove('show');
      document.getElementById('stk-amount').textContent = formatKsh(pendingDepositAmount);
      resetPin();
      stkPhone.classList.add('show');
    }, 1400);
  });

  function confirmStkPin(){
    stkPhone.classList.remove('show');
    depositProcessingText.textContent = 'Confirming M-Pesa payment…';
    depositProcessing.classList.add('show');
    setTimeout(() => {
      balance += pendingDepositAmount;
      updateHeaderBalance();
      depositProcessing.classList.remove('show');
      document.getElementById('deposit-confirm-title').textContent = 'Deposit successful — ' + formatKsh(pendingDepositAmount);
      depositConfirm.classList.add('show');
    }, 1300);
  }

  document.querySelectorAll('.keypad button[data-key]').forEach(key => {
    key.addEventListener('click', () => {
      if (pinDigits.length >= 4) return;
      pinDigits.push(key.getAttribute('data-key'));
      pinDots[pinDigits.length - 1].classList.add('filled');
      if (pinDigits.length === 4) setTimeout(confirmStkPin, 250);
    });
  });
  document.getElementById('stk-del').addEventListener('click', () => {
    if (pinDigits.length === 0) return;
    pinDigits.pop();
    pinDots[pinDigits.length].classList.remove('filled');
  });
  document.getElementById('stk-cancel').addEventListener('click', () => {
    stkPhone.classList.remove('show');
    depositFormWrap.style.display = 'block';
    showToast('M-Pesa payment cancelled.');
  });

  // ============ Withdraw modal ============
  const withdrawOverlay = document.getElementById('withdraw-overlay');
  const withdrawFormWrap = document.getElementById('withdraw-form-wrap');
  const withdrawProcessing = document.getElementById('withdraw-processing');
  const withdrawConfirm = document.getElementById('withdraw-confirm');
  const withdrawAmountInput = document.getElementById('withdraw-amount');

  function openWithdraw(){
    document.getElementById('account-dropdown').classList.remove('open');
    document.getElementById('withdraw-available').textContent = formatKsh(balance);
    withdrawFormWrap.style.display = 'block';
    withdrawProcessing.classList.remove('show');
    withdrawConfirm.classList.remove('show');
    document.getElementById('withdraw-insufficient').classList.remove('show');
    withdrawOverlay.classList.add('open');
  }
  function closeWithdraw(){ withdrawOverlay.classList.remove('open'); }

  document.getElementById('menu-withdraw').addEventListener('click', (e) => { e.preventDefault(); openWithdraw(); });
  document.getElementById('withdraw-close').addEventListener('click', closeWithdraw);
  document.getElementById('withdraw-confirm-close').addEventListener('click', closeWithdraw);
  withdrawOverlay.addEventListener('click', (e) => { if (e.target === withdrawOverlay) closeWithdraw(); });

  document.querySelectorAll('#withdraw-chips button').forEach(chip => {
    chip.addEventListener('click', () => {
      const pct = parseFloat(chip.getAttribute('data-pct'));
      withdrawAmountInput.value = Math.floor(balance * pct / 100);
    });
  });

  document.getElementById('withdraw-submit').addEventListener('click', () => {
    const amount = parseFloat(withdrawAmountInput.value) || 0;
    const phone = document.getElementById('withdraw-phone').value.trim();
    const insufficientEl = document.getElementById('withdraw-insufficient');
    if (!phone || amount < 50) { showToast('Enter a phone number and an amount of at least KSh 50.'); return; }
    if (amount > balance) { insufficientEl.classList.add('show'); return; }
    insufficientEl.classList.remove('show');
    withdrawFormWrap.style.display = 'none';
    withdrawProcessing.classList.add('show');
    setTimeout(() => {
      balance -= amount;
      updateHeaderBalance();
      withdrawProcessing.classList.remove('show');
      document.getElementById('withdraw-confirm-title').textContent = 'Withdrawal successful — ' + formatKsh(amount);
      withdrawConfirm.classList.add('show');
    }, 1500);
  });

  // ============ Sport tabs ============
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const sport = tab.getAttribute('data-sport');
      ['football','basketball','rugby','tennis'].forEach(s => {
        const el = document.getElementById('fixture-list-' + s);
        if (el) el.style.display = (s === sport) ? 'block' : 'none';
      });
      document.getElementById('league-filter').style.display = (sport === 'football') ? 'flex' : 'none';
    });
  });

  // ============ League filter + search (combined) ============
  let activeLeague = 'all';
  function applyFixtureFilters(){
    const q = (fixtureSearch ? fixtureSearch.value : '').trim().toLowerCase();
    document.querySelectorAll('#fixture-list-football .fixture').forEach(row => {
      const league = row.querySelector('.league').textContent;
      const text = row.querySelector('.fixture-info').textContent.toLowerCase();
      const matchesLeague = activeLeague === 'all' || league === activeLeague;
      const matchesSearch = !q || text.includes(q);
      row.style.display = (matchesLeague && matchesSearch) ? '' : 'none';
    });
  }
  document.querySelectorAll('.league-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.league-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeLeague = chip.getAttribute('data-league');
      applyFixtureFilters();
    });
  });

  // ============ Auth modal ============
  const overlay = document.getElementById('auth-overlay');
  const modalTitle = document.getElementById('modal-title');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const confirmPanel = document.getElementById('form-confirm');
  const modalTabs = document.querySelectorAll('.modal-tab');

  function setMode(mode){
    modalTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-mode') === mode));
    loginForm.style.display = mode === 'login' ? 'block' : 'none';
    registerForm.style.display = mode === 'register' ? 'block' : 'none';
    confirmPanel.classList.remove('show');
    modalTitle.textContent = mode === 'login' ? 'Log in' : 'Create your account';
  }

  function openModal(mode){ setMode(mode); overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeModal(){ overlay.classList.remove('open'); document.body.style.overflow = ''; }

  document.getElementById('open-login').addEventListener('click', () => openModal('login'));
  document.getElementById('open-register').addEventListener('click', () => openModal('register'));
  document.getElementById('hero-register').addEventListener('click', () => openModal('register'));
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('confirm-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal(); });
  modalTabs.forEach(tab => tab.addEventListener('click', () => setMode(tab.getAttribute('data-mode'))));
  document.querySelectorAll('[data-switch-to]').forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); setMode(link.getAttribute('data-switch-to')); });
  });

  function logIn(){
    document.body.classList.add('logged-in');
    updateHeaderBalance();
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    confirmPanel.classList.add('show');
  }

  loginForm.addEventListener('submit', (e) => { e.preventDefault(); logIn(); });
  registerForm.addEventListener('submit', (e) => { e.preventDefault(); logIn(); });

  // ============ Account dropdown ============
  const accountBtn = document.getElementById('account-btn');
  const accountDropdown = document.getElementById('account-dropdown');
  accountBtn.addEventListener('click', (e) => { e.stopPropagation(); accountDropdown.classList.toggle('open'); });
  document.addEventListener('click', () => accountDropdown.classList.remove('open'));

  document.getElementById('logout-btn').addEventListener('click', () => {
    document.body.classList.remove('logged-in');
    document.body.classList.remove('has-selections');
    accountDropdown.classList.remove('open');
    selections.clear();
    renderSlip();
    showToast('Logged out');
  });

  // ============ Bet slip ============
  function keyFor(match, pick){ return match + '::' + pick; }

  function renderSlip(){
    const items = Array.from(selections.values());
    const count = items.length;
    const totalOdds = items.length ? items.reduce((acc, s) => acc * s.odds, 1) : 0;

    const buildRow = (s) => `
      <div class="slip-item">
        <div class="slip-item-top">
          <div><div class="slip-item-top match">${s.match}</div><div class="slip-item-pick">${s.pick}</div></div>
          <div style="display:flex; align-items:flex-start; gap:10px;">
            <span class="slip-item-odds">${s.odds.toFixed(2)}</span>
            <button class="remove-btn" data-key="${s.key}" aria-label="Remove selection">✕</button>
          </div>
        </div>
      </div>`;
    const rowsHtml = items.map(buildRow).join('');

    document.getElementById('desktop-items').innerHTML = rowsHtml;
    document.getElementById('mobile-items').innerHTML = rowsHtml;

    document.getElementById('desktop-empty').style.display = count ? 'none' : 'block';
    document.getElementById('desktop-footer').style.display = count ? 'block' : 'none';
    const dCount = document.getElementById('desktop-count');
    dCount.style.display = count ? 'inline-block' : 'none';
    dCount.textContent = count;

    document.getElementById('mobile-footer').style.display = count ? 'block' : 'none';
    const isLoggedIn = document.body.classList.contains('logged-in');
    document.getElementById('mobile-bar').classList.toggle('force-hidden', !(isLoggedIn && count > 0));
    document.body.classList.toggle('has-selections', isLoggedIn && count > 0);
    document.getElementById('mobile-bar-text').textContent = count + (count === 1 ? ' selection' : ' selections');

    const stakeD = parseFloat(document.getElementById('desktop-stake').value) || 0;
    const stakeM = parseFloat(document.getElementById('mobile-stake').value) || 0;
    document.getElementById('desktop-total-odds').textContent = totalOdds ? totalOdds.toFixed(2) : '0.00';
    document.getElementById('mobile-total-odds').textContent = totalOdds ? totalOdds.toFixed(2) : '0.00';
    document.getElementById('desktop-potential').textContent = formatKsh(stakeD * totalOdds);
    document.getElementById('mobile-potential').textContent = formatKsh(stakeM * totalOdds);
    document.getElementById('mobile-bar-odds').textContent = count ? 'Total ' + totalOdds.toFixed(2) + ' →' : 'View slip →';

    const dInsufficient = stakeD > balance && count > 0;
    const mInsufficient = stakeM > balance && count > 0;
    document.getElementById('desktop-insufficient').classList.toggle('show', dInsufficient);
    document.getElementById('mobile-insufficient').classList.toggle('show', mInsufficient);
    document.getElementById('desktop-place').disabled = count === 0 || dInsufficient;
    document.getElementById('mobile-place').disabled = count === 0 || mInsufficient;

    document.querySelectorAll('.odds-row[data-match] .odds-btn[data-pick]').forEach(btn => {
      const row = btn.closest('.odds-row');
      const match = row.getAttribute('data-match');
      const pick = btn.getAttribute('data-pick');
      btn.classList.toggle('selected', selections.has(keyFor(match, pick)));
    });
  }

  document.querySelectorAll('.odds-row[data-match] .odds-btn[data-odds]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!document.body.classList.contains('logged-in')) { openModal('login'); return; }
      const row = btn.closest('.odds-row');
      const match = row.getAttribute('data-match');
      const pick = btn.getAttribute('data-pick');
      const odds = parseFloat(btn.getAttribute('data-odds'));
      const k = keyFor(match, pick);
      const label = btn.querySelector('.label').textContent;

      Array.from(selections.keys()).forEach(existingKey => {
        if (existingKey.startsWith(match + '::')) selections.delete(existingKey);
      });
      if (!selections.has(k)) selections.set(k, { key: k, match, pick: match + ' — ' + label, odds });
      renderSlip();
    });
  });

  document.addEventListener('click', (e) => {
    if (e.target.matches('.remove-btn')) { selections.delete(e.target.getAttribute('data-key')); renderSlip(); }
  });

  ['desktop-stake', 'mobile-stake'].forEach(id => document.getElementById(id).addEventListener('input', renderSlip));

  function placeBet(stakeInputId){
    const stake = parseFloat(document.getElementById(stakeInputId).value) || 0;
    const totalOdds = Array.from(selections.values()).reduce((acc, s) => acc * s.odds, 1);
    if (selections.size === 0 || stake > balance || stake <= 0) return;
    balance -= stake;
    updateHeaderBalance();
    placedBets.push({
      id: betIdCounter++,
      selections: Array.from(selections.values()).map(s => ({ pick: s.pick, odds: s.odds })),
      stake, totalOdds, potentialWin: stake * totalOdds, status: 'pending'
    });
    showToast('Bet placed — ' + formatKsh(stake) + ' staked, potential win ' + formatKsh(stake * totalOdds));
    selections.clear();
    renderSlip();
    document.getElementById('slip-overlay').classList.remove('open');
  }
  document.getElementById('desktop-place').addEventListener('click', () => placeBet('desktop-stake'));
  document.getElementById('mobile-place').addEventListener('click', () => placeBet('mobile-stake'));

  // Mobile slip open/close
  const slipOverlay = document.getElementById('slip-overlay');
  document.getElementById('mobile-bar').addEventListener('click', () => slipOverlay.classList.add('open'));
  document.getElementById('slip-close').addEventListener('click', () => slipOverlay.classList.remove('open'));
  slipOverlay.addEventListener('click', (e) => { if (e.target === slipOverlay) slipOverlay.classList.remove('open'); });

  renderSlip();

})();

/* JavaScript for page-saccaia-trading-demo */
(function(){
  if (!document.body.classList.contains('page-saccaia-trading-demo')) return;

  // ===== Order ticket modal (Buy/Sell) — cosmetic only =====
  const orderBackdrop = document.getElementById('orderModalBackdrop');
  const orderModalTitle = document.getElementById('orderModalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const openOrderModal = (title, price) => {
    orderModalTitle.textContent = title;
    if(price) modalPrice.textContent = price;
    orderBackdrop.classList.add('open');
  };
  document.getElementById('orderModalClose').addEventListener('click', () => orderBackdrop.classList.remove('open'));
  orderBackdrop.addEventListener('click', (e) => { if (e.target === orderBackdrop) orderBackdrop.classList.remove('open'); });
  let pendingOrder = null;
  document.getElementById('orderModalSubmit').addEventListener('click', () => {
    orderBackdrop.classList.remove('open');
    if(pendingOrder){
      addOrder(pendingOrder);
      pendingOrder = null;
    }
    showToast('This is a demo — no order was placed');
  });

  document.querySelectorAll('.trade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.mt-row');
      const name = row.dataset.name;
      const price = row.dataset.price;
      const side = btn.classList.contains('buy') ? 'Buy' : 'Sell';
      pendingOrder = { name, price, side };
      openOrderModal(side + ' ' + name, price);
    });
  });

  // ===== Auth modal — cosmetic only. Client-side validation + a fake per-tab session (sessionStorage). =====
  // No account is ever created, no credentials are sent anywhere or persisted beyond this browser tab.
  const backdrop = document.getElementById('modalBackdrop');
  const modalTitle = document.getElementById('modalTitle');

  function switchModalTab(formId){
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.form === formId));
    document.querySelectorAll('.modal-form').forEach(f => f.classList.toggle('active', f.id === formId));
    modalTitle.textContent = formId === 'signupForm' ? 'Create demo account' : 'Welcome back';
  }
  document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => switchModalTab(tab.dataset.form));
  });

  const openModal = (formId) => { switchModalTab(formId || 'loginForm'); backdrop.classList.add('open'); };
  document.getElementById('loginBtn').addEventListener('click', () => openModal('loginForm'));
  document.getElementById('signupBtn').addEventListener('click', () => openModal('signupForm'));
  document.getElementById('heroSignup').addEventListener('click', () => openModal('signupForm'));
  document.getElementById('modalClose').addEventListener('click', () => backdrop.classList.remove('open'));
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.classList.remove('open'); });

  function setError(fieldId, show){
    document.getElementById(fieldId).classList.toggle('has-error', show);
  }
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const emailOk = isValidEmail(email);
    const passOk = password.length >= 6;
    setError('loginEmailField', !emailOk);
    setError('loginPasswordField', !passOk);
    if(!emailOk || !passOk) return;
    startFakeSession(email.split('@')[0]);
  });

  document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const nameOk = name.length > 0;
    const emailOk = isValidEmail(email);
    const passOk = password.length >= 6;
    const confirmOk = passOk && password === confirm;
    setError('signupNameField', !nameOk);
    setError('signupEmailField', !emailOk);
    setError('signupPasswordField', !passOk);
    setError('signupConfirmField', !confirmOk);
    if(!nameOk || !emailOk || !passOk || !confirmOk) return;
    startFakeSession(name);
  });

  function startFakeSession(name){
    sessionStorage.setItem('saccaia-demo-user', name);
    backdrop.classList.remove('open');
    applySessionUI(name);
    showToast('Signed in as ' + name + ' — demo session only, nothing was sent to a server');
  }

  function applySessionUI(name){
    document.getElementById('loggedOutActions').style.display = 'none';
    document.getElementById('accountMenu').style.display = 'block';
    document.getElementById('accountName').textContent = name;
    document.getElementById('accountAvatar').textContent = name.charAt(0).toUpperCase();
  }

  function clearSessionUI(){
    document.getElementById('loggedOutActions').style.display = 'flex';
    document.getElementById('accountMenu').style.display = 'none';
    document.getElementById('accountDropdown').classList.remove('open');
  }

  document.getElementById('accountChip').addEventListener('click', () => {
    document.getElementById('accountDropdown').classList.toggle('open');
  });
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('saccaia-demo-user');
    clearSessionUI();
    showToast('Logged out (demo session ended)');
  });
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('accountMenu');
    if(menu.style.display !== 'none' && !menu.contains(e.target)){
      document.getElementById('accountDropdown').classList.remove('open');
    }
  });

  const existingUser = sessionStorage.getItem('saccaia-demo-user');
  if(existingUser) applySessionUI(existingUser);

  function addOrder(order){
    const pane = document.getElementById('ordersPane');
    const emptyMsg = document.getElementById('ordersEmptyMsg');
    if(emptyMsg) emptyMsg.remove();
    let list = pane.querySelector('.order-list');
    if(!list){
      list = document.createElement('div');
      list.className = 'order-list';
      pane.appendChild(list);
    }
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--line); font-size:13.5px;';
    row.innerHTML = `<span>${order.side} ${order.name}</span><span style="font-family:var(--mono); font-weight:600; color:var(--gold-dim);">${order.price}</span>`;
    list.appendChild(row);
  }

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  document.querySelectorAll('.tf-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.tf-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // Wallet <-> Open Orders switcher
  document.querySelectorAll('.wallet-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll('.wallet-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.wallet-pane').forEach(p => p.classList.remove('active'));
      tabBtn.classList.add('active');
      document.getElementById(tabBtn.dataset.pane).classList.add('active');
    });
  });
  document.getElementById('depositBtn').addEventListener('click', () => showToast('This is a demo — no real deposit was made'));
  document.getElementById('withdrawBtn').addEventListener('click', () => showToast('This is a demo — no real withdrawal was made'));

  // ===== Live tick simulation — nudges the real snapshot prices client-side. =====
  // Not a real market data stream: a genuine live feed needs a paid provider + backend.
  (function(){
    const toggle = document.getElementById('liveToggle');
    const toggleLabel = document.getElementById('liveToggleLabel');
    if(!toggle) return;
    let live = false;
    let tickTimer = null;

    function tick(){
      document.querySelectorAll('.mt-row').forEach(row => {
        const base = parseFloat(row.dataset.price);
        const wiggle = base * (Math.random() - 0.5) * 0.0015; // small simulated move
        const newPrice = base + wiggle;
        row.dataset.price = newPrice.toFixed(newPrice < 10 ? 4 : 2);

        const priceEl = row.querySelector('.mt-val');
        const changeEl = row.querySelector('.mt-change');
        if(priceEl) priceEl.textContent = Number(newPrice).toLocaleString(undefined, {minimumFractionDigits: newPrice < 10 ? 4 : 2, maximumFractionDigits: newPrice < 10 ? 4 : 2});

        if(changeEl){
          const pct = (wiggle / base * 100);
          const up = pct >= 0;
          changeEl.textContent = (up ? '+' : '') + pct.toFixed(2) + '%';
          changeEl.classList.toggle('up', up);
          changeEl.classList.toggle('down', !up);
          row.classList.remove('flash-up', 'flash-down');
          void row.offsetWidth;
          row.classList.add(up ? 'flash-up' : 'flash-down');
        }
      });
    }

    toggle.addEventListener('click', () => {
      live = !live;
      toggle.classList.toggle('on', live);
      toggleLabel.textContent = 'Live ticks: ' + (live ? 'on (simulated)' : 'off');
      if(live){
        tickTimer = setInterval(tick, 2000);
      } else {
        clearInterval(tickTimer);
      }
    });
  })();

  // Dark mode toggle
  const themeToggle = document.getElementById('themeToggle');
  function applyTheme(theme){
    if(theme === 'dark'){
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.textContent = '🌙';
    }
  }
  const savedTheme = localStorage.getItem('saccaia-theme') || 'light';
  applyTheme(savedTheme);
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('saccaia-theme', next);
  });

  let toastTimer;
  function showToast(msg){
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

})();

/* JavaScript for page-trading-how */
(function(){
  if (!document.body.classList.contains('page-trading-how')) return;

  // ===== Order ticket modal (Buy/Sell) — cosmetic only =====
  const orderBackdrop = document.getElementById('orderModalBackdrop');
  const orderModalTitle = document.getElementById('orderModalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const openOrderModal = (title, price) => {
    orderModalTitle.textContent = title;
    if(price) modalPrice.textContent = price;
    orderBackdrop.classList.add('open');
  };
  document.getElementById('orderModalClose').addEventListener('click', () => orderBackdrop.classList.remove('open'));
  orderBackdrop.addEventListener('click', (e) => { if (e.target === orderBackdrop) orderBackdrop.classList.remove('open'); });
  let pendingOrder = null;
  document.getElementById('orderModalSubmit').addEventListener('click', () => {
    orderBackdrop.classList.remove('open');
    if(pendingOrder){
      addOrder(pendingOrder);
      pendingOrder = null;
    }
    showToast('This is a demo — no order was placed');
  });

  document.querySelectorAll('.trade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.mt-row');
      const name = row.dataset.name;
      const price = row.dataset.price;
      const side = btn.classList.contains('buy') ? 'Buy' : 'Sell';
      pendingOrder = { name, price, side };
      openOrderModal(side + ' ' + name, price);
    });
  });

  // ===== Auth modal — cosmetic only. Client-side validation + a fake per-tab session (sessionStorage). =====
  // No account is ever created, no credentials are sent anywhere or persisted beyond this browser tab.
  const backdrop = document.getElementById('modalBackdrop');
  const modalTitle = document.getElementById('modalTitle');

  function switchModalTab(formId){
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.form === formId));
    document.querySelectorAll('.modal-form').forEach(f => f.classList.toggle('active', f.id === formId));
    modalTitle.textContent = formId === 'signupForm' ? 'Create demo account' : 'Welcome back';
  }
  document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => switchModalTab(tab.dataset.form));
  });

  const openModal = (formId) => { switchModalTab(formId || 'loginForm'); backdrop.classList.add('open'); };
  document.getElementById('loginBtn').addEventListener('click', () => openModal('loginForm'));
  document.getElementById('signupBtn').addEventListener('click', () => openModal('signupForm'));
  document.getElementById('heroSignup')?.addEventListener('click', () => openModal('signupForm'));
  document.getElementById('modalClose').addEventListener('click', () => backdrop.classList.remove('open'));
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.classList.remove('open'); });

  function setError(fieldId, show){
    document.getElementById(fieldId).classList.toggle('has-error', show);
  }
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const emailOk = isValidEmail(email);
    const passOk = password.length >= 6;
    setError('loginEmailField', !emailOk);
    setError('loginPasswordField', !passOk);
    if(!emailOk || !passOk) return;
    startFakeSession(email.split('@')[0]);
  });

  document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const nameOk = name.length > 0;
    const emailOk = isValidEmail(email);
    const passOk = password.length >= 6;
    const confirmOk = passOk && password === confirm;
    setError('signupNameField', !nameOk);
    setError('signupEmailField', !emailOk);
    setError('signupPasswordField', !passOk);
    setError('signupConfirmField', !confirmOk);
    if(!nameOk || !emailOk || !passOk || !confirmOk) return;
    startFakeSession(name);
  });

  function startFakeSession(name){
    sessionStorage.setItem('saccaia-demo-user', name);
    backdrop.classList.remove('open');
    applySessionUI(name);
    showToast('Signed in as ' + name + ' — demo session only, nothing was sent to a server');
  }

  function applySessionUI(name){
    document.getElementById('loggedOutActions').style.display = 'none';
    document.getElementById('accountMenu').style.display = 'block';
    document.getElementById('accountName').textContent = name;
    document.getElementById('accountAvatar').textContent = name.charAt(0).toUpperCase();
  }

  function clearSessionUI(){
    document.getElementById('loggedOutActions').style.display = 'flex';
    document.getElementById('accountMenu').style.display = 'none';
    document.getElementById('accountDropdown').classList.remove('open');
  }

  document.getElementById('accountChip').addEventListener('click', () => {
    document.getElementById('accountDropdown').classList.toggle('open');
  });
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('saccaia-demo-user');
    clearSessionUI();
    showToast('Logged out (demo session ended)');
  });
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('accountMenu');
    if(menu.style.display !== 'none' && !menu.contains(e.target)){
      document.getElementById('accountDropdown').classList.remove('open');
    }
  });

  const existingUser = sessionStorage.getItem('saccaia-demo-user');
  if(existingUser) applySessionUI(existingUser);

  function addOrder(order){
    const pane = document.getElementById('ordersPane');
    if(!pane){
      showToast(order.side + ' ' + order.name + ' saved — view it on the Wallet page (demo)');
      return;
    }
    const emptyMsg = document.getElementById('ordersEmptyMsg');
    if(emptyMsg) emptyMsg.remove();
    let list = pane.querySelector('.order-list');
    if(!list){
      list = document.createElement('div');
      list.className = 'order-list';
      pane.appendChild(list);
    }
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--line); font-size:13.5px;';
    row.innerHTML = `<span>${order.side} ${order.name}</span><span style="font-family:var(--mono); font-weight:600; color:var(--gold-dim);">${order.price}</span>`;
    list.appendChild(row);
  }

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  document.querySelectorAll('.tf-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.tf-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // Wallet <-> Open Orders switcher
  document.querySelectorAll('.wallet-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll('.wallet-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.wallet-pane').forEach(p => p.classList.remove('active'));
      tabBtn.classList.add('active');
      document.getElementById(tabBtn.dataset.pane).classList.add('active');
    });
  });
  document.getElementById('depositBtn')?.addEventListener('click', () => showToast('This is a demo — no real deposit was made'));
  document.getElementById('withdrawBtn')?.addEventListener('click', () => showToast('This is a demo — no real withdrawal was made'));

  // ===== Live tick simulation — nudges the real snapshot prices client-side. =====
  // Not a real market data stream: a genuine live feed needs a paid provider + backend.
  (function(){
    const toggle = document.getElementById('liveToggle');
    const toggleLabel = document.getElementById('liveToggleLabel');
    if(!toggle) return;
    let live = false;
    let tickTimer = null;

    function tick(){
      document.querySelectorAll('.mt-row').forEach(row => {
        const base = parseFloat(row.dataset.price);
        const wiggle = base * (Math.random() - 0.5) * 0.0015; // small simulated move
        const newPrice = base + wiggle;
        row.dataset.price = newPrice.toFixed(newPrice < 10 ? 4 : 2);

        const priceEl = row.querySelector('.mt-val');
        const changeEl = row.querySelector('.mt-change');
        if(priceEl) priceEl.textContent = Number(newPrice).toLocaleString(undefined, {minimumFractionDigits: newPrice < 10 ? 4 : 2, maximumFractionDigits: newPrice < 10 ? 4 : 2});

        if(changeEl){
          const pct = (wiggle / base * 100);
          const up = pct >= 0;
          changeEl.textContent = (up ? '+' : '') + pct.toFixed(2) + '%';
          changeEl.classList.toggle('up', up);
          changeEl.classList.toggle('down', !up);
          row.classList.remove('flash-up', 'flash-down');
          void row.offsetWidth;
          row.classList.add(up ? 'flash-up' : 'flash-down');
        }
      });
    }

    toggle.addEventListener('click', () => {
      live = !live;
      toggle.classList.toggle('on', live);
      toggleLabel.textContent = 'Live ticks: ' + (live ? 'on (simulated)' : 'off');
      if(live){
        tickTimer = setInterval(tick, 2000);
      } else {
        clearInterval(tickTimer);
      }
    });
  })();

  // Dark mode toggle
  const themeToggle = document.getElementById('themeToggle');
  function applyTheme(theme){
    if(theme === 'dark'){
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.textContent = '🌙';
    }
  }
  const savedTheme = localStorage.getItem('saccaia-theme') || 'light';
  applyTheme(savedTheme);
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('saccaia-theme', next);
  });

  let toastTimer;
  // Footer newsletter — cosmetic only
  document.getElementById('footerSubscribe')?.addEventListener('click', () => {
    const val = document.getElementById('footerEmail').value.trim();
    if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)){
      document.getElementById('footerEmail').value = '';
      showToast('Demo only — no email was sent or stored');
    } else {
      showToast('Enter a valid email to try the demo signup');
    }
  });

  function showToast(msg){
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

})();

/* JavaScript for page-trading-markets */
(function(){
  if (!document.body.classList.contains('page-trading-markets')) return;

  // ===== Order ticket modal (Buy/Sell) — cosmetic only =====
  const orderBackdrop = document.getElementById('orderModalBackdrop');
  const orderModalTitle = document.getElementById('orderModalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const openOrderModal = (title, price) => {
    orderModalTitle.textContent = title;
    if(price) modalPrice.textContent = price;
    orderBackdrop.classList.add('open');
  };
  document.getElementById('orderModalClose').addEventListener('click', () => orderBackdrop.classList.remove('open'));
  orderBackdrop.addEventListener('click', (e) => { if (e.target === orderBackdrop) orderBackdrop.classList.remove('open'); });
  let pendingOrder = null;
  document.getElementById('orderModalSubmit').addEventListener('click', () => {
    orderBackdrop.classList.remove('open');
    if(pendingOrder){
      addOrder(pendingOrder);
      pendingOrder = null;
    }
    showToast('This is a demo — no order was placed');
  });

  document.querySelectorAll('.trade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.mt-row');
      const name = row.dataset.name;
      const price = row.dataset.price;
      const side = btn.classList.contains('buy') ? 'Buy' : 'Sell';
      pendingOrder = { name, price, side };
      openOrderModal(side + ' ' + name, price);
    });
  });

  // ===== Auth modal — cosmetic only. Client-side validation + a fake per-tab session (sessionStorage). =====
  // No account is ever created, no credentials are sent anywhere or persisted beyond this browser tab.
  const backdrop = document.getElementById('modalBackdrop');
  const modalTitle = document.getElementById('modalTitle');

  function switchModalTab(formId){
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.form === formId));
    document.querySelectorAll('.modal-form').forEach(f => f.classList.toggle('active', f.id === formId));
    modalTitle.textContent = formId === 'signupForm' ? 'Create demo account' : 'Welcome back';
  }
  document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => switchModalTab(tab.dataset.form));
  });

  const openModal = (formId) => { switchModalTab(formId || 'loginForm'); backdrop.classList.add('open'); };
  document.getElementById('loginBtn').addEventListener('click', () => openModal('loginForm'));
  document.getElementById('signupBtn').addEventListener('click', () => openModal('signupForm'));
  document.getElementById('heroSignup')?.addEventListener('click', () => openModal('signupForm'));
  document.getElementById('modalClose').addEventListener('click', () => backdrop.classList.remove('open'));
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.classList.remove('open'); });

  function setError(fieldId, show){
    document.getElementById(fieldId).classList.toggle('has-error', show);
  }
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const emailOk = isValidEmail(email);
    const passOk = password.length >= 6;
    setError('loginEmailField', !emailOk);
    setError('loginPasswordField', !passOk);
    if(!emailOk || !passOk) return;
    startFakeSession(email.split('@')[0]);
  });

  document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const nameOk = name.length > 0;
    const emailOk = isValidEmail(email);
    const passOk = password.length >= 6;
    const confirmOk = passOk && password === confirm;
    setError('signupNameField', !nameOk);
    setError('signupEmailField', !emailOk);
    setError('signupPasswordField', !passOk);
    setError('signupConfirmField', !confirmOk);
    if(!nameOk || !emailOk || !passOk || !confirmOk) return;
    startFakeSession(name);
  });

  function startFakeSession(name){
    sessionStorage.setItem('saccaia-demo-user', name);
    backdrop.classList.remove('open');
    applySessionUI(name);
    showToast('Signed in as ' + name + ' — demo session only, nothing was sent to a server');
  }

  function applySessionUI(name){
    document.getElementById('loggedOutActions').style.display = 'none';
    document.getElementById('accountMenu').style.display = 'block';
    document.getElementById('accountName').textContent = name;
    document.getElementById('accountAvatar').textContent = name.charAt(0).toUpperCase();
  }

  function clearSessionUI(){
    document.getElementById('loggedOutActions').style.display = 'flex';
    document.getElementById('accountMenu').style.display = 'none';
    document.getElementById('accountDropdown').classList.remove('open');
  }

  document.getElementById('accountChip').addEventListener('click', () => {
    document.getElementById('accountDropdown').classList.toggle('open');
  });
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('saccaia-demo-user');
    clearSessionUI();
    showToast('Logged out (demo session ended)');
  });
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('accountMenu');
    if(menu.style.display !== 'none' && !menu.contains(e.target)){
      document.getElementById('accountDropdown').classList.remove('open');
    }
  });

  const existingUser = sessionStorage.getItem('saccaia-demo-user');
  if(existingUser) applySessionUI(existingUser);

  function addOrder(order){
    const pane = document.getElementById('ordersPane');
    if(!pane){
      showToast(order.side + ' ' + order.name + ' saved — view it on the Wallet page (demo)');
      return;
    }
    const emptyMsg = document.getElementById('ordersEmptyMsg');
    if(emptyMsg) emptyMsg.remove();
    let list = pane.querySelector('.order-list');
    if(!list){
      list = document.createElement('div');
      list.className = 'order-list';
      pane.appendChild(list);
    }
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--line); font-size:13.5px;';
    row.innerHTML = `<span>${order.side} ${order.name}</span><span style="font-family:var(--mono); font-weight:600; color:var(--gold-dim);">${order.price}</span>`;
    list.appendChild(row);
  }

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  document.querySelectorAll('.tf-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.tf-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // Wallet <-> Open Orders switcher
  document.querySelectorAll('.wallet-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll('.wallet-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.wallet-pane').forEach(p => p.classList.remove('active'));
      tabBtn.classList.add('active');
      document.getElementById(tabBtn.dataset.pane).classList.add('active');
    });
  });
  document.getElementById('depositBtn')?.addEventListener('click', () => showToast('This is a demo — no real deposit was made'));
  document.getElementById('withdrawBtn')?.addEventListener('click', () => showToast('This is a demo — no real withdrawal was made'));

  // ===== Live tick simulation — nudges the real snapshot prices client-side. =====
  // Not a real market data stream: a genuine live feed needs a paid provider + backend.
  (function(){
    const toggle = document.getElementById('liveToggle');
    const toggleLabel = document.getElementById('liveToggleLabel');
    if(!toggle) return;
    let live = false;
    let tickTimer = null;

    function tick(){
      document.querySelectorAll('.mt-row').forEach(row => {
        const base = parseFloat(row.dataset.price);
        const wiggle = base * (Math.random() - 0.5) * 0.0015; // small simulated move
        const newPrice = base + wiggle;
        row.dataset.price = newPrice.toFixed(newPrice < 10 ? 4 : 2);

        const priceEl = row.querySelector('.mt-val');
        const changeEl = row.querySelector('.mt-change');
        if(priceEl) priceEl.textContent = Number(newPrice).toLocaleString(undefined, {minimumFractionDigits: newPrice < 10 ? 4 : 2, maximumFractionDigits: newPrice < 10 ? 4 : 2});

        if(changeEl){
          const pct = (wiggle / base * 100);
          const up = pct >= 0;
          changeEl.textContent = (up ? '+' : '') + pct.toFixed(2) + '%';
          changeEl.classList.toggle('up', up);
          changeEl.classList.toggle('down', !up);
          row.classList.remove('flash-up', 'flash-down');
          void row.offsetWidth;
          row.classList.add(up ? 'flash-up' : 'flash-down');
        }
      });
    }

    toggle.addEventListener('click', () => {
      live = !live;
      toggle.classList.toggle('on', live);
      toggleLabel.textContent = 'Live ticks: ' + (live ? 'on (simulated)' : 'off');
      if(live){
        tickTimer = setInterval(tick, 2000);
      } else {
        clearInterval(tickTimer);
      }
    });
  })();

  // Dark mode toggle
  const themeToggle = document.getElementById('themeToggle');
  function applyTheme(theme){
    if(theme === 'dark'){
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.textContent = '🌙';
    }
  }
  const savedTheme = localStorage.getItem('saccaia-theme') || 'light';
  applyTheme(savedTheme);
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('saccaia-theme', next);
  });

  let toastTimer;
  // Footer newsletter — cosmetic only
  document.getElementById('footerSubscribe')?.addEventListener('click', () => {
    const val = document.getElementById('footerEmail').value.trim();
    if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)){
      document.getElementById('footerEmail').value = '';
      showToast('Demo only — no email was sent or stored');
    } else {
      showToast('Enter a valid email to try the demo signup');
    }
  });

  function showToast(msg){
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

})();

/* JavaScript for page-trading-wallet */
(function(){
  if (!document.body.classList.contains('page-trading-wallet')) return;

  // ===== Order ticket modal (Buy/Sell) — cosmetic only =====
  const orderBackdrop = document.getElementById('orderModalBackdrop');
  const orderModalTitle = document.getElementById('orderModalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const openOrderModal = (title, price) => {
    orderModalTitle.textContent = title;
    if(price) modalPrice.textContent = price;
    orderBackdrop.classList.add('open');
  };
  document.getElementById('orderModalClose').addEventListener('click', () => orderBackdrop.classList.remove('open'));
  orderBackdrop.addEventListener('click', (e) => { if (e.target === orderBackdrop) orderBackdrop.classList.remove('open'); });
  let pendingOrder = null;
  document.getElementById('orderModalSubmit').addEventListener('click', () => {
    orderBackdrop.classList.remove('open');
    if(pendingOrder){
      addOrder(pendingOrder);
      pendingOrder = null;
    }
    showToast('This is a demo — no order was placed');
  });

  document.querySelectorAll('.trade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.mt-row');
      const name = row.dataset.name;
      const price = row.dataset.price;
      const side = btn.classList.contains('buy') ? 'Buy' : 'Sell';
      pendingOrder = { name, price, side };
      openOrderModal(side + ' ' + name, price);
    });
  });

  // ===== Auth modal — cosmetic only. Client-side validation + a fake per-tab session (sessionStorage). =====
  // No account is ever created, no credentials are sent anywhere or persisted beyond this browser tab.
  const backdrop = document.getElementById('modalBackdrop');
  const modalTitle = document.getElementById('modalTitle');

  function switchModalTab(formId){
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.form === formId));
    document.querySelectorAll('.modal-form').forEach(f => f.classList.toggle('active', f.id === formId));
    modalTitle.textContent = formId === 'signupForm' ? 'Create demo account' : 'Welcome back';
  }
  document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => switchModalTab(tab.dataset.form));
  });

  const openModal = (formId) => { switchModalTab(formId || 'loginForm'); backdrop.classList.add('open'); };
  document.getElementById('loginBtn').addEventListener('click', () => openModal('loginForm'));
  document.getElementById('signupBtn').addEventListener('click', () => openModal('signupForm'));
  document.getElementById('heroSignup')?.addEventListener('click', () => openModal('signupForm'));
  document.getElementById('modalClose').addEventListener('click', () => backdrop.classList.remove('open'));
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.classList.remove('open'); });

  function setError(fieldId, show){
    document.getElementById(fieldId).classList.toggle('has-error', show);
  }
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const emailOk = isValidEmail(email);
    const passOk = password.length >= 6;
    setError('loginEmailField', !emailOk);
    setError('loginPasswordField', !passOk);
    if(!emailOk || !passOk) return;
    startFakeSession(email.split('@')[0]);
  });

  document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const nameOk = name.length > 0;
    const emailOk = isValidEmail(email);
    const passOk = password.length >= 6;
    const confirmOk = passOk && password === confirm;
    setError('signupNameField', !nameOk);
    setError('signupEmailField', !emailOk);
    setError('signupPasswordField', !passOk);
    setError('signupConfirmField', !confirmOk);
    if(!nameOk || !emailOk || !passOk || !confirmOk) return;
    startFakeSession(name);
  });

  function startFakeSession(name){
    sessionStorage.setItem('saccaia-demo-user', name);
    backdrop.classList.remove('open');
    applySessionUI(name);
    showToast('Signed in as ' + name + ' — demo session only, nothing was sent to a server');
  }

  function applySessionUI(name){
    document.getElementById('loggedOutActions').style.display = 'none';
    document.getElementById('accountMenu').style.display = 'block';
    document.getElementById('accountName').textContent = name;
    document.getElementById('accountAvatar').textContent = name.charAt(0).toUpperCase();
  }

  function clearSessionUI(){
    document.getElementById('loggedOutActions').style.display = 'flex';
    document.getElementById('accountMenu').style.display = 'none';
    document.getElementById('accountDropdown').classList.remove('open');
  }

  document.getElementById('accountChip').addEventListener('click', () => {
    document.getElementById('accountDropdown').classList.toggle('open');
  });
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('saccaia-demo-user');
    clearSessionUI();
    showToast('Logged out (demo session ended)');
  });
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('accountMenu');
    if(menu.style.display !== 'none' && !menu.contains(e.target)){
      document.getElementById('accountDropdown').classList.remove('open');
    }
  });

  const existingUser = sessionStorage.getItem('saccaia-demo-user');
  if(existingUser) applySessionUI(existingUser);

  function addOrder(order){
    const pane = document.getElementById('ordersPane');
    if(!pane){
      showToast(order.side + ' ' + order.name + ' saved — view it on the Wallet page (demo)');
      return;
    }
    const emptyMsg = document.getElementById('ordersEmptyMsg');
    if(emptyMsg) emptyMsg.remove();
    let list = pane.querySelector('.order-list');
    if(!list){
      list = document.createElement('div');
      list.className = 'order-list';
      pane.appendChild(list);
    }
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--line); font-size:13.5px;';
    row.innerHTML = `<span>${order.side} ${order.name}</span><span style="font-family:var(--mono); font-weight:600; color:var(--gold-dim);">${order.price}</span>`;
    list.appendChild(row);
  }

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  document.querySelectorAll('.tf-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.tf-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // Wallet <-> Open Orders switcher
  document.querySelectorAll('.wallet-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll('.wallet-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.wallet-pane').forEach(p => p.classList.remove('active'));
      tabBtn.classList.add('active');
      document.getElementById(tabBtn.dataset.pane).classList.add('active');
    });
  });
  document.getElementById('depositBtn')?.addEventListener('click', () => showToast('This is a demo — no real deposit was made'));
  document.getElementById('withdrawBtn')?.addEventListener('click', () => showToast('This is a demo — no real withdrawal was made'));

  // ===== Live tick simulation — nudges the real snapshot prices client-side. =====
  // Not a real market data stream: a genuine live feed needs a paid provider + backend.
  (function(){
    const toggle = document.getElementById('liveToggle');
    const toggleLabel = document.getElementById('liveToggleLabel');
    if(!toggle) return;
    let live = false;
    let tickTimer = null;

    function tick(){
      document.querySelectorAll('.mt-row').forEach(row => {
        const base = parseFloat(row.dataset.price);
        const wiggle = base * (Math.random() - 0.5) * 0.0015; // small simulated move
        const newPrice = base + wiggle;
        row.dataset.price = newPrice.toFixed(newPrice < 10 ? 4 : 2);

        const priceEl = row.querySelector('.mt-val');
        const changeEl = row.querySelector('.mt-change');
        if(priceEl) priceEl.textContent = Number(newPrice).toLocaleString(undefined, {minimumFractionDigits: newPrice < 10 ? 4 : 2, maximumFractionDigits: newPrice < 10 ? 4 : 2});

        if(changeEl){
          const pct = (wiggle / base * 100);
          const up = pct >= 0;
          changeEl.textContent = (up ? '+' : '') + pct.toFixed(2) + '%';
          changeEl.classList.toggle('up', up);
          changeEl.classList.toggle('down', !up);
          row.classList.remove('flash-up', 'flash-down');
          void row.offsetWidth;
          row.classList.add(up ? 'flash-up' : 'flash-down');
        }
      });
    }

    toggle.addEventListener('click', () => {
      live = !live;
      toggle.classList.toggle('on', live);
      toggleLabel.textContent = 'Live ticks: ' + (live ? 'on (simulated)' : 'off');
      if(live){
        tickTimer = setInterval(tick, 2000);
      } else {
        clearInterval(tickTimer);
      }
    });
  })();

  // Dark mode toggle
  const themeToggle = document.getElementById('themeToggle');
  function applyTheme(theme){
    if(theme === 'dark'){
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.textContent = '🌙';
    }
  }
  const savedTheme = localStorage.getItem('saccaia-theme') || 'light';
  applyTheme(savedTheme);
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('saccaia-theme', next);
  });

  let toastTimer;
  // Footer newsletter — cosmetic only
  document.getElementById('footerSubscribe')?.addEventListener('click', () => {
    const val = document.getElementById('footerEmail').value.trim();
    if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)){
      document.getElementById('footerEmail').value = '';
      showToast('Demo only — no email was sent or stored');
    } else {
      showToast('Enter a valid email to try the demo signup');
    }
  });

  function showToast(msg){
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

})();

/* JavaScript for page-trading */
(function(){
  if (!document.body.classList.contains('page-trading')) return;

  // ===== Order ticket modal (Buy/Sell) — cosmetic only =====
  const orderBackdrop = document.getElementById('orderModalBackdrop');
  const orderModalTitle = document.getElementById('orderModalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const openOrderModal = (title, price) => {
    orderModalTitle.textContent = title;
    if(price) modalPrice.textContent = price;
    orderBackdrop.classList.add('open');
  };
  document.getElementById('orderModalClose').addEventListener('click', () => orderBackdrop.classList.remove('open'));
  orderBackdrop.addEventListener('click', (e) => { if (e.target === orderBackdrop) orderBackdrop.classList.remove('open'); });
  let pendingOrder = null;
  document.getElementById('orderModalSubmit').addEventListener('click', () => {
    orderBackdrop.classList.remove('open');
    if(pendingOrder){
      addOrder(pendingOrder);
      pendingOrder = null;
    }
    showToast('This is a demo — no order was placed');
  });

  document.querySelectorAll('.trade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.mt-row');
      const name = row.dataset.name;
      const price = row.dataset.price;
      const side = btn.classList.contains('buy') ? 'Buy' : 'Sell';
      pendingOrder = { name, price, side };
      openOrderModal(side + ' ' + name, price);
    });
  });

  // ===== Auth modal — cosmetic only. Client-side validation + a fake per-tab session (sessionStorage). =====
  // No account is ever created, no credentials are sent anywhere or persisted beyond this browser tab.
  const backdrop = document.getElementById('modalBackdrop');
  const modalTitle = document.getElementById('modalTitle');

  function switchModalTab(formId){
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.form === formId));
    document.querySelectorAll('.modal-form').forEach(f => f.classList.toggle('active', f.id === formId));
    modalTitle.textContent = formId === 'signupForm' ? 'Create demo account' : 'Welcome back';
  }
  document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => switchModalTab(tab.dataset.form));
  });

  const openModal = (formId) => { switchModalTab(formId || 'loginForm'); backdrop.classList.add('open'); };
  document.getElementById('loginBtn').addEventListener('click', () => openModal('loginForm'));
  document.getElementById('signupBtn').addEventListener('click', () => openModal('signupForm'));
  document.getElementById('heroSignup')?.addEventListener('click', () => openModal('signupForm'));
  document.getElementById('modalClose').addEventListener('click', () => backdrop.classList.remove('open'));
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.classList.remove('open'); });

  function setError(fieldId, show){
    document.getElementById(fieldId).classList.toggle('has-error', show);
  }
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const emailOk = isValidEmail(email);
    const passOk = password.length >= 6;
    setError('loginEmailField', !emailOk);
    setError('loginPasswordField', !passOk);
    if(!emailOk || !passOk) return;
    startFakeSession(email.split('@')[0]);
  });

  document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const nameOk = name.length > 0;
    const emailOk = isValidEmail(email);
    const passOk = password.length >= 6;
    const confirmOk = passOk && password === confirm;
    setError('signupNameField', !nameOk);
    setError('signupEmailField', !emailOk);
    setError('signupPasswordField', !passOk);
    setError('signupConfirmField', !confirmOk);
    if(!nameOk || !emailOk || !passOk || !confirmOk) return;
    startFakeSession(name);
  });

  function startFakeSession(name){
    sessionStorage.setItem('saccaia-demo-user', name);
    backdrop.classList.remove('open');
    applySessionUI(name);
    showToast('Signed in as ' + name + ' — demo session only, nothing was sent to a server');
  }

  function applySessionUI(name){
    document.getElementById('loggedOutActions').style.display = 'none';
    document.getElementById('accountMenu').style.display = 'block';
    document.getElementById('accountName').textContent = name;
    document.getElementById('accountAvatar').textContent = name.charAt(0).toUpperCase();
  }

  function clearSessionUI(){
    document.getElementById('loggedOutActions').style.display = 'flex';
    document.getElementById('accountMenu').style.display = 'none';
    document.getElementById('accountDropdown').classList.remove('open');
  }

  document.getElementById('accountChip').addEventListener('click', () => {
    document.getElementById('accountDropdown').classList.toggle('open');
  });
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('saccaia-demo-user');
    clearSessionUI();
    showToast('Logged out (demo session ended)');
  });
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('accountMenu');
    if(menu.style.display !== 'none' && !menu.contains(e.target)){
      document.getElementById('accountDropdown').classList.remove('open');
    }
  });

  const existingUser = sessionStorage.getItem('saccaia-demo-user');
  if(existingUser) applySessionUI(existingUser);

  function addOrder(order){
    const pane = document.getElementById('ordersPane');
    if(!pane){
      showToast(order.side + ' ' + order.name + ' saved — view it on the Wallet page (demo)');
      return;
    }
    const emptyMsg = document.getElementById('ordersEmptyMsg');
    if(emptyMsg) emptyMsg.remove();
    let list = pane.querySelector('.order-list');
    if(!list){
      list = document.createElement('div');
      list.className = 'order-list';
      pane.appendChild(list);
    }
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--line); font-size:13.5px;';
    row.innerHTML = `<span>${order.side} ${order.name}</span><span style="font-family:var(--mono); font-weight:600; color:var(--gold-dim);">${order.price}</span>`;
    list.appendChild(row);
  }

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  document.querySelectorAll('.tf-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.tf-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // Wallet <-> Open Orders switcher
  document.querySelectorAll('.wallet-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll('.wallet-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.wallet-pane').forEach(p => p.classList.remove('active'));
      tabBtn.classList.add('active');
      document.getElementById(tabBtn.dataset.pane).classList.add('active');
    });
  });
  document.getElementById('depositBtn')?.addEventListener('click', () => showToast('This is a demo — no real deposit was made'));
  document.getElementById('withdrawBtn')?.addEventListener('click', () => showToast('This is a demo — no real withdrawal was made'));

  // ===== Live tick simulation — nudges the real snapshot prices client-side. =====
  // Not a real market data stream: a genuine live feed needs a paid provider + backend.
  (function(){
    const toggle = document.getElementById('liveToggle');
    const toggleLabel = document.getElementById('liveToggleLabel');
    if(!toggle) return;
    let live = false;
    let tickTimer = null;

    function tick(){
      document.querySelectorAll('.mt-row').forEach(row => {
        const base = parseFloat(row.dataset.price);
        const wiggle = base * (Math.random() - 0.5) * 0.0015; // small simulated move
        const newPrice = base + wiggle;
        row.dataset.price = newPrice.toFixed(newPrice < 10 ? 4 : 2);

        const priceEl = row.querySelector('.mt-val');
        const changeEl = row.querySelector('.mt-change');
        if(priceEl) priceEl.textContent = Number(newPrice).toLocaleString(undefined, {minimumFractionDigits: newPrice < 10 ? 4 : 2, maximumFractionDigits: newPrice < 10 ? 4 : 2});

        if(changeEl){
          const pct = (wiggle / base * 100);
          const up = pct >= 0;
          changeEl.textContent = (up ? '+' : '') + pct.toFixed(2) + '%';
          changeEl.classList.toggle('up', up);
          changeEl.classList.toggle('down', !up);
          row.classList.remove('flash-up', 'flash-down');
          void row.offsetWidth;
          row.classList.add(up ? 'flash-up' : 'flash-down');
        }
      });
    }

    toggle.addEventListener('click', () => {
      live = !live;
      toggle.classList.toggle('on', live);
      toggleLabel.textContent = 'Live ticks: ' + (live ? 'on (simulated)' : 'off');
      if(live){
        tickTimer = setInterval(tick, 2000);
      } else {
        clearInterval(tickTimer);
      }
    });
  })();

  // Dark mode toggle
  const themeToggle = document.getElementById('themeToggle');
  function applyTheme(theme){
    if(theme === 'dark'){
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.textContent = '🌙';
    }
  }
  const savedTheme = localStorage.getItem('saccaia-theme') || 'light';
  applyTheme(savedTheme);
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('saccaia-theme', next);
  });

  let toastTimer;
  // Footer newsletter — cosmetic only
  document.getElementById('footerSubscribe')?.addEventListener('click', () => {
    const val = document.getElementById('footerEmail').value.trim();
    if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)){
      document.getElementById('footerEmail').value = '';
      showToast('Demo only — no email was sent or stored');
    } else {
      showToast('Enter a valid email to try the demo signup');
    }
  });

  function showToast(msg){
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

})();
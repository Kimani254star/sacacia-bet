(function () {
  const empty = (message) => {
    const box = document.createElement('div');
    box.className = 'feed-unavailable';
    box.setAttribute('role', 'status');
    box.textContent = message;
    box.style.cssText = 'padding:18px;margin:12px 0;border:1px solid #b7791f;border-radius:10px;background:rgba(183,121,31,.08);color:inherit;text-align:center;';
    return box;
  };
  function clean() {
    document.querySelectorAll('.match, .fixture, .live-card, .fixture-skel, .snap-row, .mt-row, .market-row').forEach(n => n.remove());
    document.querySelectorAll('.odds-btn, .odd-btn, .trade-btn').forEach(n => { n.disabled = true; n.remove(); });
    document.querySelectorAll('[data-odds], .odds-row, .live-odds, #marketTable, #matches, #liveCard, #liveMatches, #fixtures').forEach(n => {
      if (n && !n.querySelector('.feed-unavailable')) { n.replaceChildren(empty('Live sports and market feed is not connected. No sample data is being shown.')); }
    });
    document.querySelectorAll('#accountName').forEach(n => n.textContent = 'Guest');
    document.querySelectorAll('.demo-banner').forEach(n => n.textContent = 'LIVE DATA NOT CONNECTED — sample fixtures and simulated prices are disabled.');
    document.querySelectorAll('.wallet-balance, #walletBalance, #availableBalance').forEach(n => n.textContent = 'KES 0.00');
    document.querySelectorAll('#spinWheel, #spinBtn, #aviatorGame, #planeEmoji, #curvePath, #curveFill').forEach(n => { if(n) n.remove(); });
    document.querySelectorAll('.game-card, .game-panel').forEach(n => {
      if (/aviator|spin.?win/i.test(n.textContent || '')) n.replaceWith(empty('Game content is unavailable until a licensed, server-authoritative game provider is connected.'));
    });
    document.querySelectorAll('button').forEach(btn => {
      if (/place bet|deposit|withdraw|spin|cash.?out|all bet/i.test(btn.textContent || '')) { btn.disabled = true; btn.title = 'Disabled: production provider is not connected'; }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', clean, { once: true });
  else clean();
})();

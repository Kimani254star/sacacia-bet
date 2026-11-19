(function () {
  'use strict';
  const root = window.ACACIA_BET_CONFIG || {};
  const endpoint = root.flashscoreFeedUrl || '';
  const staleAfterMs = Number(root.flashscoreStaleAfterMs || 5 * 60 * 1000);

  function setStatus(message, state) {
    document.querySelectorAll('[data-flashscore-status]').forEach(el => {
      el.textContent = message;
      el.dataset.feedState = state || 'unavailable';
    });
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function render(events) {
    const target = document.querySelector('[data-flashscore-events]');
    if (!target) return;
    target.replaceChildren();
    if (!events.length) {
      target.textContent = 'No fixtures are currently available from the connected feed.';
      return;
    }
    events.forEach(event => {
      const row = document.createElement('article');
      row.className = 'flashscore-event';
      const home = esc(event.home || event.home_team || 'Home');
      const away = esc(event.away || event.away_team || 'Away');
      const score = event.score ? ' · ' + esc(event.score) : '';
      const status = esc(event.status || 'Scheduled');
      const kickoff = event.start_time ? new Date(event.start_time).toLocaleString() : '';
      row.innerHTML = '<strong>' + home + ' vs ' + away + '</strong>' +
        '<span>' + status + score + '</span>' +
        (kickoff ? '<small>' + esc(kickoff) + '</small>' : '');
      target.appendChild(row);
    });
  }
  async function refresh() {
    if (!endpoint) {
      setStatus('Flashscore data is not connected. Configure the secure feed endpoint; no sample fixtures are shown.', 'unavailable');
      return;
    }
    setStatus('Updating sports data…', 'loading');
    try {
      const response = await fetch(endpoint, { headers: { 'Accept': 'application/json' }, cache: 'no-store' });
      if (!response.ok) throw new Error('Feed returned HTTP ' + response.status);
      const payload = await response.json();
      const fetchedAt = payload.fetched_at ? new Date(payload.fetched_at) : null;
      if (payload.success === false || !Array.isArray(payload.events)) throw new Error('Feed response is not in the expected format.');
      if (fetchedAt && (!Number.isFinite(fetchedAt.getTime()) || Date.now() - fetchedAt.getTime() > staleAfterMs)) {
        setStatus('Sports feed is stale. Data is hidden until a fresh update arrives.', 'stale');
        render([]);
        return;
      }
      render(payload.events);
      setStatus('Flashscore-sourced feed updated' + (fetchedAt ? ' · ' + fetchedAt.toLocaleString() : '') + '.', 'live');
    } catch (error) {
      setStatus('Sports feed unavailable: ' + error.message + '. No demo data is being substituted.', 'error');
    }
  }
  window.AcaciaFlashscoreFeed = { refresh };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refresh, { once: true });
  else refresh();
  window.setInterval(refresh, 5 * 60 * 1000);
})();

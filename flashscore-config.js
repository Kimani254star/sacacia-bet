/* Public client config only. Never put Flashscore/data-provider API keys here. */
window.ACACIA_BET_CONFIG = {
  // Set this to your deployed Supabase Edge Function URL, e.g.
  // https://YOUR_PROJECT.supabase.co/functions/v1/flashscore-feed
  flashscoreFeedUrl: '',
  flashscoreStaleAfterMs: 5 * 60 * 1000
};

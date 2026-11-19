# Flashscore-sourced sports data integration

Acacia Bet now includes a client feed adapter for a **server-side Flashscore-sourced provider**.
It does not scrape Flashscore pages in the browser and does not embed provider secrets.

## Important source / permission note
Flashscore does not publish a supported public developer API. Its published terms restrict
commercial use and copying/aggregating/scraping content without prior written permission.
Use a provider/API only if your contract or written authorization permits the intended
commercial use and redistribution. A third-party API that exposes Flashscore-derived data
is not itself proof of Flashscore authorization or an official partnership.

## Required deployment configuration
1. Obtain an authorized data agreement / API subscription for the intended use.
2. Deploy a Supabase Edge Function at `.../functions/v1/flashscore-feed`.
3. Store the provider API key as an Edge Function secret, never in browser JS.
4. Set `flashscoreFeedUrl` in `flashscore-config.js` to the deployed function URL.
5. Return JSON in this normalized shape:
   `{ "success": true, "fetched_at": "2026-11-19T08:00:00Z", "events": [
     { "home": "Team A", "away": "Team B", "status": "Scheduled",
       "start_time": "2026-11-19T18:00:00Z", "score": null }
   ] }`
6. Schedule server-side refreshes using Supabase Cron / scheduled functions at the
   interval allowed by the provider. Persist `fetched_at`, source event ID, competition,
   status, score and expiry in Supabase. Do not refresh by scraping Flashscore pages.
7. Enforce stale-data handling and hide expired odds. The browser polls the secured
   endpoint every five minutes; this is not a substitute for the server-side refresh job.

## Current status
The archive contains the frontend adapter and setup contract, but **does not contain**
provider credentials, a deployed Edge Function, a confirmed data licence, or a scheduled
Supabase job. Therefore it will show a clear unavailable state until those are configured.
Fixtures/results can be displayed from the feed; odds should only be displayed when the
provider returns valid, fresh market data and the operator has the required authorization.
Real-money wagering, wallet funding and settlement remain disabled pending all legal,
payments, identity, age-verification and responsible-gambling requirements.

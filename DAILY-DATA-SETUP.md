# Daily live-data updates

Bundled prototype fixtures, simulated prices, fake account balances and local game outcomes are disabled by `production-data-guard.js`. The app intentionally shows a feed-unavailable message until a real provider is configured.

## Required before daily updates can run
- A licensed sports fixtures/results/odds provider and API credentials.
- A market-data provider for any trading instruments shown.
- A server-side scheduled job (UTC daily, with provider-specific refresh intervals) that fetches, validates and stores data in Supabase.
- Server-side timestamps (`fetched_at`, `event_start`, `expires_at`) and a stale-data policy. Expired odds must be hidden, never presented as live.
- Supabase Row Level Security and server-side secrets; provider keys must not be placed in browser JavaScript.
- For wagering, the applicable operator licensing, age/identity checks, responsible-gambling controls, payment compliance and server-authoritative bet settlement.

No provider credentials or server-side scheduled job were included in the supplied archive, so automated daily refresh cannot truthfully be enabled yet.

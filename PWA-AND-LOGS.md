# PWA and activity logs

- Install Acacia Bets from a supported browser using Install app / Add to Home Screen after HTTPS deployment.
- Static pages are cached for offline browsing. Supabase authentication and network actions still require connectivity.
- Activity Logs are device-local, limited to 2,000 events, and exportable as CSV. Form values, passwords, payment details and PINs are never recorded.
- Odds, wallet and M-Pesa screens remain demonstrations; no real-money betting, deposits or withdrawals are enabled.


Build Log: `build-log.html` is the in-app release history, linked from the Acacia Bet home navigation and footer. It is separate from `logs.html`, which contains device activity events.

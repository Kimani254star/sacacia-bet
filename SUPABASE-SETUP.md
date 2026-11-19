# Acacia Bet — Supabase connection

This project now uses the same Supabase project as Sweet Flowers Garden VOL 2:
- Project URL: `https://dvyboakfwecqnjqjczur.supabase.co`
- Publishable key is stored in `supabase-config.js`.

## Setup
1. In the shared Supabase project, open SQL Editor and run `supabase/acacia-bet-auth.sql`.
2. In Authentication → Providers, enable Email if using email accounts and Phone if using phone/password accounts. Configure an SMS provider if phone confirmation/OTP is required by your Supabase auth settings.
3. Add your deployed app URLs to Authentication → URL Configuration if email confirmation or password recovery is used.
4. Serve this folder over HTTPS or a local web server (not `file://`).
5. Ensure the existing Supabase project has backups and review RLS before deployment.

## What was wired
- Email/password sign-in and registration on the games/trading pages.
- Phone/password sign-in and registration on the main page.
- Adult-age validation in the browser and a database trigger for phone signups.
- Supabase auth session persistence and sign-out.
- Separate `acb_profiles` table, so it does not collide with Sweet Flowers Garden tables.

## Important
The current Acacia Bet source explicitly describes the odds, bet slip, wallet deposits/withdrawals, Aviator and spin wheel as demo/cosmetic only. This update does not turn them into real-money betting, payment or payout services. No real-money transactions have been implemented. Before any regulated betting operation, obtain required licences and independent legal/compliance review; build payment, KYC/AML, responsible-gambling controls and server-authoritative settlement only through properly authorized services. Never expose a Supabase service-role key, database password or payment-provider secret in frontend code.

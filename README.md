# VDS Online – Supabase backend preparation

This package is a backend implementation package for the existing V83 app. It is **not yet a drop-in replacement for the website frontend**.

## Included
- `supabase/vds_schema.sql`: schema extension and client-deny policies.
- `supabase/functions/vds-api/index.ts`: one Edge Function supporting username login, one-time admin bootstrap, password change, user management, and separate Bidding/Dana state load/save.

## Project configuration
Project URL: `https://gmpedvbzmgrpwsgsyszj.supabase.co`

The publishable key is intended for browser use, but this backend uses it only as the Auth public key. Never put the service-role key in HTML, GitHub, or Vercel public variables.

## Important existing database assumptions
The earlier SQL setup created `public.profiles` and `public.app_state`. The schema file here adds missing columns and denies direct browser access; all access is routed through the Edge Function. Existing RLS policies with different names may remain, so review policies in Supabase before production.

## Deploy the function
1. Install Supabase CLI and sign in.
2. Link the project: `supabase link --project-ref gmpedvbzmgrpwsgsyszj`
3. Set Edge Function secrets in Supabase Dashboard > Edge Functions > Secrets:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY` (use the project's anon/publishable key)
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side secret only)
   - `VDS_BOOTSTRAP_SECRET` (a long random one-time secret)
4. Deploy: `supabase functions deploy vds-api`
5. Run `vds_schema.sql` in Supabase SQL Editor.
6. Bootstrap admin by POSTing to `/functions/v1/vds-api` with header `x-vds-bootstrap-secret` and JSON:
   `{"action":"bootstrap-admin","password":"CHOOSE_A_STRONG_ADMIN_PASSWORD"}`
   Admin username is `septino`. Do not use `123456` for the administrator.
7. Login action: `{"action":"login","username":"septino","password":"..."}`.

## API actions
- `bootstrap-admin` (one-time secret header)
- `login`
- `change-password` (Bearer Supabase access token)
- `list-users` (Admin only)
- `create-user` (Admin only; defaults temporary password to `123456`)
- `update-user` (Admin only; active and/or permissions)
- `reset-password` (Admin only; defaults to `123456` and forces password change)
- `get-state` / `save-state` (Bearer access token; checks Bidding/Dana site permission)

## Critical status
The V83 HTML has not yet been rewritten to call these actions. In particular, its old localStorage account functions and synchronous `persist()` remain. Do not deploy this backend package as if the website were already integrated. The next frontend integration step must replace login, account CRUD, startup state loading, and persistence, then test two separate browser sessions.

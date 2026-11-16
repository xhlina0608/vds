SIAKANG VDS - DATA SPONSOR

PATCH FIX: allow sponsor site in cross-tab session handoff and remembered-session restore.

Contents:
- index.html: updated VDS frontend
- supabase/ADD_DATA_SPONSOR_SUPABASE.sql: database migration
- supabase/functions/vds-api/index.ts: Edge Function source

IMPORTANT:
Back up the currently deployed VDS files and database before applying.
Apply SQL migration and deploy Edge Function only after reviewing the source/configuration.
Then deploy index.html to Vercel.
Do not expose service-role keys in frontend code.

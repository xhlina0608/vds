SIAKANG VDS - DATA SPONSOR ADD-ON

Package contents:
- index.html: frontend updated with a separate DATA SPONSOR website.
- supabase/ADD_DATA_SPONSOR_SUPABASE.sql: one-time migration to permit the new sponsor site in app_state and grant the main admin access.
- supabase/functions/vds-api/index.ts: updated Edge Function source allowing the new sponsor site and siteSponsor permission.

DEPLOY ORDER (IMPORTANT)
1. Back up the currently deployed VDS files and Supabase before changing production.
2. Supabase Dashboard > SQL Editor: run ADD_DATA_SPONSOR_SUPABASE.sql once.
3. Supabase Dashboard > Edge Functions > vds-api: deploy the updated index.ts. Keep the existing function secrets unchanged; never put SERVICE_ROLE_KEY in frontend.
4. Replace the Vercel project's index.html with this package's index.html and deploy.
5. Login as Admin. The portal should show WEBSITE BIDDING, DANA PARAMITA, and DATA SPONSOR.
6. For other users: Manajemen Akun > Atur Izin > enable Akses Website Data Sponsor, Kelola Data Donatur dan Sponsor, and Export PDF Data Sponsor.

DATA SAFETY
- Sponsor data is stored as a separate app_state row with site='sponsor'.
- Existing Bidding and Dana Paramita app_state rows and payloads are not rewritten by the migration.
- The first visit creates an empty sponsor dataset; it does not import or overwrite Bidding/Dana data.
- Donor PDF export sorts amount descending. Sponsor PDF follows input order.
- PDF layout uses the same A4 portrait page dimensions, row height, header size and table font scale as Daftar Harga PDF.

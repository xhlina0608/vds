# SIAKANG VDS — V83 Cloud Integration (deployment candidate)

This package contains the V83 frontend modified to use the Supabase Edge Function `vds-api` for username/password login, user administration, and shared Bidding/Dana state.

## Important status

- The HTML JavaScript was syntax-checked with `node --check`.
- The Edge Function and SQL have not been deployed against your live Supabase project from this workspace; a real login and two-device test are still required.
- Do not replace the current live site until the backend steps below are complete and a backup has been made.
- This version uses a manual **Muat Ulang Cloud** action rather than realtime subscriptions or rapid polling to limit egress.
- State writes are debounced by 1.4 seconds. A save sends the selected workspace JSON as one payload. This minimizes request count, but large datasets still use bandwidth.
- Existing local browser data is migrated automatically only when that workspace's cloud row is empty. Once cloud data exists, it is not silently overwritten by local data.
- Invoice background/layout preferences remain browser-local in this candidate; transaction and workspace state are cloud-backed.

## Project settings used

- Supabase URL: `https://gmpedvbzmgrpwsgsyszj.supabase.co`
- Vercel URL: `https://vds-black.vercel.app`
- GitHub repository: `VDS`
- Admin username: `septino`
- User login does not require entering an email. The backend creates internal synthetic addresses ending in `vds.invalid`.

The publishable key is embedded in the browser HTML. This is intended for public client use. Never put the Supabase `service_role` key in `index.html`, GitHub, or Vercel frontend environment variables.

## Deploy Supabase backend

1. In Supabase SQL Editor, run `supabase/vds_schema.sql`.
2. Install Supabase CLI and log in, then link the project:

   ```bash
   supabase login
   supabase link --project-ref gmpedvbzmgrpwsgsyszj
   ```

3. In Supabase Dashboard > Project Settings > API, copy the **service_role secret** and the legacy **anon public** key. Do not send either secret in chat.
4. Set function secrets locally in your terminal (replace the placeholders):

   ```bash
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_SECRET" SUPABASE_ANON_KEY="YOUR_ANON_PUBLIC_KEY" VDS_BOOTSTRAP_SECRET="A_LONG_RANDOM_ONE_TIME_SECRET"
   ```

   `SUPABASE_URL` is normally provided by Supabase automatically. If it is not, set it to `https://gmpedvbzmgrpwsgsyszj.supabase.co`.

5. Deploy the function:

   ```bash
   supabase functions deploy vds-api --no-verify-jwt
   ```

   `supabase/config.toml` also sets `verify_jwt = false`; the function itself validates bearer tokens for all protected actions and checks the one-time bootstrap secret for admin creation.

## Create the first Admin

After deploying the function, run this from PowerShell (replace the secret and choose a strong Admin password):

```powershell
$body = @{ action = 'bootstrap-admin'; password = 'GANTI_DENGAN_PASSWORD_ADMIN_YANG_KUAT' } | ConvertTo-Json
Invoke-RestMethod -Method Post `
  -Uri 'https://gmpedvbzmgrpwsgsyszj.supabase.co/functions/v1/vds-api' `
  -Headers @{ 'Content-Type'='application/json'; 'apikey'='sb_publishable_KGUwbiUBXU69OPMWn2Irgw_RnEc9Lqp'; 'x-vds-bootstrap-secret'='ISI_SECRET_BOOTSTRAP_YANG_SAMA' } `
  -Body $body
```

Expected result: `ok: true` and username `septino`. No user needs to create or use an email address.

After successful bootstrap, remove `VDS_BOOTSTRAP_SECRET` from function secrets if you do not plan to use bootstrap again. Do not share the Admin password or bootstrap secret.

## Deploy website

1. Make a backup of the current GitHub repository and Vercel deployment.
2. Upload the contents of this package's root (`index.html`, `README.md`, `.gitignore`) to the root of GitHub repository `VDS` and commit.
3. Vercel should build as a static site: Framework Preset `Other`, Build Command empty, Output Directory `.`.
4. Open `https://vds-black.vercel.app`, sign in as `septino`, and select Bidding or Dana Paramita.
5. Test a harmless sample transaction. Wait for the cloud status to say **Tersimpan di cloud**. Open the site on a second computer, sign in, select the same workspace, and click **Muat Ulang Cloud**.

## Egress and conflict notes

- Realtime is not enabled and there is no background polling.
- A workspace is downloaded when opened or when the user explicitly clicks **Muat Ulang Cloud**.
- Each debounced save sends the complete workspace state JSON. For very large histories, this can still be a sizeable transfer. A future optimization would normalize transactions into rows and fetch only changed records.
- Concurrent edits from two computers are last-write-wins at the whole-workspace level. Avoid editing the same workspace simultaneously until row-level conflict handling is implemented.

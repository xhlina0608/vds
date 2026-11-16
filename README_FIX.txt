SIAKANG VDS - FIX DATA SPONSOR CLOUD VALIDATION

Penyebab:
- Frontend sudah memiliki menu/site sponsor, tetapi Edge Function vds-api masih menolak site selain bidding dan dana.
- Handoff tab baru dan pemulihan sesi sebelumnya juga belum sepenuhnya menerima sponsor.

Isi paket:
1. index.html                         Frontend dengan perbaikan alur sponsor.
2. vds-api/index.ts                   Edge Function vds-api yang menerima site sponsor dan memeriksa izin siteSponsor.
3. ADD_DATA_SPONSOR_SUPABASE.sql      Migrasi constraint app_state + izin admin utama.

URUTAN DEPLOY (PENTING):
1. Backup project Vercel dan kode Edge Function yang sedang aktif.
2. Jalankan ADD_DATA_SPONSOR_SUPABASE.sql di Supabase SQL Editor.
3. Deploy folder vds-api sebagai Edge Function bernama vds-api, dengan environment secrets lama tetap dipertahankan:
   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, VDS_BOOTSTRAP_SECRET.
   Jangan mengganti atau membagikan nilai secret.
4. Ganti index.html pada project Vercel dengan file index.html dalam paket, lalu deploy.
5. Login sebagai admin, buka DATA SPONSOR, dan uji muat data.
6. Untuk akun non-admin yang perlu akses, aktifkan permission siteSponsor melalui Manajemen Akun.

Catatan keamanan/data:
- Perubahan backend hanya menambahkan site sponsor pada allowlist dan memetakan izin ke siteSponsor.
- Data Bidding dan Dana Paramita tidak dihapus atau dimigrasikan.
- Data Sponsor disimpan pada site='sponsor' secara terpisah.
- Jangan menjalankan SQL lain yang menghapus tabel atau data.

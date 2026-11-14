# SIAKANG VDS — V83

Website Bidding dan Dana Paramita Yayasan Vihara Dharma Shanti.

## Deployment

Repository ini berisi versi dasar V83 dalam bentuk static HTML.

### GitHub
1. Buat repository bernama `siakang-vds` (disarankan Private).
2. Upload `index.html`, `README.md`, dan `.gitignore` ke folder utama/root repository.
3. Commit perubahan.

### Vercel
1. Import repository `siakang-vds` dari GitHub.
2. Framework Preset: `Other`.
3. Build Command: kosongkan.
4. Output Directory: `.` (root).
5. Deploy.

## Catatan penting

- Ini adalah paket dasar V83 untuk deployment awal sebagai website statis.
- Versi ini masih menyimpan data dan akun pada `localStorage` browser masing-masing.
- Supabase belum diintegrasikan pada paket ini. Karena itu, deployment saja BELUM membuat data tersinkron antar-komputer.
- Sebelum migrasi database, jangan hapus data browser lama. Buat backup data dari setiap komputer/browser yang memiliki transaksi.
- Integrasi Supabase, autentikasi pengguna, hak akses, sinkronisasi realtime, serta proses impor data akan dilakukan pada tahap berikutnya.
- Jangan pernah menaruh Supabase Secret Key atau `service_role` key di file HTML atau repository.

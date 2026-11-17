VDS FIX HAPUS DATA TESTING - V3

PERBAIKAN UTAMA:
- Mencegah event transaksi lama diputar ulang setelah HAPUS DATA TESTING.
- get-sync-events sekarang hanya mengirim event yang dibuat setelah timestamp reset terakhir.
- save-state tidak lagi menerbitkan event transaksi lama yang terlambat masuk setelah reset.
- Frontend mengabaikan event realtime yang timestamp-nya lebih lama dari reset.
- Fitur dan tampilan lain dipertahankan dari paket V2, termasuk Nomor Item otomatis.

CARA PASANG (REPLACE FILE SAJA):
1. GitHub repository VDS > folder 1-VERCEL:
   Replace index.html dengan file 1-VERCEL/index.html dari ZIP ini.
   Commit ke branch main dan tunggu Vercel selesai deploy.

2. Supabase > Edge Functions > vds-api:
   Replace isi index.ts dengan file 2-SUPABASE/index.ts dari ZIP ini.
   Deploy ulang function vds-api.

3. SQL migration 006 TIDAK perlu dijalankan ulang.

4. Setelah frontend dan backend selesai deploy:
   Logout, login kembali sebagai Admin, lalu jalankan HAPUS DATA TESTING sekali.
   Refresh website untuk memastikan transaksi dan history tetap kosong.

Yang dihapus hanya transaksi dan history testing pada Bidding dan Dana Paramita.
Daftar harga, master item, akun, pengaturan, dan data inventori tidak sengaja dihapus.

Catatan validasi:
- JavaScript frontend sudah diperiksa dengan node --check.
- Kode Edge Function disusun untuk Deno/Supabase dan belum diuji langsung di project Supabase pengguna.

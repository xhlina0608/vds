UPDATE VDS — DASHBOARD DIHAPUS
Tanggal: 17 November 2026

Perubahan:
- Menu Dashboard dihapus dari website Bidding dan Dana Paramita.
- Dashboard dihapus untuk Admin dan User.
- Setelah website dibuka, halaman awal langsung menuju Live Bidding / Live Laporan Dana.
- Izin Dashboard dihapus dari daftar pengaturan hak akses akun.
- Fitur lain dipertahankan dari backup master sebelumnya.

File deployment:
1-VERCEL/index.html
Ganti file frontend aktif di repository GitHub/Vercel dengan file ini, lalu deploy ulang.

Backend:
2-SUPABASE/index.ts tidak berubah; tidak perlu deploy ulang Edge Function untuk perubahan ini.

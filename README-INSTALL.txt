VDS FIX HAPUS DATA TESTING - REPLACE V2

PENTING: Ini paket perbaikan baru, bukan ZIP sebelumnya.

1) GITHUB
- Buka repository VDS, folder 1-VERCEL.
- Replace file index.html dengan 1-VERCEL/index.html dari ZIP ini.
- Commit ke branch main dan tunggu deployment Vercel selesai.

2) SUPABASE EDGE FUNCTION
- Buka Supabase > Edge Functions > vds-api > Code.
- Replace isi file index.ts dengan 2-SUPABASE/index.ts dari ZIP ini.
- Deploy ulang vds-api.

3) SQL
- Tidak perlu menjalankan migration 006 lagi. Migration tersebut sudah Anda jalankan.

4) SETELAH KEDUANYA DEPLOY
- Logout lalu login kembali sebagai Admin.
- Buka fitur HAPUS DATA TESTING dan jalankan sekali.
- Sistem akan menghapus transaksi dan history untuk Bidding serta Dana Paramita, lalu membaca ulang database untuk verifikasi.

Yang dipertahankan: daftar harga/master item, akun, pengaturan, dan konfigurasi. Counter bidding pada item direset; nilai remain mengikuti nilai remain/stock yang tersimpan pada item.

Jika ada error, pesan di website sekarang akan menyebut tahap yang gagal. Jangan jalankan HAPUS SEMUA DATA OPERASIONAL.

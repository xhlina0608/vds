VDS - FIX HAPUS DATA TESTING

1. Jalankan SQL file:
   supabase/migrations/006_testing_reset_protection.sql
   di Supabase SQL Editor pada project VDS yang benar.
2. Upload/ganti 2-SUPABASE/index.ts pada source Edge Function vds-api,
   lalu deploy ulang Edge Function.
3. Ganti 1-VERCEL/index.html pada GitHub branch main dan tunggu Vercel deploy.
4. Login sebagai Admin dan jalankan HAPUS DATA TESTING.

Perbaikan:
- Menghapus transaksi dan history untuk Bidding serta Dana Paramita.
- Mempertahankan daftar harga, master item, stok/master data, akun dan pengaturan.
- Mempertahankan snapshot inventory terbaru.
- Membatalkan auto-save tertunda dan memverifikasi ulang state dari cloud.
- Marker reset mencegah snapshot browser lama menghidupkan kembali transaksi/history yang sudah dihapus.

Catatan: lakukan backup database sebelum menjalankan penghapusan.

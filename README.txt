VDS – BIDDING & DANA PARAMITA UPDATE

Isi paket:
- index.html: versi gabungan terbaru untuk Bidding dan Dana Paramita.

Perubahan:
1. Input teks data otomatis menjadi HURUF KAPITAL. Login, password, email, tanggal, angka, dan pencarian tidak diubah.
2. Form transaksi Bidding sekarang memiliki kolom Lebih Bayar yang dapat diisi manual.
3. Lebih Bayar disimpan pada transaksi Bidding dan Dana Paramita.
4. Total CASH / TRANSFER / QRIS menghitung nilai transaksi + lebih bayar sesuai metode pembayaran.
5. Grand Total tetap menghitung harga barang/transaksi saja agar lebih bayar tidak dihitung dua kali.
6. PDF Bidding menampilkan kolom LEBIH BAYAR. Rekap metode pembayaran menghitung lebih bayar.
7. Export Excel Bidding sudah mengisi kolom lebih bayar dan rumus total pembayaran per metode.
8. Perbaikan PDF Dana Paramita sebelumnya tetap dipertahankan.

Deploy:
- Backup index.html yang sedang aktif terlebih dahulu.
- Ganti file index.html di repository GitHub dengan index.html dari ZIP ini.
- Commit/push lalu tunggu Vercel selesai deploy.
- Setelah deploy, uji dengan transaksi contoh sebelum digunakan untuk transaksi nyata.

Catatan:
- Paket ini hanya mengubah file website index.html; tidak mengubah tabel/database Supabase atau data transaksi yang sudah tersimpan.

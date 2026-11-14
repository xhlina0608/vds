VDS Bidding - perbaikan print 2 halaman dan sesi login

Isi:
- index.html

Perubahan:
1. Mengatur rangkap 4 mulai halaman 2 secara eksplisit dan menghilangkan page-break
   setelah lembar pertama agar browser tidak menyisipkan halaman kosong.
2. Token login disimpan di localStorage dan diverifikasi ke Supabase saat website
   dibuka kembali. Jika belum logout dan token masih valid, website membuka kembali
   workspace terakhir. Tombol Keluar tetap menghapus sesi tersimpan.

Deploy:
- Ganti index.html di repository GitHub VDS dengan file ini.
- Tunggu Vercel selesai deploy.
- Buka website dan lakukan Ctrl+F5.
Catatan: sesi tetap bergantung pada masa berlaku access token di backend; bila token
kedaluwarsa, pengguna perlu login kembali.

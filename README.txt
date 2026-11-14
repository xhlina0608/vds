VDS - FIX NOTIFIKASI MEMUAT DATA

Perubahan:
- Notifikasi "Memuat data Bidding/Dana Paramita..." tetap tampil selama proses pemuatan.
- Setelah berhasil, tampil pesan berhasil selama sekitar 2,2 detik lalu hilang otomatis.
- Jika gagal, notifikasi gagal tampil sekitar 3,5 detik dan detail error ditampilkan.
- Permintaan API cloud diberi batas waktu 30 detik agar tidak menggantung tanpa batas.
- Tetap meneruskan penghapusan kotak informasi kuning dan fitur dari paket sebelumnya.

Pemasangan:
1. Backup index.html yang sekarang di GitHub.
2. Ganti dengan index.html dari paket ini.
3. Commit/push dan tunggu Vercel selesai deploy.
4. Refresh website (Ctrl+F5) lalu uji Bidding dan Dana Paramita.

VDS BIDDING – PERBAIKAN PRINT 2 HALAMAN

Masalah: Print Preview menampilkan 3 halaman walaupun isi invoice hanya 2 halaman. Penyebabnya ukuran A4 297mm ditambah padding atas 6mm karena perhitungan box CSS, sehingga sheet melewati batas halaman dan membuat halaman kosong tambahan.

Perbaikan:
- Ukuran .invoice-paper menggunakan box-sizing:border-box.
- Tinggi kertas tetap tepat 297mm termasuk padding.
- Menghapus tinggi tetap 297mm pada html/body yang bisa memicu overflow.
- Memastikan halaman kedua tidak menambahkan page break ekstra.

Pemasangan:
1. Backup index.html di GitHub.
2. Ganti dengan index.html dari ZIP ini.
3. Commit/push, tunggu Vercel deploy.
4. Refresh website dengan Ctrl+F5.
5. Buka Print Preview. Target hasil: tepat 2 halaman A4.

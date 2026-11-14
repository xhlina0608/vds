VDS – PERBAIKAN UKURAN PREVIEW DAN PRINT RANGKAP KETIGA

Perbaikan:
- Font rangkap ketiga tidak lagi dipaksa menjadi 1.8mm / 2.1mm saat print.
- Ukuran font rangkap ketiga mengikuti angka Font pada toolbar editor.
- Pemetaan editor rangkap ketiga diarahkan ke elemen inv3 masing-masing, bukan kelas rangkap 1/2.
- Posisi, lebar, warna, dan ukuran font tetap mengikuti setting rangkap yang dipilih.

Pemasangan:
1. Backup index.html yang sekarang di GitHub.
2. Ganti index.html dengan file dari ZIP ini.
3. Commit/push dan tunggu Vercel selesai deploy.
4. Buka website, tekan Ctrl+F5.
5. Pilih Nama bidder 3 / Nominal 3 / dan elemen rangkap 3 lain, atur Font.
6. Buka Print Preview dan bandingkan ukuran rangkap ketiga.

Catatan: Perubahan ini memperbaiki CSS/JavaScript yang membuat font copy 3 mengecil saat print.

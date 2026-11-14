VDS - PENGATURAN POSISI DAN UKURAN NOTA TERPISAH PER RANGKAP

Perbaikan:
- Toolbar Editor Posisi sebelumnya menerapkan CSS ke semua elemen dengan kelas sama pada semua rangkap.
- Sekarang setiap rangkap mempunyai pengaturan Kir, Atas, Font, Lebar, dan Warna sendiri.
- Fokus/klik elemen pada rangkap 1 mengaktifkan pengaturan rangkap 1; rangkap 2 dan 3 berdiri sendiri.
- Pengaturan disimpan dalam state.invoiceLayoutCopies dan ikut mekanisme cloud.
- Dana Paramita tetap satu rangkap.

Pemasangan:
1. Backup index.html di GitHub.
2. Ganti dengan index.html dari ZIP.
3. Commit/push dan tunggu Vercel deploy.
4. Ctrl+F5, lalu uji toolbar pada setiap rangkap.

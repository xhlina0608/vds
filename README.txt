PERBAIKAN AKHIR HALAMAN KOSONG KETIGA - INVOICE BIDDING

Perubahan:
- Tinggi lembar invoice saat print diubah dari 297 mm menjadi 296 mm untuk
  menghindari overflow pembulatan ukuran fisik halaman pada browser.
- Hanya lembar pertama yang membuat page break setelahnya.
- Lembar kedua tidak membuat page break tambahan dan menjadi halaman terakhir.
- Isi dan ukuran elemen invoice tetap menggunakan skala desain yang sama.

Hasil yang dituju:
Halaman 1: rangkap 1, 2, 3
Halaman 2: rangkap 4
Tidak ada halaman 3 kosong.

Update:
Ganti index.html di GitHub, tunggu Vercel deploy, lalu Ctrl+F5 sebelum membuka
Print Preview lagi.

FIX HALAMAN KOSONG PRINT INVOICE BIDDING

Penyebab yang ditemukan:
Elemen kertas A4 pertama sudah memiliki tinggi satu halaman penuh (297 mm),
tetapi elemen kertas kedua juga diberi break-before: page. Pada Chrome/Firefox,
kombinasi ini dapat menghasilkan satu halaman kosong di antaranya.

Perbaikan:
Menghapus paksa page-break-before pada lembar kedua. Karena lembar pertama
sudah tepat satu tinggi A4, lembar kedua akan otomatis dimulai di halaman 2.

Cara update:
1. Ganti index.html di repository GitHub VDS dengan file ini.
2. Tunggu deployment Vercel selesai.
3. Buka invoice, tekan Ctrl+F5, lalu Print Preview.
4. Pastikan ukuran kertas A4, Scale Fit to page width, Margins None.

Target:
Halaman 1 = rangkap 1, 2, 3.
Halaman 2 = rangkap 4.

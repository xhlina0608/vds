PERBAIKAN PRINT INVOICE VDS — BIDDING & DANA PARAMITA

Perbaikan pada versi ini:
1. Bidding: rangkap 1–3 tetap di halaman 1 dan rangkap 4 di halaman 2.
2. Dana Paramita: hanya 1 rangkap dan tidak diberi page break paksa, sehingga tidak menghasilkan halaman 2 kosong.
3. Pemisah halaman hanya diterapkan untuk website Bidding, bukan untuk Dana Paramita.
4. Tinggi kertas invoice mengikuti isi rangkap; tidak dipaksa setinggi A4 penuh.

Cara update:
- Ganti index.html pada repository GitHub VDS dengan index.html dari ZIP ini.
- Tunggu deployment Vercel selesai.
- Buka website lalu tekan Ctrl+F5 sebelum mencoba Print Preview.
- Pilih kertas A4, Scale Fit to page width, dan Margins None.

Target preview:
- Bidding: 2 halaman (halaman 1 rangkap 1–3, halaman 2 rangkap 4), tanpa halaman kosong tambahan.
- Dana Paramita: 1 halaman (1 rangkap), tanpa halaman kosong kedua.

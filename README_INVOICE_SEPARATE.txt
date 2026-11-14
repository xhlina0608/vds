VDS - PEMISAHAN SETTING NOTA / INVOICE

Perubahan:
- Setting posisi, ukuran, dan warna elemen nota Bidding disimpan terpisah dari Dana Paramita.
- Background nota tetap menggunakan penyimpanan terpisah per website.
- Setting layout nota ikut disimpan dalam state cloud masing-masing website, sehingga tidak saling menimpa saat berpindah website.
- Saat pertama kali membuka Dana Paramita tanpa setting tersimpan, layout dimulai dari nilai default, bukan menyalin setting Bidding.
- Saat pertama kali membuka Bidding, setting lama Bidding tetap dipertahankan.

Pemasangan:
1. Ekstrak ZIP.
2. Upload/ganti file index.html pada repository GitHub VDS.
3. Commit perubahan dan tunggu Vercel selesai deploy.
4. Buka VDS, masuk ke Bidding, atur nota lalu Simpan Nota.
5. Pindah ke Dana Paramita, atur nota sendiri lalu Simpan Nota.
6. Pindah kembali ke Bidding; pengaturan Bidding seharusnya tetap seperti semula.

Catatan: perubahan ini memisahkan konfigurasi nota. Tidak mengubah transaksi atau data keuangan.

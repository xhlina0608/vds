VDS - Fitur Bersihkan Data Testing

- Menu Bersihkan Data Testing hanya terlihat dan dapat dibuka oleh Admin.
- Mengosongkan transaksi dan history pada Bidding serta Dana Paramita.
- Mereset bid, total, sisa, dan return item operasional ke kondisi awal berdasarkan master stok.
- Mempertahankan daftar harga/master item, stok master, akun, hak akses, pengaturan nota/background, dan konfigurasi.
- Meminta dua konfirmasi sebelum menghapus.
- Mengambil state terbaru dari cloud dan menyimpan kembali untuk kedua website.

Update:
1. Ekstrak ZIP.
2. Ganti index.html di repository GitHub VDS dengan index.html dari ZIP.
3. Tunggu Vercel selesai deploy.
4. Login Admin dan buka menu Bersihkan Data Testing.

Catatan: tindakan ini menghapus data transaksi dan riwayat testing secara permanen dari state aplikasi. Buat backup terlebih dahulu jika data testing masih ingin disimpan.

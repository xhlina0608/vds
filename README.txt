VDS - TANPA FITUR DATA SPONSOR / DONATUR TERPISAH

Perubahan:
- Menu Data Sponsor dihapus.
- Menu Data Sponsor Barang dihapus.
- Modul halaman, cetak, edit, hapus, dan sinkronisasi khusus dua fitur tersebut dihapus dari frontend.
- Fitur transaksi utama Bidding dan Dana Paramita tetap dipertahankan.
- Kolom/nama donatur yang dipakai sebagai bagian dari pencatatan transaksi Dana Paramita tetap dipertahankan.

Pemasangan:
- Ganti index.html pada root repository GitHub dengan file index.html dari paket ini.
- Commit dan tunggu Vercel selesai deploy.
- Tidak perlu menjalankan SQL migration atau mengganti Edge Function untuk perubahan ini.

Catatan: data lama di database sponsor tidak dihapus. Modulnya saja yang dihilangkan dari aplikasi, sehingga data lama tidak terhapus permanen.

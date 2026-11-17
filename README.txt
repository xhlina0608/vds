VDS - FITUR TAMBAH & RETUR BARANG (BIDDING + DANA PARAMITA)

Fitur baru:
- Menu "Tambah & Retur Barang" tersedia di Website Bidding dan Dana Paramita.
- Kedua website memakai SATU data barang dan satu riwayat retur yang sama di cloud.
- Form Tambah Barang: nama barang, jumlah masuk, satuan, dan keterangan.
- Form Retur Barang: pilih barang, isi jumlah sisa setelah bidding, jumlah yang diretur, alasan, dan keterangan.
- Sistem memvalidasi jumlah sisa dan menolak retur yang melebihi jumlah sisa tersebut.
- Jumlah retur tidak boleh melebihi stok tersedia.
- Tersedia ringkasan stok dan riwayat retur termasuk petugas dan website asal.
- Data bersama disimpan sebagai snapshot di tabel vds_sync_events yang sudah ada.
- Jumlah sisa setelah bidding diisi manual pada form retur; fitur ini belum menghitung penjualan otomatis dari transaksi live.
- Tidak memerlukan SQL migration baru.

PEMASANGAN WAJIB (2 BAGIAN):
1. GitHub / Vercel:
   - Ganti index.html di ROOT repository dengan index.html dari paket ini.
   - Commit dan tunggu deployment Vercel selesai.
2. Supabase Edge Function:
   - Ganti file supabase/functions/vds-api/index.ts pada repository dengan file dari paket ini.
   - Deploy ulang Edge Function bernama vds-api.
   - Pastikan function menggunakan environment variables lama yang sama; tidak perlu mengubah URL, anon/publishable key, service role key, atau database.

PENTING:
- Jangan menghapus tabel, menjalankan reset database, atau mengubah akun/password.
- Tidak ada SQL migration yang perlu dijalankan.
- Fitur ini adalah pencatatan stok masuk dan retur bersama. Ia tidak otomatis mengurangi stok dari transaksi Live Bidding/Live Laporan Dana atau mengubah Daftar Harga & Item yang sudah ada.

VDS — RIWAYAT BARANG MASUK + PDF BARANG MASUK/RETUR (2 WEBSITE)
==================================================================

FITUR
- Riwayat Barang Masuk otomatis tercatat setiap Simpan Barang berhasil.
- Riwayat Barang Masuk tampil di Website Bidding dan Dana Paramita; data tetap terpisah per website.
- Stok awal / saldo awal tidak dicatat sebagai transaksi barang masuk dan tidak masuk PDF.
- PDF Barang Masuk dan PDF Barang Retur tetap tersedia di samping Refresh Data.
- PDF retur tetap memiliki ruang tanda tangan PENERIMA.
- Admin dapat Edit dan Hapus riwayat barang masuk. Stok Daftar Harga & Item disesuaikan otomatis.
- Riwayat retur dan fungsi edit/hapus retur tetap dipertahankan.
- Riwayat barang masuk yang sudah terpakai atau diretur tidak dapat dikurangi/dihapus jika akan menyebabkan selisih stok.

FILE DEPLOY (GUNAKAN HANYA DUA FILE INI)
1. 1-VERCEL/index.html — file website untuk GitHub/Vercel.
2. 2-SUPABASE/index.ts — kode Edge Function vds-api untuk Supabase.

CARA UPDATE
1. Backup deployment Vercel dan kode Edge Function yang sedang aktif.
2. GitHub: ganti file index.html pada root project dengan isi 1-VERCEL/index.html, lalu commit/push.
3. Supabase Dashboard > Edge Functions > vds-api > Code: ganti seluruh kode dengan 2-SUPABASE/index.ts, lalu Deploy.
4. Tunggu deployment Vercel selesai.
5. Buka website, tekan Ctrl+F5, login Admin, lalu buka Tambah & Retur Barang.
6. Pastikan tombol PDF Barang Masuk dan PDF Barang Retur tetap tampil di samping Refresh Data.
7. Pastikan Riwayat Barang Masuk muncul pada kedua website. Tes tambah satu barang di masing-masing website dan pastikan riwayat tidak tercampur.
8. Tes edit/hapus hanya pada transaksi uji yang belum terpakai; pastikan stok ikut disesuaikan.

CATATAN
- Tidak perlu SQL migration baru. Data disimpan dalam snapshot inventory di vds_sync_events.
- Data lama tetap aman. Riwayat masuk lama yang tidak pernah dicatat tidak dibuat-buat; saldo awal tidak dimasukkan sebagai transaksi.
- 3-BACKUP adalah file cadangan historis, bukan file deploy.
- Jangan upload file alternatif/backup ke root Vercel. Gunakan hanya 1-VERCEL/index.html.

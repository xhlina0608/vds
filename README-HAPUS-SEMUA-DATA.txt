FITUR HAPUS SEMUA DATA OPERASIONAL - VDS 2 WEBSITE
=================================================

Fitur baru tersedia pada menu Bersihkan Data Testing untuk Admin.

1. HAPUS DATA TESTING
   Tetap seperti fungsi lama: membersihkan transaksi dan history testing,
   mempertahankan Daftar Harga & Item serta data inventaris.

2. HAPUS SEMUA DATA KECUALI PENGATURAN
   Menghapus data operasional pada kedua website (Bidding dan Dana Paramita):
   - Daftar Harga & Item
   - Live Bidding dan Live Laporan Dana
   - History Bidding
   - Data sponsor yang tersimpan dalam app state
   - Rincian angka laporan (label dipertahankan, nilai direset ke 0)
   - Stok, tambah barang, retur, dan riwayat inventaris
   - Event sinkronisasi operasional lama

   Mempertahankan pengaturan nota, background, akun, hak akses, dan field
   konfigurasi lain yang tidak termasuk data operasional.

KEAMANAN
--------
- Hanya Admin yang dapat menjalankan fitur.
- Konfirmasi browser dan prompt frasa "HAPUS SEMUA DATA" diperlukan.
- Fitur memproses website Bidding dan Dana Paramita.
- Tidak memerlukan SQL migration.
- Edge Function vds-api harus di-deploy ulang karena ada action baru:
  admin-clear-all-operational-data.

DEPLOY
------
1. Ganti 1-VERCEL/index.html di repository GitHub dan deploy Vercel.
2. Deploy ulang Edge Function vds-api dari 2-SUPABASE/index.ts.
3. Refresh browser (Ctrl+F5).
4. Pastikan backup sudah dibuat sebelum menggunakan fitur penghapusan total.
5. Setelah penghapusan, muat ulang browser/perangkat lain sebelum mulai input
   operasional agar tidak ada halaman lama yang masih menyimpan state sebelumnya.

Catatan: Penghapusan ini bersifat permanen. Backup terlebih dahulu.

VDS — Nomor Transaksi Aman untuk Input Bersamaan

Isi paket:
- index.html: frontend VDS yang meminta nomor resmi ke cloud saat transaksi baru disimpan.
- supabase/functions/vds-api/index.ts: Edge Function vds-api dengan action allocate-transaction-numbers.
- supabase/migrations/002_concurrent_numbering.sql: tabel counter dan fungsi SQL atomik.

URUTAN PEMASANGAN (WAJIB):
1. Backup data VDS terlebih dahulu.
2. Buka Supabase > SQL Editor, jalankan seluruh isi file berikut secara berurutan:
   - supabase/migrations/002_concurrent_numbering.sql (jika belum pernah dijalankan)
   - supabase/migrations/003_atomic_transaction_merge.sql
3. Buka Supabase > Edge Functions > vds-api.
   Ganti source index.ts dengan file pada paket ini, lalu Deploy.
   Pastikan secrets lama tetap tersedia; jangan hapus/ubah SUPABASE_SERVICE_ROLE_KEY,
   SUPABASE_ANON_KEY, atau VDS_BOOTSTRAP_SECRET.
4. Ganti index.html pada repository GitHub VDS dengan index.html dari paket ini.
5. Tunggu Vercel selesai deploy. Refresh browser (Ctrl+F5).
6. Uji satu transaksi di Bidding dan satu di Dana Paramita. Coba juga dua perangkat
   menyimpan transaksi hampir bersamaan; nomor resmi harus berbeda.

Perilaku:
- Penyimpanan transaksi dan history memakai merge atomik di database berdasarkan ID.
- Jika dua pengguna menyimpan snapshot lama hampir bersamaan, transaksi dari keduanya tetap digabung; transaksi pengguna lain tidak dihapus/ditimpa.
- Jika dua pengguna mengedit transaksi ID yang sama, perubahan terakhir yang diterima server akan digunakan.
- Data master lain (daftar barang/harga, pengaturan, layout nota) tetap mengikuti mekanisme simpan sebelumnya; fitur merge ini secara khusus melindungi array transaksi dan history.
- Nomor BID/ORDER dan nomor nota terpisah untuk Bidding dan Dana Paramita.
- Nomor resmi dialokasikan di server pada saat Simpan.
- Edit transaksi mempertahankan nomor lama.
- Bila gagal setelah nomor dialokasikan, bisa ada nomor yang terlewati. Ini disengaja
  demi menghindari nomor ganda.
- Nomor invoice awal mengikuti pola lama: Bidding mulai 2601, Dana Paramita mulai 26001.
- Nomor urut BID/ORDER mengikuti nomor tertinggi yang sudah ada pada masing-masing website.

CATATAN:
Transaksi masih berada di array JSON app_state, tetapi penggabungan array transaksi dan
history kini dilakukan secara atomik di Supabase. Ini mencegah transaksi baru dari user
lain hilang akibat browser yang mengirim snapshot lama. Untuk skala transaksi sangat besar,
arsitektur ideal berikutnya tetap tabel database per transaksi.

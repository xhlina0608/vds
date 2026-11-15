VDS — LOW-EGRESS REALTIME TRANSACTION SYNC

Isi paket:
- index.html: frontend VDS dengan pembaruan transaksi otomatis antar-komputer.
- supabase/functions/vds-api/index.ts: Edge Function untuk merge atomik dan menerbitkan event transaksi.
- supabase/migrations/002_concurrent_numbering.sql: counter nomor transaksi (jalankan hanya jika belum pernah).
- supabase/migrations/003_atomic_transaction_merge.sql: merge atomik transaksi/history (sudah dijalankan menurut konfirmasi pengguna).
- supabase/migrations/004_low_egress_realtime.sql: tabel event kecil, policy akses per website, dan publikasi Realtime.

URUTAN PEMASANGAN:
1. Backup data VDS terlebih dahulu.
2. Di Supabase > SQL Editor, jalankan hanya migration baru:
   supabase/migrations/004_low_egress_realtime.sql
   Migration 002 dan 003 tidak perlu dijalankan ulang jika sudah berhasil dijalankan.
3. Di Supabase > Edge Functions > vds-api, ganti source index.ts dengan file:
   supabase/functions/vds-api/index.ts
   lalu Deploy. Jangan hapus atau ubah secrets yang sudah ada.
4. Ganti index.html pada repository GitHub VDS dengan index.html dari paket ini.
5. Tunggu Vercel selesai deploy, lalu refresh browser di setiap komputer.
6. Buka website yang sama (Bidding atau Dana Paramita) di komputer A, B, dan C.
   Simpan satu transaksi dari A. Transaksi harus muncul otomatis di B dan C tanpa refresh.
7. Uji juga ketika B sedang membuka formulir transaksi yang belum disimpan; isi formulirnya
   harus tetap ada saat transaksi dari A masuk.

CARA KERJA HEMAT EGRESS:
- Tidak ada polling berkala dan tidak ada reload halaman.
- Realtime hanya mengirim event INSERT kecil untuk transaksi yang disimpan melalui form transaksi.
- Payload event berisi satu transaksi dan satu catatan history, bukan seluruh app_state.
- Komputer hanya berlangganan website yang sedang dibuka (Bidding ATAU Dana Paramita).
- Event hanya dapat dibaca oleh akun yang memiliki izin ke website tersebut.
- Saat koneksi Realtime tersambung kembali setelah terputus, aplikasi melakukan satu kali catch-up
  get-state untuk menyelaraskan transaksi/history yang mungkin terlewat. Ini bukan polling.
- Event lama dibersihkan otomatis saat event baru masuk; tabel menyimpan maksimal sekitar 7 hari
  event terakhir. Pembersihan berjalan ketika ada event baru.

CATATAN DAN BATASAN:
- Penyimpanan utama tetap menggunakan app_state JSON dan merge atomik migration 003.
  Paket ini tidak mengubah model database transaksi menjadi tabel per transaksi.
- Ketika menyimpan transaksi, browser tetap mengirim snapshot state ke Edge Function seperti
  mekanisme sekarang. Penghematan egress terutama pada pembaruan ke komputer lain: tidak perlu
  mengunduh seluruh app_state untuk setiap transaksi baru.
- Perubahan master data/pengaturan yang dilakukan di luar form transaksi tidak memicu event
  realtime dalam paket ini. Pembaruan live yang dibuat khusus adalah untuk transaksi/history.
- Jika CDN Supabase Realtime tidak dapat dimuat atau koneksi live gagal, penyimpanan cloud tetap
  berjalan; status akan memberi tahu bahwa live sync tidak tersedia.
- Tidak ada polling otomatis. Catch-up hanya dilakukan ketika koneksi Realtime pulih.
- Untuk volume transaksi yang sangat besar, arsitektur ideal jangka panjang adalah menyimpan
  transaksi dan history sebagai baris database tersendiri.

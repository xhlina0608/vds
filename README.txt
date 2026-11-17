VDS - PEMISAHAN DATA TAMBAH & RETUR BARANG (BIDDING / DANA PARAMITA)

Perubahan:
- Data stok masuk, jumlah tersedia, jumlah retur, dan riwayat retur dipisahkan berdasarkan website.
- Website Bidding hanya membaca/menulis snapshot dengan site=bidding.
- Website Dana Paramita hanya membaca/menulis snapshot dengan site=dana.
- Daftar Harga & Item tetap mengikuti state masing-masing website.
- Kedua website tetap menggunakan project Supabase yang sama, tetapi tidak lagi berbagi data stok/retur.
- Tidak ada SQL migration baru.

PENTING TENTANG DATA LAMA:
Data stok lama sebelumnya tersimpan sebagai satu snapshot bersama di bawah site Bidding, sehingga tidak ada identitas yang dapat memastikan item stok tersebut milik website mana. Demi mencegah data Bidding tercampur atau tersalin ke Dana Paramita (atau sebaliknya), snapshot lama TIDAK dimasukkan otomatis ke kedua website. Snapshot lama tetap tersimpan di tabel sync events sebagai arsip dan tidak dihapus. Setelah deploy, kedua website akan mulai dengan daftar stok terpisah; input barang baru pada masing-masing website akan masuk ke ruang datanya sendiri.

CARA UPDATE:
1. Extract ZIP.
2. Ganti index.html di root repository GitHub dengan index.html dari paket ini.
3. Ganti/deploy Supabase Edge Function vds-api menggunakan file supabase/functions/vds-api/index.ts dari paket ini.
4. Tidak perlu menjalankan SQL migration.
5. Tunggu deployment Vercel dan Edge Function selesai.
6. Buka vds.onesolution.my.id, lakukan hard refresh (Ctrl+Shift+R), lalu uji Bidding dan Dana Paramita secara terpisah.

UJI YANG DISARANKAN:
1. Di Bidding, tambah stok untuk satu barang.
2. Pindah ke Dana Paramita: stok yang baru ditambahkan di Bidding tidak boleh muncul.
3. Tambah stok barang di Dana Paramita.
4. Kembali ke Bidding: stok Dana Paramita tidak boleh muncul.
5. Coba retur pada masing-masing website dan pastikan riwayat retur hanya tampil di website asal.

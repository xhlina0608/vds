SIAKANG VDS — LOW EGRESS REALTIME + RESTORE ADMIN CLEAR TEST DATA

Isi paket:
- index.html: versi Low-Egress Realtime dengan menu Bersihkan Data Testing dikembalikan.
- supabase/functions/vds-api/index.ts: Edge Function dari paket Low-Egress Realtime.
- migrations 002, 003, 004: sama seperti paket Low-Egress Realtime sebelumnya.

Perubahan:
1. Mengembalikan menu Bersihkan Data Testing khusus Admin.
2. Fungsi pembersihan mempertahankan master harga/item, akun, hak akses, pengaturan nota, background, dan konfigurasi.
3. Menghapus transaksi dan history testing serta mengembalikan nilai operasional item ke stok master.
4. Mempertahankan implementasi nomor transaksi dan event sync_event yang sudah ada di paket Low-Egress Realtime.

PENTING:
- Migration 004 harus sudah dijalankan satu kali di Supabase. Jangan jalankan ulang 002/003/004 jika sudah pernah berhasil.
- Deploy Edge Function dari folder supabase/functions/vds-api jika belum menggunakan versi yang sama.
- Upload index.html ke GitHub/Vercel.
- Login sebagai Admin untuk melihat menu Bersihkan Data Testing.
- Fitur sinkronisasi Realtime memerlukan pengujian langsung di Supabase dengan dua komputer. Paket ini belum dapat divalidasi terhadap proyek cloud pengguna dari sini.
- Backup data sebelum menggunakan fitur hapus data testing.

Pembaruan sinkronisasi & urutan nota:
- Realtime tetap dipakai untuk pembaruan seketika. Jika event WebSocket tidak sampai, browser mengambil event transaksi kecil setiap 5 detik (bukan mengunduh seluruh app_state).
- Daftar Live Bidding/Laporan Dana dan pilihan cetak nota diurutkan menurut nomor urut BID/ORDER 01, 02, 03, dan seterusnya. Nomor nota resmi (mis. 2601/26001) tetap dipertahankan dan ditampilkan bersama nomor urut.
- Edge Function vds-api harus di-deploy ulang agar action get-sync-events tersedia. Migration 004 tetap harus sudah berhasil dijalankan.

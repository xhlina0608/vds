VDS — RESPONSIVE LAYOUT UPDATE
================================

ISI ZIP:
- index.html: frontend utama VDS, sudah ditambahkan penyesuaian responsive.

CARA UPDATE GITHUB / VERCEL:
1. Backup index.html yang sedang aktif di root repository.
2. Ekstrak ZIP ini.
3. Ganti file index.html di ROOT repository GitHub dengan index.html dari ZIP.
4. Commit dan push ke branch yang digunakan Vercel.
5. Tunggu deployment Vercel berstatus Ready.
6. Buka website dan tekan Ctrl + Shift + R.

RUANG LINGKUP:
- Penyesuaian lebar sidebar, padding, header, tombol, dan tabel agar mengikuti ukuran layar.
- Teks panjang pada tabel akan membungkus baris, bukan memperlebar halaman.
- Meminimalkan scroll horizontal tanpa menghilangkan kolom atau data.
- Scroll internal halaman/tabel yang sudah ada tetap dipertahankan.

TIDAK DIUBAH:
- Database dan tabel Supabase.
- Edge Function / API.
- Live Sync dan konfigurasi Realtime.
- Data transaksi, stok, pembayaran, akun, dan perhitungan.
- Fitur export, nota, backup, dan restore.

CATATAN:
Paket ini hanya frontend. Tidak perlu deploy ulang Supabase dan tidak perlu menjalankan SQL.

VDS - PERBAIKAN FORM TAMBAH & RETUR BARANG (BIDDING + DANA PARAMITA)

Perubahan:
- Form Tambah Barang memilih nama barang langsung dari Daftar Harga & Item.
- Harga daftar tampil otomatis mengikuti barang yang dipilih.
- Field Satuan dihapus dari form dan tabel stok.
- Form Retur Barang juga memilih barang dari Daftar Harga & Item, dan hanya menampilkan barang yang memiliki stok tersedia pada pencatatan barang bersama.
- Jumlah masuk, sisa setelah bidding, jumlah retur, alasan, dan keterangan tetap tersedia.
- Data cloud bersama dan riwayat retur tetap menggunakan mekanisme yang sudah dipasang sebelumnya.

CARA UPDATE:
1. Extract ZIP.
2. Ganti index.html di ROOT repository GitHub dengan index.html dari paket ini.
3. Commit / push dan tunggu deployment Vercel selesai.
4. Buka website lalu lakukan hard refresh (Ctrl+Shift+R).

PENTING:
- Untuk perubahan ini, cukup update index.html di GitHub/Vercel.
- Tidak perlu menjalankan SQL migration.
- Tidak perlu deploy ulang Supabase Edge Function jika function vds-api dari paket fitur Tambah & Retur sebelumnya sudah berhasil dipasang.
- Jika Edge Function sebelumnya belum pernah dipasang, pasang sesuai instruksi paket fitur Tambah & Retur awal.
- Barang yang dapat dipilih bersumber dari Daftar Harga & Item pada website yang sedang dibuka.
- Barang retur ditampilkan jika sudah pernah dicatat masuk dan masih memiliki stok tersedia.
- Jumlah sisa setelah bidding tetap diisi manual; belum otomatis dihitung dari transaksi bidding.

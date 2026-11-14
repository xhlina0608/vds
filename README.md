# SIAKANG VDS — Paket Pemasangan Browser (Supabase + GitHub + Vercel)

Paket ini memakai V83 sebagai dasar. Backend menggunakan Supabase Edge Function `vds-api`; login pengguna memakai username dan password. Email `@vds.invalid` hanya alamat internal Auth, bukan email sungguhan dan tidak perlu diakses.

## Urutan pemasangan paling mudah

### A. Database (sekali saja)
1. Buka Supabase Dashboard proyek VDS → SQL Editor → New query.
2. Buka file `supabase/vds_schema.sql` dari paket ini, salin seluruh isinya, tempel ke SQL Editor, lalu klik Run.
3. Pastikan muncul Success.

### B. Buat akun Admin pertama
1. Supabase → Authentication → Users → Add user → Create new user.
2. Email: `septino@vds.invalid`
3. Password: tentukan password Admin yang kuat (minimal 10 karakter) dan simpan sendiri.
4. Jika ada pilihan Auto Confirm User, aktifkan. Buat user.
5. Trigger SQL akan membuat profil `septino` sebagai Admin otomatis. Tidak perlu membuat email sungguhan.

### C. Buat Edge Function lewat browser (tanpa Windows/CLI)
1. Supabase → Edge Functions → Deploy a new function → Via Editor.
2. Function name: `vds-api`.
3. Buka `supabase/functions/vds-api/index.ts` dari paket ini, salin seluruh isi, lalu tempel menggantikan seluruh kode contoh editor.
4. Klik Deploy function.
5. Setelah selesai, endpoint harus tersedia di `https://gmpedvbzmgrpwsgsyszj.supabase.co/functions/v1/vds-api`.

Catatan keamanan: fungsi memakai environment bawaan Supabase `SUPABASE_URL`, `SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY`. Jangan menaruh service-role key di HTML/GitHub dan jangan mengirimkannya lewat chat. Jika environment `SUPABASE_SERVICE_ROLE_KEY` tidak tersedia di proyek, fungsi akan menampilkan error saat dipanggil; jangan menggantinya dengan key di frontend.

### D. Upload website ke GitHub dan Vercel
1. Backup repository `VDS` dan deployment Vercel yang sekarang.
2. Upload isi folder `website-root` dari paket ini ke root repository GitHub `VDS` (index.html, README.md, .gitignore).
3. Commit perubahan. Vercel yang terhubung ke repository akan deploy otomatis.
4. Buka `https://vds-black.vercel.app`, login username `septino` dengan password yang dibuat pada langkah B.

## Data dan egress
- Bidding dan Dana Paramita disimpan terpisah di `app_state`.
- Tidak menggunakan realtime atau polling otomatis.
- Pengambilan cloud dilakukan saat membuka workspace atau menekan Muat Ulang Cloud.
- Simpan otomatis memakai debounce 1,4 detik. Setiap penyimpanan mengirim JSON seluruh workspace; ukuran data tetap memengaruhi transfer.
- Migrasi data lokal hanya terjadi jika baris cloud workspace masih kosong. Data cloud yang sudah ada tidak ditimpa otomatis.
- Edit bersamaan dari dua komputer masih menggunakan prinsip last-write-wins pada seluruh workspace.

## Pengujian setelah deploy
1. Buka endpoint fungsi di browser. Jika dibuka dengan GET, respons `Method not allowed` adalah tanda fungsi ditemukan. `NOT_FOUND` berarti belum ter-deploy atau nama fungsi salah.
2. Login di website dengan `septino`.
3. Uji data contoh yang tidak penting. Pastikan status sinkron menyatakan tersimpan di cloud.
4. Login dari komputer kedua, buka workspace yang sama, lalu klik Muat Ulang Cloud.

Jangan menghapus backup V83 asli sampai tes dua komputer berhasil. Paket ini adalah kandidat pemasangan; keberhasilan deployment dan uji dua komputer harus dikonfirmasi pada proyek live.

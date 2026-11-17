UPDATE MANAJEMEN AKUN - EDIT USERNAME & HAPUS USER
=================================================

Fitur baru pada menu Manajemen Akun (khusus Admin):

1. EDIT USERNAME
   - Mengubah username akun User.
   - Email login internal Supabase ikut diperbarui agar user dapat login
     menggunakan username baru.
   - Password, role, status, dan hak akses tetap sama.
   - Username baru harus 3-24 karakter: huruf, angka, titik, garis bawah,
     atau tanda hubung; username tidak boleh sudah digunakan.

2. HAPUS USER
   - Menghapus akun User secara permanen dari Supabase Auth.
   - Profil ikut terhapus melalui relasi foreign key ON DELETE CASCADE.
   - Memerlukan konfirmasi dengan mengetik: HAPUS <username>.

PERLINDUNGAN
- Akun Admin tidak dapat dihapus melalui tombol Hapus User.
- Akun Admin utama "septino" dilindungi.
- Admin tidak dapat menghapus akun yang sedang dipakai untuk login.
- Username akun Admin tidak dapat diubah dari menu User.
- Semua tindakan divalidasi ulang di Edge Function, bukan hanya di browser.

DEPLOY
1. Ganti file 1-VERCEL/index.html di repository GitHub.
2. Deploy ulang Supabase Edge Function vds-api dari file 2-SUPABASE/index.ts.
3. Deploy Vercel dan tunggu selesai.
4. Buka website lalu tekan Ctrl+F5.
5. Masuk sebagai Admin dan buka Manajemen Akun.

Tidak memerlukan SQL migration baru. Pastikan backup tersedia sebelum
menghapus akun karena penghapusan bersifat permanen.

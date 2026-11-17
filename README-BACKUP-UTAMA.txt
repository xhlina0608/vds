VDS - BACKUP UTAMA
Tanggal paket: 17 November 2026

Paket ini dibuat dari source ZIP VDS terbaru yang diberikan setelah fitur
Manajemen Akun (Edit Username dan Hapus User) berhasil dipasang.

Isi utama:
- 1-VERCEL/index.html : frontend aktif untuk deployment Vercel
- 2-SUPABASE/index.ts : Supabase Edge Function vds-api
- supabase/ : schema, konfigurasi, dan migration SQL
- README dan catatan fitur

Folder 3-BACKUP yang berisi salinan index.html/index.ts versi lama sengaja
tidak disertakan agar tidak ada file duplikat yang membingungkan.

Catatan:
- Simpan ZIP ini sebagai backup master di Google Drive.
- Jangan ekstrak lalu upload seluruh isi ZIP secara membabi buta.
- Untuk perubahan frontend, gunakan 1-VERCEL/index.html.
- Untuk perubahan Edge Function, gunakan 2-SUPABASE/index.ts.
- Simpan salinan backup sebelum setiap update berikutnya.
- File ini tidak berisi kredensial rahasia/service_role key.

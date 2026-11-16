SIAKANG VDS - DOMAIN / SPONSOR COMPATIBILITY BUNDLE

Isi:
- index.html: frontend VDS dengan 3 pilihan website (bidding, dana, sponsor)
- supabase/functions/vds-api/index.ts: Edge Function source yang mengizinkan ketiga site tersebut

TEMUAN PEMERIKSAAN
- Frontend sudah memanggil site dengan nilai: bidding, dana, sponsor.
- Source Edge Function dalam ZIP ini sudah menerima ketiga nilai tersebut.
- Jika aplikasi live masih menampilkan "Website tidak valid" saat membuka Sponsor,
  kemungkinan besar Edge Function vds-api yang ter-deploy masih versi lama.
- Tidak ada pemeriksaan hostname/domain di source frontend maupun Edge Function ini.
  Karena itu mengganti domain saja tidak akan memperbaiki validasi site di backend.

LANGKAH DEPLOY
1. Deploy folder/function supabase/functions/vds-api/index.ts ke project Supabase
   yang sama dengan URL yang digunakan frontend:
   https://gmpedvbzmgrpwsgsyszj.supabase.co
2. Pastikan environment secrets Edge Function tetap tersedia:
   SUPABASE_URL
   SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   VDS_BOOTSTRAP_SECRET
3. Deploy ulang frontend index.html ke project Vercel/domain yang digunakan.
4. Buka domain, logout, lalu login kembali agar sesi lama tidak dipakai.
5. Uji satu per satu: Bidding, Dana Paramita, Data Sponsor.

CATATAN KEAMANAN
- Jangan menaruh SUPABASE_SERVICE_ROLE_KEY atau VDS_BOOTSTRAP_SECRET di HTML.
- Jangan menghapus tabel atau data Supabase.
- Jangan menjalankan ulang migration yang menghapus/mengosongkan data.
- File ini tidak mengubah database dan tidak melakukan deployment otomatis.

Jika menggunakan Supabase CLI dari root project yang sudah terhubung:
  supabase functions deploy vds-api

Pastikan deploy dilakukan ke project Supabase yang benar sebelum menguji domain.

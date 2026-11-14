VDS - FIX FITUR PINDAH WEBSITE KE TAB BARU

Perbaikan:
1. Login pertama dan pilihan website pertama tetap di tab yang sama.
2. Tombol "Pilih Website" dari dalam Bidding/Dana Paramita menandai perpindahan website.
3. Saat memilih website berikutnya, website tujuan dibuka di tab browser baru.
4. Tab lama tetap berada di halaman "Pilih Website".
5. Sesi login diteruskan satu kali ke tab baru, sehingga tidak perlu login ulang.
6. Akun dengan akses satu website tetap langsung masuk di tab yang sama dan tidak mendapat alur tab baru.

Pemasangan:
- Backup index.html di repository GitHub VDS.
- Ganti index.html dengan file dari ZIP ini.
- Commit/push, lalu tunggu Vercel selesai deploy.

Catatan:
- Handoff sesi memakai localStorage satu kali dengan masa berlaku 60 detik dan langsung dihapus tab tujuan.
- Pengujian akhir tetap perlu dilakukan di website setelah deploy karena perilaku pop-up mengikuti izin browser.

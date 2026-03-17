# Berkontribusi pada Tentacles LMA

Terima kasih atas ketertarikan Anda untuk mengembangkan **Tentacles**! Kami menyambut kontribusi dari komunitas mulai dari perbaikan bug, dokumentasi, hingga pembuatan *Arm* (Lengan/Skill) agen baru.

## 🛠️ Cara Membuat Pull Request (PR)

1. **Fork** repositori ini ke akun Anda.
2. **Clone** hasil fork Anda secara lokal.
3. Buat cabang (`branch`) baru untuk fitur Anda: `git checkout -b fitur/nama-fitur-keren`.
4. Buat perubahan, tambahkan pengujian (tes) yang sesuai.
5. Jalankan *linter* dan *build* lokal untuk memastikan tidak ada fitur yang rusak.
6. Lakukan commit dengan pesan deskriptif.
7. Push ke *branch* Anda di GitHub.
8. Buka **Pull Request** ke cabang `main` di repositori asli.

## 🐙 Membangun Lengan (Skill) Baru

Tentacles dirancang agar sangat modular. Untuk menambahkan kemampuan (Lengan) baru ke dalam sistem:

1. Buat direktori baru di dalam `skills/`.
2. Anda WAJIB membuat file `skill.md` yang mendeskripsikan peran, parameter, dan deskripsi sistem (System Prompt) dari lengan tersebut.
3. (PENTING): Jika Anda mendistribusikan Skill di luar PR pusat, pastikan Skill Anda telah di-*hash* dan di-tanda tangani kriptografis. Sistem integritas (*Context Engine*) akan menolak eksekusi spesifik dari Lengan yang tidak ditandatangani untuk mencegah *Supply Chain Attack*.

## 🤝 Etika Komunitas
- Jaga diskusi tetap profesional dan inklusif.
- Jika menemukan *issue* terkait keamanan, **JANGAN** membuat laporan isu publik. Baca `SECURITY.md`.

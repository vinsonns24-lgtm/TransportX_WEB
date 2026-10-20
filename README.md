# TransportX — website + prototipe v2 (Vercel)

Situs statis, tanpa build. Struktur:
- index.html, style.css, script.js  → halaman utama website
- prototipe/                         → prototipe aplikasi v2 (link "Coba sekarang")
- assets/                            → logo dan gambar mockup
- 404.html                           → halaman tidak ditemukan
- vercel.json                        → pengaturan cache

## Update project Vercel yang sudah ada
Lewat GitHub: ganti isi repo dengan isi folder ini, commit, push. Vercel deploy otomatis.
Lewat CLI: buka folder ini di terminal, jalankan `vercel --prod`.

## Pengaturan di dashboard Vercel
Framework Preset: Other · Build Command: kosong · Output Directory: kosong (root)

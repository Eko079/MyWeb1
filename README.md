# Portfolio Website

Website portofolio modern dan interaktif dengan HTML, CSS, dan JavaScript murni.

## Cara Membuka

Karena header, footer, dan section halaman dipisah menjadi partial HTML, jalankan lewat local
server:

```bash
python3 -m http.server 4173
```

Lalu buka `http://127.0.0.1:4173`.

## Struktur File

- `index.html` adalah shell utama.
- `components/header.html` berisi header dan navigasi.
- `components/footer.html` berisi footer.
- `pages/` berisi section halaman: home, stats, work, services, about, dan contact.
- `script.js` memuat partial HTML lalu mengaktifkan interaksi.
- `styles.css` berisi styling global dan responsif.

## Yang Mudah Diganti

- Nama, headline, email, dan link sosial ada di file-file dalam `components/` dan `pages/`.
- Warna utama ada di bagian `:root` pada `styles.css`.
- Data proyek ada di `pages/work.html`.
- Alamat email tujuan form ada di bagian bawah `script.js`.

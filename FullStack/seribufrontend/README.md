# SeribuCerita Frontend

React + Vite + Tailwind CSS

## Setup Lokal

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Buat file `.env`** (copy dari `.env.example`)
   ```bash
   cp .env.example .env
   ```
   Isi:
   - `VITE_API_URL` — URL backend (lokal: `http://localhost:3000`)
   - `VITE_HF_URL` — URL HuggingFace Space (biarkan default)

3. **Jalankan development**
   ```bash
   npm run dev
   ```
   App berjalan di `http://localhost:5173`

## Deploy ke Vercel

1. Push ke GitHub
2. Import project di Vercel
3. Set Environment Variables:
   - `VITE_API_URL` = URL Railway backend kamu
   - `VITE_HF_URL` = `https://syahrulw-seribucerita-emotion.hf.space`
4. Deploy!

`vercel.json` sudah dikonfigurasi untuk React Router (SPA routing).

## Halaman

- `/` — Beranda
- `/edukasi` — Artikel
- `/chatbot` — Chat AI
- `/tentang` — Tentang
- `/login` — Masuk / Daftar
- `/profil` — Profil user (auth)
- `/jurnal` — Jurnal harian (auth)
- `/faskes` — Cari faskes (auth)
- `/highlights` — Highlights (auth)
- `/riwayat` — Riwayat chat (auth)
- `/superadmin` — Admin login

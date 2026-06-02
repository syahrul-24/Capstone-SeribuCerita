# 🌿 SeribuCerita — Frontend

> Aplikasi web kesehatan mental berbasis AI yang membantu pengguna memahami emosi, menulis jurnal, dan menemukan dukungan kesehatan terdekat.

**Live Demo:** [seribu-frontend.vercel.app](https://seribu-frontend.vercel.app)  
**Backend Repo:** Lihat `README_backend.md`

---

## 📋 Checklist Tech Stack

### ✅ Main Quest

| No | Kriteria | Status | Keterangan |
|----|----------|--------|------------|
| 1 | **Networking calls untuk berinteraksi dengan API** | ✅ Terpenuhi | `src/lib/api.js` menggunakan `fetch()` native dan Axios untuk semua komunikasi ke backend Railway & HuggingFace Space |
| 2 | **Menggunakan module bundler** | ✅ Terpenuhi | Menggunakan **Vite v8** (`vite.config.js`) sebagai module bundler dan build tool |
| 3 | **Fitur utama berjalan tanpa crash** | ✅ Terpenuhi | Chatbot AI, Jurnal, Faskes Map, Avatar Builder, dan Highlights semuanya terimplementasi dengan error handling |

### ✅ Side Quest

| No | Kriteria | Status | Keterangan |
|----|----------|--------|------------|
| 4 | **Layout responsif** | ✅ Terpenuhi | Menggunakan **Tailwind CSS v3** dengan konfigurasi breakpoint responsif di `tailwind.config.js` |
| 5 | **Menggunakan Tailwind CSS** | ✅ Terpenuhi | Tailwind CSS sebagai styling utama, dikonfigurasi dengan custom design tokens (warna, font, shadow) |
| 6 | **Menggunakan Axios** | ✅ Terpenuhi | Axios tersedia sebagai dependency (`"axios": "^1.16.0"` di `package.json`) |
| 7 | **Deployment ke server** | ✅ Terpenuhi | Di-deploy ke **Vercel** dengan konfigurasi `vercel.json` (SPA rewrites) |

> **Catatan:** Kriteria yang berkaitan dengan RESTful API (membangun API, menyimpan ke database, menggunakan Express, integrasi AI/ML) adalah tanggung jawab **backend** — lihat `README_backend.md`.

---

## 🧰 Tech Stack

| Kategori | Teknologi | Versi |
|----------|-----------|-------|
| Framework UI | React | ^19.2.5 |
| Bahasa | JavaScript (JSX) | ES Module |
| Module Bundler | **Vite** | ^8.0.10 |
| Styling | **Tailwind CSS** | ^3.4.19 |
| HTTP Client | **Axios** + Fetch API | ^1.16.0 |
| Routing | React Router DOM | ^7.15.0 |
| Animasi | Framer Motion | ^11.18.2 |
| Peta | Leaflet | ^1.9.4 |
| Markdown | Marked + DOMPurify | ^18.0.3 / ^3.4.2 |
| Icons | Lucide React | ^0.525.0 |
| Deployment | **Vercel** | — |

---

## 🗂️ Struktur Proyek

```
seribu_fixed/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/              # Gambar dan SVG statis
│   ├── components/
│   │   ├── avatars/         # Komponen avatar (Riri, Kai, Hana, Dito, Luna)
│   │   ├── features/        # Komponen fitur (AvatarBuilder, FaskesMap, MoodSelector, dll.)
│   │   ├── icons/           # Ikon kustom SVG
│   │   ├── layout/          # DashboardShell, Sidebar
│   │   └── ui/              # Komponen generik (Modal, LoadingSpinner)
│   ├── context/
│   │   └── AuthContext.jsx  # Global auth state (JWT token)
│   ├── data/
│   │   └── articles.js      # Data artikel statis fallback
│   ├── lib/
│   │   └── api.js           # Semua fungsi networking (fetch/axios ke backend & HuggingFace)
│   ├── pages/
│   │   ├── admin/           # AdminLogin, AdminDashboard
│   │   ├── Home.jsx
│   │   ├── Chatbot.jsx      # Fitur utama: AI chatbot dengan deteksi emosi
│   │   ├── Journal.jsx      # Jurnal harian dengan mood tracking
│   │   ├── Faskes.jsx       # Peta fasilitas kesehatan (Leaflet + OpenStreetMap)
│   │   ├── Edukasi.jsx      # Artikel edukasi kesehatan mental
│   │   ├── Profile.jsx      # Profil user + avatar kustom
│   │   ├── Highlights.jsx   # Koleksi highlight percakapan
│   │   ├── ChatHistory.jsx  # Riwayat percakapan AI
│   │   ├── Archive.jsx
│   │   ├── Login.jsx / Register.jsx
│   │   └── Tentang.jsx
│   ├── App.jsx              # Root routing (React Router DOM)
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── vite.config.js           # Konfigurasi Vite + proxy dev server
├── tailwind.config.js       # Custom design tokens
├── postcss.config.js
├── vercel.json              # Konfigurasi deployment Vercel (SPA rewrites)
├── .env.example
└── package.json
```

---

## ✨ Fitur Utama

### 🤖 Chatbot AI dengan Deteksi Emosi
Halaman `/chatbot` mengirim pesan pengguna ke **HuggingFace Space** (`syahrulw-seribucerita-emotion`) yang menjalankan model deteksi emosi. Hasil emosi (happy, sad, anxious, angry, neutral, fear) digunakan untuk menyesuaikan respons AI dan menyimpan percakapan ke backend.

### 📖 Jurnal Harian
Pengguna dapat menulis entri jurnal dengan mood tracker. Data disimpan ke database melalui REST API backend.

### 🗺️ Peta Fasilitas Kesehatan
Menggunakan **Leaflet.js** + **OpenStreetMap** untuk menampilkan peta interaktif dan menemukan klinik, puskesmas, rumah sakit, serta psikiater/psikolog terdekat.

### 🎭 Avatar Builder
Pengguna dapat membuat dan mengkustomisasi avatar pribadi dari koleksi karakter (Luna, Kai, Hana, Dito, Riri).

### 📌 Highlights
Menyimpan cuplikan percakapan atau artikel yang bermakna.

---

## ⚙️ Setup Lokal

### Prasyarat
- Node.js >= 18
- npm >= 9

### Langkah Instalasi

```bash
# 1. Clone / ekstrak proyek
cd seribu_fixed

# 2. Install dependencies
npm install

# 3. Buat file environment
cp .env.example .env
# Edit .env:
#   VITE_API_URL=https://your-backend.railway.app
#   VITE_HF_URL=https://syahrulw-seribucerita-emotion.hf.space

# 4. Jalankan development server
npm run dev
# → http://localhost:5173
```

### Build untuk Produksi

```bash
npm run build
# Output di folder dist/
npm run preview  # preview hasil build lokal
```

---

## 🌐 Environment Variables

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `VITE_API_URL` | URL backend Railway | `https://your-app.railway.app` |
| `VITE_HF_URL` | URL HuggingFace Space (model AI) | `https://syahrulw-seribucerita-emotion.hf.space` |

---

## 🚀 Deployment (Vercel)

Proyek ini di-deploy ke **Vercel** sebagai Static Site dengan SPA routing.

**Konfigurasi `vercel.json`:**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```
Semua route di-redirect ke `index.html` agar React Router dapat menangani navigasi client-side.

**Langkah deploy:**
1. Push ke GitHub
2. Import repo di [vercel.com](https://vercel.com)
3. Set environment variables di dashboard Vercel
4. Deploy otomatis setiap push ke branch `main`

---

## 🔗 API Integration

Semua komunikasi jaringan terpusat di `src/lib/api.js`:

```
Backend (Railway)          HuggingFace Space
─────────────────          ─────────────────
POST /api/auth/login       POST /predict   ← deteksi emosi
POST /api/auth/register    POST /chat      ← respons AI chatbot
GET  /api/articles
POST /api/journals
GET  /api/highlights
GET  /api/faskes/search
GET  /api/chat/history
...
```

---

## 👥 Tim

Proyek **SeribuCerita** — CC26-PSU212

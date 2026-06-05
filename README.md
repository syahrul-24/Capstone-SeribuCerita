# 🌿 Seribu Cerita

> Teman cerita digitalmu untuk kesehatan mental yang lebih baik

**Capstone Project CC26-PSU212 — Coding Camp 2026**

---

## Tentang Proyek

Kesehatan mental masih menjadi tantangan yang memerlukan perhatian dan penanganan yang lebih baik di Indonesia. Gangguan depresi dan kecemasan merupakan kategori gangguan mental dengan beban penyakit tertinggi (Global Burden of Disease, 2023). Banyak individu mengalami kesulitan mengenali kondisi emosional yang mereka rasakan, sementara akses terhadap dukungan kesehatan mental yang cepat dan mudah masih terbatas.

**Seribu Cerita** adalah aplikasi web yang menjadi wadah bagi pengguna untuk bercerita sekaligus mendapatkan edukasi seputar kesehatan mental. Melalui teknologi Machine Learning berbasis NLP, aplikasi ini mampu mendeteksi emosi dari teks yang ditulis pengguna dan memberikan konten edukatif yang relevan secara otomatis.

## Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 📓 **Mood Journal** | Catat perasaan harianmu lewat jurnal mood sebagai refleksi diri sederhana namun bermakna |
| 💬 **Chat AI Empatik** | Curhat kapan saja dengan pendamping AI yang siap mendengar tanpa menghakimi, lengkap dengan riwayat percakapan |
| 🏥 **Temukan Faskes Terdekat** | Menemukan fasilitas kesehatan mental yang siap membantu secara profesional |
| 📰 **Rekomendasi Artikel** | Artikel kesehatan mental yang dipersonalisasi sesuai emosi yang dirasakan |

## Tech Stack

| Layer | Teknologi |
|---|---|
| AI/ML | IndoBERT, TensorFlow 2.x, Hugging Face Transformers, Google Gemini API |
| Backend | Node.js, Express, PostgreSQL |
| Frontend | React (Vite), TailwindCSS |
| Data Science | Python, Pandas, Streamlit |
| Deployment | Vercel (Frontend), HuggingFace Spaces (AI API), Railway (Backend) |

## Arsitektur Sistem

```
┌─────────────┐     ┌──────────────────────┐     ┌────────────┐
│   React      │────▶│   Node.js Backend    │────▶│ PostgreSQL │
│   Frontend   │     │   (Railway)          │     │            │
│   (Vercel)   │     └──────────┬───────────┘     └────────────┘
└─────────────┘                │
                               ▼
                  ┌──────────────────────────┐
                  │   AI API (HF Spaces)     │
                  │   IndoBERT Emotion        │
                  │   Classifier + Gemini     │
                  │   Empathetic Chatbot      │
                  └──────────────────────────┘
```

## Struktur Repository

```
capstone-repo/
├── AI/                → Emotion Classifier & Empathetic Chatbot API
│   └── README.md      → Detail setup & dokumentasi AI
├── DataSains/         → Dashboard Analisis Emosi Tweet (Streamlit)
│   └── README.md      → Detail setup & dokumentasi Data Science
├── FullStack/         → Web Application (Frontend & Backend)
│   └── README.md      → Detail setup & dokumentasi Full Stack
└── README.md          → File ini
```

## Demo & Deployment

| Komponen | URL |
|---|---|
| 🌐 Live Website | [seribu-frontend.vercel.app](https://seribu-frontend.vercel.app/) |
| 🤖 AI API Docs | [syahrulw-seribucerita-emotion.hf.space/docs](https://syahrulw-seribucerita-emotion.hf.space/docs) |

## Download & Load Model ML

Model Machine Learning (IndoBERT + Attention Pooling) tersedia di Google Drive:

🔗 **[Download Model — Google Drive](https://drive.google.com/drive/folders/1UAksQKBfyM5gXyfnO5JjzJtaQ2-JaJc1?usp=sharing)**

> **Catatan untuk reviewer:** Akun `capstone@student.devacademy.id` sudah diberikan akses view & download.

Instruksi lengkap cara load model (SavedModel / Keras / via API) tersedia di [`AI/README.md`](AI/README.md#download--load-model-ml).

## Quick Start

### AI Path — Emotion Classifier API

```bash
cd AI/api
pip install -r requirements.txt
cp .env.example .env          # Isi GEMINI_API_KEY (opsional, untuk fitur chat)
uvicorn app:app --port 7860
```

📖 Detail lengkap: [`AI/README.md`](AI/README.md)

### Full Stack — Web Application

```bash
# Backend
cd FullStack/seribubackend
npm install
cp .env.example .env          # Isi konfigurasi database & JWT
npm run dev                    # → http://localhost:3000

# Frontend
cd FullStack/seribufrontend
npm install
cp .env.example .env          # Isi URL API & HuggingFace
npm run dev                    # → http://localhost:5173
```

📖 Detail lengkap: [`FullStack/README.md`](FullStack/README.md)

### Data Science — Dashboard Analisis

```bash
cd DataSains
pip install -r requirements.txt
streamlit run dashboard/app.py
```

📖 Detail lengkap: [`DataSains/README.md`](DataSains/README.md)

## Tim — CC26-PSU212

| Nama | Learning Path |
|---|---|
| Syahrul Wicaksono | Artificial Intelligence |
| Latifah Nurazizah | Artificial Intelligence |
| Mochammad Irsyad Kanif | Full Stack |
| Dewi Nur Ayundari | Full Stack |
| Shafira Nabila Noer P. | Data Science |
| Novia Djoend Lestari | Data Science |

## Lisensi

Proyek ini dibuat untuk keperluan capstone project Coding Camp 2026.

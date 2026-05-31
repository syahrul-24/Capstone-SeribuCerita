# SeribuCerita — Emotion Classifier & Empathetic Chatbot

Klasifikasi emosi teks Bahasa Indonesia menggunakan IndoBERT dan respons empatik AI menggunakan Gemini.

**Capstone Project CC26-PSU212 — AI Path**

## Fitur

- **Klasifikasi Emosi** — Deteksi 5 emosi (anger, fear, sad, neutral, happy) dari teks Bahasa Indonesia
- **Chat Empatik** — Respons AI yang kontekstual dan empatik dengan persona psikolog virtual
- **Multi-turn Chat** — Mendukung percakapan berkelanjutan dengan riwayat konteks
- **REST API** — Endpoint siap pakai untuk integrasi frontend

## Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Model | IndoBERT (`indobenchmark/indobert-base-p1`) + custom Attention Pooling |
| Framework | TensorFlow 2.x, Hugging Face Transformers |
| API | FastAPI, Uvicorn |
| Generative AI | Google Gemini API |
| Deployment | HuggingFace Spaces (Docker) |

## Struktur Folder

```
├── notebooks/
│   ├── 01_dataset_preparation.ipynb   # Pipeline data end-to-end
│   ├── 02_training.ipynb              # Training model IndoBERT
│   └── 03_inference.ipynb             # Inference, testing, & chatbot
├── api/
│   ├── app.py                         # FastAPI server
│   ├── inference.py                   # Model inference module
│   ├── Dockerfile                     # Container config
│   ├── requirements.txt               # Python dependencies
│   └── API_DOCUMENTATION.md           # Dokumentasi endpoint
├── data/
│   ├── train_5kls.csv                 # Training set (7,413 rows)
│   ├── valid_5kls.csv                 # Validation set (931 rows)
│   └── test_5kls.csv                  # Test set (951 rows)
├── demo/                              # Frontend demo (HTML/CSS/JS)
├── docs/                              # Postman collection
└── .gitignore
```

## Hasil

| Metrik | Skor |
|--------|------|
| Test Accuracy | 85.19% |
| Macro F1 | 85.32% |

## Quick Start

### 1. Jalankan Notebook

Notebook dirancang untuk dijalankan berurutan:

```
01_dataset_preparation → 02_training → 03_inference
```

- **01** download data dari GitHub, preprocess, dan save ke `data/`
- **02** training model di Google Colab (GPU), output ke `output/`
- **03** load model dan demo inference + chatbot interaktif

### 2. Jalankan API Lokal

```bash
cd api
pip install -r requirements.txt
export GEMINI_API_KEY="your-key-here"   # opsional, untuk fitur chat
uvicorn app:app --port 7860
```

API tersedia di `http://localhost:7860/docs`

### 3. Gunakan API yang Sudah Deploy

```bash
# Klasifikasi emosi
curl -X POST https://syahrulw-seribucerita-emotion.hf.space/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "aku senang banget hari ini!"}'

# Chat empatik
curl -X POST https://syahrulw-seribucerita-emotion.hf.space/chat \
  -H "Content-Type: application/json" \
  -d '{"text": "aku sedih banget", "history": []}'
```

Dokumentasi lengkap endpoint: [`api/API_DOCUMENTATION.md`](api/API_DOCUMENTATION.md)

## Dataset

Gabungan dari dua sumber publik:

| Dataset | Referensi |
|---------|-----------|
| IndoNLU EmoT | Saputri et al., 2018 |
| Ricco48 Public Opinion | Riccosan et al., 2022 |

Pipeline preprocessing mencakup deduplication, label mapping, neutral filtering, stratified split (80/10/10), dan negation augmentation. Detail di [`notebooks/01_dataset_preparation.ipynb`](notebooks/01_dataset_preparation.ipynb).

## Arsitektur Model

```
Input Text → IndoBERT Tokenizer → IndoBERT (frozen layers 0-3)
  → Attention Pooling → Dropout → Dense(5) → Softmax → Emotion Label
```

Teknik training:
- Custom loss: Focal Loss + Label Smoothing + Class Weights
- Layer-wise learning rate decay
- R-Drop regularization
- Custom F1 callback dengan early stopping

## Lisensi

Proyek ini dibuat untuk keperluan capstone project Coding Camp 2026.

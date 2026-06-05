# SeribuCerita — Emotion Classifier & Empathetic Chatbot

Klasifikasi emosi teks Bahasa Indonesia menggunakan IndoBERT dan respons empatik AI menggunakan Gemini.

**Capstone Project CC26-PSU212 — AI Path**

## Fitur

- **Klasifikasi Emosi** — Deteksi 5 emosi (anger, fear, sad, neutral, happy) dari teks Bahasa Indonesia
- **Chat Empatik** — Respons AI yang kontekstual dan empatik dengan persona psikolog virtual
- **Multi-turn Chat** — Mendukung percakapan berkelanjutan dengan riwayat konteks
- **REST API** — Endpoint siap pakai untuk integrasi frontend

## 📋 Checklist Tugas AI

### ✅ Main Quest

| No | Kriteria | Status | Keterangan |
|----|----------|--------|------------|
| 1 | **Model Deep Learning dengan TF Functional API / Model Subclassing** | ✅ Terpenuhi | Model Subclassing `EmotionClassifier` di [`02_Training.ipynb`](notebooks/02_Training.ipynb) — IndoBERT backbone + custom head |
| 2 | **Custom Layer** | ✅ Terpenuhi | `AttentionPoolingLayer` — attention-weighted pooling menggantikan default [CLS] token pooling |
| 3 | **Custom Loss Function** | ✅ Terpenuhi | `FocalLossWithSmoothing` — Focal Loss + Label Smoothing + Class Weights |
| 4 | **Custom Callback** | ✅ Terpenuhi | `F1Callback` — evaluasi Macro F1 per epoch dengan early stopping berbasis F1 score |
| 5 | **Model disimpan dalam format TF siap produksi** | ✅ Terpenuhi | Disimpan dalam 2 format: `.keras` dan `SavedModel` |
| 6 | **Kode inference sederhana** | ✅ Terpenuhi | [`03_inference.ipynb`](notebooks/03_inference.ipynb) (notebook) + [`api/inference.py`](api/inference.py) (production) |

### ✅ Side Quest (Nilai Tambah)

| No | Kriteria | Status | Keterangan |
|----|----------|--------|------------|
| 1 | **REST API dengan FastAPI/Flask** | ✅ Terpenuhi | FastAPI di [`api/app.py`](api/app.py) — endpoint `/predict`, `/chat`, `/batch`, dll. Deploy di HuggingFace Spaces |
| 2 | **Custom training loop dengan `tf.GradientTape`** | ✅ Terpenuhi | Full custom loop di [`02_Training.ipynb`](notebooks/02_Training.ipynb) dengan R-Drop regularization, layer-wise LR decay, gradient clipping |
| 3 | **Generative AI untuk fitur tambahan** | ✅ Terpenuhi | Google Gemini API untuk fitur chat empatik dengan persona psikolog virtual |
| 4 | **TensorBoard untuk monitoring training** | ✅ Terpenuhi | TensorBoard callback terintegrasi, log disimpan di `logs/` |
| 5 | **Akurasi minimal 85%** | ✅ Terpenuhi | Test Accuracy: **85.19%**, Macro F1: **85.32%** |

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
│   ├── .env.example                   # Template environment variables
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

## Download & Load Model ML

Model Machine Learning (IndoBERT + Attention Pooling) tersedia di Google Drive:

🔗 **[Download Model — Google Drive](https://drive.google.com/drive/folders/1UAksQKBfyM5gXyfnO5JjzJtaQ2-JaJc1?usp=sharing)**

> **Catatan untuk reviewer:** Akun `capstone@student.devacademy.id` sudah diberikan akses view & download.

### Isi Folder Model

| File/Folder | Deskripsi |
|---|---|
| `saved_model/` | TensorFlow SavedModel (digunakan oleh API — **tidak perlu** custom layer) |
| `model_final.keras` | Format Keras (untuk notebook — **perlu** definisi custom layer saat load) |
| `tokenizer/` | IndoBERT tokenizer files |
| `results.json` | Metrik evaluasi model |

### Cara Load Model

**Opsi 1 — Via API (Otomatis, Recommended)**

API akan otomatis mendownload model dari HuggingFace Hub saat pertama kali dijalankan. Tidak perlu download manual.

**Opsi 2 — Via Notebook (`.keras` format)**

Download folder model dari Google Drive, lalu jalankan [`notebooks/03_inference.ipynb`](notebooks/03_inference.ipynb). Notebook sudah menyertakan definisi custom layer (`AttentionPoolingLayer`, `FocalLossWithSmoothing`, `EmotionClassifier`) yang harus dijalankan **sebelum** load model:

```python
# Custom layer sudah didefinisikan di cell sebelumnya dalam notebook
model = tf.keras.models.load_model('output/model_final.keras', custom_objects={
    'AttentionPoolingLayer': AttentionPoolingLayer,
    'FocalLossWithSmoothing': FocalLossWithSmoothing,
    'EmotionClassifier': EmotionClassifier,
})
```

**Opsi 3 — SavedModel (tanpa custom layer)**

```python
import tensorflow as tf
model = tf.saved_model.load('output/saved_model')
infer = model.signatures['serving_default']
```

## Setup Environment

### Prasyarat

- **Python** 3.10+
- **pip** (package manager)
- **GPU** (opsional, direkomendasikan untuk training)
- **Google Colab** (direkomendasikan untuk menjalankan notebook training)

### Langkah-langkah

```bash
# 1. Clone repository
git clone <repo-url>
cd AI

# 2. Buat virtual environment
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows

# 3. Install dependensi
cd api
pip install -r requirements.txt

# 4. Setup environment variables
cp .env.example .env
# Edit .env dan isi GEMINI_API_KEY (opsional, untuk fitur chat)
```

## Quick Start

### 1. Jalankan Notebook (Training & Inference)

Notebook dirancang untuk dijalankan berurutan di **Google Colab**:

```
01_dataset_preparation → 02_training → 03_inference
```

- **01** — download data dari GitHub, preprocess, dan save ke `data/`
- **02** — training model di Google Colab (GPU), output ke `output/`
- **03** — load model dan demo inference + chatbot interaktif

### 2. Jalankan API Lokal

```bash
cd api
pip install -r requirements.txt

# Set environment variable (pilih salah satu)
export GEMINI_API_KEY="your-key-here"   # Linux/Mac
set GEMINI_API_KEY=your-key-here        # Windows CMD
$env:GEMINI_API_KEY="your-key-here"     # Windows PowerShell

# Jalankan server
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

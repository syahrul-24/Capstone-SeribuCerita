# SeribuCerita API

REST API untuk klasifikasi emosi teks Bahasa Indonesia dan chat empatik AI.

**Base URL:**
```
https://syahrulw-seribucerita-emotion.hf.space
```

**Swagger UI:** [`/docs`](https://syahrulw-seribucerita-emotion.hf.space/docs)

---

## Emosi yang Didukung

| Label | Emoji | Deskripsi |
|-------|-------|-----------|
| `anger` | 😠 | Marah / frustrasi |
| `fear` | 😨 | Takut / cemas |
| `sad` | 😢 | Sedih / kecewa |
| `neutral` | 😐 | Netral |
| `happy` | 😄 | Senang / gembira |

---

## Endpoints

### `POST /predict`

Klasifikasi emosi untuk satu teks.

**Request:**
```json
{
  "text": "aku senang banget hari ini!",
  "calibrate": true
}
```

| Field | Type | Required | Default | Deskripsi |
|-------|------|----------|---------|-----------|
| `text` | string | ✅ | — | Teks Bahasa Indonesia (1–1000 karakter) |
| `calibrate` | bool | ❌ | `true` | Aktifkan post-processing |

**Response:**
```json
{
  "label": "happy",
  "confidence": 0.9234,
  "calibrated_confidence": 0.8156,
  "emoji": "😄",
  "scores": {
    "happy": 0.8156,
    "neutral": 0.0821,
    "sad": 0.0412,
    "anger": 0.0356,
    "fear": 0.0255
  },
  "processing_time_ms": 45.23
}
```

```bash
curl -X POST https://syahrulw-seribucerita-emotion.hf.space/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "aku senang banget hari ini!"}'
```

---

### `POST /predict/batch`

Klasifikasi hingga 32 teks dalam satu request.

**Request:**
```json
{
  "texts": ["aku senang!", "aku sedih", "biasa aja"],
  "calibrate": true
}
```

**Response:**
```json
{
  "predictions": [{ "label": "happy", "confidence": 0.92, "..." : "..." }],
  "total_texts": 3,
  "processing_time_ms": 45.23
}
```

```bash
curl -X POST https://syahrulw-seribucerita-emotion.hf.space/predict/batch \
  -H "Content-Type: application/json" \
  -d '{"texts": ["aku senang!", "aku sedih", "biasa aja"]}'
```

---

### `POST /chat`

Deteksi emosi + respons empatik AI dalam satu request. Mendukung multi-turn via `history`.

**Request:**
```json
{
  "text": "aku sedih banget hari ini",
  "history": [
    { "role": "user", "content": "halo" },
    { "role": "assistant", "content": "Hai! Senang bisa ngobrol..." }
  ],
  "calibrate": true
}
```

| Field | Type | Required | Default | Deskripsi |
|-------|------|----------|---------|-----------|
| `text` | string | ✅ | — | Pesan terbaru user (1–2000 karakter) |
| `history` | array | ❌ | `[]` | Riwayat percakapan (12 turn terakhir) |
| `calibrate` | bool | ❌ | `true` | Aktifkan post-processing |

**Response:**
```json
{
  "emotion": {
    "label": "sad",
    "confidence": 0.8721,
    "emoji": "😢",
    "scores": { "sad": 0.75, "anger": 0.10, "..." : "..." }
  },
  "ai_response": "Aku turut merasakan kesedihan yang kamu alami...",
  "ai_model": "gemini-2.5-flash",
  "processing_time_ms": 1523.45
}
```

| Field | Type | Deskripsi |
|-------|------|-----------|
| `emotion` | object | Hasil klasifikasi (sama dengan `/predict`) |
| `ai_response` | string | Respons empatik AI |
| `ai_model` | string | `"gemini-2.5-flash"` atau `"fallback"` |
| `processing_time_ms` | float | Total waktu (ms) |

```bash
curl -X POST https://syahrulw-seribucerita-emotion.hf.space/chat \
  -H "Content-Type: application/json" \
  -d '{"text": "aku sedih banget hari ini", "history": []}'
```

---

### `GET /health`

```bash
curl https://syahrulw-seribucerita-emotion.hf.space/health
```

```json
{ "status": "healthy", "model_loaded": true, "gemini_available": true }
```

### `GET /model-info`

```bash
curl https://syahrulw-seribucerita-emotion.hf.space/model-info
```

```json
{
  "model_name": "SeribuCerita Emotion Classifier",
  "backbone": "indobenchmark/indobert-base-p1",
  "classes": ["anger", "fear", "sad", "neutral", "happy"],
  "max_length": 128,
  "metrics": { "test_accuracy": 0.8519, "test_macro_f1": 0.8234 }
}
```

---

## Error Handling

```json
{ "detail": "Error message" }
```

| Status | Deskripsi |
|--------|-----------|
| `200` | Sukses |
| `422` | Input tidak valid |
| `503` | Model belum loaded (cold start ~1-3 menit setelah idle) |

---

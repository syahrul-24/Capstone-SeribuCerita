"""
SeribuCerita Emotion Classifier + Chat API
Capstone Project CC26-PSU212 — AI Path

Single API providing:
  POST /predict       — Classify single text (IndoBERT)
  POST /predict/batch — Classify multiple texts
  POST /chat          — Emotion + Gemini AI empathetic response (multi-turn)
  GET  /health        — Health check
  GET  /model-info    — Model metadata
  GET  /docs          — Swagger documentation
"""
import os
import time
import logging
import asyncio
from contextlib import asynccontextmanager
from google import genai
from google.genai import types

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from inference import EmotionPredictor

# ============================================================
# LOGGING
# ============================================================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)
logger = logging.getLogger(__name__)

# ============================================================
# SCHEMAS — Request Models
# ============================================================

class PredictRequest(BaseModel):
    """Request body untuk klasifikasi emosi satu teks."""
    text: str = Field(
        ..., min_length=1, max_length=1000,
        description="Teks Bahasa Indonesia yang akan diklasifikasi emosinya.",
        json_schema_extra={"examples": ["aku senang banget hari ini!"]},
    )
    calibrate: bool = Field(
        True,
        description="Aktifkan temperature scaling (T=1.5) dan post-processing corrections.",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [{"text": "aku senang banget hari ini!", "calibrate": True}]
        }
    }


class BatchPredictRequest(BaseModel):
    """Request body untuk klasifikasi emosi banyak teks sekaligus."""
    texts: list[str] = Field(
        ..., min_length=1, max_length=32,
        description="Array teks Bahasa Indonesia (maksimal 32 item per request).",
    )
    calibrate: bool = Field(True, description="Aktifkan calibration.")


class ChatRequest(BaseModel):
    """Request body untuk chat empatik multi-turn."""
    text: str = Field(
        ..., min_length=1, max_length=2000,
        description="Pesan terbaru dari user.",
        json_schema_extra={"examples": ["aku sedih banget hari ini"]},
    )
    history: list[dict] = Field(
        default_factory=list,
        description='Riwayat percakapan. Format: [{"role": "user"|"assistant", "content": "..."}]. API menggunakan 12 turn terakhir.',
    )
    calibrate: bool = Field(True, description="Aktifkan calibration.")

    model_config = {
        "json_schema_extra": {
            "examples": [{
                "text": "aku sedih banget hari ini",
                "history": [],
                "calibrate": True,
            }]
        }
    }


# ============================================================
# SCHEMAS — Response Models
# ============================================================

class EmotionResult(BaseModel):
    """Hasil klasifikasi emosi dari model IndoBERT."""
    label: str = Field(..., description="Label emosi dominan.", json_schema_extra={"examples": ["happy"]})
    confidence: float = Field(..., description="Skor kepercayaan raw (sebelum calibration).", json_schema_extra={"examples": [0.9234]})
    calibrated_confidence: float = Field(..., description="Skor setelah temperature scaling.", json_schema_extra={"examples": [0.8156]})
    emoji: str = Field(..., description="Emoji representasi emosi.", json_schema_extra={"examples": ["😄"]})
    scores: dict[str, float] = Field(..., description="Skor semua 5 kelas emosi (sorted descending).")
    notes: list[str] | None = Field(None, description="Catatan koreksi post-processing (jika ada).")


class PredictResponse(EmotionResult):
    """Response dari endpoint /predict."""
    processing_time_ms: float = Field(..., description="Waktu inferensi dalam milidetik.")


class BatchPredictResponse(BaseModel):
    """Response dari endpoint /predict/batch."""
    predictions: list[PredictResponse] = Field(..., description="Array hasil prediksi per teks.")
    total_texts: int = Field(..., description="Jumlah teks yang diproses.")
    processing_time_ms: float = Field(..., description="Total waktu batch.")


class ChatResponse(BaseModel):
    """Response dari endpoint /chat — menggabungkan klasifikasi emosi dan respons AI."""
    emotion: EmotionResult = Field(..., description="Hasil klasifikasi emosi dari IndoBERT.")
    ai_response: str = Field(..., description="Respons empatik dari Gemini AI dengan persona SeribuCerita.")
    ai_model: str = Field(..., description='Model Gemini yang digunakan, atau "fallback" jika Gemini tidak tersedia.', json_schema_extra={"examples": ["gemini-2.5-flash"]})
    processing_time_ms: float = Field(..., description="Total waktu (klasifikasi + generasi respons).")


class HealthResponse(BaseModel):
    """Response dari endpoint /health."""
    status: str = Field(..., description="Status server.", json_schema_extra={"examples": ["healthy"]})
    model_loaded: bool = Field(..., description="Apakah model IndoBERT sudah ter-load.")
    gemini_available: bool = Field(..., description="Apakah Gemini API key tersedia.")


class ModelInfoResponse(BaseModel):
    """Response dari endpoint /model-info."""
    model_name: str = Field(..., description="Nama model.")
    backbone: str = Field(..., description="Backbone model (pretrained).")
    task: str = Field(..., description="Deskripsi task.")
    classes: list[str] = Field(..., description="Daftar kelas emosi.")
    max_length: int = Field(..., description="Panjang token maksimum.")
    metrics: dict | None = Field(None, description="Metrik evaluasi (accuracy, F1).")


class ErrorResponse(BaseModel):
    """Format error standar."""
    detail: str = Field(..., description="Pesan error.", json_schema_extra={"examples": ["Model not loaded"]})


# ============================================================
# GEMINI CLIENT — Persona Psikolog SeribuCerita
# ============================================================
# Persona diambil dari gemini-chatbot-api/src/config/gemini.js
# agar konsisten di semua platform SeribuCerita.
# ============================================================

SYSTEM_PROMPT = """Kamu adalah **SeribuCerita**, seorang psikolog virtual yang empatik, hangat, dan profesional.
Kamu adalah teman cerita AI yang aman — bukan pengganti psikolog/psikiater sungguhan.

## ATURAN WAJIB (HARUS DIPATUHI)
- SELALU gunakan kata ganti "kamu", JANGAN PERNAH gunakan "Anda" atau "Saudara". Ini MUTLAK dan tidak boleh dilanggar.
- SELALU akhiri setiap respons dengan SATU pertanyaan terbuka untuk melanjutkan percakapan.
- Gunakan bahasa Indonesia yang santai, lembut, dan natural — seperti teman dekat yang bijak.

## Identitas & Kepribadian
- Nama: SeribuCerita
- Sifat: hangat, sabar, penuh perhatian, tidak menghakimi, suportif
- Nada bicara: seperti sahabat yang peduli, bukan dosen atau guru

## Alur Percakapan (IKUTI URUTAN INI)
Setiap percakapan harus mengikuti alur berikut secara natural:
1. **Dengarkan & Serap** — Pada pesan awal, fokus menyerap cerita. Jangan langsung beri solusi sebelum user merasa didengarkan.
2. **Validasi & Eksplorasi** — Validasi emosi mereka, lanjutkan menggali lebih dalam situasi dan perasaan.
3. **Beri Solusi** — HANYA berikan solusi atau saran SETELAH user sudah merasa didengarkan, ATAU ketika user secara eksplisit meminta solusi/saran.
Jika user langsung meminta solusi di awal, tetap validasi perasaannya dulu sebelum memberikan langkah-langkah konkret.

## Teknik Komunikasi (Gunakan teknik OARS)
1. **Open Questions** — Selalu gunakan pertanyaan terbuka, bukan ya/tidak. Contoh: "Bisa ceritakan lebih lanjut...?"
2. **Affirmation** — Akui kekuatan dan usaha pengguna. Contoh: "Kamu sudah sangat berani mau menceritakan ini..."
3. **Reflective Listening** — Pantulkan kembali inti cerita user untuk membuktikan kamu menyimak. Contoh: "Jadi kalau saya pahami, kamu merasa..."
4. **Summary** — Di titik tertentu, rangkum apa yang sudah user ceritakan sebelum melanjutkan.
5. **Validasi Emosi** — Akui bahwa perasaan mereka valid. Contoh: "Wajar banget kalau kamu merasa seperti itu..."
6. **Normalisasi** — Bantu user memahami bahwa perasaannya adalah hal yang normal dan manusiawi.
7. **Reframing** — Bantu melihat situasi dari sudut pandang baru yang lebih positif, tanpa meremehkan perasaan.
8. **Coping Strategy** — Berikan saran praktis dan teknik sederhana (grounding 5-4-3-2-1, journaling, teknik pernapasan) pada waktu yang tepat.

## Format Respons
- Panjang WAJIB: MINIMAL 3 paragraf penuh di SETIAP respons — jangan pernah merespons hanya dengan 1-2 kalimat
- Setiap paragraf berisi 2-4 kalimat yang bermakna dan relevan dengan cerita user
- Gunakan emoji secukupnya (1-2 per respons) untuk menambah kehangatan 💙
- Tulis seperti percakapan natural, hindari bullet point yang kaku
- WAJIB akhiri dengan pertanyaan terbuka atau ajakan lembut agar percakapan mengalir

## Batasan Etis (SANGAT PENTING)
- Kamu BUKAN pengganti psikolog/psikiater profesional. Jika pengguna menunjukkan tanda-tanda serius, sarankan untuk menghubungi profesional.
- Jika pengguna menyebutkan pikiran bunuh diri atau menyakiti diri sendiri:
  1. Tetap tenang dan empatik
  2. Validasi perasaannya
  3. Arahkan ke hotline darurat: **Into The Light Indonesia: 119 ext. 8** atau **Sejiwa: 119 ext. 8**
  4. Sarankan untuk menghubungi orang terdekat yang dipercaya
- JANGAN memberikan diagnosis medis
- JANGAN meresepkan obat atau terapi spesifik
- JANGAN meremehkan atau mengabaikan perasaan pengguna

## Yang TIDAK Boleh Dilakukan
- JANGAN PERNAH menggunakan kata "Anda" — selalu gunakan "kamu"
- Jangan mengatakan "Saya hanya AI" kecuali ditanya langsung
- Jangan mengubah topik secara tiba-tiba
- Jangan memberikan nasihat yang bersifat menggurui
- Jangan langsung memberi solusi sebelum user merasa didengarkan (kecuali user memintanya)""".strip()


class GeminiClient:
    """
    Google Gemini API client — sama persis dengan SeribuCerita production chatbot.

    Primary model : gemini-2.5-flash (cheapest)
    Fallback chain: gemini-2.0-flash-lite → gemini-2.0-flash
    Config        : temperature=0.8, maxOutputTokens=2048, topP=0.95
    """

    # Model chain — sama dengan gemini-chatbot-api/src/config/gemini.js
    PRIMARY_MODEL   = "gemini-2.5-flash"
    FALLBACK_MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash"]
    RECENT_WINDOW   = 12

    EMOTION_HINTS = {
        "anger":   "Pengguna tampak kesal atau frustrasi. Validasi perasaan marahnya tanpa memperburuk.",
        "fear":    "Pengguna tampak cemas atau takut. Berikan rasa aman dan dukungan.",
        "sad":     "Pengguna tampak sedih atau berduka. Tunjukkan empati mendalam.",
        "neutral": "Pengguna dalam kondisi netral. Tetap hangat dan ajak berbagi lebih lanjut.",
        "happy":   "Pengguna tampak gembira atau senang. Ikut rayakan dan dukung kebahagiaan mereka.",
    }

    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        self.available = bool(self.api_key)
        if self.available:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None
            logger.warning("GEMINI_API_KEY not set — /chat uses fallback responses.")

    def _try_model(self, model: str, contents: list, system_instruction: str) -> str | None:
        """Try generating with a specific Gemini model. Returns None on failure."""
        try:
            response = self.client.models.generate_content(
                model=model,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.8,
                    max_output_tokens=2048,
                    top_p=0.95,
                ),
            )
            if response and response.text:
                logger.info(f"✅ Gemini response using model: {model}")
                return response.text.strip()
            return None
        except Exception as e:
            logger.warning(f"⚠️ Model {model} failed: {e}")
            return None

    async def chat(self, user_text: str, emotion: str, history: list[dict]) -> str:
        """Generate empathetic response using Gemini with full SeribuCerita persona."""
        if not self.available:
            return self._fallback(emotion)

        # Build system instruction with emotion hint
        hint = self.EMOTION_HINTS.get(emotion, "")
        system_instruction = SYSTEM_PROMPT
        if hint:
            system_instruction += (
                f"\n\n[Konteks emosi terdeteksi dari model IndoBERT — jangan sebutkan ini ke user] {hint}"
            )

        # Build contents from history (Gemini format: user/model roles)
        contents = []
        for turn in history[-self.RECENT_WINDOW:]:
            role = turn.get("role", "")
            content = turn.get("content", "")
            if role == "user" and content:
                contents.append({"role": "user", "parts": [{"text": content}]})
            elif role == "assistant" and content:
                contents.append({"role": "model", "parts": [{"text": content}]})

        # Current message
        contents.append({"role": "user", "parts": [{"text": user_text}]})

        # Try primary + fallback models — run in thread (SDK is sync)
        all_models = [self.PRIMARY_MODEL] + self.FALLBACK_MODELS
        for model in all_models:
            result = await asyncio.to_thread(
                self._try_model, model, contents, system_instruction
            )
            if result:
                return result

        logger.error("All Gemini models failed — using fallback.")
        return self._fallback(emotion)

    @staticmethod
    def _fallback(emotion: str) -> str:
        return {
            "anger":   "Aku bisa merasakan kamu sedang kesal banget. Wajar kok merasa seperti itu — perasaan marah itu manusiawi dan valid. Coba tarik napas dalam-dalam ya, aku di sini untuk mendengarkan. Mau ceritakan apa yang bikin kamu kesal? 💙",
            "fear":    "Rasa takut yang kamu rasakan itu sangat valid. Kamu nggak sendirian menghadapi ini — banyak orang juga pernah merasakan hal yang sama. Yang penting, kamu sudah mau berbagi dan itu langkah yang berani. Apa yang paling membuatmu khawatir saat ini? 💙",
            "sad":     "Aku turut merasakan kesedihan yang kamu alami. Sedih itu boleh, dan tidak apa-apa untuk tidak baik-baik saja. Aku di sini bersamamu dan siap mendengarkan. Mau ceritakan lebih lanjut tentang apa yang kamu rasakan? 💙",
            "neutral": "Terima kasih sudah mau berbagi denganku. Aku senang bisa menemanimu ngobrol — apapun yang ingin kamu ceritakan, aku siap mendengarkan tanpa menghakimi. Ada hal yang sedang kamu pikirkan atau rasakan hari ini? 😊",
            "happy":   "Wah, senang banget dengar kamu sedang bahagia! Kebahagiaan itu berharga dan layak untuk dirayakan. Aku ikut senang bisa menemani momen positif ini. Boleh ceritakan apa yang bikin kamu happy hari ini? 🌟",
        }.get(emotion, "Terima kasih sudah mau berbagi ceritamu denganku. Aku di sini siap mendengarkan — mau ceritakan lebih lanjut? 💙")


# ============================================================
# APP LIFESPAN
# ============================================================
gemini_client = GeminiClient()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting SeribuCerita Emotion Classifier + Chat API...")
    predictor = EmotionPredictor()
    predictor.load()
    app.state.predictor = predictor
    logger.info(f"Gemini available: {gemini_client.available}")
    logger.info("API ready!")
    yield
    logger.info("Shutting down...")


# ============================================================
# FASTAPI APP
# ============================================================

API_TAGS = [
    {
        "name": "Prediction",
        "description": "Klasifikasi emosi dari teks Bahasa Indonesia. Mendukung single dan batch request.",
    },
    {
        "name": "Chat",
        "description": "Percakapan empatik multi-turn. Mendeteksi emosi dan menghasilkan respons AI yang kontekstual.",
    },
    {
        "name": "System",
        "description": "Health check dan metadata.",
    },
]

app = FastAPI(
    lifespan=lifespan,
    title="SeribuCerita API",
    summary="Emotion classification & empathetic chat for Indonesian text.",
    description=(
        "API untuk mendeteksi emosi dari teks Bahasa Indonesia dan menghasilkan "
        "respons empatik secara real-time.\n\n"
        "## Emosi yang Didukung\n\n"
        "`anger` · `fear` · `sad` · `neutral` · `happy`\n\n"
        "## Quick Start\n\n"
        "```bash\n"
        "# Klasifikasi emosi\n"
        'curl -X POST /predict -H "Content-Type: application/json" \\\n'
        '  -d \'{"text": "aku senang banget hari ini!"}\' \n\n'
        "# Chat empatik\n"
        'curl -X POST /chat -H "Content-Type: application/json" \\\n'
        '  -d \'{"text": "aku sedih", "history": []}\' \n'
        "```"
    ),
    version="1.1.0",
    contact={
        "name": "SeribuCerita",
        "url": "https://seribucerita.onrender.com",
    },
    openapi_tags=API_TAGS,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ENDPOINTS
# ============================================================

@app.get(
    "/",
    tags=["System"],
    summary="API Root",
    description="Informasi dasar API dan daftar endpoint yang tersedia.",
    include_in_schema=False,
)
async def root():
    return {
        "name": "SeribuCerita Emotion + Chat API",
        "version": "1.1.0",
        "docs": "/docs",
        "endpoints": ["/predict", "/predict/batch", "/chat", "/health", "/model-info"],
        "gemini_available": gemini_client.available,
    }


@app.get(
    "/health",
    tags=["System"],
    response_model=HealthResponse,
    summary="Health Check",
    description="Cek status API dan ketersediaan layanan.",
)
async def health():
    return {
        "status": "healthy",
        "model_loaded": hasattr(app.state, "predictor") and app.state.predictor._loaded,
        "gemini_available": gemini_client.available,
    }


@app.get(
    "/model-info",
    tags=["System"],
    response_model=ModelInfoResponse,
    summary="Model Info",
    description="Metadata model: backbone, kelas emosi, dan metrik evaluasi.",
    responses={503: {"model": ErrorResponse, "description": "Service belum siap."}},
)
async def model_info():
    if not hasattr(app.state, "predictor"):
        raise HTTPException(503, "Model not loaded")
    return app.state.predictor.get_model_info()


@app.post(
    "/predict",
    tags=["Prediction"],
    response_model=PredictResponse,
    summary="Classify Single Text",
    description="Klasifikasi satu teks ke salah satu dari 5 kategori emosi. Aktifkan `calibrate` untuk post-processing otomatis.",
    responses={503: {"model": ErrorResponse, "description": "Service belum siap."}},
)
async def predict(request: PredictRequest):
    if not hasattr(app.state, "predictor"):
        raise HTTPException(503, "Model not loaded")
    start = time.time()
    result = app.state.predictor.predict(request.text, calibrate=request.calibrate)
    ms = (time.time() - start) * 1000
    return {**result, "processing_time_ms": round(ms, 2)}


@app.post(
    "/predict/batch",
    tags=["Prediction"],
    response_model=BatchPredictResponse,
    summary="Classify Batch",
    description="Klasifikasi hingga 32 teks dalam satu request.",
    responses={503: {"model": ErrorResponse, "description": "Service belum siap."}},
)
async def predict_batch(request: BatchPredictRequest):
    if not hasattr(app.state, "predictor"):
        raise HTTPException(503, "Model not loaded")
    start = time.time()
    results = app.state.predictor.predict_batch(request.texts, calibrate=request.calibrate)
    ms = (time.time() - start) * 1000
    return {
        "predictions": [{**r, "processing_time_ms": round(ms / len(results), 2)} for r in results],
        "total_texts": len(request.texts),
        "processing_time_ms": round(ms, 2),
    }


@app.post(
    "/chat",
    tags=["Chat"],
    response_model=ChatResponse,
    summary="Empathetic Chat",
    description=(
        "Deteksi emosi dan hasilkan respons empatik dalam satu request.\n\n"
        "Mendukung percakapan multi-turn melalui field `history`. "
        "Cek field `ai_model` untuk mengetahui apakah respons berasal dari AI atau fallback."
    ),
    responses={503: {"model": ErrorResponse, "description": "Service belum siap."}},
)
async def chat(request: ChatRequest):
    if not hasattr(app.state, "predictor"):
        raise HTTPException(503, "Model not loaded")

    start = time.time()

    # Step 1: Classify emotion with IndoBERT
    emotion_result = app.state.predictor.predict(request.text, calibrate=request.calibrate)

    # Step 2: Generate empathetic response with Gemini
    ai_response = await gemini_client.chat(
        user_text=request.text,
        emotion=emotion_result["label"],
        history=request.history,
    )

    ms = (time.time() - start) * 1000

    return {
        "emotion": emotion_result,
        "ai_response": ai_response,
        "ai_model": gemini_client.PRIMARY_MODEL if gemini_client.available else "fallback",
        "processing_time_ms": round(ms, 2),
    }

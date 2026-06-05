# 🌿 SeribuCerita — Backend API

> RESTful API untuk aplikasi web kesehatan mental SeribuCerita. Dibangun dengan Express.js, PostgreSQL, dan integrasi AI melalui HuggingFace Space.

**Base URL (Production):** `https://seribu-backend-production.up.railway.app`  
**Hosting:** Railway (dengan Docker)  
**Frontend Repo:** Lihat `README_frontend.md`

---

## 📋 Checklist Tech Stack

### ✅ Main Quest

| No | Kriteria | Status | Keterangan |
|----|----------|--------|------------|
| 1 | **Membangun RESTful API** | ✅ Terpenuhi | Express.js dengan 8 router modul: `auth`, `profile`, `journals`, `highlights`, `faskes`, `articles`, `chat`, `superadmin` |
| 2 | **RESTful API dapat menyimpan data** | ✅ Terpenuhi | PostgreSQL sebagai database utama dengan connection pool (`pg`) |
| 3 | **URL mengikuti standar konvensi RESTful** | ✅ Terpenuhi | Semua endpoint menggunakan resource noun + HTTP verb (GET/POST/PUT/PATCH/DELETE), contoh: `GET /api/journals`, `DELETE /api/journals/:id` |
| 4 | **Integrasi AI/ML sebagai fitur utama** | ✅ Terpenuhi | `src/services/ai.js` mengintegrasikan model emotion detection dari **HuggingFace Space** (`syahrulw-seribucerita-emotion`) — mendeteksi emosi dan menghasilkan respons AI pada fitur chatbot |
| 5 | **Fitur utama berjalan tanpa crash** | ✅ Terpenuhi | Error handler global (`errorHandler.js`), validasi input (`express-validator`), fallback multi-endpoint Overpass API, timeout guard dengan `AbortSignal` |

### ✅ Side Quest

| No | Kriteria | Status | Keterangan |
|----|----------|--------|------------|
| 6 | **RESTful API menyimpan data ke database** | ✅ Terpenuhi | PostgreSQL dengan skema lengkap (`schema.sql`): tabel `users`, `journals`, `highlights`, `articles`, `chat_conversations`, `chat_messages`, `superadmins` |
| 7 | **Dibangun dengan Express** | ✅ Terpenuhi | `"express": "^4.21.2"` — framework utama backend |
| 8 | **Deployment ke server** | ✅ Terpenuhi | Di-deploy ke **Railway** menggunakan **Dockerfile** dengan konfigurasi `railway.json` |

---

## 🧰 Tech Stack

| Kategori | Teknologi | Versi |
|----------|-----------|-------|
| Runtime | Node.js | >= 18 |
| Framework | **Express.js** | ^4.21.2 |
| Database | **PostgreSQL** | (Railway managed) |
| DB Client | pg (node-postgres) | ^8.13.3 |
| Auth | jsonwebtoken + bcryptjs | ^9.0.2 / ^2.4.3 |
| Validasi | express-validator | ^7.2.1 |
| CORS | cors | ^2.8.5 |
| Config | dotenv | ^16.5.0 |
| AI/ML | HuggingFace Space (fetch) | — |
| Deployment | **Railway** (Docker) | — |

---

## 🗂️ Struktur Proyek

```
seribu_backends_fixed/
├── src/
│   ├── db/
│   │   └── pool.js              # PostgreSQL connection pool (pg)
│   ├── middleware/
│   │   ├── auth.js              # requireAuth, optionalAuth, requireSuperAdmin (JWT verify)
│   │   └── errorHandler.js      # Global error handler Express
│   ├── routes/
│   │   ├── auth.js              # POST /api/auth/register, login; GET /api/auth/me
│   │   ├── profile.js           # GET/PUT /api/profile
│   │   ├── journal.js           # CRUD /api/journals, /api/journals/:id
│   │   ├── highlights.js        # CRUD /api/highlights, /api/highlights/:id
│   │   ├── articles.js          # GET/POST/PATCH/DELETE /api/articles
│   │   ├── chat.js              # CRUD /api/chat/history (percakapan & pesan)
│   │   ├── faskes.js            # GET /api/faskes/search (Overpass API proxy)
│   │   └── superadmin.js        # POST /api/superadmin/login; GET /api/superadmin/me
│   ├── services/
│   │   └── ai.js                # Integrasi HuggingFace Space (emotion detection + AI chat)
│   └── index.js                 # Entry point: Express app, CORS, routing, auto-migrate
├── schema.sql                   # Definisi lengkap skema PostgreSQL
├── Dockerfile                   # Container image untuk Railway
├── railway.json                 # Konfigurasi deploy Railway
├── .env.example
└── package.json
```

---

## 📡 Daftar Endpoint API (RESTful)

### Auth — `/api/auth`
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/auth/register` | ❌ | Daftar akun baru |
| POST | `/api/auth/login` | ❌ | Login, mendapat JWT token |
| GET | `/api/auth/me` | ✅ JWT | Cek user yang sedang login |

### Profile — `/api/profile`
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/profile` | ✅ JWT | Ambil data profil user |
| PUT | `/api/profile` | ✅ JWT | Update profil (nama, bio, avatar) |

### Jurnal — `/api/journals`
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/journals` | ✅ JWT | Ambil semua jurnal milik user |
| GET | `/api/journals/:id` | ✅ JWT | Ambil satu jurnal |
| POST | `/api/journals` | ✅ JWT | Buat jurnal baru |
| PUT | `/api/journals/:id` | ✅ JWT | Update jurnal |
| DELETE | `/api/journals/:id` | ✅ JWT | Hapus jurnal |

### Highlights — `/api/highlights`
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/highlights` | ✅ JWT | Ambil semua highlight |
| POST | `/api/highlights` | ✅ JWT | Simpan highlight baru |
| DELETE | `/api/highlights/:id` | ✅ JWT | Hapus highlight |

### Artikel — `/api/articles`
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/articles` | Optional | List artikel (guest: maks 10) |
| GET | `/api/articles/categories` | ❌ | List kategori artikel |
| GET | `/api/articles/:id` | ❌ | Detail artikel |
| POST | `/api/articles` | ✅ SuperAdmin | Buat artikel |
| PATCH | `/api/articles/:id` | ✅ SuperAdmin | Update artikel |
| DELETE | `/api/articles/:id` | ✅ SuperAdmin | Hapus artikel |

### Chat — `/api/chat`
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/chat/history` | ❌* | List percakapan user |
| POST | `/api/chat/history` | ❌* | Buat percakapan baru |
| GET | `/api/chat/history/:convoId` | ❌* | Detail percakapan + pesan |
| POST | `/api/chat/history/:convoId/messages` | ❌* | Simpan pesan |
| PATCH | `/api/chat/history/:convoId` | ❌* | Update judul/emosi percakapan |
| DELETE | `/api/chat/history/:convoId` | ❌* | Hapus percakapan |
| DELETE | `/api/chat/history` | ❌* | Hapus semua percakapan user |

*Identifikasi via `user_id` di query param / body

### Fasilitas Kesehatan — `/api/faskes`
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/faskes/search?lat=&lon=&radius=` | ❌ | Cari faskes terdekat (proxy Overpass API) |

### SuperAdmin — `/api/superadmin`
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/superadmin/login` | ❌ | Login superadmin |
| GET | `/api/superadmin/me` | ✅ SuperAdmin | Verifikasi token superadmin |

### Health Check
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/` | Status API |
| GET | `/api/health` | Status API + koneksi database |

---

## 🤖 Integrasi AI/ML

File `src/services/ai.js` mengintegrasikan model AI dari HuggingFace Space:

**Endpoint HuggingFace:** `https://syahrulw-seribucerita-emotion.hf.space/chat`

Cara kerja:
1. Frontend mengirim pesan user ke HuggingFace Space langsung (untuk mode realtime chatbot)
2. Backend juga dapat memanggil HuggingFace melalui `getAIResponse()` untuk keperluan server-side
3. Model mengembalikan `emotion.label` (happy/sad/anxious/angry/neutral/fear) dan `ai_response`
4. Emosi disimpan bersama percakapan di database

```js
// src/services/ai.js
const { emotion, aiReply } = await getAIResponse(userMessage, chatHistory);
```

---

## 🗄️ Skema Database (PostgreSQL)

```sql
users              → id, name, email, password (bcrypt), bio, avatar_id, avatar_config (JSONB)
journals           → id, user_id (FK), mood, title, content, date
highlights         → id, user_id (FK), text, color, article_id, chat_id
articles           → id, title, excerpt, category, content (JSONB), author, image
chat_conversations → id (UUID), user_id, title, emotion, message_count
chat_messages      → id, conversation_id (FK), role (user/bot), text, emotion
superadmins        → id, username, password_hash, last_login
```

Auto-migrate berjalan saat server start: jika tabel `superadmins` belum ada, `schema.sql` dieksekusi otomatis.

---

## ⚙️ Setup Lokal

### Prasyarat
- Node.js >= 18
- PostgreSQL (lokal atau Railway)

### Langkah Instalasi

```bash
# 1. Ekstrak / clone proyek
cd seribu_backends_fixed

# 2. Install dependencies
npm install

# 3. Buat file environment
cp .env.example .env
# Edit .env:
#   DATABASE_URL=postgresql://user:pass@localhost:5432/seribucerita
#   JWT_SECRET=string_random_minimal_32_karakter
#   FRONTEND_URL=http://localhost:5173
#   NODE_ENV=development

# 4. Jalankan database migration (otomatis saat server start)
npm run dev
# → http://localhost:3000
```

### Menjalankan Manual Migration

```bash
psql $DATABASE_URL -f schema.sql
```

---

## 🌐 Environment Variables

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key untuk JWT (min. 32 karakter) | `random_hex_string` |
| `FRONTEND_URL` | URL frontend untuk whitelist CORS | `https://seribu-frontend.vercel.app` |
| `NODE_ENV` | Environment (`development` / `production`) | `production` |
| `PORT` | Port server (default: 3000) | `3000` |

---

## 🚀 Deployment (Railway)

Proyek ini di-deploy ke **Railway** menggunakan Docker.

**`railway.json`:**
```json
{
  "build": { "builder": "DOCKERFILE", "dockerfilePath": "Dockerfile" },
  "deploy": {
    "startCommand": "node src/index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

**Langkah deploy:**
1. Push ke GitHub
2. Buat project baru di [railway.app](https://railway.app)
3. Add service → deploy dari GitHub repo
4. Add PostgreSQL plugin di Railway
5. Set environment variables di dashboard Railway
6. Railway otomatis build Docker image dan deploy

---

## 🔒 Keamanan

- Password di-hash dengan **bcryptjs** (cost factor 12)
- Autentikasi menggunakan **JWT** dengan expiry 30 hari
- CORS whitelist hanya mengizinkan origin dari `FRONTEND_URL` di production
- Input divalidasi dengan **express-validator** sebelum menyentuh database
- Query menggunakan **parameterized queries** (mencegah SQL injection)

---

## 👥 Tim

Proyek **SeribuCerita** — CC26-PSU212

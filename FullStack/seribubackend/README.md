# SeribuCerita Backend

Node.js + Express + PostgreSQL API

## Setup Lokal

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Buat file `.env`** (copy dari `.env.example`)
   ```bash
   cp .env.example .env
   ```
   Isi semua variabel:
   - `DATABASE_URL` — PostgreSQL connection string
   - `JWT_SECRET` — bisa generate dengan `openssl rand -hex 32`
   - `FRONTEND_URL` — URL frontend (pisah koma jika lebih dari satu)

3. **Jalankan development**
   ```bash
   npm run dev
   ```
   Server berjalan di `http://localhost:3000`

## Deploy ke Railway

1. Push ke GitHub
2. Connect repo di Railway
3. Tambahkan PostgreSQL plugin (Railway akan otomatis set `DATABASE_URL`)
4. Set environment variables di Railway:
   - `JWT_SECRET`
   - `FRONTEND_URL` (URL Vercel kamu)
   - `NODE_ENV=production`
5. Railway akan otomatis build & deploy

## Endpoints

- `GET /` — health check
- `GET /api/health` — DB connection check
- `POST /api/auth/register` — daftar user
- `POST /api/auth/login` — login user
- `GET /api/auth/me` — get user aktif (auth)
- `GET/PUT /api/profile` — profil user (auth)
- `GET/POST/PUT/DELETE /api/journals` — jurnal (auth)
- `GET/POST/DELETE /api/highlights` — highlights (auth)
- `GET /api/faskes/search` — cari faskes
- `GET /api/articles` — daftar artikel
- `GET /api/chat/history` — riwayat chat
- `POST/GET /api/superadmin/...` — admin panel

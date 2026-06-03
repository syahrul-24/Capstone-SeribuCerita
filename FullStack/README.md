# SeribuCerita — Setup Guide

## Backend

### Prasyarat
- Node.js >= 18
- PostgreSQL (lokal atau Railway)

### Instalasi

```bash
cd seribu_backends_fixed
npm install
```

### Environment

```bash
cp .env.example .env
```

Isi file `.env`:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/seribucerita
JWT_SECRET=string_random_minimal_32_karakter
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Menjalankan

```bash
npm run dev
# → http://localhost:3000
```

> Migrasi database berjalan otomatis saat server pertama kali dijalankan.

---

## Frontend

### Prasyarat
- Node.js >= 18

### Instalasi

```bash
cd seribu_fixed
npm install
```

### Environment

```bash
cp .env.example .env
```

Isi file `.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_HF_URL=https://syahrulw-seribucerita-emotion.hf.space
```

### Menjalankan

```bash
npm run dev
# → http://localhost:5173

# Build production
npm run build
```

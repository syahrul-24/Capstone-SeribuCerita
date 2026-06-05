# Setup Backend Lokal — Step by Step

## 1. Install PostgreSQL
Download dari https://www.postgresql.org/download/windows/

Saat install, catat:
- Port: 5432 (default)
- Password untuk user `postgres`: bebas, contoh `postgres123`

## 2. Buat database
Buka pgAdmin atau psql, jalankan:
```sql
CREATE DATABASE seribucerita;
```

## 3. Buat file `.env`
```
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/seribucerita
JWT_SECRET=contoh_secret_yang_panjang_minimal_32_karakter_abcdef1234567890
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
SEED_SECRET=rahasia123
```
> Ganti `postgres123` dengan password PostgreSQL kamu

## 4. Install & jalankan
```bash
npm install
npm run dev
```

## 5. Cek koneksi
Buka browser: http://localhost:3000/api/health
Harus muncul: `{"status":"ok","db":"connected"}`

## 6. Setup superadmin (sekali saja)
```bash
curl -X POST http://localhost:3000/api/superadmin/seed \
  -H "Content-Type: application/json" \
  -d '{"seedSecret":"rahasia123","username":"superadmin","password":"Admin@1234"}'
```

## Troubleshooting

### "The server does not support SSL connections"
Tambahkan ke `.env`:
```
DATABASE_SSL=false
```

### "ECONNREFUSED 127.0.0.1:5432"
PostgreSQL tidak berjalan. Buka Services (Windows) dan start PostgreSQL.

### "database seribucerita does not exist"
Buat database-nya dulu di pgAdmin atau psql.

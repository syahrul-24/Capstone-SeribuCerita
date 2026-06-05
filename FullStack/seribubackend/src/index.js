import "dotenv/config";
import express from "express";
import cors from "cors";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import articlesRouter   from "./routes/articles.js";
import chatRouter       from "./routes/chat.js";
import superadminRouter from "./routes/superadmin.js";
import authRouter       from "./routes/auth.js";
import profileRouter    from "./routes/profile.js";
import journalRouter    from "./routes/journal.js";
import highlightsRouter from "./routes/highlights.js";
import faskesRouter     from "./routes/faskes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import pool             from "./db/pool.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((s) => s.trim())
  : [];

const devOrigins = ["http://localhost:5173", "http://localhost:4173", "http://localhost:3000"];

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);

    const all = [...allowedOrigins, ...devOrigins];
    if (all.includes(origin)) return cb(null, true);

    if (process.env.NODE_ENV !== "production") return cb(null, true);

    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods:      ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials:  true,
}));

app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  res.json({
    message: "SeribuCerita API is running 🚀",
    env: process.env.NODE_ENV || "development",
    ts:  new Date().toISOString(),
  });
});

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected", ts: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: "error", db: "disconnected", error: err.message });
  }
});

app.use("/api/auth",       authRouter);
app.use("/api/profile",    profileRouter);
app.use("/api/journals",   journalRouter);
app.use("/api/highlights", highlightsRouter);
app.use("/api/faskes",     faskesRouter);
app.use("/api/articles",   articlesRouter);
app.use("/api/chat",       chatRouter);
app.use("/api/superadmin", superadminRouter);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan" });
});

app.use(errorHandler);

async function migrate() {
  try {
    await pool.query("SELECT 1");

    const result = await pool.query(
      "SELECT to_regclass('public.superadmins') AS tbl"
    );

    if (!result.rows[0].tbl) {
      console.log("🗄️  Running schema migration...");
      const schemaPath = join(__dirname, "../schema.sql");
      const sql = await readFile(schemaPath, "utf8");

      await pool.query(sql);
      console.log("✅ Schema migration complete");
    } else {
      console.log("✅ Schema already up-to-date, skipping migration");
    }
  } catch (err) {
    console.error("❌ Migration error:", err.message);
    console.error("   → Pastikan DATABASE_URL sudah benar di file .env");
    console.error("   → Jika sudah, schema.sql bisa dijalankan manual di psql");
  }
}

app.listen(PORT, async () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`   NODE_ENV  : ${process.env.NODE_ENV || "development"}`);
  console.log(`   DB URL    : ${process.env.DATABASE_URL ? "✅ set" : "❌ NOT SET — isi di .env!"}`);
  console.log(`   JWT_SECRET: ${process.env.JWT_SECRET  ? "✅ set" : "❌ NOT SET — isi di .env!"}`);
  await migrate();
});

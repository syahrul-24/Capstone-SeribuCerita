import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db/pool.js";
import { requireSuperAdmin } from "../middleware/auth.js";

const router = Router();

// ── POST /api/superadmin/login ────────────────────────────────────────────────
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      const err = new Error("Username dan password wajib diisi");
      err.status = 400; throw err;
    }

    const result = await pool.query(
      "SELECT * FROM superadmins WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      const err = new Error("Username atau password salah");
      err.status = 401; throw err;
    }

    const superadmin = result.rows[0];
    const valid = await bcrypt.compare(password, superadmin.password_hash);
    if (!valid) {
      const err = new Error("Username atau password salah");
      err.status = 401; throw err;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET env var tidak di-set");
    }

    const token = jwt.sign(
      { id: superadmin.id, username: superadmin.username, role: "superadmin" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    await pool.query(
      "UPDATE superadmins SET last_login = NOW() WHERE id = $1",
      [superadmin.id]
    );

    res.json({
      success: true,
      token,
      superadmin: { id: superadmin.id, username: superadmin.username },
    });
  } catch (err) { next(err); }
});

// ── GET /api/superadmin/me ────────────────────────────────────────────────────
router.get("/me", requireSuperAdmin, (req, res) => {
  res.json({ success: true, superadmin: req.superadmin });
});

// ── POST /api/superadmin/seed ─────────────────────────────────────────────────
// Hanya tersedia saat SEED_SECRET env diset. Dipakai saat pertama deploy
// untuk membuat akun superadmin jika schema.sql belum di-run manual.
// Contoh: POST /api/superadmin/seed { "seedSecret": "xxx", "username": "superadmin", "password": "Admin@1234" }
router.post("/seed", async (req, res, next) => {
  try {
    const { seedSecret, username, password } = req.body;

    if (!process.env.SEED_SECRET) {
      return res.status(404).json({ success: false, message: "Endpoint tidak tersedia" });
    }
    if (seedSecret !== process.env.SEED_SECRET) {
      return res.status(403).json({ success: false, message: "Seed secret salah" });
    }
    if (!username || !password || password.length < 8) {
      return res.status(400).json({ success: false, message: "Username & password (min 8 char) wajib diisi" });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO superadmins (username, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (username) DO UPDATE SET password_hash = $2
       RETURNING id, username, created_at`,
      [username, hash]
    );

    res.json({ success: true, superadmin: result.rows[0] });
  } catch (err) { next(err); }
});

export default router;

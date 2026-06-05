import { Router } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Nama wajib diisi"),
    body("email").isEmail().normalizeEmail().withMessage("Format email tidak valid"),
    body("password").isLength({ min: 6 }).withMessage("Password minimal 6 karakter"),
    body("avatar_config").optional().isString(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email, password, avatar_config = null } = req.body;

    try {
      const exists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
      if (exists.rows[0]) {
        return res.status(409).json({ error: "Email sudah digunakan. Silakan login atau gunakan email lain." });
      }

      const hashed = await bcrypt.hash(password, 12);

      const result = await pool.query(
        `INSERT INTO users (name, email, password, avatar_config)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, bio, avatar_id, avatar_config, created_at`,
        [name, email, hashed, avatar_config]
      );

      const user  = result.rows[0];
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "30d" });

      res.status(201).json({ token, user });
    } catch (err) { next(err); }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Format email tidak valid"),
    body("password").notEmpty().withMessage("Password wajib diisi"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    try {
      const result = await pool.query(
        "SELECT id, name, email, password, bio, avatar_id, avatar_config, created_at FROM users WHERE email = $1",
        [email]
      );

      if (!result.rows[0]) {
        return res.status(401).json({ error: "Email atau kata sandi salah." });
      }

      const user  = result.rows[0];
      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(401).json({ error: "Email atau kata sandi salah." });
      }

      const { password: _, ...safeUser } = user;
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "30d" });

      res.json({ token, user: safeUser });
    } catch (err) { next(err); }
  }
);

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;

import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// GET /api/highlights
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, chat_id, article_id, article_title, text, color, created_at
       FROM highlights WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ highlights: result.rows });
  } catch (err) { next(err); }
});

// POST /api/highlights
router.post(
  "/",
  [
    body("text").trim().notEmpty().withMessage("Text tidak boleh kosong"),
    body("color").optional().matches(/^#[0-9A-Fa-f]{3,8}$/).withMessage("Format warna tidak valid"),
    body("article_id").optional({ nullable: true }).isString(),
    body("article_title").optional({ nullable: true }).isString().trim(),
    // chat_id bisa string (UUID) atau angka — terima keduanya
    body("chat_id").optional({ nullable: true }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    const { chat_id, article_id, article_title, text, color } = req.body;
    try {
      const ins = await pool.query(
        `INSERT INTO highlights (user_id, chat_id, article_id, article_title, text, color)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          req.user.id,
          chat_id    ? String(chat_id)    : null,
          article_id ? String(article_id) : null,
          article_title || null,
          text,
          color || "#A78BFA",
        ]
      );
      res.status(201).json({ highlight: ins.rows[0] });
    } catch (err) { next(err); }
  }
);

// DELETE /api/highlights/:id
router.delete(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("ID highlight tidak valid")],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    try {
      const result = await pool.query(
        "DELETE FROM highlights WHERE id = $1 AND user_id = $2 RETURNING id",
        [req.params.id, req.user.id]
      );
      if (!result.rows[0]) return res.status(404).json({ error: "Highlight tidak ditemukan" });
      res.json({ message: "Highlight dihapus" });
    } catch (err) { next(err); }
  }
);

export default router;

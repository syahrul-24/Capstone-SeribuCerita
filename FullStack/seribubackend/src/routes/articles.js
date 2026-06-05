import { Router } from "express";
import pool from "../db/pool.js";
import { requireSuperAdmin, optionalAuth } from "../middleware/auth.js";

const GUEST_ARTICLE_LIMIT = 10; // maks artikel untuk user yang belum login

const router = Router();

// ── GET /api/articles/categories  ← HARUS sebelum /:id ─────────────────────
router.get("/categories", async (req, res, next) => {
  try {
    // Ambil 1 baris per category (deduplicate), pakai MIN untuk ambil tag representatif
    const result = await pool.query(`
      SELECT DISTINCT ON (category)
        category,
        tag,
        tag_bg,
        tag_color,
        emoji
      FROM articles
      ORDER BY category, id ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
});

// ── GET /api/articles ────────────────────────────────────────────────────────
router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const isGuest = !req.user;

    const { category, search, limit = 10, page = 1 } = req.query;
    const pageNum  = Math.max(1, parseInt(page)  || 1);

    // Guest: paksa limit & page agar total artikel yang bisa diakses ≤ 10
    let limitNum = Math.max(1, Math.min(50, parseInt(limit) || 10));
    let effectivePage = pageNum;
    if (isGuest) {
      limitNum = Math.min(limitNum, GUEST_ARTICLE_LIMIT);
      // Jangan izinkan page > 1 jika sudah melampaui batas
      const maxOffset = GUEST_ARTICLE_LIMIT - limitNum;
      const reqOffset = (pageNum - 1) * limitNum;
      if (reqOffset >= GUEST_ARTICLE_LIMIT) {
        // Kembalikan respons kosong tapi informatif
        return res.json({
          success: true,
          data: [],
          meta: { total: GUEST_ARTICLE_LIMIT, page: pageNum, limit: limitNum, totalPages: Math.ceil(GUEST_ARTICLE_LIMIT / limitNum), guestLimitReached: true },
          guestLimit: GUEST_ARTICLE_LIMIT,
        });
      }
      // Pastikan offset + limit tidak melampaui batas guest
      if (reqOffset + limitNum > GUEST_ARTICLE_LIMIT) {
        limitNum = GUEST_ARTICLE_LIMIT - reqOffset;
      }
    }

    const offset = (effectivePage - 1) * limitNum;

    const conditions = [];
    const values     = [];
    let idx = 1;

    if (category && category !== "semua") {
      conditions.push(`category = $${idx++}`);
      values.push(category);
    }
    if (search && search.trim()) {
      conditions.push(`(title ILIKE $${idx} OR excerpt ILIKE $${idx})`);
      values.push(`%${search.trim()}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM articles ${where}`,
      values
    );
    const realTotal = parseInt(countRes.rows[0].count);

    // Untuk guest, total yang ditampilkan dibatasi
    const total = isGuest ? Math.min(realTotal, GUEST_ARTICLE_LIMIT) : realTotal;

    const dataRes = await pool.query(
      `SELECT id, title, excerpt, category, tag, tag_bg, tag_color,
              emoji, read_time, date, author, author_role, image
       FROM articles ${where}
       ORDER BY id DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, limitNum, offset]
    );

    res.json({
      success: true,
      data: dataRes.rows,
      meta: {
        total,
        page:       effectivePage,
        limit:      limitNum,
        totalPages: Math.ceil(total / limitNum),
        ...(isGuest && { guestLimitReached: realTotal > GUEST_ARTICLE_LIMIT }),
      },
      ...(isGuest && { guestLimit: GUEST_ARTICLE_LIMIT }),
    });
  } catch (err) { next(err); }
});

// ── GET /api/articles/:id ────────────────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID artikel tidak valid" });
    }
    const result = await pool.query("SELECT * FROM articles WHERE id = $1", [id]);
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: "Artikel tidak ditemukan" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

// ── POST /api/articles (superadmin) ─────────────────────────────────────────
router.post("/", requireSuperAdmin, async (req, res, next) => {
  try {
    const {
      title, excerpt, category, tag, tag_bg, tag_color,
      emoji, read_time, date, author, author_role,
      image, hero_image, content,
    } = req.body;
    if (!title || !category) {
      return res.status(400).json({ success: false, message: "title dan category wajib diisi" });
    }
    const result = await pool.query(
      `INSERT INTO articles
         (title, excerpt, category, tag, tag_bg, tag_color, emoji,
          read_time, date, author, author_role, image, hero_image, content)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        title, excerpt ?? null, category,
        tag ?? null, tag_bg ?? null, tag_color ?? null, emoji ?? null,
        read_time ?? null, date ?? null, author ?? null, author_role ?? null,
        image ?? null, hero_image ?? null,
        content ? JSON.stringify(content) : null,
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

// ── PATCH /api/articles/:id (superadmin) ────────────────────────────────────
router.patch("/:id", requireSuperAdmin, async (req, res, next) => {
  try {
    const allowed = [
      "title","excerpt","category","tag","tag_bg","tag_color",
      "emoji","read_time","date","author","author_role",
      "image","hero_image","content",
    ];
    const fields = [], values = [];
    let idx = 1;
    for (const k of allowed) {
      if (req.body[k] !== undefined) {
        fields.push(`${k} = $${idx++}`);
        values.push(k === "content" ? JSON.stringify(req.body[k]) : req.body[k]);
      }
    }
    if (!fields.length) {
      return res.status(400).json({ success: false, message: "Tidak ada field yang diupdate" });
    }
    values.push(parseInt(req.params.id));
    const result = await pool.query(
      `UPDATE articles SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: "Artikel tidak ditemukan" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

// ── DELETE /api/articles/:id (superadmin) ───────────────────────────────────
router.delete("/:id", requireSuperAdmin, async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM articles WHERE id = $1 RETURNING id",
      [parseInt(req.params.id)]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: "Artikel tidak ditemukan" });
    }
    res.json({ success: true, message: "Artikel dihapus" });
  } catch (err) { next(err); }
});

export default router;

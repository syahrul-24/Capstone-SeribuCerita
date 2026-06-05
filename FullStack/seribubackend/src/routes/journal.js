import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const VALID_MOODS = ["happy", "sad", "anxious", "angry", "neutral", "fear", "anger"];

// GET /api/journals
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, user_id, mood, title, content, date, created_at FROM journals WHERE user_id = $1 ORDER BY date DESC, created_at DESC",
      [req.user.id]
    );
    return res.status(200).json({ journals: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/journals/:id
router.get("/:id", [param("id").isInt({ min: 1 })], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  try {
    const result = await pool.query(
      "SELECT id, user_id, mood, title, content, date, created_at FROM journals WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Journal entry not found" });
    return res.status(200).json({ journal: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/journals
router.post(
  "/",
  [
    body("mood").notEmpty().withMessage("Mood is required").isIn(VALID_MOODS).withMessage(`Mood must be one of: ${VALID_MOODS.join(", ")}`),
    body("title").optional().trim(),
    body("content").trim().notEmpty().withMessage("Content is required"),
    body("date").optional().isISO8601().withMessage("Date must be a valid ISO 8601 date"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { mood, title, content, date } = req.body;
    const userId = req.user.id;

    try {
      const insertResult = date
        ? await pool.query(
            "INSERT INTO journals (user_id, mood, title, content, date) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            [userId, mood, title || "", content, date]
          )
        : await pool.query(
            "INSERT INTO journals (user_id, mood, title, content) VALUES ($1, $2, $3, $4) RETURNING id",
            [userId, mood, title || "", content]
          );

      const newId = insertResult.rows[0].id;
      const result = await pool.query(
        "SELECT id, user_id, mood, title, content, date, created_at FROM journals WHERE id = $1",
        [newId]
      );
      return res.status(201).json({ journal: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/journals/:id
router.put(
  "/:id",
  [
    param("id").isInt({ min: 1 }).withMessage("Invalid journal ID"),
    body("mood").optional().isIn(VALID_MOODS),
    body("title").optional().trim(),
    body("content").optional().trim().notEmpty().withMessage("Content cannot be empty"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const journalId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const { mood, title, content } = req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (mood !== undefined) { fields.push(`mood = $${idx++}`); values.push(mood); }
    if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
    if (content !== undefined) { fields.push(`content = $${idx++}`); values.push(content); }

    if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });

    values.push(journalId, userId);

    try {
      const result = await pool.query(
        `UPDATE journals SET ${fields.join(", ")} WHERE id = $${idx++} AND user_id = $${idx} RETURNING id, user_id, mood, title, content, date, created_at`,
        values
      );
      if (!result.rows[0]) return res.status(404).json({ error: "Journal entry not found" });
      return res.status(200).json({ journal: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/journals/:id
router.delete("/:id", [param("id").isInt({ min: 1 })], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  try {
    const result = await pool.query(
      "DELETE FROM journals WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Journal entry not found" });
    return res.status(200).json({ message: "Journal deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;

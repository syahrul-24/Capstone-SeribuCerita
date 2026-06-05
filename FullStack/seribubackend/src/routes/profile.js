import { Router } from "express";
import { body, validationResult } from "express-validator";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, bio, avatar_id, avatar_config, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    return res.status(200).json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put(
  "/",
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("bio").optional().isString(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const userId = req.user.id;
    const { name, bio, avatar_config } = req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (bio !== undefined) { fields.push(`bio = $${idx++}`); values.push(bio); }
    if (avatar_config !== undefined) {
      fields.push(`avatar_config = $${idx++}`);
      values.push(typeof avatar_config === "string" ? avatar_config : JSON.stringify(avatar_config));
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    values.push(userId);

    try {
      await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = $${idx}`, values);
      const result = await pool.query(
        "SELECT id, name, email, bio, avatar_id, avatar_config, created_at FROM users WHERE id = $1",
        [userId]
      );
      return res.status(200).json({ user: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/avatar",
  [
    body("avatarId")
      .notEmpty().withMessage("avatarId is required")
      .isInt({ min: 1, max: 5 }).withMessage("avatarId must be between 1 and 5"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    try {
      await pool.query("UPDATE users SET avatar_id = $1 WHERE id = $2", [
        req.body.avatarId,
        req.user.id,
      ]);
      const result = await pool.query(
        "SELECT id, name, email, bio, avatar_id, avatar_config, created_at FROM users WHERE id = $1",
        [req.user.id]
      );
      return res.status(200).json({ user: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

export default router;

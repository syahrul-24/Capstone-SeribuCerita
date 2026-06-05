import { Router } from "express";
import pool from "../db/pool.js";

const router = Router();

router.get("/history", async (req, res, next) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ success: false, message: "user_id wajib diisi" });
    }
    const result = await pool.query(
      `SELECT id, title, emotion, created_at, updated_at, message_count
       FROM chat_conversations WHERE user_id = $1 ORDER BY updated_at DESC`,
      [String(user_id)]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
});

router.get("/history/:convoId", async (req, res, next) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ success: false, message: "user_id wajib diisi" });
    }
    const convo = await pool.query(
      "SELECT * FROM chat_conversations WHERE id = $1 AND user_id = $2",
      [req.params.convoId, String(user_id)]
    );
    if (convo.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Percakapan tidak ditemukan" });
    }
    const msgs = await pool.query(
      "SELECT * FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC",
      [req.params.convoId]
    );
    res.json({ success: true, data: { ...convo.rows[0], messages: msgs.rows } });
  } catch (err) { next(err); }
});

router.post("/history", async (req, res, next) => {
  try {
    const { user_id, title = "Percakapan Baru" } = req.body;
    if (!user_id) {
      return res.status(400).json({ success: false, message: "user_id wajib diisi" });
    }
    const result = await pool.query(
      `INSERT INTO chat_conversations (user_id, title, emotion, message_count)
       VALUES ($1, $2, 'neutral', 0) RETURNING *`,
      [String(user_id), title]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

router.post("/history/:convoId/messages", async (req, res, next) => {
  try {
    const { user_id, role, text, emotion } = req.body;

    if (!user_id || !role || !text) {
      return res.status(400).json({ success: false, message: "user_id, role, text wajib diisi" });
    }
    if (!["user", "bot"].includes(role)) {
      return res.status(400).json({ success: false, message: "role harus 'user' atau 'bot'" });
    }

    const convo = await pool.query(
      "SELECT * FROM chat_conversations WHERE id = $1 AND user_id = $2",
      [req.params.convoId, String(user_id)]
    );
    if (convo.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Percakapan tidak ditemukan" });
    }
    const c = convo.rows[0];

    const msg = await pool.query(
      "INSERT INTO chat_messages (conversation_id, role, text, emotion) VALUES ($1,$2,$3,$4) RETURNING *",
      [req.params.convoId, role, text, emotion || null]
    );

    const setClauses = ["message_count = message_count + 1", "updated_at = NOW()"];
    const vals       = [];
    let   idx        = 1;

    if (emotion) {
      setClauses.push(`emotion = $${idx++}`);
      vals.push(emotion);
    }
    if (c.message_count === 0 && role === "user") {
      setClauses.push(`title = $${idx++}`);
      vals.push(text.slice(0, 50) + (text.length > 50 ? "..." : ""));
    }

    vals.push(req.params.convoId); // $idx
    await pool.query(
      `UPDATE chat_conversations SET ${setClauses.join(", ")} WHERE id = $${idx}`,
      vals
    );

    res.status(201).json({ success: true, data: msg.rows[0] });
  } catch (err) { next(err); }
});

router.patch("/history/:convoId", async (req, res, next) => {
  try {
    const { user_id, title, emotion } = req.body;
    if (!user_id) {
      return res.status(400).json({ success: false, message: "user_id wajib diisi" });
    }

    const setClauses = ["updated_at = NOW()"];
    const vals       = [];
    let   idx        = 1;

    if (title)   { setClauses.push(`title = $${idx++}`);   vals.push(title); }
    if (emotion) { setClauses.push(`emotion = $${idx++}`); vals.push(emotion); }

    vals.push(req.params.convoId);
    vals.push(String(user_id));
    const convoIdx  = idx++;
    const userIdx   = idx;

    const result = await pool.query(
      `UPDATE chat_conversations
       SET ${setClauses.join(", ")}
       WHERE id = $${convoIdx} AND user_id = $${userIdx}
       RETURNING *`,
      vals
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Percakapan tidak ditemukan" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

router.delete("/history/:convoId", async (req, res, next) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ success: false, message: "user_id wajib diisi" });
    }
    await pool.query("DELETE FROM chat_messages WHERE conversation_id = $1", [req.params.convoId]);
    const result = await pool.query(
      "DELETE FROM chat_conversations WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.convoId, String(user_id)]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Percakapan tidak ditemukan" });
    }
    res.json({ success: true, message: "Percakapan dihapus" });
  } catch (err) { next(err); }
});

router.delete("/history", async (req, res, next) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ success: false, message: "user_id wajib diisi" });
    }
    const convos = await pool.query(
      "SELECT id FROM chat_conversations WHERE user_id = $1",
      [String(user_id)]
    );
    const ids = convos.rows.map((r) => r.id);
    if (ids.length > 0) {
      await pool.query("DELETE FROM chat_messages WHERE conversation_id = ANY($1)", [ids]);
      await pool.query("DELETE FROM chat_conversations WHERE user_id = $1", [String(user_id)]);
    }
    res.json({ success: true, message: `${ids.length} percakapan dihapus` });
  } catch (err) { next(err); }
});

export default router;

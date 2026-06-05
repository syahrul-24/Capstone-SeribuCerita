import jwt from "jsonwebtoken";
import pool from "../db/pool.js";

export async function requireAuth(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Token tidak ditemukan" });
  }

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      "SELECT id, name, email, bio, avatar_id, avatar_config, created_at FROM users WHERE id = $1",
      [decoded.userId]
    );
    if (!result.rows[0]) {
      return res.status(401).json({ success: false, message: "User tidak ditemukan" });
    }
    req.user = result.rows[0];
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token tidak valid atau sudah expired" });
  }
}

export async function optionalAuth(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) return next();

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [decoded.userId]
    );
    if (result.rows[0]) req.user = result.rows[0];
  } catch {
  }
  next();
}

export function requireSuperAdmin(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Token tidak ditemukan" });
  }

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Akses ditolak" });
    }
    req.superadmin = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token tidak valid atau sudah expired" });
  }
}

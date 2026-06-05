import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

const dbUrl = process.env.DATABASE_URL || "";

function resolveSSL() {
  if (process.env.DATABASE_SSL === "true")  return { rejectUnauthorized: false };
  if (process.env.DATABASE_SSL === "false") return false;

  if (!dbUrl || dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1")) {
    return false;
  }

  const cloudHosts = ["railway", "render", "neon", "supabase", "cockroachlabs", "amazonaws"];
  if (cloudHosts.some((h) => dbUrl.includes(h))) {
    return { rejectUnauthorized: false };
  }

  if (process.env.NODE_ENV === "production") {
    return { rejectUnauthorized: false };
  }

  return false;
}

const sslConfig = resolveSSL();
console.log(`🔐 DB SSL: ${sslConfig ? "enabled" : "disabled"}`);

const pool = new Pool({
  connectionString: dbUrl,
  ssl: sslConfig,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10,
});

pool.on("connect",  () => console.log("✅ PostgreSQL connected"));
pool.on("error",    (err) => console.error("❌ PostgreSQL pool error:", err.message));

export default pool;

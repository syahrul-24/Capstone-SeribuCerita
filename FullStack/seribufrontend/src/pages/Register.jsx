import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const C = "#739caf";

export default function Register() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg,#FFF8F0 0%,#E8F0F5 100%)", padding: "80px 16px 40px" }}>
      <div style={{ width: "100%", maxWidth: 400, background: "white", borderRadius: 28,
        padding: "40px 36px", boxShadow: "0 20px 60px rgba(26,26,46,0.10)", border: "2px solid rgba(115,156,175,0.10)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg,${C},#4a7c8f)`,
            display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 18, margin: "0 auto 16px" }}>SC</div>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 700, color: "#1A1A2E", marginBottom: 6 }}>Buat akun baru</h1>
          <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 14, color: "#7B7B9A", fontWeight: 500 }}>Gratis, aman, dan tanpa judgement 💙</p>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.2)", borderRadius: 12,
            padding: "10px 14px", marginBottom: 20, fontFamily: "'Nunito',sans-serif", fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Nama", type: "text", value: name, set: setName, placeholder: "Nama panggilanmu" },
            { label: "Email", type: "email", value: email, set: setEmail, placeholder: "kamu@email.com" },
            { label: "Kata Sandi", type: "password", value: password, set: setPassword, placeholder: "Min. 6 karakter" },
          ].map(({ label, type, value, set, placeholder }) => (
            <div key={label}>
              <label style={{ display: "block", fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 700, color: "#3D3D5C", marginBottom: 6 }}>{label}</label>
              <input type={type} value={value} onChange={e => set(e.target.value)} required placeholder={placeholder}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "2px solid rgba(115,156,175,0.2)",
                  fontFamily: "'Nunito',sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box", background: "rgba(255,248,240,0.5)" }} />
            </div>
          ))}
          <button type="submit" disabled={loading}
            style={{ padding: "14px", borderRadius: 999, border: "none", cursor: loading ? "not-allowed" : "pointer",
              background: `linear-gradient(135deg,${C},#4a7c8f)`, color: "white",
              fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 15,
              boxShadow: "0 8px 24px rgba(115,156,175,0.35)", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Memproses..." : "Daftar Sekarang"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontFamily: "'Nunito',sans-serif", fontSize: 13, color: "#7B7B9A" }}>
          Sudah punya akun?{" "}
          <Link to="/login" style={{ color: C, fontWeight: 700, textDecoration: "none" }}>Masuk</Link>
        </p>
      </div>
    </div>
  );
}

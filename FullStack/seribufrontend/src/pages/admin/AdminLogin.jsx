import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { superadminLogin, superadminVerify } from "../../lib/api";
import logo from "../../assets/logo.png";

const C = "#739caf";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("sc_sa_token");
    if (token) {
      superadminVerify(token).then((ok) => {
        if (ok) navigate("/superadmin/dashboard", { replace: true });
        else { sessionStorage.removeItem("sc_sa_token"); setChecking(false); }
      });
    } else {
      setChecking(false);
    }
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { token } = await superadminLogin(username, password);
      sessionStorage.setItem("sc_sa_token", token);
      navigate("/superadmin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (checking) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0f172a" }}>
      <div style={{ width:36, height:36, border:`3px solid ${C}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)", padding:24 }}>

      {/* Decorative blobs */}
      <div style={{ position:"fixed", top:"10%", left:"5%", width:300, height:300, borderRadius:"50%",
        background:`radial-gradient(circle,${C}15,transparent 70%)`, pointerEvents:"none" }}/>
      <div style={{ position:"fixed", bottom:"10%", right:"5%", width:400, height:400, borderRadius:"50%",
        background:"radial-gradient(circle,#6366f115,transparent 70%)", pointerEvents:"none" }}/>

      <div style={{ width:"100%", maxWidth:420, background:"rgba(30, 43, 59, 0.9)", backdropFilter:"blur(20px)",
        borderRadius:28, border:"1px solid rgba(115,156,175,0.15)", boxShadow:"0 32px 80px rgba(0,0,0,0.50)",
        padding:"40px 36px", position:"relative", zIndex:1 }}>

        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ margin:"0 auto 16px", width:64, height:64, position:"relative" }}>
            <img src={logo} alt="SeribuCerita"
              style={{ width:64, height:64, borderRadius:20, objectFit:"cover",
                border:`2px solid ${C}50`,
                boxShadow:`0 8px 24px ${C}40` }} />
          </div>
          <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700, color:"white", margin:"0 0 4px" }}>
            Seribu<span style={{ color: C }}>Cerita</span>
          </h1>
          <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:"rgba(255,255,255,0.35)", margin:"0 0 4px", letterSpacing:"0.5px", textTransform:"uppercase", fontWeight:700 }}>
            Superadmin Login
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700,
              color:"rgba(255,255,255,0.70)", marginBottom:8 }}>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username" required
              style={{ width:"100%", padding:"14px 16px", borderRadius:14, boxSizing:"border-box",
                background:"rgba(255,255,255,0.06)", border:"1.5px solid rgba(255,255,255,0.10)",
                color:"white", fontSize:15, fontFamily:"'Nunito',sans-serif", outline:"none" }}
              onFocus={(e) => e.target.style.borderColor = C}
              onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.10)"} />
          </div>

          {/* Password */}
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700,
              color:"rgba(255,255,255,0.70)", marginBottom:8 }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password" required
              style={{ width:"100%", padding:"14px 16px", borderRadius:14, boxSizing:"border-box",
                background:"rgba(255,255,255,0.06)",
                border:`1.5px solid ${error ? "#ef4444" : "rgba(255,255,255,0.10)"}`,
                color:"white", fontSize:15, fontFamily:"'Nunito',sans-serif", outline:"none" }}
              onFocus={(e) => e.target.style.borderColor = C}
              onBlur={(e)  => e.target.style.borderColor = error ? "#ef4444" : "rgba(255,255,255,0.10)"} />
            {error && (
              <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:"#ef4444", margin:"8px 0 0" }}>
                ⚠️ {error}
              </p>
            )}
          </div>

          <button type="submit" disabled={loading || !username || !password}
            style={{ width:"100%", padding:14, borderRadius:14, border:"none",
              cursor: loading ? "not-allowed" : "pointer",
              background: loading ? "rgba(115,156,175,0.40)" : `linear-gradient(135deg,${C},#4a7c8f)`,
              color:"white", fontSize:15, fontFamily:"'Nunito',sans-serif", fontWeight:800,
              boxShadow: loading ? "none" : `0 8px 24px ${C}40`, transition:"all 0.2s" }}>
            {loading ? "Memverifikasi..." : "Masuk"}
          </button>
        </form>

        <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:"rgba(255,255,255,0.25)",
          textAlign:"center", marginTop:24, marginBottom:0 }}>
          Halaman ini tidak terdaftar di navigasi publik
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
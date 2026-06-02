import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import AvatarBuilder from "../components/features/AvatarBuilder";
import CustomAvatar, { DEFAULT_CONFIG } from "../components/avatars/CustomAvatar";

const C = "#739caf";

function InputField({ label, type = "text", value, onChange, placeholder, error }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
      <label style={{ fontSize:13, fontWeight:700, color:"#1A1A2E", fontFamily:"'Nunito',sans-serif" }}>{label}</label>
      <div style={{ position:"relative" }}>
        <input
          type={isPass && show ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ width:"100%", padding:"12px 16px", borderRadius:14,
            border:`2px solid ${error ? "#FF6B9D" : "rgba(115,156,175,0.25)"}`,
            fontFamily:"'Nunito',sans-serif", fontSize:14, outline:"none",
            boxSizing:"border-box", background:"rgba(255,248,240,0.6)",
            paddingRight: isPass ? 44 : 16 }}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(!show)}
            style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#7B7B9A", padding:2 }}>
            {show
              ? <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
              : <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            }
          </button>
        )}
      </div>
      {error && <p style={{ fontSize:12, color:"#E8527F", fontFamily:"'Nunito',sans-serif", fontWeight:600, margin:0 }}>{error}</p>}
    </div>
  );
}

function AvatarStep({ name, avatarConfig, onAvatarChange, onConfirm, loading }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:26, fontWeight:700, color:"#1A1A2E", marginBottom:6 }}>
          Halo, {name.split(" ")[0]}! 👋
        </h2>
        <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:14, color:"#7B7B9A", margin:0 }}>
          Buat avatar yang mencerminkan dirimu ✨
        </p>
      </div>

      <AvatarBuilder
        config={avatarConfig}
        onSave={onConfirm}
        onCancel={null}
        saving={loading}
      />
    </div>
  );
}

export default function Login() {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState("form");

  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [avatarConfig, setAvatarConfig] = useState({ ...DEFAULT_CONFIG });
  const [errors, setErrors]         = useState({});
  const [loading, setLoading]       = useState(false);
  const [globalErr, setGlobalErr]   = useState("");

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  function validate() {
    const e = {};
    if (mode === "register" && !name.trim()) e.name = "Nama wajib diisi!";
    if (!email.trim()) e.email = "Email wajib diisi!";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Format email belum bener nih.";
    if (!password) e.password = "Kata sandi wajib diisi!";
    else if (password.length < 6) e.password = "Minimal 6 karakter ya!";
    if (mode === "register" && password !== confirm) e.confirm = "Kata sandi tidak cocok!";
    return e;
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setGlobalErr("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    if (mode === "login") {
      setLoading(true);
      try {
        await login(email, password);
        navigate(from, { replace: true });
      } catch (err) { setGlobalErr(err.message); }
      finally { setLoading(false); }
    } else {
      setStep("avatar");
    }
  }

  async function handleAvatarConfirm(config) {
    setLoading(true); setGlobalErr("");
    try {
      await register(name, email, password, config);
      navigate(from, { replace: true });
    } catch (err) {
      setGlobalErr(err.message);
      setStep("form");
    } finally { setLoading(false); }
  }

  function switchMode(m) {
    setMode(m); setStep("form"); setErrors({}); setGlobalErr("");
    setName(""); setEmail(""); setPassword(""); setConfirm(""); setAvatarConfig({ ...DEFAULT_CONFIG });
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex" }}>
<div className="hidden lg:flex flex-col justify-between flex-shrink-0 p-12 relative overflow-hidden"
        style={{ width:460, background:"linear-gradient(160deg,#1d3a4a 0%,#0f2535 100%)" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:256, height:256, opacity:0.15, pointerEvents:"none",
          background:`linear-gradient(135deg,${C},#4a7c8f)`, borderRadius:"60% 40% 30% 70% / 60% 30% 70% 40%" }} />
        <div style={{ position:"absolute", bottom:80, left:-40, width:192, height:192, opacity:0.10, pointerEvents:"none",
          background:`linear-gradient(135deg,#8ecae6,${C})`, borderRadius:"30% 60% 70% 40% / 50% 60% 30% 60%" }} />

        <Link to="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", position:"relative", zIndex:10 }}>
          <span style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, color:"white" }}>
            Seribu<span style={{ color:C }}>Cerita</span>
          </span>
        </Link>
<div style={{ position:"relative", zIndex:10 }}>
          <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:700, color:`rgba(255,255,255,0.40)`, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:16 }}>
            Avatarmu, Gayamu
          </p>
          <div style={{ display:"flex", gap:12, marginBottom:32 }}>
            {[
              { bgColor:0, skinTone:0, hairColor:0, hairStyle:1, outfitColor:2, accessory:1, gender:0 },
              { bgColor:3, skinTone:2, hairColor:3, hairStyle:3, outfitColor:4, accessory:2, gender:0 },
              { bgColor:6, skinTone:1, hairColor:5, hairStyle:2, outfitColor:0, accessory:0, gender:1 },
              { bgColor:1, skinTone:3, hairColor:1, hairStyle:5, outfitColor:3, accessory:3, gender:0 },
              { bgColor:4, skinTone:0, hairColor:2, hairStyle:4, outfitColor:1, accessory:4, gender:1 },
            ].map((cfg, i) => (
              <div key={i} style={{ width:52, height:52, borderRadius:16, overflow:"hidden", flexShrink:0, outline:"2px solid rgba(255,255,255,0.10)" }}>
                <CustomAvatar size={52} config={{ ...DEFAULT_CONFIG, ...cfg }} />
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {[["1000+","Sesi Curhat"],["5","Emosi"],["24/7","Tersedia"]].map(([v,l])=>(
              <div key={l} style={{ textAlign:"center" }}>
                <p style={{ fontFamily:"'Fraunces',serif", fontSize:26, fontWeight:700, color:C, margin:0 }}>{v}</p>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.40)", fontFamily:"'Nunito',sans-serif", fontWeight:600, marginTop:2 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize:12, color:"rgba(255,255,255,0.25)", fontFamily:"'Nunito',sans-serif", fontWeight:600 }}>
          © 2026 SeribuCerita · CC26-PSU212
        </p>
      </div>
<div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"80px 24px 40px", background:"linear-gradient(160deg,#FFF8F0 0%,#F0F6FA 100%)" }}>
        <div style={{ width:"100%", maxWidth:440 }}>

          {step === "avatar" ? (
            <AvatarStep
              name={name}
              avatarConfig={avatarConfig}
              onAvatarChange={setAvatarConfig}
              onConfirm={handleAvatarConfirm}
              loading={loading}
            />
          ) : (
            <>
<div style={{ display:"flex", gap:6, padding:6, borderRadius:20, marginBottom:28,
                background:"white", border:"2px solid rgba(115,156,175,0.12)", boxShadow:"0 4px 16px rgba(26,26,46,0.06)" }}>
                {[["login","Masuk"],["register","Daftar"]].map(([m,lbl])=>(
                  <button key={m} onClick={()=>switchMode(m)}
                    style={{ flex:1, padding:"11px", borderRadius:14, fontSize:14,
                      fontFamily:"'Nunito',sans-serif", fontWeight:800,
                      background:mode===m?`linear-gradient(135deg,${C},#4a7c8f)`:"transparent",
                      color:mode===m?"white":"#7B7B9A",
                      boxShadow:mode===m?`0 4px 16px rgba(115,156,175,0.30)`:"none",
                      border:"none", cursor:"pointer", transition:"all 0.2s" }}>
                    {lbl}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom:24 }}>
                <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:700, color:"#1A1A2E", marginBottom:6 }}>
                  {mode==="login" ? "Halo, selamat datang kembali!" : "Yuk, bikin akun dulu!"}
                </h1>
                <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:500, color:"#7B7B9A", margin:0 }}>
                  {mode==="login" ? "Masuk dan lanjutin perjalanan kesehatan mentalmu~" : "Bergabung dan mulai ceritakan perasaanmu!"}
                </p>
              </div>

              {globalErr && (
                <div style={{ marginBottom:16, padding:"11px 14px", borderRadius:14, background:"rgba(239,68,68,0.08)", border:"2px solid rgba(239,68,68,0.18)", color:"#dc2626", fontSize:13, fontFamily:"'Nunito',sans-serif", fontWeight:600 }}>
                  ⚠️ {globalErr}
                </div>
              )}

              <form onSubmit={handleFormSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {mode==="register" && (
                  <InputField label="Nama Lengkap" value={name} onChange={e=>setName(e.target.value)} placeholder="Nama kamu siapa?" error={errors.name} />
                )}
                <InputField label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@kamu.com" error={errors.email} />
                <InputField label="Kata Sandi" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode==="register"?"Minimal 6 karakter":"Kata sandimu"} error={errors.password} />
                {mode==="register" && (
                  <InputField label="Konfirmasi Kata Sandi" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Ulangi kata sandi" error={errors.confirm} />
                )}

                {mode==="register" && (
                  <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:16, background:"rgba(115,156,175,0.07)", border:"1.5px solid rgba(115,156,175,0.15)" }}>
                    <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:"#4a7c8f", fontWeight:600, margin:0 }}>
                      Langkah berikutnya: kamu bisa memilih avatar favoritmu!
                    </p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  style={{ marginTop:4, padding:"14px", borderRadius:999, border:"none", cursor:loading?"not-allowed":"pointer",
                    background:`linear-gradient(135deg,${C},#4a7c8f)`, color:"white",
                    fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:15,
                    boxShadow:`0 8px 24px rgba(115,156,175,0.35)`, opacity:loading?0.7:1,
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  {loading ? "Memproses..." : mode==="login" ? "Masuk Sekarang" : "Lanjut Pilih Avatar"}
                </button>
              </form>

              <p style={{ textAlign:"center", fontSize:13, color:"#7B7B9A", fontFamily:"'Nunito',sans-serif", fontWeight:600, marginTop:20 }}>
                {mode==="login" ? "Belum punya akun? " : "Sudah punya akun? "}
                <button onClick={()=>switchMode(mode==="login"?"register":"login")}
                  style={{ color:C, fontWeight:800, background:"none", border:"none", cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontSize:13 }}>
                  {mode==="login" ? "Daftar sekarang" : "Masuk"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

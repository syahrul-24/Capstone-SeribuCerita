import { useEffect } from "react";
import { Link } from "react-router-dom";
import { IconMessage, IconBrain, IconBook, IconChart, IconShield, IconCursor, IconPencilWrite, IconAI, IconSparkle } from "../components/icons/index.jsx";

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(e => e.forEach(x => { if (x.isIntersecting) x.target.classList.add("visible"); }), { threshold: 0.08 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

const C = "#739caf";

const FEATURES = [
  { Icon: IconMessage, bg: "linear-gradient(135deg,#739caf,#4a7c8f)", title: "Curhat dengan AI",    desc: "Ceritakan apa pun yang kamu rasakan. AI kami siap mendengarkan tanpa menghakimi — kapan saja, di mana saja.", to: "/chatbot" },
  { Icon: IconBrain,   bg: "linear-gradient(135deg,#739caf,#4a7c8f)", title: "Deteksi Emosi",       desc: "AI akan mendeteksi emosi di balik kata-katamu — cemas, sedih, marah, senang, takut, atau netral.", to: "/chatbot" },
  { Icon: IconBook,    bg: "linear-gradient(135deg,#739caf,#4a7c8f)",  title: "Artikel Edukatif",    desc: "Baca berbagai artikel tentang kesehatan mental, self-care, dan tips mengelola emosi.", to: "/edukasi" },
  { Icon: IconChart,   bg: "linear-gradient(135deg,#739caf,#4a7c8f)",  title: "Ringkasan & Insight", desc: "Dapatkan ringkasan emosi dan rekomendasi artikel yang relevan dengan kondisimu.", to: "/chatbot" },
  { Icon: IconShield,  bg: "linear-gradient(135deg,#739caf,#4a7c8f)",  title: "Privat & Aman",       desc: "Percakapanmu tersimpan di perangkatmu sendiri. Data pribadi tidak dikirim ke mana pun.", to: "/chatbot" },
];

const STEPS = [
  { num: "01", Icon: IconCursor,      bg: "linear-gradient(135deg,#739caf,#4a7c8f)", title: "Buka Halaman Curhat",  desc: "Klik menu Curhat di navbar dan mulai percakapan baru." },
  { num: "02", Icon: IconPencilWrite, bg: "linear-gradient(135deg,#739caf,#4a7c8f)", title: "Tulis Perasaanmu",     desc: "Ceritakan apa pun yang ada di pikiranmu. Bebas, tanpa tekanan." },
  { num: "03", Icon: IconAI,          bg: "linear-gradient(135deg,#739caf,#4a7c8f)",  title: "AI Merespon",          desc: "AI akan mendeteksi emosimu dan merespon dengan penuh empati." },
  { num: "04", Icon: IconSparkle,     bg: "linear-gradient(135deg,#739caf,#4a7c8f)",  title: "Dapatkan Rekomendasi", desc: "Terima ringkasan emosi dan artikel yang membantumu lebih memahami diri." },
];

export default function Tentang() {
  useReveal();

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ paddingTop: 88, background: `linear-gradient(160deg,#1A4B6B 0%,${C} 100%)` }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "80px 32px 80px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full anim-fade-up"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 16, fontWeight: 700, color: "white" }}>Tentang SeribuCerita</span>
          </div>
          <h1 className="anim-fade-up" style={{ fontFamily: "'Fraunces',serif", fontSize: 48, fontWeight: 700, color: "white", marginBottom: 20, lineHeight: "56px" }}>
            Ruang Aman untuk Ceritamu
          </h1>
          <p className="anim-fade-up" style={{ fontFamily: "'Nunito',sans-serif", fontSize: 17, fontWeight: 500, color: "rgba(255,255,255,0.85)", lineHeight: "30px", maxWidth: 600, margin: "0 auto 32px" }}>
            SeribuCerita adalah platform kesehatan mental yang membantu kamu mengenali, mengekspresikan, dan memahami emosi dengan cara yang aman dan nyaman.
          </p>
          <div className="anim-fade-up flex gap-4 justify-center flex-wrap">
            <Link to="/chatbot" className="btn-fun btn-primary" style={{ background: "white", color: C, padding: "14px 32px", borderRadius: 999, fontWeight: 700, textDecoration: "none" }}>
              Mulai Curhat
            </Link>
            <Link to="/edukasi" className="btn-fun" style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "2px solid rgba(255,255,255,0.3)", padding: "14px 28px", borderRadius: 999, fontWeight: 600, textDecoration: "none" }}>
              Baca Artikel
            </Link>
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section className="py-20" style={{ background: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
          <div className="text-center mb-14 reveal">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full"
              style={{ background: `rgba(115,156,175,0.10)`, border: `2px solid rgba(115,156,175,0.2)` }}>
              <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 16, fontWeight: 700, color: C }}>Fitur Unggulan</span>
            </div>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 36, fontWeight: 700, color: "#1A1A2E", marginBottom: 8 }}>
              Apa yang Bisa Kamu Lakukan?
            </h2>
            <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 16, color: "#7B7B9A", fontWeight: 500 }}>
              Semua fitur gratis dan siap menemani perjalananmu
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card reveal rounded-2xl p-6"
                style={{ background: `rgba(115,156,175,0.06)`, border: `2px solid rgba(115,156,175,0.12)`, transitionDelay: `${i * 0.08}s` }}>
                <div style={{ width:48, height:48, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14, background:f.bg, boxShadow:"0 6px 18px rgba(26,26,46,0.12)" }}>
                  <f.Icon size={24} color="white" strokeWidth={1.6} />
                </div>
                <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 500, color: "#5A5A7A", lineHeight: "20px", marginBottom: 12 }}>{f.desc}</p>
                <Link to={f.to}
                  style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, color: C, textDecoration: "none" }}>
                  Pelajari
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Penggunaan */}
      <section className="py-20" style={{ background: "linear-gradient(160deg,#FFF8F0,#EEF4F7)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 32px" }}>
          <div className="text-center mb-14 reveal">
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 32, fontWeight: 700, color: "#1A1A2E", marginBottom: 8 }}>
              Cara Menggunakan
            </h2>
            <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 15, color: "#7B7B9A", fontWeight: 500 }}>
              Mulai dalam 4 langkah sederhana
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {STEPS.map((s, i) => (
              <div key={i} className="reveal flex gap-5 items-start">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
                    background: s.bg, boxShadow: "0 6px 16px rgba(26,26,46,0.12)",
                  }}><s.Icon size={22} color="white" strokeWidth={1.6} /></div>
                  {i < STEPS.length - 1 && <div style={{ width: 2, height: 36, background: `rgba(115,156,175,0.2)`, margin: "4px 0" }} />}
                </div>
                <div style={{ paddingBottom: 28, flex: 1 }}>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, fontWeight: 700, color: C, background: `rgba(115,156,175,0.12)`, padding: "2px 10px", borderRadius: 999 }}>{s.num}</span>
                  </div>
                  <h4 style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginBottom: 4 }}>{s.title}</h4>
                  <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, color: "#7B7B9A", lineHeight: "20px" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center" style={{ background: `linear-gradient(135deg,#1A4B6B,${C})` }}>
        <div className="reveal" style={{ maxWidth: 550, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💙</div>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 32, fontWeight: 700, color: "white", marginBottom: 12 }}>
            Siap Memulai?
          </h2>
          <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 15, color: "rgba(255,255,255,0.75)", marginBottom: 28 }}>
            Tidak perlu daftar. Langsung buka halaman Curhat dan mulai ceritakan apa yang kamu rasakan.
          </p>
          <Link to="/chatbot" className="btn-fun" style={{ background: "white", color: C, padding: "12px 32px", borderRadius: 999, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
            Mulai Curhat
          </Link>
        </div>
      </section>
    </div>
  );
}
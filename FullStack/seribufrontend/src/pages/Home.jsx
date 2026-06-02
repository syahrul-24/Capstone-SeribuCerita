import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchArticles } from "../lib/api";
import { IconAI, IconShield, IconBook } from "../components/icons/index.jsx";
import logo from "../assets/logo.png";

const C = "#739caf";

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.05 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ── Hero dengan Carousel ── */
function Hero() {
  const images = [
    { url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop&q=80", alt: "Wanita meditasi di alam", caption: "Temukan ketenangan dalam diri" },
    { url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&h=600&fit=crop&q=80", alt: "Orang duduk di pantai", caption: "Bernapas dan rileks sejenak" },
    { url: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=600&fit=crop&q=80", alt: "Hutan yang tenang", caption: "Kembali ke alam untuk menenangkan hati" },
    { url: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&h=600&fit=crop&q=80", alt: "Matahari terbit di pegunungan", caption: "Setiap hari adalah awal yang baru" },
    { url: "https://images.unsplash.com/photo-1441974231531-c622288db196?w=800&h=600&fit=crop&q=80", alt: "Hutan dengan sinar matahari", caption: "Damai, harmonis, dan penuh harapan" },
    { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&q=80", alt: "Pantai dengan pasir putih", caption: "Biarkan ombak membawa pergi bebanmu" },
    { url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=600&fit=crop&q=80", alt: "Langit berbintang", caption: "Kamu tidak sendirian, ada banyak bintang yang menemani" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(160deg,#FFF8F0 0%,#E8F0F5 40%,#F0F4FF 100%)", minHeight: 680, paddingTop: 80 }}>
      <div className="blob absolute -top-20 -left-20 w-80 h-80 opacity-30 pointer-events-none"
        style={{ background: "linear-gradient(135deg,#739caf,#4a7c8f)", borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }} />
      <div className="blob blob-2 absolute -bottom-10 right-0 w-96 h-96 opacity-20 pointer-events-none"
        style={{ background: "linear-gradient(135deg,#739caf,#4a7c8f)", borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" }} />

      <div className="max-w-[1180px] mx-auto px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left - Text Content */}
          <div className="flex-1 pt-14 max-w-[520px] text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-8 anim-fade-up"
              style={{ background: "white", border: "2px solid rgba(115,156,175,0.20)", borderRadius: 999, padding: "8px 18px", boxShadow: "0 4px 16px rgba(115,156,175,0.12)", display: "inline-flex" }}>
              <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 700, color: "#3D3D5C" }}>
                SeribuCerita siap menemanimu!
              </span>
            </div>
            <h1 className="anim-fade-up" style={{ fontFamily: "'Fraunces', serif", fontSize: 58, lineHeight: "64px", fontWeight: 700, color: "#1A1A2E", marginBottom: 24, animationDelay: "0.1s" }}>
              Ceritakan semua perasaanmu{" "}di sini
            </h1>
            <p className="anim-fade-up" style={{ fontFamily: "'Nunito',sans-serif", fontSize: 17, lineHeight: "28px", color: "#3D3D5C", fontWeight: 500, maxWidth: 420, marginBottom: 40, animationDelay: "0.2s", marginLeft: "auto", marginRight: "auto" }}>
              Ruang aman dan menyenangkan buat kamu refleksi, nulis jurnal, dan curhat tanpa takut dihakimi. Bareng-bareng kita jaga kesehatan mental!
            </p>
            <div className="flex items-center gap-4 flex-wrap anim-fade-up justify-center lg:justify-start" style={{ animationDelay: "0.3s" }}>
              <Link to="/chatbot" className="btn-fun btn-primary" style={{ background: "#739caf", color: "white", padding: "12px 28px", borderRadius: 999, textDecoration: "none", fontWeight: 700, fontSize: 15, display: "inline-block", boxShadow: "0 4px 12px rgba(115,156,175,0.3)" }}>
                Mulai Curhat
              </Link>
              <Link to="/edukasi" className="btn-fun" style={{ background: "white", color: "#1A1A2E", border: "2.5px solid rgba(26,26,46,0.12)", boxShadow: "0 4px 16px rgba(26,26,46,0.06)", padding: "12px 24px", fontWeight: 700, fontSize: 15, borderRadius: 999, textDecoration: "none" }}>
                Baca Artikel
              </Link>
            </div>
          </div>

          {/* Right - Carousel */}
          <div className="hidden lg:block flex-shrink-0" style={{ width: 520 }}>
            <div className="relative" style={{ height: 580 }}>
              <div className="rounded-3xl overflow-hidden" style={{ height: 480, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", border: "3px solid white" }}>
                <img src={images[currentIndex].url} alt={images[currentIndex].alt}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)", padding: "40px 20px 20px", borderRadius: "0 0 24px 24px" }}>
                  <p style={{ color: "white", fontSize: 14, fontWeight: 600, fontFamily: "'Nunito',sans-serif", textShadow: "0 1px 2px rgba(0,0,0,0.2)", margin: 0 }}>
                    {images[currentIndex].caption}
                  </p>
                </div>
              </div>
              <button onClick={prevSlide} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: 999, background: "white", border: "2px solid rgba(115,156,175,0.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#739caf"; e.currentTarget.querySelector("svg").style.stroke = "white"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.querySelector("svg").style.stroke = "#739caf"; }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#739caf" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={nextSlide} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: 999, background: "white", border: "2px solid rgba(115,156,175,0.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#739caf"; e.currentTarget.querySelector("svg").style.stroke = "white"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.querySelector("svg").style.stroke = "#739caf"; }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#739caf" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 20 }}>
                {images.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentIndex(idx)}
                    style={{ width: idx === currentIndex ? 28 : 8, height: 8, borderRadius: 999, border: "none", background: idx === currentIndex ? "#739caf" : "rgba(115,156,175,0.4)", cursor: "pointer", transition: "all 0.3s ease" }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Chat Preview ── */
function ChatPreview() {
  const CHIPS = ["Lagi cemas", "Pengen curhat", "Tips rileks"];
  return (
    <section className="relative overflow-hidden py-20" style={{ background: "linear-gradient(135deg,#E8F0F5 0%,#F0F4FF 100%)" }}>
      <div className="max-w-[1180px] mx-auto px-8">
        <div className="text-center mb-12 reveal">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full"
            style={{ background: "rgba(115,156,175,0.12)", border: "2px solid rgba(115,156,175,0.20)" }}>
            <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:16, fontWeight:700, color:"#739caf" }}>✦ Teman Curhat</span>
          </div>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 38, fontWeight: 700, color: "#1A1A2E", marginBottom: 12 }}>
            Ruang aman buat{" "}
            <span style={{ fontFamily: "'Fraunces',serif", background:"linear-gradient(135deg,#739caf,#4a7c8f)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              cerita apa aja
            </span>
          </h2>
          <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:17, fontWeight:500, color:"#3D3D5C", maxWidth:500, margin:"0 auto" }}>
            Teman virtual yang siap dengerin kamu 24/7 tanpa menghakimi
          </p>
        </div>
        <div className="max-w-2xl mx-auto reveal">
          <div style={{ background: "white", borderRadius: 32, padding: 24, boxShadow: "0 20px 60px rgba(26,26,46,0.12)", border: "2px solid rgba(115,156,175,0.08)" }}>
            <div className="flex items-center justify-between mb-5 pb-4" style={{ borderBottom: "2px solid rgba(26,26,46,0.06)" }}>
              <div className="flex items-center gap-3">
                <img src={logo} alt="SeribuCerita Logo" className="w-10 h-10 rounded-full object-cover" style={{ border: `2px solid ${C}` }} />
                <div>
                  <p style={{ fontSize:14, fontWeight:800, color:"#1A1A2E", fontFamily:"'Nunito',sans-serif" }}>SeribuCerita</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                    <span style={{ fontSize:11, color:"#7B7B9A", fontFamily:"'Nunito',sans-serif", fontWeight:600 }}>Pendamping Kesehatan Mental</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3 mb-5">
              <div className="flex justify-start">
                <div style={{ background:"rgba(245,237,216,0.80)", borderRadius:"20px 20px 20px 4px", padding:"12px 16px", maxWidth:"80%" }}>
                  <p style={{ fontSize:14, color:"#1A1A2E", fontFamily:"'Nunito',sans-serif", fontWeight:600, lineHeight:"22px" }}>
                    Halo! Bagaimana perasaanmu hari ini? Aku di sini buat dengerin ceritamu tanpa judging.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <div style={{ background:"linear-gradient(135deg,#739caf,#4a7c8f)", borderRadius:"20px 20px 4px 20px", padding:"12px 16px", maxWidth:"75%" }}>
                  <p style={{ fontSize:14, color:"white", fontFamily:"'Nunito',sans-serif", fontWeight:600, lineHeight:"22px" }}>
                    Lagi agak overwhelmed sih, banyak banget deadline
                  </p>
                </div>
              </div>
              <div className="flex justify-start">
                <div style={{ background:"rgba(240,244,255,0.80)", borderRadius:"20px 20px 20px 4px", padding:"12px 16px", maxWidth:"80%" }}>
                  <p style={{ fontSize:14, color:"#1A1A2E", fontFamily:"'Nunito',sans-serif", fontWeight:600, lineHeight:"22px" }}>
                    Waah, aku ngerti banget perasaan itu! Yuk kita coba urai satu-satu
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap mb-4">
              {CHIPS.map((c) => (
                <Link key={c} to="/chatbot" className="quick-prompt px-4 py-2 rounded-full text-sm"
                  style={{ background: "rgba(26,26,46,0.04)", border: "2px solid rgba(26,26,46,0.08)", fontFamily: "'Nunito',sans-serif", fontWeight: 700, color: "#3D3D5C", textDecoration: "none" }}>
                  {c}
                </Link>
              ))}
            </div>
            <Link to="/chatbot" style={{ display:"flex", alignItems:"center", gap:12, border:"2px solid rgba(115,156,175,0.20)", borderRadius:16, padding:"14px 16px", textDecoration:"none", background:"rgba(255,248,240,0.80)" }}>
              
              <span style={{ flex:1, fontSize:14, color:"#7B7B9A", fontFamily:"'Nunito',sans-serif", fontWeight:600 }}>Ketik ceritamu di sini...</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"linear-gradient(135deg,#739caf,#4a7c8f)" }}>
                <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Why Us ── */
function WhyUs() {
  const features = [
    { Icon: IconAI,     bg: "linear-gradient(135deg,#739caf,#4a7c8f)", accent: "#EEF6FA", title: "Dukungan AI 24/7",  desc: "Kapanpun kamu butuh teman cerita, AI kita siap dengerin tanpa pernah tidur! Responsif dan penuh perhatian." },
    { Icon: IconShield, bg: "linear-gradient(135deg,#739caf,#4a7c8f)",  accent: "#EBF6EE", title: "Privasi Terjaga",   desc: "Cerita kamu aman banget di sini. Data pribadimu dijaga ketat karena kenyamananmu adalah prioritas kami." },
    { Icon: IconBook,   bg: "linear-gradient(135deg,#739caf,#4a7c8f)",  accent: "#FEF0F5", title: "Artikel dari Ahli", desc: "Baca artikel kesehatan mental yang ditulis oleh para profesional tepercaya untuk inspirasi hidupmu." },
  ];
  return (
    <section className="py-24 relative overflow-hidden" style={{ background: "white" }}>
      <div className="max-w-[1180px] mx-auto px-8">
        <div className="text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full"
            style={{ background: "rgba(115,156,175,0.10)", border: "2px solid rgba(115,156,175,0.15)" }}>
            <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:16, fontWeight:700, color:"#739caf" }}>Kenapa Pilih Kami?</span>
          </div>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:40, fontWeight:700, color:"#1A1A2E", marginBottom:12 }}>
            Dibangun dengan{" "}
            <span style={{ fontFamily:"'Fraunces',serif", background:"linear-gradient(135deg,#739caf,#4a7c8f)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>hati</span>
          </h2>
          <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:17, fontWeight:500, color:"#3D3D5C", maxWidth:500, margin:"0 auto" }}>
            Kami percaya setiap cerita berharga. Platform yang hangat, aman, dan menyenangkan!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="feature-card reveal bg-white rounded-3xl p-8 text-center"
              style={{ border:"2px solid rgba(115,156,175,0.10)", boxShadow:"0 8px 32px rgba(26,26,46,0.06)", transitionDelay:`${i*0.1}s` }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: f.bg, boxShadow: "0 8px 24px rgba(26,26,46,0.12)" }}>
                <f.Icon size={30} color="white" strokeWidth={1.6} />
              </div>
              <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:20, fontWeight:700, color:"#1A1A2E", marginBottom:10 }}>{f.title}</h3>
              <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:15, fontWeight:500, color:"#3D3D5C", lineHeight:"24px" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Stats Banner ── */
function StatsBanner() {
  const stats = [
    { value: "100+", label: "Sesi Curhat" },
    { value: "10+",  label: "Artikel Kesehatan" },
    { value: "5",    label: "Emosi" },
    { value: "24/7", label: "Selalu Ada" },
  ];
  return (
    <section className="py-12 reveal" style={{ background: "linear-gradient(135deg,#1A4B6B 0%,#2E6B8F 100%)" }}>
      <div className="max-w-[1180px] mx-auto px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p style={{ fontFamily:"'Fraunces',serif", fontSize:36, fontWeight:700, color:"white", lineHeight:1 }}>{s.value}</p>
              <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.60)", marginTop:6 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Articles ── */
function ArticlesSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetchArticles({ limit: 3 })
      .then((res) => setArticles(res.data || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  // Re-observe reveal elements setelah artikel dirender
  useEffect(() => {
    if (!loading) {
      const els = document.querySelectorAll(".reveal");
      els.forEach(el => el.classList.add("visible"));
    }
  }, [loading, articles]);

  return (
    <section className="py-24" style={{ background: "linear-gradient(160deg,#FFF8F0 0%,#E8F0F5 100%)" }}>
      <div className="max-w-[1180px] mx-auto px-8">
        <div className="reveal flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full"
              style={{ background: "rgba(115,156,175,0.10)", border: "2px solid rgba(115,156,175,0.15)" }}>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700, color:"#739caf" }}>✦ Artikel Terbaru</span>
            </div>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:38, fontWeight:700, color:"#1A1A2E" }}>
              Baca, Pelajari, tumbuh 🌱
            </h2>
          </div>
          <Link to="/edukasi" className="btn-fun"
            style={{ background:"white", border:"2.5px solid rgba(26,26,46,0.10)", color:"#1A1A2E", padding:"10px 20px", fontSize:14, fontWeight:700, borderRadius:999, textDecoration:"none", boxShadow:"0 4px 16px rgba(26,26,46,0.06)" }}>
            Lihat Semua →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} style={{ borderRadius:24, overflow:"hidden", background:"white", boxShadow:"0 8px 32px rgba(26,26,46,0.08)" }}>
                <div style={{ height:220, background:"linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite" }}/>
                <div style={{ padding:24 }}>
                  <div style={{ height:20, borderRadius:8, background:"#f1f5f9", marginBottom:10 }}/>
                  <div style={{ height:16, borderRadius:8, background:"#f1f5f9", width:"70%" }}/>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((art, i) => (
              <Link key={art.id} to={`/artikel/${art.id}`}
                className="art-card bg-white flex flex-col"
                style={{ boxShadow:"0 8px 32px rgba(26,26,46,0.08)", border:"2px solid rgba(26,26,46,0.04)", borderRadius:24, overflow:"hidden", transitionDelay:`${i*0.1}s` }}>
                <div style={{ height: 220, overflow:"hidden", position:"relative" }}>
                  {art.image
                    ? <img src={art.image} alt={art.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    : <div className="w-full h-full flex items-center justify-center text-6xl" style={{ background:"rgba(255,248,240,0.80)" }}>{art.emoji}</div>
                  }
                  <div style={{ position:"absolute", top:12, left:12 }}>
                    <span style={{ background: art.tag_bg || "rgba(115,156,175,0.15)", color: art.tag_color || "#739caf", fontFamily:"'Nunito',sans-serif", padding:"4px 12px", borderRadius:999, fontSize:12, fontWeight:700 }}>
                      {art.tag}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:19, fontWeight:700, color:"#1A1A2E", marginBottom:8, lineHeight:"26px" }}>
                    {art.title}
                  </h3>
                  <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:500, color:"#7B7B9A", lineHeight:"22px", flexGrow:1 }}>
                    {art.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop:"2px solid rgba(26,26,46,0.05)" }}>
                    <span style={{ fontSize:13, fontWeight:600, color:"#7B7B9A", fontFamily:"'Nunito',sans-serif" }}>{art.date}</span>
                    <span style={{ fontSize:13, fontWeight:800, color:"#739caf", fontFamily:"'Nunito',sans-serif" }}>Baca →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
    </section>
  );
}

/* ── Main Home Component ── */
export default function Home() {
  useReveal();
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  return (
    <div style={{ minHeight: "100vh" }}>
      <Hero />
      <ChatPreview />
      <WhyUs />
      <StatsBanner />
      <ArticlesSection />
    </div>
  );
}
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchArticles, fetchCategories } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const ARTICLES_PER_PAGE = 8;
const DEFAULT_CATEGORIES = [{ id: "semua", label: "Semua" }];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.08 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });
}

function ArticleCard({ article, delay = 0 }) {
  return (
    <Link to={`/artikel/${article.id}`}
      className={`art-card bg-white flex flex-col reveal reveal-delay-${delay}`}
      style={{ boxShadow: "0 8px 32px rgba(26,26,46,0.07)", border: "2px solid rgba(26,26,46,0.04)" }}>
      <div style={{ height: 220, overflow: "hidden", position: "relative" }}>
        {article.image
          ? <img src={article.image} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, background: "rgba(255,248,240,0.80)" }}>{article.emoji}</div>
        }
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <span className="tag-pill" style={{ background: article.tag_bg || "rgba(115,156,175,0.12)", color: article.tag_color || "#739caf", fontFamily: "'Nunito',sans-serif" }}>
            {article.tag}
          </span>
        </div>
      </div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginBottom: 8, lineHeight: "26px" }} className="line-clamp-2">
          {article.title}
        </h3>
        <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 500, color: "#7B7B9A", lineHeight: "22px", flexGrow: 1 }} className="line-clamp-2">
          {article.excerpt}
        </p>
        <div style={{ paddingTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 600, color: "#7B7B9A" }}>{article.date}</span>
          <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 800, color: "#739caf" }}>Baca →</span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white" style={{ borderRadius: 16, overflow: "hidden", border: "2px solid rgba(26,26,46,0.04)", boxShadow: "0 8px 32px rgba(26,26,46,0.07)" }}>
      <div style={{ height: 220, background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      <div style={{ padding: 24 }}>
        <div style={{ height: 20, borderRadius: 8, background: "#f1f5f9", marginBottom: 10 }} />
        <div style={{ height: 16, borderRadius: 8, background: "#f1f5f9", width: "70%" }} />
      </div>
    </div>
  );
}

const CAT_LABEL_MAP = {
  happy:   "Kebahagiaan",
  sad:     "Kesedihan",
  anxious: "Kecemasan",
  angry:   "Kemarahan",
  neutral: "Keseharian",
  fear:    "Ketakutan",
};

export default function Edukasi() {
  useReveal();
  const { user } = useAuth();
  const [activeCat, setActiveCat]         = useState("semua");
  const [search, setSearch]               = useState("");
  const [page, setPage]                   = useState(1);
  const [articles, setArticles]           = useState([]);
  const [categories, setCategories]       = useState(DEFAULT_CATEGORIES);
  const [meta, setMeta]                   = useState({});
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [guestLimitReached, setGuestLimitReached] = useState(false);

  // Load categories — deduplicate by category id di frontend juga
  useEffect(() => {
    fetchCategories()
      .then((res) => {
        const seen = new Set();
        const cats = [{ id: "semua", label: "Semua" }];
        (res.data || []).forEach((c) => {
          if (!seen.has(c.category)) {
            seen.add(c.category);
            cats.push({
              id:    c.category,
              label: CAT_LABEL_MAP[c.category] || c.tag || c.category,
              tag_bg:    c.tag_bg,
              tag_color: c.tag_color,
            });
          }
        });
        setCategories(cats);
      })
      .catch(() => {});
  }, []);

  // Load articles
  useEffect(() => {
    setLoading(true);
    setError("");
    fetchArticles({ category: activeCat, search, page, limit: ARTICLES_PER_PAGE })
      .then((res) => {
        setArticles(res.data || []);
        setMeta(res.meta || {});
        setGuestLimitReached(!!(res.meta?.guestLimitReached));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeCat, search, page]);

  function handleCat(id) {
    setActiveCat(id);
    setPage(1);
  }

  function handleSearch(val) {
    setSearch(val);
    setPage(1);
  }

  return (
    <div style={{ paddingTop: 90, minHeight: "100vh", background: "#FFF8F0" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "48px 24px 32px" }}>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(28px,5vw,48px)", fontWeight: 700, color: "#1A1A2E", marginBottom: 12 }}>
          Artikel Kesehatan Mental
        </h1>
        <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 16, color: "#7B7B9A", maxWidth: 480, margin: "0 auto" }}>
          Temukan panduan, tips, dan cerita inspiratif untuk perjalanan kesehatan mentalmu.
        </p>
      </div>

      {/* Search */}
      <div style={{ maxWidth: 520, margin: "0 auto 24px", padding: "0 20px" }}>
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#7B7B9A" }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari artikel..."
            style={{ width: "100%", padding: "12px 16px 12px 44px", borderRadius: 16, border: "2px solid rgba(115,156,175,0.2)", fontFamily: "'Nunito',sans-serif", fontSize: 14, outline: "none", background: "white", boxSizing: "border-box" }}
          />
        </div>
      </div>

      {/* Category filter — rata tengah */}
      <div style={{ padding: "0 20px 20px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCat(cat.id)}
              style={{
                padding: "8px 20px", borderRadius: 999, fontSize: 13,
                fontFamily: "'Nunito',sans-serif", fontWeight: 700, cursor: "pointer",
                border: activeCat === cat.id ? "2px solid #739caf" : "2px solid rgba(115,156,175,0.2)",
                background: activeCat === cat.id ? "#739caf" : "white",
                color: activeCat === cat.id ? "white" : "#3D3D5C",
                transition: "all 0.2s",
                boxShadow: activeCat === cat.id ? "0 4px 14px rgba(115,156,175,0.30)" : "none",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 60px" }}>
        {error && (
          <div style={{ textAlign: "center", padding: 40, color: "#dc2626", fontFamily: "'Nunito',sans-serif" }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 24 }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ fontFamily: "'Fraunces',serif", fontSize: 22, color: "#1A1A2E", fontWeight: 700 }}>Tidak ada artikel</p>
            <p style={{ fontFamily: "'Nunito',sans-serif", color: "#7B7B9A", marginTop: 8 }}>Coba kata kunci atau kategori lain</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 24 }}>
            {articles.map((a, i) => <ArticleCard key={a.id} article={a} delay={i % 4} />)}
          </div>
        )}

        {/* Pagination — disembunyikan untuk guest yang sudah di page terakhir */}
        {meta.totalPages > 1 && !(!user && guestLimitReached && page >= meta.totalPages) && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 40 }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              style={{ padding: "8px 20px", borderRadius: 999, border: "2px solid rgba(115,156,175,0.2)", background: "white", fontFamily: "'Nunito',sans-serif", fontWeight: 700, cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.4 : 1 }}
            >
              ← Prev
            </button>
            <span style={{ padding: "8px 20px", fontFamily: "'Nunito',sans-serif", fontWeight: 700, color: "#7B7B9A" }}>
              {page} / {meta.totalPages}
            </span>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              style={{ padding: "8px 20px", borderRadius: 999, border: "2px solid rgba(115,156,175,0.2)", background: "white", fontFamily: "'Nunito',sans-serif", fontWeight: 700, cursor: page >= meta.totalPages ? "not-allowed" : "pointer", opacity: page >= meta.totalPages ? 0.4 : 1 }}
            >
              Next →
            </button>
          </div>
        )}

        {/* Banner CTA login untuk guest yang sudah mencapai batas 10 artikel */}
        {!user && guestLimitReached && (
          <div style={{ marginTop: 48, borderRadius: 28, overflow: "hidden", boxShadow: "0 20px 60px rgba(26,26,46,0.14)", background: "linear-gradient(135deg,#1A1A2E 0%,#2D1B4E 50%,#1A2E3A 100%)", padding: 36, textAlign: "center", position: "relative" }}>
            {/* dekorasi lingkaran */}
            <div style={{ position:"absolute",top:-40,right:-40,width:200,height:200,borderRadius:"50%",background:"rgba(115,156,175,0.10)",pointerEvents:"none" }} />
            <div style={{ position:"absolute",bottom:-60,left:-30,width:160,height:160,borderRadius:"50%",background:"rgba(115,156,175,0.07)",pointerEvents:"none" }} />

            <div style={{ fontSize: 40, marginBottom: 12 }}>📚✨</div>
            <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(20px,4vw,28px)", fontWeight: 700, color: "white", marginBottom: 10, lineHeight: "1.3" }}>
              Masih banyak artikel untukmu!
            </h3>
            <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 15, color: "rgba(255,255,255,0.65)", maxWidth: 400, margin: "0 auto 28px", fontWeight: 500, lineHeight: "24px" }}>
              Kamu sudah membaca preview 10 artikel. Login atau daftar gratis untuk mengakses semua artikel lengkap, highlight, dan fitur lainnya.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/login" style={{ padding: "12px 28px", borderRadius: 999, textDecoration: "none", fontSize: 14, fontFamily: "'Nunito',sans-serif", fontWeight: 800, color: "#1A1A2E", background: "white", boxShadow: "0 6px 20px rgba(0,0,0,0.25)", transition: "opacity 0.2s" }}>
                Masuk Sekarang →
              </Link>
              <Link to="/register" style={{ padding: "12px 28px", borderRadius: 999, textDecoration: "none", fontSize: 14, fontFamily: "'Nunito',sans-serif", fontWeight: 800, color: "white", background: "linear-gradient(135deg,#739caf,#4a7c8f)", boxShadow: "0 6px 20px rgba(115,156,175,0.35)" }}>
                Daftar Gratis ✨
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

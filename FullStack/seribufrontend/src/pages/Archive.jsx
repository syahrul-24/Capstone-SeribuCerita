import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchArticles, fetchCategories } from "../lib/api";

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (e) => e.forEach((x) => { if (x.isIntersecting) x.target.classList.add("visible"); }),
      { threshold: 0.05 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });
}

export default function Archive() {
  useReveal();
  const [search, setSearch]       = useState("");
  const [activeCat, setActiveCat] = useState("semua");
  const [articles, setArticles]   = useState([]);
  const [categories, setCategories] = useState([{ id: "semua", label: "Semua" }]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 12;

  // Ambil kategori dari API
  useEffect(() => {
    fetchCategories()
      .then((res) => {
        const cats = (res.data || []).map((c) => ({
          id: c.category,
          label: c.tag || c.category,
        }));
        setCategories([{ id: "semua", label: "Semua" }, ...cats]);
      })
      .catch(() => {});
  }, []);

  // Ambil artikel dari API
  useEffect(() => {
    setLoading(true);
    fetchArticles({ category: activeCat, search, page, limit: LIMIT })
      .then((res) => {
        setArticles(res.data || []);
        setTotal(res.meta?.total || 0);
        setTotalPages(res.meta?.totalPages || 1);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [activeCat, search, page]);

  // Reset page saat filter berubah
  useEffect(() => { setPage(1); }, [activeCat, search]);

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>
      {/* Header */}
      <section className="relative overflow-hidden" style={{ paddingTop: 88, background: "linear-gradient(135deg,#1A1A2E 0%,#2D1B4E 100%)" }}>
        <div className="blob absolute top-10 right-20 w-72 h-72 opacity-15 pointer-events-none"
          style={{ background: "linear-gradient(135deg,#FF6B9D,#C77DFF)", borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }} />

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 32px 56px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full anim-fade-up"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <span>🗂️</span>
            <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.70)" }}>
              {loading ? "Memuat..." : `${total} Artikel Tersedia`}
            </span>
          </div>

          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 42, fontWeight: 700, color: "white", marginBottom: 16, lineHeight: "50px" }}>
            Arsip{" "}
            <span style={{ fontStyle: "italic", background: "linear-gradient(135deg,#FF6B9D,#C77DFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Artikel
            </span>{" "}📚
          </h1>

          {/* Search */}
          <div style={{ maxWidth: 500, margin: "0 auto 24px", position: "relative" }}>
            <div style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.50)" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z"/>
              </svg>
            </div>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari artikel..."
              style={{ width: "100%", padding: "14px 20px 14px 48px", borderRadius: 999,
                border: "2px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.10)",
                fontSize: 14, fontFamily: "'Nunito',sans-serif", fontWeight: 600,
                color: "white", outline: "none", boxSizing: "border-box", backdropFilter: "blur(4px)" }}
              onFocus={(e) => e.target.style.borderColor = "rgba(115,156,175,0.50)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
            />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCat(cat.id)}
                style={{ padding: "7px 18px", borderRadius: 999, fontSize: 13, fontFamily: "'Nunito',sans-serif", fontWeight: 800,
                  border: "2px solid", borderColor: activeCat === cat.id ? "#739caf" : "rgba(255,255,255,0.15)",
                  background: activeCat === cat.id ? "linear-gradient(135deg,#FF6B9D,#C77DFF)" : "rgba(255,255,255,0.08)",
                  color: activeCat === cat.id ? "white" : "rgba(255,255,255,0.70)",
                  cursor: "pointer", transition: "all 0.2s",
                  boxShadow: activeCat === cat.id ? "0 4px 16px rgba(115,156,175,0.35)" : "none" }}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <main style={{ maxWidth: 1140, margin: "0 auto", padding: "40px 32px 80px" }}>
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 600, color: "#7B7B9A" }}>
            {loading ? "Memuat artikel..." : <>Menampilkan <strong style={{ color: "#1A1A2E" }}>{articles.length}</strong> dari <strong style={{ color: "#1A1A2E" }}>{total}</strong> artikel</>}
          </p>
          <Link to="/edukasi" style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 700, color: "#739caf", textDecoration: "none" }}>
            Kembali ke Edukasi →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white" style={{ borderRadius: 16, overflow: "hidden", border: "2px solid rgba(26,26,46,0.04)", boxShadow: "0 8px 32px rgba(26,26,46,0.07)" }}>
                <div style={{ height: 180, background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
                <div style={{ padding: "18px 20px" }}>
                  <div style={{ height: 18, borderRadius: 8, background: "#f1f5f9", marginBottom: 10 }} />
                  <div style={{ height: 14, borderRadius: 8, background: "#f1f5f9", width: "70%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: 56, marginBottom: 16 }}>🔍</p>
            <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700, color: "#1A1A2E", marginBottom: 8 }}>Artikel Tidak Ditemukan</h3>
            <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 14, color: "#7B7B9A", marginBottom: 20 }}>Coba kata kunci atau kategori lain ya!</p>
            <button onClick={() => { setSearch(""); setActiveCat("semua"); }} className="btn-fun btn-primary" style={{ padding: "10px 24px", fontSize: 14 }}>
              Reset Filter 🔄
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map((a, i) => (
                <Link key={a.id} to={`/artikel/${a.id}`}
                  className="art-card bg-white flex flex-col reveal"
                  style={{ border: "2px solid rgba(26,26,46,0.04)", transitionDelay: `${(i % 6) * 0.05}s` }}>
                  <div style={{ height: 180, overflow: "hidden", position: "relative", background: "rgba(255,248,240,0.80)" }}>
                    {a.image
                      ? <img src={a.image} alt={a.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56 }}>{a.emoji}</div>
                    }
                    <div style={{ position: "absolute", top: 10, left: 10 }}>
                      <span className="tag-pill" style={{ background: a.tag_bg || "rgba(115,156,175,0.12)", color: a.tag_color || "#739caf", fontFamily: "'Nunito',sans-serif", fontSize: 11 }}>{a.tag}</span>
                    </div>
                  </div>
                  <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 700, color: "#1A1A2E", marginBottom: 6, lineHeight: "22px" }} className="line-clamp-2">{a.title}</h3>
                    <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, color: "#7B7B9A", flexGrow: 1, lineHeight: "20px", fontWeight: 500 }} className="line-clamp-2">{a.excerpt}</p>
                    <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "2px solid rgba(26,26,46,0.05)" }}>
                      <span style={{ fontSize: 11, color: "#7B7B9A", fontFamily: "'Nunito',sans-serif", fontWeight: 600 }}>{a.read_time}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#739caf", fontFamily: "'Nunito',sans-serif" }}>Baca →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 40 }}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: "8px 20px", borderRadius: 999, fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 13,
                    background: page === 1 ? "rgba(26,26,46,0.05)" : "#739caf", color: page === 1 ? "#7B7B9A" : "white",
                    border: "none", cursor: page === 1 ? "not-allowed" : "pointer" }}>
                  ← Prev
                </button>
                <span style={{ padding: "8px 16px", fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 13, color: "#3D3D5C" }}>
                  {page} / {totalPages}
                </span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ padding: "8px 20px", borderRadius: 999, fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 13,
                    background: page === totalPages ? "rgba(26,26,46,0.05)" : "#739caf", color: page === totalPages ? "#7B7B9A" : "white",
                    border: "none", cursor: page === totalPages ? "not-allowed" : "pointer" }}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const C     = "#739caf";
const BRAND = "#1A1A2E";

export default function Footer() {
  return (
    <footer style={{ background: BRAND, position: "relative", overflow: "hidden" }}>

      {/* Subtle decorative blobs */}
      <div style={{
        position: "absolute", top: -60, right: -60, width: 220, height: 220,
        borderRadius: "50%", opacity: 0.04,
        background: `radial-gradient(circle, ${C}, transparent)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -40, left: -40, width: 160, height: 160,
        borderRadius: "50%", opacity: 0.04,
        background: `radial-gradient(circle, #C77DFF, transparent)`,
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px 28px", position: "relative", zIndex: 1 }}>

        {/* Top section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "start", marginBottom: 36 }}>

          {/* Brand + tagline */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <img
                src={logo}
                alt="SeribuCerita"
                style={{
                  width: 38, height: 38, borderRadius: 12, objectFit: "cover",
                  border: `2px solid rgba(115,156,175,0.35)`,
                  boxShadow: `0 4px 16px rgba(115,156,175,0.20)`,
                }}
              />
              <span style={{
                fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700,
                color: "white", letterSpacing: "-0.3px",
              }}>
                Seribu<span style={{ color: C }}>Cerita</span>
              </span>
            </div>

            <p style={{
              fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 500,
              color: "rgba(255,255,255,0.45)", lineHeight: "20px", maxWidth: 320,
              margin: "0 0 20px",
            }}>
              Ruang digital yang aman untuk refleksi diri, memahami emosi, dan mendapat dukungan psikologis berbasis AI.
            </p>

            {/* Emotion tags */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                { emoji: "😊", label: "Bahagia" },
                { emoji: "😐", label: "Netral" },
                { emoji: "😢", label: "Sedih" },
                { emoji: "😰", label: "Cemas" },
                { emoji: "😠", label: "Marah" },
              ].map(({ emoji, label }) => (
                <span key={label} style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "4px 10px", borderRadius: 999,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 700,
                  color: "rgba(255,255,255,0.40)",
                }}>
                  {emoji} {label}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p style={{
              fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 800,
              color: "rgba(255,255,255,0.25)", letterSpacing: "1.2px",
              textTransform: "uppercase", marginBottom: 14,
            }}>
              NAVIGASI
            </p>
            <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { to: "/",        label: "Beranda"},
                { to: "/edukasi", label: "Artikel"},
                { to: "/chatbot", label: "Curhat"},
                { to: "/tentang", label: "Tentang"},
              ].map(({ to, label, emoji }) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 600,
                    color: "rgba(255,255,255,0.50)", textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = C}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.50)"}
                >
                  <span style={{ fontSize: 13 }}>{emoji}</span>
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: "linear-gradient(to right, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent)",
          marginBottom: 20,
        }} />

        {/* Bottom bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 8,
        }}>
          <p style={{
            fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 500,
            color: "rgba(255,255,255,0.25)", margin: 0,
          }}>
            © 2026 SeribuCerita · Dibuat dengan 💙 oleh Tim CC26-PSU212
          </p>
          <p style={{
            fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 500,
            color: "rgba(255,255,255,0.20)", margin: 0,
          }}>
            Coding Camp 2026 × DBS Foundation
          </p>
        </div>
      </div>
    </footer>
  );
}
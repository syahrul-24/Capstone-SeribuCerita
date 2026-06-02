import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const C = "#739caf";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = () => setDropdownOpen(false);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [dropdownOpen]);

  const navLinks = [
    { to: "/", label: "Beranda" },
    { to: "/edukasi", label: "Artikel" },
    { to: "/chatbot", label: "Curhat" },
    { to: "/tentang", label: "Tentang" },
  ];

  const userLinks = [
    { to: "/jurnal", label: "Jurnal" },
    { to: "/faskes", label: "Faskes" },
    { to: "/highlights", label: "Highlights" },
    { to: "/riwayat", label: "Riwayat Chat" },
    { to: "/profil", label: "Profil" },
  ];

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,248,240,0.97)" : "rgba(255,248,240,0.90)",
        backdropFilter: "blur(16px)",
        borderBottom: scrolled ? `2px solid rgba(115,156,175,0.15)` : "2px solid transparent",
        boxShadow: scrolled ? `0 4px 24px rgba(115,156,175,0.10)` : "none",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
          <img
            src={logo}
            alt="SeribuCerita Logo"
            className="w-10 h-10 rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
            style={{ border: `2px solid ${C}` }}
          />
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "#1A1A2E" }}>
            Seribu<span style={{ color: C }}>Cerita</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 p-1.5 rounded-2xl" style={{ background: "rgba(26,26,46,0.05)" }}>
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all duration-200"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: isActive(l.to) ? 800 : 600,
                background: isActive(l.to) ? "white" : "transparent",
                color: isActive(l.to) ? C : "#3D3D5C",
                boxShadow: isActive(l.to) ? `0 2px 12px rgba(115,156,175,0.18)` : "none",
                textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 16px 8px 8px", borderRadius: 999,
                  border: `2px solid rgba(115,156,175,0.25)`,
                  background: "white", cursor: "pointer",
                  boxShadow: "0 2px 12px rgba(115,156,175,0.12)",
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: `linear-gradient(135deg,${C},#4a7c8f)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 800, fontSize: 14,
                }}>
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 14, color: "#1A1A2E" }}>
                  {user.name?.split(" ")[0]}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7B7B9A" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {dropdownOpen && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  background: "white", borderRadius: 20, padding: "8px",
                  boxShadow: "0 16px 48px rgba(26,26,46,0.15)",
                  border: "2px solid rgba(115,156,175,0.12)",
                  minWidth: 200, zIndex: 100,
                }}>
                  {userLinks.map((l) => (
                    <Link key={l.to} to={l.to}
                      style={{
                        display: "block", padding: "10px 14px", borderRadius: 12,
                        fontFamily: "'Nunito',sans-serif", fontWeight: 600, fontSize: 14,
                        color: "#1A1A2E", textDecoration: "none",
                        background: isActive(l.to) ? `rgba(115,156,175,0.10)` : "transparent",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(115,156,175,0.08)"}
                      onMouseLeave={e => e.currentTarget.style.background = isActive(l.to) ? "rgba(115,156,175,0.10)" : "transparent"}
                    >
                      {l.label}
                    </Link>
                  ))}
                  <div style={{ borderTop: "1.5px solid rgba(115,156,175,0.12)", margin: "6px 4px" }} />
                  <button onClick={handleLogout}
                    style={{
                      display: "block", width: "100%", padding: "10px 14px", borderRadius: 12,
                      fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 14,
                      color: "#ef4444", background: "none", border: "none",
                      cursor: "pointer", textAlign: "left",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.07)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    🚪 Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login"
              style={{
                padding: "10px 22px", fontSize: 14,
                background: `linear-gradient(135deg,${C},#4a7c8f)`,
                boxShadow: `0 8px 24px rgba(115,156,175,0.35)`,
                borderRadius: 999, textDecoration: "none",
                color: "white", fontWeight: 700,
                fontFamily: "'Nunito',sans-serif",
              }}
            >
              Masuk / Daftar
            </Link>
          )}
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: mobileOpen ? `rgba(115,156,175,0.12)` : "transparent", border: "none", cursor: "pointer" }}
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <div className="w-5 h-0.5 rounded-full" style={{ background: "#1A1A2E" }} />
            <div className="w-5 h-0.5 rounded-full" style={{ background: "#1A1A2E" }} />
            <div className="w-5 h-0.5 rounded-full" style={{ background: "#1A1A2E" }} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t-2" style={{ borderColor: `rgba(115,156,175,0.12)`, background: "rgba(255,248,240,0.98)" }}>
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm"
                style={{
                  fontFamily: "'Nunito',sans-serif", fontWeight: isActive(l.to) ? 800 : 600,
                  background: isActive(l.to) ? `rgba(115,156,175,0.10)` : "transparent",
                  color: isActive(l.to) ? C : "#1A1A2E", textDecoration: "none",
                }}
              >
                {l.label}
              </Link>
            ))}

            <div className="pt-2 border-t-2 mt-2" style={{ borderColor: `rgba(115,156,175,0.15)` }}>
              {user ? (
                <>
                  <p style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 12, color: "#7B7B9A", padding: "8px 16px 4px" }}>
                    Halo, {user.name?.split(" ")[0]}! 👋
                  </p>
                  {userLinks.map((l) => (
                    <Link key={l.to} to={l.to}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm"
                      style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 600, color: "#1A1A2E", textDecoration: "none", display: "flex" }}
                    >
                      {l.label}
                    </Link>
                  ))}
                  <button onClick={handleLogout}
                    style={{
                      width: "100%", marginTop: 4, padding: "12px 16px", borderRadius: 16,
                      border: "2px solid rgba(239,68,68,0.25)", background: "white",
                      color: "#ef4444", fontFamily: "'Nunito',sans-serif", fontWeight: 700,
                      fontSize: 14, cursor: "pointer", textAlign: "center",
                    }}
                  >
                    🚪 Keluar
                  </button>
                </>
              ) : (
                <Link to="/login"
                  style={{
                    display: "block", borderRadius: 16,
                    background: `linear-gradient(135deg,${C},#4a7c8f)`,
                    color: "white", padding: "12px 16px",
                    textDecoration: "none", fontWeight: 700,
                    fontFamily: "'Nunito',sans-serif", textAlign: "center",
                  }}
                >
                  Masuk / Daftar →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

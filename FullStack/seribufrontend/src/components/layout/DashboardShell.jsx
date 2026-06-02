import { useState, useEffect } from "react";
import { IconMenu, IconHome } from "../icons/index.jsx";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import logo from "../../assets/logo.png";

export default function DashboardShell({ user, onLogout, children, mainClassName = "overflow-y-auto" }) {
  // On desktop default open, on mobile default closed
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  // Track if we're on mobile
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && !sidebarOpen) setSidebarOpen(true);
      if (mobile && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const showOverlay = isMobile && sidebarOpen;

  return (
    <div style={{ display:"flex", height:"100dvh", background:"#F6F8FB", overflow:"hidden" }}>
      {showOverlay && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:30 }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar: fixed on mobile, inline on desktop */}
      <div style={{
        position: isMobile ? "fixed" : "relative",
        insetBlockStart: isMobile ? 0 : "auto",
        left: isMobile ? 0 : "auto",
        height: isMobile ? "100dvh" : "auto",
        zIndex: isMobile ? 40 : "auto",
        transform: isMobile
          ? (sidebarOpen ? "translateX(0)" : "translateX(-100%)")
          : "none",
        transition: "transform 0.3s ease, width 0.3s ease",
        // Desktop: collapse sidebar by hiding it with width 0
        width: (!isMobile && !sidebarOpen) ? 0 : undefined,
        overflow: (!isMobile && !sidebarOpen) ? "hidden" : undefined,
        flexShrink: 0,
      }}>
        <Sidebar user={user} onLogout={onLogout} onClose={() => setSidebarOpen(false)} />
      </div>

      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, minHeight:0 }}>
        <div style={{ flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", background:"white", borderBottom:"1px solid #EEF0F5" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {/* Toggle button: visible on all screen sizes */}
            <button onClick={() => setSidebarOpen(v => !v)}
              title={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
              style={{ width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:10, background:"#F0F4FF", border:"none", cursor:"pointer", flexShrink:0 }}>
              <IconMenu size={16} color="#415f83" />
            </button>

            {/* Brand name on mobile */}
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <img src={logo} alt="SeribuCerita" style={{ width:24, height:24, borderRadius:7, objectFit:"cover", flexShrink:0 }} />
              <span style={{ fontWeight:600, fontSize:13, color:"#1A2840", fontFamily:"'Nunito',sans-serif" }}>Seribu Cerita</span>
            </div>
          </div>

          <Link to="/"
            style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:999, textDecoration:"none", fontSize:13, fontWeight:700, fontFamily:"'Nunito',sans-serif",
              color:"#415f83", background:"#EEF2FA", border:"1.5px solid rgba(65,95,131,0.15)", transition:"all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#415f83"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#EEF2FA"; e.currentTarget.style.color = "#415f83"; }}>
            <IconHome size={13} />
            Beranda
          </Link>
        </div>

        <main style={{ flex:1, minHeight:0, minWidth:0 }} className={mainClassName}>
          {children}
        </main>
      </div>
    </div>
  );
}

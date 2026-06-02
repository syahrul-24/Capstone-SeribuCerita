import { Link, useLocation } from "react-router-dom";
import { IconUser, IconBook, IconStar, IconMessage, IconLogOut, IconHeartPulse, IconClose, IconHistory } from "../icons/index.jsx";
import CustomAvatar, { DEFAULT_CONFIG } from "../avatars/CustomAvatar.jsx";
import logo from "../../assets/logo.png";

const NAV_ITEMS = [
  { label:"Profil",       href:"/profil",    icon:IconUser },
  { label:"Journal",      href:"/jurnal",    icon:IconBook },
  { label:"Highlights",   href:"/highlights",icon:IconStar },
  { label:"Chat",         href:"/chatbot",   icon:IconMessage, exact:true },
  { label:"Riwayat Chat", href:"/riwayat",   icon:IconHistory },
  { label:"Cari Faskes",  href:"/faskes",    icon:IconHeartPulse },
];

const QUOTES = [
  "Perasaanmu valid. 🌱",
  "Satu langkah kecil itu cukup.",
  "Kamu tidak sendirian. 🫂",
  "Istirahat itu perlu. 🍃",
];

export default function Sidebar({ user, onLogout, onClose }) {
  const location = useLocation();

  const quote = QUOTES[new Date().getDay() % QUOTES.length];

  const isActive = (href, exact) =>
    exact ? location.pathname === href : location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <aside style={{ display:"flex", flexDirection:"column", height:"100dvh", width:252, background:"white", borderRight:"1px solid #EEF0F5", flexShrink:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"20px 24px", borderBottom:"1px solid #F0F2F8" }}>
        <img src={logo} alt="SeribuCerita" style={{ width:32, height:32, borderRadius:10, objectFit:"cover", flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:600, fontSize:14, color:"#1A2840", margin:0, fontFamily:"'Nunito',sans-serif" }}>Seribu Cerita</p>
          <p style={{ fontSize:10, color:"#A8B4C8", margin:0, fontFamily:"'Nunito',sans-serif" }}>Ruang ceritamu</p>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:8, background:"#F0F4FF", border:"none", cursor:"pointer" }}>
            <IconClose size={14} color="#415f83" />
          </button>
        )}
      </div>

      <nav style={{ flex:1, padding:"20px 12px 8px", overflowY:"auto" }}>
        <p style={{ fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", color:"#C2CAD8", padding:"0 12px", marginBottom:12, fontFamily:"'Nunito',sans-serif" }}>Menu</p>
        {NAV_ITEMS.map(({ label, href, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} to={href} onClick={onClose}
              style={{
                display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:12,
                marginBottom:2, textDecoration:"none", cursor:"pointer",
                background: active ? "#F0F4FF" : "transparent",
                transition:"background 0.12s",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#F8F9FC"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              {active && (
                <div style={{ position:"absolute", left:0, top:6, bottom:6, width:3, borderRadius:2, background:"#E596B2" }} />
              )}
              <Icon size={16} color={active ? "#415f83" : "#B0BBC8"} />
              <span style={{ fontSize:14, fontWeight:500, color: active ? "#415f83" : "#8A96A8", fontFamily:"'Nunito',sans-serif" }}>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ margin:"0 12px 12px", padding:"12px 16px", borderRadius:16, background:"#F8F9FC", border:"1px solid #EEF0F5" }}>
        <p style={{ fontSize:11, color:"#9BAABB", lineHeight:"1.5", margin:0, fontFamily:"'Nunito',sans-serif" }}>✨ {quote}</p>
      </div>

      <div style={{ padding:"0 12px 16px", borderTop:"1px solid #F0F2F8", paddingTop:12 }}>
        <div style={{ padding:12, borderRadius:16, background:"#F8F9FC", border:"1px solid #EEF0F5" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <div style={{ width:40, height:40, borderRadius:12, overflow:"hidden", background:"#EEF2F8", outline:"2px solid #E0E8F4", flexShrink:0 }}>
              <CustomAvatar size={40} config={(() => { if (!user?.avatar_config) return DEFAULT_CONFIG; try { return typeof user.avatar_config === "string" ? JSON.parse(user.avatar_config) : user.avatar_config; } catch { return DEFAULT_CONFIG; } })()} />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:14, fontWeight:600, color:"#1A2840", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:"'Nunito',sans-serif" }}>
                {user?.name || "Pengguna"}
              </p>
              <p style={{ fontSize:11, color:"#A8B4C8", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:"'Nunito',sans-serif" }}>
                {user?.email || ""}
              </p>
            </div>
          </div>
          <button onClick={onLogout}
            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontSize:12, fontWeight:500, padding:"8px 12px", borderRadius:12, background:"white", color:"#B0BBC8", border:"1px solid #EEF0F5", cursor:"pointer", fontFamily:"'Nunito',sans-serif", transition:"all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#E596B2"; e.currentTarget.style.borderColor = "#F5C8DA"; e.currentTarget.style.background = "#FEF8FB"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#B0BBC8"; e.currentTarget.style.borderColor = "#EEF0F5"; e.currentTarget.style.background = "white"; }}
          >
            <IconLogOut size={12} /> Keluar
          </button>
        </div>
      </div>
    </aside>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IconStar, IconTrash, IconExternalLink, IconSearch } from "../components/icons/index.jsx";
import { useAuth } from "../context/AuthContext";
import { fetchHighlights, deleteHighlight } from "../lib/api";
import DashboardShell from "../components/layout/DashboardShell";
import { PageLoader } from "../components/ui/LoadingSpinner";

const COLOR_MAP = {
  "#fef08a":"yellow", "#bbf7d0":"green", "#bfdbfe":"blue", "#fbcfe8":"pink",
  "#A78BFA":"purple", "#FCA5A5":"red",
};
const BORDER_MAP = {
  "#fef08a":"#facc15", "#bbf7d0":"#4ade80", "#bfdbfe":"#60a5fa",
  "#fbcfe8":"#f472b6", "#A78BFA":"#7c3aed", "#FCA5A5":"#ef4444",
};
function getBorder(hex) { return BORDER_MAP[hex] || "#739caf"; }
function getAlpha(hex) { return hex ? hex + "25" : "#A78BFA25"; }

function HighlightCard({ highlight, onDelete }) {
  const [del, setDel] = useState(false);
  return (
    <div style={{ background:"white", borderRadius:20, padding:"18px 20px", border:`1px solid ${getAlpha(highlight.color)}`, borderLeft:`4px solid ${getBorder(highlight.color)}`, boxShadow:"0 4px 16px rgba(26,26,46,0.05)", transition:"box-shadow 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 28px rgba(26,26,46,0.09)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,26,46,0.05)"}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
        <div style={{ flex:1 }}>
          {highlight.article_title && (
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
              <div style={{ width:18, height:18, borderRadius:6, background:`${getBorder(highlight.color)}20`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <IconExternalLink size={9} color={getBorder(highlight.color)} />
              </div>
              <span style={{ fontSize:11, fontWeight:600, color:getBorder(highlight.color), fontFamily:"'Nunito',sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:240 }}>
                {highlight.article_title}
              </span>
              {highlight.article_id && (
                <Link to={`/artikel/${highlight.article_id}`} style={{ fontSize:10, color:"#A8B4C8", marginLeft:4 }} title="Buka artikel">→</Link>
              )}
            </div>
          )}
          <p style={{ fontSize:14, color:"#2A3A4A", lineHeight:"1.65", fontStyle:"italic", margin:0, fontFamily:"'Nunito',sans-serif" }}>
            "{highlight.text}"
          </p>
          <p style={{ fontSize:11, color:"#B8C4D0", marginTop:10, fontFamily:"'Nunito',sans-serif" }}>
            {highlight.created_at ? new Date(highlight.created_at).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"}) : ""}
          </p>
        </div>
        <button onClick={() => { setDel(true); setTimeout(() => { onDelete(highlight.id); }, 200); }}
          style={{ flexShrink:0, width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:10, border:"none", background:del?"#FEE2E2":"#F4F6FA", cursor:"pointer", transition:"all 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#FEE2E2"}
          onMouseLeave={e => e.currentTarget.style.background = del ? "#FEE2E2" : "#F4F6FA"}>
          <IconTrash size={13} style={{ color:del?"#ef4444":"#C0CCD8" }} />
        </button>
      </div>
    </div>
  );
}

export default function Highlights() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [toast, setToast]           = useState("");

  useEffect(() => { if (!user) navigate("/login"); }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchHighlights()
      .then(d => setHighlights(d.highlights || d.data || []))
      .catch(() => setToast("Gagal memuat highlights"))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(""), 2500); return () => clearTimeout(t); }
  }, [toast]);

  async function handleDelete(id) {
    try {
      await deleteHighlight(id);
      setHighlights(prev => prev.filter(h => h.id !== id));
      setToast("Highlight dihapus");
    } catch { setToast("Gagal menghapus highlight"); }
  }

  function handleLogout() { logout(); navigate("/"); }

  if (loading) return <PageLoader />;

  const filtered = search.trim()
    ? highlights.filter(h => h.text?.toLowerCase().includes(search.toLowerCase()) || h.article_title?.toLowerCase().includes(search.toLowerCase()))
    : highlights;

  return (
    <DashboardShell user={user} onLogout={handleLogout}>
      {toast && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", zIndex:9999, background:"#1A2840", color:"white", padding:"10px 20px", borderRadius:999, fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700, boxShadow:"0 8px 32px rgba(26,26,46,0.30)", whiteSpace:"nowrap" }}>{toast}</div>
      )}
      <div style={{ padding:24 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:700, color:"#1A2840", display:"flex", alignItems:"center", gap:10, margin:"0 0 4px", fontFamily:"'Nunito',sans-serif" }}>
              <div style={{ width:36, height:36, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#5BA970,#7EC492)" }}>
                <IconStar size={16} color="white" fill="white" />
              </div>
              Highlights Saya
            </h1>
            <p style={{ fontSize:14, color:"#A8B4C8", margin:0, fontFamily:"'Nunito',sans-serif" }}>{highlights.length} kutipan tersimpan</p>
          </div>
        </div>

        {highlights.length > 0 && (
          <div style={{ position:"relative", marginBottom:20, maxWidth:400 }}>
            <IconSearch size={14} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#C0CCD8" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari highlight..." style={{ width:"100%", padding:"10px 16px 10px 40px", borderRadius:12, border:"1px solid #EEF0F8", fontSize:14, outline:"none", background:"white", fontFamily:"'Nunito',sans-serif", color:"#2A3A4A", boxSizing:"border-box" }} />
          </div>
        )}

        {highlights.length === 0 ? (
          <div style={{ background:"white", borderRadius:16, border:"1px solid #EEF0F8", padding:"60px 24px", textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>✨</div>
            <h3 style={{ fontSize:18, fontWeight:600, color:"#1A2840", marginBottom:8, fontFamily:"'Nunito',sans-serif" }}>Belum ada highlights</h3>
            <p style={{ fontSize:14, color:"#A8B4C8", maxWidth:280, margin:"0 auto 20px", fontFamily:"'Nunito',sans-serif" }}>Seleksi teks menarik dari artikel, lalu pilih warna untuk menyimpannya.</p>
            <Link to="/edukasi" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 24px", borderRadius:12, background:"#415f83", color:"white", textDecoration:"none", fontSize:14, fontWeight:600, fontFamily:"'Nunito',sans-serif" }}>
              Baca Artikel
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background:"white", borderRadius:16, border:"1px solid #EEF0F8", padding:"48px 24px", textAlign:"center" }}>
            <p style={{ fontSize:14, color:"#A8B4C8", fontFamily:"'Nunito',sans-serif" }}>Tidak ada hasil untuk "{search}"</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
            {filtered.map(h => <HighlightCard key={h.id} highlight={h} onDelete={handleDelete} />)}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

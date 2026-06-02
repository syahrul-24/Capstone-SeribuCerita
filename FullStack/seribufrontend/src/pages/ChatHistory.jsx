import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IconMessage, IconTrash, IconChevronRight, IconHistory, IconSearch, IconClock } from "../components/icons/index.jsx";
import { useAuth } from "../context/AuthContext";
import { fetchChatHistory, fetchChatConversation, deleteChatConversation } from "../lib/api";
import DashboardShell from "../components/layout/DashboardShell";
import { PageLoader } from "../components/ui/LoadingSpinner";

const EMOTION_COLORS = {
  happy:   { bg:"#EBF6EE", text:"#2D7A4F", label:"Senang",  emoji:"😊" },
  sad:     { bg:"#EFF5FF", text:"#2D4E8A", label:"Sedih",   emoji:"😢" },
  anxious: { bg:"#FFFBEB", text:"#7A6000", label:"Cemas",   emoji:"😰" },
  angry:   { bg:"#FFF0F5", text:"#9A3558", label:"Marah",   emoji:"😠" },
  neutral: { bg:"#F5F6F8", text:"#5A6472", label:"Netral",  emoji:"😐" },
  fear:    { bg:"#F5F0FF", text:"#6B3A9A", label:"Takut",   emoji:"😨" },
};

function fmt(d) {
  try {
    const dt = new Date(d);
    const now = new Date();
    const diff = (now - dt) / 1000;
    if (diff < 60) return "Baru saja";
    if (diff < 3600) return `${Math.floor(diff/60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff/3600)} jam lalu`;
    if (diff < 604800) return `${Math.floor(diff/86400)} hari lalu`;
    return dt.toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" });
  } catch { return d; }
}

function ConvoCard({ convo, onSelect, onDelete }) {
  const em = EMOTION_COLORS[convo.emotion] || EMOTION_COLORS.neutral;
  return (
    <div style={{ background:"white", borderRadius:16, border:"1px solid #EEF0F8", overflow:"hidden", transition:"box-shadow 0.2s", cursor:"pointer" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(65,95,131,0.09)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
      onClick={() => onSelect(convo)}>
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px" }}>
        <div style={{ width:40, height:40, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", background:em.bg, fontSize:18, flexShrink:0 }}>
          {em.emoji}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:14, fontWeight:600, color:"#1A2840", margin:"0 0 3px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:"'Nunito',sans-serif" }}>
            {convo.title || "Percakapan baru"}
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
            <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:999, background:em.bg, color:em.text, fontFamily:"'Nunito',sans-serif" }}>
              {em.label}
            </span>
            <span style={{ fontSize:11, color:"#C0CCD8", display:"flex", alignItems:"center", gap:3, fontFamily:"'Nunito',sans-serif" }}>
              <IconClock size={9} /> {fmt(convo.updated_at || convo.created_at)}
            </span>
            {convo.message_count > 0 && (
              <span style={{ fontSize:11, color:"#C0CCD8", fontFamily:"'Nunito',sans-serif" }}>
                · {convo.message_count} pesan
              </span>
            )}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
          <button onClick={e => { e.stopPropagation(); onDelete(convo.id); }}
            style={{ width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:8, border:"none", background:"#F4F6FA", cursor:"pointer", transition:"all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#FEE2E2"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#F4F6FA"; }}>
            <IconTrash size={12} color="#C0CCD8" />
          </button>
          <IconChevronRight size={14} color="#D0D8E4" />
        </div>
      </div>
    </div>
  );
}

function ConvoDetail({ convo, messages, onBack }) {
  const em = EMOTION_COLORS[convo.emotion] || EMOTION_COLORS.neutral;
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
<div style={{ display:"flex", alignItems:"center", gap:12, padding:"16px 20px", borderBottom:"1px solid #EEF0F8", flexShrink:0, background:"white" }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:4, fontSize:13, color:"#A8B4C8", background:"none", border:"none", cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>
          ← Kembali
        </button>
        <div style={{ width:1, height:16, background:"#EEF0F8" }} />
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:14, fontWeight:600, color:"#1A2840", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:"'Nunito',sans-serif" }}>
            {convo.title || "Percakapan"}
          </p>
          <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:999, background:em.bg, color:em.text, fontFamily:"'Nunito',sans-serif" }}>
            {em.emoji} {em.label}
          </span>
        </div>
        <Link to="/chatbot" style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:12, background:"#415f83", color:"white", textDecoration:"none", fontSize:12, fontWeight:600, flexShrink:0, fontFamily:"'Nunito',sans-serif" }}>
          <IconMessage size={12} /> Chat Lagi
        </Link>
      </div>
<div style={{ flex:1, overflowY:"auto", padding:"20px 20px 32px", display:"flex", flexDirection:"column", gap:12 }}>
        {messages.length === 0 ? (
          <p style={{ textAlign:"center", color:"#B8C4D0", fontSize:13, padding:"40px 0", fontFamily:"'Nunito',sans-serif" }}>Tidak ada pesan tersimpan</p>
        ) : messages.map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <div key={i} style={{ display:"flex", justifyContent:isUser?"flex-end":"flex-start" }}>
              <div style={{ maxWidth:"78%", padding:"10px 14px", borderRadius:isUser?"18px 18px 6px 18px":"18px 18px 18px 6px",
                background:isUser?"#415f83":"white",
                color:isUser?"white":"#2A3A4A",
                border:isUser?"none":"1px solid #EEF0F8",
                fontSize:13, lineHeight:"1.6", fontFamily:"'Nunito',sans-serif",
                boxShadow:isUser?"0 4px 12px rgba(65,95,131,0.20)":"0 2px 8px rgba(26,26,46,0.05)" }}>
                {msg.text}
                {msg.emotion && !isUser && (
                  <div style={{ marginTop:6, display:"flex", alignItems:"center", gap:4 }}>
                    <span style={{ fontSize:10, padding:"2px 8px", borderRadius:999,
                      background:(EMOTION_COLORS[msg.emotion]?.bg)||"#F5F6F8",
                      color:(EMOTION_COLORS[msg.emotion]?.text)||"#5A6472",
                      fontFamily:"'Nunito',sans-serif", fontWeight:600 }}>
                      {EMOTION_COLORS[msg.emotion]?.emoji} {EMOTION_COLORS[msg.emotion]?.label || msg.emotion}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ChatHistory() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [convos, setConvos]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [messages, setMessages]   = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [search, setSearch]       = useState("");
  const [toast, setToast]         = useState("");

  useEffect(() => { if (!user) navigate("/login"); }, [user]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 2500); return () => clearTimeout(t); } }, [toast]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchChatHistory(user.id)
      .then(d => setConvos(d.data || []))
      .catch(() => setToast("Gagal memuat riwayat chat"))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleSelect(convo) {
    setSelected(convo);
    setLoadingMsgs(true);
    try {
      const d = await fetchChatConversation(user.id, convo.id);
      setMessages(d.data?.messages || []);
    } catch { setMessages([]); }
    finally { setLoadingMsgs(false); }
  }

  async function handleDelete(id) {
    try {
      await deleteChatConversation(user.id, id);
      setConvos(prev => prev.filter(c => c.id !== id));
      if (selected?.id === id) { setSelected(null); setMessages([]); }
      setToast("Percakapan dihapus");
    } catch { setToast("Gagal menghapus percakapan"); }
  }

  function handleLogout() { logout(); navigate("/"); }

  if (loading) return <PageLoader />;

  const filtered = search.trim()
    ? convos.filter(c => (c.title||"").toLowerCase().includes(search.toLowerCase()))
    : convos;

  return (
    <DashboardShell user={user} onLogout={handleLogout} mainClassName="overflow-hidden">
      {toast && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", zIndex:9999, background:"#1A2840", color:"white", padding:"10px 20px", borderRadius:999, fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700, boxShadow:"0 8px 32px rgba(26,26,46,0.30)", whiteSpace:"nowrap" }}>{toast}</div>
      )}
      <div style={{ display:"flex", height:"100%", overflow:"hidden" }}>
<div style={{ width:selected?"320px":"100%", maxWidth:selected?"320px":"100%", borderRight:selected?"1px solid #EEF0F8":"none", display:"flex", flexDirection:"column", overflow:"hidden", background:"white", transition:"width 0.2s" }} className={selected ? "hidden md:flex" : ""}>
          <div style={{ padding:"20px 20px 12px", borderBottom:"1px solid #EEF0F8", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ width:36, height:36, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#415f83,#6B85A8)" }}>
                <IconHistory size={16} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize:16, fontWeight:700, color:"#1A2840", margin:0, fontFamily:"'Nunito',sans-serif" }}>Riwayat Chat</h1>
                <p style={{ fontSize:11, color:"#A8B4C8", margin:0, fontFamily:"'Nunito',sans-serif" }}>{convos.length} percakapan</p>
              </div>
            </div>
            {convos.length > 0 && (
              <div style={{ position:"relative" }}>
                <IconSearch size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#C0CCD8" }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari percakapan..."
                  style={{ width:"100%", padding:"9px 14px 9px 36px", borderRadius:12, border:"1px solid #EEF0F8", fontSize:13, outline:"none", background:"#F8FAFF", fontFamily:"'Nunito',sans-serif", boxSizing:"border-box" }} />
              </div>
            )}
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:12, display:"flex", flexDirection:"column", gap:8 }}>
            {convos.length === 0 ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flex:1, gap:12, padding:"40px 24px", textAlign:"center" }}>
                <IconMessage size={40} color="#D0D8E4" />
                <h3 style={{ fontSize:16, fontWeight:600, color:"#8A96A8", margin:0, fontFamily:"'Nunito',sans-serif" }}>Belum ada riwayat chat</h3>
                <p style={{ fontSize:13, color:"#B8C4D0", margin:0, fontFamily:"'Nunito',sans-serif" }}>Mulai curhat dengan AI dan riwayatmu akan muncul di sini.</p>
                <Link to="/chatbot" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:12, background:"#415f83", color:"white", textDecoration:"none", fontSize:13, fontWeight:600, fontFamily:"'Nunito',sans-serif" }}>
                  <IconMessage size={14} /> Mulai Chat
                </Link>
              </div>
            ) : filtered.length === 0 ? (
              <p style={{ textAlign:"center", color:"#B8C4D0", fontSize:13, padding:"32px 0", fontFamily:"'Nunito',sans-serif" }}>Tidak ada hasil untuk "{search}"</p>
            ) : filtered.map(c => (
              <ConvoCard key={c.id} convo={c} onSelect={handleSelect} onDelete={handleDelete} />
            ))}
          </div>
        </div>
{selected && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:"#F8FAFF" }}>
            {loadingMsgs ? (
              <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ width:24, height:24, border:"2px solid #415f83", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : (
              <ConvoDetail convo={selected} messages={messages} onBack={() => { setSelected(null); setMessages([]); }} />
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

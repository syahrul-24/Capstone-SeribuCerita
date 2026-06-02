import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconEdit, IconBook, IconMessage, IconStar, IconCamera, IconSave, IconClose, IconChevronRight, IconClock, IconHeartPulse } from "../components/icons/index.jsx";
import { useAuth } from "../context/AuthContext";
import { fetchProfile, updateProfile, fetchJournals, fetchHighlights, fetchChatHistory } from "../lib/api";
import DashboardShell from "../components/layout/DashboardShell";
import Modal from "../components/ui/Modal";
import AvatarBuilder from "../components/features/AvatarBuilder";
import CustomAvatar, { DEFAULT_CONFIG } from "../components/avatars/CustomAvatar";
import { getMoodById } from "../components/features/MoodSelector";
import { PageLoader } from "../components/ui/LoadingSpinner";

const parseConfig = (user) => {
  if (!user) return DEFAULT_CONFIG;
  if (user.avatar_config) {
    try { return typeof user.avatar_config === "string" ? JSON.parse(user.avatar_config) : user.avatar_config; }
    catch { return DEFAULT_CONFIG; }
  }
  return DEFAULT_CONFIG;
};

const MOOD_COLORS = {
  happy:   { bg:"#F0FAF4", text:"#2D7A4F", border:"#C2E8D0" },
  sad:     { bg:"#EFF5FF", text:"#2D4E8A", border:"#BDD0F5" },
  anxious: { bg:"#FFFBEB", text:"#7A6000", border:"#F5E090" },
  angry:   { bg:"#FFF0F5", text:"#9A3558", border:"#F5C0D4" },
  neutral: { bg:"#F5F6F8", text:"#5A6472", border:"#DCDFE4" },
};

function useCountUp(target, duration = 800) {
  const safe = typeof target === "number" && !isNaN(target) && target >= 0 ? target : 0;
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (safe === 0) { setCount(0); return; }
    let start = 0;
    const step = Math.max(1, Math.ceil(safe / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= safe) { setCount(safe); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [safe, duration]);
  return count;
}

function StatCard({ icon: Icon, value, label, color, lightBg, delay = 0 }) {
  const count = useCountUp(value);
  return (
    <div style={{ background:"white", borderRadius:16, padding:20, textAlign:"center", border:"1px solid #EEF0F8", transition:"box-shadow 0.2s", cursor:"default" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(65,95,131,0.08)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
      <div style={{ width:40, height:40, borderRadius:12, margin:"0 auto 12px", display:"flex", alignItems:"center", justifyContent:"center", background:lightBg }}>
        <Icon size={18} color={color} />
      </div>
      <p style={{ fontSize:24, fontWeight:700, color, margin:"0 0 2px", fontFamily:"'Nunito',sans-serif" }}>{count}</p>
      <p style={{ fontSize:12, color:"#A8B4C8", margin:0, fontWeight:500, fontFamily:"'Nunito',sans-serif" }}>{label}</p>
    </div>
  );
}

function formatDate(d) {
  try { return new Date(d).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" }); }
  catch { return d; }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

const MOOD_DIST = [
  { id:"happy",   emoji:"😊", label:"Senang", color:"#5BA970", track:"#EBF6EE" },
  { id:"sad",     emoji:"😢", label:"Sedih",  color:"#415f83", track:"#EEF2FA" },
  { id:"anxious", emoji:"😰", label:"Cemas",  color:"#A0861A", track:"#FFFBEB" },
  { id:"angry",   emoji:"😠", label:"Marah",  color:"#C97898", track:"#FFF0F5" },
  { id:"neutral", emoji:"😐", label:"Biasa",  color:"#6B7280", track:"#F5F6F8" },
];

function MoodDistribution({ journals }) {
  const total = journals.length;
  if (total === 0) return null;
  const counts = Object.fromEntries(MOOD_DIST.map(m => [m.id, 0]));
  for (const j of journals) {
    if (counts[j.mood] !== undefined) counts[j.mood]++;
    else counts.neutral++;
  }
  const sorted = [...MOOD_DIST].sort((a, b) => counts[b.id] - counts[a.id]);
  const max = Math.max(...Object.values(counts), 1);
  return (
    <div style={{ background:"white", borderRadius:16, padding:20, border:"1px solid #EEF0F8" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <h3 style={{ fontSize:14, fontWeight:600, color:"#1A2840", margin:0, fontFamily:"'Nunito',sans-serif" }}>Distribusi Mood</h3>
        <span style={{ fontSize:10, fontWeight:500, padding:"4px 10px", borderRadius:999, background:"#F0F4FA", color:"#6B85A8", fontFamily:"'Nunito',sans-serif" }}>{total} jurnal</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {sorted.map((m) => {
          const count = counts[m.id];
          const pct = Math.round((count / total) * 100);
          const bar = Math.round((count / max) * 100);
          return (
            <div key={m.id} style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:16, width:20, textAlign:"center", flexShrink:0 }}>{m.emoji}</span>
              <span style={{ fontSize:12, width:44, flexShrink:0, color:"#7A8FA8", fontFamily:"'Nunito',sans-serif" }}>{m.label}</span>
              <div style={{ flex:1, height:8, borderRadius:999, overflow:"hidden", background:m.track }}>
                <div style={{ height:"100%", borderRadius:999, background:m.color, width:`${bar}%`, transition:"width 0.7s ease" }} />
              </div>
              <span style={{ fontSize:12, width:32, textAlign:"right", fontWeight:600, color:count ? m.color : "#D0D8E4", flexShrink:0, fontFamily:"'Nunito',sans-serif" }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Profile() {
  const { user: authUser, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [user, setUser]         = useState(authUser);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [editForm, setEditForm] = useState({ name: authUser?.name || "", bio: authUser?.bio || "" });
  const [saving, setSaving]     = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [savingAvatar, setSavingAvatar]       = useState(false);
  const [stats, setStats]               = useState({ journals: 0, chats: 0, highlights: 0 });
  const [recentJournals, setRecentJournals] = useState([]);
  const [allJournals, setAllJournals]       = useState([]);
  const [recentHighlights, setRecentHighlights] = useState([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!authUser) { navigate("/login"); return; }
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [profileRes, journalsRes, highlightsRes, chatsRes] = await Promise.allSettled([
        fetchProfile(), fetchJournals(), fetchHighlights(),
        authUser?.id ? fetchChatHistory(authUser.id) : Promise.resolve({ data: [] }),
      ]);
      if (profileRes.status === "fulfilled") {
        const u = profileRes.value.user || profileRes.value;
        setUser(u); updateUser(u);
        setEditForm({ name: u.name || "", bio: u.bio || "" });
      }
      const journals   = journalsRes.status   === "fulfilled" ? (journalsRes.value.journals   || journalsRes.value.data || []) : [];
      const highlights = highlightsRes.status === "fulfilled" ? (highlightsRes.value.highlights || highlightsRes.value.data || []) : [];
      const chats      = chatsRes.status      === "fulfilled" ? (chatsRes.value.data || []) : [];
      setStats({ journals: journals.length, chats: chats.length, highlights: highlights.length });
      setRecentJournals(journals.slice(0, 3));
      setAllJournals(journals);
      setRecentHighlights(highlights.slice(0, 3));
    } catch {}
    finally { setLoading(false); }
  }

  async function handleSaveProfile() {
    if (!editForm.name.trim()) { setToast("Nama tidak boleh kosong"); return; }
    setSaving(true);
    try {
      const res = await updateProfile({ name: editForm.name.trim(), bio: editForm.bio });
      const u = res.user || res;
      setUser(u); updateUser(u); setEditing(false);
      setToast("Profil diperbarui! ✨");
    } catch { setToast("Gagal memperbarui profil"); }
    finally { setSaving(false); }
  }

  async function handleSaveAvatar(newConfig) {
    setSavingAvatar(true);
    try {
      const res = await updateProfile({ avatar_config: JSON.stringify(newConfig) });
      const u = res.user || res;
      setUser(u); updateUser(u);
      setAvatarModalOpen(false);
      setToast("Avatar diubah! ✨");
    } catch { setToast("Gagal mengubah avatar"); }
    finally { setSavingAvatar(false); }
  }

  function handleLogout() { logout(); navigate("/"); }

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(""), 2500); return () => clearTimeout(t); }
  }, [toast]);

  if (loading) return <PageLoader />;
  const avatarConfig = parseConfig(user);

  return (
    <DashboardShell user={user} onLogout={handleLogout}>
      {toast && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", zIndex:9999, background:"#1A2840", color:"white", padding:"10px 20px", borderRadius:999, fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700, boxShadow:"0 8px 32px rgba(26,26,46,0.30)", whiteSpace:"nowrap" }}>
          {toast}
        </div>
      )}

      <div style={{ padding:"24px", overflowY:"auto", height:"100%", display:"flex", flexDirection:"column", gap:16 }}>
<div style={{ background:"white", borderRadius:24, overflow:"hidden", border:"1px solid #EEF0F8" }}>
          <div style={{ height:6, background:"linear-gradient(90deg,#E596B2,#415f83,#5BA970)" }} />
          <div style={{ display:"flex", flexDirection:"row", alignItems:"flex-start", gap:20, padding:24, flexWrap:"wrap" }}>
<div style={{ position:"relative", flexShrink:0 }}>
              <div style={{ width:80, height:80, borderRadius:16, overflow:"hidden", outline:"3px solid #EEF0F8", background:"#F0F4FA" }}>
                <CustomAvatar size={80} config={avatarConfig} />
              </div>
              <button onClick={() => setAvatarModalOpen(true)}
                style={{ position:"absolute", bottom:-6, right:-6, width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background:"#415f83", border:"none", cursor:"pointer", boxShadow:"0 2px 8px rgba(65,95,131,0.3)" }}>
                <IconCamera size={12} color="white" />
              </button>
            </div>
<div style={{ flex:1, minWidth:200 }}>
              <p style={{ fontSize:12, fontWeight:500, color:"#A8B4C8", margin:"0 0 4px", fontFamily:"'Nunito',sans-serif" }}>{getGreeting()} 👋</p>
              {editing ? (
                <div style={{ display:"flex", flexDirection:"column", gap:8, maxWidth:340 }}>
                  <input value={editForm.name} onChange={e => setEditForm(f => ({...f, name: e.target.value}))} placeholder="Nama kamu"
                    style={{ padding:"8px 12px", borderRadius:12, border:"1.5px solid #D0DCEE", fontSize:16, fontWeight:600, outline:"none", fontFamily:"'Nunito',sans-serif", color:"#1A2840", background:"#F8FAFF" }} />
                  <textarea value={editForm.bio} onChange={e => setEditForm(f => ({...f, bio: e.target.value}))} rows={2} placeholder="Bio singkat..."
                    style={{ padding:"8px 12px", borderRadius:12, border:"1.5px solid #D0DCEE", fontSize:14, outline:"none", resize:"none", fontFamily:"'Nunito',sans-serif", color:"#6B7A8A", background:"#F8FAFF" }} />
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={handleSaveProfile} disabled={saving}
                      style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:12, background:"#415f83", color:"white", border:"none", cursor:"pointer", fontSize:13, fontWeight:500, fontFamily:"'Nunito',sans-serif", opacity:saving?0.7:1 }}>
                      <IconSave size={13} /> {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                    <button onClick={() => { setEditing(false); setEditForm({ name: user?.name||"", bio: user?.bio||"" }); }}
                      style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:12, border:"1px solid #EEF0F8", color:"#A8B4C8", background:"white", cursor:"pointer", fontSize:13, fontWeight:500, fontFamily:"'Nunito',sans-serif" }}>
                      <IconClose size={13} /> Batal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 style={{ fontSize:20, fontWeight:700, color:"#1A2840", margin:"0 0 2px", fontFamily:"'Nunito',sans-serif" }}>{user?.name}</h1>
                  <p style={{ fontSize:13, color:"#A8B4C8", margin:"0 0 6px", fontFamily:"'Nunito',sans-serif" }}>{user?.email}</p>
                  {user?.bio
                    ? <p style={{ fontSize:14, color:"#6B7A8A", maxWidth:320, lineHeight:"1.5", margin:"0 0 12px", fontFamily:"'Nunito',sans-serif" }}>{user.bio}</p>
                    : <p style={{ fontSize:14, color:"#C8D0DC", fontStyle:"italic", margin:"0 0 12px", fontFamily:"'Nunito',sans-serif" }}>Tambahkan bio kamu...</p>
                  }
                  <button onClick={() => setEditing(true)}
                    style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:999, border:"1px solid #D0DCEE", color:"#6B85A8", background:"white", cursor:"pointer", fontSize:12, fontWeight:500, fontFamily:"'Nunito',sans-serif" }}>
                    <IconEdit size={11} /> Edit Profil
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
<div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:12 }}>
          <StatCard icon={IconBook}      value={stats.journals}   label="Jurnal ditulis" color="#415f83" lightBg="#EEF2FA" />
          <StatCard icon={IconStar}          value={stats.highlights} label="Highlight"      color="#5BA970" lightBg="#EBF6EE" />
          <StatCard icon={IconMessage} value={stats.chats}      label="Sesi curhat"    color="#E596B2" lightBg="#FEF0F5" />
        </div>
<button onClick={() => navigate("/faskes")}
          style={{ display:"flex", alignItems:"center", gap:12, background:"white", borderRadius:16, padding:"14px 20px", border:"1px solid #EEF0F8", cursor:"pointer", width:"100%", textAlign:"left", transition:"box-shadow 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(65,95,131,0.08)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
          <div style={{ width:36, height:36, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", background:"#EBF6EE", flexShrink:0 }}>
            <IconHeartPulse size={16} color={"#5BA970"} />
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:14, fontWeight:600, color:"#1A2840", margin:"0 0 2px", fontFamily:"'Nunito',sans-serif" }}>Cari Dokter & Faskes Terdekat</p>
            <p style={{ fontSize:12, color:"#A8B4C8", margin:0, fontFamily:"'Nunito',sans-serif" }}>Klinik, RS, psikiater, dan psikolog terdekat</p>
          </div>
          <IconChevronRight size={15} color={"#C8D0DC"} />
        </button>
<MoodDistribution journals={allJournals} />
<div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:12 }}>
<div style={{ background:"white", borderRadius:16, overflow:"hidden", border:"1px solid #EEF0F8" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"1px solid #F4F6FA" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <IconBook size={14} color={"#415f83"} />
                <span style={{ fontSize:14, fontWeight:600, color:"#1A2840", fontFamily:"'Nunito',sans-serif" }}>Jurnal Terbaru</span>
              </div>
              <button onClick={() => navigate("/jurnal")} style={{ fontSize:12, color:"#A8B4C8", display:"flex", alignItems:"center", gap:2, background:"none", border:"none", cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>
                Semua <IconChevronRight size={12} />
              </button>
            </div>
            <div style={{ padding:16 }}>
              {recentJournals.length === 0 ? (
                <p style={{ textAlign:"center", color:"#B8C4D0", fontSize:13, padding:"24px 0", fontFamily:"'Nunito',sans-serif" }}>Belum ada jurnal 📓</p>
              ) : recentJournals.map((j, i) => {
                const mood = getMoodById(j.mood);
                const mc = MOOD_COLORS[j.mood] || MOOD_COLORS.neutral;
                return (
                  <div key={j.id||i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:12, cursor:"pointer", transition:"background 0.12s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F8FAFF"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ width:32, height:32, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", background:mc.bg, border:`1px solid ${mc.border}`, fontSize:16, flexShrink:0 }}>{mood?.emoji}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:500, color:"#1A2840", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:"'Nunito',sans-serif" }}>
                        {j.title || j.content?.substring(0,36)+"…" || "Entri jurnal"}
                      </p>
                      <p style={{ fontSize:11, color:"#B8C4D0", margin:0, display:"flex", alignItems:"center", gap:4, fontFamily:"'Nunito',sans-serif" }}>
                        <IconClock size={9} /> {formatDate(j.created_at || j.date)}
                      </p>
                    </div>
                    <span style={{ fontSize:10, fontWeight:500, padding:"2px 8px", borderRadius:999, background:mc.bg, color:mc.text, flexShrink:0, fontFamily:"'Nunito',sans-serif" }}>{mood?.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
<div style={{ background:"white", borderRadius:16, overflow:"hidden", border:"1px solid #EEF0F8" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"1px solid #F4F6FA" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <IconStar size={14} color="#5BA970" />
                <span style={{ fontSize:14, fontWeight:600, color:"#1A2840", fontFamily:"'Nunito',sans-serif" }}>Highlights Terbaru</span>
              </div>
              <button onClick={() => navigate("/highlights")} style={{ fontSize:12, color:"#A8B4C8", display:"flex", alignItems:"center", gap:2, background:"none", border:"none", cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>
                Semua <IconChevronRight size={12} />
              </button>
            </div>
            <div style={{ padding:16 }}>
              {recentHighlights.length === 0 ? (
                <p style={{ textAlign:"center", color:"#B8C4D0", fontSize:13, padding:"24px 0", fontFamily:"'Nunito',sans-serif" }}>Belum ada highlight ✨</p>
              ) : recentHighlights.map((h, i) => (
                <div key={h.id||i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"8px 10px", borderRadius:12, marginBottom:6, borderLeft:`3px solid ${h.color||"#A78BFA"}`, background:`${h.color||"#A78BFA"}15` }}>
                  <p style={{ fontSize:12, color:"#374151", lineHeight:"1.5", fontStyle:"italic", margin:0, fontFamily:"'Nunito',sans-serif" }}>"{h.text?.substring(0,80)}{(h.text?.length||0)>80?"…":""}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={avatarModalOpen} onClose={() => setAvatarModalOpen(false)} title="Desain Avatarmu ✨" size="xl">
        <AvatarBuilder config={parseConfig(user)} onSave={handleSaveAvatar} onCancel={() => setAvatarModalOpen(false)} saving={savingAvatar} />
      </Modal>
    </DashboardShell>
  );
}

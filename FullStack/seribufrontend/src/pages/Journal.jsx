import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconPlus, IconBook, IconSave, IconLoader, IconChevronLeft, IconPen } from "../components/icons/index.jsx";
import { useAuth } from "../context/AuthContext";
import { fetchJournals, createJournal, updateJournal, deleteJournal } from "../lib/api";
import DashboardShell from "../components/layout/DashboardShell";
import JournalCard from "../components/features/JournalCard";
import { MOODS, getMoodById } from "../components/features/MoodSelector";
import { PageLoader } from "../components/ui/LoadingSpinner";

const MOOD_FILTERS = [
  { id:"all", label:"Semua"},
  ...MOODS.map(m => ({ id:m.id, label:m.label, emoji:m.emoji })),
];
const FILTER_ACTIVE = {
  all:"#415f83", happy:"#5BA970", sad:"#415f83",
  anxious:"#A0861A", angry:"#C97898", neutral:"#6B7280",
};

function JournalSection({ emoji, label, placeholder, value, onChange, accentColor }) {
  return (
    <div style={{ padding:"20px 24px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <span style={{ fontSize:18, lineHeight:1 }}>{emoji}</span>
        <span style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", color:"#B8C4D0", fontFamily:"'Nunito',sans-serif" }}>{label}</span>
      </div>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder}
        style={{ width:"100%", background:"transparent", border:"none", outline:"none", resize:"none", fontSize:14, lineHeight:"1.6", color:"#2A3A4A", fontFamily:"'Nunito',sans-serif", caretColor:accentColor, boxSizing:"border-box" }} />
    </div>
  );
}

export default function Journal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [journals, setJournals]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [view, setView]           = useState("list");
  const [editingJournal, setEditingJournal] = useState(null);
  const [moodFilter, setMoodFilter] = useState("all");
  const [mood, setMood]         = useState("neutral");
  const [title, setTitle]       = useState("");
  const [feeling, setFeeling]   = useState("");
  const [thinking, setThinking] = useState("");
  const [grateful, setGrateful] = useState("");
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState("");

  useEffect(() => { if (!user) navigate("/login"); }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchJournals()
      .then(d => setJournals(Array.isArray(d.journals || d) ? (d.journals || d).sort((a,b) => new Date(b.created_at||b.date) - new Date(a.created_at||a.date)) : []))
      .catch(() => setToast("Gagal memuat jurnal"))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(""), 2500); return () => clearTimeout(t); }
  }, [toast]);

  function resetForm() {
    setMood("neutral"); setTitle(""); setFeeling(""); setThinking(""); setGrateful(""); setEditingJournal(null);
  }

  function handleEdit(journal) {
    setEditingJournal(journal);
    setMood(journal.mood || "neutral");
    setTitle(journal.title || "");
    const raw = journal.content || "";
    const fm = raw.match(/Hari ini aku merasakan\.\.\.\n([\s\S]*?)(?=\n\nAku memikirkan|$)/);
    const tm = raw.match(/Aku memikirkan\.\.\.\n([\s\S]*?)(?=\n\nAku bersyukur|$)/);
    const gm = raw.match(/Aku bersyukur karena\.\.\.\n([\s\S]*?)$/);
    if (fm) {
      setFeeling((fm[1]||"").trim()); setThinking((tm?tm[1]:"").trim()); setGrateful((gm?gm[1]:"").trim());
    } else { setFeeling(raw); setThinking(""); setGrateful(""); }
    setView("compose");
  }

  async function handleSave() {
    const parts = [
      feeling.trim()  && `Hari ini aku merasakan...\n${feeling.trim()}`,
      thinking.trim() && `Aku memikirkan...\n${thinking.trim()}`,
      grateful.trim() && `Aku bersyukur karena...\n${grateful.trim()}`,
    ].filter(Boolean);
    if (!parts.length) { setToast("Isi setidaknya satu bagian jurnal"); return; }
    setSaving(true);
    try {
      const payload = { mood, title: title.trim(), content: parts.join("\n\n") };
      if (editingJournal) {
        const res = await updateJournal(editingJournal.id, payload);
        const updated = res.journal || res;
        setJournals(prev => prev.map(j => j.id === updated.id ? updated : j));
        setToast("Jurnal diperbarui!");
      } else {
        const res = await createJournal(payload);
        const created = res.journal || res;
        setJournals(prev => [created, ...prev]);
        setToast("Jurnal tersimpan! 🌱");
      }
      resetForm(); setView("list");
    } catch { setToast("Gagal menyimpan jurnal"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try { await deleteJournal(id); setJournals(prev => prev.filter(j => j.id !== id)); setToast("Jurnal dihapus"); }
    catch { setToast("Gagal menghapus jurnal"); }
  }

  function handleLogout() { logout(); navigate("/"); }

  if (loading) return <PageLoader />;

  const filteredJournals = moodFilter === "all" ? journals : journals.filter(j => j.mood === moodFilter);
  const selectedMoodData = getMoodById(mood);
  const wordCount = [feeling, thinking, grateful].join(" ").split(/\s+/).filter(Boolean).length;

  return (
    <DashboardShell user={user} onLogout={handleLogout}>
      {toast && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", zIndex:9999, background:"#1A2840", color:"white", padding:"10px 20px", borderRadius:999, fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700, boxShadow:"0 8px 32px rgba(26,26,46,0.30)", whiteSpace:"nowrap" }}>{toast}</div>
      )}
      <div style={{ padding:24 }}>
        {/* Header */}
        {view === "compose" ? (
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
            <button onClick={() => { resetForm(); setView("list"); }} style={{ display:"flex", alignItems:"center", gap:4, fontSize:14, color:"#A8B4C8", background:"none", border:"none", cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>
              <IconChevronLeft size={15} /> Kembali
            </button>
            <span style={{ color:"#E0E8F4" }}>|</span>
            <h1 style={{ fontSize:16, fontWeight:600, color:"#1A2840", margin:0, fontFamily:"'Nunito',sans-serif" }}>
              {editingJournal ? "✏️ Edit Jurnal" : "✍️ Tulis Jurnal Baru"}
            </h1>
          </div>
        ) : (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
            <div>
              <h1 style={{ fontSize:24, fontWeight:700, color:"#1A2840", display:"flex", alignItems:"center", gap:10, margin:"0 0 4px", fontFamily:"'Nunito',sans-serif" }}>
                <div style={{ width:36, height:36, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#415f83,#6B85A8)" }}>
                  <IconBook size={17} color="white" />
                </div>
                Mood Journal
              </h1>
              <p style={{ fontSize:14, color:"#A8B4C8", margin:0, fontFamily:"'Nunito',sans-serif" }}>{journals.length} entri tersimpan</p>
            </div>
            <button onClick={() => { resetForm(); setView("compose"); }}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:12, background:"#415f83", color:"white", border:"none", cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:"'Nunito',sans-serif" }}>
              <IconPen size={15} /> Tulis Cerita
            </button>
          </div>
        )}

        {view === "compose" && (
          <div style={{ maxWidth:680, display:"flex", flexDirection:"column", gap:16 }}>
            <p style={{ fontSize:12, fontWeight:500, color:"#A8B4C8", fontFamily:"'Nunito',sans-serif" }}>
              {new Date().toLocaleDateString("id-ID", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
            </p>

            {/* Mood selector */}
            <div style={{ background:"white", borderRadius:24, overflow:"hidden", border:"1px solid #EEF0F8" }}>
              <div style={{ height:4, background:`linear-gradient(90deg,${selectedMoodData.borderColor}66,${selectedMoodData.activeColor})` }} />
              <div style={{ padding:20 }}>
                <p style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", color:"#B8C4D0", marginBottom:16, fontFamily:"'Nunito',sans-serif" }}>Mood hari ini</p>
                <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
                  {MOODS.map(m => {
                    const isSel = mood === m.id;
                    return (
                      <button key={m.id} onClick={() => setMood(m.id)}
                        style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, padding:"12px 16px", borderRadius:16, border:`2px solid ${isSel ? m.borderColor : "#EEF0F8"}`, background:isSel ? m.color : "white", cursor:"pointer", flexShrink:0, transition:"all 0.15s" }}>
                        <span style={{ fontSize:24, lineHeight:1 }}>{m.emoji}</span>
                        <span style={{ fontSize:10, fontWeight:600, color:isSel ? m.textColor : "#B0BBC8", fontFamily:"'Nunito',sans-serif" }}>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop:16, display:"inline-flex", alignItems:"center", gap:8, padding:"8px 16px", borderRadius:16, background:selectedMoodData.color }}>
                  <span style={{ fontSize:16, lineHeight:1 }}>{selectedMoodData.emoji}</span>
                  <span style={{ fontSize:12, fontWeight:500, color:selectedMoodData.textColor, fontFamily:"'Nunito',sans-serif" }}>{selectedMoodData.description}</span>
                </div>
              </div>
            </div>

            {/* Writing card */}
            <div style={{ background:"white", borderRadius:24, overflow:"hidden", border:"1px solid #EEF0F8" }}>
              <div style={{ padding:"24px 24px 8px" }}>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Judul hari ini..."
                  style={{ width:"100%", fontSize:20, fontWeight:700, background:"transparent", border:"none", outline:"none", color:"#1A2840", caretColor:selectedMoodData.activeColor, fontFamily:"'Nunito',sans-serif", boxSizing:"border-box" }} />
                <p style={{ fontSize:10, color:"#C8D4DC", marginTop:2, fontFamily:"'Nunito',sans-serif" }}>opsional</p>
              </div>
              <div style={{ height:1, background:"#F2F6FA", margin:"0 24px" }} />
              <JournalSection emoji="🌱" label="Hari ini aku merasakan..." placeholder="Ceritakan perasaanmu hari ini..." value={feeling} onChange={setFeeling} accentColor={selectedMoodData.activeColor} />
              <div style={{ height:1, background:"#F2F6FA", margin:"0 24px" }} />
              <JournalSection emoji="💭" label="Aku memikirkan..." placeholder="Apa yang sedang ada di pikiranmu?" value={thinking} onChange={setThinking} accentColor={selectedMoodData.activeColor} />
              <div style={{ height:1, background:"#F2F6FA", margin:"0 24px" }} />
              <JournalSection emoji="✨" label="Aku bersyukur karena..." placeholder="Hal apa yang kamu syukuri hari ini?" value={grateful} onChange={setGrateful} accentColor={selectedMoodData.activeColor} />
              <div style={{ padding:"14px 24px", borderTop:"1px solid #F2F6FA", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:12, color:"#C0CCD8", fontFamily:"'Nunito',sans-serif" }}>{wordCount} kata</span>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => { resetForm(); setView("list"); }}
                    style={{ padding:"8px 20px", borderRadius:12, border:"1px solid #EEF0F8", color:"#A8B4C8", background:"white", cursor:"pointer", fontSize:13, fontWeight:500, fontFamily:"'Nunito',sans-serif" }}>Batal</button>
                  <button onClick={handleSave} disabled={saving || (!feeling.trim() && !thinking.trim() && !grateful.trim())}
                    style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 20px", borderRadius:12, background:selectedMoodData.activeColor, color:"white", border:"none", cursor:"pointer", fontSize:13, fontWeight:600, opacity:(saving||(!feeling.trim()&&!thinking.trim()&&!grateful.trim()))?0.55:1, fontFamily:"'Nunito',sans-serif" }}>
                    {saving ? <><IconLoader size={14} className="animate-spin" /> Menyimpan...</> : <><IconSave size={14} /> {editingJournal?"Perbarui":"Simpan"}</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "list" && (
          <>
            {journals.length > 0 && (
              <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:24, scrollbarWidth:"none" }}>
                {MOOD_FILTERS.map(f => {
                  const isActive = moodFilter === f.id;
                  return (
                    <button key={f.id} onClick={() => setMoodFilter(f.id)}
                      style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:999, fontSize:14, fontWeight:500, flexShrink:0, border:`1px solid ${isActive ? FILTER_ACTIVE[f.id] : "#EEF0F8"}`, background:isActive ? FILTER_ACTIVE[f.id] : "white", color:isActive ? "white" : "#8A96A8", cursor:"pointer", fontFamily:"'Nunito',sans-serif", transition:"all 0.15s" }}>
                      <span>{f.emoji}</span> {f.label}
                    </button>
                  );
                })}
              </div>
            )}

            {journals.length === 0 ? (
              <div style={{ background:"white", borderRadius:16, border:"1px solid #EEF0F8", padding:"60px 24px", textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📓</div>
                <h3 style={{ fontSize:18, fontWeight:600, color:"#1A2840", marginBottom:8, fontFamily:"'Nunito',sans-serif" }}>Jurnal masih kosong!</h3>
                <p style={{ fontSize:14, color:"#A8B4C8", marginBottom:20, maxWidth:280, margin:"0 auto 20px", fontFamily:"'Nunito',sans-serif" }}>Mulai catat perasaan dan pikiranmu. Setiap momen berharga.</p>
                <button onClick={() => { resetForm(); setView("compose"); }}
                  style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 24px", borderRadius:12, background:"#415f83", color:"white", border:"none", cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:"'Nunito',sans-serif" }}>
                  <IconPlus size={16} /> Mulai Menulis
                </button>
              </div>
            ) : filteredJournals.length === 0 ? (
              <div style={{ background:"white", borderRadius:16, border:"1px solid #EEF0F8", padding:"48px 24px", textAlign:"center" }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
                <p style={{ fontSize:14, fontWeight:500, color:"#A8B4C8", fontFamily:"'Nunito',sans-serif" }}>Tidak ada jurnal dengan mood ini</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {filteredJournals.map((journal, i) => (
                  <JournalCard key={journal.id} journal={journal} onEdit={handleEdit} onDelete={handleDelete} index={i} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}

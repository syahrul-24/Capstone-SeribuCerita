import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  superadminVerify, fetchArticles,
  createArticle, updateArticle, deleteArticle,
} from "../../lib/api";
import logo from "../../assets/logo.png";

// ── Pastel blue palette ───────────────────────────────────────────────────────
const C      = "#739caf";        // brand blue
const P1     = "#e8f4f8";        // pastel blue light
const P2     = "#d0e8f2";        // pastel blue mid
const P3     = "#b8daea";        // pastel blue deeper
const BG     = "#f0f7fb";        // page bg
const DARK   = "#1e3a4a";        // dark navy text
const MUTED  = "#6b8fa0";        // muted blue-grey

// Kategori = 5 emosi model AI
const CATEGORIES = [
  { value:"happy",   label:"Bahagia",      emoji:"😊" },
  { value:"neutral", label:"Netral",       emoji:"😐" },
  { value:"sad",     label:"Sedih",        emoji:"😢" },
  { value:"fear",    label:"Takut & Cemas",emoji:"😰" },
  { value:"anger",   label:"Marah",        emoji:"😠" },
];

const CAT_STYLES = {
  happy:   { tagBg:"rgba(187,247,208,0.50)", tagColor:"#166534" },
  neutral: { tagBg:"rgba(226,232,240,0.60)", tagColor:"#475569" },
  sad:     { tagBg:"rgba(196,181,253,0.40)", tagColor:"#5b21b6" },
  fear:    { tagBg:"rgba(253,230,138,0.50)", tagColor:"#92400e" },
  anger:   { tagBg:"rgba(254,202,202,0.50)", tagColor:"#991b1b" },
};

const EMPTY_FORM = {
  title:"", excerpt:"", category:"happy", tag:"", tag_bg:"", tag_color:"",
  emoji:"", read_time:"", date:"", author:"", author_role:"",
  image:"", hero_image:"", content:[{ type:"paragraph", text:"" }],
};

function Spinner() {
  return <div style={{ width:20, height:20, border:`2.5px solid ${C}`, borderTopColor:"transparent",
    borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }}/>;
}

// ── Content block editor ──────────────────────────────────────────────────────
function ContentEditor({ blocks, onChange }) {
  const update  = (idx, val) => onChange(blocks.map((b,i) => i===idx ? {...b, text:val} : b));
  const setType = (idx, type) => onChange(blocks.map((b,i) => i===idx ? {...b, type} : b));
  const add     = (type) => onChange([...blocks, { type, text:"" }]);
  const remove  = (idx) => onChange(blocks.filter((_,i) => i!==idx));
  const move    = (idx, dir) => {
    const next=[...blocks]; const t=idx+dir;
    if(t<0||t>=next.length) return;
    [next[idx],next[t]]=[next[t],next[idx]]; onChange(next);
  };
  const bgMap = { paragraph:"#f0f7fb", heading:"#fef9c3", quote:"#fce7f3" };
  return (
    <div>
      {blocks.map((b,i) => (
        <div key={i} style={{ marginBottom:10, borderRadius:12,
          border:`1.5px solid ${P2}`, background:bgMap[b.type]||"#f8fafc", overflow:"hidden" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px",
            background:P1, borderBottom:`1px solid ${P2}` }}>
            <select value={b.type} onChange={(e)=>setType(i,e.target.value)}
              style={{ fontSize:12, fontFamily:"'Nunito',sans-serif", fontWeight:700,
                border:"none", background:"transparent", cursor:"pointer", color:DARK }}>
              <option value="paragraph">📝 Paragraf</option>
              <option value="heading">📌 Heading</option>
              <option value="quote">💬 Kutipan</option>
            </select>
            <span style={{ flex:1 }}/>
            <button onClick={()=>move(i,-1)} disabled={i===0}
              style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, color:MUTED, opacity:i===0?0.3:1 }}>↑</button>
            <button onClick={()=>move(i,1)} disabled={i===blocks.length-1}
              style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, color:MUTED, opacity:i===blocks.length-1?0.3:1 }}>↓</button>
            <button onClick={()=>remove(i)}
              style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#ef4444" }}>✕</button>
          </div>
          <textarea value={b.text} onChange={(e)=>update(i,e.target.value)}
            placeholder={b.type==="paragraph"?"Isi paragraf...":b.type==="heading"?"Judul bagian...":"Teks kutipan..."}
            rows={b.type==="paragraph"?3:2}
            style={{ width:"100%", padding:"10px 12px", border:"none", background:"transparent",
              fontFamily:"'Nunito',sans-serif", fontSize:13, color:DARK, resize:"vertical",
              outline:"none", boxSizing:"border-box", lineHeight:1.6 }}/>
        </div>
      ))}
      <div style={{ display:"flex", gap:8, marginTop:6 }}>
        {["paragraph","heading","quote"].map((t) => (
          <button key={t} onClick={()=>add(t)}
            style={{ fontSize:12, fontFamily:"'Nunito',sans-serif", fontWeight:700, padding:"6px 12px",
              borderRadius:8, border:`1.5px solid ${C}`, background:"white", color:C, cursor:"pointer" }}>
            + {t==="paragraph"?"Paragraf":t==="heading"?"Heading":"Kutipan"}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Article Modal ─────────────────────────────────────────────────────────────
function ArticleModal({ article, token, onClose, onSaved }) {
  const isEdit = !!article;
  const [form, setForm] = useState(() => !article ? { ...EMPTY_FORM } : {
    title:       article.title||"",
    excerpt:     article.excerpt||"",
    category:    article.category||"happy",
    tag:         article.tag||"",
    tag_bg:      article.tag_bg||"",
    tag_color:   article.tag_color||"",
    emoji:       article.emoji||"",
    read_time:   article.read_time||"",
    date:        article.date||"",
    author:      article.author||"",
    author_role: article.author_role||"",
    image:       article.image||"",
    hero_image:  article.hero_image||"",
    content:     Array.isArray(article.content)&&article.content.length>0
                   ? article.content : [{ type:"paragraph", text:"" }],
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  function handleCategory(cat) {
    const catData = CATEGORIES.find(c=>c.value===cat);
    const styles  = CAT_STYLES[cat]||{};
    setForm(f => ({
      ...f, category:cat,
      tag:      catData?.label || f.tag,
      emoji:    catData?.emoji || f.emoji,
      tag_bg:   styles.tagBg    || f.tag_bg,
      tag_color:styles.tagColor || f.tag_color,
    }));
  }

  async function handleSave() {
    if (!form.title.trim()||!form.category) { setError("Judul dan kategori wajib diisi"); return; }
    setSaving(true); setError("");
    try {
      const payload = { ...form, content: form.content.filter(b=>b.text.trim()) };
      if (isEdit) await updateArticle(token, article.id, payload);
      else        await createArticle(token, payload);
      onSaved();
    } catch(err) { setError(err.message); }
    finally { setSaving(false); }
  }

  const inp = (label, key, type="text", placeholder="") => (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:"block", fontFamily:"'Nunito',sans-serif", fontSize:13,
        fontWeight:700, color:MUTED, marginBottom:6 }}>{label}</label>
      <input type={type} value={form[key]} placeholder={placeholder}
        onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
        style={{ width:"100%", padding:"10px 12px", borderRadius:10, boxSizing:"border-box",
          border:`1.5px solid ${P2}`, fontFamily:"'Nunito',sans-serif",
          fontSize:14, color:DARK, outline:"none", background:"white",
          transition:"border-color 0.2s" }}
        onFocus={e=>e.target.style.borderColor=C}
        onBlur={e=>e.target.style.borderColor=P2}/>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"flex-start",
      justifyContent:"center", padding:"24px 16px", overflowY:"auto",
      background:"rgba(30,58,74,0.50)", backdropFilter:"blur(8px)" }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ width:"100%", maxWidth:680, background:"white", borderRadius:24,
        boxShadow:`0 32px 80px rgba(30,58,74,0.20)`, border:`2px solid ${P2}`,
        overflow:"hidden", marginTop:16 }}
        onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding:"20px 24px", borderBottom:`1.5px solid ${P2}`,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          background: isEdit ? `linear-gradient(135deg,${P1},${P2})` : `linear-gradient(135deg,${P1},white)` }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:12, background:`linear-gradient(135deg,${C},#4a7c8f)`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
              {isEdit ? "✏️" : "✨"}
            </div>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:20, fontWeight:700, color:DARK, margin:0 }}>
              {isEdit ? "Edit Artikel" : "Artikel Baru"}
            </h2>
          </div>
          <button onClick={onClose} style={{ background:`${P2}`, border:"none", cursor:"pointer",
            width:32, height:32, borderRadius:10, fontSize:16, color:MUTED,
            display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        <div style={{ padding:24, maxHeight:"75vh", overflowY:"auto", background:"#fafcfe" }}>
          {error && (
            <div style={{ padding:"10px 14px", borderRadius:10, background:"#fef2f2",
              border:"1.5px solid #fecaca", marginBottom:16 }}>
              <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:"#dc2626", margin:0 }}>⚠️ {error}</p>
            </div>
          )}

          {/* Kategori */}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontFamily:"'Nunito',sans-serif", fontSize:13,
              fontWeight:700, color:MUTED, marginBottom:8 }}>Kategori *</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {CATEGORIES.map(cat => (
                <button key={cat.value} onClick={()=>handleCategory(cat.value)}
                  style={{ padding:"6px 14px", borderRadius:999, fontSize:13,
                    fontFamily:"'Nunito',sans-serif", fontWeight:700, cursor:"pointer",
                    border:`2px solid ${form.category===cat.value?C:P2}`,
                    background: form.category===cat.value?`linear-gradient(135deg,${C},#4a7c8f)`:"white",
                    color: form.category===cat.value?"white":MUTED,
                    transition:"all 0.2s" }}>
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {inp("Judul Artikel *","title","text","Judul yang menarik...")}

          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700, color:MUTED, marginBottom:6 }}>Ringkasan / Excerpt</label>
            <textarea value={form.excerpt} rows={3}
              onChange={e=>setForm(f=>({...f,excerpt:e.target.value}))}
              placeholder="Deskripsi singkat artikel..."
              style={{ width:"100%", padding:"10px 12px", borderRadius:10, boxSizing:"border-box",
                border:`1.5px solid ${P2}`, fontFamily:"'Nunito',sans-serif",
                fontSize:14, color:DARK, outline:"none", resize:"vertical", background:"white" }}
              onFocus={e=>e.target.style.borderColor=C}
              onBlur={e=>e.target.style.borderColor=P2}/>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {inp("Penulis","author","text","Nama lengkap penulis")}
            {inp("Jabatan Penulis","author_role","text","Psikolog Klinis")}
            {inp("Tanggal","date","text","12 Oktober 2024")}
            {inp("Waktu Baca","read_time","text","5 menit")}
            {inp("Emoji","emoji","text","🧘")}
            {inp("Tag Label","tag","text","Kesadaran Penuh")}
          </div>

          {inp("URL Gambar Thumbnail","image","url","https://images.unsplash.com/...")}
          {inp("URL Gambar Hero (opsional)","hero_image","url","https://images.unsplash.com/...")}

          {form.image && (
            <div style={{ marginBottom:16, borderRadius:12, overflow:"hidden", height:160, background:P1 }}>
              <img src={form.image} alt="preview" style={{ width:"100%", height:"100%", objectFit:"cover" }}
                onError={e=>{e.target.style.display="none"}}/>
            </div>
          )}

          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontFamily:"'Nunito',sans-serif", fontSize:13,
              fontWeight:700, color:MUTED, marginBottom:10 }}>
              Isi Artikel
              <span style={{ fontWeight:500, color:"#7B7B9A", marginLeft:8, fontSize:12 }}>
                ({form.content.length} blok)
              </span>
            </label>
            <ContentEditor blocks={form.content} onChange={blocks=>setForm(f=>({...f,content:blocks}))}/>
          </div>
        </div>

        <div style={{ padding:"16px 24px", borderTop:`1.5px solid ${P2}`,
          display:"flex", gap:10, justifyContent:"flex-end", background:P1 }}>
          <button onClick={onClose} disabled={saving}
            style={{ padding:"10px 20px", borderRadius:10, border:`1.5px solid ${P2}`,
              background:"white", color:MUTED, fontFamily:"'Nunito',sans-serif",
              fontSize:14, fontWeight:700, cursor:"pointer" }}>Batal</button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding:"10px 24px", borderRadius:10, border:"none",
              cursor: saving?"not-allowed":"pointer",
              background: saving?P3:`linear-gradient(135deg,${C},#4a7c8f)`,
              color:"white", fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:800,
              display:"flex", alignItems:"center", gap:8,
              boxShadow: saving?"none":`0 4px 16px ${C}40` }}>
            {saving ? <><Spinner/> Menyimpan...</> : (isEdit?"💾 Simpan Perubahan":"✨ Buat Artikel")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({ article, token, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  async function handleDelete() {
    setDeleting(true);
    try { await deleteArticle(token, article.id); onDeleted(); }
    catch(err) { alert(err.message); setDeleting(false); }
  }
  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center",
      justifyContent:"center", padding:24, background:"rgba(30,58,74,0.50)", backdropFilter:"blur(8px)" }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"white", borderRadius:20, padding:28, maxWidth:380, width:"100%",
        boxShadow:`0 24px 60px rgba(30,58,74,0.20)`, border:`2px solid ${P2}` }}>
        <div style={{ fontSize:36, textAlign:"center", marginBottom:12 }}>🗑️</div>
        <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:18, fontWeight:700, color:DARK,
          textAlign:"center", marginBottom:8 }}>Hapus Artikel?</h3>
        <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:MUTED, textAlign:"center",
          lineHeight:"20px", marginBottom:24 }}>
          "<strong>{article.title}</strong>" akan dihapus permanen.
        </p>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:10, borderRadius:10, cursor:"pointer",
            border:`1.5px solid ${P2}`, background:"white", color:MUTED,
            fontFamily:"'Nunito',sans-serif", fontWeight:700 }}>Batal</button>
          <button onClick={handleDelete} disabled={deleting}
            style={{ flex:1, padding:10, borderRadius:10, cursor:"pointer",
              border:"none", background:"#ef4444", color:"white",
              fontFamily:"'Nunito',sans-serif", fontWeight:800, opacity:deleting?0.6:1 }}>
            {deleting?"Menghapus...":"Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [token]    = useState(() => sessionStorage.getItem("sc_sa_token")||"");
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);
  const [meta,     setMeta]     = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { navigate("/superadmin", { replace:true }); return; }
    superadminVerify(token).then(ok => {
      if (!ok) { sessionStorage.removeItem("sc_sa_token"); navigate("/superadmin", { replace:true }); }
    });
  }, [token, navigate]);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchArticles({ search, page, limit:8 });
      setArticles(res.data||[]); setMeta(res.meta||{});
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { loadArticles(); }, [loadArticles]);
  useEffect(() => { setPage(1); }, [search]);

  function logout() {
    sessionStorage.removeItem("sc_sa_token");
    navigate("/superadmin", { replace:true });
  }

  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:"'Nunito',sans-serif" }}>

      {/* Top bar */}
      <div style={{
        background:`linear-gradient(135deg, ${P1} 0%, white 100%)`,
        padding:"0 28px",
        display:"flex", alignItems:"center", justifyContent:"space-between", height:64,
        borderBottom:`2px solid ${P2}`,
        boxShadow:`0 2px 20px rgba(115,156,175,0.12)`,
        position:"sticky", top:0, zIndex:100,
      }}>
        {/* Brand */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <img src={logo} alt="SeribuCerita"
            style={{ width:38, height:38, borderRadius:12, objectFit:"cover",
              border:`2px solid ${P3}`, boxShadow:`0 4px 12px ${C}30` }} />
          <div>
            <p style={{ fontFamily:"'Fraunces',serif", fontSize:16, fontWeight:700, color:DARK, margin:0, lineHeight:1.2 }}>
              Seribu<span style={{ color:C }}>Cerita</span>
            </p>
            <p style={{ fontSize:10, color:MUTED, margin:0, fontWeight:700,
              letterSpacing:"0.5px", textTransform:"uppercase" }}>Superadmin Panel</p>
          </div>
        </div>

        {/* Right */}
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <a href="/" target="_blank"
            style={{ fontSize:12, color:MUTED, fontWeight:700, textDecoration:"none",
              padding:"6px 12px", borderRadius:8, background:P1,
              border:`1.5px solid ${P2}`, transition:"all 0.2s" }}>
            🌐 Lihat Website
          </a>
          <button onClick={logout}
            style={{ padding:"6px 14px", borderRadius:8,
              background:"rgba(239,68,68,0.08)", border:"1.5px solid rgba(239,68,68,0.20)",
              color:"#ef4444", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            Keluar
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"28px 24px" }}>

        {/* Page title */}
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:26, fontWeight:700, color:DARK, margin:"0 0 4px" }}>
            Manajemen Artikel
          </h1>
          <p style={{ fontSize:14, color:MUTED, margin:0, fontWeight:500 }}>
            Kelola semua konten artikel SeribuCerita
          </p>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:28 }}>
          {[
            { label:"Total Artikel",  value:meta.total||0,      icon:"📰", color:C,        bg:P1 },
            { label:"Total Halaman",  value:meta.totalPages||0, icon:"📄", color:"#6366f1", bg:"rgba(99,102,241,0.08)" },
          ].map(s => (
            <div key={s.label} style={{
              background:"white", borderRadius:18, padding:"20px 22px",
              boxShadow:`0 4px 20px rgba(115,156,175,0.10)`,
              border:`2px solid ${P2}`,
              display:"flex", alignItems:"center", gap:14,
              transition:"transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 28px rgba(115,156,175,0.16)`; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=`0 4px 20px rgba(115,156,175,0.10)`; }}>
              <div style={{ width:48, height:48, borderRadius:14, background:s.bg,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{s.icon}</div>
              <div>
                <p style={{ fontSize:26, fontWeight:800, color:DARK, margin:0, lineHeight:1 }}>{s.value}</p>
                <p style={{ fontSize:12, color:MUTED, margin:"4px 0 0", fontWeight:600 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ flex:1, minWidth:220, position:"relative" }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:15, color:MUTED }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari artikel..."
              style={{ width:"100%", padding:"11px 14px 11px 40px", borderRadius:12, boxSizing:"border-box",
                border:`2px solid ${P2}`, fontFamily:"'Nunito',sans-serif",
                fontSize:14, outline:"none", background:"white", color:DARK,
                boxShadow:`0 2px 10px rgba(115,156,175,0.08)`, transition:"border-color 0.2s" }}
              onFocus={e=>e.target.style.borderColor=C}
              onBlur={e=>e.target.style.borderColor=P2}/>
          </div>
          <button onClick={()=>setModal("create")}
            style={{ padding:"11px 22px", borderRadius:12, border:"none", cursor:"pointer",
              background:`linear-gradient(135deg,${C},#4a7c8f)`, color:"white",
              fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:800,
              boxShadow:`0 6px 20px ${C}45`, whiteSpace:"nowrap",
              transition:"transform 0.2s, box-shadow 0.2s" }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-1px)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; }}>
            + Artikel Baru
          </button>
        </div>

        {/* Table */}
        <div style={{ background:"white", borderRadius:20,
          boxShadow:`0 4px 24px rgba(115,156,175,0.10)`,
          border:`2px solid ${P2}`, overflow:"hidden" }}>

          <div style={{ padding:"16px 22px", borderBottom:`2px solid ${P2}`,
            display:"flex", alignItems:"center", justifyContent:"space-between",
            background:`linear-gradient(135deg,${P1},white)` }}>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:18, fontWeight:700, color:DARK, margin:0 }}>
              Daftar Artikel
            </h2>
            {loading && <Spinner/>}
          </div>

          {articles.length===0 && !loading ? (
            <div style={{ padding:"56px 24px", textAlign:"center" }}>
              <p style={{ fontSize:48, marginBottom:12 }}>📭</p>
              <p style={{ fontFamily:"'Fraunces',serif", fontSize:18, fontWeight:700, color:DARK }}>Belum ada artikel</p>
              <p style={{ fontSize:14, color:MUTED, marginBottom:20 }}>Mulai tambahkan artikel pertama!</p>
              <button onClick={()=>setModal("create")}
                style={{ padding:"10px 24px", borderRadius:10, border:"none", cursor:"pointer",
                  background:`linear-gradient(135deg,${C},#4a7c8f)`, color:"white",
                  fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:14,
                  boxShadow:`0 4px 16px ${C}40` }}>
                + Artikel Baru
              </button>
            </div>
          ) : (
            <div>
              {articles.map((art,idx) => (
                <div key={art.id}
                  style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 22px",
                    borderBottom: idx<articles.length-1?`1px solid ${P1}`:"none",
                    transition:"background 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=P1}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>

                  <div style={{ width:62, height:46, borderRadius:10, overflow:"hidden",
                    background:P1, flexShrink:0, border:`1.5px solid ${P2}` }}>
                    {art.image
                      ? <img src={art.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                      : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center",
                          justifyContent:"center", fontSize:22 }}>{art.emoji}</div>}
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:"'Fraunces',serif", fontSize:15, fontWeight:700, color:DARK,
                      margin:"0 0 5px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {art.title}
                    </p>
                    <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                      <span style={{ fontSize:11, padding:"2px 9px", borderRadius:999,
                        background:art.tag_bg||P1, color:art.tag_color||C,
                        fontWeight:700, fontFamily:"'Nunito',sans-serif",
                        border:`1px solid ${art.tag_bg ? "transparent" : P2}` }}>
                        {art.tag}
                      </span>
                      <span style={{ fontSize:11, color:MUTED }}>
                        {[art.author, art.date, art.read_time].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                  </div>

                  <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                    <button onClick={()=>setModal(art)}
                      style={{ padding:"7px 16px", borderRadius:9,
                        border:`1.5px solid ${P3}`,
                        background:P1, color:C, fontFamily:"'Nunito',sans-serif",
                        fontSize:12, fontWeight:700, cursor:"pointer",
                        transition:"all 0.15s" }}
                      onMouseEnter={e=>{ e.currentTarget.style.background=P2; e.currentTarget.style.borderColor=C; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background=P1; e.currentTarget.style.borderColor=P3; }}>
                      ✏️ Edit
                    </button>
                    <button onClick={()=>setDeleting(art)}
                      style={{ padding:"7px 12px", borderRadius:9,
                        border:"1.5px solid rgba(239,68,68,0.20)",
                        background:"rgba(239,68,68,0.05)", color:"#ef4444",
                        fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:700, cursor:"pointer",
                        transition:"all 0.15s" }}
                      onMouseEnter={e=>{ e.currentTarget.style.background="rgba(239,68,68,0.12)"; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background="rgba(239,68,68,0.05)"; }}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div style={{ padding:"16px 22px", borderTop:`2px solid ${P1}`,
              display:"flex", alignItems:"center", gap:8, justifyContent:"center",
              background:`linear-gradient(135deg,white,${P1})` }}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}
                style={{ padding:"7px 16px", borderRadius:9, cursor:"pointer",
                  border:`1.5px solid ${P2}`, background:"white", color:MUTED,
                  fontSize:13, fontWeight:700, opacity:page<=1?0.4:1,
                  transition:"all 0.15s" }}>← Prev</button>
              <span style={{ fontSize:13, fontWeight:700, color:DARK,
                padding:"7px 14px", borderRadius:9, background:P1, border:`1.5px solid ${P2}` }}>
                {page} / {meta.totalPages}
              </span>
              <button onClick={()=>setPage(p=>Math.min(meta.totalPages,p+1))}
                disabled={page>=meta.totalPages}
                style={{ padding:"7px 16px", borderRadius:9, cursor:"pointer",
                  border:`1.5px solid ${P2}`, background:"white", color:MUTED,
                  fontSize:13, fontWeight:700, opacity:page>=meta.totalPages?0.4:1,
                  transition:"all 0.15s" }}>Next →</button>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <ArticleModal article={modal==="create"?null:modal} token={token}
          onClose={()=>setModal(null)} onSaved={()=>{setModal(null);loadArticles();}}/>
      )}
      {deleting && (
        <DeleteConfirm article={deleting} token={token}
          onClose={()=>setDeleting(null)} onDeleted={()=>{setDeleting(null);loadArticles();}}/>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
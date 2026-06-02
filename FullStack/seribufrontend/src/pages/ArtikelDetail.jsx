import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchArticleById, fetchArticles, createHighlight } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const C = "#739caf";
const HCOLORS = [
  { id:"yellow", bg:"#fef08a", border:"#facc15", hex:"#fef08a", label:"Kuning" },
  { id:"green",  bg:"#bbf7d0", border:"#4ade80", hex:"#bbf7d0", label:"Hijau"  },
  { id:"blue",   bg:"#bfdbfe", border:"#60a5fa", hex:"#bfdbfe", label:"Biru"   },
  { id:"pink",   bg:"#fbcfe8", border:"#f472b6", hex:"#fbcfe8", label:"Pink"   },
];
const HCOLOR_MAP  = { yellow:"#fef08a", green:"#bbf7d0", blue:"#bfdbfe", pink:"#fbcfe8" };
const HBORDER_MAP = { yellow:"#facc15", green:"#4ade80", blue:"#60a5fa", pink:"#f472b6" };

// Toast notification (simple)
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", zIndex:99999,
      background:"#1A1A2E", color:"white", padding:"10px 20px", borderRadius:999,
      fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700,
      boxShadow:"0 8px 32px rgba(26,26,46,0.30)", whiteSpace:"nowrap" }}>
      {msg}
    </div>
  );
}

function HighlightToolbar({ pos, onAdd, onClose }) {
  return (
    <div className="highlight-toolbar" style={{ position:"fixed", top:pos.y-56, left:pos.x, transform:"translateX(-50%)", zIndex:9999, background:"white", borderRadius:20, padding:"10px 14px", display:"flex", alignItems:"center", gap:8, border:"2px solid rgba(26,26,46,0.08)", boxShadow:"0 8px 32px rgba(26,26,46,0.18)", pointerEvents:"auto", userSelect:"none", animation:"fadeUp 0.15s ease both", whiteSpace:"nowrap" }} onMouseDown={e=>e.preventDefault()}>
      <span style={{fontSize:11,fontFamily:"'Nunito',sans-serif",fontWeight:700,color:"#7B7B9A",paddingRight:8,borderRight:"2px solid rgba(26,26,46,0.08)"}}>✏️ Tandai</span>
      {HCOLORS.map(c=>(
        <button key={c.id} onMouseDown={e=>{e.preventDefault();onAdd(c.id,c.hex);}} title={c.label}
          style={{width:22,height:22,borderRadius:"50%",background:c.bg,border:`2.5px solid ${c.border}`,cursor:"pointer",transition:"transform 0.15s",flexShrink:0}}
          onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.3)"}}
          onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)"}} />
      ))}
      <button onMouseDown={e=>{e.preventDefault();onClose();}} style={{color:"#7B7B9A",fontSize:12,fontWeight:700,background:"none",border:"none",cursor:"pointer",padding:"0 4px",marginLeft:4,fontFamily:"'Nunito',sans-serif"}}>✕</button>
    </div>
  );
}

function HighlightsPanel({ highlights, onDelete, onClose }) {
  return (
    <div style={{position:"fixed",top:88,right:16,width:288,zIndex:50,background:"white",borderRadius:24,overflow:"hidden",boxShadow:"0 20px 60px rgba(26,26,46,0.18)",border:`2px solid rgba(115,156,175,0.12)`,maxHeight:"70vh",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px 12px",borderBottom:"2px solid rgba(26,26,46,0.06)",flexShrink:0}}>
        <h3 style={{fontFamily:"'Fraunces',serif",fontSize:15,fontWeight:700,color:"#1A1A2E",display:"flex",alignItems:"center",gap:8,margin:0}}>
          ✨ Highlight Saya
          {highlights.length>0&&<span style={{fontSize:11,fontFamily:"'Nunito',sans-serif",fontWeight:700,background:`rgba(115,156,175,0.12)`,color:C,padding:"2px 8px",borderRadius:999}}>{highlights.length}</span>}
        </h3>
        <button onClick={onClose} style={{color:"#7B7B9A",fontSize:13,background:"none",border:"none",cursor:"pointer",padding:4}}>✕</button>
      </div>
      <div style={{overflowY:"auto",flex:1,padding:16,display:"flex",flexDirection:"column",gap:8}}>
        {highlights.length===0 ? (
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <p style={{fontSize:32,marginBottom:8}}>✨</p>
            <p style={{fontSize:13,color:"#7B7B9A",fontFamily:"'Nunito',sans-serif",fontWeight:600}}>Belum ada highlight.</p>
            <p style={{fontSize:11,color:"#7B7B9A",fontFamily:"'Nunito',sans-serif",marginTop:4}}>Seleksi teks lalu pilih warna.</p>
          </div>
        ) : highlights.map(h=>(
          <div key={h.id||h.localId} style={{display:"flex",gap:8,padding:"10px 12px",borderRadius:16,background:`${HCOLOR_MAP[h.colorId]||h.color||"#fef08a"}80`,borderLeft:`4px solid ${HBORDER_MAP[h.colorId]||"#facc15"}`,border:`2px solid ${HCOLOR_MAP[h.colorId]||h.color||"#fef08a"}`}}>
            <p style={{flex:1,fontSize:12,color:"#1A1A2E",lineHeight:"20px",fontFamily:"'Nunito',sans-serif",fontStyle:"italic",margin:0}}>"{h.text}"</p>
            <button onClick={()=>onDelete(h.id||h.localId)} style={{color:"rgba(26,26,46,0.25)",fontSize:11,background:"none",border:"none",cursor:"pointer",flexShrink:0,paddingTop:2,transition:"color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.color="#E8527F"} onMouseLeave={e=>e.currentTarget.style.color="rgba(26,26,46,0.25)"}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShareModal({ article, onClose }) {
  const [copied,setCopied]=useState(false);
  const url=`${window.location.origin}/artikel/${article.id}`;
  function copy(){navigator.clipboard.writeText(url).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);})}
  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:"rgba(26,26,46,0.55)",backdropFilter:"blur(6px)"}} onClick={onClose}>
      <div style={{background:"white",borderRadius:28,padding:24,width:"100%",maxWidth:380,boxShadow:"0 32px 80px rgba(26,26,46,0.20)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <h3 style={{fontFamily:"'Fraunces',serif",fontSize:18,fontWeight:700,color:"#1A1A2E",marginBottom:4,marginTop:0}}>Bagikan Artikel 🔗</h3>
            <p style={{fontSize:12,color:"#7B7B9A",fontFamily:"'Nunito',sans-serif",fontWeight:500,margin:0}} className="line-clamp-2">{article.title}</p>
          </div>
          <button onClick={onClose} style={{color:"#7B7B9A",background:"none",border:"none",cursor:"pointer",padding:4,marginLeft:8}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          <button onClick={()=>window.open('https://wa.me/?text='+encodeURIComponent('Baca artikel ini: "'+article.title+'" 📖\n'+url))} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"12px",borderRadius:16,fontSize:13,fontFamily:"'Nunito',sans-serif",fontWeight:700,background:"#25D366",color:"white",border:"none",cursor:"pointer"}}>💬 WhatsApp</button>
          <button onClick={()=>window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('"'+article.title+'"')}&url=${encodeURIComponent(url)}`)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"12px",borderRadius:16,fontSize:13,fontFamily:"'Nunito',sans-serif",fontWeight:700,background:"#1A1A2E",color:"white",border:"none",cursor:"pointer"}}>🐦 Twitter</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 14px",borderRadius:16,background:"rgba(26,26,46,0.05)"}}>
          <input readOnly value={url} style={{flex:1,background:"transparent",fontSize:11,color:"#7B7B9A",fontFamily:"'Nunito',sans-serif",outline:"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",border:"none"}}/>
          <button onClick={copy} style={{padding:"6px 12px",borderRadius:10,fontSize:11,fontFamily:"'Nunito',sans-serif",fontWeight:700,background:copied?"linear-gradient(135deg,#6BCB77,#4D96FF)":`linear-gradient(135deg,${C},#4a7c8f)`,color:"white",border:"none",cursor:"pointer",flexShrink:0,transition:"all 0.3s"}}>{copied?"✓ Disalin!":"Salin"}</button>
        </div>
      </div>
    </div>
  );
}

function RelatedCard({ article }) {
  return (
    <Link to={`/artikel/${article.id}`} className="art-card bg-white flex flex-col reveal" style={{border:"2px solid rgba(26,26,46,0.04)"}}>
      <div style={{height:160,overflow:"hidden",background:"rgba(255,248,240,0.80)"}}>
        {article.image ? <img src={article.image} alt={article.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:52}}>{article.emoji}</div>}
      </div>
      <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",flexGrow:1}}>
        <span className="tag-pill mb-2 self-start" style={{background:article.tag_bg||`rgba(115,156,175,0.12)`,color:article.tag_color||C,fontFamily:"'Nunito',sans-serif",fontSize:11}}>{article.tag}</span>
        <h3 style={{fontFamily:"'Fraunces',serif",fontSize:15,fontWeight:700,color:"#1A1A2E",marginBottom:6,lineHeight:"22px"}} className="line-clamp-2">{article.title}</h3>
        <p style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:"#7B7B9A",flexGrow:1}} className="line-clamp-2">{article.excerpt}</p>
        <p style={{fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:800,color:C,marginTop:12}}>Baca →</p>
      </div>
    </Link>
  );
}

export default function ArtikelDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [article,  setArticle]  = useState(null);
  const [related,  setRelated]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  // highlights: gabungan dari localStorage (lokal) + backend (kalau login)
  const [highlights, setHighlights] = useState([]);
  const [toolbar,    setToolbar]    = useState(null);
  const [showShare,  setShowShare]  = useState(false);
  const [showPanel,  setShowPanel]  = useState(false);
  const [toast,      setToast]      = useState(null);
  const articleBodyRef = useRef(null);

  // Load article
  useEffect(() => {
    setLoading(true); setNotFound(false);
    fetchArticleById(id)
      .then((res) => {
        setArticle(res.data);
        return fetchArticles({ category: res.data.category, limit: 4 })
          .then((r) => setRelated((r.data || []).filter((a) => String(a.id) !== String(id)).slice(0, 3)));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Load highlights from localStorage on article change
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`sc_hl_${id}`) || "[]");
      setHighlights(saved);
    } catch { setHighlights([]); }
  }, [id]);

  // Sync to localStorage whenever highlights change
  useEffect(() => {
    localStorage.setItem(`sc_hl_${id}`, JSON.stringify(highlights));
  }, [highlights, id]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [id]);
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting)x.target.classList.add("visible");}),{threshold:0.07});
    els.forEach(el=>obs.observe(el));
    return ()=>obs.disconnect();
  }, [id, loading]);

  const handleMouseUp = useCallback((e) => {
    if(e.target.closest&&e.target.closest(".highlight-toolbar"))return;
    setTimeout(()=>{
      const sel=window.getSelection();
      if(!sel||sel.rangeCount===0||sel.isCollapsed){setToolbar(null);return;}
      const text=sel.toString().trim();
      if(text.length<3){setToolbar(null);return;}
      const range=sel.getRangeAt(0);
      const rect=range.getBoundingClientRect();
      if(rect.width===0&&rect.height===0){setToolbar(null);return;}
      setToolbar({x:rect.left+rect.width/2,y:rect.top,text});
    },20);
  },[]);

  const handleDocMouseDown=useCallback((e)=>{
    if(e.target.closest&&e.target.closest(".highlight-toolbar"))return;
    if(articleBodyRef.current&&articleBodyRef.current.contains(e.target))return;
    setToolbar(null);
  },[]);

  useEffect(()=>{
    document.addEventListener("mousedown",handleDocMouseDown);
    return()=>document.removeEventListener("mousedown",handleDocMouseDown);
  },[handleDocMouseDown]);

  async function addHighlight(colorId, colorHex) {
    if(!toolbar?.text) return;
    const text = toolbar.text;
    const localId = `h_${Date.now()}`;
    const newH = { localId, text, colorId, color: colorHex, ts: Date.now() };

    // 1. Tambah ke state lokal dulu (instant feedback)
    setHighlights(prev => [...prev, newH]);
    setToolbar(null);
    window.getSelection()?.removeAllRanges();

    // 2. Kalau user login → simpan ke backend
    if (user) {
      try {
        const res = await createHighlight({
          article_id:    String(id),
          article_title: article?.title || "",
          text,
          color: colorHex,
        });
        // Ganti localId dengan id dari backend
        setHighlights(prev => prev.map(h =>
          h.localId === localId ? { ...h, id: res.highlight?.id || res.id, localId: undefined } : h
        ));
        setToast("✨ Highlight tersimpan ke profil!");
      } catch {
        setToast("⚠️ Highlight tersimpan lokal saja (login untuk sinkron)");
      }
    } else {
      setToast("💡 Login untuk menyimpan highlight ke profil kamu!");
    }
  }

  async function deleteHighlight(hId) {
    setHighlights(prev => prev.filter(h => (h.id || h.localId) !== hId));
  }

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#FFF8F0"}}>
      <div style={{width:36,height:36,border:`3px solid ${C}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (notFound || !article) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#FFF8F0"}}>
      <div style={{textAlign:"center"}}>
        <p style={{fontSize:64,marginBottom:16}}>🔍</p>
        <p style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:700,color:"#1A1A2E",marginBottom:8}}>Artikel Tidak Ditemukan</p>
        <Link to="/edukasi" style={{fontFamily:"'Nunito',sans-serif",fontSize:14,fontWeight:700,color:C}}>← Kembali ke Artikel</Link>
      </div>
    </div>
  );

  const contentBlocks = Array.isArray(article.content) ? article.content : [];

  return (
    <div style={{minHeight:"100vh",background:"#FFF8F0",userSelect:"text"}}>
      {/* Sticky action bar */}
      <div className="fixed z-40 flex items-center gap-2" style={{top:80,right:16,pointerEvents:"auto"}}>
        <button onClick={()=>setShowPanel(v=>!v)}
          style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:999,fontSize:12,fontFamily:"'Nunito',sans-serif",fontWeight:700,background:"white",border:`2px solid rgba(115,156,175,0.15)`,color:highlights.length>0?C:"#7B7B9A",cursor:"pointer",boxShadow:"0 4px 16px rgba(26,26,46,0.08)",transition:"all 0.2s"}}>
          ✨ {highlights.length} Highlight
        </button>
        <button onClick={()=>setShowShare(true)}
          style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:999,fontSize:12,fontFamily:"'Nunito',sans-serif",fontWeight:700,background:`linear-gradient(135deg,${C},#4a7c8f)`,color:"white",border:"none",cursor:"pointer",boxShadow:`0 4px 16px rgba(115,156,175,0.35)`,transition:"all 0.2s"}}>
          🔗 Bagikan
        </button>
      </div>

      {showPanel && <HighlightsPanel highlights={highlights} onDelete={deleteHighlight} onClose={()=>setShowPanel(false)}/>}

      <section style={{paddingTop:100,paddingBottom:80,paddingLeft:24,paddingRight:24}}>
        <div style={{maxWidth:720,margin:"0 auto"}}>
          <Link to="/edukasi" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:13,fontFamily:"'Nunito',sans-serif",fontWeight:700,color:"#7B7B9A",textDecoration:"none",marginBottom:32,transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color=C} onMouseLeave={e=>e.currentTarget.style.color="#7B7B9A"}>
            ← Kembali ke Artikel
          </Link>

          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:20}}>
            <span className="tag-pill" style={{background:article.tag_bg||`rgba(115,156,175,0.12)`,color:article.tag_color||C,fontFamily:"'Nunito',sans-serif"}}>{article.tag}</span>
            <span style={{fontSize:13,color:"#7B7B9A",fontFamily:"'Nunito',sans-serif",fontWeight:500}}>{article.date}</span>
            <span style={{color:"#7B7B9A"}}>·</span>
            <span style={{fontSize:13,color:"#7B7B9A",fontFamily:"'Nunito',sans-serif",fontWeight:500}}>{article.read_time}</span>
          </div>

          <h1 style={{fontFamily:"'Fraunces',serif",fontSize:"clamp(24px,5vw,40px)",lineHeight:"1.25",fontWeight:700,color:"#1A1A2E",marginBottom:12}}>{article.title}</h1>

          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:32}}>
            <div style={{width:36,height:36,borderRadius:12,background:`linear-gradient(135deg,${C},#4a7c8f)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"white",fontWeight:700,fontFamily:"'Fraunces',serif"}}>
              {(article.author||"S").charAt(0)}
            </div>
            <div>
              <p style={{fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,color:"#1A1A2E",margin:0}}>{article.author}</p>
              <p style={{fontFamily:"'Nunito',sans-serif",fontSize:11,color:"#7B7B9A",margin:0,fontWeight:500}}>{article.author_role || "Penulis SeribuCerita"}</p>
            </div>
          </div>

          <div style={{width:"100%",borderRadius:28,overflow:"hidden",marginBottom:32,height:400,background:"rgba(238,244,247,0.80)",boxShadow:"0 12px 40px rgba(26,26,46,0.10)"}}>
            {article.image ? <img src={article.image} alt={article.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:96}}>{article.emoji}</div>}
          </div>

          {/* Highlight tip — beda teks kalau sudah login */}
          <div style={{display:"flex",alignItems:"flex-start",gap:10,padding:"14px 16px",borderRadius:20,background:`rgba(115,156,175,0.08)`,border:`2px solid rgba(115,156,175,0.20)`,marginBottom:28}}>
            <span style={{fontSize:18,flexShrink:0}}>💡</span>
            <p style={{fontSize:13,fontFamily:"'Nunito',sans-serif",fontWeight:600,color:"#3D5C6A",margin:0,lineHeight:"20px"}}>
              <strong>Tips Highlight:</strong> Seleksi teks manapun di bawah, lalu pilih warna untuk menyimpan highlight.
              {user ? " Highlight kamu akan otomatis tersimpan ke profil! ✨" : " Login untuk menyimpan highlight ke profilmu!"}
            </p>
          </div>

          <div ref={articleBodyRef} onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp} style={{userSelect:"text",cursor:"text"}}>
            <p style={{fontFamily:"'Nunito',sans-serif",fontSize:18,fontWeight:600,color:"#3D3D5C",lineHeight:"30px",marginBottom:32,paddingBottom:32,borderBottom:"2px solid rgba(26,26,46,0.06)"}}>{article.excerpt}</p>

            <div style={{display:"flex",flexDirection:"column",gap:24}} className="article-content">
              {contentBlocks.map((block, i) => {
                const type = block.type;
                if (type==="paragraph"||type==="para") return (
                  <p key={i} style={{fontFamily:"'Nunito',sans-serif",fontSize:17,fontWeight:500,color:"#3D3D5C",lineHeight:"30px",margin:0}}>{block.text}</p>
                );
                if (type==="quote") return (
                  <blockquote key={i} style={{paddingLeft:20,margin:0,borderLeft:`4px solid ${C}`}}>
                    <p style={{fontFamily:"'Fraunces',serif",fontSize:20,fontStyle:"italic",color:"#1A1A2E",lineHeight:"32px",margin:0}}>{block.text}</p>
                  </blockquote>
                );
                if (type==="heading") return (
                  <h2 key={i} style={{fontFamily:"'Fraunces',serif",fontSize:26,fontWeight:700,color:"#1A1A2E",lineHeight:"34px",margin:0,paddingTop:8}}>{block.text}</h2>
                );
                return null;
              })}
            </div>
          </div>

          {/* CTA bar */}
          <div style={{marginTop:48,borderRadius:24,padding:24,background:`linear-gradient(135deg,rgba(115,156,175,0.08),rgba(74,124,143,0.08))`,border:`2px solid rgba(115,156,175,0.14)`,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}} className="reveal">
            <div style={{width:44,height:44,borderRadius:16,background:`linear-gradient(135deg,${C},#4a7c8f)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🔗</div>
            <div style={{flex:1}}>
              <p style={{fontFamily:"'Fraunces',serif",fontSize:16,fontWeight:700,color:"#1A1A2E",marginBottom:2}}>Bagikan artikel ini</p>
              <p style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:"#7B7B9A",margin:0,fontWeight:500}}>Rekomendasikan ke teman yang mungkin membutuhkan ini 💙</p>
            </div>
            <button onClick={()=>setShowShare(true)} style={{padding:"10px 20px",borderRadius:999,border:"none",cursor:"pointer",fontSize:13,fontFamily:"'Nunito',sans-serif",fontWeight:800,color:"white",background:`linear-gradient(135deg,${C},#4a7c8f)`,boxShadow:`0 6px 20px rgba(115,156,175,0.30)`}}>Bagikan →</button>
          </div>

          <div style={{marginTop:16,borderRadius:24,padding:24,background:"linear-gradient(135deg,#1A1A2E,#2D1B4E)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}} className="reveal">
            <div>
              <p style={{fontFamily:"'Fraunces',serif",fontSize:18,fontWeight:700,color:"white",marginBottom:4}}>Ingin berbicara tentang ini? 💬</p>
              <p style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:"rgba(255,255,255,0.60)",margin:0,fontWeight:500}}>Ceritakan perasaanmu kepada SeribuCerita AI.</p>
            </div>
            <Link to="/chatbot" style={{padding:"12px 24px",borderRadius:999,textDecoration:"none",fontSize:14,fontFamily:"'Nunito',sans-serif",fontWeight:800,color:"white",background:`linear-gradient(135deg,${C},#4a7c8f)`,boxShadow:`0 6px 20px rgba(115,156,175,0.30)`}}>Mulai Bercerita ✨</Link>
          </div>
        </div>

        {related.length > 0 && (
          <div style={{maxWidth:1100,margin:"0 auto",marginTop:64,paddingTop:48,borderTop:"2px solid rgba(26,26,46,0.06)"}}>
            <h2 style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:700,color:"#1A1A2E",textAlign:"center",marginBottom:32}} className="reveal">Artikel Terkait 📚</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map(a=><RelatedCard key={a.id} article={a}/>)}
            </div>
          </div>
        )}
      </section>

      {toolbar && <HighlightToolbar pos={toolbar} onAdd={addHighlight} onClose={()=>{setToolbar(null);window.getSelection()?.removeAllRanges();}}/>}
      {showShare && <ShareModal article={article} onClose={()=>setShowShare(false)}/>}
      {toast && <Toast msg={toast} onDone={()=>setToast(null)}/>}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

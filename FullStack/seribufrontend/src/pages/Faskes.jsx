import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconMapPin, IconLoader, IconChevronRight, IconPhone, IconNavigation, IconHeartPulse, IconAlert, IconSearch } from "../components/icons/index.jsx";
import { useAuth } from "../context/AuthContext";
import { searchFaskes } from "../lib/api";
import DashboardShell from "../components/layout/DashboardShell";
import FaskesMap from "../components/features/FaskesMap";
import { PageLoader } from "../components/ui/LoadingSpinner";

const FASKES_TYPES = {
  hospital:   { label:"Rumah Sakit", color:"#415f83", bg:"#EEF2FA", icon:"🏥" },
  clinic:     { label:"Klinik",      color:"#5BA970", bg:"#EBF6EE", icon:"🏪" },
  psychiatry: { label:"Psikiater",   color:"#9B6DB5", bg:"#F5EEFF", icon:"🧠" },
  psychology: { label:"Psikolog",    color:"#E596B2", bg:"#FEF0F5", icon:"💬" },
  puskesmas:  { label:"Puskesmas",   color:"#D4962A", bg:"#FEF6E9", icon:"🏛️" },
};

const RADII = [
  { label:"1 km",  value:1000  },
  { label:"3 km",  value:3000  },
  { label:"5 km",  value:5000  },
  { label:"10 km", value:10000 },
  { label:"15 km", value:15000 },
];

function FaskesCard({ faskes, onFocus }) {
  const t = FASKES_TYPES[faskes.type?.id || faskes.type] || { label:"Faskes", color:"#6B7280", bg:"#F5F6F8", icon:"🏥" };
  const dist = faskes.dist < 1 ? `${Math.round(faskes.dist * 1000)} m` : `${faskes.dist.toFixed(1)} km`;
  return (
    <div onClick={() => onFocus?.(faskes)}
      style={{ background:"white", borderRadius:16, padding:"14px 18px", border:"1px solid #EEF0F8", cursor:"pointer", transition:"box-shadow 0.2s", marginBottom:8 }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(65,95,131,0.10)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", background:t.bg, fontSize:18, flexShrink:0 }}>
          {t.icon}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:4 }}>
            <h3 style={{ fontSize:14, fontWeight:600, color:"#1A2840", margin:0, lineHeight:"1.3", fontFamily:"'Nunito',sans-serif" }}>{faskes.name}</h3>
            <span style={{ fontSize:12, fontWeight:600, color:t.color, flexShrink:0, fontFamily:"'Nunito',sans-serif" }}>{dist}</span>
          </div>
          <span style={{ display:"inline-block", fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:999, background:t.bg, color:t.color, marginBottom:6, fontFamily:"'Nunito',sans-serif" }}>
            {t.label}
          </span>
          {faskes.address && (
            <p style={{ fontSize:12, color:"#A8B4C8", margin:"0 0 6px", lineHeight:"1.4", fontFamily:"'Nunito',sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              📍 {faskes.address}
            </p>
          )}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {faskes.phone && (
              <a href={`tel:${faskes.phone}`} onClick={e => e.stopPropagation()}
                style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, color:"#5BA970", fontWeight:600, textDecoration:"none", fontFamily:"'Nunito',sans-serif" }}>
                <IconPhone size={10} /> {faskes.phone}
              </a>
            )}
            {faskes.mapsUrl && (
              <a href={faskes.mapsUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, color:"#415f83", fontWeight:600, textDecoration:"none", fontFamily:"'Nunito',sans-serif" }}>
                <IconNavigation size={10} /> Buka Maps
              </a>
            )}
          </div>
        </div>
        <IconChevronRight size={14} color="#D0D8E4" />
      </div>
    </div>
  );
}

export default function Faskes() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [radius, setRadius]       = useState(3000);
  const [searchPoint, setSearchPoint] = useState(null);
  const [focusPoint, setFocusPoint]   = useState(null);
  const [locating, setLocating]       = useState(false);
  const [searchText, setSearchText]   = useState("");
  const [toast, setToast]             = useState("");

  useEffect(() => { if (!user) navigate("/login"); }, [user]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 2800); return () => clearTimeout(t); } }, [toast]);

  function handleLogout() { logout(); navigate("/"); }

  async function doSearch(lat, lon, r) {
    setLoading(true); setError("");
    try {
      const data = await searchFaskes(lat, lon, r);

      // Backend returns raw Overpass JSON with `elements` array
      const elements = data.elements || data.results || data.data || [];

      const parsed = elements
        .filter(el => el.tags)
        .map(el => {
          const tags = el.tags || {};
          // Coordinates: node has lat/lon, way/relation has center
          const elLat = el.lat ?? el.center?.lat;
          const elLon = el.lon ?? el.center?.lon;
          if (!elLat || !elLon) return null;

          // Determine type
          let type = "clinic";
          const amenity   = tags.amenity || "";
          const healthcare = tags.healthcare || "";
          const speciality = (tags["healthcare:speciality"] || tags.speciality || "").toLowerCase();

          if (amenity === "hospital" || healthcare === "hospital") type = "hospital";
          else if (speciality.includes("psychiatry") || speciality.includes("psik") || healthcare === "psychiatrist") type = "psychiatry";
          else if (speciality.includes("psychology") || healthcare === "psychologist") type = "psychology";
          else if (amenity === "clinic" || healthcare === "clinic" || amenity === "doctors") type = "clinic";
          // Puskesmas detection
          const name = tags.name || tags["name:en"] || "";
          if (name.toLowerCase().includes("puskesmas")) type = "puskesmas";

          // Distance from search point
          const dLat = (elLat - lat) * (Math.PI / 180);
          const dLon = (elLon - lon) * (Math.PI / 180);
          const a = Math.sin(dLat/2)**2 + Math.cos(lat * Math.PI/180) * Math.cos(elLat * Math.PI/180) * Math.sin(dLon/2)**2;
          const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); // km

          const address = [tags["addr:street"], tags["addr:housenumber"], tags["addr:city"]]
            .filter(Boolean).join(", ") || tags.address || "";

          const mapsUrl = tags["contact:website"] || tags.website ||
            `https://www.google.com/maps?q=${elLat},${elLon}`;

          return {
            id: `${el.type}_${el.id}`,
            name: name || "Fasilitas Kesehatan",
            type,
            lat: elLat,
            lon: elLon,
            address,
            phone: tags.phone || tags["contact:phone"] || tags["contact:mobile"] || "",
            mapsUrl,
            dist: Math.round(dist * 100) / 100,
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.dist - b.dist);

      setResults(parsed);
      if (parsed.length === 0) setToast("Tidak ada faskes ditemukan dalam radius ini");
    } catch { setError("Gagal mencari faskes. Pastikan backend berjalan."); }
    finally { setLoading(false); }
  }

  async function locate() {
    if (!navigator.geolocation) { setError("Browser tidak mendukung geolokasi."); return; }
    setLocating(true); setError("");
    try {
      const pos = await new Promise((ok, fail) =>
        navigator.geolocation.getCurrentPosition(ok, fail, { enableHighAccuracy:true, timeout:12000 })
      );
      const { latitude: lat, longitude: lon } = pos.coords;
      setSearchPoint([lat, lon]);
      await doSearch(lat, lon, radius);
    } catch {
      setError("Tidak bisa mengakses lokasi. Aktifkan izin lokasi di browser.");
    } finally { setLocating(false); }
  }

  // Filter by search text
  const filtered = searchText.trim()
    ? results.filter(r => r.name?.toLowerCase().includes(searchText.toLowerCase()) || r.address?.toLowerCase().includes(searchText.toLowerCase()))
    : results;

  // Group by type
  const grouped = {};
  filtered.forEach(r => {
    const key = r.type?.id || r.type || "other";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  return (
    <DashboardShell user={user} onLogout={handleLogout} mainClassName="overflow-hidden">
      {toast && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", zIndex:9999,
          background:"#1A2840", color:"white", padding:"10px 20px", borderRadius:999,
          fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700,
          boxShadow:"0 8px 32px rgba(26,26,46,0.30)", whiteSpace:"nowrap" }}>
          {toast}
        </div>
      )}

      <div style={{ display:"flex", height:"100%", overflow:"hidden", flexDirection:"column" }}>
        {/* Top bar */}
        <div style={{ padding:"16px 20px 12px", borderBottom:"1px solid #EEF0F8", background:"white", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <div style={{ width:36, height:36, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#5BA970,#7EC492)" }}>
              <IconHeartPulse size={17} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize:17, fontWeight:700, color:"#1A2840", margin:0, fontFamily:"'Nunito',sans-serif" }}>Cari Faskes Terdekat</h1>
              <p style={{ fontSize:11, color:"#A8B4C8", margin:0, fontFamily:"'Nunito',sans-serif" }}>Rumah sakit, klinik, psikiater & psikolog</p>
            </div>
          </div>

          <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
            <div style={{ display:"flex", gap:4, overflowX:"auto", flexShrink:0 }}>
              {RADII.map(r => (
                <button key={r.value} onClick={() => { setRadius(r.value); if (searchPoint) doSearch(searchPoint[0], searchPoint[1], r.value); }}
                  style={{ padding:"6px 13px", borderRadius:999, fontSize:12, fontWeight:600,
                    border:`1px solid ${radius===r.value?"#415f83":"#EEF0F8"}`,
                    background:radius===r.value?"#415f83":"white",
                    color:radius===r.value?"white":"#8A96A8",
                    cursor:"pointer", flexShrink:0, fontFamily:"'Nunito',sans-serif", transition:"all 0.15s" }}>
                  {r.label}
                </button>
              ))}
            </div>
            <button onClick={locate} disabled={locating || loading}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 18px", borderRadius:12,
                background:locating?"#A8B4C8":"#415f83", color:"white", border:"none", cursor:"pointer",
                fontSize:13, fontWeight:600, flexShrink:0, fontFamily:"'Nunito',sans-serif",
                transition:"background 0.2s" }}>
              {locating
                ? <><span style={{display:"inline-block",animation:"spin 0.8s linear infinite"}}><IconLoader size={14} /></span> Mencari...</>
                : <><IconNavigation size={14} /> Gunakan Lokasimu</>
              }
            </button>
          </div>

          {error && (
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderRadius:12,
              background:"#FEF2F2", border:"1px solid #FECACA", marginTop:10 }}>
              <IconAlert size={13} color="#ef4444" />
              <span style={{ fontSize:12, color:"#dc2626", fontFamily:"'Nunito',sans-serif" }}>{error}</span>
            </div>
          )}
        </div>

        {/* Map + List */}
        <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
          {/* Map — responsive: visible on md+ */}
          <div id="faskes-map-panel" style={{ flex:1, padding:16, minWidth:0 }}>
            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
              @media (max-width: 767px) { #faskes-map-panel { display: none !important; } .faskes-list-panel { max-width: 100% !important; border-left: none !important; } }
            `}</style>
            <FaskesMap searchPoint={searchPoint} results={filtered} focusPoint={focusPoint} />
          </div>

          {/* Results */}
          <div className="faskes-list-panel" style={{ width:"100%", maxWidth:360, borderLeft:"1px solid #EEF0F8", overflowY:"auto", background:"#F8FAFF", display:"flex", flexDirection:"column" }}>
            {results.length > 0 && (
              <div style={{ padding:"12px 12px 4px", flexShrink:0 }}>
                <div style={{ position:"relative" }}>
                  <IconSearch size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#C0CCD8" }} />
                  <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Filter faskes..."
                    style={{ width:"100%", padding:"9px 14px 9px 34px", borderRadius:12, border:"1px solid #EEF0F8",
                      fontSize:13, outline:"none", background:"white", fontFamily:"'Nunito',sans-serif", boxSizing:"border-box" }} />
                </div>
              </div>
            )}

            {loading ? (
              <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, padding:24 }}>
                <span style={{display:"inline-block",animation:"spin 0.8s linear infinite"}}><IconLoader size={24} color="#415f83" /></span>
                <p style={{ fontSize:13, color:"#A8B4C8", fontFamily:"'Nunito',sans-serif" }}>Mencari faskes terdekat...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, padding:24, textAlign:"center" }}>
                <IconMapPin size={40} color="#D0D8E4" />
                <p style={{ fontSize:15, fontWeight:600, color:"#8A96A8", margin:0, fontFamily:"'Nunito',sans-serif" }}>
                  {searchPoint ? "Tidak ada faskes ditemukan" : "Tekan tombol 'Gunakan Lokasimu'"}
                </p>
                <p style={{ fontSize:12, color:"#B8C4D0", margin:0, fontFamily:"'Nunito',sans-serif" }}>
                  {searchPoint ? "Coba perbesar radius pencarian" : "untuk menemukan faskes di sekitarmu"}
                </p>
              </div>
            ) : (
              <div style={{ padding:12, overflowY:"auto", flex:1 }}>
                <p style={{ fontSize:12, fontWeight:600, color:"#A8B4C8", padding:"4px 4px 8px", fontFamily:"'Nunito',sans-serif" }}>
                  {filtered.length} faskes ditemukan
                </p>
                {Object.entries(grouped).map(([typeId, items]) => {
                  const t = FASKES_TYPES[typeId] || { label:"Lainnya", icon:"🏥" };
                  return (
                    <div key={typeId}>
                      <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em",
                        color:"#B8C4D0", padding:"6px 4px 4px", fontFamily:"'Nunito',sans-serif" }}>
                        {t.icon} {t.label} ({items.length})
                      </p>
                      {items.map(r => (
                        <FaskesCard key={r.id || r.name} faskes={r}
                          onFocus={f => {
                            setFocusPoint([f.lat, f.lon]);
                            // On desktop scroll map into view
                            document.getElementById("faskes-map-panel")?.scrollIntoView({ behavior:"smooth" });
                          }} />
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

import { useEffect, useRef } from 'react';

const FASKES_TYPES = {
  hospital:   { color: '#415f83' },
  clinic:     { color: '#5BA970' },
  psychiatry: { color: '#9B6DB5' },
  psychology: { color: '#E596B2' },
  puskesmas:  { color: '#D4962A' },
};

export default function FaskesMap({ searchPoint, results = [], focusPoint }) {
  const ref    = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!searchPoint || !ref.current) return;
    let L;

    async function init() {
      const mod = await import('leaflet');
      L = mod.default || mod;

      // Inject leaflet CSS once
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id   = 'leaflet-css';
        link.rel  = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Fix default marker icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapRef.current) {
        mapRef.current = L.map(ref.current, { zoomControl: true, scrollWheelZoom: true });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
        }).addTo(mapRef.current);
      }

      mapRef.current.setView(searchPoint, 14);

      // Clear old markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // User pin
      const userIcon = L.divIcon({
        className: '',
        html: `<div style="width:16px;height:16px;background:#415f83;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      markersRef.current.push(
        L.marker(searchPoint, { icon: userIcon })
          .bindPopup('📍 Lokasi kamu')
          .addTo(mapRef.current)
      );

      // Faskes pins
      results.forEach(r => {
        const c = (FASKES_TYPES[r.type?.id || r.type] || { color: '#6B7280' }).color;
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:12px;height:12px;background:${c};border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.2)"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });
        const m = L.marker([r.lat, r.lon], { icon });
        m.bindPopup(`<strong>${r.name}</strong><br/><small>${r.address || ''}</small>`);
        m.addTo(mapRef.current);
        markersRef.current.push(m);
      });
    }

    init().catch(console.error);
  }, [searchPoint, results]);

  // Fly to focused faskes
  useEffect(() => {
    if (!focusPoint || !mapRef.current) return;
    mapRef.current.flyTo(focusPoint, 16, { duration: 0.8 });
  }, [focusPoint]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={ref} style={{ width: '100%', height: '100%', borderRadius: 16, background: '#F0F4FA' }}>
      {!searchPoint && (
        <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, color:'#B8C4D0' }}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path strokeLinecap="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
          </svg>
          <span style={{ fontSize:13, fontFamily:"'Nunito',sans-serif" }}>Cari faskes untuk melihat peta</span>
        </div>
      )}
    </div>
  );
}

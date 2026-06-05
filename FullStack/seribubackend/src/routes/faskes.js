import { Router } from "express";

const router = Router();

const OV_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

function determineFaskesType(tags) {
  const amenity    = (tags.amenity    || "").toLowerCase();
  const healthcare = (tags.healthcare || "").toLowerCase();
  const speciality = (tags["healthcare:speciality"] || tags["speciality"] || "").toLowerCase();
  const name       = (tags.name || tags["name:en"] || "").toLowerCase();

  if (name.includes("puskesmas")) return "puskesmas";
  if (amenity === "hospital" || healthcare === "hospital") return "hospital";
  if (
    speciality.includes("psychiatry") || speciality.includes("psiki") ||
    healthcare === "psychiatrist" || healthcare === "mental_health" ||
    name.includes("jiwa") || name.includes("psikiatri")
  ) return "psychiatry";
  if (
    speciality.includes("psychology") || healthcare === "psychologist" ||
    name.includes("psikolog")
  ) return "psychology";
  return "clinic";
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseOverpassElements(elements, originLat, originLon) {
  return elements
    .filter(el => el.tags)
    .map(el => {
      const tags = el.tags || {};
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      if (elLat == null || elLon == null) return null;

      const name = tags.name || tags["name:en"] || tags["name:id"] || "Fasilitas Kesehatan";
      const address = [
        tags["addr:street"],
        tags["addr:housenumber"],
        tags["addr:suburb"],
        tags["addr:city"],
      ].filter(Boolean).join(", ") || tags.address || "";

      const phone = tags.phone || tags["contact:phone"] || tags["contact:mobile"] || "";
      const website = tags.website || tags["contact:website"] || "";
      const mapsUrl = website || `https://www.google.com/maps?q=${elLat},${elLon}`;

      const dist = Math.round(haversineKm(originLat, originLon, elLat, elLon) * 100) / 100;
      const type = determineFaskesType(tags);

      return {
        id: `${el.type}_${el.id}`,
        name,
        type,
        lat: elLat,
        lon: elLon,
        address,
        phone,
        mapsUrl,
        dist,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.dist - b.dist);
}

// GET /api/faskes/search?lat=&lon=&radius=
router.get("/search", async (req, res) => {
  const { lat, lon, radius } = req.query;
  if (!lat || !lon || !radius) {
    return res.status(400).json({ error: "lat, lon, radius required" });
  }

  const numLat    = parseFloat(lat);
  const numLon    = parseFloat(lon);
  const numRadius = parseInt(radius, 10);

  const ovQuery = `[out:json][timeout:25];(nwr["amenity"~"^(hospital|clinic|doctors)$"](around:${numRadius},${numLat},${numLon});nwr["healthcare"](around:${numRadius},${numLat},${numLon}););out body center qt;`;

  for (const endpoint of OV_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 26000);
      const ovRes = await fetch(`${endpoint}?data=${encodeURIComponent(ovQuery)}`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (ovRes.ok) {
        const data = await ovRes.json();
        const results = parseOverpassElements(data.elements || [], numLat, numLon);
        return res.json({ results });
      }
    } catch (err) {
      console.warn(`Overpass endpoint failed: ${endpoint} —`, err.message);
    }
  }

  return res.status(503).json({ error: "Overpass API tidak tersedia, coba lagi nanti." });
});

export default router;

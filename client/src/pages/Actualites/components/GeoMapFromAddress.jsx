// GeoMapFromAddress.jsx
// ---------------------------------------------------------------------------
// Géocode une adresse via Nominatim (HTTP GET) puis affiche une carte OSM
// via iframe. Fallback : iframe OSM sur la requête si pas de coord.
// Aucun paquet externe requis.
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";

export default function GeoMapFromAddress({
  address,
  height = 360,
  className = "",
  zoom = 14,
}) {
  const [pos, setPos] = useState(null); // {lat, lon}
  const [err, setErr] = useState(null);
  const query = useMemo(() => (address || "").trim(), [address]);

  useEffect(() => {
    let abort = false;
    setErr(null);
    setPos(null);
    if (!query) return;
    (async () => {
      try {
        const url =
          "https://nominatim.openstreetmap.org/search?format=json&q=" +
          encodeURIComponent(query);
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        const data = (await res.json()) || [];
        if (!abort && Array.isArray(data) && data.length > 0) {
          setPos({
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
          });
        } else if (!abort) {
          setErr("noresult");
        }
      } catch {
        if (!abort) setErr("net");
      }
    })();
    return () => {
      abort = true;
    };
  }, [query]);

  if (!query) return null;

  const style = {
    width: "100%",
    height: `${height}px`,
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  };

  // Fallback si pas encore géocodé : OSM sur la recherche
  if (!pos) {
    return (
      <iframe
        title="Carte"
        style={style}
        className={className}
        src={`https://www.openstreetmap.org/export/embed.html?search=${encodeURIComponent(
          query
        )}`}
        loading="lazy"
      />
    );
  }

  const bbox = `${pos.lon - 0.01},${pos.lat - 0.01},${pos.lon + 0.01},${
    pos.lat + 0.01
  }`;
  return (
    <iframe
      title="Carte"
      style={style}
      className={className}
      src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${pos.lat},${pos.lon}&zoom=${zoom}`}
      loading="lazy"
    />
  );
}

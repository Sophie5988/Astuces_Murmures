// src/pages/Actualites/components/ActualiteDetailLayout.jsx
// ============================================================================
// LAYOUT VISUEL COMMUN — une seule grande “carte” (preview + détail)
// ---------------------------------------------------------------------------
// ✅ Images : gère URLs persistées + blobs de preview
// ✅ Carte OSM (géocodage Nominatim)
// ✅ Horaires :
//    - Événement ➜ UN SEUL bloc "Horaires" (par dates) + affichage de la PLAGE
//      de dates (ex. 20/11/2025 → 21/11/2025)
//    - Commerce ➜ bloc hebdo (seulement si ce n’est PAS un événement)
// ✅ Design Tailwind “zen” (beige clair, ombres, arrondis)
// ✅ SUPPRESSION des badges “Événement” et “Prévisualisation”
// ============================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Phone,
  Mail,
  Tag,
  ParkingSquare,
  User,
  Image as ImgIcon,
} from "lucide-react";

// ---------- Utils -----------------------------------------------------------

// Format FR lisible (20 novembre 2025)
const formatDateFR = (d) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

// Petits helpers de contrôle
const notEmpty = (v) => !!(Array.isArray(v) ? v.length : v);
const isObject = (v) => v && typeof v === "object";

// Labels jours (pour l’affichage commerce)
const DAYS_LABELS = {
  lun: "Lun",
  mar: "Mar",
  mer: "Mer",
  jeu: "Jeu",
  ven: "Ven",
  sam: "Sam",
  dim: "Dim",
};

// Trie des clés de dates (AAAA-MM-JJ) croissant
const sortDateKeys = (obj = {}) =>
  Object.keys(obj)
    .filter(Boolean)
    .sort((a, b) => new Date(a) - new Date(b));

// ---------- OpenStreetMap embed --------------------------------------------
// Construit l’URL embed autour d’un point lat/lon avec une petite bbox
function makeOsmEmbedUrl(lat, lon, delta = 0.01) {
  const minLon = lon - delta;
  const minLat = lat - delta;
  const maxLon = lon + delta;
  const maxLat = lat + delta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon},${minLat},${maxLon},${maxLat}&layer=mapnik&marker=${lat},${lon}`;
}

// ============================================================================

export default function ActualiteDetailLayout({
  actualite,
  isPreview = false, // on garde la prop pour compat, mais on n’affiche plus de badge
}) {
  const { state } = useLocation(); // récupère d’éventuels File blobs depuis la preview
  const createdBlobUrls = useRef([]); // pour nettoyer les URL.createObjectURL

  // ----- TYPE ---------------------------------------------------------------
  // On reconnaît un "événement" de manière souple (majuscules / minuscules)
  const isEvent = useMemo(() => {
    const t = (actualite?.type || actualite?.categorie || "")
      .toString()
      .toLowerCase();
    return t.includes("evenement") || t === "event";
  }, [actualite?.type, actualite?.categorie]);

  // ----- IMAGES -------------------------------------------------------------
  const images = useMemo(() => {
    const list = [];

    // 1) URLs déjà persistées
    if (actualite.image) list.push(actualite.image);
    if (Array.isArray(actualite.photos))
      list.push(...actualite.photos.filter(Boolean));

    // 2) URLs de preview stockées dans l’objet
    if (actualite.imagePreview) list.push(actualite.imagePreview);
    if (Array.isArray(actualite.photosPreviews))
      list.push(...actualite.photosPreviews.filter(Boolean));

    // 3) Blobs reçus via state.files (AddActualiteModal → Preview)
    const f = state?.files;
    if (f?.imageFile instanceof File) {
      const url = URL.createObjectURL(f.imageFile);
      createdBlobUrls.current.push(url);
      list.push(url);
    }
    if (Array.isArray(f?.photosFiles)) {
      f.photosFiles.forEach((file) => {
        if (file instanceof File) {
          const url = URL.createObjectURL(file);
          createdBlobUrls.current.push(url);
          list.push(url);
        }
      });
    }

    // Dédoublonnage
    const uniq = [];
    const seen = new Set();
    for (const u of list) {
      if (!u || seen.has(u)) continue;
      seen.add(u);
      uniq.push(u);
    }
    return uniq;
  }, [actualite, state?.files]);

  // Nettoyage des blobs à l’unmount
  useEffect(() => {
    return () => {
      createdBlobUrls.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
      createdBlobUrls.current = [];
    };
  }, []);

  // Slider auto simple
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 2500);
    return () => clearInterval(t);
  }, [images.length]);

  // ----- PERIODE (affiche la PLAGE si dateDebut + dateFin) ------------------
  const periode = useMemo(() => {
    const d1 = actualite.dateDebut || actualite.date;
    const d2 = actualite.dateFin;
    if (d1) return `${formatDateFR(d1)}${d2 ? ` → ${formatDateFR(d2)}` : ""}`;
    return [actualite.mois, actualite.date].filter(Boolean).join(" - ");
  }, [actualite]);

  // ----- HORAIRES EVENEMENT (par date) --------------------------------------
  const hasEventHours =
    isObject(actualite.horairesEvenementParDate) &&
    Object.keys(actualite.horairesEvenementParDate).some(
      (k) => (actualite.horairesEvenementParDate?.[k] || "").trim() !== ""
    );

  const eventHoursSortedKeys = useMemo(
    () =>
      hasEventHours ? sortDateKeys(actualite.horairesEvenementParDate) : [],
    [hasEventHours, actualite.horairesEvenementParDate]
  );

  // Cas pratique : un seul créneau identique pour toute la plage (form saisit 1 ligne)
  const singleEventTime =
    hasEventHours && eventHoursSortedKeys.length === 1
      ? (
          actualite.horairesEvenementParDate?.[eventHoursSortedKeys[0]] || ""
        ).trim()
      : null;

  // ----- HORAIRES COMMERCE (hebdo) ------------------------------------------
  const hasShopHours =
    !isEvent && // 👉 uniquement si ce n’est PAS un événement
    isObject(actualite.horairesCommerce) &&
    Object.keys(actualite.horairesCommerce).some((k) => {
      const h = actualite.horairesCommerce[k];
      if (!h) return false;
      if (h.closed) return true;
      if (h.continuous && (h.full || "").trim()) return true;
      if (
        !h.continuous &&
        ((h.morning || "").trim() || (h.afternoon || "").trim())
      )
        return true;
      return false;
    });

  // ----- GÉOCODAGE + MAP ----------------------------------------------------
  const [geo, setGeo] = useState({
    lat: null,
    lon: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    let abort = false;

    async function geocode() {
      const raw = (actualite.adresseComplete || "").trim(); // adresse complète
      if (!raw) {
        // Pas d’adresse ➜ on informe l’état et on sort
        setGeo({
          lat: null,
          lon: null,
          loading: false,
          error: "Aucune adresse",
        });
        return;
      }

      // Petit helper pour interroger Nominatim proprement
      const tryGeocode = async (q) => {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}`;
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        const data = await res.json().catch(() => []);
        if (Array.isArray(data) && data.length) {
          const best = data[0];
          const lat = parseFloat(best.lat);
          const lon = parseFloat(best.lon);
          if (!Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lon };
        }
        return null;
      };

      try {
        setGeo((g) => ({ ...g, loading: true, error: null }));

        // Tentative 1 : adresse telle quelle
        let point = await tryGeocode(raw);

        // ➕ Fallback 1 (DEMANDÉ) : ville + ", " + (departement || "France")
        if (!point && !abort) {
          const v = (actualite?.ville || "").trim(); // récupère la ville si fournie
          const dpt = (actualite?.departement || "France").trim(); // département ou “France” par défaut
          if (v) {
            point = await tryGeocode(`${v}, ${dpt}`); // ex: "Caudry, Nord"
          }
        }

        // ➕ Fallback 2 (DEMANDÉ) : seulement departement + ", France"
        if (!point && !abort) {
          const dptOnly = (actualite?.departement || "").trim(); // récupère juste le département
          if (dptOnly) {
            point = await tryGeocode(`${dptOnly}, France`); // ex: "Nord, France"
          }
        }

        // Tentative 2 existante : on ajoute ", France" si absent sur l’adresse brute
        if (!point && !/france/i.test(raw)) {
          point = await tryGeocode(`${raw}, France`);
        }

        // Tentative 3 existante : normalisation légère “Caudry, France”
        if (!point && /caudry/i.test(raw) && !/france/i.test(raw)) {
          point = await tryGeocode("Caudry, France");
        }

        // Dernier filet existant : coordonnées centrales de Caudry si l’adresse contient “Caudry”
        if (!point && /caudry/i.test(raw)) {
          point = { lat: 50.108, lon: 3.414 }; // centre-ville approximatif
        }

        if (abort) return;

        // Mise à jour de l’état suivant le résultat
        if (point) {
          setGeo({ ...point, loading: false, error: null });
        } else {
          setGeo({
            lat: null,
            lon: null,
            loading: false,
            error: "Adresse introuvable",
          });
        }
      } catch {
        if (!abort) {
          setGeo({
            lat: null,
            lon: null,
            loading: false,
            error: "Géocodage indisponible",
          });
        }
      }
    }

    geocode();
    return () => {
      abort = true; // annule les mises à jour d’état après unmount
    };
  }, [actualite.adresseComplete, actualite?.ville, actualite?.departement]); // ➜ dépendances mises à jour pour les fallbacks

  const mapUrl =
    geo.lat && geo.lon ? makeOsmEmbedUrl(geo.lat, geo.lon, 0.01) : null;

  // ==========================================================================

  return (
    <div className="max-w-6xl mx-auto">
      {/* ======= UN SEUL GROS CONTENEUR ======= */}
      <div className="rounded-3xl bg-[#f6f0dc] border-2 border-[#e6d7a5] shadow-2xl overflow-hidden">
        {/* Bandeau (TITRE SANS BADGES) */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-100 to-yellow-50 border-b border-[#e6d7a5]">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1b2a1b]">
                {isEvent ? actualite.titreEvenement : actualite.nomMagasin}
              </h1>
              {actualite.phraseAccroche && (
                <p className="text-[#355235] italic mt-1">
                  {actualite.phraseAccroche}
                </p>
              )}
            </div>
            {/* 👉 Plus de badges “Événement / Prévisualisation” */}
          </div>
        </div>

        {/* Corps */}
        <div className="p-6 space-y-6">
          {/* SLIDER */}
          <div className="rounded-2xl overflow-hidden bg-white border border-[#e6d7a5] shadow">
            {images.length ? (
              <div className="relative">
                <img
                  src={images[idx]}
                  alt="visuel"
                  className="w-full h-[280px] sm:h-[360px] object-cover transition-transform duration-500"
                />
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIdx(i)}
                      className={`w-3 h-3 rounded-full border border-white ${
                        i === idx ? "bg-white" : "bg-white/50"
                      }`}
                      aria-label={`Voir image ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[220px] sm:h-[260px] flex items-center justify-center text-[#355235]">
                <ImgIcon className="w-8 h-8 opacity-70" />
                <span className="ml-2">Aucune image fournie</span>
              </div>
            )}
          </div>

          {/* DESCRIPTION */}
          {actualite.contenu && (
            <section className="rounded-2xl bg-white border border-[#e6d7a5] shadow p-5">
              <h2 className="text-xl font-semibold text-[#1b2a1b] mb-2">
                Description
              </h2>
              <p className="text-[#355235] leading-relaxed">
                {actualite.contenu}
              </p>
            </section>
          )}

          {/* INFOS CLÉS */}
          <section className="grid md:grid-cols-2 gap-4">
            {periode && (
              <div className="rounded-2xl bg-white border border-[#e6d7a5] shadow p-4">
                <div className="flex items-center gap-2 text-[#1b2a1b] font-medium">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Période
                </div>
                <p className="text-[#355235] mt-1">{periode}</p>
              </div>
            )}

            {(actualite.departement || actualite.adresseComplete) && (
              <div className="rounded-2xl bg-white border border-[#e6d7a5] shadow p-4">
                <div className="flex items-center gap-2 text-[#1b2a1b] font-medium">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  Localisation
                </div>
                {actualite.departement && (
                  <p className="text-[#355235] mt-1">{actualite.departement}</p>
                )}
                {actualite.adresseComplete && (
                  <p className="text-[#355235]">{actualite.adresseComplete}</p>
                )}
                {actualite.parkingFacile && (
                  <p className="mt-1 inline-flex items-center gap-1 text-green-700 text-sm">
                    <ParkingSquare className="w-4 h-4" /> Parking facile
                  </p>
                )}
              </div>
            )}

            {(actualite.organisateurs || actualite.author?.username) && (
              <div className="rounded-2xl bg-white border border-[#e6d7a5] shadow p-4">
                <div className="flex items-center gap-2 text-[#1b2a1b] font-medium">
                  <User className="w-5 h-5 text-indigo-600" />
                  Organisation
                </div>
                {actualite.organisateurs && (
                  <p className="text-[#355235] mt-1">
                    {actualite.organisateurs}
                  </p>
                )}
                {actualite.author?.username && (
                  <p className="text-[#355235] text-sm">
                    Auteur : {actualite.author.username}
                  </p>
                )}
              </div>
            )}

            {(actualite.telephone || actualite.adresseMail) && (
              <div className="rounded-2xl bg-white border border-[#e6d7a5] shadow p-4">
                <h3 className="text-[#1b2a1b] font-medium">Contacts</h3>
                {actualite.telephone && (
                  <p className="text-[#355235] mt-1">
                    <span className="inline-flex items-center gap-2">
                      <Phone className="w-4 h-4 text-indigo-600" />
                      {actualite.telephone}
                    </span>
                  </p>
                )}
                {actualite.adresseMail && (
                  <p className="text-[#355235]">
                    <span className="inline-flex items-center gap-2">
                      <Mail className="w-4 h-4 text-indigo-600" />
                      {actualite.adresseMail}
                    </span>
                  </p>
                )}
              </div>
            )}
          </section>

          {/* =================== HORAIRES =================== */}

          {/* A) ÉVÉNEMENT : UN SEUL BLOC */}
          {isEvent && hasEventHours && (
            <section className="rounded-2xl bg-white border border-[#e6d7a5] shadow p-5">
              {/* Titre simple */}
              <h2 className="text-xl font-semibold text-[#1b2a1b] mb-2">
                Horaires
              </h2>

              {/* Affiche la PLAGE de dates du formulaire */}
              {(actualite.dateDebut || actualite.dateFin) && (
                <p className="text-[#355235] mb-2">
                  {formatDateFR(actualite.dateDebut || actualite.date)}
                  {actualite.dateFin
                    ? ` → ${formatDateFR(actualite.dateFin)}`
                    : ""}
                </p>
              )}

              {/* Si une seule ligne d’horaire a été saisie, on l’affiche une fois */}
              {singleEventTime ? (
                <div className="flex justify-between text-[#355235]">
                  <span className="opacity-70">Créneau</span>
                  <span className="font-medium">{singleEventTime}</span>
                </div>
              ) : (
                // Sinon, affichage par date (tri croissant)
                <ul className="space-y-1 text-[#355235]">
                  {eventHoursSortedKeys.map((d) => {
                    const val = (
                      actualite.horairesEvenementParDate?.[d] || ""
                    ).trim();
                    if (!val) return null;
                    return (
                      <li key={d} className="flex justify-between">
                        <span>{formatDateFR(d)}</span>
                        <span className="font-medium">{val}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          {/* B) COMMERCE : bloc hebdo (UNIQUEMENT si ce n’est pas un événement) */}
          {hasShopHours && (
            <section className="rounded-2xl bg-white border border-[#e6d7a5] shadow p-5">
              <h2 className="text-xl font-semibold text-[#1b2a1b] mb-2">
                Horaires
              </h2>
              <div className="grid sm:grid-cols-2 gap-2 text-[#355235]">
                {Object.entries(actualite.horairesCommerce || {}).map(
                  ([k, h]) => {
                    if (!h) return null;
                    let content = "";
                    if (h.closed) content = "Fermé";
                    else if (h.continuous && (h.full || "").trim())
                      content = h.full;
                    else if (!h.continuous) {
                      const m = (h.morning || "").trim();
                      const a = (h.afternoon || "").trim();
                      content = [m, a].filter(Boolean).join(" / ");
                    }
                    if (!content) return null;
                    return (
                      <div
                        key={k}
                        className="flex items-center justify-between border border-[#e6d7a5] rounded-xl px-3 py-2 bg-amber-50/30"
                      >
                        <span className="font-medium">
                          {DAYS_LABELS[k] || k}
                        </span>
                        <span>{content}</span>
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          )}

          {/* TARIFS */}
          {notEmpty(actualite.tarifs) && (
            <section className="rounded-2xl bg-white border border-[#e6d7a5] shadow p-5">
              <h2 className="text-xl font-semibold text-[#1b2a1b] mb-2">
                Tarifs
              </h2>
              <ul className="space-y-1 text-[#355235]">
                {actualite.tarifs.map((t, i) => (
                  <li key={`${t.label}_${i}`} className="flex justify-between">
                    <span>{t.label}</span>
                    <span className="font-medium">{t.price}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* MOTS-CLÉS */}
          {Array.isArray(actualite.keywords) &&
            actualite.keywords.length > 0 && (
              <section className="rounded-2xl bg-white border border-[#e6d7a5] shadow p-4">
                <div className="flex items-center gap-2 text-[#1b2a1b] font-medium">
                  <Tag className="w-5 h-5 text-indigo-600" /> Mots-clés
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {actualite.keywords.map((k, i) => (
                    <span
                      key={`${k}_${i}`}
                      className="text-sm px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </section>
            )}

          {/* CARTE OSM */}
          {actualite.adresseComplete && (
            <section className="rounded-2xl overflow-hidden bg-white border border-[#e6d7a5] shadow">
              <div className="p-4 border-b border-[#e6d7a5] text-[#1b2a1b] font-semibold">
                Carte
              </div>

              {geo.loading && (
                <div className="p-4 text-sm text-[#355235]">
                  Recherche de l’adresse sur la carte…
                </div>
              )}

              {!geo.loading && geo.error && (
                <div className="p-4 text-sm text-[#355235]">
                  {geo.error}. Carte non disponible.
                </div>
              )}

              {!geo.loading && mapUrl && (
                <iframe
                  title="Carte OpenStreetMap"
                  src={mapUrl}
                  className="w-full h-[320px]"
                  loading="lazy"
                />
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

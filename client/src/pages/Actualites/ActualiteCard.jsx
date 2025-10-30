// src/pages/Actualites/components/ActualiteCard.jsx
// ============================================================================
// CARTE D’ACTUALITÉ — LISTE PUBLIQUE + GÉOLOCALISATION GRATUITE
// ----------------------------------------------------------------------------
// • On conserve ton design (fonds doux, ombres, hover scale).
// • Ajout d’un bouton "Voir sur la carte" :
//    - Géocodage gratuit via Nominatim (OpenStreetMap) en fonction de l’adresse.
//    - Affiche une carte intégrée (iframe OSM) + lien "Ouvrir dans OpenStreetMap".
// • Zéro clé API, 100% client. Compatible Vite/React.
//
// DÉTAIL TECHNIQUE :
// - Au clic, on déclenche le fetch Nominatim (si pas déjà résolu).
// - On compose la requête à partir de : adresseComplete + departement + "France".
// - On stocke lat/lon en état local. En cas d’erreur => message simple.
// - L’iframe OSM utilise export/embed avec un marker et un bbox compact.
// - Couleurs & styles harmonisés Tailwind (zen).
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Map as MapIcon,
} from "lucide-react";

export default function ActualiteCard({ actualite }) {
  // --------------------------------------------------------------------------
  // 1) Petits helpers (format date + phrase titre)
  // --------------------------------------------------------------------------
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const titre = useMemo(
    () =>
      actualite?.type === "Evenement"
        ? actualite?.titreEvenement
        : actualite?.nomMagasin,
    [actualite]
  );

  // --------------------------------------------------------------------------
  // 2) États géolocalisation (lat/lon + chargement + erreurs + affichage carte)
  // --------------------------------------------------------------------------
  const [showMap, setShowMap] = useState(false); // affiche/masque la zone carte
  const [geolocLoading, setGeolocLoading] = useState(false);
  const [geolocError, setGeolocError] = useState("");
  const [coords, setCoords] = useState(null); // { lat, lon }

  // Chaîne d’adresse "riche" pour la requête Nominatim
  const fullQuery = useMemo(() => {
    const parts = [
      actualite?.adresseComplete || "",
      actualite?.departement || "",
      "France",
    ]
      .filter(Boolean)
      .join(", ");
    return parts;
  }, [actualite?.adresseComplete, actualite?.departement]);

  // --------------------------------------------------------------------------
  // 3) Géocodage via Nominatim (gratuit)
  //    - On ne lance la requête QUE si l’utilisateur ouvre la carte.
  //    - On fait un seul fetch (coords en cache local tant que la carte vit).
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!showMap) return; // pas besoin de géocoder tant que la carte est masquée
    if (coords || geolocLoading) return; // déjà géocodé ou en cours

    let cancelled = false;
    (async () => {
      try {
        setGeolocLoading(true);
        setGeolocError("");

        // API Nominatim : https://nominatim.org/release-docs/develop/api/Search/
        // format=json&limit=1&q=<adresse> (+ email pour courtoisie)
        const url =
          "https://nominatim.openstreetmap.org/search?" +
          new URLSearchParams({
            format: "json",
            q: fullQuery,
            limit: "1",
            addressdetails: "0",
            email: "contact@astuces-murmures.local", // poli pour Nominatim
          }).toString();

        const res = await fetch(url, {
          headers: {
            // Conseillé : indiquer Accept-Language pour des résultats FR cohérents
            "Accept-Language": "fr",
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const best = Array.isArray(data) && data.length ? data[0] : null;
        if (!best || !best.lat || !best.lon) {
          throw new Error("Adresse introuvable");
        }

        if (!cancelled) {
          setCoords({ lat: parseFloat(best.lat), lon: parseFloat(best.lon) });
        }
      } catch (e) {
        if (!cancelled)
          setGeolocError("Impossible de localiser cette adresse.");
      } finally {
        if (!cancelled) setGeolocLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [showMap, coords, fullQuery, geolocLoading]);

  // --------------------------------------------------------------------------
  // 4) Préparation de l'embed OpenStreetMap
  //    - On fabrique un bbox (petit carré autour du point) pour centrer la carte.
  // --------------------------------------------------------------------------
  const embed = useMemo(() => {
    if (!coords) return null;

    // BBOX simple : ±0.01 degrés autour du point (≈1.1km)
    const d = 0.01;
    const minLon = (coords.lon - d).toFixed(6);
    const minLat = (coords.lat - d).toFixed(6);
    const maxLon = (coords.lon + d).toFixed(6);
    const maxLat = (coords.lat + d).toFixed(6);

    // URL embed + un marker (lat,lon)
    const src =
      `https://www.openstreetmap.org/export/embed.html?` +
      `bbox=${minLon},${minLat},${maxLon},${maxLat}` +
      `&layer=mapnik&marker=${coords.lat},${coords.lon}`;

    // Lien qui ouvre la carte OSM centrée sur le marker
    const link =
      `https://www.openstreetmap.org/?mlat=${coords.lat}` +
      `&mlon=${coords.lon}#map=16/${coords.lat}/${coords.lon}`;

    return { src, link };
  }, [coords]);

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <div className="container mx-auto px-6 py-8 bg-[#fddede] shadow-[5px_5px_5px_rgba(0,0,0,0.65)] hover:shadow-[8px_8px_8px_rgba(0,0,0,0.7)]">
      <div className="w-full max-w-[900px] h-[500px] flex bg-[#ddd9c4] rounded-2xl overflow-hidden shadow-[5px_5px_5px_rgba(0,0,0,0.65)] hover:shadow-[8px_8px_8px_rgba(0,0,0,0.7)] mx-auto">
        {/* =================================================================== */}
        {/* IMAGE (1/3)                                                        */}
        {/* =================================================================== */}
        <div className="w-1/3 h-full flex-shrink-0 relative overflow-hidden">
          {actualite.image ? (
            <img
              src={actualite.image}
              alt={titre}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center">
              <div className="text-6xl">
                {actualite.type === "Evenement" ? "🎪" : "🏪"}
              </div>
            </div>
          )}

          {/* Badge type */}
          <div className="absolute top-3 left-3 bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
            {actualite.type === "Evenement" ? "Événement" : "Boutique"}
          </div>

          {/* Badge EN ATTENTE si nécessaire */}
          {actualite.status === "pending" && (
            <div className="absolute top-3 right-3 bg-amber-500 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow">
              En attente
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* CONTENU (2/3)                                                      */}
        {/* =================================================================== */}
        <div className="w-2/3 h-full flex flex-col p-6">
          <div className="flex-1 flex flex-col">
            <div className="border-4 border-slate-400 rounded-2xl p-1 shadow-lg flex-1 flex flex-col">
              <div className="border-2 border-slate-200 rounded-xl bg-white/90 backdrop-blur-sm flex-1 flex flex-col">
                <div className="p-4 flex-1 flex flex-col">
                  {/* ---------- TITRE ---------- */}
                  <div className="mb-4 text-center">
                    <h2 className="text-xl font-bold text-slate-800 line-clamp-2 leading-tight">
                      {titre}
                    </h2>
                    {actualite.phraseAccroche && (
                      <p className="text-sm text-indigo-600 italic mt-1 line-clamp-1">
                        "{actualite.phraseAccroche}"
                      </p>
                    )}
                  </div>

                  {/* ---------- DESCRIPTION ---------- */}
                  <div className="flex-1 mb-4">
                    <p className="text-slate-700 leading-relaxed text-sm">
                      {actualite.contenu}
                    </p>
                  </div>

                  {/* ---------- INFOS ---------- */}
                  <div className="space-y-3 mb-4">
                    {actualite.type === "Evenement" && (
                      <>
                        {actualite.organisateurs && (
                          <div className="flex items-center text-xs text-slate-700">
                            <User className="w-4 h-4 mr-2 text-indigo-500" />
                            <span className="font-medium">Organisé par:</span>
                            <span className="ml-1">
                              {actualite.organisateurs}
                            </span>
                          </div>
                        )}
                        {(actualite.mois ||
                          actualite.dateDebut ||
                          actualite.dateFin) && (
                          <div className="flex items-center text-xs text-slate-700">
                            <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                            <span>
                              {actualite.mois && `${actualite.mois}`}
                              {actualite.mois &&
                                (actualite.dateDebut || actualite.dateFin) &&
                                " - "}
                              {actualite.dateDebut &&
                                new Date(
                                  actualite.dateDebut
                                ).toLocaleDateString("fr-FR")}
                              {actualite.dateFin &&
                                ` → ${new Date(
                                  actualite.dateFin
                                ).toLocaleDateString("fr-FR")}`}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {actualite.departement && (
                      <div className="flex items-center text-xs text-slate-700">
                        <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                        <span>{actualite.departement}</span>
                      </div>
                    )}

                    {actualite.adresseComplete && (
                      <div className="flex items-start text-xs text-slate-700">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 text-indigo-500" />
                        <span className="line-clamp-2">
                          {actualite.adresseComplete}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ---------- CONTACT + DATE + GÉO ---------- */}
                  <div className="mt-auto space-y-3 pt-3 border-t border-slate-200">
                    {/* Contact */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-4">
                        {actualite.telephone && (
                          <div className="flex items-center gap-1 text-xs text-slate-700">
                            <Phone className="w-3 h-3 text-indigo-500" />
                            <span>{actualite.telephone}</span>
                          </div>
                        )}
                        {actualite.adresseMail && (
                          <div className="flex items-center gap-1 text-xs text-slate-700">
                            <Mail className="w-3 h-3 text-indigo-500" />
                            <span className="truncate max-w-[150px]">
                              {actualite.adresseMail}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bouton "Voir sur la carte" */}
                      {fullQuery && (
                        <button
                          type="button"
                          onClick={() => setShowMap((v) => !v)}
                          className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition shadow-md"
                          title="Géolocaliser via OpenStreetMap (gratuit)"
                        >
                          <MapIcon className="w-4 h-4" />
                          {showMap ? "Masquer la carte" : "Voir sur la carte"}
                        </button>
                      )}
                    </div>

                    {/* Ligne auteur + date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-slate-700">
                        <User className="w-3 h-3 mr-1" />
                        <span className="font-medium">
                          {actualite.author?.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-700">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(actualite.createdAt)}</span>
                      </div>
                    </div>

                    {/* ---------- ZONE CARTE (affichage conditionnel) ---------- */}
                    {showMap && (
                      <div className="mt-3">
                        {/* États de chargement / erreur */}
                        {geolocLoading && (
                          <div className="text-center text-sm text-slate-700 py-3">
                            Recherche de l’adresse sur la carte…
                          </div>
                        )}
                        {geolocError && (
                          <div className="text-center text-sm text-red-600 py-3">
                            {geolocError}
                          </div>
                        )}

                        {/* Iframe OSM quand on a lat/lon */}
                        {embed && (
                          <div className="rounded-xl overflow-hidden shadow-lg border-2 border-emerald-700">
                            <iframe
                              title={`Carte - ${titre}`}
                              src={embed.src}
                              className="w-full h-60"
                              loading="lazy"
                            />
                            <div className="bg-emerald-50 px-3 py-2 text-right">
                              <a
                                href={embed.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold underline"
                              >
                                Ouvrir dans OpenStreetMap
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {/* /ZONE CARTE */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /CONTENU */}
      </div>
    </div>
  );
}

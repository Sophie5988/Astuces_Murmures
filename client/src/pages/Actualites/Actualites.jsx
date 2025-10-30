import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useActualite } from "../../context/ActualiteContext";
import { useAuth } from "../../context/AuthContext";
import AddActualiteModal from "./AddActualiteModal";
import {
  Search,
  Plus,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Utilitaires dates + formats
// ---------------------------------------------------------------------------
const DAY = 24 * 60 * 60 * 1000;
const toDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : d;
};
const formatDateFR = (d) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

// Extrait la ville de "... 59777 Lille" → "Lille"
const extractCity = (addr = "") => {
  const m = addr.match(/(\d{5})\s+(.+)$/);
  return m ? m[2].trim() : "";
};

// Renvoie une image fiable (image principale ou 1ère photo)
const getMainImage = (a) => {
  if (a?.image) return a.image;
  if (Array.isArray(a?.photos) && a.photos[0]) return a.photos[0];
  if (Array.isArray(a?.photosPreviews) && a.photosPreviews[0])
    return a.photosPreviews[0];
  if (a?.imagePreview) return a.imagePreview;
  return null;
};

/* ----------------------------------------------------------------------------
   ✅ composant utilitaire: image sûre avec fallback "Pas d'image"
   - alt="" => jamais de texte affiché si l'image échoue à charger
   - onError => on montre un bloc placeholder
---------------------------------------------------------------------------- */
function SafeImage({ src, className, heightClass = "h-40" }) {
  const [ok, setOk] = useState(!!src);
  useEffect(() => setOk(!!src), [src]);

  if (!ok) {
    return (
      <div
        className={`w-full ${heightClass} bg-rose-100 rounded-xl flex items-center justify-center text-rose-600`}
      >
        Pas d’image
      </div>
    );
  }
  return (
    <img
      src={src}
      alt="" // ⬅️ pas de titre visible si l’image casse
      draggable={false}
      className={`w-full ${heightClass} object-cover rounded-xl ${
        className || ""
      }`}
      onError={() => setOk(false)}
    />
  );
}

// ===========================================================================
// PAGE : Actualites
// ===========================================================================
export default function Actualites() {
  const { actualites = [] } = useActualite() || {};
  const { userConnected } = useAuth() || {};
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);

  const [searchDate, setSearchDate] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [searchName, setSearchName] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const [showAllEvents, setShowAllEvents] = useState(false);
  useEffect(() => {
    if (location?.state?.showAllEvents) setShowAllEvents(true);
  }, [location?.state?.showAllEvents]);

  const departments = [
    "02 - Aisne",
    "59 - Nord",
    "60 - Oise",
    "62 - Pas-de-Calais",
    "80 - Somme",
  ];

  const matchByInputs = (a) => {
    const matchesType =
      selectedType === "" ||
      a.type === selectedType ||
      (selectedType === "Commerce" && a.type === "Boutique");

    const matchesName =
      searchName === "" ||
      ((a.type === "Boutique" || a.type === "Commerce") &&
        a.nomMagasin?.toLowerCase().includes(searchName.toLowerCase())) ||
      (a.type === "Evenement" &&
        a.titreEvenement?.toLowerCase().includes(searchName.toLowerCase()));

    const matchesDepartment =
      searchDepartment === "" || a.departement === searchDepartment;

    const matchesDate =
      searchDate === "" ||
      (a.mois && a.mois.toLowerCase().includes(searchDate.toLowerCase())) ||
      (a.date && a.date.includes(searchDate));

    return matchesType && matchesName && matchesDepartment && matchesDate;
  };

  const evenements = useMemo(
    () => actualites.filter((a) => a.type === "Evenement"),
    [actualites]
  );
  const commerces = useMemo(
    () =>
      actualites.filter((a) => a.type === "Commerce" || a.type === "Boutique"),
    [actualites]
  );

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const plus3mois = useMemo(() => {
    const d = new Date(today);
    d.setMonth(d.getMonth() + 3);
    return d;
  }, [today]);

  const getDebut = (a) => toDate(a.dateDebut) || toDate(a.date);

  const evenementsAvenir = useMemo(() => {
    return evenements
      .filter((a) => {
        const d = getDebut(a);
        if (!d) return false;
        return d >= today && d <= plus3mois;
      })
      .filter(matchByInputs)
      .sort(
        (a, b) => (getDebut(a)?.getTime() || 0) - (getDebut(b)?.getTime() || 0)
      );
  }, [
    evenements,
    today,
    plus3mois,
    searchName,
    searchDepartment,
    searchDate,
    selectedType,
  ]);

  const commercesRecents = useMemo(() => {
    return commerces
      .filter((a) => {
        const ref = toDate(a.createdAt) || toDate(a.date);
        if (!ref) return false;
        return today.getTime() - ref.getTime() <= 30 * DAY;
      })
      .filter(matchByInputs)
      .sort(
        (a, b) =>
          (toDate(b.createdAt)?.getTime() || toDate(b.date)?.getTime() || 0) -
          (toDate(a.createdAt)?.getTime() || toDate(a.date)?.getTime() || 0)
      );
  }, [
    commerces,
    today,
    searchName,
    searchDepartment,
    searchDate,
    selectedType,
  ]);

  // Slider Événements (horizontal)
  const eventSlides = useMemo(
    () => evenementsAvenir.slice(0, 5),
    [evenementsAvenir]
  );
  const [eventIndex, setEventIndex] = useState(0);
  const eventCount = eventSlides.length;
  const prevEvent = () =>
    setEventIndex((i) => (i - 1 + eventCount) % Math.max(eventCount, 1));
  const nextEvent = () =>
    setEventIndex((i) => (i + 1) % Math.max(eventCount, 1));

  // Slider Commerces (vertical)
  const commerceSlides = useMemo(
    () => commercesRecents.slice(0, 5),
    [commercesRecents]
  );
  const [commerceIndex, setCommerceIndex] = useState(0);
  const commerceCount = commerceSlides.length;
  const upCommerce = () =>
    setCommerceIndex(
      (i) => (i - 1 + commerceCount) % Math.max(commerceCount, 1)
    );
  const downCommerce = () =>
    setCommerceIndex((i) => (i + 1) % Math.max(commerceCount, 1));

  const onOpenAllEvents = () => setShowAllEvents(true);
  const onOpenAllCommerces = () => navigate("/actualites", { state: {} });

  const goToDetail = (a) => {
    navigate("/actualites/preview", {
      state: { actualite: a, fromPreview: false },
    });
  };

  // ---------------------------------------------------------------------------
  // CARTES
  // ---------------------------------------------------------------------------
  const EventCard = ({ a }) => {
    const img = getMainImage(a);
    const periode =
      (a.dateDebut ? formatDateFR(a.dateDebut) : "") +
      (a.dateFin ? ` → ${formatDateFR(a.dateFin)}` : "");

    return (
      <div
        className="
          grid grid-cols-3 gap-4
          bg-white
          border-4 border-[#64748b]
          rounded-2xl
          shadow-2xl
          p-[5px]
          relative
          transition-transform
          hover:-translate-y-0.5
          hover:border-pink-700
        "
        style={{
          boxShadow: "0 10px 25px rgba(0,0,0,0.25), inset 0 0 0 4px #94a3b8",
        }}
      >
        {/* GAUCHE = Photo seule (sans texte de fallback du navigateur) */}
        <div className="col-span-1">
          <SafeImage src={img} heightClass="h-40" />
        </div>

        {/* DROITE = infos */}
        <div className="col-span-2 flex flex-col">
          <h3 className="text-xl font-bold text-pink-700">
            {a.titreEvenement}
          </h3>

          {a.organisateurs && (
            <div className="text-xs text-slate-700">
              <span className="font-semibold">Organisé par :</span>{" "}
              {a.organisateurs}
            </div>
          )}

          <div className="h-2" />

          {a.phraseAccroche && (
            <p className="text-blue-700 italic text-sm">{a.phraseAccroche}</p>
          )}

          {a.contenu && (
            <p className="text-slate-700 text-sm mt-2 leading-relaxed line-clamp-6">
              {a.contenu}
            </p>
          )}

          <div className="mt-3 space-y-1 text-sm text-slate-800">
            {(a.dateDebut || a.dateFin) && (
              <div>
                <span className="font-semibold">Dates :</span> {periode}
              </div>
            )}
            {a.adresseComplete && (
              <div>
                <span className="font-semibold">Adresse :</span>{" "}
                {a.adresseComplete}
              </div>
            )}
            <div className="flex flex-wrap gap-4">
              {a.telephone && (
                <div>
                  <span className="font-semibold">Tél :</span> {a.telephone}
                </div>
              )}
              {a.adresseMail && (
                <div>
                  <span className="font-semibold">Email :</span> {a.adresseMail}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3">
            <button
              onClick={() => goToDetail(a)}
              className="px-4 py-2 rounded-lg bg-pink-700 text-white shadow hover:shadow-lg active:scale-[0.98] transition"
            >
              Découvrir
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CommerceCard = ({ a }) => {
    const img = getMainImage(a);
    const city = extractCity(a.adresseComplete || "");

    return (
      <div
        className="
          bg-white
          border-4 border-[#64748b]
          rounded-2xl
          shadow-2xl
          p-[5px]
          transition-transform hover:-translate-y-0.5 hover:border-pink-700
        "
        style={{
          boxShadow: "0 10px 25px rgba(0,0,0,0.25), inset 0 0 0 4px #94a3b8",
        }}
      >
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-pink-700">{a.nomMagasin}</h4>
          {city && (
            <div className="text-sm text-slate-700 font-medium">{city}</div>
          )}
        </div>

        <div className="mt-2">
          <SafeImage src={img} heightClass="h-36" />
        </div>

        {a.contenu && (
          <p className="mt-2 text-slate-700 text-sm leading-relaxed line-clamp-4">
            {a.contenu}
          </p>
        )}

        <div className="mt-3">
          <button
            onClick={() => goToDetail(a)}
            className="w-full px-4 py-2 rounded-lg bg-pink-700 text-white shadow hover:shadow-lg active:scale-[0.98] transition"
          >
            Plus d’informations
          </button>
        </div>
      </div>
    );
  };

  // =======================================================================
  // RENDER
  // =======================================================================
  return (
    <div className="min-h-screen w-full bg-[#f5efe6] mx-[5px] px-[5px]">
      {/* Bouton + Nouvelle annonce */}
      <div className="w-full pt-4 flex justify-end">
        {userConnected ? (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl shadow hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Nouvelle annonce
          </button>
        ) : (
          <div className="text-sm text-slate-600 italic">
            Connectez-vous pour publier une annonce.
          </div>
        )}
      </div>

      {/* Titre */}
      <div className="w-full py-3">
        <h1 className="text-3xl font-serif font-bold text-indigo-900 text-center">
          Astuces &amp; Murmures — Actualités bien-être
        </h1>
      </div>

      {/* Barre de recherche (1 ligne ≥ md) */}
      <div className="w-full bg-[#ddd9c4] rounded-2xl shadow border border-indigo-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border-2 border-indigo-800 bg-[#fddede] focus:outline-none"
          >
            <option value="">Tous les types</option>
            <option value="Evenement">Événements</option>
            <option value="Commerce">Commerces</option>
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 w-5 h-5" />
            <input
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Rechercher par nom…"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-indigo-800 bg-[#fddede] focus:outline-none"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 w-5 h-5" />
            <select
              value={searchDepartment}
              onChange={(e) => setSearchDepartment(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-indigo-800 bg-[#fddede] focus:outline-none"
            >
              <option value="">Tous départements</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 w-5 h-5" />
            <input
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              placeholder="Rechercher par date/mois…"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-indigo-800 bg-[#fddede] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2 colonnes */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Événements (gauche) */}
        <section className="lg:col-span-2">
          <div className="rounded-3xl p-4 border border-rose-200 shadow-inner bg-rose-50">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-indigo-900">
                Événements à venir
              </h2>
              {evenementsAvenir.length > 5 && (
                <button
                  onClick={onOpenAllEvents}
                  className="px-4 py-2 rounded-lg bg-pink-700 text-white shadow hover:shadow-lg active:scale-[0.98] transition"
                >
                  Plus d’événements
                </button>
              )}
            </div>

            {/* Slider horizontal */}
            <div className="relative mt-3">
              <div className="overflow-hidden rounded-2xl">
                <div
                  className="whitespace-nowrap transition-transform duration-500"
                  style={{ transform: `translateX(-${eventIndex * 100}%)` }}
                >
                  {eventSlides.length === 0 ? (
                    <div className="p-6 text-center text-slate-600">
                      Aucun événement dans les 3 prochains mois.
                    </div>
                  ) : (
                    eventSlides.map((a) => (
                      <div
                        key={a._id || a.id || a.titreEvenement}
                        className="inline-block align-top w-full px-1"
                      >
                        <EventCard a={a} />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {eventSlides.length > 1 && (
                <>
                  <button
                    onClick={prevEvent}
                    className="absolute z-10 top-1/2 -translate-y-1/2 left-2 p-2 rounded-full bg-white shadow hover:shadow-lg"
                    aria-label="Précédent"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextEvent}
                    className="absolute z-10 top-1/2 -translate-y-1/2 right-2 p-2 rounded-full bg-white shadow hover:shadow-lg"
                    aria-label="Suivant"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {eventSlides.length > 1 && (
                <div className="mt-3 flex justify-center gap-2">
                  {eventSlides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setEventIndex(i)}
                      className={`w-2.5 h-2.5 rounded-full border border-slate-500 ${
                        i === eventIndex ? "bg-slate-700" : "bg-white"
                      }`}
                      aria-label={`Aller au slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {showAllEvents && evenementsAvenir.length > 5 && (
              <div className="mt-4 space-y-3">
                {evenementsAvenir.slice(5).map((a) => (
                  <EventCard
                    key={`full_${a._id || a.id || a.titreEvenement}`}
                    a={a}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Commerces (droite) */}
        <aside className="lg:col-span-1">
          <div className="rounded-3xl p-4 border border-rose-200 shadow-inner bg-rose-50">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-indigo-900">
                Commerces : Annonces
              </h2>
              {commercesRecents.length > 5 && (
                <button
                  onClick={onOpenAllCommerces}
                  className="px-3 py-2 rounded-lg bg-pink-700 text-white shadow hover:shadow-lg active:scale-[0.98] transition text-sm"
                >
                  Plus d’annonces
                </button>
              )}
            </div>

            <div className="mt-3 h-[400px] overflow-hidden relative">
              <div
                className="transition-transform duration-500"
                style={{ transform: `translateY(-${commerceIndex * 100}%)` }}
              >
                {commerceSlides.length === 0 ? (
                  <div className="p-6 text-center text-slate-600">
                    Aucune annonce commerce récente.
                  </div>
                ) : (
                  commerceSlides.map((a) => (
                    <div
                      key={a._id || a.id || a.nomMagasin}
                      className="h-[400px] px-1"
                    >
                      <CommerceCard a={a} />
                    </div>
                  ))
                )}
              </div>
            </div>

            {commerceSlides.length > 1 && (
              <div className="mt-2 flex items-center justify-center gap-4">
                <button
                  onClick={upCommerce}
                  className="p-2 rounded-full bg-white shadow hover:shadow-lg"
                  aria-label="Monter"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <button
                  onClick={downCommerce}
                  className="p-2 rounded-full bg-white shadow hover:shadow-lg"
                  aria-label="Descendre"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      <AddActualiteModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

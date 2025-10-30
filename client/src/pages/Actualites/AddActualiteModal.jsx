// ============================================================================
// src/pages/Actualites/Admin/AddActualiteModal.jsx
// ---------------------------------------------------------------------------
// FORMULAIRE (Événement / Commerce)
// - ✅ Garde d’accès si non connecté
// - ✅ Autosave (3s) + Brouillon + Preview
// - ✅ Drag & drop d’images
// - ✅ PREVIEW IMAGES EN DATA URL (plus d’ObjectURL révoqués !)
// - Design Tailwind "zen"
// ============================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  X,
  Plus,
  Minus,
  Info,
  Clock,
  Tags,
  ParkingSquare,
  Save,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

// ✅ chemins corrigés
import { useToast } from "../../components/Common/ToastProvider.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

// -------------------------------
// Constantes & helpers
// -------------------------------
const LS_KEY = "draft_actualite_form";

const mois = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

// Départements : HAUTS-DE-FRANCE
const departments = [
  "02 - Aisne",
  "59 - Nord",
  "60 - Oise",
  "62 - Pas-de-Calais",
  "80 - Somme",
];
const jours = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];

// ⏩ util: File -> DataURL (promesse)
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } catch (e) {
      reject(e);
    }
  });
}

// Validation simple (horaires/tarifs optionnels)
function validate(form) {
  const errors = {};
  if (!form.type) errors.type = "Le type est obligatoire.";
  if (!form.phraseAccroche)
    errors.phraseAccroche = "La phrase d'accroche est obligatoire.";
  if (!form.contenu || form.contenu.length < 10)
    errors.contenu = "Description : minimum 10 caractères.";
  if (form.contenu && form.contenu.length > 500)
    errors.contenu = "Description : maximum 500 caractères.";
  if (!form.departement) errors.departement = "Le département est obligatoire.";
  if (!form.adresseComplete)
    errors.adresseComplete = "L'adresse complète est obligatoire.";
  if (!form.telephone) errors.telephone = "Le téléphone est obligatoire.";
  if (!form.adresseMail) errors.adresseMail = "L'adresse mail est obligatoire.";

  if (form.type === "Evenement") {
    if (!form.titreEvenement)
      errors.titreEvenement = "Le titre de l'événement est obligatoire.";
    if (!form.organisateurs)
      errors.organisateurs = "Les organisateurs sont obligatoires.";
    if (!form.mois) errors.mois = "Le mois est obligatoire.";
    if (!form.dateDebut) errors.dateDebut = "La date de début est obligatoire.";
    const re = /^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/;
    Object.entries(form.horairesEvenementParDate || {}).forEach(([, val]) => {
      if (val && !re.test(val)) {
        errors.horairesEvenementParDate =
          "Format horaire invalide pour certaines dates (HH:MM - HH:MM).";
      }
    });
  }

  if (form.type === "Boutique") {
    if (!form.nomMagasin)
      errors.nomMagasin = "Le nom du commerce est obligatoire.";
    const re = /^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/;
    Object.values(form.horairesCommerce || {}).forEach((obj) => {
      if (!obj) return;
      if (obj.closed) return;
      if (obj.continuous) {
        if (obj.full && !re.test(obj.full)) {
          errors.horairesCommerce =
            "Format horaire invalide (HH:MM - HH:MM) pour un jour.";
        }
      } else {
        if (obj.morning && !re.test(obj.morning)) {
          errors.horairesCommerce =
            "Format matin invalide (HH:MM - HH:MM) pour un jour.";
        }
        if (obj.afternoon && !re.test(obj.afternoon)) {
          errors.horairesCommerce =
            "Format après-midi invalide (HH:MM - HH:MM) pour un jour.";
        }
      }
    });
  }

  if (Array.isArray(form.photosFiles) && form.photosFiles.length > 3) {
    errors.photosFiles = "Maximum 3 photos supplémentaires.";
  }
  return errors;
}

// Génère un tableau de dates ISO (yyyy-mm-dd) entre d1 et d2 inclus
function enumerateDates(d1, d2) {
  try {
    const start = new Date(d1);
    const end = d2 ? new Date(d2) : new Date(d1);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];
    const days = [];
    let cur = new Date(start);
    while (cur <= end) {
      days.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  } catch {
    return [];
  }
}

// ============================================================================
// Composant
// ============================================================================
export default function AddActualiteModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { success, info } = useToast();
  const { userConnected } = useAuth();

  // ✅ Garde d’accès
  useEffect(() => {
    if (isOpen && !userConnected) {
      info("Tu dois être connecté(e) pour ajouter une actualité.");
      onClose?.();
    }
  }, [isOpen, userConnected, info, onClose]);

  // Champs communs
  const [type, setType] = useState("Evenement");
  const [phraseAccroche, setPhraseAccroche] = useState("");
  const [contenu, setContenu] = useState("");
  const [departement, setDepartement] = useState("");
  const [adresseComplete, setAdresseComplete] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresseMail, setAdresseMail] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [parkingFacile, setParkingFacile] = useState(false);

  // Événement
  const [titreEvenement, setTitreEvenement] = useState("");
  const [organisateurs, setOrganisateurs] = useState("");
  const [moisValue, setMoisValue] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [horairesEvenementParDate, setHorairesEvenementParDate] = useState({});

  // Commerce
  const [nomMagasin, setNomMagasin] = useState("");
  const [horairesCommerce, setHorairesCommerce] = useState({
    lun: {
      morning: "",
      afternoon: "",
      closed: false,
      continuous: false,
      full: "",
    },
    mar: {
      morning: "",
      afternoon: "",
      closed: false,
      continuous: false,
      full: "",
    },
    mer: {
      morning: "",
      afternoon: "",
      closed: false,
      continuous: false,
      full: "",
    },
    jeu: {
      morning: "",
      afternoon: "",
      closed: false,
      continuous: false,
      full: "",
    },
    ven: {
      morning: "",
      afternoon: "",
      closed: false,
      continuous: false,
      full: "",
    },
    sam: {
      morning: "",
      afternoon: "",
      closed: false,
      continuous: false,
      full: "",
    },
    dim: {
      morning: "",
      afternoon: "",
      closed: false,
      continuous: false,
      full: "",
    },
  });

  // Tarifs
  const [tarifs, setTarifs] = useState([]);
  const [tarifLabel, setTarifLabel] = useState("");
  const [tarifPrice, setTarifPrice] = useState("");

  // Photos (drag & drop)
  const [imageFile, setImageFile] = useState(null); // Fichier brut
  const [imagePreview, setImagePreview] = useState(null); // ✅ DataURL preview
  const [photosFiles, setPhotosFiles] = useState([]); // Fichiers bruts
  const [photosPreviews, setPhotosPreviews] = useState([]); // ✅ DataURL previews

  // Etats DRAG
  const [dragMainActive, setDragMainActive] = useState(false);
  const [dragMoreActive, setDragMoreActive] = useState(false);

  const [errors, setErrors] = useState({});
  const saveTimer = useRef(null);
  const dirtyRef = useRef(false);

  // Objet formulaire (validate + preview)
  const form = useMemo(
    () => ({
      type,
      phraseAccroche,
      contenu,
      departement,
      adresseComplete,
      telephone,
      adresseMail,
      keywords,
      parkingFacile,
      // event
      titreEvenement,
      organisateurs,
      mois: moisValue,
      dateDebut,
      dateFin,
      horairesEvenementParDate,
      // commerce
      nomMagasin,
      horairesCommerce,
      // autres
      tarifs,
      image: imagePreview || null, // ✅ DataURL utilisable en Preview
      photos: photosPreviews, // ✅ DataURL utilisable en Preview
      imageFile,
      photosFiles,
    }),
    [
      type,
      phraseAccroche,
      contenu,
      departement,
      adresseComplete,
      telephone,
      adresseMail,
      keywords,
      parkingFacile,
      titreEvenement,
      organisateurs,
      moisValue,
      dateDebut,
      dateFin,
      horairesEvenementParDate,
      nomMagasin,
      horairesCommerce,
      tarifs,
      imagePreview,
      photosPreviews,
      imageFile,
      photosFiles,
    ]
  );

  // Restauration du brouillon (safe)
  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (!d || typeof d !== "object") return;

      setType(d.type ?? "Evenement");
      setPhraseAccroche(d.phraseAccroche ?? "");
      setContenu(d.contenu ?? "");
      setDepartement(d.departement ?? "");
      setAdresseComplete(d.adresseComplete ?? "");
      setTelephone(d.telephone ?? "");
      setAdresseMail(d.adresseMail ?? "");
      setKeywords(Array.isArray(d.keywords) ? d.keywords : []);
      setParkingFacile(!!d.parkingFacile);

      setTitreEvenement(d.titreEvenement ?? "");
      setOrganisateurs(d.organisateurs ?? "");
      setMoisValue(d.mois ?? "");
      setDateDebut(d.dateDebut ?? "");
      setDateFin(d.dateFin ?? "");
      setHorairesEvenementParDate(d.horairesEvenementParDate ?? {});

      setNomMagasin(d.nomMagasin ?? "");
      setHorairesCommerce({
        lun: {
          morning: d.horairesCommerce?.lun?.morning ?? "",
          afternoon: d.horairesCommerce?.lun?.afternoon ?? "",
          closed: !!d.horairesCommerce?.lun?.closed,
          continuous: !!d.horairesCommerce?.lun?.continuous,
          full: d.horairesCommerce?.lun?.full ?? "",
        },
        mar: {
          morning: d.horairesCommerce?.mar?.morning ?? "",
          afternoon: d.horairesCommerce?.mar?.afternoon ?? "",
          closed: !!d.horairesCommerce?.mar?.closed,
          continuous: !!d.horairesCommerce?.mar?.continuous,
          full: d.horairesCommerce?.mar?.full ?? "",
        },
        mer: {
          morning: d.horairesCommerce?.mer?.morning ?? "",
          afternoon: d.horairesCommerce?.mer?.afternoon ?? "",
          closed: !!d.horairesCommerce?.mer?.closed,
          continuous: !!d.horairesCommerce?.mer?.continuous,
          full: d.horairesCommerce?.mer?.full ?? "",
        },
        jeu: {
          morning: d.horairesCommerce?.jeu?.morning ?? "",
          afternoon: d.horairesCommerce?.jeu?.afternoon ?? "",
          closed: !!d.horairesCommerce?.jeu?.closed,
          continuous: !!d.horairesCommerce?.jeu?.continuous,
          full: d.horairesCommerce?.jeu?.full ?? "",
        },
        ven: {
          morning: d.horairesCommerce?.ven?.morning ?? "",
          afternoon: d.horairesCommerce?.ven?.afternoon ?? "",
          closed: !!d.horairesCommerce?.ven?.closed,
          continuous: !!d.horairesCommerce?.ven?.continuous,
          full: d.horairesCommerce?.ven?.full ?? "",
        },
        sam: {
          morning: d.horairesCommerce?.sam?.morning ?? "",
          afternoon: d.horairesCommerce?.sam?.afternoon ?? "",
          closed: !!d.horairesCommerce?.sam?.closed,
          continuous: !!d.horairesCommerce?.sam?.continuous,
          full: d.horairesCommerce?.sam?.full ?? "",
        },
        dim: {
          morning: d.horairesCommerce?.dim?.morning ?? "",
          afternoon: d.horairesCommerce?.dim?.afternoon ?? "",
          closed: !!d.horairesCommerce?.dim?.closed,
          continuous: !!d.horairesCommerce?.dim?.continuous,
          full: d.horairesCommerce?.dim?.full ?? "",
        },
      });

      setTarifs(Array.isArray(d.tarifs) ? d.tarifs : []);
      info("Brouillon restauré ✨");
    } catch {
      /* silencieux */
    }
  }, [isOpen, info]);

  // Génération des clés d’horaires d’événement
  useEffect(() => {
    if (type !== "Evenement") return;
    const dates = enumerateDates(dateDebut, dateFin);
    if (dates.length === 0) return;
    setHorairesEvenementParDate((prev) => {
      const next = {};
      dates.forEach((d) => (next[d] = prev?.[d] ?? ""));
      return next;
    });
  }, [type, dateDebut, dateFin]);

  // Autosave 3s
  useEffect(() => {
    if (!isOpen) return;
    dirtyRef.current = true;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        const serializable = {
          type,
          phraseAccroche,
          contenu,
          departement,
          adresseComplete,
          telephone,
          adresseMail,
          keywords,
          parkingFacile,
          titreEvenement,
          organisateurs,
          mois: moisValue,
          dateDebut,
          dateFin,
          horairesEvenementParDate,
          nomMagasin,
          horairesCommerce,
          tarifs,
        };
        localStorage.setItem(LS_KEY, JSON.stringify(serializable));
        dirtyRef.current = false;
      } catch {}
    }, 3000);
    return () => saveTimer.current && clearTimeout(saveTimer.current);
  }, [
    isOpen,
    type,
    phraseAccroche,
    contenu,
    departement,
    adresseComplete,
    telephone,
    adresseMail,
    keywords,
    parkingFacile,
    titreEvenement,
    organisateurs,
    moisValue,
    dateDebut,
    dateFin,
    horairesEvenementParDate,
    nomMagasin,
    horairesCommerce,
    tarifs,
  ]);

  // Warn si on quitte avec brouillon non sauvé
  useEffect(() => {
    if (!isOpen) return;
    const beforeUnload = (e) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [isOpen]);

  // SEO — keywords
  const [kwInput, setKwInput] = useState("");
  const addKeyword = () => {
    const k = (kwInput || "").trim();
    if (!k) return;
    if (!keywords.includes(k)) setKeywords((prev) => [...prev, k]);
    setKwInput("");
  };
  const removeKeyword = (k) =>
    setKeywords((prev) => prev.filter((x) => x !== k));

  // Tarifs CRUD
  const addTarif = () => {
    const l = (tarifLabel || "").trim();
    const p = (tarifPrice || "").trim();
    if (!l || !p) return;
    setTarifs((prev) => [...prev, { label: l, price: p }]);
    setTarifLabel("");
    setTarifPrice("");
  };
  const removeTarif = (idx) => setTarifs((p) => p.filter((_, i) => i !== idx));

  // Photos : helpers (DataURL)
  const onPickImage = async (file) => {
    if (!file) return;
    setImageFile(file);
    const dataUrl = await fileToDataURL(file); // ✅
    setImagePreview(dataUrl);
  };
  const onPickMorePhotos = async (filesLike) => {
    const list = Array.from(filesLike || []);
    if (list.length === 0) return;
    const nextFiles = [...photosFiles, ...list].slice(0, 3);
    const dataUrls = [];
    for (const f of nextFiles) {
      // convertit chaque fichier en DataURL
      // (évite les ObjectURL qui se révoquent)
      // et garde l’ordre
      // eslint-disable-next-line no-await-in-loop
      dataUrls.push(await fileToDataURL(f));
    }
    setPhotosFiles(nextFiles);
    setPhotosPreviews(dataUrls.slice(0, 3));
  };
  const removeMorePhoto = (idx) => {
    setPhotosFiles((prev) => prev.filter((_, i) => i !== idx));
    setPhotosPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const prevent = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
  };

  // Drop principale
  const onMainDrop = (e) => {
    prevent(e);
    setDragMainActive(false);
    const f = e?.dataTransfer?.files?.[0];
    if (f) onPickImage(f);
  };

  // Drop autres photos
  const onMoreDrop = (e) => {
    prevent(e);
    setDragMoreActive(false);
    const files = e?.dataTransfer?.files;
    if (files?.length) onPickMorePhotos(files);
  };

  // Sauvegarde & Preview
  const onSaveDraftNow = () => {
    try {
      const serializable = {
        type,
        phraseAccroche,
        contenu,
        departement,
        adresseComplete,
        telephone,
        adresseMail,
        keywords,
        parkingFacile,
        titreEvenement,
        organisateurs,
        mois: moisValue,
        dateDebut,
        dateFin,
        horairesEvenementParDate,
        nomMagasin,
        horairesCommerce,
        tarifs,
      };
      localStorage.setItem(LS_KEY, JSON.stringify(serializable));
      dirtyRef.current = false;
      success("Brouillon enregistré 💾");
    } catch {}
  };

  const onPreview = () => {
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    onSaveDraftNow();

    navigate("/actualites/preview", {
      state: {
        actualite: {
          ...form,
          status: "draft",
          createdAt: new Date().toISOString(),
        },
        files: {
          imageFile: imageFile || null, // on passe toujours les File
          photosFiles: photosFiles || [],
        },
      },
    });
  };

  // UI
  if (!isOpen) return null;
  if (!userConnected) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-gradient-to-br from-green-100 to-emerald-50 rounded-3xl shadow-2xl border-2 border-green-200 relative z-10 max-h-[95vh] overflow-y-auto">
          {/* Header sticky */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-green-200 sticky top-0 bg-gradient-to-br from-green-100 to-emerald-50 z-10">
            <div>
              <h2 className="text-3xl font-serif font-bold text-green-800">
                ✨ Nouvelle annonce
              </h2>
              <p className="text-green-700 mt-1">
                Enregistrez un brouillon, puis prévisualisez et publiez.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/80 hover:bg-white text-green-700 hover:text-green-900 transition hover:scale-110"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Corps */}
          <div className="p-6 space-y-6">
            {/* Type */}
            <section>
              <label className="block text-sm font-semibold text-green-800 mb-2">
                Type d'annonce *
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setType("Evenement")}
                  className={`px-6 py-3 rounded-xl border-2 font-medium transition ${
                    type === "Evenement"
                      ? "border-green-500 bg-green-50 text-green-800"
                      : "border-green-300 bg-rose-50 text-green-700 hover:border-green-400"
                  }`}
                >
                  🎪 Événement
                </button>
                <button
                  type="button"
                  onClick={() => setType("Boutique")}
                  className={`px-6 py-3 rounded-xl border-2 font-medium transition ${
                    type === "Boutique"
                      ? "border-green-500 bg-green-50 text-green-800"
                      : "border-green-300 bg-rose-50 text-green-700 hover:border-green-400"
                  }`}
                >
                  🏪 Commerce
                </button>
              </div>
              {errors.type && (
                <p className="text-red-600 text-sm mt-1">{errors.type}</p>
              )}
            </section>

            {/* Spécifique Événement */}
            {type === "Evenement" && (
              <section className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">
                    Titre de l'événement *
                  </label>
                  <input
                    value={titreEvenement}
                    onChange={(e) => setTitreEvenement(e.target.value)}
                    placeholder="Nom de l'événement"
                    className={`w-full border-2 rounded-xl p-4 bg-rose-50 focus:outline-none focus:ring-4 transition ${
                      errors.titreEvenement
                        ? "border-red-500 focus:ring-red-100"
                        : "border-green-300 focus:border-green-500 focus:ring-green-100"
                    }`}
                  />
                  {errors.titreEvenement && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.titreEvenement}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">
                    Organisateurs *
                  </label>
                  <input
                    value={organisateurs}
                    onChange={(e) => setOrganisateurs(e.target.value)}
                    placeholder="Association, centre..."
                    className={`w-full border-2 rounded-xl p-4 bg-rose-50 focus:outline-none focus:ring-4 transition ${
                      errors.organisateurs
                        ? "border-red-500 focus:ring-red-100"
                        : "border-green-300 focus:border-green-500 focus:ring-green-100"
                    }`}
                  />
                  {errors.organisateurs && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.organisateurs}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">
                    Mois *
                  </label>
                  <select
                    value={moisValue}
                    onChange={(e) => setMoisValue(e.target.value)}
                    className={`w-full border-2 rounded-xl p-4 bg-rose-50 focus:outline-none focus:ring-4 transition ${
                      errors.mois
                        ? "border-red-500 focus:ring-red-100"
                        : "border-green-300 focus:border-green-500 focus:ring-green-100"
                    }`}
                  >
                    <option value="">Choisissez un mois...</option>
                    {mois.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  {errors.mois && (
                    <p className="text-red-600 text-sm mt-1">{errors.mois}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-green-800 mb-2">
                      Date de début *
                    </label>
                    <input
                      type="date"
                      value={dateDebut}
                      onChange={(e) => setDateDebut(e.target.value)}
                      className={`w-full border-2 rounded-xl p-3.5 bg-rose-50 focus:outline-none focus:ring-4 transition ${
                        errors.dateDebut
                          ? "border-red-500 focus:ring-red-100"
                          : "border-green-300 focus:border-green-500 focus:ring-green-100"
                      }`}
                    />
                    {errors.dateDebut && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.dateDebut}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-green-800 mb-2">
                      Date de fin (optionnelle)
                    </label>
                    <input
                      type="date"
                      value={dateFin}
                      onChange={(e) => setDateFin(e.target.value)}
                      className="w-full border-2 rounded-xl p-3.5 bg-rose-50 focus:outline-none focus:ring-4 transition border-green-300 focus:border-green-500 focus:ring-green-100"
                    />
                  </div>
                </div>

                {/* HORAIRES PAR DATE (optionnels) */}
                <div className="md:col-span-2 rounded-2xl border-2 border-green-200 bg-white/80 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-green-800 font-semibold mb-1">
                    <Clock className="w-5 h-5" />
                    Horaires par date (optionnels)
                  </div>
                  <p className="text-xs text-slate-600">
                    Pour chaque date, tu peux définir une plage libre (ex :{" "}
                    <code>06:00 - 23:30</code>). Laisse vide si non pertinent.
                  </p>
                  {errors.horairesEvenementParDate && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.horairesEvenementParDate}
                    </p>
                  )}
                  <div className="grid sm:grid-cols-2 gap-2 mt-3">
                    {Object.keys(horairesEvenementParDate).length === 0 && (
                      <div className="text-slate-600 text-sm">
                        Renseigne d’abord les dates pour afficher les champs.
                      </div>
                    )}
                    {Object.entries(horairesEvenementParDate).map(
                      ([dateStr, val]) => (
                        <div
                          key={dateStr}
                          className="flex items-center gap-2 border border-green-200 rounded-xl p-2 bg-rose-50"
                        >
                          <span className="text-sm font-semibold text-green-900 w-28">
                            {new Date(dateStr).toLocaleDateString("fr-FR")}
                          </span>
                          <input
                            placeholder="ex 08:00 - 21:30"
                            value={val}
                            onChange={(e) =>
                              setHorairesEvenementParDate((prev) => ({
                                ...prev,
                                [dateStr]: e.target.value,
                              }))
                            }
                            className="flex-1 border-2 border-green-200 rounded-xl px-3 py-2 focus:outline-none focus:border-green-500"
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Spécifique Commerce */}
            {type === "Boutique" && (
              <section className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">
                    Nom du commerce *
                  </label>
                  <input
                    value={nomMagasin}
                    onChange={(e) => setNomMagasin(e.target.value)}
                    placeholder="Nom de la boutique"
                    className={`w-full border-2 rounded-xl p-4 bg-rose-50 focus:outline-none focus:ring-4 transition ${
                      errors.nomMagasin
                        ? "border-red-500 focus:ring-red-100"
                        : "border-green-300 focus:border-green-500 focus:ring-green-100"
                    }`}
                  />
                  {errors.nomMagasin && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.nomMagasin}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border-2 border-green-200 bg-white/80 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-green-800 font-semibold">
                    <Clock className="w-5 h-5" />
                    Horaires à la semaine (optionnel & flexible)
                  </div>
                  <p className="text-xs text-slate-600">
                    Au choix pour chaque jour : <strong>Fermé</strong>,{" "}
                    <strong>Sans coupure</strong> (une plage), ou{" "}
                    <strong>Matin/Après-midi</strong>. Formats libres.
                  </p>
                  {errors.horairesCommerce && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.horairesCommerce}
                    </p>
                  )}

                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    {jours.map((j) => {
                      const val = horairesCommerce[j];
                      return (
                        <div
                          key={j}
                          className="border border-green-200 rounded-xl p-3 bg-rose-50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold text-green-900 uppercase">
                              {j}
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <label className="inline-flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={val.closed}
                                  onChange={(e) =>
                                    setHorairesCommerce({
                                      ...horairesCommerce,
                                      [j]: {
                                        morning: "",
                                        afternoon: "",
                                        full: "",
                                        continuous: false,
                                        closed: e.target.checked,
                                      },
                                    })
                                  }
                                />
                                Fermé
                              </label>
                              <label className="inline-flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={val.continuous}
                                  disabled={val.closed}
                                  onChange={(e) =>
                                    setHorairesCommerce({
                                      ...horairesCommerce,
                                      [j]: {
                                        ...val,
                                        continuous: e.target.checked,
                                        morning: e.target.checked
                                          ? ""
                                          : val.morning,
                                        afternoon: e.target.checked
                                          ? ""
                                          : val.afternoon,
                                        full: e.target.checked ? val.full : "",
                                      },
                                    })
                                  }
                                />
                                Sans coupure
                              </label>
                            </div>
                          </div>

                          {val.closed ? (
                            <div className="text-slate-600 text-sm italic">
                              Jour fermé
                            </div>
                          ) : val.continuous ? (
                            <input
                              placeholder="ex 08:00 - 20:00"
                              value={val.full}
                              onChange={(e) =>
                                setHorairesCommerce({
                                  ...horairesCommerce,
                                  [j]: { ...val, full: e.target.value },
                                })
                              }
                              className="w-full border-2 border-green-200 rounded-xl px-3 py-2 focus:outline-none focus:border-green-500"
                            />
                          ) : (
                            <div className="flex gap-2">
                              <input
                                placeholder="Matin (ex 09:00 - 12:30)"
                                value={val.morning}
                                onChange={(e) =>
                                  setHorairesCommerce({
                                    ...horairesCommerce,
                                    [j]: { ...val, morning: e.target.value },
                                  })
                                }
                                className="flex-1 border-2 border-green-200 rounded-xl px-3 py-2 focus:outline-none focus:border-green-500"
                              />
                              <input
                                placeholder="Après-midi (ex 14:00 - 19:30)"
                                value={val.afternoon}
                                onChange={(e) =>
                                  setHorairesCommerce({
                                    ...horairesCommerce,
                                    [j]: { ...val, afternoon: e.target.value },
                                  })
                                }
                                className="flex-1 border-2 border-green-200 rounded-xl px-3 py-2 focus:outline-none focus:border-green-500"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Accroche + Description */}
            <section className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Phrase d'accroche *
                </label>
                <input
                  value={phraseAccroche}
                  onChange={(e) => setPhraseAccroche(e.target.value)}
                  placeholder="Une phrase qui donne envie..."
                  className={`w-full border-2 rounded-xl p-4 bg-rose-50 focus:outline-none focus:ring-4 transition ${
                    errors.phraseAccroche
                      ? "border-red-500 focus:ring-red-100"
                      : "border-green-300 focus:border-green-500 focus:ring-green-100"
                  }`}
                />
                {errors.phraseAccroche && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.phraseAccroche}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Description *{" "}
                  <span className="text-xs text-slate-600">
                    ({contenu.length}/500)
                  </span>
                </label>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={contenu}
                  onChange={(e) => setContenu(e.target.value)}
                  placeholder="Décrivez votre annonce..."
                  className={`w-full border-2 rounded-xl p-4 bg-rose-50 resize-none focus:outline-none focus:ring-4 transition ${
                    errors.contenu
                      ? "border-red-500 focus:ring-red-100"
                      : "border-green-300 focus:border-green-500 focus:ring-green-100"
                  }`}
                />
                {errors.contenu && (
                  <p className="text-red-600 text-sm mt-1">{errors.contenu}</p>
                )}
              </div>
            </section>

            {/* Localisation + Contact */}
            <section className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Département *
                </label>
                <select
                  value={departement}
                  onChange={(e) => setDepartement(e.target.value)}
                  className={`w-full border-2 rounded-xl p-4 bg-rose-50 focus:outline-none focus:ring-4 transition ${
                    errors.departement
                      ? "border-red-500 focus:ring-red-100"
                      : "border-green-300 focus:border-green-500 focus:ring-green-100"
                  }`}
                >
                  <option value="">Choisissez un département...</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {errors.departement && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.departement}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Adresse complète *
                </label>
                <input
                  value={adresseComplete}
                  onChange={(e) => setAdresseComplete(e.target.value)}
                  placeholder="123 rue de la Paix, 75000 Paris"
                  className={`w-full border-2 rounded-xl p-4 bg-rose-50 focus:outline-none focus:ring-4 transition ${
                    errors.adresseComplete
                      ? "border-red-500 focus:ring-red-100"
                      : "border-green-300 focus:border-green-500 focus:ring-green-100"
                  }`}
                />
                {errors.adresseComplete && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.adresseComplete}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Téléphone *
                </label>
                <input
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="01 23 45 67 89"
                  className={`w-full border-2 rounded-xl p-4 bg-rose-50 focus:outline-none focus:ring-4 transition ${
                    errors.telephone
                      ? "border-red-500 focus:ring-red-100"
                      : "border-green-300 focus:border-green-500 focus:ring-green-100"
                  }`}
                />
                {errors.telephone && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.telephone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Adresse email *
                </label>
                <input
                  type="email"
                  value={adresseMail}
                  onChange={(e) => setAdresseMail(e.target.value)}
                  placeholder="contact@exemple.com"
                  className={`w-full border-2 rounded-xl p-4 bg-rose-50 focus:outline-none focus:ring-4 transition ${
                    errors.adresseMail
                      ? "border-red-500 focus:ring-red-100"
                      : "border-green-300 focus:border-green-500 focus:ring-green-100"
                  }`}
                />
                {errors.adresseMail && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.adresseMail}
                  </p>
                )}
              </div>
            </section>

            {/* SEO : Mots-clés */}
            <section className="rounded-2xl border-2 border-indigo-200 bg-white/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-800 font-semibold">
                <Tags className="w-5 h-5" /> Mots-clés (SEO)
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  <Info className="w-3 h-3" /> Aident Google à comprendre votre
                  contenu.
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={kwInput}
                  onChange={(e) => setKwInput(e.target.value)}
                  placeholder="ex: yoga, sophrologie, relaxation..."
                  className="flex-1 border-2 border-indigo-200 rounded-xl px-3 py-2 bg-rose-50 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  Ajouter
                </button>
              </div>
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {keywords.map((k) => (
                    <span
                      key={k}
                      className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-sm"
                    >
                      {k}
                      <button
                        type="button"
                        onClick={() => removeKeyword(k)}
                        className="ml-2 text-indigo-500 hover:text-indigo-700"
                        aria-label={`Supprimer ${k}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Parking */}
            <section className="flex items-center gap-2">
              <input
                id="parking"
                type="checkbox"
                checked={parkingFacile}
                onChange={(e) => setParkingFacile(e.target.checked)}
                className="w-4 h-4 accent-green-600"
              />
              <label
                htmlFor="parking"
                className="flex items-center gap-2 text-green-900"
              >
                <ParkingSquare className="w-5 h-5 text-green-700" /> Parking
                facile à proximité
              </label>
            </section>

            {/* Tarifs */}
            <section className="rounded-2xl border-2 border-amber-200 bg-white/80 p-4 shadow-sm">
              <div className="text-amber-900 font-semibold mb-2">
                Tarifs (optionnel)
              </div>
              <div className="flex gap-2">
                <input
                  value={tarifLabel}
                  onChange={(e) => setTarifLabel(e.target.value)}
                  placeholder="Intitulé (ex: Entrée, Massage 60min...)"
                  className="flex-1 border-2 border-amber-200 rounded-xl px-3 py-2 bg-rose-50 focus:outline-none focus:border-amber-500"
                />
                <input
                  value={tarifPrice}
                  onChange={(e) => setTarifPrice(e.target.value)}
                  placeholder="Prix (ex: 10€, 45€)"
                  className="w-40 border-2 border-amber-200 rounded-xl px-3 py-2 bg-rose-50 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={addTarif}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition"
                >
                  <Plus className="w-4 h-4 inline mr-1" /> Ajouter
                </button>
              </div>
              {tarifs.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {tarifs.map((t, i) => (
                    <li
                      key={`${t.label}_${i}`}
                      className="flex items-center justify-between border border-amber-200 rounded-xl px-3 py-2 bg-amber-50"
                    >
                      <span className="text-amber-900">{t.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-amber-900">
                          {t.price}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeTarif(i)}
                          className="p-1 rounded-md hover:bg-amber-100"
                          aria-label="Supprimer ce tarif"
                        >
                          <Minus className="w-4 h-4 text-amber-700" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* PHOTOS */}
            <section className="grid md:grid-cols-2 gap-4">
              {/* Photo principale */}
              <div className="border-2 border-green-200 rounded-2xl p-4 bg-white/80 shadow-sm">
                <div className="font-semibold text-green-900 mb-2">
                  Photo principale
                </div>

                {!imagePreview ? (
                  <div
                    onDragEnter={(e) => {
                      prevent(e);
                      setDragMainActive(true);
                    }}
                    onDragOver={(e) => {
                      prevent(e);
                      setDragMainActive(true);
                    }}
                    onDragLeave={(e) => {
                      prevent(e);
                      setDragMainActive(false);
                    }}
                    onDrop={onMainDrop}
                    onClick={() =>
                      document.getElementById("main-photo-input")?.click()
                    }
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                      dragMainActive
                        ? "border-green-600 bg-green-50"
                        : "border-green-300 bg-rose-50 hover:border-green-500"
                    }`}
                    title="Glissez-déposez une image ou cliquez"
                  >
                    <Upload className="w-10 h-10 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800">
                      Glissez une image ici ou cliquez pour sélectionner
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      PNG, JPG, JPEG, WEBP (≤5 Mo)
                    </p>
                    <input
                      id="main-photo-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) =>
                        e.target.files?.[0] &&
                        (await onPickImage(e.target.files[0]))
                      }
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="w-full h-48 object-cover rounded-xl shadow"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 flex items-center justify-center shadow"
                      aria-label="Retirer la photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Autres photos */}
              <div className="border-2 border-green-200 rounded-2xl p-4 bg-white/80 shadow-sm">
                <div className="font-semibold text-green-900 mb-2">
                  Autres photos (jusqu’à 3)
                </div>

                <div
                  onDragEnter={(e) => {
                    prevent(e);
                    setDragMoreActive(true);
                  }}
                  onDragOver={(e) => {
                    prevent(e);
                    setDragMoreActive(true);
                  }}
                  onDragLeave={(e) => {
                    prevent(e);
                    setDragMoreActive(false);
                  }}
                  onDrop={onMoreDrop}
                  onClick={() =>
                    document.getElementById("more-photos-input")?.click()
                  }
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                    dragMoreActive
                      ? "border-green-600 bg-green-50"
                      : "border-green-300 bg-rose-50 hover:border-green-500"
                  }`}
                  title="Glissez plusieurs images ou cliquez"
                >
                  <Upload className="w-8 h-8 text-green-600 mx-auto mb-1" />
                  <p className="text-green-800 text-sm">
                    Glissez-déposez ou cliquez pour sélectionner
                  </p>
                  <input
                    id="more-photos-input"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) =>
                      await onPickMorePhotos(e.target.files)
                    }
                  />
                </div>

                {errors.photosFiles && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.photosFiles}
                  </p>
                )}

                {photosPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {photosPreviews.map((src, i) => (
                      <div key={src} className="relative">
                        <img
                          src={src}
                          alt={`photo_${i}`}
                          className="w-full h-24 object-cover rounded-lg shadow"
                        />
                        <button
                          type="button"
                          onClick={() => removeMorePhoto(i)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 flex items-center justify-center shadow"
                          aria-label="Supprimer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Infos / modération */}
            <section className="space-y-3">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <p className="text-amber-800 text-sm text-center font-medium">
                  📝 Après prévisualisation, l’annonce pourra être{" "}
                  <strong>publiée</strong> et partira en{" "}
                  <strong>validation Admin</strong>.
                </p>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-blue-800 text-sm text-center font-medium">
                  💡 Horaires & tarifs sont <strong>optionnels</strong>.
                </p>
              </div>
            </section>

            {/* Actions */}
            <section className="flex justify-end gap-3 pt-4 border-t border-green-200">
              <button
                type="button"
                onClick={onSaveDraftNow}
                className="px-6 py-3 rounded-xl bg-white/80 text-green-700 font-semibold hover:bg-white transition hover:scale-105 flex items-center gap-2"
                title="Enregistrer le brouillon local (texte uniquement)"
              >
                <Save className="w-4 h-4" /> Enregistrer le brouillon
              </button>
              <button
                type="button"
                onClick={onPreview}
                className="px-8 py-3 rounded-xl text-white bg-gradient-to-r from-emerald-600 to-emerald-600 hover:from-emerald-700 hover:to-green-700 shadow hover:shadow-lg transition hover:scale-105"
              >
                Prévisualiser le rendu
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

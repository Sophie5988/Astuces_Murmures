// src/pages/Actualites/ActualitePreview.jsx
// ============================================================================
// Prévisualisation d’une actualité avant publication
// - Affiche le layout commun (images, texte, carte, etc.)
// - Bouton "Publier" -> POST /api/actualites (via publishActualite)
// - Garde les cookies (credentials: 'include')
// - Améliore le bouton "Modifier" pour revenir de façon fiable au formulaire
//   (même si l’historique du navigateur ne pointe pas comme on veut)
// - Prépare un indicateur 'forceEventSchedule' pour n’afficher qu’UN SEUL
//   bloc d’horaires côté layout (étape 2).
// ============================================================================

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

// ✅ Chemins
import { publishActualite } from "../../api/actualites";
import ActualiteDetailLayout from "./components/ActualiteDetailLayout.jsx";
import { useToast } from "../../components/Common/ToastProvider.jsx";

export default function ActualitePreview() {
  // 1) On récupère l'état passé par la page de saisi (formulaire)
  const location = useLocation(); // on garde un ref sur la location (contient state)
  const navigate = useNavigate();
  const { info, success, error } = useToast();

  // 2) L’actualité à prévisualiser (vient du state si tout va bien)
  const [actualite] = useState(location?.state?.actualite || null);

  // 3) Sécurité : si on arrive ici sans données, on repart vers la liste
  useEffect(() => {
    if (!actualite) {
      info("Aucune donnée à prévisualiser.");
      navigate("/actualites");
    }
  }, [actualite, info, navigate]);

  // 4) Titre dynamique : événement -> titreEvenement, commerçant -> nomMagasin
  const title = useMemo(() => {
    if (!actualite) return "Prévisualisation";
    return (
      actualite.titreEvenement || actualite.nomMagasin || "Prévisualisation"
    );
  }, [actualite]);

  if (!actualite) return null;

  // 5) Publication vers l’API
  const onPublish = async () => {
    // On envoie tel quel (validator côté API + auteur via session)
    const res = await publishActualite(actualite);

    // publishActualite() peut renvoyer { ok:false, status, message }
    if (res && res.ok === false) {
      error(`Publication échouée: ${res.message || "Erreur serveur"}`);
      return;
    }

    success("Annonce publiée (en attente de validation).");
    // 👉 Tant qu'Admin n'est pas prêt, on renvoie sur la liste
    navigate("/actualites");
  };

  // 6) Retour au formulaire quand on clique sur "Modifier"
  //    - Priorité 1 : si la page de formulaire nous a passé un chemin de retour (state.backToPath)
  //    - Priorité 2 : on tente un retour historique (-1) si possible
  //    - Priorité 3 : on force un chemin de secours (ex: /actualites/new) en conservant les données dans state
  const onBackToForm = () => {
    // Récupération d’un éventuel chemin “form” fourni par la page précédente
    const backToPath =
      location?.state?.backToPath ||
      location?.state?.fromPath ||
      location?.state?.returnToPath ||
      null;

    if (backToPath) {
      // 🔁 Cas idéal : on retourne explicitement sur la page de formulaire
      navigate(backToPath, {
        // On repasse l’actualité pour ne RIEN perdre dans le formulaire
        state: { actualite, fromPreview: true },
        replace: false,
      });
      return;
    }

    // 🧭 Si on n’a pas d’info explicite, on tente l’historique
    if (window.history.length > 1) {
      navigate(-1); // revient à l’écran précédent (souvent le formulaire)
      return;
    }

    // 🚑 Filet de sécurité : on force un chemin “formulaire”.
    // 👉 Adapte ce chemin si ton routeur est différent (ex: "/actualites/ajouter").
    navigate("/actualites/new", {
      state: { actualite, fromPreview: true },
      replace: false,
    });
  };

  // 7) Indicateur utile pour l’étape 2 (affichage d’un seul bloc horaires)
  //    - Si catégorie = 'evenement' on indiquera au layout de n’afficher QUE
  //      le bloc "Horaires (par date)" (non-stop).
  //    - Si catégorie = 'commercant' on n’affichera QUE le bloc hebdo.
  const forceEventSchedule =
    (actualite?.categorie || actualite?.type) === "evenement";

  return (
    <div className="min-h-screen bg-[#f5f1e5]">
      {/* Header léger */}
      <div className="bg-[#ddd9c4] border-b border-indigo-100 shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">
            Prévisualisation — {title}
          </h1>
          <div className="flex items-center gap-2">
            {/* === Bouton Modifier : retour fiable vers le formulaire === */}
            <button
              onClick={onBackToForm}
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition active:scale-[0.98]"
              title="Revenir au formulaire sans perdre vos saisies"
            >
              Modifier
            </button>

            {/* === Bouton Publier === */}
            <button
              onClick={onPublish}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow transition active:scale-[0.98]"
              title="Publier l'annonce"
            >
              Publier
            </button>
          </div>
        </div>
      </div>

      {/* Corps : on réutilise le layout commun */}
      <div className="max-w-6xl mx-auto p-4">
        <ActualiteDetailLayout
          actualite={actualite}
          isPreview
          // 🧭 Etape 2 : ce flag permettra au layout de savoir s’il doit
          // afficher le bloc “horaires par date” (événement) OU le bloc “horaires semaine” (commerçant)
          forceEventSchedule={forceEventSchedule}
        />
      </div>
    </div>
  );
}

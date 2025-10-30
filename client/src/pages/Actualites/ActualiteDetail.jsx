// src/pages/Actualites/ActualiteDetail.jsx
// ============================================================================
// Détail public d'une actualité — VERSION 100% CLIENT (sans Helmet/SSR)
// ----------------------------------------------------------------------------
// Pourquoi ce changement ?
// - Le message "No HydrateFallback element provided ..." apparaît souvent
//   lorsqu'un composant SEO orienté SSR (Helmet, etc.) est monté dans une app
//   purement client (Vite). Pour éviter tout souci d'hydratation, on remplace
//   <Meta /> par un effet qui met à jour document.title + meta tags.
// ----------------------------------------------------------------------------
// Design : inchangé. Navigation identique (on récupère l'objet via location.state)
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ActualiteDetailLayout from "./components/ActualiteDetailLayout";

export default function ActualiteDetail() {
  // ----------------------------------------------------------------------------
  // 1) Récupération de l'actualité passée via navigate(..., { state: { actualite }})
  //    Si on arrive sans state (ex: refresh direct), on redirige vers /actualites
  // ----------------------------------------------------------------------------
  const { state } = useLocation();
  const navigate = useNavigate();
  const [data] = useState(state?.actualite || null);

  // ----------------------------------------------------------------------------
  // 2) Préparation du SEO (titres/description/keywords) côté client uniquement
  //    - On calcule les valeurs à partir des champs de l'actualité.
  // ----------------------------------------------------------------------------
  const metaTitle = useMemo(() => {
    if (!data) return "Actualité | Astuces & Murmures";
    const t = data.titreEvenement || data.nomMagasin || "Actualité";
    return `${t} | Astuces & Murmures`;
  }, [data]);

  const metaDescription = useMemo(
    () =>
      (data?.metaDescription && String(data.metaDescription)) ||
      (data?.phraseAccroche && String(data.phraseAccroche)) ||
      "Actualité bien-être",
    [data]
  );

  const metaKeywords = useMemo(() => {
    return Array.isArray(data?.keywords) ? data.keywords.join(",") : undefined;
  }, [data]);

  // ----------------------------------------------------------------------------
  // 3) Redirection douce si pas de données (arrivée directe / refresh)
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (!data) navigate("/actualites");
  }, [data, navigate]);

  // ----------------------------------------------------------------------------
  // 4) SEO côté client — sans Helmet :
  //    - document.title
  //    - <meta name="description"> (créé si absent)
  //    - <meta name="keywords"> (créé si absent)
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (!data) return;

    // Titre onglet
    const previousTitle = document.title;
    document.title = metaTitle;

    // Description
    const ensureMeta = (name) => {
      let node = document.querySelector(`meta[name="${name}"]`);
      if (!node) {
        node = document.createElement("meta");
        node.setAttribute("name", name);
        document.head.appendChild(node);
      }
      return node;
    };

    const descNode = ensureMeta("description");
    const prevDesc = descNode.getAttribute("content");
    descNode.setAttribute("content", metaDescription || "");

    let prevKw = "";
    let kwNode = null;
    if (metaKeywords) {
      kwNode = ensureMeta("keywords");
      prevKw = kwNode.getAttribute("content") || "";
      kwNode.setAttribute("content", metaKeywords);
    }

    // Nettoyage : restaurer l'état initial quand on quitte la page
    return () => {
      document.title = previousTitle;
      descNode.setAttribute("content", prevDesc || "");
      if (kwNode) kwNode.setAttribute("content", prevKw);
    };
  }, [data, metaTitle, metaDescription, metaKeywords]);

  // ----------------------------------------------------------------------------
  // 5) Rendu : si pas de data (transition courte), on n'affiche rien
  // ----------------------------------------------------------------------------
  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 
        Layout détail d'actualité :
        - Garde tout ton design (fonds doux, ombres, etc.)
        - Affiche photo / titres / contenu / ville / dates selon ton composant.
      */}
      <ActualiteDetailLayout actualite={data} />
    </div>
  );
}

// src/components/Common/Meta.jsx
// ============================================================================
// 🧠 Meta — mini "Helmet" maison compatible React 19
// But : définir <title> et <meta name="description|keywords"> SANS dépendance.
// - Utilise useEffect pour mettre à jour le head du document côté client.
// - Si la balise meta n'existe pas, on la crée proprement.
// - Zéro dépendance externe (donc pas de problèmes de peer deps).
// ============================================================================

import { useEffect } from "react";

/**
 * Assure l'existence (ou la création) d'une balise <meta name="...">,
 * puis met sa valeur "content".
 */
function setNamedMeta(name, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

/**
 * Meta
 * @param {{ title?: string, description?: string, keywords?: string|string[] }} props
 * - title        : Titre de l’onglet
 * - description  : Meta description
 * - keywords     : Tableau ou string (sera join(", "))
 */
export default function Meta({ title, description, keywords }) {
  useEffect(() => {
    // ---------- <title> ----------
    if (title) document.title = title;

    // ---------- <meta name="description"> ----------
    if (description) setNamedMeta("description", description);

    // ---------- <meta name="keywords"> ----------
    if (keywords && Array.isArray(keywords)) {
      setNamedMeta("keywords", keywords.join(", "));
    } else if (typeof keywords === "string") {
      setNamedMeta("keywords", keywords);
    }
  }, [title, description, keywords]);

  // Ne rend rien (uniquement effets sur <head>)
  return null;
}

// client/src/components/BlogListRow.jsx
// ======================================================================
// Ligne de la liste complète d’articles (sous le slider).
// 🎯 Contenu: titre, auteur, catégorie, nb avis, nb commentaires, date.
// 🖱️ Clic = ouvre l’article.
// 🎨 Design: fond légèrement plus foncé que la page (#F1ECE4) + shadow.
// ======================================================================

import React from "react";
import { Link } from "react-router-dom";

export default function BlogListRow({ post }) {
  const {
    slug = "#",
    title = "Titre",
    author = "Auteur",
    category = "Catégorie",
    reviewsCount = 0,
    commentsCount = 0,
    createdAt = new Date().toISOString(),
  } = post || {};

  const date = new Date(createdAt).toLocaleDateString("fr-FR");

  return (
    <li className="rounded-xl shadow-md hover:shadow-lg transition bg-[#F1ECE4]">
      <Link
        to={`/blog/${slug}`}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 md:p-4"
      >
        <span className="text-sm md:text-base font-semibold text-neutral-900">
          {title}
        </span>

        <span className="hidden sm:inline text-neutral-400">•</span>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-neutral-700">
          <span>{author}</span>
          <span className="opacity-60">•</span>
          <span>{category}</span>
          <span className="opacity-60">•</span>
          <span>{reviewsCount} avis</span>
          <span className="opacity-60">•</span>
          <span>{commentsCount} commentaires</span>
          <span className="opacity-60">•</span>
          <span>{date}</span>
        </div>
      </Link>
    </li>
  );
}

// src/pages/Blog/BlogLibrary.jsx
// =====================================================================
// 📚 Bibliothèque d’articles (liste condensée)
// - Filtres via query params: ?search=... & theme=...
// - Colonnes : Titre, Auteur, Catégorie, Date, Avis (moyenne + nb)
// - Clic sur une ligne -> /blog/:id
// - UI : étoile jaune si ≥1 avis, étoile contour gris si 0 avis,
//        et hover uniquement sur le Titre -> text-pink-700.
// =====================================================================

import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useBlog } from "../../context/BlogContext";

// ---- utilitaires ----
const normalize = (s) =>
  (s || "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const formatDate = (dateString) => {
  const d = new Date(dateString);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Icône étoile (plein si filled, contour sinon)
function Star({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`inline-block w-4 h-4 ${
        filled ? "text-yellow-500" : "text-slate-300"
      }`}
      aria-hidden="true"
    >
      {filled ? (
        <path
          fill="currentColor"
          d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        />
      ) : (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        />
      )}
    </svg>
  );
}

export default function BlogLibrary() {
  const { blogs } = useBlog();
  const location = useLocation();
  const navigate = useNavigate();

  // --- lecture des filtres depuis l’URL ---
  const params = new URLSearchParams(location.search);
  const search = params.get("search") || params.get("author") || "";
  const theme = params.get("theme") || "";

  // --- filtrage identique à la page Blog ---
  const filtered = useMemo(() => {
    const q = normalize(search);
    return blogs
      .filter((b) => {
        const title = normalize(b.title);
        const author = normalize(b.author?.username || "");
        const cat = normalize(b.theme || "");

        const matchSearch =
          q === "" ||
          title.includes(q) ||
          author.includes(q) ||
          cat.includes(q);

        const matchTheme = theme === "" || b.theme === theme;

        return matchSearch && matchTheme;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [blogs, search, theme]);

  return (
    <div className="min-h-screen bg-[#ddd9c4]">
      {/* ------- Header ------- */}
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-serif font-bold text-indigo-900">
            Bibliothèque des articles
          </h1>
          <p className="text-indigo-700 font-medium">
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""} trouvé
            {search ? ` pour « ${search} »` : ""}
            {theme ? ` — thème: ${theme}` : ""}
          </p>
        </div>

        {/* ------- Tableau / Liste ------- */}
        <div className="bg-[#efe7d8] rounded-2xl shadow-[0_5px_12px_rgba(0,0,0,0.2)] border border-indigo-200 overflow-hidden">
          {/* En-têtes (desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-white/70 text-indigo-900 font-semibold border-b border-indigo-100">
            <div className="col-span-5">Titre</div>
            <div className="col-span-2">Auteur</div>
            <div className="col-span-2">Catégorie</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1 text-right">Avis</div>
          </div>

          {/* Lignes */}
          <div className="divide-y divide-indigo-100">
            {filtered.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-600">
                Aucun article ne correspond à votre recherche.
              </div>
            ) : (
              filtered.map((b) => {
                const ratings = b.ratings || [];
                const avg =
                  ratings.length > 0
                    ? (
                        ratings.reduce((s, r) => s + r.value, 0) /
                        ratings.length
                      ).toFixed(1)
                    : "0.0";
                const hasReviews = ratings.length > 0;

                return (
                  <button
                    key={b._id}
                    onClick={() => navigate(`/blog/${b._id}`)}
                    className="w-full text-left px-5 py-4 hover:bg-white/60 transition-colors group"
                  >
                    {/* Desktop: grille */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-5 truncate">
                        {/* Seul le titre change de couleur au hover */}
                        <span className="font-semibold text-slate-800 group-hover:text-pink-700 transition-colors">
                          {b.title}
                        </span>
                        {b.hook && (
                          <span className="ml-2 text-slate-500 italic">
                            — “{b.hook}”
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 text-slate-700 truncate">
                        {b.author?.username}
                      </div>
                      <div className="col-span-2 text-slate-700 truncate">
                        {b.theme}
                      </div>
                      <div className="col-span-2 text-slate-700">
                        {formatDate(b.createdAt)}
                      </div>
                      <div className="col-span-1 text-right text-slate-800">
                        {/* Étoile + moyenne (ou 0.0) + (nb) */}
                        <Star filled={hasReviews} /> <span>{avg}</span>{" "}
                        <span className="text-slate-500">
                          ({ratings.length})
                        </span>
                      </div>
                    </div>

                    {/* Mobile: carte compacte */}
                    <div className="md:hidden">
                      <div className="font-semibold text-slate-800 group-hover:text-pink-700 transition-colors">
                        {b.title}
                      </div>
                      <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                        <span>👤 {b.author?.username}</span>
                        <span>🏷️ {b.theme}</span>
                        <span>🗓️ {formatDate(b.createdAt)}</span>
                        <span className="flex items-center gap-1">
                          <Star filled={hasReviews} /> {avg} ({ratings.length})
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Retour */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/blog")}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-indigo-800 bg-[#b7bea7] text-white px-5 py-3 font-medium shadow-md hover:bg-[#9fa78e] transition-colors"
          >
            ← Retour aux articles
          </button>
        </div>
      </div>
    </div>
  );
}

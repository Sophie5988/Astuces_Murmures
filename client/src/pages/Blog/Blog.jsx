// src/pages/Blog/Blog.jsx
// ============================================================
// 📰 Derniers articles (Astuces & Murmures)
// ------------------------------------------------------------
// Ce composant affiche le header + barre d’outils (recherche/filtre)
// et le SLIDER “6 : Articles à la une !”.
// NOUVEAUTÉS :
//  - Taper ENTER dans la recherche ouvre /blog/list?search=...&theme=...
//  - Changer le thème ouvre /blog/list?search=...&theme=...
//  - Le bouton “Voir plus d’articles” du slider ouvre /blog/list (mêmes filtres)
// Design : Tailwind, fond beige, ombres marquées, responsive 390px.
// ============================================================

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useBlog } from "../../context/BlogContext";
import { useAuth } from "../../context/AuthContext";
import AddBlogModal from "./AddBlogModal";
import BlogCard from "../Blog/BlogCard"; // (utilisé dans le slider)
import BlogSlider from "./BlogSlider"; // ✅ notre slider (3 cartes visibles)
import { Search, Plus } from "lucide-react";

export default function Blog() {
  // -------- Contexte + navigation --------
  const { blogs } = useBlog(); // tous les posts depuis ton contexte
  const { userConnected } = useAuth(); // utilisateur connecté ?
  const navigate = useNavigate();
  const location = useLocation();

  // -------- États UI --------
  const [isOpen, setIsOpen] = useState(false); // modale ajout d’article
  const [searchTerm, setSearchTerm] = useState(""); // texte recherche (titre/auteur/catégorie)
  const [selectedTheme, setSelectedTheme] = useState(""); // filtre par thème exact

  // -------- Liste des thèmes (cohérente avec ton form) --------
  const themes = [
    "Rituel de L'âme",
    "Corps et harmonie",
    "Trésors du quotidien",
    "Jardin des secrets",
    "Calendrier Editorial du mois",
  ];

  // -------- Quand on arrive depuis /blog?author=... --------
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const author = params.get("author");
    if (author) setSearchTerm(author);
  }, [location.search]);

  // -------- utilitaire de normalisation (accents/casse) --------
  const normalize = (s) =>
    (s || "")
      .toString()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();

  // -------- Filtrage pour l'info "X résultats trouvés" --------
  const filteredBlogs = useMemo(() => {
    const q = normalize(searchTerm);
    return blogs.filter((blog) => {
      const title = normalize(blog.title);
      const author = normalize(blog.author?.username || "");
      const theme = normalize(blog.theme || "");

      const matchesSearch =
        q === "" ||
        title.includes(q) ||
        author.includes(q) ||
        theme.includes(q);

      const matchesTheme = selectedTheme === "" || blog.theme === selectedTheme;

      return matchesSearch && matchesTheme;
    });
  }, [blogs, searchTerm, selectedTheme]);

  // -------- Navigation vers la Bibliothèque /blog/list --------
  const goToLibrary = (q = "", th = "") => {
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (th) params.set("theme", th);
    navigate(`/blog/list${params.toString() ? `?${params.toString()}` : ""}`);
  };

  // ENTER dans la recherche -> ouvre la bibliothèque
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goToLibrary(searchTerm.trim(), selectedTheme);
    }
  };

  // Changement de thème -> ouvre la bibliothèque
  const handleThemeChange = (e) => {
    const th = e.target.value;
    setSelectedTheme(th);
    goToLibrary(searchTerm.trim(), th);
  };

  // ============================================================
  // --------------------------- UI -----------------------------
  // ============================================================

  return (
    // Fond beige du site
    <div className="min-h-screen bg-[#ddd9c4]">
      <div className="container mx-auto p-6">
        {/* ---------- En-tête ---------- */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-indigo-900 mb-2">
            📰 Derniers articles
          </h1>
          <p className="text-indigo-700 font-medium text-base">
            Découvrez nos contenus zen et inspirants
          </p>
        </div>

        {/* ---------- Barre outils (retour + recherche + thème + bouton ajout) ---------- */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="bg-[#efe7d8] rounded-2xl p-6 shadow-[0_5px_12px_rgba(0,0,0,0.2)] border border-indigo-200">
            <div className="flex flex-col md:flex-row gap-4 md:items-start">
              {/* ← Retour Accueil */}
              <button
                onClick={() => navigate("/accueil")}
                className="md:w-44 w-full rounded-xl border-2 border-indigo-800 bg-[#b7bea7] text-white px-4 py-3 font-medium shadow-md flex items-center justify-center gap-2 hover:bg-[#9fa78e] transition-colors"
              >
                {/* petite flèche inline */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Retour Accueil
              </button>

              {/* Grille filtres : recherche + thème + bouton nouvel article */}
              <div className="grid md:grid-cols-3 gap-4 flex-1">
                {/* 🔎 Recherche (ENTER -> /blog/list) */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher par titre, auteur ou catégorie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearchKeyDown} // ✅ ENTER => Bibliothèque
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-indigo-800 bg-white focus:border-indigo-800 focus:outline-none transition-colors"
                    aria-label="Recherche par titre, auteur ou catégorie"
                  />
                </div>

                {/* 🗂️ Thème (change -> /blog/list) */}
                <div>
                  <select
                    value={selectedTheme}
                    onChange={handleThemeChange} // ✅ ouvre Bibliothèque
                    className="w-full py-3 px-4 rounded-xl border-2 border-indigo-800 bg-white focus:border-indigo-800 focus:outline-none transition-colors"
                    aria-label="Filtrer par thème"
                  >
                    <option value="">Tous les thèmes</option>
                    {themes.map((theme) => (
                      <option key={theme} value={theme}>
                        {theme}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ➕ Nouvel article (si connecté) */}
                <div>
                  {userConnected ? (
                    <button
                      onClick={() => setIsOpen(true)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-pink-100 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Nouvel article
                    </button>
                  ) : (
                    <div className="w-full bg-gray-100 text-gray-500 px-6 py-3 rounded-xl text-center text-sm italic">
                      Connectez-vous pour publier
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ligne d’info : nombre de résultats (pour le feedback) */}
            <div className="mt-4 flex items-center justify-between text-sm text-slate-700">
              <span>
                {filteredBlogs.length} résultat
                {filteredBlogs.length > 1 ? "s" : ""} trouvé
                {searchTerm ? ` pour « ${searchTerm} »` : ""}
                {selectedTheme ? ` — thème: ${selectedTheme}` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* ---------- SLIDER : 6 articles à la une (3 cartes visibles) ---------- */}
        <BlogSlider
          blogs={blogs}
          onViewMore={() => {
            // Bouton “Voir plus d’articles” -> ouvre la Bibliothèque avec filtres actuels
            const params = new URLSearchParams();
            if (searchTerm.trim()) params.set("search", searchTerm.trim());
            if (selectedTheme) params.set("theme", selectedTheme);
            navigate(
              `/blog/list${params.toString() ? `?${params.toString()}` : ""}`
            );
          }}
        />

        {/* ---------- Modale d’ajout ---------- */}
        <AddBlogModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </div>
    </div>
  );
}

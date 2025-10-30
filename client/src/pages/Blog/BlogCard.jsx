// src/pages/Blog/BlogCard.jsx
// ============================================================
// Carte Blog (version uniforme pour le slider)
// ------------------------------------------------------------
// Objectif design : même DIMENSION pour toutes les cartes
// - Hauteur FIXE en desktop/tablette pour éviter les "marches".
// - Le contenu texte est clampé (titres + corps) pour tenir
//   sans déborder, tout en gardant Auteur, Date, Avis et bouton visibles.
// - Couleurs/ombres : on conserve TES choix initiaux.
// - Le bouton "Voir plus" stoppe la propagation pour ne pas déclencher
//   onClick du conteneur parent (précision UX).
// ============================================================

import { useNavigate } from "react-router-dom";
import { Calendar, User, Star, MessageCircle } from "lucide-react";

export default function BlogCard({ blog }) {
  const navigate = useNavigate();

  // ✅ On ne tronque plus "à la main" par longueur (600),
  //    on laisse Tailwind (line-clamp) gérer l'affichage homogène.
  const averageRating =
    blog.ratings && blog.ratings.length > 0
      ? (
          blog.ratings.reduce((sum, rating) => sum + rating.value, 0) /
          blog.ratings.length
        ).toFixed(1)
      : 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    // 🔲 Bande externe (inchangée)
    <div className="container mx-auto px-6 py-8 bg-[#fddede] shadow-[5px_5px_5px_rgba(0,0,0,0.65)] hover:shadow-[8px_8px_8px_rgba(0,0,0,0.7)]">
      <div
        // ✅ Hauteur FIXE desktop/tablette pour uniformiser les cartes
        //    (mobile reste auto pour lisibilité).
        className="h-auto md:h-[820px] max-w-[1000px] flex flex-col group cursor-pointer bg-[#ddd9c4] rounded-4xl overflow-hidden shadow-[5px_5px_5px_rgba(0,0,0,0.65)] hover:shadow-[8px_8px_8px_rgba(0,0,0,0.7)] mx-auto"
        onClick={() => navigate(`/blog/${blog._id}`)}
      >
        {/* 📷 Image : hauteur fixe comme avant */}
        <div className="relative overflow-hidden h-[250px] md:h-[300px] flex-shrink-0">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* badge commentaires */}
          <div className="absolute top-3 right-3 bg-slate-900/80 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {typeof blog.commentCount === "number" ? blog.commentCount : 0}
          </div>
        </div>

        {/* 🧱 Corps de carte */}
        <div className="p-4 md:p-5 flex-1 flex flex-col shadow-[5px_5px_5px_rgba(0,0,0,0.65)] hover:shadow-[8px_8px_8px_rgba(0,0,0,0.7)]">
          <div className="relative flex-1 flex flex-col">
            <div className="border-4 border-slate-400 rounded-2xl p-1 shadow-lg flex-1 flex flex-col">
              {/* blur retiré : bg-white opaque */}
              <div className="border-2 border-slate-200 rounded-xl bg-white flex-1 flex flex-col">
                <div className="p-4 md:p-6 flex-1 flex flex-col">
                  {/* 🏷️ Titre + Accroche (clamp pour uniformiser) */}
                  <div className="mb-3 text-center">
                    <h2 className="text-lg md:text-xl font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-indigo-700 transition-colors">
                      {blog.title}
                    </h2>
                    {blog.hook && (
                      <p className="text-sm text-indigo-600 italic mt-1 line-clamp-1">
                        "{blog.hook}"
                      </p>
                    )}
                  </div>

                  {/* ✍️ Contenu : clamp 8 lignes desktop / 6 mobile */}
                  <div className="flex-1 mb-4">
                    <p className="text-slate-700 leading-relaxed text-sm md:text-base line-clamp-6 md:line-clamp-8">
                      {blog.content}
                    </p>
                  </div>

                  {/* 📌 Footer informations + bouton */}
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center text-xs md:text-sm text-slate-700">
                      <User className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="font-medium ml-1">
                        {blog.author?.username}
                      </span>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      {blog.ratings && blog.ratings.length > 0 ? (
                        <div className="flex items-center gap-1 text-xs md:text-sm">
                          <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-current" />
                          <span className="font-medium text-slate-700">
                            {averageRating}
                          </span>
                          <span className="text-slate-700">
                            ({blog.ratings.length})
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs md:text-sm text-slate-600">
                          <Star className="w-3 h-3 md:w-4 md:h-4" />
                          <span>Aucun avis</span>
                        </div>
                      )}

                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-xs md:text-sm text-slate-700 mb-1">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                          <span>{formatDate(blog.createdAt)}</span>
                        </div>
                        <button
                          className="text-indigo-700 hover:text-indigo-900 font-medium text-sm md:text-base transition-colors flex items-center gap-1 hover:gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/blog/${blog._id}`);
                          }}
                        >
                          Voir plus <span>→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* /footer */}
                </div>
              </div>
              {/* /inner */}
            </div>
          </div>
        </div>
        {/* /corps */}
      </div>
    </div>
  );
}

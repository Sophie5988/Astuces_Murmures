// src/pages/Blog/BlogDetails.jsx
// ============================================================
// Détails d’un article + notes + commentaires
// ------------------------------------------------------------
// ⚠️ On garde TES APIs existantes (addComment(content, blogId), etc.).
// ✅ Correction clé : le bouton "Articles de {auteur}" navigue vers
//    /blog?author=... (et non plus /?author=...) pour réactiver la
//    recherche + filtres dans Blog.jsx.
// ✅ Lecture article via /api/blog/:id (fetch local sûr).
// ============================================================

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useBlog } from "../../context/BlogContext";
import StarRating from "../../utils/StarRating";
import {
  addComment, // (content, blogId)
  deleteRateBlog,
  // getBlogById,     // volontairement non utilisé ici
  deleteComment,
} from "../../api/blog.api";
import {
  ChevronDown,
  ChevronUp,
  Search,
  ArrowLeft,
  Trash2,
} from "lucide-react";

// -------- Helpers locaux sûrs --------
const BASE = "/api";
async function safeJson(res) {
  const txt = await res.text().catch(() => "");
  try {
    return txt ? JSON.parse(txt) : null;
  } catch {
    return null;
  }
}
function asBlog(res) {
  const b = res?.blog ?? res ?? null;
  if (!b || typeof b !== "object") return null;
  return {
    ...b,
    comments: Array.isArray(b.comments) ? b.comments : [],
    ratings: Array.isArray(b.ratings) ? b.ratings : [],
    author: b.author || null,
  };
}
async function fetchBlogByIdSafe(id) {
  const res = await fetch(`${BASE}/blog/${id}`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const data = await safeJson(res);
    const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return asBlog(await safeJson(res));
}
async function fetchCommentsFallback(blogId) {
  try {
    const r1 = await fetch(`${BASE}/blog/${blogId}/comments`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (r1.ok) {
      const d = await safeJson(r1);
      const list =
        (Array.isArray(d) && d) ||
        (Array.isArray(d?.comments) && d.comments) ||
        (Array.isArray(d?.data) && d.data) ||
        [];
      if (Array.isArray(list)) return list;
    }
  } catch {}
  try {
    const r2 = await fetch(
      `${BASE}/comments?blog=${encodeURIComponent(blogId)}`,
      {
        credentials: "include",
        headers: { Accept: "application/json" },
      }
    );
    if (r2.ok) {
      const d = await safeJson(r2);
      const list =
        (Array.isArray(d) && d) ||
        (Array.isArray(d?.comments) && d.comments) ||
        (Array.isArray(d?.data) && d.data) ||
        [];
      if (Array.isArray(list)) return list;
    }
  } catch {}
  return [];
}
// -------------------------------------

export default function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userConnected } = useAuth();
  const {
    blogs,
    rateInBlogContext,
    incrementCommentCount,
    decrementCommentCount,
    replaceBlog,
  } = useBlog();

  const blogFromCtx = blogs.find((b) => b._id === id);

  const [blogData, setBlogData] = useState(blogFromCtx || null);
  const [comments, setComments] = useState(blogFromCtx?.comments || []);
  const [ratings, setRatings] = useState(blogFromCtx?.ratings || []);
  const [hasWatched, setHasWatched] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const fresh = await fetchBlogByIdSafe(id);
        if (!alive || !fresh) throw new Error("Blog introuvable");

        let list = fresh.comments || [];
        if (!list.length) list = await fetchCommentsFallback(id);

        const sorted = [...list].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setBlogData({ ...fresh, comments: sorted });
        setRatings(fresh.ratings || []);
        setComments(sorted);
        replaceBlog({ ...fresh, comments: sorted });
      } catch {
        if (blogFromCtx) {
          setBlogData(blogFromCtx);
          setRatings(blogFromCtx?.ratings || []);
          setComments(blogFromCtx?.comments || []);
        } else {
          navigate("/accueil");
        }
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isAuthor =
    !!userConnected &&
    userConnected._id ===
      (blogData?.author?._id ||
        (typeof blogData?.author === "string" ? blogData.author : ""));
  const canInteract = !!userConnected && !isAuthor;

  useEffect(() => {
    if (!blogData || !blogData.ratings || !userConnected) {
      setHasWatched(false);
      setUserRating(0);
      return;
    }
    const existing = blogData.ratings.find((r) => {
      const rid = typeof r.author === "string" ? r.author : r.author?._id;
      return rid === userConnected._id;
    });
    if (existing) {
      setHasWatched(true);
      setUserRating(existing.value);
    } else {
      setHasWatched(false);
      setUserRating(0);
    }
  }, [userConnected, blogData]);

  if (!blogData) {
    return (
      <div className="min-h-screen bg-[#f5f1e5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-indigo-700 font-medium">
            Chargement du blog...
          </p>
        </div>
      </div>
    );
  }

  const averageRating =
    ratings && ratings.length > 0
      ? (ratings.reduce((s, r) => s + r.value, 0) / ratings.length).toFixed(1)
      : 0;

  const handleWatchedClick = async () => {
    const newValue = !hasWatched;
    setHasWatched(newValue);
    if (!newValue) {
      setUserRating(0);
      await deleteRateBlog(blogData._id);
    }
  };

  const handleRating = async (rating) => {
    const newNote = await rateInBlogContext(blogData._id, rating);
    setHasWatched(true);
    setUserRating(newNote.value);
    const filtered = (blogData.ratings || []).filter((r) => {
      const a = typeof r.author === "string" ? r.author : r.author?._id;
      return a !== userConnected._id;
    });
    const updated = [...filtered, newNote];
    setRatings(updated);
    setBlogData((prev) => ({ ...prev, ratings: updated }));
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    try {
      const created = await addComment(commentText.trim(), blogData._id);

      if (created && (created._id || created.content)) {
        const safe = {
          _id: created._id || `tmp-${Date.now()}`,
          content: created.content || commentText.trim(),
          createdAt: created.createdAt || new Date().toISOString(),
          author: created.author || {
            _id: userConnected?._id,
            username: userConnected?.username || "Moi",
          },
        };
        setComments((prev) => [safe, ...prev]);
        incrementCommentCount(blogData._id);
      }
      setCommentText("");

      const fresh = await fetchBlogByIdSafe(blogData._id);
      let list = fresh?.comments || [];
      if (!list.length) list = await fetchCommentsFallback(blogData._id);
      const sorted = [...list].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setComments(sorted);
      setBlogData({ ...(fresh || blogData), comments: sorted });
      replaceBlog({ ...(fresh || blogData), comments: sorted });
    } catch (e) {
      console.error("Erreur lors de l'ajout du commentaire:", e);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await deleteComment(blogData._id, commentId);
      if (res?.success || res?.message) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        decrementCommentCount(blogData._id);
      }
    } catch (e) {
      console.error("Suppression impossible", e);
    }
  };

  // ✅ CORRECTION ICI : on va vers /blog?author=...
  const searchAuthorArticles = () => {
    navigate(
      `/blog?author=${encodeURIComponent(blogData.author?.username || "")}`
    );
  };

  const displayedComments = comments.slice(0, visibleCount);
  const canShowMore = comments.length > visibleCount;

  return (
    <div className="min-h-screen bg-[#f5f1e5]">
      {/* Header */}
      <div className="bg-[#ddd9c4] shadow-[0_5px_5px_rgba(0,0,0,0.65)] border-b border-indigo-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate("/blog")}
              className="flex items-center gap-2 bg-indigo-100 hover:bg-indigo-400 text-indigo-700 px-4 py-2 rounded-lg transition-colors font-medium shadow-[0_5px_5px_rgba(0,0,0,0.65)]"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour aux articles
            </button>
            <button
              onClick={searchAuthorArticles}
              className="flex items-center gap-2 bg-indigo-100 hover:bg-indigo-400 text-indigo-700 px-4 py-2 rounded-lg transition-colors font-medium shadow-[0_5px_5px_rgba(0,0,0,0.65)]"
            >
              <Search className="w-4 h-4" />
              Articles de {blogData.author?.username}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Contenu gauche */}
          <div className="lg:col-span-2 bg-[#ddd9c4] rounded-3xl p-8 shadow-[5px_5px_5px_rgba(0,0,0,0.65)] hover:shadow-[8px_8px_8px_rgba(0,0,0,0.7)]">
            <h1 className="text-5xl font-serif font-bold text-slate-800 mb-8 leading-tight tracking-wide">
              {blogData.title}
            </h1>

            <div className="relative">
              <div className="border-4 border-slate-400 rounded-2xl p-1 shadow-[0_5px_5px_rgba(0,0,0,0.65)]">
                <div className="border-2 border-slate-200 rounded-xl bg-white">
                  <div
                    className={`p-6 transition-all duration-300 ${
                      isContentExpanded ? "max-h-none" : "max-h-[800px]"
                    } overflow-hidden relative`}
                  >
                    <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed">
                      <p className="whitespace-pre-wrap text-base leading-7">
                        {blogData.content}
                      </p>
                    </div>

                    {!isContentExpanded &&
                      (blogData.content?.length || 0) > 1000 && (
                        <>
                          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                          <button
                            onClick={() => setIsContentExpanded(true)}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg transition-all"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </button>
                        </>
                      )}

                    {isContentExpanded && (
                      <button
                        onClick={() => setIsContentExpanded(false)}
                        className="mt-6 mx-auto block bg-slate-600 hover:bg-slate-700 text-white p-3 rounded-full shadow-lg transition-all"
                      >
                        <ChevronUp className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar droite */}
          <div className="lg:col-span-1 bg-[#ddd9c4] rounded-2xl p-6 shadow-[5px_5px_5px_rgba(0,0,0,0.65)] hover:shadow-[8px_8px_8px_rgba(0,0,0,0.7)] transition-all duration-300 hover:scale-[1.02] border border-indigo-100">
            <div className="border-4 border-slate-400 rounded-2xl p-1 shadow-lg">
              <div className="border-2 border-slate-200 rounded-xl bg-white h-full flex flex-col">
                {/* Photo */}
                <div className="p-4">
                  {blogData.image && (
                    <img
                      src={blogData.image}
                      alt={blogData.title}
                      className="w-full h-56 object-cover rounded-xl shadow-lg"
                    />
                  )}
                </div>

                {/* Auteur + moyenne */}
                <div className="px-4">
                  <p className="text-slate-600 font-medium">
                    Par{" "}
                    <span className="font-bold text-slate-800">
                      {blogData.author?.username}
                    </span>
                  </p>

                  {ratings && ratings.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-full">
                      <span className="text-yellow-500 text-lg">⭐</span>
                      <span className="font-bold text-gray-900">
                        {averageRating}/5
                      </span>
                      <span className="text-sm text-gray-600">
                        ({ratings.length} avis)
                      </span>
                    </div>
                  )}
                </div>

                {/* Évaluation */}
                {canInteract && (
                  <div className="px-4 mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-pink-600">
                        Votre évaluation
                      </h3>
                      <button
                        className={`px-3 py-1 rounded-lg text-sm transition-all ${
                          !hasWatched
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                        onClick={handleWatchedClick}
                      >
                        {hasWatched ? "Article lu ✓" : "Marquer comme lu"}
                      </button>
                    </div>

                    <StarRating
                      maxStars={5}
                      rating={userRating}
                      onRatingChange={handleRating}
                    />
                    {userRating > 0 && (
                      <p className="text-xs text-green-600 mt-2">
                        Votre note: {userRating}/5
                      </p>
                    )}
                  </div>
                )}

                {/* Commentaires */}
                <div className="p-4 mt-6 border-t border-slate-200 flex flex-col">
                  <h3 className="text-lg font-bold text-pink-600 mb-4">
                    Commentaires ({comments.length})
                  </h3>

                  {userConnected && (
                    <div className="mb-6">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Votre commentaire..."
                        className="w-full border-2 border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 resize-none bg-white text-slate-800"
                        rows="3"
                      />
                      <button
                        onClick={handlePostComment}
                        className="mt-3 w-full text-pink-100 bg-indigo-600 hover:bg-indigo-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                        disabled={!commentText.trim()}
                      >
                        Publier
                      </button>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto space-y-4 max-h-[420px] custom-scrollbar">
                    {displayedComments.length === 0 ? (
                      <p className="text-center text-slate-500 text-sm py-8">
                        Aucun commentaire pour le moment
                      </p>
                    ) : (
                      displayedComments.map((comment, i) => {
                        const isOwner =
                          userConnected &&
                          userConnected._id ===
                            (typeof comment.author === "string"
                              ? comment.author
                              : comment.author?._id);

                        const dateStr =
                          comment.createdAt &&
                          !isNaN(new Date(comment.createdAt))
                            ? new Date(comment.createdAt).toLocaleDateString()
                            : "";

                        return (
                          <div
                            key={comment._id || `c-${i}`}
                            className="bg-slate-100 rounded-lg p-3 text-sm border border-slate-200"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {(comment.author?.username || "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <span className="font-medium text-slate-800 text-xs">
                                {comment.author?.username || "Utilisateur"}
                              </span>
                              <span className="text-xs text-slate-500 ml-auto">
                                {dateStr}
                              </span>
                              {isOwner && (
                                <button
                                  onClick={() =>
                                    handleDeleteComment(comment._id)
                                  }
                                  className="ml-2 text-red-600 hover:text-red-700"
                                  title="Supprimer mon commentaire"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <p className="text-slate-800 text-xs leading-relaxed">
                              {comment.content}
                            </p>
                          </div>
                        );
                      })
                    )}

                    {canShowMore && (
                      <button
                        onClick={() =>
                          setVisibleCount((n) =>
                            Math.min(n + 10, comments.length)
                          )
                        }
                        className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Voir plus de commentaires
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /sidebar */}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}

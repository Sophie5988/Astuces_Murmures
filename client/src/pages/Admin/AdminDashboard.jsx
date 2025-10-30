// src/pages/Admin/AdminDashboard.jsx
// ============================================================================
// ADMIN — Astuces & Murmures
// 4 sections : Profil | Actualités | Blog | E-shop
// - Conserve tes onglets existants pour Profil / Actualités / E-shop (aucun changement).
// - Ajoute onglet "Blog" (listing, recherche, tri, pagination, valider/refuser (motif), modifier, supprimer).
// - Badge compteur "+N" sur le bouton Blog (nombre de pending).
// - Entête : "Bonjour Admin" (au lieu de "Bonjour + user").
// Design Tailwind zen, responsive ≥390px
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import {
  listAdminBlogs,
  approveAdminBlog,
  rejectAdminBlog,
  updateAdminBlog,
  deleteAdminBlog,
} from "../../api/adminBlog";

// ---------------- Icônes simples (SVG inline) ----------------
function IconSearch(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconTrash(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconEdit(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 21l4.5-1L20 8.5 16.5 5 5 16.5 4 21Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconCheck(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconClose(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M6 18L18 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---------------- Badges statut ----------------
function StatusBadge({ status }) {
  const cn =
    status === "approved"
      ? "bg-emerald-100 text-emerald-700"
      : status === "pending"
      ? "bg-amber-100 text-amber-700"
      : "bg-rose-100 text-rose-700";
  const label =
    status === "approved"
      ? "Approuvé"
      : status === "pending"
      ? "En attente"
      : "Refusé";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cn}`}>
      {label}
    </span>
  );
}

// ---------------- Ligne tableau Blog ----------------
function BlogRow({ item, onApprove, onReject, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title || "");
  const [accroche, setAccroche] = useState(item.accroche || "");
  const [category, setCategory] = useState(item.category || "");
  const [saving, setSaving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [motif, setMotif] = useState("");

  return (
    <tr className="border-b border-stone-200 hover:bg-stone-50/60 transition-colors">
      <td className="px-3 py-2 align-top">
        {editing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white border border-stone-300 rounded-md px-2 py-1 text-sm"
          />
        ) : (
          <div className="font-semibold text-stone-900">{item.title}</div>
        )}
        <div className="text-xs text-stone-500">
          {new Date(item.createdAt || Date.now()).toLocaleString("fr-FR")}
        </div>
      </td>

      <td className="px-3 py-2 align-top">
        {editing ? (
          <input
            value={accroche}
            onChange={(e) => setAccroche(e.target.value)}
            className="w-full bg-white border border-stone-300 rounded-md px-2 py-1 text-sm"
          />
        ) : (
          <div className="text-sm text-stone-700 line-clamp-2">
            {item.accroche || "—"}
          </div>
        )}
      </td>

      <td className="px-3 py-2 align-top">
        {editing ? (
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white border border-stone-300 rounded-md px-2 py-1 text-sm"
          />
        ) : (
          <span className="text-sm text-stone-800">{item.category || "—"}</span>
        )}
      </td>

      <td className="px-3 py-2 align-top">
        <StatusBadge
          status={item.status || (item.isValidated ? "approved" : "pending")}
        />
      </td>

      <td className="px-3 py-2 align-top">
        <div className="flex flex-wrap gap-2">
          {item.status !== "approved" && (
            <button
              onClick={() => onApprove(item)}
              className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg shadow hover:scale-[1.02] transition-transform"
              title="Approuver"
            >
              <IconCheck className="w-4 h-4" /> Valider
            </button>
          )}
          {item.status !== "rejected" && (
            <>
              {!rejecting ? (
                <button
                  onClick={() => setRejecting(true)}
                  className="inline-flex items-center gap-1 bg-amber-600 text-white text-xs px-3 py-1.5 rounded-lg shadow hover:scale-[1.02] transition-transform"
                  title="Refuser (motif)"
                >
                  <IconClose className="w-4 h-4" /> Refuser
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    placeholder="Motif (SEO, qualité, plagiat...)"
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    className="w-44 bg-white border border-stone-300 rounded-md px-2 py-1 text-xs"
                  />
                  <button
                    onClick={() => {
                      setRejecting(false);
                      onReject(item, motif);
                      setMotif("");
                    }}
                    className="bg-amber-700 text-white text-xs px-2 py-1 rounded-md shadow hover:scale-[1.02]"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => {
                      setRejecting(false);
                      setMotif("");
                    }}
                    className="bg-stone-200 text-stone-700 text-xs px-2 py-1 rounded-md hover:scale-[1.02]"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </>
          )}
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1 bg-stone-700 text-white text-xs px-3 py-1.5 rounded-lg shadow hover:scale-[1.02] transition-transform"
              title="Éditer"
            >
              <IconEdit className="w-4 h-4" /> Modifier
            </button>
          ) : (
            <>
              <button
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  await onSave(item, { title, accroche, category });
                  setSaving(false);
                  setEditing(false);
                }}
                className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg shadow hover:scale-[1.02] transition-transform ${
                  saving
                    ? "bg-stone-400 text-white cursor-not-allowed"
                    : "bg-stone-900 text-stone-50"
                }`}
                title="Enregistrer"
              >
                <IconCheck className="w-4 h-4" /> Enregistrer
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setTitle(item.title || "");
                  setAccroche(item.accroche || "");
                  setCategory(item.category || "");
                }}
                className="inline-flex items-center gap-1 bg-stone-200 text-stone-800 text-xs px-3 py-1.5 rounded-lg shadow hover:scale-[1.02]"
                title="Annuler"
              >
                <IconClose className="w-4 h-4" /> Annuler
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(item)}
            className="inline-flex items-center gap-1 bg-rose-600 text-white text-xs px-3 py-1.5 rounded-lg shadow hover:scale-[1.02] transition-transform"
            title="Supprimer"
          >
            <IconTrash className="w-4 h-4" /> Supprimer
          </button>
        </div>
      </td>
    </tr>
  );
}

// ---------------- Tableau Blog (onglet complet) ----------------
function BlogTabView() {
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("createdAt:desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  );

  async function fetchBlogList(over = {}) {
    setLoading(true);
    try {
      const params = { status, search, sort, page, limit, ...over };
      const d = await listAdminBlogs(params);
      const list =
        (Array.isArray(d?.items) && d.items) ||
        (Array.isArray(d?.blogs) && d.blogs) ||
        (Array.isArray(d?.data) && d.data) ||
        [];
      setRows(list);
      setTotal(Number(d?.total || list.length || 0));
    } catch (e) {
      console.error("Admin list error:", e);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBlogList(); /* eslint-disable-next-line */
  }, [status, search, sort, page, limit]);

  async function handleApprove(item) {
    try {
      await approveAdminBlog(item._id);
      await fetchBlogList();
    } catch (e) {
      console.error(e);
    }
  }
  async function handleReject(item, motif) {
    try {
      await rejectAdminBlog(item._id, motif || "Qualité / SEO");
      await fetchBlogList();
    } catch (e) {
      console.error(e);
    }
  }
  async function handleSave(item, patch) {
    try {
      await updateAdminBlog(item._id, patch);
      await fetchBlogList();
    } catch (e) {
      console.error(e);
    }
  }
  async function handleDelete(item) {
    try {
      await deleteAdminBlog(item._id);
      await fetchBlogList();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-4">
      {/* Outils */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="bg-stone-200 text-stone-900 border border-stone-300 rounded-lg px-3 py-2 text-sm"
            title="Filtrer par statut"
          >
            <option value="pending">En attente</option>
            <option value="approved">Approuvés</option>
            <option value="rejected">Refusés</option>
          </select>
          <select
            value={sort}
            onChange={(e) => {
              setPage(1);
              setSort(e.target.value);
            }}
            className="bg-stone-200 text-stone-900 border border-stone-300 rounded-lg px-3 py-2 text-sm"
            title="Trier par"
          >
            <option value="createdAt:desc">Créés (↓)</option>
            <option value="createdAt:asc">Créés (↑)</option>
            <option value="title:asc">Titre (A→Z)</option>
            <option value="title:desc">Titre (Z→A)</option>
          </select>
        </div>
        <div className="relative">
          <IconSearch className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Rechercher un titre, une catégorie, un auteur…"
            className="pl-8 pr-3 py-2 bg-stone-200 border border-stone-300 rounded-lg text-stone-900 w-72"
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-[#ddd9c4] rounded-2xl p-4 shadow-[5px_5px_5px_rgba(0,0,0,0.65)]">
        <div className="border-4 border-stone-400 rounded-2xl p-1">
          <div className="border-2 border-stone-200 rounded-xl bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-stone-700">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Titre</th>
                    <th className="px-3 py-2 font-semibold">Accroche</th>
                    <th className="px-3 py-2 font-semibold">Catégorie</th>
                    <th className="px-3 py-2 font-semibold">Statut</th>
                    <th className="px-3 py-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && rows.length === 0 && (
                    <tr>
                      <td
                        className="px-3 py-6 text-center text-stone-600"
                        colSpan={5}
                      >
                        Aucun article à afficher.
                      </td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td
                        className="px-3 py-6 text-center text-stone-600"
                        colSpan={5}
                      >
                        Chargement…
                      </td>
                    </tr>
                  )}
                  {rows.map((it) => (
                    <BlogRow
                      key={it._id}
                      item={it}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onSave={handleSave}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-3 py-3 border-t border-stone-200">
              <div className="text-xs text-stone-600">
                Page {page} / {totalPages} — {total} élément
                {total > 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`px-3 py-1.5 rounded-lg text-sm shadow ${
                    page <= 1
                      ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                      : "bg-stone-900 text-white hover:scale-[1.02]"
                  }`}
                >
                  Précédent
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={`px-3 py-1.5 rounded-lg text-sm shadow ${
                    page >= totalPages
                      ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                      : "bg-stone-900 text-white hover:scale-[1.02]"
                  }`}
                >
                  Suivant
                </button>
                <select
                  value={limit}
                  onChange={(e) => {
                    setPage(1);
                    setLimit(Number(e.target.value));
                  }}
                  className="bg-stone-200 text-stone-900 border border-stone-300 rounded-lg px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Composant principal Dashboard ----------------
export default function AdminDashboard() {
  // On garde ton routing d’onglets existant : "profil" | "news" | "blog" | "eshop"
  const [activeTab, setActiveTab] = useState("blog"); // on ouvre Blog par défaut
  const [pendingBlogCount, setPendingBlogCount] = useState(0); // badge "+N"

  // Compteur pending pour le badge
  useEffect(() => {
    (async () => {
      try {
        const d = await listAdminBlogs({
          status: "pending",
          page: 1,
          limit: 1,
        });
        setPendingBlogCount(Number(d?.total || 0));
      } catch {
        setPendingBlogCount(0);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f1e5]">
      {/* Header Admin : demandé = "Bonjour Admin" */}
      <div className="bg-[#ddd9c4] shadow-[0_5px_5px_rgba(0,0,0,0.65)] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-stone-800">Bonjour Admin</h1>
          <p className="text-stone-600 text-sm">
            Modérez le contenu soumis par la communauté.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Onglets (on ne touche pas à la logique des autres onglets) */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab("profil")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:scale-[1.02] transition-transform ${
              activeTab === "profil"
                ? "bg-stone-900 text-white"
                : "bg-stone-200 text-stone-900"
            }`}
          >
            Profil
          </button>

          <button
            onClick={() => setActiveTab("news")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:scale-[1.02] transition-transform ${
              activeTab === "news"
                ? "bg-stone-900 text-white"
                : "bg-stone-200 text-stone-900"
            }`}
          >
            Actualités
          </button>

          <button
            onClick={() => setActiveTab("blog")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:scale-[1.02] transition-transform ${
              activeTab === "blog"
                ? "bg-pink-600 text-white"
                : "bg-pink-100 text-pink-800"
            }`}
          >
            Blog
            {pendingBlogCount > 0 && (
              <span className="ml-1 bg-white text-pink-600 rounded-full px-2 py-0.5 text-xs font-bold shadow-inner">
                +{pendingBlogCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("eshop")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:scale-[1.02] transition-transform ${
              activeTab === "eshop"
                ? "bg-stone-900 text-white"
                : "bg-stone-200 text-stone-900"
            }`}
          >
            E-shop
          </button>
        </div>

        {/* Contenu onglets : on affiche BlogTabView seulement pour "blog".
            Pour les autres onglets, on NE REMPLACE PAS ton contenu existant.
            Ils restent tels que définis dans ton projet (routes/composants actuels). */}
        {activeTab === "blog" ? <BlogTabView /> : null}

        {activeTab !== "blog" && (
          <div className="bg-stone-50 border border-stone-200 rounded-2xl shadow p-8 text-stone-600">
            {/* ⚠️ Ici on n’impose plus de placeholder.
                Laisse tes composants existants (Profil / Actualités / E-shop)
                s’afficher via ton routing/page actuel. Si tu avais un rendu inline
                dans ce fichier, garde-le tel quel autour de ce composant. */}
            {/* Rien à changer : tes onglets autres que "blog" continuent comme avant. */}
          </div>
        )}
      </div>
    </div>
  );
}

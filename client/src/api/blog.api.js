// client/src/api/blog.api.js
// ============================================================================
// API Blog (Front) — Astuces & Murmures
// Objectif : helpers robustes SANS casser l’existant.
// - Endpoints pris en charge : /api/blog (singulier) et /api/blogs (alias).
// - Normalisation :
//     * LISTE  -> tableau = res.blogs || res.items || res.data || [].
//     * DÉTAIL -> objet   = res.blog  || res.item || res.
// - Filtre côté FRONT : n’affiche PAS les billets "pending"/"rejected".
//   (On garde toutefois les legacy/anciens approved pour ne pas vider la page.)
// - Respecte VITE_SERVER_URL (fallback localhost:5000).
// - Signatures conservées (BlogContext/Blog.jsx/BlogDetails.jsx).
// ============================================================================

// ----------------------------------------------------------------------------
// Base URL (depuis .env Vite). Si absent => fallback localhost:5000
// ----------------------------------------------------------------------------
const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_SERVER_URL) ||
  "http://localhost:5000"; // ⚠️ dev fallback

// Deux endpoints possibles pour compat
const BLOG_URL = `${API_BASE}/api/blog`;
const BLOGS_URL = `${API_BASE}/api/blogs`; // alias serveur

// ----------------------------------------------------------------------------
// Utils génériques : parse JSON en douceur (évite crash si body vide)
// ----------------------------------------------------------------------------
async function parseJsonSafe(res) {
  // On lit d’abord le body brut (texte) pour éviter un crash si ce n’est pas du JSON.
  const txt = await res.text().catch(() => "");
  try {
    return txt ? JSON.parse(txt) : null; // Si vide => null
  } catch {
    return null; // Si invalide => null
  }
}

// Normalise la réponse LISTE en tableau
function pickListPayload(payload) {
  // Certains back renvoient directement un tableau : on le retourne tel quel.
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  // Compat : blogs || items || data([]) || []
  return (
    payload.blogs ||
    payload.items ||
    payload.data ||
    (Array.isArray(payload.data) ? payload.data : []) ||
    []
  );
}

// Normalise la réponse DÉTAIL en objet
function pickItemPayload(payload) {
  if (!payload || typeof payload !== "object") return null;
  return payload.blog || payload.item || payload;
}

// Filtre FRONT : exclut "pending" et "rejected" pour la page publique.
// ⚠️ On garde les "legacy:true" ET les "approved" (status) ET "isValidated:true".
function filterPublicBlogs(arr) {
  return (Array.isArray(arr) ? arr : []).filter((b) => {
    const isApproved = b?.status === "approved" || b?.isValidated === true;
    const isLegacy =
      b?.legacy === true ||
      (typeof b?.isValidated === "undefined" &&
        typeof b?.status === "undefined");
    const isRejected = b?.status === "rejected" || b?.isValidated === false;
    const isPending = b?.status === "pending";
    // Public : approuvés ✅ OU legacy ✅ ; jamais pending ❌ ni rejected ❌
    return (isApproved || isLegacy) && !isPending && !isRejected;
  });
}

// ----------------------------------------------------------------------------
// 1) LISTER les blogs (public) -> Array
//    getBlogsFromApi({ search, page, limit, sort }?) -> tableau filtré (pas de pending)
// ----------------------------------------------------------------------------
export async function getBlogsFromApi(params = {}) {
  // On récupère les params éventuels du front (search/tri/pagination)
  const { search = "", page = 1, limit = 10, sort = "createdAt:desc" } = params;

  // On construit la querystring une seule fois
  const qs = new URLSearchParams({
    search,
    page: String(page),
    limit: String(limit),
    sort,
  });

  // 1er essai : /api/blog (endpoint principal)
  try {
    const res = await fetch(`${BLOG_URL}?${qs.toString()}`, {
      method: "GET",
      credentials: "include", // cookies si besoin (pas critique ici)
      headers: { Accept: "application/json" }, // on veut du JSON
    });
    if (res.ok) {
      const data = await parseJsonSafe(res);
      // On normalise en tableau + on filtre les pending/rejected côté front.
      return filterPublicBlogs(pickListPayload(data));
    }
  } catch {
    // silence : on tentera l’alias juste après
  }

  // 2e essai : /api/blogs (alias rétro-compat)
  try {
    const res2 = await fetch(`${BLOGS_URL}?${qs.toString()}`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (res2.ok) {
      const data2 = await parseJsonSafe(res2);
      return filterPublicBlogs(pickListPayload(data2));
    }
  } catch {}

  // En dernier recours : tableau vide (n’affiche rien, mais ne casse pas)
  return [];
}

// ----------------------------------------------------------------------------
// 2) DÉTAIL d’un blog : getBlogById(id) -> objet ou null
// ----------------------------------------------------------------------------
export async function getBlogById(id) {
  if (!id) return null;

  // on tente d’abord /api/blog/:id
  try {
    const res = await fetch(`${BLOG_URL}/${encodeURIComponent(id)}`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = await parseJsonSafe(res);
      return pickItemPayload(data);
    }
  } catch {}

  // puis alias /api/blogs/:id
  try {
    const res2 = await fetch(`${BLOGS_URL}/${encodeURIComponent(id)}`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (res2.ok) {
      const data2 = await parseJsonSafe(res2);
      return pickItemPayload(data2);
    }
  } catch {}

  return null;
}

// ----------------------------------------------------------------------------
// 3) CRÉER un blog (pending) : createBlog(values) -> objet blog créé
// ----------------------------------------------------------------------------
export async function createBlog(values) {
  const payload = values || {};
  // on priorise /api/blog puis fallback /api/blogs
  const endpoints = [
    { url: BLOG_URL, method: "POST" },
    { url: BLOGS_URL, method: "POST" },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: ep.method,
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) {
        const msg =
          (data && (data.error || data.message)) || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      return pickItemPayload(data); // on renvoie l’objet blog
    } catch (e) {
      // on tente l’endpoint suivant
    }
  }

  throw new Error("Impossible de créer le blog");
}

// ----------------------------------------------------------------------------
// 4) NOTER un blog : rateBlog(blogId, value) -> { value }
// ----------------------------------------------------------------------------
export async function rateBlog(blogId, value) {
  if (!blogId) throw new Error("blogId requis");
  const body = { value: Number(value) };

  const endpoints = [
    `${BLOG_URL}/${encodeURIComponent(blogId)}/rate`,
    `${BLOGS_URL}/${encodeURIComponent(blogId)}/rate`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "PATCH",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) {
        const msg =
          (data && (data.error || data.message)) || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      // Le back renvoie le blog, mais le contexte attend juste { value }.
      return { value: Number(value) };
    } catch (e) {}
  }

  throw new Error("Impossible d’enregistrer la note");
}

// ----------------------------------------------------------------------------
// 5) SUPPRIMER sa note : deleteRateBlog(blogId) -> { success:true }
// ----------------------------------------------------------------------------
export async function deleteRateBlog(blogId) {
  if (!blogId) throw new Error("blogId requis");

  const endpoints = [
    `${BLOG_URL}/${encodeURIComponent(blogId)}/rate`,
    `${BLOGS_URL}/${encodeURIComponent(blogId)}/rate`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // certains serveurs exigent un body JSON (safe)
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) {
        const msg =
          (data && (data.error || data.message)) || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      return { success: true };
    } catch (e) {}
  }

  throw new Error("Impossible de supprimer la note");
}

// ----------------------------------------------------------------------------
// 6) AJOUTER un commentaire : addComment(content, blogId) -> objet commentaire
// ----------------------------------------------------------------------------
export async function addComment(content, blogId) {
  if (!blogId) throw new Error("blogId requis");
  const body = { content }; // backend accepte { text } OU { content }

  const endpoints = [
    `${BLOG_URL}/${encodeURIComponent(blogId)}/comments`,
    `${BLOGS_URL}/${encodeURIComponent(blogId)}/comments`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) {
        const msg =
          (data && (data.error || data.message)) || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      // Le back renvoie le blog complet; on renvoie le dernier commentaire si dispo.
      const blog = pickItemPayload(data);
      if (blog && Array.isArray(blog.comments) && blog.comments.length > 0) {
        return blog.comments[0]; // unshift côté back => dernier ajouté en tête
      }
      return { content, createdAt: new Date().toISOString() };
    } catch (e) {}
  }

  throw new Error("Impossible d’ajouter le commentaire");
}

// ----------------------------------------------------------------------------
// 7) SUPPRIMER un commentaire : deleteComment(blogId, commentId) -> { success:true }
// ----------------------------------------------------------------------------
export async function deleteComment(blogId, commentId) {
  if (!blogId || !commentId) throw new Error("blogId et commentId requis");

  const endpoints = [
    `${BLOG_URL}/${encodeURIComponent(blogId)}/comments/${encodeURIComponent(
      commentId
    )}`,
    `${BLOGS_URL}/${encodeURIComponent(blogId)}/comments/${encodeURIComponent(
      commentId
    )}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) {
        const msg =
          (data && (data.error || data.message)) || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      return { success: true };
    } catch (e) {}
  }

  throw new Error("Impossible de supprimer le commentaire");
}

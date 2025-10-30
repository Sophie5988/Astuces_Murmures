// src/lib/apiClient.js
// ======================================================================
// Client API unique pour Astuces & Murmures
// - Utilise VITE_API_URL (Netlify/Prod); fallback localhost uniquement en DEV
// - Normalise les "/" pour éviter les "//"
// - Évite JSON.parse sur une réponse non-JSON (corrige l'erreur vue en console)
// - Fournit des helpers pour les endpoints déjà utilisés
// ======================================================================

const fromEnv = import.meta?.env?.VITE_API_URL || "";
const fallbackDev = "http://localhost:5000"; // seulement en DEV

// En prod, on n'utilise PAS localhost.
// En dev (Vite), on permet le fallback local.
const RAW_BASE =
  (fromEnv && fromEnv.trim()) || (import.meta.env.DEV ? fallbackDev : "");

// Normalise les slashes
const stripTrailing = (s) => (s || "").replace(/\/+$/, "");
const stripLeading = (s) => (s || "").replace(/^\/+/, "");

// Base finale (peut être vide si prod mal configurée)
export const API_BASE_URL = stripTrailing(RAW_BASE);

function joinUrl(base, path) {
  const clean = stripLeading(path);
  return base ? `${base}/${clean}` : `/${clean}`;
}

// Construit une URL d'API propre
export function apiUrl(path = "") {
  return joinUrl(API_BASE_URL, path);
}

// Wrapper fetch JSON sûr (gère erreurs + non-JSON)
export async function fetchJSON(path, options = {}) {
  const url = apiUrl(path);
  const res = await fetch(url, {
    // Dé-commente si tu utilises des cookies côté API :
    // credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const ct = (res.headers.get("content-type") || "").toLowerCase();
  const isJson = ct.includes("application/json");

  if (!res.ok) {
    const body = isJson ? await res.json().catch(() => ({})) : await res.text();
    const msg =
      typeof body === "string"
        ? body.slice(0, 500)
        : JSON.stringify(body).slice(0, 500);
    const err = new Error(`[API] ${res.status} ${res.statusText} - ${msg}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  // Si ce n'est pas du JSON (erreurs proxy, HTML, etc.), on renvoie le texte brut
  return isJson ? res.json() : res.text();
}

// ======================================================================
// Helpers pour tes endpoints actuels (d'après tes logs)
// ======================================================================

export const Api = {
  currentUser: () => fetchJSON("/user/current"),
  actualites: (
    q = { page: 1, limit: 50, sortBy: "createdAt", order: "desc" }
  ) =>
    fetchJSON(
      `/actualites?page=${q.page}&limit=${q.limit}&sortBy=${encodeURIComponent(
        q.sortBy
      )}&order=${encodeURIComponent(q.order)}`
    ),
  blogList: (q = { search: "", page: 1, limit: 10, sort: "createdAt:desc" }) =>
    fetchJSON(
      `/api/blog?search=${encodeURIComponent(q.search)}&page=${q.page}&limit=${
        q.limit
      }&sort=${encodeURIComponent(q.sort)}`
    ),
  blogsAlias: (
    q = { search: "", page: 1, limit: 10, sort: "createdAt:desc" }
  ) =>
    fetchJSON(
      `/api/blogs?search=${encodeURIComponent(q.search)}&page=${q.page}&limit=${
        q.limit
      }&sort=${encodeURIComponent(q.sort)}`
    ),
};

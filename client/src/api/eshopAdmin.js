// client/src/api/eshopAdmin.js
// ============================================================================
// API Admin E-shop (Front) — Astuces & Murmures
// Objectif : exploiter TES routes existantes /api/eshop/products (CRUD + pagination/tri)
// - listProducts({ search, page, limit, sort }) : liste paginée (+ total)
// - updateProduct(id, patch) : mise à jour d’un produit
// - deleteProduct(id) : suppression d’un produit
// Notes :
//   • Base URL vient de VITE_SERVER_URL (fallback http://localhost:5000)
//   • On gère proprement parse JSON + erreurs pour ne PAS casser le front
//   • credentials: "include" pour rester homogène avec le reste du code
// ============================================================================

// ---------------- Base URL depuis .env (Vite) ----------------
const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_SERVER_URL) ||
  "http://localhost:5000"; // fallback sûr

// Endpoint produits e-shop (déjà en place côté back)
const PRODUCTS_URL = `${API_BASE}/api/eshop/products`;

// ---------------- Utilitaires communs ----------------
async function parseJsonSafe(res) {
  // -> lit le body texte, tente JSON, sinon null
  const txt = await res.text().catch(() => "");
  try {
    return txt ? JSON.parse(txt) : null;
  } catch {
    return null;
  }
}

function pickListPayload(payload) {
  // -> normalise une réponse "liste paginée"
  // On s'aligne sur les formats habituels : { items, total } ou { data, total } ...
  if (!payload || typeof payload !== "object") {
    return { items: [], total: 0 };
  }
  const items =
    payload.items ||
    payload.data ||
    (Array.isArray(payload) ? payload : []) ||
    [];
  const total =
    typeof payload.total === "number"
      ? payload.total
      : Array.isArray(items)
      ? items.length
      : 0;
  return { items, total };
}

function ensureOk(res, data) {
  // -> jette une erreur avec message lisible si !res.ok
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
}

// ---------------- 1) LISTER les produits ----------------
export async function listProducts(params = {}) {
  // • search : string
  // • page   : number (1-based)
  // • limit  : number
  // • sort   : string ex "createdAt:desc" ou "price:asc"
  const { search = "", page = 1, limit = 12, sort = "createdAt:desc" } = params;

  const qs = new URLSearchParams({
    search,
    page: String(page),
    limit: String(limit),
    sort,
  });

  const res = await fetch(`${PRODUCTS_URL}?${qs.toString()}`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const data = await parseJsonSafe(res);
  ensureOk(res, data);
  return pickListPayload(data);
}

// ---------------- 2) METTRE À JOUR un produit ----------------
export async function updateProduct(id, patch) {
  // • id    : string (product._id)
  // • patch : objet partiel { title, description, price, stock, image, ... }
  const res = await fetch(`${PRODUCTS_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch || {}),
  });
  const data = await parseJsonSafe(res);
  ensureOk(res, data);
  return data;
}

// ---------------- 3) SUPPRIMER un produit ----------------
export async function deleteProduct(id) {
  // • id : string (product._id)
  const res = await fetch(`${PRODUCTS_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const data = await parseJsonSafe(res);
  ensureOk(res, data);
  return { success: true };
}

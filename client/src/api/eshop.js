// src/api/eshop.js
// ============================================================================
// API E-shop (Front) — CRUD produits
// Base URL FIABLE : si front 5173 => back 5000
// ============================================================================

const API_BASE = (() => {
  const env = (import.meta.env?.VITE_SERVER_URL || "").replace(/\/+$/, "");
  if (env) return env;
  if (window.location.port === "5173") return "http://localhost:5000";
  return `${window.location.origin}/api`;
})();

function join(base, path) {
  return `${base.replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;
}
function qs(params = {}) {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    s.set(k, String(v));
  });
  const str = s.toString();
  return str ? `?${str}` : "";
}

export async function listProducts(opts = {}) {
  const url = join(API_BASE, "/api/eshop/products" + qs(opts));
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(body?.message || "Impossible de charger les produits");
  return body;
}

export async function createProduct(payload) {
  const url = join(API_BASE, "/api/eshop/products");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(body?.message || "Impossible de créer le produit");
  return body;
}

export async function updateProduct(id, patch) {
  const url = join(API_BASE, `/api/eshop/products/${id}`);
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.message || "Impossible de mettre à jour");
  return body;
}

export async function deleteProduct(id) {
  const url = join(API_BASE, `/api/eshop/products/${id}`);
  const res = await fetch(url, { method: "DELETE" });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.message || "Impossible de supprimer");
  return body;
}

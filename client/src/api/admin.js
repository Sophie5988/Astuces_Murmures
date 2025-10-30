// src/api/admin.js
// ============================================================================
// API Admin (Front) — login + gestion du token
// Base URL FIABLE : si on est en 5173, on pointe 5000 par défaut.
// ============================================================================

const API_BASE = (() => {
  const env = (import.meta.env?.VITE_SERVER_URL || "").replace(/\/+$/, "");
  if (env) return env; // ex: http://localhost:5000
  // fallback béton en dev : front 5173 -> back 5000
  if (window.location.port === "5173") return "http://localhost:5000";
  // fallback générique
  return `${window.location.origin}/api`;
})();

const LS_KEY = "am_admin_token";

export function getAdminToken() {
  try {
    return localStorage.getItem(LS_KEY) || "";
  } catch {
    return "";
  }
}
export function setAdminToken(t) {
  try {
    if (t) localStorage.setItem(LS_KEY, t);
  } catch {}
}
export function clearAdminToken() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {}
}
export function getAuthHeader() {
  const t = getAdminToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function loginAdmin({ username, password }) {
  const url = `${API_BASE}/api/admin/login`; // ✅ /api/admin/login sur 5000
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.message || "Échec de connexion admin");
  if (body?.token) setAdminToken(body.token);
  return body;
}

// client/src/api/adminAuth.js
// ============================================================================
// API Auth Admin (Front) — Astuces & Murmures
// Corrige les appels relatifs (double "/api") en utilisant la base URL serveur.
// Endpoints backend attendus (déjà montés) :
//   POST   /api/admin/auth/login   -> démarre la session admin (pose cookie/session)
//   POST   /api/admin/auth/logout  -> détruit la session admin
// ============================================================================

const BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_SERVER_URL) ||
  "http://localhost:5000"; // fallback dev

const LOGIN_URL = `${BASE}/api/admin/auth/login`;
const LOGOUT_URL = `${BASE}/api/admin/auth/logout`;

// Parse JSON "safe"
async function safeJson(res) {
  const text = await res.text().catch(() => "");
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

// Renvoie { ok:true } si tout va bien, sinon lève une Error lisible.
export async function loginAdmin({ username, password }) {
  const res = await fetch(LOGIN_URL, {
    method: "POST",
    credentials: "include", // IMPORTANT : pour que le cookie de session admin soit posé
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }), // ton backend lit username/password
  });

  const data = await safeJson(res);
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data || { ok: true };
}

export async function logoutAdmin() {
  const res = await fetch(LOGOUT_URL, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const data = await safeJson(res);
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data || { ok: true };
}

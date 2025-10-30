// client/src/api/adminBlog.js
// ============================================================================
// API Admin Blog (Front) — Astuces & Murmures
// - Envoie TOUJOURS credentials: "include" (si un jour tu repasses au cookie)
// - Ajoute le header Authorization SI VITE_ADMIN_BASIC_B64 est défini
//   → contourne le rejet du cookie en dev (5173 -> 5000).
// ============================================================================

const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_SERVER_URL) ||
  "http://localhost:5000";

// Endpoints Admin
const ADMIN_BLOG_URL = `${API_BASE}/api/admin/blog`;

// ⚠️ DOIT commencer par "Basic " (ex: "Basic QWRtaW41OTg4OkNMU29waGllNTk4OCo=")
const BASIC_FROM_ENV =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_ADMIN_BASIC_B64) ||
  "";

// Headers communs (on ajoute Authorization si env présent)
function makeHeaders(json = true) {
  const h = { Accept: "application/json" };
  if (json) h["Content-Type"] = "application/json";
  if (BASIC_FROM_ENV) h["Authorization"] = BASIC_FROM_ENV;
  return h;
}

async function parseJsonSafe(res) {
  const txt = await res.text().catch(() => "");
  try {
    return txt ? JSON.parse(txt) : null;
  } catch {
    return null;
  }
}

async function ensureOk(res) {
  if (res.ok) return;
  const data = await parseJsonSafe(res);
  const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
  throw new Error(msg);
}

// ---------------------------------------------------------------------------
// LISTE
export async function listAdminBlogs({
  status = "pending",
  page = 1,
  limit = 10,
  search = "",
  sort = "createdAt:desc",
} = {}) {
  const qs = new URLSearchParams({
    status,
    page: String(page),
    limit: String(limit),
    search,
    sort,
  });
  const res = await fetch(`${ADMIN_BLOG_URL}?${qs.toString()}`, {
    method: "GET",
    credentials: "include",
    headers: makeHeaders(false), // Authorization ajouté si présent
  });
  await ensureOk(res);
  return (await parseJsonSafe(res)) || { ok: true, success: true, items: [] };
}

// ---------------------------------------------------------------------------
// VALIDER
export async function approveAdminBlog(id) {
  const res = await fetch(
    `${ADMIN_BLOG_URL}/${encodeURIComponent(id)}/validate`,
    {
      method: "PATCH",
      credentials: "include",
      headers: makeHeaders(true),
      body: JSON.stringify({ isValidated: true }),
    }
  );
  await ensureOk(res);
  return (await parseJsonSafe(res)) || { ok: true, success: true };
}

// ---------------------------------------------------------------------------
// REFUSER
export async function rejectAdminBlog(id, motif = "") {
  const res = await fetch(
    `${ADMIN_BLOG_URL}/${encodeURIComponent(id)}/validate`,
    {
      method: "PATCH",
      credentials: "include",
      headers: makeHeaders(true),
      body: JSON.stringify({
        isValidated: false,
        motif: String(motif || "").slice(0, 200),
      }),
    }
  );
  await ensureOk(res);
  return (await parseJsonSafe(res)) || { ok: true, success: true };
}

// ---------------------------------------------------------------------------
// ÉDITER
export async function updateAdminBlog(id, patch = {}) {
  const clean = { ...patch };
  Object.keys(clean).forEach((k) => clean[k] === undefined && delete clean[k]);
  const res = await fetch(`${ADMIN_BLOG_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    credentials: "include",
    headers: makeHeaders(true),
    body: JSON.stringify(clean),
  });
  await ensureOk(res);
  return (await parseJsonSafe(res)) || { ok: true, success: true };
}

// ---------------------------------------------------------------------------
// SUPPRIMER
export async function deleteAdminBlog(id) {
  const res = await fetch(`${ADMIN_BLOG_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
    headers: makeHeaders(false),
  });
  await ensureOk(res);
  return (
    (await parseJsonSafe(res)) || { ok: true, success: true, deleted: true, id }
  );
}

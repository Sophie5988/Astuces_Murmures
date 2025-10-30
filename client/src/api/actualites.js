// ============================================================================
// src/api/actualites.js
// ---------------------------------------------------------------------------
// ✅ Base URL robuste (VITE_SERVER_URL ou /api)
// ✅ fetchJSON (tolérant) ET fetchJSONStrict (surface les erreurs 4xx/5xx)
// ✅ Toutes les requêtes critiques envoient les cookies
// ✅ CHANGEMENT : publishActualite() NE force plus la validation
//    → toute nouvelle Actualité part en "pending" (modération Admin)
// ============================================================================

function getApiBase() {
  // 1) On lit l’éventuelle URL serveur du .env sinon on tombe sur /api/
  const raw = import.meta.env?.VITE_SERVER_URL || "/api/";
  // 2) Origin (http://localhost:5173 en dev)
  const origin = window.location.origin;

  try {
    // 3) Si raw est déjà une URL absolue → on normalise en retirant les / de fin
    if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, "");
    // 4) Si raw commence par / → on préfixe par l’origin
    if (raw.startsWith("/")) return `${origin}${raw}`.replace(/\/+$/, "");
    // 5) Sinon, par défaut on cible /api à la racine de l’origin
    return `${origin}/api`;
  } catch {
    // 6) Filet de sécurité
    return `${origin}/api`;
  }
}

const API_BASE = getApiBase();

function joinUrl(base, path) {
  // 7) Concatène base + path en évitant les / en double
  return `${base.replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;
}

function qs(params = {}) {
  // 8) Construit une query string en ignorant undefined/null/""
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    s.set(k, String(v));
  });
  const str = s.toString();
  return str ? `?${str}` : "";
}

/**
 * fetchJSON — “souple”
 * - 2xx -> JSON
 * - 404 -> [] si expect list, {} sinon
 * - autres -> { ok:false, status, message }
 */
async function fetchJSON(url, options = {}, { expect = "list" } = {}) {
  try {
    const res = await fetch(url, {
      credentials: "include", // 9) Cookies/session
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    if (res.ok) {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) return await res.json();
      // 10) Par défaut si pas de JSON on renvoie une forme neutre
      return expect === "list" ? [] : {};
    }

    if (res.status === 404) return expect === "list" ? [] : {};

    const txt = await res.text().catch(() => "");
    console.warn(`HTTP ${res.status} on ${url}`, txt);
    return { ok: false, status: res.status, message: txt || "Erreur requête" };
  } catch (err) {
    console.warn("fetchJSON network error:", err);
    return expect === "list" ? [] : {};
  }
}

/**
 * fetchJSONStrict — “strict”
 * - 2xx -> JSON
 * - autres -> { ok:false, status, message }
 * (utile pour voir clairement les 401/400 côté publish)
 */
async function fetchJSONStrict(url, options = {}) {
  try {
    const res = await fetch(url, {
      credentials: "include", // 11) Cookies/session
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const ct = res.headers.get("content-type") || "";
    const body = ct.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => "");

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message:
          (body && (body.message || body.error)) ||
          (typeof body === "string" ? body : "Erreur"),
      };
    }
    return body ?? {};
  } catch (err) {
    return { ok: false, status: 0, message: err?.message || "Network error" };
  }
}

// ---------------------------------------------------------------------------
// PUBLIC API
// ---------------------------------------------------------------------------

export async function fetchActualites({
  page = 1,
  limit = 50,
  sortBy = "createdAt",
  order = "desc",
  status = "validated", // validated|pending
  type,
  departement,
} = {}) {
  // 12) Notre backend filtre sur isValidated (booléen)
  let isValidated;
  if (status === "validated") isValidated = true;
  else if (status === "pending") isValidated = false;

  const url = joinUrl(
    API_BASE,
    "/actualites" +
      qs({ page, limit, sortBy, order, isValidated, type, departement })
  );

  // 13) Tolérant (retourne [] en cas de 404)
  return fetchJSON(url, { method: "GET" }, { expect: "list" });
}

/** Admin: approve */
export async function approveActualite(id) {
  const url = joinUrl(API_BASE, `/actualites/${id}/validate`);
  return fetchJSON(
    url,
    { method: "PATCH", body: JSON.stringify({ isValidated: true }) },
    { expect: "object" }
  );
}

/** Admin: reject */
export async function rejectActualite(id) {
  const url = joinUrl(API_BASE, `/actualites/${id}/validate`);
  return fetchJSON(
    url,
    { method: "PATCH", body: JSON.stringify({ isValidated: false }) },
    { expect: "object" }
  );
}

/** Admin: update */
export async function updateActualite(id, payload) {
  const url = joinUrl(API_BASE, `/actualites/${id}`);
  return fetchJSON(
    url,
    { method: "PUT", body: JSON.stringify(payload) },
    { expect: "object" }
  );
}

/** Publication (création) — part en "pending" (modération Admin)
 *  CHANGEMENT ICI :
 *  - on NE force PLUS isValidated=true
 *  - si le backend gère un champ "status", on peut poser status:"pending"
 */
export async function publishActualite(payload) {
  const url = joinUrl(API_BASE, `/actualites`);

  // 👉 Clonage + statut "pending" (laisser l’Admin valider/refuser)
  const body = {
    ...payload,
    isValidated: false, // <= clé: nouvelle actualité NON publiée par défaut
    // status: "pending", // (optionnel si ton backend l’accepte)
  };

  // ⚠️ STRICT pour voir clairement les 4xx/5xx
  return fetchJSONStrict(url, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Stub “move assets” si plus tard tu bouges les images */
export async function moveDraftAssets(assetPaths = []) {
  return { ok: true, moved: assetPaths };
}

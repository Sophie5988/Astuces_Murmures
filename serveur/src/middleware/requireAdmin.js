// serveur/src/middleware/requireAdmin.js
// ======================================================================
// Middleware admin tolérant pour Astuces & Murmures
// Autorise l'accès si AU MOINS un des indices d'auth est présent :
//
// 1) Session server-side :
//    - req.session.isAdmin === true
//    - req.session.admin === true
//    - req.session.user?.role === 'admin'
//    - req.admin?.isAdmin === true (si posé ailleurs)
//
// 2) Cookies indicateurs (projets existants) :
//    - admin_logged=1  |  isAdmin=true  |  admin=true
//    - admin_token (JWT ou simple présence)
//
// 3) Basic Auth (Thunder / secours front) :
//    Authorization: Basic base64(ADMIN_USER:ADMIN_PASS)
//
// 4) Bearer statique (optionnel) :
//    Authorization: Bearer <ADMIN_STATIC_TOKEN>
//
// 5) Bearer JWT (si présent et secret dispo) :
//    Authorization: Bearer <jwt>  (vérifié avec ADMIN_JWT_SECRET ou JWT_SECRET)
//
// Rien n'oblige un JWT. On s'adapte à ton login existant.
// ======================================================================

import dotenv from "dotenv";
dotenv.config();

const ADMIN_USER = process.env.ADMIN_USER || "";
const ADMIN_PASS = process.env.ADMIN_PASS || "";
const ADMIN_STATIC_TOKEN = process.env.ADMIN_STATIC_TOKEN || "";
const ADMIN_JWT_SECRET =
  process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || "";

// jsonwebtoken facultatif : on essaie si dispo
let jwt = null;
try {
  const m = await import("jsonwebtoken");
  jwt = m?.default || m;
} catch {
  /* pas installé = ok */
}

function unauthorized(res, msg = "Token manquant") {
  return res.status(401).json({ ok: false, success: false, error: msg });
}

function parseBasicAuth(headerValue) {
  try {
    const b64 = headerValue.split(" ")[1] || "";
    const raw = Buffer.from(b64, "base64").toString("utf8");
    const idx = raw.indexOf(":");
    if (idx === -1) return { user: "", pass: "" };
    return { user: raw.slice(0, idx), pass: raw.slice(idx + 1) };
  } catch {
    return { user: "", pass: "" };
  }
}

export default function requireAdmin(req, res, next) {
  // Préflight
  if (req.method === "OPTIONS") return next();

  // 1) Indices de session
  const s = req.session || {};
  if (
    s.isAdmin === true ||
    s.admin === true ||
    (s.user && s.user.role === "admin") ||
    (req.admin && req.admin.isAdmin === true)
  ) {
    req.admin = { ...(req.admin || {}), method: "session" };
    return next();
  }

  // 2) Indices cookies
  const c = req.cookies || {};
  if (
    c.admin_logged === "1" ||
    c.isAdmin === "true" ||
    c.admin === "true" ||
    c.admin_token
  ) {
    req.admin = { ...(req.admin || {}), method: "cookie" };
    return next();
  }

  // 3) Basic Auth
  const authHeader =
    req.headers.authorization || req.headers.Authorization || "";
  if (authHeader.startsWith("Basic ")) {
    const { user, pass } = parseBasicAuth(authHeader);
    if (
      user === ADMIN_USER &&
      pass === ADMIN_PASS &&
      ADMIN_USER &&
      ADMIN_PASS
    ) {
      req.admin = { ...(req.admin || {}), method: "basic", user };
      return next();
    }
    return unauthorized(res, "Identifiants Basic invalides");
  }

  // 4) Bearer statique
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();

    if (ADMIN_STATIC_TOKEN && token === ADMIN_STATIC_TOKEN) {
      req.admin = { ...(req.admin || {}), method: "static" };
      return next();
    }

    // 5) Bearer JWT (si jsonwebtoken + secret dispo)
    if (jwt && ADMIN_JWT_SECRET) {
      try {
        const payload = jwt.verify(token, ADMIN_JWT_SECRET);
        // on accepte tout JWT valide ici; renforce si besoin (payload.role === 'admin')
        req.admin = { ...(req.admin || {}), method: "jwt", payload };
        return next();
      } catch {
        return unauthorized(res, "Token invalide");
      }
    }

    return unauthorized(res, "Token invalide");
  }

  // Rien de détecté
  return unauthorized(res, "Token manquant");
}

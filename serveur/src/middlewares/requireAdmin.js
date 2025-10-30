// serveur/src/middleware/requireAdmin.js
// ===================================================================
// Middleware ESM pour protéger les routes ADMIN avec JWT.
// - Vérifie l'en-tête "Authorization: Bearer <token>"
// - Décode le token avec JWT_SECRET
// - Vérifie role === "admin"
// - Expose req.adminId pour les contrôleurs suivants
// ===================================================================

import jwt from "jsonwebtoken"; // Librairie JWT

export default function requireAdmin(req, res, next) {
  try {
    // Récupère l'en-tête Authorization (ex: "Bearer eyJhbGciOi...")
    const authHeader = req.headers.authorization || "";
    // Sépare le schéma et la valeur
    const [scheme, token] = authHeader.split(" ");

    // Vérifie la présence et le format
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Token manquant ou invalide." });
    }

    // Vérifie la signature et décode le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifie le rôle et la présence d'un subject (id)
    if (decoded.role !== "admin" || !decoded.sub) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    // Injecte l'ID admin pour les handlers en aval
    req.adminId = decoded.sub;

    // Passe au middleware/contrôleur suivant
    next();
  } catch (err) {
    // Token expiré / altéré / secret invalide -> 401
    console.error("JWT error:", err);
    return res.status(401).json({ message: "Session expirée ou invalide." });
  }
}

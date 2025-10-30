// serveur/src/controllers/adminAuthController.js
// ===================================================================
// Contrôleur d'authentification ADMIN (ESM) — sécurisé par variables d'env.
// Endpoints :
//   - POST /api/admin/login  -> { token, admin }
//   - GET  /api/admin/me     -> { admin } (JWT requis)
// -------------------------------------------------------------------
// ⚙️ Identifiants côté serveur (ne JAMAIS mettre dans le front) :
//    - ADMIN_USER=Admin5988
//    - ADMIN_PASS=CLSophie5988*
// 📌 JWT : utiliser JWT_SECRET et JWT_EXPIRES_IN (ex: 7d)
// ===================================================================

import jwt from "jsonwebtoken"; // Gestion des JWT

// -------------------------------------------------------------------
// Helper : génère un JWT signé pour l'admin (Rôle "admin")
// -------------------------------------------------------------------
function signAdminToken() {
  const secret = process.env.JWT_SECRET; // clé secrète (serveur)
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d"; // durée
  const payload = { role: "admin" }; // rôle
  // sub = identifiant technique ; pas de DB ici -> valeur fixe
  return jwt.sign(payload, secret, { expiresIn, subject: "static-admin" });
}

// -------------------------------------------------------------------
// POST /api/admin/login
// Body attendu : { username, password }
// Retour : { token, admin: { username } }
// -------------------------------------------------------------------
export const login = async (req, res) => {
  try {
    // 1) Lire identifiants envoyés par le front
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "Identifiants requis." });
    }

    // 2) Lire identifiants "vrais" depuis l'environnement (serveur)
    const ADMIN_USER = process.env.ADMIN_USER;
    const ADMIN_PASS = process.env.ADMIN_PASS;

    // 3) Sécurités : s'assurer qu'ils existent côté serveur
    if (!ADMIN_USER || !ADMIN_PASS) {
      // On n'expose pas de détails, juste un 500 générique
      return res
        .status(500)
        .json({ message: "Configuration admin manquante côté serveur." });
    }

    // 4) Comparaison
    const ok =
      String(username).trim() === String(ADMIN_USER) &&
      String(password) === String(ADMIN_PASS);

    if (!ok) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    // 5) Générer le token
    const token = signAdminToken();

    // 6) Réponse OK (ne jamais renvoyer le mot de passe)
    return res.json({
      token,
      admin: { username: ADMIN_USER },
    });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// -------------------------------------------------------------------
// GET /api/admin/me (protégé par requireAdmin)
// Retour : { admin: { username } }
// -------------------------------------------------------------------
export const me = async (_req, res) => {
  const ADMIN_USER = process.env.ADMIN_USER || "admin";
  return res.json({ admin: { username: ADMIN_USER } });
};

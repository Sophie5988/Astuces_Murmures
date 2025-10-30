// serveur/src/middlewares/actualiteAuthMiddleware.js
// ============================================================================
// Middleware de rôle pour l'ADMIN
// - s'appuie sur req.user injecté par votre protect (authMiddleware.js)
// - considère admin si: user.role === "admin"  OU  user.isAdmin === true
// ============================================================================

export const isAdmin = (req, res, next) => {
  try {
    const u = req.user;
    if (u && (u.role === "admin" || u.isAdmin === true)) return next();
    return res
      .status(403)
      .json({ message: "Accès réservé à l'administrateur." });
  } catch {
    return res.status(401).json({ message: "Non autorisé." });
  }
};

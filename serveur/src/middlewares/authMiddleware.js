// serveur/src/middlewares/authMiddleware.js
// ============================================================================
// Middleware d'auth (inchangé) : vérifie le token, hydrate req.user
// ============================================================================

import jwt from "jsonwebtoken";
import User from "../models/user.schema.js";

export const protect = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(400).json({ message: "Accès interdit. Aucun token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = await User.findById(decoded.sub).select("-password");
    next();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Accès interdit. Token invalide" });
  }
};

// Alias pour compatibilité
export const authenticateToken = protect;

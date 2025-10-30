// serveur/src/routes/user.route.js
import express from "express";
import {
  register,
  login,
  currentUser,
  logoutUser,
  verifyMail,
  updateProfile,
  googleAuth,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Inscription + email de confirmation
router.post("/", register);

// Connexion
router.post("/login", login);

// Auth Google
router.post("/auth-google", googleAuth);

// Utilisateur courant
router.get("/current", currentUser);

// Déconnexion (suppression du cookie)
router.delete("/deleteToken", logoutUser);

// Vérification email (via lien reçu)
router.get("/verifyMail/:token", verifyMail);

// Mise à jour profil (avatar, mot de passe, etc.)
router.put("/profile", protect, updateProfile);

export default router;

// serveur/src/routes/actualite.route.js
import express from "express";
import {
  createActualite,
  getAllActualites,
  getActualiteById,
  updateActualite,
  deleteActualite,
  validateActualite,
  getActualitesStats,
  moveAssets, // <-- AJOUT
} from "../controllers/actualite.controller.js";
import { protect } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/actualiteAuthMiddleware.js";

const router = express.Router();

// Publiques (lecture)
router.get("/", getAllActualites);
router.get("/stats", getActualitesStats);
router.get("/:id", getActualiteById);

// Déplacement d’assets (appelé au moment de la publication depuis le front)
router.post("/move-assets", moveAssets);

// Protégées (auteur)
router.post("/", protect, createActualite);
router.put("/:id", protect, updateActualite);
router.delete("/:id", protect, deleteActualite);

// Admin (modération)
router.patch("/:id/validate", protect, isAdmin, validateActualite);

export default router;

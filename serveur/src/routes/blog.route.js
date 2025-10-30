// serveur/src/routes/blog.route.js
// ======================================================================
// Routes PUBLIC Blog (ESM)
// 🔧 Changement clé: on enlève tout middleware "protect" pour éviter
//     "Accès interdit. Aucun token" pendant tes tests Thunder.
//     (On remettra l'auth utilisateur plus tard si tu veux.)
// ======================================================================

import { Router } from "express";
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  rateBlog,
  deleteRateBlog,
  addComment,
  deleteComment,
} from "../controllers/blog.controller.js";

const router = Router();

// Liste paginée (validés + fallback si ?fallback=1)
router.get("/", getAllBlogs);

// Détails
router.get("/:id", getBlogById);

// Création (soumis à modération) — PUBLIQUE pour tests
router.post("/", createBlog);

// Rating — PUBLIQUE pour tests (si tu veux, on réactivera l'auth ensuite)
router.patch("/:id/rate", rateBlog);
router.delete("/:id/rate", deleteRateBlog);

// Commentaires — PUBLIQUE pour tests
router.post("/:id/comments", addComment);
router.delete("/:id/comments/:cid", deleteComment);

export default router;

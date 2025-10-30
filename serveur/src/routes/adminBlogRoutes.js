// serveur/src/routes/adminBlogRoutes.js
// ======================================================================
// Admin Blog Routes (ESM)
// - Protégées par requireAdmin (login admin existant)
// - Endpoints:
//   GET    /           -> liste (status/search/page/limit/sort)
//   PATCH  /:id/validate -> valider/refuser { isValidated, motif? }
//   PUT    /:id        -> édition contenu/métadonnées
//   DELETE /:id        -> suppression
// ======================================================================

import { Router } from "express";
import {
  listAdminBlogs,
  validateAdminBlog,
  updateAdminBlog,
  deleteAdminBlog,
} from "../controllers/adminBlogController.js";

// ⚠️ Middleware admin existant (tu me l’as confirmé)
// chemin: serveur/src/middleware/requireAdmin.js
import requireAdmin from "../middleware/requireAdmin.js";

const router = Router();

// Liste paginée par statut
router.get("/", requireAdmin, listAdminBlogs);

// Valider / Refuser
router.patch("/:id/validate", requireAdmin, validateAdminBlog);

// Éditer
router.put("/:id", requireAdmin, updateAdminBlog);

// Supprimer
router.delete("/:id", requireAdmin, deleteAdminBlog);

export default router;

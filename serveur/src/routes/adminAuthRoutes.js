// serveur/src/routes/adminAuthRoutes.js
// ===================================================================
// Routes ESM pour l'authentification ADMIN.
// Brancher dans ton serveur (ex dans src/index.js) :
//   import adminAuthRoutes from "./routes/adminAuthRoutes.js";
//   app.use("/api/admin", adminAuthRoutes);
// ===================================================================

import { Router } from "express"; // Routeur Express (ESM)
import { login, me } from "../controllers/adminAuthController.js"; // Contrôleurs
import requireAdmin from "../middleware/requireAdmin.js"; // ✅ chemin corrigé

// 1) Router dédié /api/admin
const router = Router();

// 2) Route publique : login
router.post("/login", login);

// 3) Route protégée : profil courant
router.get("/me", requireAdmin, me);

// 4) Export ESM
export default router;

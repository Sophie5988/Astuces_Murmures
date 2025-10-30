// serveur/src/routes/eshopRoutes.js
// ===================================================================
// Routes E-shop (Produits)
// - GET    /api/eshop/products                  -> listProducts
// - POST   /api/eshop/products                  -> createProduct (admin)
// - PUT    /api/eshop/products/:id              -> updateProduct (admin)
// - DELETE /api/eshop/products/:id              -> deleteProduct (admin)
// ===================================================================

import { Router } from "express";
import {
  listProducts, // <- doit exister dans le contrôleur
  createProduct, // <- idem
  updateProduct, // <- idem
  deleteProduct, // <- idem (c'était l’export manquant)
} from "../controllers/eshopController.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = Router();

// liste publique
router.get("/products", listProducts);

// création (admin)
router.post("/products", requireAdmin, createProduct);

// mise à jour (admin)
router.put("/products/:id", requireAdmin, updateProduct);

// suppression (admin)
router.delete("/products/:id", requireAdmin, deleteProduct);

export default router;

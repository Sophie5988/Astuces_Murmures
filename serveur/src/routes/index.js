// serveur/src/routes/index.js
import express from "express";

import userRoutes from "./user.route.js";
import blogRoutes from "./blog.route.js";
import ratingRoutes from "./rating.route.js";
import commentRoutes from "./comment.route.js";
import actualiteRoutes from "./actualite.route.js";

const router = express.Router();

// /blog -> liste, création, etc.
router.use("/blog", blogRoutes);

// /user -> auth, profil, etc.
router.use("/user", userRoutes);

// /rating -> notes
router.use("/rating", ratingRoutes);

// /comment -> commentaires
router.use("/comment", commentRoutes);

// /actualites -> flux d'actu
router.use("/actualites", actualiteRoutes);

export default router;

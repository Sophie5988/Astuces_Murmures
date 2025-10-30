// serveur/src/routes/debugRoutes.js
// ----------------------------------------------------------------------
// Petite route de debug pour compter les blogs par statut.
// Monte avec: app.use("/api/debug", debugRoutes);
// ----------------------------------------------------------------------
import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/blogs", async (_req, res) => {
  try {
    const Blog = mongoose.models.Blog;
    if (!Blog) return res.json({ error: "Model Blog non chargé" });

    const [approved, pending, missing] = await Promise.all([
      Blog.countDocuments({ isValidated: true }),
      Blog.countDocuments({ isValidated: false }),
      Blog.countDocuments({
        $or: [
          { isValidated: { $exists: false } },
          { status: { $exists: false } },
        ],
      }),
    ]);

    const sample = await Blog.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .select("title titre isValidated status");

    res.json({ approved, pending, missing, sample });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;

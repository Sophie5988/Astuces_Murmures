import express from "express";
import {
  addAComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Ajouter un commentaire à un blog
router.post("/:blogId", protect, addAComment);

// Supprimer un commentaire (auteur OU admin)
// ⚠️ signature alignée avec ton controller : /comment/:blogId/:commentId
router.delete("/:blogId/:commentId", protect, deleteComment);

export default router;

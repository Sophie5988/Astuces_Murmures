// serveur/src/models/blog.schema.js
// ======================================================================
// Modèle Blog (Mongoose, ESM)
// - Respecte la modération: isValidated (bool) + status ('pending'/'approved'/'rejected')
// - Champs typiques: title, accroche, content, category, keywords, imageUrl
// - Auteur (facultatif): authorId/authorName (garde compat si déjà stocké)
// - Ratings & comments simples pour rester compatibles
// - Timestamps automatiques
// ======================================================================

import mongoose from "mongoose"; // Import Mongoose (ESM)

const { Schema, models, model } = mongoose;

// Sous-document pour une note (rating)
const RatingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" }, // facultatif
    value: { type: Number, min: 1, max: 5, required: true },
  },
  { _id: true, timestamps: true }
);

// Sous-document pour un commentaire
const CommentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" }, // facultatif
    userName: { type: String }, // pour affichage public
    text: { type: String, required: true, trim: true },
  },
  { _id: true, timestamps: true }
);

// Schéma principal Blog
const BlogSchema = new Schema(
  {
    title: { type: String, required: true, trim: true }, // Titre
    accroche: { type: String, trim: true, default: "" }, // Accroche/sous-titre
    content: { type: String, required: true }, // Contenu riche
    category: { type: String, trim: true, default: "Général" }, // Catégorie
    keywords: { type: [String], default: [] }, // SEO keywords
    imageUrl: { type: String, default: "" }, // URL image (Supabase)

    // Auteur (optionnel pour compat)
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
    authorName: { type: String, default: "" },

    // Modération
    isValidated: { type: Boolean, default: false }, // Publication publique ?
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Interactions
    ratings: { type: [RatingSchema], default: [] },
    comments: { type: [CommentSchema], default: [] },
  },
  {
    timestamps: true, // createdAt/updatedAt
    versionKey: false,
  }
);

// Réutilise le modèle s'il existe déjà (hot-reload)
export default models.Blog || model("Blog", BlogSchema);

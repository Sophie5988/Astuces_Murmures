// models/comment.schema.js
import mongoose, { Schema } from "mongoose";

// Schéma Commentaire
const commentSchema = new mongoose.Schema(
  {
    // Texte du commentaire
    content: { type: String, required: true, minLength: 1, maxLength: 5000 },
    // Référence au blog
    blog: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      index: true,
    },
    // Auteur du commentaire
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;

// controllers/comment.controller.js
import Comment from "../models/comment.schema.js";
import Blog from "../models/blog.schema.js";

// Ajouter un commentaire
export const addAComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content } = req.body;
    const author = req.user._id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Contenu requis" });
    }

    // Vérif existence blog
    const exists = await Blog.exists({ _id: blogId });
    if (!exists) return res.status(404).json({ message: "Blog introuvable" });

    const comment = await Comment.create({
      content: content.trim(),
      blog: blogId,
      author,
    });

    await comment.populate("author", "username email role");
    await comment.populate("blog", "title");

    return res.status(201).json(comment);
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ message: "Pb lors de l'ajout du commentaire" });
  }
};

// Supprimer un commentaire (auteur du com OU admin)
export const deleteComment = async (req, res) => {
  try {
    const { blogId, commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId,
      blog: blogId,
    }).populate("author", "username email role _id");
    if (!comment)
      return res.status(404).json({ message: "Commentaire introuvable" });

    const isAuthor = comment.author._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    await comment.deleteOne();
    return res
      .status(200)
      .json({ success: true, message: "Commentaire supprimé" });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Suppression impossible" });
  }
};

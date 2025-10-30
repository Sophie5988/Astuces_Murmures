// serveur/src/controllers/adminBlogController.js
// ======================================================================
// Admin Blog Controller (ESM)
// - Liste paginée par statut (pending|approved|rejected)
// - Validation / rejet avec motif
// - Édition (titre/accroche/contenu/catégorie/keywords/image)
// - Suppression
// - Réponses "compat": ok:true, success:true + items/blogs/data (liste) ou item/blog (détail)
// - Normalise toujours "image" (depuis imageUrl si besoin)
// - ✉️ Mail optionnel via utils/mailer.js (silencieux si absent)
// ======================================================================

import Blog from "../models/blog.schema.js"; // Modèle Blog

// -- Mailer optionnel (silencieux si absent) ---------------------------------
let mailer = null;
try {
  const mod = await import("../utils/mailer.js");
  // supporte default ou { sendMail }
  mailer = mod?.default || mod?.sendMail || null;
} catch {
  // pas de mailer -> on continue sans bloquer
}

// -- Helpers -----------------------------------------------------------------
const shapeBlog = (b) => ({ ...b, image: b.image || b.imageUrl || "" });

const parsePagination = (req) => {
  // page & limit bornés pour éviter abus
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit || "10", 10))
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildSearchFilter = (search) => {
  if (!search) return {};
  const rx = new RegExp(search, "i");
  return {
    $or: [
      { title: rx },
      { accroche: rx },
      { content: rx },
      { category: rx },
      { authorName: rx },
    ],
  };
};

const normalizeStatus = (status) => {
  // autorisés: pending|approved|rejected
  const s = String(status || "pending").toLowerCase();
  return ["pending", "approved", "rejected"].includes(s) ? s : "pending";
};

// ======================================================================
// GET /api/admin/blog?status=&search=&page=&limit=&sort=createdAt:desc
// Liste paginée par statut
// - status: pending|approved|rejected (default: pending)
// - search: texte
// - sort: champ:ordre (ex: createdAt:desc)
// Retour: ok, success, page, limit, total, items + blogs + data
// ======================================================================
export async function listAdminBlogs(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req);
    const { search = "", sort = "createdAt:desc" } = req.query;
    const status = normalizeStatus(req.query.status);

    // Tri champ:ordre
    const [sortField, sortDirRaw] = String(sort).split(":");
    const sortDir = sortDirRaw === "asc" ? 1 : -1;

    // Filtre admin: par statut + recherche
    const filter = { status, ...buildSearchFilter(search) };

    const [items, total] = await Promise.all([
      Blog.find(filter)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(filter),
    ]);

    const shaped = items.map(shapeBlog);

    return res.json({
      ok: true,
      success: true,
      page,
      limit,
      total,
      status,
      items: shaped, // canonique
      blogs: shaped, // compat éventuelle
      data: shaped, // compat éventuelle
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================================
// PATCH /api/admin/blog/:id/validate
// Body: { isValidated: true|false, motif?: string }
// - true  -> status="approved"
// - false -> status="rejected" + sauvegarde du motif
// Retour: ok, success, item + blog
// ======================================================================
export async function validateAdminBlog(req, res, next) {
  try {
    const { id } = req.params;
    const { isValidated, motif = "" } = req.body || {};

    const blog = await Blog.findById(id);
    if (!blog)
      return res
        .status(404)
        .json({ ok: false, success: false, error: "Article introuvable" });

    const approve = Boolean(isValidated);

    blog.isValidated = approve;
    blog.status = approve ? "approved" : "rejected";
    // on stocke un petit bloc de modération
    blog.moderation = {
      ...(blog.moderation || {}),
      decidedAt: new Date(),
      reason: approve ? "" : String(motif || "").slice(0, 200),
    };

    await blog.save();
    const shaped = shapeBlog(blog.toObject ? blog.toObject() : blog);

    // ✉️ Mail "résultat" à l'utilisateur si le mailer est dispo (best-effort)
    if (mailer) {
      try {
        const subject = approve
          ? "✅ Votre article a été approuvé"
          : "❌ Votre article a été refusé";
        const reasonHtml =
          !approve && motif
            ? `<p><strong>Motif:</strong> ${String(motif)}</p>`
            : "";
        await mailer({
          subject,
          html: `
            <h2 style="margin:0 0 8px">${subject}</h2>
            <p><strong>Titre:</strong> ${shaped.title}</p>
            ${reasonHtml}
            <p>Merci pour votre contribution à la communauté ✨</p>
          `,
        });
      } catch {
        // silencieux
      }
    }

    return res.json({ ok: true, success: true, item: shaped, blog: shaped });
  } catch (err) {
    next(err);
  }
}

// ======================================================================
// PUT /api/admin/blog/:id
// Body: { title?, accroche?, content?, category?, keywords?, imageUrl?/image? }
// Retour: ok, success, item + blog
// ======================================================================
export async function updateAdminBlog(req, res, next) {
  try {
    const { id } = req.params;
    const { title, accroche, content, category, keywords, imageUrl, image } =
      req.body || {};

    const blog = await Blog.findById(id);
    if (!blog)
      return res
        .status(404)
        .json({ ok: false, success: false, error: "Article introuvable" });

    if (typeof title === "string") blog.title = title;
    if (typeof accroche === "string") blog.accroche = accroche;
    if (typeof content === "string") blog.content = content;
    if (typeof category === "string") blog.category = category;
    if (Array.isArray(keywords)) blog.keywords = keywords;
    if (typeof imageUrl === "string" || typeof image === "string") {
      blog.imageUrl = imageUrl || image || blog.imageUrl || "";
    }

    await blog.save();
    const shaped = shapeBlog(blog.toObject ? blog.toObject() : blog);

    return res.json({ ok: true, success: true, item: shaped, blog: shaped });
  } catch (err) {
    next(err);
  }
}

// ======================================================================
// DELETE /api/admin/blog/:id
// Retour: ok, success, deleted:true
// ======================================================================
export async function deleteAdminBlog(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Blog.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ ok: false, success: false, error: "Article introuvable" });
    }
    return res.json({ ok: true, success: true, deleted: true, id });
  } catch (err) {
    next(err);
  }
}

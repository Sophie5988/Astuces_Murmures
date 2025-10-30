// serveur/src/controllers/blog.controller.js
// ======================================================================
/* Contrôleur PUBLIC Blog — Astuces & Murmures (ESM)
 *
 * 🔁 Liste publique:
 *    - Renvoie d'abord UNIQUEMENT les billets validés (isValidated:true & status:"approved").
 *    - S'il n'y en a AUCUN => Fallback "legacy" AUTOMATIQUE (anti-page-vide)
 *        ➜ n'inclut que les anciens billets (sans modération) ou marqués legacy:true
 *        ➜ exclut tout "pending" / "rejected" / isValidated:false
 *
 * 📨 Mail admin à la création (best effort). Destinataire via .env:
 *    ADMIN_EMAIL | MAIL_TO_ADMIN | MAIL_TO
 *
 * 🤝 Compat front intacte:
 *    - LISTE  => { ok, success, items, blogs, data, ... }
 *    - DÉTAIL => { ok, success, item, blog }
 *
 * 🖼️ Normalisation image => .image toujours présent (fallback imageUrl)
 */
// ======================================================================

import Blog from "../models/blog.schema.js";

// -- Mailer optionnel ---------------------------------------------------
let mailer = null;
try {
  const mod = await import("../utils/mailer.js"); // utils/mailer.js confirmé
  mailer = mod?.default || mod?.sendMail || null; // tolère default / named
} catch {
  /* pas de mailer => silencieux */
}

// Destinataire admin (configurable)
const ADMIN_NOTIFY_TO =
  process.env.ADMIN_EMAIL ||
  process.env.MAIL_TO_ADMIN ||
  process.env.MAIL_TO ||
  "";

// Helpers ---------------------------------------------------------------
const parsePagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(req.query.limit || "10", 10))
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildSearchFilter = (search) => {
  if (!search) return {};
  const rx = new RegExp(search, "i");
  return {
    $or: [{ title: rx }, { accroche: rx }, { content: rx }, { category: rx }],
  };
};

// .image toujours présent
const shapeBlog = (b) => ({ ...b, image: b.image || b.imageUrl || "" });

// ----------------------------------------------------------------------
// GET /api/blog  — Public list
// ----------------------------------------------------------------------
export async function getAllBlogs(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req);
    const { search, sort = "createdAt:desc" } = req.query;

    const [sortField, sortDirRaw] = String(sort).split(":");
    const sortDir = sortDirRaw === "asc" ? 1 : -1;

    // 1) Filtre "validés"
    const validFilter = {
      isValidated: true,
      status: "approved",
      ...buildSearchFilter(search),
    };

    const [validItems, validTotal] = await Promise.all([
      Blog.find(validFilter)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(validFilter),
    ]);

    if (validTotal > 0) {
      const shaped = validItems.map(shapeBlog);
      return res.json({
        ok: true,
        success: true,
        page,
        limit,
        total: validTotal,
        validated: true,
        items: shaped,
        blogs: shaped,
        data: shaped,
      });
    }

    // 2) Fallback "legacy" automatique (anti-page-vide)
    //    ➜ ne JAMAIS inclure les nouveaux "pending"/"rejected"
    //    ➜ inclure:
    //       - documents sans champs de modération (isValidated absente OU status absent)
    //       - OU legacy:true (si ton script l'a ajouté)
    //       - OU status:"approved" (pour d'anciens posts éventuellement approuvés sans isValidated)
    //    ➜ exclure explicitement isValidated:false et status:"pending"/"rejected"
    const legacyFilter = {
      ...buildSearchFilter(search),
      $and: [
        {
          $or: [
            { legacy: true }, // pris en charge si ton script a ajouté ce flag
            { isValidated: { $exists: false } }, // pas migré
            { status: { $exists: false } }, // pas migré
            { status: "approved" }, // anciens déjà approuvés
          ],
        },
        {
          $nor: [
            { status: "pending" }, // pas de pending
            { status: "rejected" }, // pas de refusés
            { isValidated: false }, // pas de non-validés explicites
          ],
        },
      ],
    };

    const [legacyItems, legacyTotal] = await Promise.all([
      Blog.find(legacyFilter)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(legacyFilter),
    ]);

    const shaped = legacyItems.map(shapeBlog);
    return res.json({
      ok: true,
      success: true,
      page,
      limit,
      total: legacyTotal,
      validated: false, // important pour signaler qu'on est en fallback
      items: shaped,
      blogs: shaped,
      data: shaped,
    });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------
// GET /api/blog/:id — détail (compat item + blog)
// ----------------------------------------------------------------------
export async function getBlogById(req, res, next) {
  try {
    const doc = await Blog.findById(req.params.id).lean();
    if (!doc)
      return res
        .status(404)
        .json({ ok: false, success: false, error: "Article introuvable" });
    const shaped = shapeBlog(doc);
    return res.json({ ok: true, success: true, item: shaped, blog: shaped });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------
// POST /api/blog — création (pending) + mail admin (rose-700 formaté)
// ----------------------------------------------------------------------
export async function createBlog(req, res, next) {
  try {
    const {
      title,
      accroche = "",
      content,
      category = "Non renseignée",
      keywords = [],
      imageUrl = "",
      image = "",
      authorId = null,
      authorName = "",
      authorEmail = "",
    } = req.body || {};

    if (!title || !content) {
      return res.status(400).json({
        ok: false,
        success: false,
        error: "title et content sont requis",
      });
    }

    const created = await Blog.create({
      title,
      accroche,
      content,
      category,
      keywords,
      imageUrl: imageUrl || image || "",
      authorId,
      authorName,
      authorEmail,
      isValidated: false,
      status: "pending",
    });

    // ✉️ Notification admin — format demandé
    if (mailer && ADMIN_NOTIFY_TO) {
      const date = new Date(created.createdAt).toLocaleString("fr-FR");
      try {
        await mailer({
          to: ADMIN_NOTIFY_TO,
          subject: "📝 Un article de Blog a été créé et doit être validé",
          html: `
            <div style="font-family:Arial, sans-serif; color:#1f2937;">
              <h2 style="color:#be185d;">Un article de Blog a été créé et doit être validé</h2>
              <p><strong>Titre :</strong> ${created.title}</p>
              <p><strong>Catégorie :</strong> ${created.category}</p>
              <p><strong>Auteur :</strong> ${
                authorEmail || authorName || "Inconnu"
              }</p>
              <p><strong>Créé le :</strong> ${date}</p>
              <p style="margin-top:16px;">
                <em>Ouvrez votre espace d’administration pour modérer cet article.</em>
              </p>
            </div>
          `,
          text: `Un article de Blog a été créé et doit être validé\nTitre: ${
            created.title
          }\nCatégorie: ${created.category}\nAuteur: ${
            authorEmail || authorName
          }\nCréé le: ${date}\nConnectez-vous à l'espace admin pour modérer cet article.`,
        });
        console.log("📧 Mail admin rose-700 envoyé à:", ADMIN_NOTIFY_TO);
      } catch (e) {
        console.warn("⚠️ Mail admin non envoyé:", e?.message || e);
      }
    }

    const shaped = {
      ...(created.toObject ? created.toObject() : created),
      image: imageUrl || image || "",
    };
    return res
      .status(201)
      .json({ ok: true, success: true, item: shaped, blog: shaped });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------
// PATCH /api/blog/:id/rate — compat { item, blog }
// ----------------------------------------------------------------------
export async function rateBlog(req, res, next) {
  try {
    const { value = 0, userId = null } = req.body || {};
    const blog = await Blog.findById(req.params.id);
    if (!blog)
      return res
        .status(404)
        .json({ ok: false, success: false, error: "Article introuvable" });

    const v = Number(value);
    if (v < 1 || v > 5)
      return res
        .status(400)
        .json({ ok: false, success: false, error: "value doit être 1..5" });

    const idx = blog.ratings.findIndex(
      (r) => String(r.userId || "") === String(userId || "")
    );
    if (idx >= 0) blog.ratings[idx].value = v;
    else blog.ratings.push({ userId, value: v });

    await blog.save();
    const shaped = shapeBlog(blog.toObject ? blog.toObject() : blog);
    return res.json({ ok: true, success: true, item: shaped, blog: shaped });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------
// DELETE /api/blog/:id/rate — compat { item, blog }
// ----------------------------------------------------------------------
export async function deleteRateBlog(req, res, next) {
  try {
    const { userId = null } = req.body || {};
    const blog = await Blog.findById(req.params.id);
    if (!blog)
      return res
        .status(404)
        .json({ ok: false, success: false, error: "Article introuvable" });

    blog.ratings = blog.ratings.filter(
      (r) => String(r.userId || "") !== String(userId || "")
    );
    await blog.save();
    const shaped = shapeBlog(blog.toObject ? blog.toObject() : blog);
    return res.json({ ok: true, success: true, item: shaped, blog: shaped });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------
// POST /api/blog/:id/comments — compat { item, blog }
// ----------------------------------------------------------------------
export async function addComment(req, res, next) {
  try {
    const text = req.body?.text || req.body?.content || "";
    const userId = req.body?.userId || null;
    const userName = req.body?.userName || "";

    if (!text.trim())
      return res
        .status(400)
        .json({ ok: false, success: false, error: "text requis" });

    const blog = await Blog.findById(req.params.id);
    if (!blog)
      return res
        .status(404)
        .json({ ok: false, success: false, error: "Article introuvable" });

    blog.comments.unshift({ text, userId, userName });
    await blog.save();

    const shaped = shapeBlog(blog.toObject ? blog.toObject() : blog);
    return res
      .status(201)
      .json({ ok: true, success: true, item: shaped, blog: shaped });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------
// DELETE /api/blog/:id/comments/:cid — compat { item, blog }
// ----------------------------------------------------------------------
export async function deleteComment(req, res, next) {
  try {
    const { id, cid } = { id: req.params.id, cid: req.params.cid };
    const blog = await Blog.findById(id);
    if (!blog)
      return res
        .status(404)
        .json({ ok: false, success: false, error: "Article introuvable" });

    const prevLen = blog.comments.length;
    blog.comments = blog.comments.filter((c) => String(c._id) !== String(cid));
    if (blog.comments.length === prevLen) {
      return res
        .status(404)
        .json({ ok: false, success: false, error: "Commentaire introuvable" });
    }
    await blog.save();

    const shaped = shapeBlog(blog.toObject ? blog.toObject() : blog);
    return res.json({ ok: true, success: true, item: shaped, blog: shaped });
  } catch (err) {
    next(err);
  }
}

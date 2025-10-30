// serveur/src/controllers/actualite.controller.js
// ============================================================================
// CONTROLLER Actualités
// ---------------------------------------------------------------------------
// • Create / Read / Update / Delete / Validate / Stats
// • Endpoint auxiliaire `moveAssets` pour déplacer les images du dossier
//   draft/ → actualites/ sur Supabase (si configuré).
//
// ❗ Points importants (compat & DX)
// 1) Normalisation du type : "Commerce" → "Boutique" (pevient de certaines UIs)
// 2) Dates : on alimente toujours `date` (exigée par l'ancien schéma) à partir
//    de `date` OU `dateDebut` si l’un des deux est présent.
// 3) On caste `dateDebut` / `dateFin` en Date si fournis (sinon null).
// 4) Aucune exception non catchée ne remonte au client : réponses JSON propres.
// 5) Email d’alerte admin (optionnel) via Gmail si EMAIL_* configurés.
// ============================================================================

import nodemailer from "nodemailer";
import Actualite from "../models/actualite.schema.js";
import supabase from "../lib/supabase.js"; // client serveur (peut être null)

// Bucket Supabase (défaut : blog-images pour rester cohérent avec ton front)
const BUCKET = process.env.SUPABASE_BUCKET || "blog-images";

// ---------- Mailer (optionnel) ---------------------------------------------
const mailer =
  process.env.EMAIL_USER && process.env.EMAIL_PASS
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      })
    : null;

async function notifyAdminNewActualite(a) {
  if (!mailer) return;
  try {
    await mailer.sendMail({
      from: `"Astuces & Murmures" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "🕊️ Nouvelle actualité en attente de validation",
      html: `
        <h2>Nouvelle actualité à valider</h2>
        <p><b>Type :</b> ${a.type}</p>
        <p><b>Titre :</b> ${
          a.titreEvenement || a.nomMagasin || "(sans titre)"
        }</p>
        <p><b>Auteur (email) :</b> ${a.adresseMail || "—"}</p>
        <p><b>Créée le :</b> ${new Date(
          a.createdAt || Date.now()
        ).toLocaleString("fr-FR")}</p>
        <hr />
        <p>Connectez-vous à l’admin pour approuver ou refuser.</p>
      `,
    });
  } catch (err) {
    console.error("[Mailer] notifyAdminNewActualite:", err?.message);
  }
}

// ---------- util: extraire le path d'une URL publique ----------------------
// ex: https://.../object/public/blog-images/draft/2025/01/01/xxx.jpg
// => "draft/2025/01/01/xxx.jpg"
function publicUrlToPath(url) {
  if (!url) return null;
  const match = url.match(/\/object\/public\/[^/]+\/(.+)$/);
  return match ? match[1] : null;
}

// ============================================================================
// CREATE
// ============================================================================
// Alimente les champs compatibles avec l’ancien schéma (date obligatoire
// côté Evenement) tout en supportant dateDebut/dateFin modernes.
export const createActualite = async (req, res) => {
  try {
    const {
      type,
      phraseAccroche,
      contenu,
      departement,
      adresseComplete,
      telephone,
      adresseMail,
      image = null,
      photos = [],
      // Événement
      titreEvenement,
      organisateurs,
      mois,
      date, // (ancien champ unique)
      dateDebut,
      dateFin,
      // Boutique
      nomMagasin,
      // Opts génériques
      tarifs = [],
      horaires = {},
      parkingFacile = false,
      autresInfos = "",
      keywords = [],
      metaTitle = "",
      metaDescription = "",
    } = req.body;

    // 1) Normaliser le type : "Commerce" → "Boutique"
    const normalizedType = type === "Commerce" ? "Boutique" : type;

    // 2) Construire le document commun
    const doc = {
      type: normalizedType,
      phraseAccroche,
      contenu,
      departement,
      adresseComplete,
      telephone,
      adresseMail,
      image,
      photos,
      author: req.user?._id,
      isValidated: false,
      tarifs,
      horaires,
      parkingFacile,
      autresInfos,
      keywords,
      metaTitle,
      metaDescription,
    };

    // 3) Événement : dates & champs spécifiques
    if (normalizedType === "Evenement") {
      doc.titreEvenement = titreEvenement;
      doc.organisateurs = organisateurs;
      doc.mois = mois || null;

      // Le vieux schéma exige `date` => on le renseigne avec date OU dateDebut
      // (cela évite l’erreur “Path `date` is required.”)
      const d1 = dateDebut || date || null;
      doc.date = d1 ? new Date(d1).toISOString() : null;

      // On cast aussi dateDebut/dateFin si fournis (utile pour le nouveau rendu)
      doc.dateDebut = dateDebut
        ? new Date(dateDebut)
        : doc.date
        ? new Date(doc.date)
        : null;
      doc.dateFin = dateFin ? new Date(dateFin) : null;
    }

    // 4) Boutique : nomMagasin
    if (normalizedType === "Boutique") {
      doc.nomMagasin = nomMagasin;
    }

    // 5) Création
    const created = await Actualite.create(doc);
    await created.populate("author", "username email");

    // 6) Alerte admin (optionnel)
    notifyAdminNewActualite(created).catch(() => {});

    return res.status(201).json(created);
  } catch (error) {
    // Si la validation Mongoose remonte (ex: contenu > maxLength), on l’expose clairement
    console.error("Erreur création actualité:", error);
    return res
      .status(400)
      .json({ message: error.message, details: error.errors || null });
  }
};

// ============================================================================
// GET ALL (pagination/tri/recherche optionnels)
// ============================================================================
// Supporte 2 modes :
//  • mode liste simple (pas de `page`) -> renvoie un tableau
//  • mode paginé (`page` fourni) -> renvoie { items, total, page, pages }
export const getAllActualites = async (req, res) => {
  try {
    const {
      isValidated = "true",
      type,
      departement,
      status, // "pending" | "approved"
      q,
      page,
      limit = "10",
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};

    // Filtre de validation : si status fourni, il prime
    if (status === "pending") filter.isValidated = false;
    else if (status === "approved") filter.isValidated = true;
    else if (typeof page === "undefined") {
      // Pas de pagination : fallback sur isValidated (par défaut true)
      filter.isValidated = isValidated === "false" ? false : true;
    }

    if (type && ["Evenement", "Boutique"].includes(type)) filter.type = type;
    if (departement) filter.departement = departement;

    if (q) {
      filter.$or = [
        { titreEvenement: { $regex: q, $options: "i" } },
        { nomMagasin: { $regex: q, $options: "i" } },
        { phraseAccroche: { $regex: q, $options: "i" } },
        { keywords: { $elemMatch: { $regex: q, $options: "i" } } },
      ];
    }

    const sort = { [sortBy]: order === "asc" ? 1 : -1 };

    // Mode paginé
    if (typeof page !== "undefined") {
      const p = Math.max(parseInt(page || "1", 10), 1);
      const lim = Math.max(parseInt(limit, 10), 1);

      const [items, total] = await Promise.all([
        Actualite.find(filter)
          .populate("author", "username email")
          .sort(sort)
          .skip((p - 1) * lim)
          .limit(lim),
        Actualite.countDocuments(filter),
      ]);

      const pages = Math.max(Math.ceil(total / lim), 1);
      return res.status(200).json({ items, total, page: p, pages });
    }

    // Mode simple (tableau direct)
    const items = await Actualite.find(filter)
      .populate("author", "username email")
      .sort(sort)
      .limit(parseInt(limit, 10));
    return res.status(200).json(items);
  } catch (error) {
    console.error("Erreur récupération actualités:", error);
    return res.status(400).json({ message: error.message });
  }
};

// ============================================================================
// GET BY ID
// ============================================================================
export const getActualiteById = async (req, res) => {
  try {
    const a = await Actualite.findById(req.params.id).populate(
      "author",
      "username email"
    );
    if (!a) return res.status(404).json({ message: "Actualité non trouvée" });
    return res.status(200).json(a);
  } catch (error) {
    console.error("Erreur récupération actualité:", error);
    return res.status(400).json({ message: error.message });
  }
};

// ============================================================================
// UPDATE (ré-ouvre la modération en remettant isValidated=false)
// ============================================================================
export const updateActualite = async (req, res) => {
  try {
    const { id } = req.params;

    // sécurité "owner"
    const owned = await Actualite.findOne({ _id: id, author: req.user._id });
    if (!owned) {
      return res
        .status(404)
        .json({ message: "Actualité non trouvée ou non autorisée" });
    }

    // normaliser côté update (au cas où)
    const patch = { ...req.body };
    if (patch.type === "Commerce") patch.type = "Boutique";

    // re-mise en modération
    const updated = await Actualite.findByIdAndUpdate(
      id,
      { ...patch, isValidated: false },
      { new: true, runValidators: true }
    ).populate("author", "username email");

    return res.status(200).json(updated);
  } catch (error) {
    console.error("Erreur mise à jour actualité:", error);
    return res.status(400).json({ message: error.message });
  }
};

// ============================================================================
// DELETE
// ============================================================================
export const deleteActualite = async (req, res) => {
  try {
    const { id } = req.params;
    const owned = await Actualite.findOne({ _id: id, author: req.user._id });
    if (!owned) {
      return res
        .status(404)
        .json({ message: "Actualité non trouvée ou non autorisée" });
    }
    await Actualite.findByIdAndDelete(id);
    return res.status(200).json({ message: "Actualité supprimée avec succès" });
  } catch (error) {
    console.error("Erreur suppression actualité:", error);
    return res.status(400).json({ message: error.message });
  }
};

// ============================================================================
// VALIDATE (admin)
// ============================================================================
export const validateActualite = async (req, res) => {
  try {
    const { id } = req.params;
    const { isValidated } = req.body;

    const updated = await Actualite.findByIdAndUpdate(
      id,
      { isValidated: !!isValidated },
      { new: true }
    ).populate("author", "username email");

    if (!updated)
      return res.status(404).json({ message: "Actualité non trouvée" });

    return res.status(200).json({
      message: `Actualité ${isValidated ? "validée" : "rejetée"} avec succès`,
      actualite: updated,
    });
  } catch (error) {
    console.error("Erreur validation actualité:", error);
    return res.status(400).json({ message: error.message });
  }
};

// ============================================================================
// STATS (admin)
// ============================================================================
export const getActualitesStats = async (req, res) => {
  try {
    const stats = await Actualite.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          validated: { $sum: { $cond: ["$isValidated", 1, 0] } },
          pending: { $sum: { $cond: ["$isValidated", 0, 1] } },
          evenements: {
            $sum: { $cond: [{ $eq: ["$type", "Evenement"] }, 1, 0] },
          },
          boutiques: {
            $sum: { $cond: [{ $eq: ["$type", "Boutique"] }, 1, 0] },
          },
        },
      },
    ]);
    const r = stats[0] || {
      total: 0,
      validated: 0,
      pending: 0,
      evenements: 0,
      boutiques: 0,
    };
    return res.status(200).json(r);
  } catch (error) {
    console.error("Erreur stats actualités:", error);
    return res.status(400).json({ message: error.message });
  }
};

// ============================================================================
// MOVE draft/ -> actualites/  (POST /api/actualites/move-assets)
// ----------------------------------------------------------------------------
// body: { image?:string, photos?:string[] }
// Retourne { image, photos } avec URLs "finales" si move OK ; sinon renvoie
// les URLs originales (fallback transparent).
// ============================================================================
export const moveAssets = async (req, res) => {
  try {
    const { image = null, photos = [] } = req.body || {};

    // Si pas de client Supabase : on renvoie tel quel (ne bloque jamais)
    if (!supabase) {
      return res.status(200).json({ image, photos });
    }

    // util interne : si le path commence par draft/ -> on le déplace en actualites/
    const moveOne = async (publicUrl) => {
      if (!publicUrl) return null;
      const src = publicUrlToPath(publicUrl); // ex: draft/2025/...
      if (!src || !src.startsWith("draft/")) return publicUrl; // pas un draft => ne bouge pas

      const dest = src.replace(/^draft\//, "actualites/");
      const { error: moveError } = await supabase.storage
        .from(BUCKET)
        .move(src, dest);
      if (moveError) {
        console.error("[move] erreur move:", moveError?.message);
        // fallback : on garde l’URL d’origine
        return publicUrl;
      }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(dest);
      return data?.publicUrl || publicUrl;
    };

    const result = {
      image: await moveOne(image),
      photos: [],
    };

    if (Array.isArray(photos) && photos.length) {
      for (const u of photos) {
        // eslint-disable-next-line no-await-in-loop
        result.photos.push(await moveOne(u));
      }
    }

    return res.status(200).json(result);
  } catch (e) {
    console.error("Erreur move-assets:", e?.message);
    // fallback : renvoyer tel quel pour ne pas bloquer l’expérience
    return res
      .status(200)
      .json({ image: req.body?.image || null, photos: req.body?.photos || [] });
  }
};

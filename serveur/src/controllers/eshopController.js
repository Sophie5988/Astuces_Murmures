// serveur/src/controllers/eshopController.js
// ===================================================================
// Contrôleur E-shop (Produits) — ESM
// Fonctions exportées : listProducts, createProduct, updateProduct, deleteProduct
// ===================================================================

// ⚠️ CHEMIN CORRIGÉ (pas de "src/" en trop)
import Product from "../models/Product.js";

// -------- util tri "champ:ordre" -----------------------------------
function parseSort(sortStr = "createdAt:desc") {
  let sortBy = "createdAt";
  let order = -1;
  if (typeof sortStr === "string" && sortStr.includes(":")) {
    const [s, o] = sortStr.split(":");
    sortBy = s || sortBy;
    order = o === "asc" ? 1 : -1;
  }
  return { [sortBy]: order };
}

// -------- LIST -----------------------------------------------------
export async function listProducts(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit || "24", 10))
    );
    const search = (req.query.search || "").trim();
    const category = (req.query.category || "").trim();
    const color = (req.query.color || "").trim();
    const minPrice = req.query.minPrice
      ? Number(req.query.minPrice)
      : undefined;
    const maxPrice = req.query.maxPrice
      ? Number(req.query.maxPrice)
      : undefined;
    const sort = parseSort((req.query.sort || "createdAt:desc").trim());

    const filter = {};
    if (search) filter.$text = { $search: search };
    if (category) filter.categories = category;
    if (color) filter.color = new RegExp(`^${color}$`, "i");
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (!Number.isNaN(minPrice)) filter.price.$gte = minPrice;
      if (!Number.isNaN(maxPrice)) filter.price.$lte = maxPrice;
    }

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filter),
    ]);
    return res.json({ items, total, page, limit });
  } catch (err) {
    console.error("listProducts error:", err);
    return res.status(500).json({ message: "Erreur de lecture produits" });
  }
}

// -------- CREATE ---------------------------------------------------
export async function createProduct(req, res) {
  try {
    const {
      name,
      description = "",
      price,
      imageUrl = "",
      stock = 0,
      categories = [],
      color = "",
    } = req.body || {};
    if (!name || typeof price !== "number") {
      return res.status(400).json({ message: "Champs requis: name, price" });
    }
    const item = await Product.create({
      name: String(name).trim(),
      description: String(description).trim(),
      price: Number(price),
      imageUrl: String(imageUrl),
      stock: Number(stock) || 0,
      categories: Array.isArray(categories) ? categories.filter(Boolean) : [],
      color: String(color).trim(),
    });
    return res.status(201).json({ ok: true, item });
  } catch (err) {
    console.error("createProduct error:", err);
    return res.status(500).json({ message: "Erreur création produit" });
  }
}

// -------- UPDATE ---------------------------------------------------
export async function updateProduct(req, res) {
  try {
    const id = req.params.id;
    const patch = req.body || {};
    const item = await Product.findByIdAndUpdate(id, patch, { new: true });
    if (!item) return res.status(404).json({ message: "Produit introuvable" });
    return res.json({ ok: true, item });
  } catch (err) {
    console.error("updateProduct error:", err);
    return res.status(500).json({ message: "Erreur mise à jour produit" });
  }
}

// -------- DELETE ---------------------------------------------------
export async function deleteProduct(req, res) {
  try {
    const id = req.params.id;
    const out = await Product.findByIdAndDelete(id);
    if (!out) return res.status(404).json({ message: "Produit introuvable" });
    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteProduct error:", err);
    return res.status(500).json({ message: "Erreur suppression produit" });
  }
}

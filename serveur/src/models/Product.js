// serveur/src/models/Product.js
// ===================================================================
// Modèle Mongoose pour les produits E-shop.
// - Design simple : name, description, price, imageUrl, stock, categories, color
// - Index texte "souple" pour la recherche
// ===================================================================

import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: "" },
    stock: { type: Number, default: 0, min: 0 },
    categories: { type: [String], default: [] },
    color: { type: String, default: "", trim: true }, // ex: "vert sauge"
  },
  { timestamps: true }
);

// Recherche "souple" sur name + description
ProductSchema.index({ name: "text", description: "text" }); // serveur/src/controllers/eshopController.js
// ===================================================================
// Contrôleur E-shop (Produits) : liste + création + mise à jour + suppression
// Filtres supportés (query):
//  - search: string (texte)
//  - category: string (catégorie exacte)
//  - minPrice, maxPrice: number
//  - color: string
//  - sort: "createdAt:desc" (champ:ordre)
// ===================================================================

import Product from "../models/Product.js";

// Utilitaire de tri "champ:ordre"
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

// GET /api/eshop/products
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

    // Filtre
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
    return res.status(500).json({ message: "Erreur de lecture produits" });
  }
}

// POST /api/eshop/products (requireAdmin)
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
    // (emails à brancher plus tard)
    return res.status(201).json({ ok: true, item });
  } catch (err) {
    return res.status(500).json({ message: "Erreur création produit" });
  }
}

// PUT /api/eshop/products/:id (requireAdmin)
export async function updateProduct(req, res) {
  try {
    const id = req.params.id;
    const patch = req.body || {};
    const item = await Product.findByIdAndUpdate(id, patch, { new: true });
    if (!item) return res.status(404).json({ message: "Produit introuvable" });
    return res.json({ ok: true, item });
  } catch (err) {
    return res.status(500).json({ message: "Erreur mise à jour produit" });
  }
}

// DELETE /api/eshop/products/:id (requireAdmin)
export async function deleteProduct(req, res) {
  try {
    const id = req.params.id;
    const out = await Product.findByIdAndDelete(id);
    if (!out) return res.status(404).json({ message: "Produit introuvable" });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: "Erreur suppression produit" });
  }
}

export default mongoose.model("Product", ProductSchema);

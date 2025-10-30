// serveur/scripts/importProducts.js
// ===================================================================
// Import initial de produits "maquettes" dans MongoDB (Atlas ou local).
// Affiche le count avant/après et insère seulement les absents.
// Usage : node serveur/scripts/importProducts.js
// ===================================================================

import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../src/models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const seed = [
  {
    name: "Bracelet en Pierre Naturelle",
    description:
      "Bracelet fait main avec des perles de pierres naturelles et cristaux. Équilibre énergétique.",
    price: 17.99,
    stock: 12,
    categories: ["accessoires bien-être", "cristaux & minéraux"],
    color: "beige",
  },
  {
    name: "Encens Naturel Zen",
    description:
      "Encens pur base d'ingrédients naturels. Parfums santal et lavande.",
    price: 12.5,
    stock: 20,
    categories: ["relaxation"],
    color: "marron",
  },
  {
    name: "Bougie Parfumée Relaxante",
    description: "Cire de soja + huiles essentielles. ~25h.",
    price: 22.0,
    stock: 18,
    categories: ["relaxation"],
    color: "beige",
  },
  {
    name: "Set de Cristaux Énergétiques",
    description: "Améthyste, quartz rose, citrine. Idéal méditation.",
    price: 29.9,
    stock: 10,
    categories: ["cristaux & minéraux", "méditation"],
    color: "multicolore",
  },
  {
    name: "Tapis de Yoga Écologique",
    description: "Antidérapant, matériaux durables, confort quotidien.",
    price: 45.0,
    stock: 8,
    categories: ["yoga", "accessoires bien-être"],
    color: "vert",
  },
  {
    name: "Huile Essentielle de Lavande",
    description: "100% pure, calme et relaxation. 10ml.",
    price: 15.75,
    stock: 25,
    categories: ["huiles essentielles", "relaxation"],
    color: "transparent",
  },
  {
    name: "Carillon à Vent en Bambou",
    description: "Artisanal, sons doux apaisants.",
    price: 24.9,
    stock: 9,
    categories: ["relaxation"],
    color: "bois",
  },
  {
    name: "Thé Vert Bio Detox",
    description: "Mélange bio détox 100g.",
    price: 18.5,
    stock: 14,
    categories: ["tisanes & thés", "nutrition"],
    color: "vert",
  },
  {
    name: "Coussin de Méditation",
    description: "Rempli sarrasin, housse amovible.",
    price: 35.0,
    stock: 11,
    categories: ["méditation"],
    color: "sable",
  },
  {
    name: "Journal de Gratitude",
    description: "Carnet pour réflexions et gratitude. Couverture lin.",
    price: 19.9,
    stock: 30,
    categories: ["journals & carnets"],
    color: "lin",
  },
  {
    name: "Diffuseur d'Huiles Essentielles",
    description: "Ultrasonique avec LED.",
    price: 39.9,
    stock: 7,
    categories: ["huiles essentielles", "relaxation"],
    color: "blanc",
  },
  {
    name: "Set de Bols Chantants",
    description: "3 bols chantants cristal, avec maillet.",
    price: 68.0,
    stock: 5,
    categories: ["méditation", "relaxation"],
    color: "transparent",
  },
];

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI manquant dans serveur/.env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connecté MongoDB");
  const before = await Product.countDocuments();
  console.log(`📦 Produits avant import: ${before}`);

  let inserts = 0;
  for (const p of seed) {
    const exists = await Product.findOne({ name: p.name });
    if (!exists) {
      await Product.create(p);
      console.log(` + ${p.name}`);
      inserts++;
    } else {
      console.log(` ~ ${p.name} (déjà présent)`);
    }
  }

  const after = await Product.countDocuments();
  console.log(`✅ Produits après import: ${after} (ajoutés: ${inserts})`);
  await mongoose.disconnect();
  console.log("✅ Terminé");
}

main().catch((e) => {
  console.error("❌ Import échoué :", e);
  process.exit(1);
});

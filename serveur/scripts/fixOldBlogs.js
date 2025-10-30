// serveur/scripts/fixOldBlogs.js
// ============================================================================
// Migration "douce" des anciens blogs :
// - Valide uniquement les documents qui N'ONT PAS encore les champs
//   de modération (isValidated / status), pour ne PAS toucher aux
//   nouveaux articles en "pending".
// - Utilise MONGO_URI de ton .env (à la racine du dossier /serveur).
// - Résout le modèle Blog à partir de serveur/src/models/blog.schema.js
// ============================================================================

import "dotenv/config";              // 1) Charge les variables .env (serveur/.env)
import mongoose from "mongoose";     // 2) Driver Mongo/Mongoose

// --------------------------------------------------------------------------
// 🔧 Résolution du modèle "Blog" à partir du schema de ton projet
// --------------------------------------------------------------------------
async function getBlogModel() {
  // (a) Si déjà enregistré (autre script/serveur), on réutilise.
  if (mongoose.models?.Blog) return mongoose.models.Blog;

  // (b) Import du schema tel qu'il existe dans ton repo.
  const mod = await import("../src/models/blog.schema.js").catch((e) => {
    console.error("❌ Impossible d'importer ../src/models/blog.schema.js :", e.message);
    throw e;
    // NOTE: Chemin relatif au fichier courant (serveur/scripts/fixOldBlogs.js)
  });

  // (c) On récupère ce que le module exporte (Schema ou Model).
  const exported =
    mod?.default ?? mod?.BlogSchema ?? mod?.schema ?? mod?.blogSchema ?? null;

  // (d) Si un Model complet a été exporté.
  if (exported && exported.modelName) return exported;

  // (e) Si c'est un Schema Mongoose → on enregistre un Model.
  if (exported instanceof mongoose.Schema) {
    return mongoose.model("Blog", exported);
  }

  // (f) Autres variantes possibles d'export.
  if (mod?.Blog && mod.Blog.modelName) return mod.Blog;
  if (mod?.Blog && mod.Blog instanceof mongoose.Schema) {
    return mongoose.model("Blog", mod.Blog);
  }

  // (g) Rien de compatible trouvé → on explicite l’erreur.
  throw new Error(
    "❌ Impossible de construire le modèle Blog depuis blog.schema.js. " +
      "Vérifie l'export (Schema ou Model)."
  );
}

// --------------------------------------------------------------------------
// 🚀 Script principal
// --------------------------------------------------------------------------
async function main() {
  // 1) Récupère MONGO_URI du .env
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI manquant dans serveur/.env");
    process.exit(1);
  }

  // 2) Connexion MongoDB (dbName est déjà contenu dans ton URI Atlas)
  console.log("🔌 Connexion à MongoDB…");
  await mongoose.connect(uri);

  // 3) Récupère/instancie le modèle Blog
  console.log("✅ Connecté. Chargement modèle Blog…");
  const Blog = await getBlogModel();

  // 4) Filtre : uniquement les DOCUMENTS ANCIENS (sans modération)
  const filter = {
    $or: [{ isValidated: { $exists: false } }, { status: { $exists: false } }],
  };

  // 5) Patch : on les marque en validés/public
  const patch = {
    $set: { isValidated: true, status: "approved" },
  };

  // 6) Migration
  console.log("🛠️  Migration en cours (anciens blogs → approved)…");
  const out = await Blog.updateMany(filter, patch);

  // 7) Log du résultat (compat différentes versions mongoose)
  const matched = out.matchedCount ?? out.n ?? 0;
  const modified = out.modifiedCount ?? out.nModified ?? 0;
  console.log(`👌 Terminé. ${matched} documents concernés, ${modified} modifiés.`);

  // 8) Déconnexion propre
  await mongoose.disconnect();
  console.log("👋 Déconnecté. Fin du script.");
}

// Lancement + gestion des erreurs
main().catch(async (e) => {
  console.error("💥 Erreur script:", e);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});

// serveur/scripts/seedAdmin.mjs
// ===================================================================
// Script ESM pour créer un admin initial en base.
// Usage (depuis le dossier "serveur/") :
//   node scripts/seedAdmin.mjs admin@astuces-murmures.fr MonPasseUltraSolide
// ===================================================================

import "dotenv/config"; // charge .env (équiv. dotenv.config() en ESM)
import mongoose from "mongoose"; // client MongoDB
import Admin from "../src/models/Admin.js"; // modèle Admin (ESM)

(async () => {
  try {
    const [, , emailArg, passwordArg] = process.argv; // récupère email / password

    if (!emailArg || !passwordArg) {
      console.error("Usage : node scripts/seedAdmin.mjs <email> <password>");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI); // connexion DB

    const admin = await Admin.createWithPassword(emailArg, passwordArg); // création

    console.log("✅ Admin créé :", admin.email); // log succès

    await mongoose.disconnect(); // déconnexion propre
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur seedAdmin :", err);
    process.exit(1);
  }
})();

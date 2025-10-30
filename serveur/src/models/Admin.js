// serveur/src/models/Admin.js
// ===================================================================
// Modèle Admin (Mongoose) en ESM.
// Stocke l'email unique, le hash du mot de passe et l'état actif.
// Fournit : comparePassword() et createWithPassword().
// ===================================================================

import mongoose from "mongoose"; // Import ESM de mongoose
import bcrypt from "bcryptjs"; // Bcrypt pour hasher/vérifier les mots de passe

// Définition du schéma Admin
const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String, // email de l'admin
      required: true, // obligatoire
      unique: true, // unique en base
      lowercase: true, // stocké en minuscules
      trim: true, // sans espaces parasites
    },
    passwordHash: {
      type: String, // hash bcrypt du mot de passe
      required: true, // obligatoire
    },
    isActive: {
      type: Boolean, // possibilité de désactiver un admin
      default: true, // actif par défaut
    },
  },
  { timestamps: true } // ajoute createdAt / updatedAt
);

// Méthode d'instance : compare un mot de passe en clair au hash
AdminSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// Méthode statique : crée un admin en hashant le mot de passe
AdminSchema.statics.createWithPassword = async function (email, plainPassword) {
  const salt = await bcrypt.genSalt(12); // génère un salt cost 12
  const passwordHash = await bcrypt.hash(plainPassword, salt); // hash
  return this.create({ email, passwordHash }); // insère en base
};

// Exporte le modèle (ESM)
const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
export default Admin;

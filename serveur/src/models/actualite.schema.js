// server/src/models/actualite.schema.js
import mongoose, { Schema } from "mongoose";

const actualiteSchema = new mongoose.Schema(
  {
    // "Evenement" ou "Boutique" (on tolère encore "Commerce" côté controller)
    type: {
      type: String,
      required: true,
      enum: ["Evenement", "Boutique"],
    },

    // -------- Champs communs
    phraseAccroche: { type: String, required: true, maxLength: 200 },
    // ⬇︎ passe à 500 comme dans le formulaire
    contenu: { type: String, required: true, minLength: 10, maxLength: 500 },

    departement: { type: String, required: true },
    adresseComplete: { type: String, required: true },
    telephone: { type: String, required: true },
    adresseMail: { type: String, required: true },

    image: { type: String, default: null },
    photos: [{ type: String }],
    keywords: [{ type: String }],
    parkingFacile: { type: Boolean, default: false },
    tarifs: { type: Array, default: [] },
    horaires: { type: Object, default: {} },
    autresInfos: { type: String, default: "" },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // si tes routes sont protégées; mets false si besoin
    },

    // -------- Evénement
    titreEvenement: {
      type: String,
      required: function () {
        return this.type === "Evenement";
      },
    },
    organisateurs: {
      type: String,
      required: function () {
        return this.type === "Evenement";
      },
    },
    mois: {
      type: String,
      required: function () {
        return this.type === "Evenement";
      },
    },
    // ✅ on **remplace** l’ancien modèle unique "date" par dateDebut/dateFin
    dateDebut: {
      type: Date,
      required: function () {
        return this.type === "Evenement";
      },
    },
    dateFin: { type: Date }, // optionnelle

    // -------- Boutique
    nomMagasin: {
      type: String,
      required: function () {
        return this.type === "Boutique";
      },
    },

    // -------- Compat héritage
    // On garde "date" pour compat mais plus "required"
    date: { type: Date },

    // -------- Modération
    isValidated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index
actualiteSchema.index({ type: 1 });
actualiteSchema.index({ departement: 1 });
actualiteSchema.index({ createdAt: -1 });
actualiteSchema.index({ isValidated: 1 });

// Virtuel d’affichage
actualiteSchema.virtual("titre").get(function () {
  return this.type === "Evenement" ? this.titreEvenement : this.nomMagasin;
});

const Actualite = mongoose.model("Actualite", actualiteSchema);
export default Actualite;

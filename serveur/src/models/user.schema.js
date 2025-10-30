// server/src/models/user.schema.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Identité & auth
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // peut être vide si provider = "google"
    avatar: { type: String, default: null },

    // Profil étendu
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    address: { type: String, default: "" },
    zip: { type: String, default: "" },
    city: { type: String, default: "" },
    phone: { type: String, default: "" },

    // Auth provider
    provider: { type: String, enum: ["local", "google"], default: "local" },
    googleId: { type: String },

    // Rôle (permet admin)
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// Schémas minimalistes pour la migration
const BlogSchema = new mongoose.Schema(
  { image: String },
  { strict: false, timestamps: true }
);
const UserSchema = new mongoose.Schema(
  { avatar: String },
  { strict: false, timestamps: true }
);

const Blog = mongoose.model("Blog", BlogSchema, "blogs");
const User = mongoose.model("User", UserSchema, "users");

function fixUrl(u) {
  if (!u || typeof u !== "string") return u;
  // Injecte /public/ après /object/ si manquant
  return u.includes("/storage/v1/object/public/")
    ? u
    : u.replace("/storage/v1/object/", "/storage/v1/object/public/");
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const blogs = await Blog.find({ image: { $regex: "/storage/v1/object/" } });
    let bCount = 0;
    for (const b of blogs) {
      const fixed = fixUrl(b.image);
      if (fixed !== b.image) {
        b.image = fixed;
        await b.save();
        bCount++;
      }
    }

    const users = await User.find({
      avatar: { $regex: "/storage/v1/object/" },
    });
    let uCount = 0;
    for (const u of users) {
      const fixed = fixUrl(u.avatar);
      if (fixed !== u.avatar) {
        u.avatar = fixed;
        await u.save();
        uCount++;
      }
    }

    console.log(
      `✔ Mis à jour: ${bCount} image(s) de blogs, ${uCount} avatar(s).`
    );
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

run();

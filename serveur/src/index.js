// serveur/src/index.js
// ======================================================================
// API Astuces & Murmures — serveur Express (ESM)
// - CORS tolérant en DEV (autorise 5173 / 127.0.0.1:5173 automatiquement)
// - Lecture .env CORS_ORIGINS pour prod: "https://site.com,https://app.site.com"
// - Routes publiques + admin (blog)
// ======================================================================

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import routes from "./routes/index.js";
import blogRoutes from "./routes/blog.route.js";
import eshopRoutes from "./routes/eshopRoutes.js";
import debugRoutes from "./routes/debugRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminBlogRoutes from "./routes/adminBlogRoutes.js";

import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ----- CORS: on construit la whiteliste -----
const envList = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// En DEV, on ajoute d’office les origins Vite
const devDefaults = ["http://localhost:5173", "http://127.0.0.1:5173"];

// Fusion sans doublons
const allowedOrigins = Array.from(new Set([...envList, ...devDefaults]));

// Middleware CORS avec fonction de vérification
app.use(
  cors({
    origin(origin, cb) {
      // autorise requêtes sans Origin (Thunder, cURL)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(
        new Error(`Origin "${origin}" not allowed by CORS policy`),
        false
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parseurs
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// Health
app.get("/health", (_req, res) =>
  res
    .status(200)
    .json({
      ok: true,
      success: true,
      service: "Astuces&Murmures",
      ts: Date.now(),
    })
);

// Routes publiques
app.use("/", routes);
app.use("/api/blog", blogRoutes);
app.use("/api/blogs", blogRoutes); // alias compat
app.use("/api/eshop", eshopRoutes);
app.use("/api/debug", debugRoutes);

// Auth + Admin
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/blog", adminBlogRoutes);

// 404
app.use((req, res) => {
  res
    .status(404)
    .json({
      ok: false,
      success: false,
      error: "Not Found",
      path: req.originalUrl,
    });
});

// Erreurs
app.use((err, _req, res, _next) => {
  console.error("💥 Global error:", err?.message || err);
  res
    .status(err.status || 500)
    .json({
      ok: false,
      success: false,
      error: err.message || "Internal Error",
    });
});

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ API sur http://localhost:${PORT}`);
      console.log(`🔐 CORS: ${allowedOrigins.join(", ")}`);
    });
  } catch (e) {
    console.error("❌ Démarrage échoué:", e);
    process.exit(1);
  }
})();

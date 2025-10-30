// serveur/src/index.js
// ======================================================================
// API Astuces & Murmures — serveur Express (ESM)
// - CORS tolérant en DEV (autorise 5173 / 127.0.0.1:5173 automatiquement)
// - Lecture .env CORS_ORIGINS pour prod: "https://site.com,https://app.site.com"
// - Support des wildcards dans CORS_ORIGINS (ex: "https://*.netlify.app")
// - Prend en compte Netlify (URL/DEPLOY_PRIME_URL) si dispo
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
// 1) Liste issue de l'env (séparée par virgules)
const envList = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// 2) En DEV, on ajoute d’office les origins Vite
const devDefaults = ["http://localhost:5173", "http://127.0.0.1:5173"];

// 3) En prod, on ajoute des origines raisonnables par défaut (sans casser l’existant)
//    - Domaine Netlify principal du projet
//    - URL(s) exposées par Netlify si le back tourne aussi chez eux (variables d’env Netlify)
const prodDefaults = [
  "https://astucesmurmures.netlify.app", // domaine Netlify connu du front
].filter(Boolean);

// Variables Netlify (si présentes dans l’env du serveur)
const netlifyEnv = [
  process.env.URL, // prod URL
  process.env.DEPLOY_PRIME_URL, // preview URL
  process.env.DEPLOY_URL, // deploy-specific URL
]
  .filter(Boolean)
  .map((s) => s.trim());

// 4) Fusion sans doublons
const allowedOriginsRaw = Array.from(
  new Set([...envList, ...devDefaults, ...prodDefaults, ...netlifyEnv])
);

// --- Helper: transforme les entrées avec wildcard "*" en RegExp sûres ---
const escapeRegex = (str) => str.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
const toMatcher = (originStr) => {
  if (!originStr.includes("*")) {
    // correspondance exacte (string)
    return originStr;
  }
  // wildcard → RegExp (ex: https://*.netlify.app)
  const pattern = "^" + escapeRegex(originStr).replace(/\\\*/g, ".*") + "$";
  return new RegExp(pattern);
};

// Liste mixte de strings exactes et de RegExp (wildcards)
const allowedMatchers = allowedOriginsRaw.map(toMatcher);

// Middleware CORS avec fonction de vérification
app.use(
  cors({
    origin(origin, cb) {
      // Autorise requêtes sans Origin (Thunder, cURL, SSR, health checks)
      if (!origin) return cb(null, true);

      const ok = allowedMatchers.some((m) =>
        m instanceof RegExp ? m.test(origin) : m === origin
      );

      if (ok) return cb(null, true);

      // Rejet explicite avec message clair
      const listForMsg = allowedOriginsRaw.join(", ");
      return cb(
        new Error(
          `Origin "${origin}" not allowed by CORS policy. Allowed: [${listForMsg}]`
        ),
        false
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    // status 200 pour certains environnements anciens sur preflight
    optionsSuccessStatus: 200,
  })
);

// Parseurs
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// Health
app.get("/health", (_req, res) =>
  res.status(200).json({
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
  res.status(404).json({
    ok: false,
    success: false,
    error: "Not Found",
    path: req.originalUrl,
  });
});

// Erreurs
app.use((err, _req, res, _next) => {
  console.error("💥 Global error:", err?.message || err);
  res.status(err.status || 500).json({
    ok: false,
    success: false,
    error: err.message || "Internal Error",
  });
});

(async () => {
  try {
    await connectDB();

    // Petit log utile au démarrage (sans afficher les RegExp)
    const printableOrigins = allowedOriginsRaw.join(", ");
    app.listen(PORT, () => {
      console.log(`✅ API sur http://localhost:${PORT}`);
      console.log(`🔐 CORS autorisés: ${printableOrigins || "(aucun défini)"}`);
      if (!process.env.CORS_ORIGINS) {
        console.log(
          'ℹ️  Défini via .env: CORS_ORIGINS="https://astucesmurmures.netlify.app,https://*.ton-domaine.fr"'
        );
      }
    });
  } catch (e) {
    console.error("❌ Démarrage échoué:", e);
    process.exit(1);
  }
})();

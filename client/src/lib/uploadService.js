// src/lib/uploadService.js
// ============================================================================
// 📦 Upload d’images vers Supabase Storage (bucket: blog-images)
// - 100% compatible avec ton ancien code (uploadImage / uploadAvatar)
// - Ajoute uploadImageTo(folder, file) pour gérer les dossiers : "draft" / "actualites"
// - Retourne TOUJOURS une URL publique (…/object/public/…)
// ============================================================================

import supabase from "./supabaseClient";

// ---------- util : nettoyer un nom de fichier --------------------------------
function sanitizeFilename(name = "image") {
  return name
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\w.-]+/g, "_");
}

// ---------- constantes -------------------------------------------------------
const BUCKET = "blog-images"; // ⬅️ ton bucket existant
const ROOT_DEFAULT = "blogs"; // ⬅️ racine par défaut (ancienne compat)

// ---------- util : fabrique un chemin unique --------------------------------
function buildPath(rootFolder, originalName = "image.jpg") {
  const original = originalName || "image.jpg";
  const ext = original.includes(".") ? original.split(".").pop() : "jpg";
  const base = original.replace(/\.[^.]+$/, "");
  const safeBase = sanitizeFilename(base);
  const filename = `${Date.now()}_${safeBase}.${ext}`;
  return `${rootFolder}/${filename}`; // ex: "draft/1699999999_mon_image.jpg"
}

// ---------- cœur : upload + public URL --------------------------------------
async function uploadAndGetPublicUrlTo(folder, file) {
  if (!file) return null;

  // 1) Chemin final (folder = "draft" | "actualites" | "blogs"…)
  const filePath = buildPath(folder, file.name);

  // 2) Upload
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (uploadError) {
    console.error("[uploadService] Erreur upload:", uploadError);
    throw new Error("UPLOAD_FAILED");
  }

  // 3) URL publique
  const { data, error: urlError } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  if (urlError || !data?.publicUrl) {
    console.error("[uploadService] Erreur publicUrl:", urlError);
    throw new Error("PUBLIC_URL_FAILED");
  }

  return data.publicUrl; // ✅ contient bien /object/public/
}

// ============================================================================
// 🔹 API publique du service
// ============================================================================

// 🧩 Compatible avec ton code existant (racine "blogs/")
export async function uploadImage(file) {
  return uploadAndGetPublicUrlTo(ROOT_DEFAULT, file);
}
export async function uploadAvatar(file) {
  return uploadAndGetPublicUrlTo(ROOT_DEFAULT, file);
}

// 🆕 Flexible : permet d’uploader dans un dossier dédié ("draft" ou "actualites")
export async function uploadImageTo(folder, file) {
  // banalise la casse par sécurité
  const root = String(folder || "").trim() || ROOT_DEFAULT;
  return uploadAndGetPublicUrlTo(root, file);
}

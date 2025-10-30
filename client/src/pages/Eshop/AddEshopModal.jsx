// src/pages/Eshop/AddEshopModal.jsx
// ============================================================================
// Modale d'ajout / édition de produit (Admin).
// - Upload image via TON client Supabase (src/lib/supabaseClient.js)
// - Champs : name, description, price, stock, categories, color, imageUrl
// - Mode "edit" si prop `initial` est définie (pré-remplit et update au submit)
// ============================================================================

import { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import { createProduct, updateProduct } from "../../api/eshop";

const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "blog-images";

export default function AddEshopModal({
  open,
  onClose,
  onCreated,
  initial = null,
}) {
  // ----------- état formulaire -----------
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categories, setCategories] = useState("");
  const [color, setColor] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const isEdit = !!initial; // true si édition

  // Pré-remplir en mode édition
  useEffect(() => {
    if (!open) return;
    setErr("");
    if (initial) {
      setName(initial.name || "");
      setDescription(initial.description || "");
      setPrice(String(initial.price ?? ""));
      setStock(String(initial.stock ?? ""));
      setCategories(
        Array.isArray(initial.categories) ? initial.categories.join(", ") : ""
      );
      setColor(initial.color || "");
      setFile(null);
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setCategories("");
      setColor("");
      setFile(null);
    }
  }, [open, initial]);

  if (!open) return null;

  // Validation courte
  const validate = () => {
    if (!name.trim()) return "Le nom est requis";
    if (!price || isNaN(Number(price))) return "Prix invalide";
    if (stock !== "" && isNaN(Number(stock))) return "Stock invalide";
    return "";
  };

  // Upload image -> URL publique
  const uploadToSupabase = async (f) => {
    if (!f) return initial?.imageUrl || "";
    const path = `eshop/${Date.now()}-${encodeURIComponent(f.name)}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, f, { upsert: true });
    if (error) throw new Error(error.message || "Upload échoué");
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return pub?.publicUrl || "";
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    const v = validate();
    if (v) return setErr(v);

    setBusy(true);
    try {
      // 1) Upload éventuel
      const imageUrl = await uploadToSupabase(file);

      // 2) Payload
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        stock: stock === "" ? 0 : Number(stock),
        categories: categories
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        color: color.trim(),
        imageUrl,
      };

      // 3) Create ou Update
      if (isEdit) {
        await updateProduct(initial._id, payload);
      } else {
        await createProduct(payload);
      }

      // 4) Refresh parent
      onCreated?.();
      onClose?.();
    } catch (e) {
      setErr(e.message || "Échec enregistrement produit");
    } finally {
      setBusy(false);
    }
  };

  // Render
  return (
    <div className="fixed inset-0 z-[9999]">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* carte */}
      <div className="relative z-10 max-w-2xl mx-auto my-8 bg-[#f6f1e4] rounded-2xl border border-[#e0ecc4] shadow-2xl">
        <div className="px-5 py-4 border-b border-[#e0ecc4] bg-gradient-to-r from-amber-100 to-orange-50 rounded-t-2xl">
          <h3 className="text-lg font-semibold text-[#1b2a1b]">
            {isEdit ? "Modifier le produit" : "Ajouter un produit"}
          </h3>
        </div>

        <form className="p-5 space-y-4" onSubmit={handleSubmit}>
          {err && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800">
              {err}
            </div>
          )}

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-[#1b2a1b] mb-1">
              Nom
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-white border border-[#e0ecc4] px-3 py-2 shadow"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#1b2a1b] mb-1">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl bg-white border border-[#e0ecc4] px-3 py-2 shadow"
            />
          </div>

          {/* Ligne prix/stock/couleur */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1b2a1b] mb-1">
                Prix (€)
              </label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl bg-white border border-[#e0ecc4] px-3 py-2 shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1b2a1b] mb-1">
                Stock
              </label>
              <input
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full rounded-xl bg-white border border-[#e0ecc4] px-3 py-2 shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1b2a1b] mb-1">
                Couleur
              </label>
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full rounded-xl bg-white border border-[#e0ecc4] px-3 py-2 shadow"
                placeholder="ex: vert sauge"
              />
            </div>
          </div>

          {/* Catégories */}
          <div>
            <label className="block text-sm font-medium text-[#1b2a1b] mb-1">
              Catégories (séparées par des virgules)
            </label>
            <input
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              className="w-full rounded-xl bg-white border border-[#e0ecc4] px-3 py-2 shadow"
              placeholder="yoga, respiration, massage"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-[#1b2a1b] mb-1">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl bg-white border border-[#e0ecc4] px-3 py-2 shadow file:mr-3 file:rounded-lg file:border file:px-3 file:py-1 file:bg-[#f6f1e4]"
            />
            {isEdit && !file && initial?.imageUrl && (
              <p className="text-xs text-[#355235] mt-1">
                Image actuelle conservée.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white text-[#1b2a1b] border border-[#e0ecc4] shadow hover:scale-[1.01]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow hover:scale-[1.02] disabled:opacity-60"
            >
              {busy ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

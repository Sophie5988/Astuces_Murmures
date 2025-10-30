// src/pages/Eshop/EditEshopModal.jsx
// ============================================================================
// Modale d'édition/suppression (Admin).
// - Pré-remplit le produit
// - Permet: modifier (PUT) ou supprimer (DELETE)
// ============================================================================

import { useState, useEffect } from "react";
import { updateProduct, deleteProduct } from "../../api/eshop";

export default function EditEshopModal({
  open,
  onClose,
  product,
  onUpdated,
  onDeleted,
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categories: "",
    color: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open || !product) return;
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      categories: Array.isArray(product.categories)
        ? product.categories.join(", ")
        : "",
      color: product.color || "",
    });
    setErr("");
  }, [open, product]);

  if (!open || !product) return null;

  const save = async () => {
    setBusy(true);
    setErr("");
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: form.stock === "" ? 0 : Number(form.stock),
        categories: form.categories
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        color: form.color.trim(),
      };
      await updateProduct(product._id, payload);
      onUpdated?.();
      onClose?.();
    } catch (e) {
      setErr(e.message || "Échec de modification");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Supprimer ce produit ?")) return;
    setBusy(true);
    setErr("");
    try {
      await deleteProduct(product._id);
      onDeleted?.();
      onClose?.();
    } catch (e) {
      setErr(e.message || "Échec de suppression");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 max-w-2xl mx-auto my-8 bg-[#f6f1e4] rounded-2xl border border-[#e0ecc4] shadow-2xl">
        <div className="px-5 py-4 border-b border-[#e0ecc4] bg-gradient-to-r from-amber-100 to-orange-50 rounded-t-2xl">
          <h3 className="text-lg font-semibold text-[#1b2a1b]">
            Modifier / Supprimer
          </h3>
        </div>

        <div className="p-5 space-y-4">
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
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
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
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-xl bg-white border border-[#e0ecc4] px-3 py-2 shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1b2a1b] mb-1">
                Stock
              </label>
              <input
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full rounded-xl bg-white border border-[#e0ecc4] px-3 py-2 shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1b2a1b] mb-1">
                Couleur
              </label>
              <input
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full rounded-xl bg-white border border-[#e0ecc4] px-3 py-2 shadow"
              />
            </div>
          </div>

          {/* Catégories */}
          <div>
            <label className="block text-sm font-medium text-[#1b2a1b] mb-1">
              Catégories
            </label>
            <input
              value={form.categories}
              onChange={(e) => setForm({ ...form, categories: e.target.value })}
              className="w-full rounded-xl bg-white border border-[#e0ecc4] px-3 py-2 shadow"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#e0ecc4] bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white text-[#1b2a1b] border border-[#e0ecc4] shadow hover:scale-[1.01]"
          >
            Annuler
          </button>
          <button
            onClick={remove}
            disabled={busy}
            className="px-5 py-2 rounded-xl bg-red-600 text-white shadow hover:scale-[1.02] disabled:opacity-60"
          >
            Supprimer
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow hover:scale-[1.02] disabled:opacity-60"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

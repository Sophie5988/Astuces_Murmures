// src/pages/Actualites/components/TarifsModal.jsx
// ============================================================================
// Mini-modale "Tarifs"
// - Liste éditable { label, price } avec ajout/suppression
// - Retourne la liste via onSave
// ============================================================================

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

export default function TarifsModal({ open, tarifs = [], onClose, onSave }) {
  const [rows, setRows] = useState(
    tarifs.length ? tarifs : [{ label: "", price: "" }]
  );

  const setRow = (i, k, v) =>
    setRows((r) => r.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));
  const addRow = () => setRows((r) => [...r, { label: "", price: "" }]);
  const delRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));

  const save = () => {
    const clean = rows
      .map((r) => ({ label: r.label.trim(), price: r.price.trim() }))
      .filter((r) => r.label || r.price);
    onSave?.(clean);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-emerald-200">
          <div className="flex items-center justify-between p-4 border-b border-emerald-200">
            <h3 className="text-xl font-semibold text-emerald-900">Tarifs</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-emerald-800" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {rows.map((r, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <input
                  value={r.label}
                  onChange={(e) => setRow(i, "label", e.target.value)}
                  placeholder="Intitulé (ex: Entrée adulte)"
                  className="col-span-7 border rounded-lg px-3 py-2 bg-emerald-50 border-emerald-200"
                />
                <input
                  value={r.price}
                  onChange={(e) => setRow(i, "price", e.target.value)}
                  placeholder="Prix (ex: 12 €)"
                  className="col-span-4 border rounded-lg px-3 py-2 bg-emerald-50 border-emerald-200"
                />
                <button
                  type="button"
                  onClick={() => delRow(i)}
                  className="col-span-1 inline-flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addRow}
              className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" /> Ajouter un tarif
            </button>
          </div>

          <div className="p-4 border-t border-emerald-200 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-50 hover:bg-white border"
            >
              Annuler
            </button>
            <button
              onClick={save}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/pages/Actualites/components/HorairesModal.jsx
// ============================================================================
// Mini-modale "Horaires semaine"
// - Utilisable pour Événement ET Commerce (plus de restriction)
// - Retourne un objet { Lundi: '...', Mardi: '...', ... } via onSave
// - Tailwind "zen" : fond blanc, ombre douce, arrondis
// ============================================================================

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

export default function HorairesModal({
  open, // bool : ouverture de la mini-modale
  value = {}, // objet d'horaires pour édition
  onClose, // callback fermeture
  onSave, // callback de sauvegarde (retourne l'objet 'local')
}) {
  const [local, setLocal] = useState({});

  useEffect(() => {
    setLocal(value || {});
  }, [value, open]);

  const setField = (day, val) => setLocal((s) => ({ ...s, [day]: val }));
  const save = () => onSave?.(local);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000]">
      {/* Overlay sombre flouté */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Boîte modale */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-emerald-200">
          {/* Entête */}
          <div className="flex items-center justify-between p-4 border-b border-emerald-200">
            <h3 className="text-xl font-semibold text-emerald-900">
              Horaires semaine
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-emerald-800" />
            </button>
          </div>

          {/* Corps */}
          <div className="p-4 space-y-3">
            {DAYS.map((d) => (
              <div key={d} className="grid grid-cols-4 gap-2 items-center">
                <div className="text-sm text-emerald-900 font-medium">{d}</div>
                <input
                  type="text"
                  value={local[d] || ""}
                  onChange={(e) => setField(d, e.target.value)}
                  placeholder='ex: "09:00-12:00 / 14:00-18:00" ou "Fermé"'
                  className="col-span-3 border rounded-lg px-3 py-2 bg-emerald-50 border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            ))}
          </div>

          {/* Pied */}
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

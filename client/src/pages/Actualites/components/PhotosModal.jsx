// src/pages/Actualites/components/PhotosModal.jsx
// ============================================================================
// Mini-modale "Photos multiples" (≤ 3 fichiers)
// - Gère les fichiers localement (File) + génère des URLs locales pour preview
// - Retourne { files, previews } via onSave
// ============================================================================

import { useEffect, useState } from "react";
import { X, Upload, Trash2 } from "lucide-react";

export default function PhotosModal({
  open,
  files = [],
  previews = [],
  onClose,
  onSave,
}) {
  const [listFiles, setListFiles] = useState(files);
  const [listPreviews, setListPreviews] = useState(previews);

  useEffect(() => {
    setListFiles(files);
    setListPreviews(previews);
  }, [files, previews, open]);

  const addFiles = (e) => {
    const f = Array.from(e.target.files || []);
    if (!f.length) return;
    // Max 3 fichiers
    const mergedFiles = [...listFiles, ...f].slice(0, 3);
    const newPreviews = [
      ...listPreviews,
      ...f.map((file) => URL.createObjectURL(file)),
    ].slice(0, 3);
    // Libère d’anciennes URLs si on dépasse
    if (newPreviews.length > 3) {
      newPreviews.slice(3).forEach((u) => {
        if (String(u).startsWith("blob:"))
          try {
            URL.revokeObjectURL(u);
          } catch {}
      });
    }
    setListFiles(mergedFiles);
    setListPreviews(newPreviews);
  };

  const removeAt = (idx) => {
    const nf = listFiles.filter((_, i) => i !== idx);
    const np = listPreviews.filter((_, i) => i !== idx);
    const old = listPreviews[idx];
    if (old && String(old).startsWith("blob:"))
      try {
        URL.revokeObjectURL(old);
      } catch {}
    setListFiles(nf);
    setListPreviews(np);
  };

  const save = () => onSave?.(listFiles, listPreviews);

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
            <h3 className="text-xl font-semibold text-emerald-900">
              Photos (jusqu’à 3)
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-emerald-800" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div
              className="border-2 border-dashed border-emerald-300 rounded-xl p-6 text-center bg-emerald-50"
              onClick={() => document.getElementById("pm-input")?.click()}
            >
              <Upload className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <div className="text-emerald-900 font-medium">
                Cliquez pour sélectionner 1 à 3 images
              </div>
              <div className="text-emerald-700 text-sm">
                PNG, JPG, JPEG, WEBP
              </div>
              <input
                id="pm-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={addFiles}
              />
            </div>

            {!!listPreviews.length && (
              <div className="grid grid-cols-3 gap-2">
                {listPreviews.map((u, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={u}
                      alt={`p${i}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeAt(i)}
                      className="absolute top-1 right-1 w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 hidden group-hover:flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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

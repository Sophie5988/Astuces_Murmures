// src/pages/Admin/AdminEditModal.jsx
// ============================================================================
// Modale d'édition (Admin) pour améliorer une actualité avant ou après validation.
// - Focus SEO : mots-clés (keywords), phrase d'accroche, titre/nom, contenu.
// - Simple, zen, Tailwind + commentaires.
// - On renvoie le patch via onSave(patch) ; le parent fait l'appel API.
// ============================================================================

import { useEffect, useState } from "react";
import { X, Tag } from "lucide-react";

export default function AdminEditModal({ open, onClose, actualite, onSave }) {
  const [form, setForm] = useState({
    // Champs SEO prioritaires
    keywords: [],
    phraseAccroche: "",
    contenu: "",
    titreEvenement: "",
    nomMagasin: "",
  });

  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    if (!open || !actualite) return;
    setForm({
      keywords: Array.isArray(actualite.keywords) ? actualite.keywords : [],
      phraseAccroche: actualite.phraseAccroche || "",
      contenu: actualite.contenu || "",
      titreEvenement: actualite.titreEvenement || "",
      nomMagasin: actualite.nomMagasin || "",
    });
    setKeywordInput("");
  }, [open, actualite]);

  if (!open || !actualite) return null;

  const addKeyword = () => {
    const k = keywordInput.trim();
    if (!k) return;
    if (!form.keywords.includes(k))
      setForm((f) => ({ ...f, keywords: [...f.keywords, k] }));
    setKeywordInput("");
  };
  const removeKeyword = (k) =>
    setForm((f) => ({ ...f, keywords: f.keywords.filter((x) => x !== k) }));

  const handleSave = () => {
    const patch = {
      keywords: form.keywords,
      phraseAccroche: form.phraseAccroche,
      contenu: form.contenu,
      // on envoie le champ pertinent selon le type
      ...(actualite.type === "Evenement"
        ? { titreEvenement: form.titreEvenement }
        : {}),
      ...(actualite.type === "Commerce" || actualite.type === "Boutique"
        ? { nomMagasin: form.nomMagasin }
        : {}),
    };
    onSave?.(patch);
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* carte */}
      <div className="relative z-10 max-w-2xl mx-auto my-10 bg-[#f6f9ee] rounded-2xl border border-[#e0ecc4] shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e0ecc4] bg-gradient-to-r from-emerald-100 to-green-50">
          <h3 className="text-lg font-semibold text-[#1b2a1b]">
            Modifier (SEO)
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1b2a1b] shadow hover:scale-105"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* body */}
        <div className="p-5 space-y-4">
          {/* Titre/Nom */}
          {actualite.type === "Evenement" ? (
            <div>
              <label className="block text-sm font-medium text-[#1b2a1b] mb-1">
                Titre de l’événement
              </label>
              <input
                value={form.titreEvenement}
                onChange={(e) =>
                  setForm((f) => ({ ...f, titreEvenement: e.target.value }))
                }
                className="w-full rounded-xl bg-white border border-[#e0ecc4] px-3 py-2 shadow"
                placeholder="Titre optimisé (inclure un mot-clé si possible)"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-[#1b2a1b] mb-1">
                Nom du commerce
              </label>
              <input
                value={form.nomMagasin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nomMagasin: e.target.value }))
                }
                className="w-full rounded-xl bg-white border border-[#e0ecc4] px-3 py-2 shadow"
                placeholder="Nom optimisé (clair et descriptif)"
              />
            </div>
          )}

          {/* Accroche */}
          <div>
            <label className="block text-sm font-medium text-[#1b2a1b] mb-1">
              Phrase d’accroche
            </label>
            <input
              value={form.phraseAccroche}
              onChange={(e) =>
                setForm((f) => ({ ...f, phraseAccroche: e.target.value }))
              }
              className="w-full rounded-xl bg-white border border-[#e0ecc4] px-3 py-2 shadow"
              placeholder="Phrase courte et attractive avec 1 mot-clé"
            />
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-sm font-medium text-[#1b2a1b] mb-1">
              Contenu
            </label>
            <textarea
              rows={5}
              value={form.contenu}
              onChange={(e) =>
                setForm((f) => ({ ...f, contenu: e.target.value }))
              }
              className="w-full rounded-xl bg-white border border-[#e0ecc4] px-3 py-2 shadow"
              placeholder="Développer une description claire, bénéfices, CTA léger."
            />
          </div>

          {/* Keywords */}
          <div className="bg-white border border-[#e0ecc4] rounded-xl p-3">
            <div className="flex items-center gap-2 text-[#1b2a1b] font-medium">
              <Tag className="w-4 h-4 text-indigo-600" /> Mots-clés (SEO)
            </div>
            <p className="text-sm text-[#355235] mt-1">
              Aide à la recherche : privilégier 3–8 mots pertinents (“yoga”,
              “respiration”, “méditation guidée”…).
            </p>
            <div className="mt-2 flex gap-2">
              <input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
                className="flex-1 rounded-lg bg-[#f6f9ee] border border-[#e0ecc4] px-3 py-2 shadow"
                placeholder="Ajouter un mot-clé puis Entrée"
              />
              <button
                onClick={addKeyword}
                type="button"
                className="px-3 py-2 rounded-lg bg-[#bcd47f] shadow hover:bg-[#9fb565]"
              >
                Ajouter
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {form.keywords.map((k) => (
                <span
                  key={k}
                  className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs inline-flex items-center gap-2"
                >
                  {k}
                  <button
                    onClick={() => removeKeyword(k)}
                    className="opacity-70 hover:opacity-100"
                    aria-label={`retirer ${k}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#e0ecc4] bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white text-[#1b2a1b] border border-[#e0ecc4] shadow hover:scale-[1.01]"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow hover:scale-[1.02]"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

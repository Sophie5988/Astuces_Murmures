// src/pages/Admin/AdminRejectModal.jsx
// ============================================================================
// Modale "Refuser" pour l'admin : sélection de motifs + note optionnelle.
// - Affiche la liste fournie par Loulou (1..15) + champ message libre.
// - Renvoie { reasons: string[], note?: string } via onSubmit.
// - Design Tailwind "zen": beige, ombres, hover/scale.
// ============================================================================

import { useEffect, useState } from "react";
import { X } from "lucide-react";

// ---------------------------------------------------------------------------
// Liste des motifs officiels (numérotés). On garde exactement les libellés.
// ---------------------------------------------------------------------------
const REASONS = [
  "Plagiat : L’article contient du contenu copié sans attribution appropriée.",
  "Qualité du contenu : L’article ne répond pas aux normes de qualité requises, que ce soit au niveau de la rédaction ou de l’argumentation.",
  "Thème non pertinent : Le sujet abordé ne correspond pas à la ligne éditoriale ou au public cible du blog.",
  "Données inexactes : L’article contient des informations erronées ou non vérifiées.",
  "Incohérences : Des contradictions au sein du texte ou par rapport à d’autres articles déjà publiés sur le blog.",
  "Manque de sources : Absence de références ou de sources crédibles pour étayer les affirmations.",
  "Longueur inappropriée : L’article est trop court ou trop long par rapport aux standards du blog.",
  "Style inadapté : Le ton ou le style de l’article ne correspond pas à l’image de marque du blog.",
  "SEO inapproprié : Non-respect des bonnes pratiques de référencement (choix de mots-clés, balises, etc.).",
  "Problèmes de structure : Manque de clarté dans l’organisation de l’article (paragraphe mal structuré, absence d’introduction ou de conclusion).",
  "Langue et grammaire : Présence de fautes d’orthographe ou de grammaire qui nuisent à la lisibilité.",
  "Contenu trop promotionnel : L’article est trop axé sur la promotion d’un produit ou d’un service au détriment de la valeur informative.",
];

export default function AdminRejectModal({ open, onClose, onSubmit, item }) {
  // -------------------------------------------------------------------------
  // États locaux : sélection (Set pour éviter doublons) + note libre
  // -------------------------------------------------------------------------
  const [selected, setSelected] = useState(new Set());
  const [note, setNote] = useState("");

  // Remise à zéro à l'ouverture
  useEffect(() => {
    if (!open) return;
    setSelected(new Set());
    setNote("");
  }, [open, item]);

  // Si la modale est fermée : on ne rend rien (pas de DOM inutile)
  if (!open) return null;

  // Ajoute/retire un motif
  const toggle = (r) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r);
      else next.add(r);
      return next;
    });
  };

  // Validation / submit
  const handleSubmit = () => {
    const reasons = Array.from(selected);
    if (reasons.length === 0 && !note.trim()) {
      // On exige au moins 1 motif OU une note (pour ne pas envoyer un refus vide)
      alert("Merci de sélectionner au moins un motif ou d’ajouter une note.");
      return;
    }
    onSubmit?.({ reasons, note: note.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Carte */}
      <div className="relative z-10 max-w-3xl mx-auto my-10 bg-[#f6f1e4] rounded-2xl border border-[#e0ecc4] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e0ecc4] bg-gradient-to-r from-rose-100 to-orange-50">
          <h3 className="text-lg font-semibold text-[#1b2a1b]">
            Refuser — Motifs
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1b2a1b] shadow hover:scale-105"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Rappel de l'élément ciblé */}
          {item && (
            <div className="text-sm text-[#355235]">
              Élément :{" "}
              <span className="font-medium text-[#1b2a1b]">
                {item.type === "Evenement"
                  ? item.titreEvenement || "Sans titre"
                  : item.nomMagasin || "Sans nom"}
              </span>
            </div>
          )}

          {/* Liste des motifs (checkbox) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {REASONS.map((r, idx) => (
              <label
                key={idx}
                className={`flex items-start gap-2 p-3 rounded-xl border shadow cursor-pointer bg-white hover:scale-[1.01] transition-transform ${
                  selected.has(r) ? "border-red-300" : "border-[#e0ecc4]"
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selected.has(r)}
                  onChange={() => toggle(r)}
                />
                <span className="text-sm text-[#1b2a1b]">
                  {idx + 4}. {r}
                </span>
              </label>
            ))}
          </div>

          {/* Note optionnelle */}
          <div className="mt-2">
            <label className="block text-sm font-medium text-[#1b2a1b] mb-1">
              Message optionnel pour l’utilisateur
            </label>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Précisez brièvement le contexte du refus ou des pistes d’amélioration…"
              className="w-full rounded-xl bg-white border border-[#e0ecc4] px-3 py-2 shadow"
            />
            <p className="text-xs text-[#7a8a7a] mt-1">
              Ce message sera joint au refus (ex: conseils d’amélioration).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#e0ecc4] bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white text-[#1b2a1b] border border-[#e0ecc4] shadow hover:scale-[1.01]"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white shadow hover:scale-[1.02]"
          >
            Confirmer le refus
          </button>
        </div>
      </div>
    </div>
  );
}

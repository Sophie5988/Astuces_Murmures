// =====================================================================
// ➕ AddBlogModal.jsx — Formulaire d’ajout d’article
// ---------------------------------------------------------------------
// • Conserve ta logique (React Hook Form + Yup + paragraphes optionnels)
// • S'appuie sur uploadService.uploadImage(file) qui renvoie une URL publique
// • Design Tailwind cohérent
// =====================================================================

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { uploadImage } from "../../lib/uploadService"; // ➜ Doit renvoyer une URL publique
import { useBlog } from "../../context/BlogContext";
import { Plus, Trash2, Upload, X } from "lucide-react";

// ====== Validation du formulaire ======
const schema = yup.object({
  title: yup.string().required("Le titre est obligatoire"),
  hook: yup
    .string()
    .max(130, "Maximum 130 caractères")
    .required("La phrase d'accroche est obligatoire"),
  theme: yup.string().required("Le thème est obligatoire"),
  content: yup.string().required("Le contenu est obligatoire"),
  image: yup
    .mixed()
    .nullable()
    .test(
      "fileSize",
      "La taille du fichier doit être ≤ 5MB",
      (v) => !v || v.size <= 5 * 1024 * 1024
    )
    .test(
      "fileType",
      "Formats acceptés : PNG, JPG, JPEG, WEBP",
      (v) =>
        !v ||
        ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(v.type)
    ),
});

// ====== Liste des thèmes disponibles (cohérente avec Blog.jsx) ======
const themes = [
  "Rituel de L'âme",
  "Corps et harmonie",
  "Trésors du quotidien",
  "Jardin des secrets",
  "Calendrier Editorial du mois",
];

export default function AddBlogModal({ isOpen, onClose }) {
  const [dragActive, setDragActive] = useState(false); // état drag-and-drop
  const [loading, setLoading] = useState(false); // pour le bouton submit
  const [preview, setPreview] = useState(null); // preview image locale
  const [paragraphs, setParagraphs] = useState([]); // sous-paragraphes (max 5)
  const { addBlog } = useBlog(); // action du contexte

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const hookValue = watch("hook", "");

  // ➕ Ajouter un paragraphe
  const addParagraph = () => {
    if (paragraphs.length < 5)
      setParagraphs([...paragraphs, { subtitle: "", content: "" }]);
  };

  // 🗑️ Supprimer un paragraphe
  const removeParagraph = (index) => {
    setParagraphs(paragraphs.filter((_, i) => i !== index));
  };

  // ✏️ Modifier paragraphe
  const updateParagraph = (index, field, value) => {
    const updated = [...paragraphs];
    updated[index][field] = value;
    setParagraphs(updated);
  };

  // ✅ Soumission du formulaire
  const onSubmit = async (data) => {
    setLoading(true);
    let imageUrl = null;

    try {
      // Si une image est fournie ➜ upload vers Supabase Storage
      if (data.image) {
        imageUrl = await uploadImage(data.image); // ➜ Retourne une URL publique (corrigé dans uploadService.js)
      }

      // Reconstruire le contenu avec sous-paragraphes
      let fullContent = data.content;
      if (paragraphs.length > 0) {
        const extra = paragraphs
          .map((p) => `\n\n**${p.subtitle}**\n${p.content}`)
          .join("");
        fullContent += extra;
      }

      // Appel contexte pour créer le blog
      await addBlog({
        title: data.title,
        hook: data.hook,
        theme: data.theme,
        content: fullContent,
        image: imageUrl, // ➜ String (URL publique) ou null
      });

      // Reset du form
      reset();
      setParagraphs([]);
      setPreview(null);
      onClose();
    } catch (err) {
      console.error("Erreur de publication:", err);
      alert(
        "Impossible de publier l’article. Vérifie la configuration Supabase et réessaie."
      );
    } finally {
      setLoading(false);
    }
  };

  // ====== Drag & Drop ======
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setValue("image", file, { shouldValidate: true });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file, { shouldValidate: true });
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setValue("image", null, { shouldValidate: true });
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  const cancelForm = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setParagraphs([]);
    reset();
    onClose();
  };

  // ➜ Nettoyage preview à la destruction du composant
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-auto">
      {/* Fond sombre flou (fermeture au clic) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Carte modale */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-gradient-to-br from-green-100 to-emerald-50 rounded-3xl shadow-2xl border-2 border-green-200 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-green-200">
            <div>
              <h2 className="text-3xl font-serif font-bold text-green-800">
                ✨ Nouvel article
              </h2>
              <p className="text-green-700 mt-1">
                Partagez votre inspiration zen avec la communauté
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-green-700 hover:text-green-900 transition-all hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="space-y-6">
              {/* Titre */}
              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Titre de l'article *
                </label>
                <input
                  type="text"
                  placeholder="Un titre qui inspire et captive..."
                  {...register("title")}
                  className={`w-full border-2 rounded-xl p-4 focus:outline-none focus:ring-4 transition-all bg-rose-50 ${
                    errors.title
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : "border-green-300 focus:border-green-500 focus:ring-green-100"
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Accroche */}
              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Phrase d'accroche * ({hookValue.length}/130)
                </label>
                <input
                  type="text"
                  placeholder="Une phrase courte qui donne envie de lire..."
                  maxLength={130}
                  {...register("hook")}
                  className={`w-full border-2 rounded-xl p-4 focus:outline-none focus:ring-4 transition-all bg-rose-50 ${
                    errors.hook
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : "border-green-300 focus:border-green-500 focus:ring-green-100"
                  }`}
                />
                {errors.hook && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.hook.message}
                  </p>
                )}
              </div>

              {/* Thème */}
              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Thème *
                </label>
                <select
                  {...register("theme")}
                  className={`w-full border-2 rounded-xl p-4 focus:outline-none focus:ring-4 transition-all bg-rose-50 ${
                    errors.theme
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : "border-green-300 focus:border-green-500 focus:ring-green-100"
                  }`}
                >
                  <option value="">Choisissez un thème...</option>
                  {themes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.theme && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.theme.message}
                  </p>
                )}
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Image d'illustration
                </label>

                {/* Zone drag & drop si aucune preview */}
                {!preview ? (
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer bg-rose-50 ${
                      dragActive
                        ? "border-green-500 bg-green-50"
                        : "border-green-300 hover:border-green-400"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() =>
                      document.getElementById("file-input").click()
                    }
                  >
                    <Upload className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-green-800">
                      Glissez votre image ici
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      ou cliquez pour parcourir
                    </p>
                    <p className="text-xs text-green-500 mt-2">
                      PNG, JPG, JPEG, WEBP — 5MB max
                    </p>
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  // Preview + supprimer
                  <div className="border-2 border-green-300 rounded-xl p-4 bg-rose-50">
                    <div className="flex items-center gap-4">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-green-800">
                          Image sélectionnée ✓
                        </p>
                        <p className="text-sm text-green-600">
                          Prête pour publication
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-all hover:scale-110"
                        aria-label="Supprimer l'image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                {errors.image && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.image.message}
                  </p>
                )}
              </div>

              {/* Contenu principal */}
              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Contenu principal *
                </label>
                <textarea
                  rows="6"
                  placeholder="Rédigez le corps de votre article..."
                  {...register("content")}
                  className={`w-full border-2 rounded-xl p-4 focus:outline-none focus:ring-4 transition-all resize-none bg-rose-50 ${
                    errors.content
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : "border-green-300 focus:border-green-500 focus:ring-green-100"
                  }`}
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.content.message}
                  </p>
                )}
              </div>

              {/* Paragraphes additionnels */}
              <div className="border-t border-green-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-green-800">
                    Paragraphes additionnels
                  </h3>
                  <button
                    type="button"
                    onClick={addParagraph}
                    disabled={paragraphs.length >= 5}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter paragraphe ({paragraphs.length}/5)
                  </button>
                </div>

                <div className="space-y-4">
                  {paragraphs.map((p, index) => (
                    <div
                      key={index}
                      className="border-2 border-green-200 rounded-xl p-4 bg-white/60"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-green-800">
                          Paragraphe {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeParagraph(index)}
                          className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-all hover:scale-110"
                          aria-label="Supprimer le paragraphe"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Sous-titre du paragraphe..."
                          value={p.subtitle}
                          onChange={(e) =>
                            updateParagraph(index, "subtitle", e.target.value)
                          }
                          className="w-full border border-green-200 rounded-lg p-3 focus:outline-none focus:border-green-500 bg-rose-50"
                        />
                        <textarea
                          rows="3"
                          placeholder="Contenu du paragraphe..."
                          value={p.content}
                          onChange={(e) =>
                            updateParagraph(index, "content", e.target.value)
                          }
                          className="w-full border border-green-200 rounded-lg p-3 focus:outline-none focus:border-green-500 resize-none bg-rose-50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note validation */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <p className="text-amber-800 text-sm text-center font-medium">
                  📝 Tous les articles sont soumis à validation par l'équipe du
                  site avant publication
                </p>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-top border-green-200">
              <button
                type="button"
                onClick={cancelForm}
                className="px-6 py-3 rounded-xl bg-white/80 text-green-700 font-semibold hover:bg-white transition-all hover:scale-105"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Publier l'article
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

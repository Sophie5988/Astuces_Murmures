// src/pages/Profile/Profile.jsx
import { useRef, useState } from "react";
import defaultAvatar from "../../assets/images/default_avatar.jpg";
import { useAuth } from "../../context/AuthContext";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { uploadAvatar } from "../../lib/uploadService";
import { updateUserProfile } from "../../api/auth.api";
import bgLogin from "../../assets/images/login.webp"; // image de fond

export default function Profile() {
  const { userConnected, refreshUser } = useAuth(); // 👈 on ajoute refreshUser
  const fileInputRef = useRef(null);

  // --- Gestion des états pour l'avatar ---
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(
    userConnected?.avatar || defaultAvatar
  );
  const [objectUrl, setObjectUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // --- Champs profil (ajouts) ---
  const [firstName, setFirstName] = useState(userConnected?.firstName || "");
  const [lastName, setLastName] = useState(userConnected?.lastName || "");
  const [address, setAddress] = useState(userConnected?.address || "");
  const [postalCode, setPostalCode] = useState(userConnected?.postalCode || "");
  const [city, setCity] = useState(userConnected?.city || "");
  const [phone, setPhone] = useState(userConnected?.phone || "");

  // --- Gestion du formulaire mot de passe ---
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- États de feedback utilisateur ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // <- null au départ
  const [success, setSuccess] = useState(null); // <- null au départ
  const [passwordError, setPasswordError] = useState(null);

  /**
   * Vérifie et prépare le fichier image (avatar)
   */
  const processFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image");
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Image trop lourde (max: 5 Mo)");
      return;
    }
    if (objectUrl) URL.revokeObjectURL(objectUrl);

    const url = URL.createObjectURL(file);
    setPreview(url);
    setObjectUrl(url);
    setAvatarFile(file);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /**
   * Vérification si le formulaire mot de passe est complet
   */
  const isPasswordFormComplete =
    currentPassword.trim() !== "" &&
    newPassword.trim() !== "" &&
    confirmPassword.trim() !== "";

  // 👇 Détection d’un changement dans les infos civiles
  const isInfoChanged =
    firstName !== (userConnected?.firstName || "") ||
    lastName !== (userConnected?.lastName || "") ||
    address !== (userConnected?.address || "") ||
    postalCode !== (userConnected?.postalCode || "") ||
    city !== (userConnected?.city || "") ||
    phone !== (userConnected?.phone || "");

  // Conditions d’activation du bouton Enregistrer
  const canSubmit =
    (avatarFile || isPasswordFormComplete || isInfoChanged) && !loading;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    processFile(file);
  };

  /**
   * Envoi du formulaire (mise à jour profil)
   */
  const submit = async () => {
    setError(null);
    setSuccess(null);
    setPasswordError(null);

    if (!canSubmit) {
      setError("Aucune modification à sauvegarder");
      return;
    }

    if (isPasswordFormComplete && newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe sont différents");
      return;
    }

    setLoading(true);
    try {
      let avatarUrl;

      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      const payload = {};

      // Avatar / Password
      if (avatarUrl) payload.avatar = avatarUrl;
      if (isPasswordFormComplete) {
        payload.newPassword = newPassword;
        payload.currentPassword = currentPassword;
      }

      // 👇 Infos civiles
      payload.firstName = firstName;
      payload.lastName = lastName;
      payload.address = address;
      payload.postalCode = postalCode;
      payload.city = city;
      payload.phone = phone;

      const updatedUser = await updateUserProfile(payload);

      if (!updatedUser?.message) {
        setSuccess("Profil mis à jour");

        // Si avatar changé, on met l’aperçu sur l’URL finale
        if (avatarUrl) {
          setPreview(avatarUrl);
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            setObjectUrl(null);
          }
          setAvatarFile(null);
        }

        // Reset password form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordForm(false);

        // 👇 IMPORTANT : rafraîchir le contexte -> header voit l’avatar
        await refreshUser();
      } else {
        setError(updatedUser.message);
      }
    } catch (error) {
      console.log(error);
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bgLogin})` }}
    >
      <div className="max-w-3xl bg-[#ddd9c4] w-400 h-250 mx-auto mt-10 p-6 rounded-2xl shadow-[5px_5px_5px_rgba(0,0,0,0.65)] hover:shadow-[8px_8px_8px_rgba(0,0,0,0.7)]">
        <h1 className="text-2xl font-bold mb-6 text-center">Mon profil</h1>

        <div className="mb-6">
          <label className="block text-base font-semibold text-gray-700 mb-4">
            Bonjour {userConnected?.username || "Utilisateur"}
          </label>

          <div className="flex justify-center mb-4">
            <img
              src={preview}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover shadow-md"
            />
          </div>

          {/* Zone drag & drop */}
          <div className="flex justify-center mb-6 mt-4">
            <button
              className={`flex justify-center border-3 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-gray-50"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <p className="text-gray-600">Glissez une image ou cliquez ici</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </button>
          </div>

          {/* EMAIL (lecture seule) */}
          <div className="my-6">
            <label className="block text-sm font-semibold text-gray-700 mt-6">
              Email
            </label>
            <input
              type="email"
              value={userConnected?.email || ""}
              disabled
              className="w-full border rounded-lg p-3 bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* 👇 INFOS CIVILES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prénom
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Votre prénom"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Votre nom"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Votre adresse"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Code postal
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="75001"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ville
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Paris"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="06 12 34 56 78"
              />
            </div>
          </div>

          {/* MOT DE PASSE */}
          {userConnected?.provider !== "google" && (
            <div className="mb-6 mt-6">
              <button
                type="button"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                <span className="font-semibold text-gray-700">
                  🔑 Modifier mon mot de passe
                </span>
                <span>
                  {!showPasswordForm ? <FaArrowDown /> : <FaArrowUp />}
                </span>
              </button>

              {showPasswordForm && (
                <div className="mt-4 space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      className="w-full border rounded-lg p-3"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      className="w-full border rounded-lg p-3"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirmation du nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      className="w-full border rounded-lg p-3"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  {passwordError && (
                    <p className="text-red-600">{passwordError}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* FEEDBACK */}
          {error && <p className="text-red-600 mb-2">{error}</p>}
          {success && <p className="text-green-600 mb-2">{success}</p>}

          {/* BOUTON */}
          <button
            type="button"
            disabled={!canSubmit}
            className={`text-white px-6 py-2 rounded-lg ${
              canSubmit
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            onClick={submit}
          >
            {loading ? "⏳ En cours ..." : "Enregistrer les modifications"}
          </button>

          {/* SECTION BLOGS */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Mes blogs notés</h2>
            <p className="text-gray-500">Aucun blog noté pour l’instant.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

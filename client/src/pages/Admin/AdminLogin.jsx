// client/src/pages/Admin/AdminLogin.jsx
// ============================================================================
// Ecran de connexion admin — corrige l’URL d’appel (passe par VITE_SERVER_URL)
// ============================================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../../api/adminAuth"; // ← API dédiée qui pointe sur le serveur

export default function AdminLogin() {
  const [username, setUsername] = useState("Admin5988");
  const [password, setPassword] = useState("CLSophie5988*");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginAdmin({ username, password });
      navigate("/admin"); // cookie de session posé → accès aux routes admin
    } catch (err) {
      setError(
        err?.message === "Failed to fetch"
          ? "Serveur injoignable :5000 (ou CORS)."
          : err?.message || "Échec de connexion admin"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-stone-50 border border-stone-200 rounded-2xl shadow-2xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-stone-800 text-center">
          Espace Administrateur
        </h1>
        <p className="text-stone-600 text-center mt-1">
          Connectez-vous pour gérer le contenu.
        </p>

        {error && (
          <div className="mt-4 bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-stone-600 mb-1">
              Identifiant
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-stone-200 text-stone-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Admin5988"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-stone-600 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-stone-200 text-stone-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl py-2.5 font-semibold shadow-2xl transition-transform ${
              loading
                ? "bg-stone-400 text-white cursor-not-allowed"
                : "bg-stone-900 text-stone-50 hover:scale-[1.01]"
            }`}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-xs text-stone-500 mt-4">
          Astuces &amp; Murmures — zone réservée à l’administrateur.
        </p>
      </div>
    </div>
  );
}

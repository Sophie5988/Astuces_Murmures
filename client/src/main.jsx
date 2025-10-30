// src/main.jsx
// ============================================================================
// 📌 Point d’entrée React : Router + ToastProvider + ErrorBoundary + HelmetProvider
// ----------------------------------------------------------------------------
// - Structure d’origine conservée à 100% (rien retiré).
// - AJOUT : HelmetProvider (nécessaire pour <Helmet> dans Accueil.jsx et ailleurs).
// - IMPORTANT : l'import du ToastProvider reste RELATIF à "src/"
//   -> "./components/Common/ToastProvider.jsx"
// - Aucun import inutile (pas de lucide-react, etc.) ; uniquement ce qui sert ici.
// ============================================================================

import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import ToastProvider from "./components/Common/ToastProvider.jsx";
import { Component } from "react";

// ✅ AJOUT (SEO) : Provider requis par react-helmet-async
//    Sans ce wrapper, erreur : "<Helmet> component must be within a <HelmetProvider>"
import { HelmetProvider } from "react-helmet-async";

// ============================================================================
// 🛡️ Error Boundary — anti écran blanc & message propre en cas d’erreur runtime
// - Ne modifie pas le rendu en temps normal ; n’intervient qu’en cas d’erreur.
// - Laisse passer les children si tout va bien.
// ============================================================================
class RenderErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }
  static getDerivedStateFromError(err) {
    return {
      hasError: true,
      errorMessage: err?.message || "Une erreur est survenue",
    };
  }
  componentDidCatch(err, info) {
    console.error("[ErrorBoundary] Render error:", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f6f9ee] text-[#1b2a1b] flex items-center justify-center p-6">
          <div className="max-w-lg w-full rounded-2xl border border-[#e0ecc4] bg-white shadow-xl p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Oups…</h1>
            <p className="text-[#355235]">
              Une erreur est survenue durant l’affichage de la page.
            </p>
            <p className="text-sm text-[#4a6a4a] mt-2">
              {this.state.errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-5 py-2 rounded-xl text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow hover:shadow-lg transition"
            >
              Recharger
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================================
// 🚀 Bootstrapping de l’app
// - Ordre des providers (extérieur -> intérieur) :
//   1) RenderErrorBoundary : capture toute erreur de rendu descendante.
//   2) HelmetProvider      : fournit le contexte pour <Helmet> (SEO).
//   3) ToastProvider       : toasts globaux (UI/UX), inchangé.
//   4) RouterProvider      : ton routeur Vite/React Router, inchangé.
// - Cet ordre garantit que <Helmet> fonctionne dans toutes les routes/pages.
// ============================================================================
createRoot(document.getElementById("root")).render(
  <RenderErrorBoundary>
    {/* 🌐 Contexte pour toutes les balises <Helmet> de l’app (SEO / balises <head>) */}
    <HelmetProvider>
      {/* 🔔 Conserve ton provider de toasts existant (aucun changement visuel) */}
      <ToastProvider>
        {/* 🧭 Ton routeur inchangé */}
        <RouterProvider router={router} />
      </ToastProvider>
    </HelmetProvider>
  </RenderErrorBoundary>
);

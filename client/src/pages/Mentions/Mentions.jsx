import { NavLink } from "react-router-dom";

export default function Mention() {
  return (
    <div className="min-h-screen bg-amber-50 bg-opacity-70 p-6 md:p-8 font-serif">
      <div className="max-w-4xl mx-auto bg-white bg-opacity-90 rounded-lg shadow-lg p-6 md:p-8 border border-amber-200">
        <h1 className="text-3xl md:text-4xl font-bold text-pink-600 mb-6 text-center">
          MENTIONS LÉGALES & INFORMATIONS LÉGALES
        </h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600 mb-3">
              1. CONDITIONS GÉNÉRALES D'UTILISATION DU SITE ET DES SERVICES
              PROPOSÉS.
            </h2>
            <p className="mb-4">
              L'utilisation du site www.astuces&murmures.com implique
              l'acceptation pleine et entière des conditions générales
              d'utilisation ci-dessous. Ces conditions d'utilisation sont
              susceptibles d'être modifiées ou complétées à tout moment...
            </p>
          </section>

          {/* Autres sections... */}
        </div>

        <div className="mt-8 pt-6 border-t border-amber-200">
          <p className="text-center text-gray-600 italic">
            L'équipe Astuces & Murmures
          </p>
        </div>

        <div className="text-center mt-8">
          <NavLink
            to="/"
            className="inline-block bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition"
          >
            Retour à l'accueil
          </NavLink>
        </div>
      </div>
    </div>
  );
}

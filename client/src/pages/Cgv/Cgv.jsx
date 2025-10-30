import { NavLink } from "react-router-dom";

export default function Cgv() {
  return (
    <div className="min-h-screen bg-amber-50 bg-opacity-70 p-6 md:p-8 font-serif">
      <div className="max-w-4xl mx-auto bg-white bg-opacity-90 rounded-lg shadow-lg p-6 md:p-8 border border-amber-200">
        <h1 className="text-3xl md:text-4xl font-bold text-pink-600 mb-6 text-center">
          Conditions Générales de Ventes
        </h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <p className="mb-4">
              Ce site est géré par « Astuces & Murmures». Tout au long du site,
              les termes « nous », « notre » et « nos » font références à «
              Astuces & Murmures». Astuces & Murmures offre ce site, y compris
              toutes les informations, outils et services disponibles sur ce
              site pour vous, l'utilisateur, sous réserve de votre acceptation
              de tous les termes, conditions, politiques et avis énoncés ici.
            </p>
          </section>

          {/* Sections CGV... */}
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

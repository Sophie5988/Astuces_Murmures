import React from "react";
import bgAbout from "../../assets/images/background.webp";
import { Home, Instagram, Twitter, Facebook } from "lucide-react";

const About = () => {
  return (
    <div
      className="w-full min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bgAbout})` }}
    >
      {/* --- Cadre principal --- */}
      <div className="w-full max-w-6xl bg-[#b8af82] mx-auto mt-10 p-8 rounded-2xl shadow-[5px_5px_15px_rgba(0,0,0,0.7)]">
        {/* --- Titre principal --- */}
        <h1 className="text-3xl font-bold text-center text-white mt-4 mb-5">
          🌿 À propos de nous...
        </h1>
        <p className="text-lg text-black text-center mb-12 max-w-3xl mx-auto">
          Découvrez notre histoire, notre mission et notre passion pour le
          bien-être et la méditation.
        </p>

        {/* --- Conteneur en 2 colonnes --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* --- Partie gauche (Mission + Valeurs) --- */}
          <div className="bg-[#D6D1B8] rounded-xl p-6 shadow-2xl hover:scale-105 transition">
            <h2 className="text-2xl font-bold text-green-900 mb-4">
              Notre mission
            </h2>
            <p className="text-gray-800 mb-6 leading-relaxed">
              Chez Astuces Murmures, nous croyons que chacun mérite de trouver
              la paix intérieure et l'équilibre dans sa vie quotidienne. Notre
              mission est de partager des conseils pratiques, des techniques de
              méditation et des astuces bien-être pour vous accompagner sur le
              chemin de la sérénité.
            </p>

            <h2 className="text-2xl font-bold text-green-900 mb-4">
              Nos valeurs
            </h2>
            <ul className="space-y-3 text-gray-800">
              <li>
                <span className="font-bold"> Authenticité : </span> Des conseils
                testés et approuvés.
              </li>
              <li>
                <span className="font-bold">Bienveillance : </span> Respect et
                compassion au quotidien.
              </li>
              <li>
                <span className="font-bold">Croissance :</span> Encourager
                l'évolution personnelle.
              </li>
              <li>
                <span className="font-bold">Communauté :</span> Un espace de
                partage et de soutien.
              </li>
            </ul>
          </div>

          {/* --- Partie droite (Coordonnées + Réseaux sociaux) --- */}
          <div className="bg-[#D6D1B8] rounded-xl p-6 shadow-2xl hover:scale-105 transition">
            <h2 className="text-2xl font-bold text-green-900 mb-4">
              Nos coordonnées
            </h2>
            <ul className="text-gray-800 space-y-2 mb-6">
              <li>13 rue de l'Égalité - 62220 Carvin</li>
              <li>06 99 41 42 22</li>
              <li>contact@sogilbdev.fr</li>
              <li>🌐 www.astuces-murmures.fr</li>
            </ul>

            <h2 className="text-2xl font-bold text-green-900 mb-4">
              Rejoignez-nous sur nos réseaux
            </h2>
            <div className="flex space-x-4 p-4">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-600 font-semibold -text-xl transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={32} />
              </a>

              <a
                href="https://www.tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-500 transition-colors duration-200"
                aria-label="TikTok"
              >
                {/* TikTok icon personnalisée car pas disponible dans Lucide */}
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>

              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-500 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter size={32} />
              </a>

              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-orange-700 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={32} />
              </a>

              <a
                href="/"
                className="hover:text-yellow-400 transition-colors duration-200"
                aria-label="Accueil"
              >
                <Home size={32} />
              </a>
            </div>
          </div>
        </div>

        {/* --- Call to action sous les 2 colonnes --- */}
        <div className="text-center bg-green-50 rounded-lg p-6 mt-10 max-w-2xl mx-auto shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            🌸 Rejoignez notre communauté
          </h3>
          <p className="text-gray-600 mb-4">
            Commencez votre voyage vers le bien-être dès aujourd'hui
          </p>
          <button className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 hover:scale-105 transition">
            Découvrir nos articles
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;

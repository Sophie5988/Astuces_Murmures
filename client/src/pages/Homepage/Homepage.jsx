// =====================================
// 🌄 Homepage.jsx — Page d'ouverture SANS animation
// =====================================
import { Link } from "react-router-dom"; // // Navigation SPA
import bgImage from "../../assets/images/10496921.webp"; // // ✅ Image locale de fond (opaque, non transparente)

export default function Homepage() {
  return (
    // // Section plein écran : image de fond nette, SANS overlay, SANS animation
    <section
      className="
        min-h-screen w-full relative flex items-center justify-center px-4
        bg-cover bg-center bg-no-repeat
      "
      style={{ backgroundImage: `url(${bgImage})` }} // // ✅ Fond direct (aucune translucidité)
      aria-label="Page d'ouverture Astuces & Murmures"
    >
      {/* Contenu centré (cartouche lisible) */}
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Boîte de bienvenue : carte opaque avec ombre et légère mise en avant au hover (OK) */}
        <div
          className="
            max-w-2xl
            bg-[#efe7d8]                /* beige opaque, plus foncé que le fond global */
            text-[#1f2937]              /* gris foncé lisible */
            rounded-2xl
            shadow-[0_10px_30px_rgba(0,0,0,0.25)]  /* ombre prononcée */
            p-6 md:p-8
            transition
            hover:scale-[1.01] hover:shadow-[0_16px_40px_rgba(0,0,0,0.28)]
          "
        >
          {/* Titre en police élégante */}
          <p className="text-2xl md:text-3xl font-elegant font-semibold">
            Bienvenue sur le site d’Astuces &amp; Murmures des Hautes de France.
          </p>
          <p className="mt-3 text-base md:text-lg leading-relaxed">
            « Découvrez l'équilibre parfait entre sérénité et vitalité, pour un
            bien-être total. »
          </p>
        </div>

        {/* Bouton d’entrée vers Accueil (aucune animation de page) */}
        <div
          className="
            bg-[#d9cbb7]                /* cadre plus foncé */
            rounded-2xl
            shadow-[0_10px_30px_rgba(0,0,0,0.25)]
            px-5 py-4
          "
        >
          <Link
            to="/accueil" // // Redirige vers la page Accueil
            className="
              inline-flex items-center gap-3
              bg-[#606b3b] text-white
              px-6 py-3
              rounded-xl
              shadow-md
              hover:bg-[#8aa14d]
              active:scale-95
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bdd273]
              text-lg md:text-xl font-medium
              transition
            "
            aria-label="Accéder à la page d'accueil"
          >
            Clic <span className="text-2xl leading-none">👇</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

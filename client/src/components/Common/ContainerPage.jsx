// client/src/components/common/ContainerPage.jsx
// -------------------------------------------------------------
// ContainerPage : conteneur réutilisable pour chaque page.
// Objectifs design :
// - Fond beige très clair, ombres prononcées, rendering pro.
// - Pleine hauteur visible en tenant compte d’un header/footer fixes.
// - Padding horizontal EXACT de 5px (demande explicite).
// - Option "cadre" plus foncé (par défaut activé) avec hover scale léger.
// - 100% Tailwind. Pas de dépendance externe.
// -------------------------------------------------------------

import React from "react"; // Import React (projet en JS)

// Petite utilitaire : calcule la min-height avec header/footer éventuels (px).
const makeMinHeightStyle = (headerOffset = 0, footerOffset = 0) => {
  // Convertit en nombres et sécurise si valeurs non fournies.
  const h = Number(headerOffset || 0);
  const f = Number(footerOffset || 0);
  // min-height: 100vh - (header + footer) → évite le chevauchement.
  return { minHeight: `calc(100vh - ${h + f}px)` };
};

// Composant principal.
// - children : contenu de la page.
// - className : classes Tailwind additionnelles (facultatif).
// - headerOffset / footerOffset : hauteur du header/footer SI position: fixed (en px).
// - withCard : affiche un "cadre" plus foncé + ombre (true par défaut).
// - title / subtitle : en-tête optionnelle dans le cadre.
// - maxWidth : largeur max du contenu (défaut "max-w-7xl" pour laptop 15").
// - hoverScale : active un léger agrandissement au survol du cadre.
export default function ContainerPage({
  children,
  className = "",
  headerOffset = 0,
  footerOffset = 0,
  withCard = true,
  title,
  subtitle,
  maxWidth = "max-w-7xl",
  hoverScale = true,
}) {
  // Style calculé pour la min-height.
  const minHeightStyle = makeMinHeightStyle(headerOffset, footerOffset);

  // Classes de l’enveloppe extérieure (fond de page).
  // - bg-stone-50 : beige très clair (thème bien-être).
  // - px-[5px] : padding horizontal EXACT 5px.
  // - py-3 : respiration verticale légère.
  // - flex/justify-center : centre le contenu (le cadre) horizontalement.
  const outerBase =
    "w-full bg-stone-50 px-[5px] py-3 flex justify-center items-stretch";

  // Classes du "cadre" interne (quand withCard=true).
  // - bg-stone-100 : un ton plus foncé que le fond.
  // - shadow-2xl : ombre prononcée.
  // - rounded-2xl : angles doux.
  // - p-4 md:p-6 : respiration interne responsive.
  // - ring-1 ring-stone-200 : liseré discret pour le relief.
  // - transition-transform : nécessaire pour le hover scale.
  const cardBase =
    "bg-stone-100 shadow-2xl rounded-2xl p-4 md:p-6 ring-1 ring-stone-200 transition-transform";

  // Ajout conditionnel du léger scale au survol.
  const cardHover = hoverScale ? "hover:scale-[1.01]" : "";

  return (
    // SECTION extérieure : gère la min-height et le fond de page.
    <section style={minHeightStyle} className={`${outerBase} ${className}`}>
      {/* Limiteur de largeur pour confort de lecture (laptop 15" + mobile 390px) */}
      <div className={`w-full ${maxWidth}`}>
        {withCard ? (
          // VERSION "cadre" (recommandée pour la plupart des pages)
          <div className={`${cardBase} ${cardHover}`}>
            {/* En-tête optionnelle (titre + sous-titre) */}
            {(title || subtitle) && (
              <header className="mb-4 md:mb-6">
                {title && (
                  <h1 className="text-xl md:text-2xl font-semibold text-stone-700">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-1 text-sm md:text-base text-stone-600">
                    {subtitle}
                  </p>
                )}
              </header>
            )}

            {/* Contenu injecté par la page appelante */}
            <div className="w-full">{children}</div>
          </div>
        ) : (
          // VERSION sans cadre (si la page gère déjà ses propres sections/cartes)
          <div className="w-full">{children}</div>
        )}
      </div>
    </section>
  );
}

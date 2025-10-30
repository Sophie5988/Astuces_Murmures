// src/pages/Accueil/Accueil.jsx
// ============================================================================
// 🌿 Page d'accueil — Design + dynamiques + SEO (Helmet & structure sémantique)
// ---------------------------------------------------------------------------
// ⚠️ Objectif : optimiser le SEO et l’accessibilité SANS modifier le rendu visuel,
//    puis (à ta demande) mettre en évidence 3–4 mots-clés par section via <strong>.
//    - Helmet : <title>, <meta description>, <meta keywords> + OG/Twitter + JSON-LD.
//    - H1 masqué (sr-only) pour le SEO ; H2/H3 visibles conservés.
//    - ARIA propre : aria-labelledby entre <section> et leurs titres.
//    - Ajout ciblé de <strong> dans les paragraphes (3–4 occurrences / section).
// ============================================================================

import { NavLink } from "react-router-dom";
import { useMemo } from "react";
import { ChevronDown, ChevronsUp } from "lucide-react";
// ✅ Helmet pour les balises SEO côté client (react-helmet-async requis)
import { Helmet } from "react-helmet-async";

// ---- Contexts dynamiques ----
import { useBlog } from "../../context/BlogContext";
import { useActualite } from "../../context/ActualiteContext";

// ---- Images statiques (fallbacks et section 5) ----
import imageBlog from "../../assets/images/Blog0.webp";
import imageActualites from "../../assets/images/Actualites-0.webp";
import imageEshop from "../../assets/images/Eshop-0.webp";
import bougie from "../../assets/images/bougie.jpg";
import diffuseur from "../../assets/images/diffuseur.jpg";
import the from "../../assets/images/the.jpg";

// ============================================================================
// 🎨 STYLES — utilitaires centralisés (inchangés visuellement)
// ----------------------------------------------------------------------------
const cardShell =
  "rounded-2xl border-4 border-[#e5e7eb] shadow-[0_14px_30px_rgba(0,0,0,0.38)] " +
  "hover:border-pink-700 hover:shadow-[0_24px_44px_rgba(0,0,0,0.5)] " +
  "transition-all duration-300 ease-out hover:-translate-y-1.5";

const cardInnerPad = "p-4 md:p-5";

const primaryBtn =
  "inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold " +
  "bg-pink-700 text-white hover:scale-105 transition-transform";

// 👉 Wrapper “jaune ocre” (identique au design existant)
function OcreWrap({ children }) {
  return (
    <div className="bg-[#e6c97a] rounded-2xl p-6 md:p-8 ring-1 ring-amber-300">
      {children}
    </div>
  );
}

// ============================================================================
// 🔹 Composant principal Accueil
//    - SEO : Helmet + H1 masqué
//    - Visuel : strictement inchangé, sauf les <strong> dans les textes (souhaité)
// ============================================================================
export default function Accueil() {
  // ---------------------- SEO (statique + mots-clés cohérents) ----------------
  const seoTitle =
    "Astuces & Murmures — Bien-être, santé, relaxation et développement personnel";
  const seoDescription =
    "Découvrez nos articles bien-être, actualités et e-shop : santé holistique, relaxation, harmonie du corps et de l’esprit, développement personnel, événements et inspirations.";
  const seoKeywords = [
    "bien-être",
    "santé",
    "relaxation",
    "développement personnel",
    "harmonie",
    "équilibre",
    "respiration",
    "méditation",
    "alimentation équilibrée",
    "événements bien-être",
    "produits naturels",
    "aromathérapie",
  ].join(", ");

  // ---------------------- BLOGS (Section 3) ----------------------
  const { blogs = [] } = useBlog() || {};
  const normBlog = (b) => ({
    id: b._id || b.id || b.slug || "",
    title: b.title || b.titre || "Article",
    author:
      b.author?.username ||
      b.author?.name ||
      b.authorName ||
      (typeof b.author === "string" ? b.author : "Auteur"),
    views:
      typeof b.views === "number"
        ? b.views
        : typeof b.viewCount === "number"
        ? b.viewCount
        : typeof b.reads === "number"
        ? b.reads
        : 0,
    image:
      b.image ||
      b.cover ||
      b.imageUrl ||
      b.featuredImage ||
      b.thumbnail ||
      imageBlog,
  });

  const top3Blogs = useMemo(() => {
    return blogs
      .map(normBlog)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 3);
  }, [blogs]);

  // -------------------- ÉVÈNEMENTS (Section 4) -------------------
  const { actualites = [] } = useActualite() || {};
  const toDate = (v) => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d) ? null : d;
  };
  const fmt = (d) => (d ? new Date(d).toLocaleDateString("fr-FR") : "");
  const todayMid = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const normEvt = (a) => {
    const debut = toDate(a.dateDebut) || toDate(a.date) || null;
    const fin = toDate(a.dateFin) || debut;
    return {
      id: a._id || a.id || a.slug || "",
      type: a.type || "",
      title: a.titreEvenement || a.titre || "Évènement",
      ville: a.ville || a.city || a.commune || "",
      debut,
      fin,
      debutStr: fmt(debut),
      finStr: fmt(fin),
      image: a.image || a.imageUrl || a.photo || a.cover || imageActualites,
    };
  };

  const top3Events = useMemo(() => {
    return actualites
      .map(normEvt)
      .filter((e) => (e.type || "").toLowerCase() === "evenement")
      .filter((e) => !e.debut || e.debut >= todayMid)
      .sort((a, b) => {
        const ta = a.debut ? a.debut.getTime() : Infinity;
        const tb = b.debut ? b.debut.getTime() : Infinity;
        return ta - tb;
      })
      .slice(0, 3);
  }, [actualites, todayMid]);

  return (
    <div
      className="min-h-screen w-full flex flex-col text-gray-800 scroll-smooth"
      role="main"
    >
      {/* ============================= HELMET (SEO) ============================= */}
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta name="robots" content="index,follow" />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        {/* JSON-LD (schéma simple) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Astuces & Murmures",
            description: seoDescription,
            inLanguage: "fr-FR",
            about: [
              "bien-être",
              "santé",
              "relaxation",
              "développement personnel",
              "harmonie",
            ],
          })}
        </script>
      </Helmet>

      {/* ============================= H1 (SEO) ================================ */}
      <h1 className="sr-only">
        Astuces &amp; Murmures — Bien-être, santé, relaxation, harmonie et
        développement personnel
      </h1>

      {/* =========================================================================
         I. SECTION 1 — Présentation éditoriale (3 cartes simples)
         ➤ Ajout de <strong> sur 3–4 mots-clés cohérents (SEO + UX)
      ========================================================================= */}
      <SectionWrapper
        id="section1"
        title="Présentation éditoriale"
        bg="bg-[#d6d8c4]"
      >
        <Container3Card>
          <OcreWrap>
            <CardSimple
              bgColor="#4b5943"
              textLight
              title="Notre Blog"
              text={
                <>
                  Bienvenue sur notre espace dédié au <strong>bien-être</strong>
                  , à la <strong>santé</strong> mentale et physique. Nous
                  croyons que chaque personne mérite de trouver un{" "}
                  <strong>équilibre</strong> entre le corps et l’esprit afin
                  d’avancer avec plus de <strong>sérénité</strong>. Ce site est
                  pensé comme un lieu de partage, d’écoute et de découverte, où
                  se rencontrent conseils pratiques, ressources inspirantes et
                  échanges bienveillants. Notre objectif est de vous accompagner
                  progressivement vers une vie plus <strong>harmonieuse</strong>
                  , consciente et épanouie, en respectant votre rythme et vos
                  besoins.
                </>
              }
            />
          </OcreWrap>

          <OcreWrap>
            <CardSimple
              bgColor="#4b5943"
              textLight
              title="Nos Actualités"
              text={
                <>
                  Vous y découvrirez des articles de blog approfondis abordant
                  des thèmes variés tels que la gestion du stress, le{" "}
                  <strong>développement personnel</strong>, l’
                  <strong>alimentation équilibrée</strong> ou encore les rituels
                  de <strong>relaxation</strong>. Notre espace Actualités met en
                  avant les dernières tendances et recherches liées au{" "}
                  <strong>bien-être</strong> global, afin de vous offrir une
                  vision claire et actuelle. L’objectif est de vous informer,
                  vous inspirer et vous accompagner chaque jour vers une vie
                  plus sereine et épanouie.
                </>
              }
            />
          </OcreWrap>

          <OcreWrap>
            <CardSimple
              bgColor="#4b5943"
              textLight
              title="Notre Boutique"
              text={
                <>
                  Notre e-shop vous propose une sélection de produits choisis
                  avec soin, pensés pour soutenir votre démarche de{" "}
                  <strong>mieux-vivre</strong> au quotidien. Chaque article
                  allie qualité, douceur et respect de l’
                  <strong>équilibre</strong> naturel, afin de prendre soin de
                  vous en toute confiance. Nous privilégions des marques
                  engagées, des ingrédients authentiques et des fabrications
                  responsables. L’objectif est de vous offrir des solutions de{" "}
                  <strong>bien-être</strong> qui s’intègrent harmonieusement
                  dans votre routine et favorisent votre{" "}
                  <strong>épanouissement</strong>.
                </>
              }
            />
          </OcreWrap>
        </Container3Card>
      </SectionWrapper>

      {/* =========================================================================
         II. SECTION 2 — Présentation du site (3 cartes strictes)
         ➤ <strong> sur 3–4 mots-clés par carte
      ========================================================================= */}
      <SectionWrapper
        id="section2"
        title="Chemins vers l’harmonie du corps et de l’esprit"
        bg="bg-[#b7bea7]"
      >
        <Container3Card>
          <OcreWrap>
            <CardStrict
              headBg="#4b5943"
              bodyBg="#ddd9c4"
              img={imageBlog}
              title="BLOG"
              titleColor="text-pink-100"
              text={
                <>
                  Ce blog est un espace dédié au partage d'articles riches et
                  inspirants. Vous y découvrirez des contenus variés qui mêlent
                  conseils pratiques, réflexions, récits personnels et
                  découvertes autour de nos thématiques. Chaque article est
                  pensé pour informer, éveiller la curiosité et offrir une pause
                  agréable de lecture. Découvrez nos articles de{" "}
                  <strong>bien-être</strong>, de <strong>relaxation</strong> et
                  de <strong>développement personnel</strong>.
                </>
              }
              primary={{ to: "/blog", label: "Découvrir" }}
            />
          </OcreWrap>

          <OcreWrap>
            <CardStrict
              headBg="#698335"
              bodyBg="#ddd9c4"
              img={imageActualites}
              title="ACTUALITÉS"
              titleColor="text-pink-100"
              text={
                <>
                  Cette section Actualités vous permet de rester informé des
                  nouveautés du site, des tendances du moment et des{" "}
                  <strong>événements</strong> à venir. Vous y trouverez des
                  articles courts et percutants, des annonces, ainsi que des
                  focus sur des sujets inspirants. Cet espace dynamique est
                  conçu pour nourrir votre curiosité, vous tenir à jour et vous
                  offrir une source continue d'informations pertinentes et
                  enrichissantes sur le <strong>bien-être</strong> et l’
                  <strong>harmonie</strong>.
                </>
              }
              primary={{ to: "/actualites", label: "Découvrir" }}
            />
          </OcreWrap>

          <OcreWrap>
            <CardStrict
              headBg="#82B000"
              bodyBg="#ddd9c4"
              img={imageEshop}
              title="E-SHOP"
              titleColor="text-black"
              text={
                <>
                  Notre E-shop est une vitrine de trésors choisis avec soin.
                  Vous y trouverez des articles en harmonie avec nos thématiques
                  : <strong>bien-être</strong>, inspiration quotidienne et
                  découvertes uniques. Chaque produit est sélectionné pour sa
                  qualité et sa capacité à embellir vos rituels ou votre
                  quotidien. Un espace où se mêlent praticité et{" "}
                  <strong>élégance</strong>, pour vous accompagner dans la{" "}
                  <strong>relaxation</strong> et l’<strong>équilibre</strong>.
                </>
              }
              primary={{ to: "/eshop", label: "Découvrir" }}
            />
          </OcreWrap>
        </Container3Card>
      </SectionWrapper>

      {/* =========================================================================
         III. SECTION 3 — Top 3 des Blogs (DYNAMIQUE)
         ➤ Les titres/auteurs viennent des données : on ne modifie pas ici.
      ========================================================================= */}
      <SectionWrapper
        id="section3"
        title="Top 3 des Blogs : coups de cœur de notre communauté"
        bg="bg-[#efe8da]"
      >
        <Container3Card>
          {top3Blogs.length === 0 ? (
            <OcreWrap>
              <EmptyCard message="Aucun article disponible pour le moment." />
            </OcreWrap>
          ) : (
            top3Blogs.map((b) => (
              <OcreWrap key={b.id}>
                <CardFullDynamic
                  img={b.image}
                  title={b.title}
                  author={b.author}
                  views={b.views}
                  link={`/blog/${b.id}`}
                />
              </OcreWrap>
            ))
          )}
        </Container3Card>
      </SectionWrapper>

      {/* =========================================================================
         IV. SECTION 4 — Les 3 prochains événements (DYNAMIQUE)
         ➤ Message de la carte événement laissé neutre (dépend des données).
      ========================================================================= */}
      <SectionWrapper
        id="section4"
        title="Les 3 prochains événements à ne pas manquer !"
        bg="bg-[#cfd6c4]"
      >
        <Container3Card>
          {top3Events.length === 0 ? (
            <OcreWrap>
              <EmptyCard message="Aucun événement à venir pour le moment." />
            </OcreWrap>
          ) : (
            top3Events.map((e) => (
              <OcreWrap key={e.id}>
                <CardEvent
                  img={e.image}
                  title={e.title}
                  ville={e.ville}
                  dateDebut={e.debutStr}
                  dateFin={e.finStr}
                  link="/actualites"
                />
              </OcreWrap>
            ))
          )}
        </Container3Card>
      </SectionWrapper>

      {/* =========================================================================
         V. SECTION 5 — Top Produits (fictif)
         ➤ 3–4 mots-clés en gras (sans changer l’apparence des cartes)
      ========================================================================= */}
      <SectionWrapper
        id="section5"
        title="Top 3 des Best-Sellers"
        bg="bg-[#f1efe2]"
      >
        <Container3Card>
          <OcreWrap>
            <CardFull
              img={bougie}
              title="Bougie Parfumée Relaxante"
              text={
                <>
                  Bougie à la cire de soja avec{" "}
                  <strong>huiles essentielles</strong> pour favoriser la{" "}
                  <strong>détente</strong>. Brûle environ 25 heures — un allié
                  douceur pour vos rituels de <strong>relaxation</strong> et de{" "}
                  <strong>bien-être</strong>.
                </>
              }
              link="/eshop"
            />
          </OcreWrap>
          <OcreWrap>
            <CardFull
              img={diffuseur}
              title="Diffuseur d'Huiles Essentielles"
              text={
                <>
                  Diffuseur ultrasonique avec lumière LED réglable. Parfait pour{" "}
                  <strong>aromatiser</strong> vos pièces en douceur, créer une
                  atmosphère de <strong>relaxation</strong> et soutenir l’
                  <strong>harmonie</strong> au quotidien.
                </>
              }
              link="/eshop"
            />
          </OcreWrap>
          <OcreWrap>
            <CardFull
              img={the}
              title="Thé Vert Bio Detox"
              text={
                <>
                  Mélange de <strong>thé vert</strong> biologique aux plantes
                  pour une infusion <strong>détoxifiante</strong>. Un compagnon
                  pour l’<strong>équilibre</strong> et la{" "}
                  <strong>sérénité</strong> journalière. Sachet de 100g.
                </>
              }
              link="/eshop"
            />
          </OcreWrap>
        </Container3Card>
      </SectionWrapper>
    </div>
  );
}

// ============================================================================
// 🔹 SectionWrapper — structure d’une section (ARIA + titres inchangés)
// ============================================================================
function SectionWrapper({ id, title, bg, children }) {
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      className={`${bg} py-8 relative`}
      aria-labelledby={headingId}
    >
      <h2
        id={headingId}
        className="text-2xl md:text-3xl text-center font-semibold mb-4 text-[#1b2a1b]"
      >
        {title}
      </h2>

      {/* Icônes décoratives (inchangées) */}
      <div
        className="absolute left-2 top-1/2 -translate-y-1/2 text-pink-700"
        aria-hidden="true"
      >
        <ChevronDown className="w-8 h-8 animate-bounce" />
      </div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-pink-700">
        <a
          href="#section1"
          title="Remonter en haut"
          aria-label="Remonter en haut"
        >
          <ChevronsUp className="w-8 h-8 animate-pulse" />
        </a>
      </div>

      {children}
    </section>
  );
}

// ============================================================================
// 🔹 Container3Card — grille responsive (identique)
// ============================================================================
function Container3Card({ children }) {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-[5px] py-[5px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  );
}

// ============================================================================
// 🔹 EmptyCard — feedback (identique)
// ============================================================================
function EmptyCard({ message }) {
  return (
    <div className={`${cardShell} ${cardInnerPad} text-center bg-white`}>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

// ============================================================================
// 🔹 CardSimple — (Titre + Texte + Bouton optionnel)
//    -> accepte désormais un "text" de type ReactNode (ex. <> ... <strong/> ... </>)
// ============================================================================
function CardSimple({ title, text, link, bgColor = null, textLight = false }) {
  const baseClasses = `${cardShell} flex flex-col h-full`;
  const bgStyle = bgColor ? { backgroundColor: bgColor } : undefined;
  const txtTitle = textLight ? "text-white" : "text-gray-900";
  const txtBody = textLight ? "text-white/90" : "text-gray-700";

  return (
    <div className={baseClasses} style={bgStyle} aria-label={title}>
      <div className={`${cardInnerPad} flex flex-col gap-2`}>
        <h3 className={`text-xl font-semibold text-center ${txtTitle}`}>
          {title}
        </h3>
        <p className={`text-sm text-justify ${txtBody}`}>{text}</p>
      </div>

      {link && (
        <div className={`${cardInnerPad} pt-0 mt-auto flex justify-center`}>
          <NavLink
            to={link}
            className={primaryBtn}
            aria-label={`Découvrir ${title}`}
          >
            Découvrir
          </NavLink>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 🔹 CardFull — (Image + Titre + Texte + Bouton) — produits/standards
// ============================================================================
function CardFull({ img, title, text, link }) {
  return (
    <div
      className={`${cardShell} flex flex-col h-full bg-white`}
      aria-label={title}
    >
      <img
        src={img}
        alt={title}
        className="w-full h-48 object-cover rounded-t-2xl"
      />
      <div className={`${cardInnerPad} flex flex-col flex-1`}>
        <h3 className="text-xl font-semibold text-center">{title}</h3>
        <p className="text-sm text-gray-700 text-justify">{text}</p>
        {link && (
          <div className="mt-auto pt-4 flex justify-center">
            <NavLink
              to={link}
              className={primaryBtn}
              aria-label={`Découvrir ${title}`}
            >
              Découvrir
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 🔹 CardStrict — modèle “Card” (Section 2) (texte peut contenir <strong>)
// ============================================================================
function CardStrict({
  headBg,
  bodyBg,
  img,
  title,
  titleColor = "text-white",
  text,
  primary,
}) {
  return (
    <div
      className={`${cardShell} overflow-hidden flex flex-col h-full bg-white`}
      aria-label={title}
    >
      <div className="relative" style={{ backgroundColor: headBg }}>
        <img src={img} alt={title} className="w-full h-48 object-cover" />
        <h2 className={`text-xl font-bold text-center py-2 ${titleColor}`}>
          {title}
        </h2>
      </div>

      <div className="flex flex-col flex-1" style={{ backgroundColor: bodyBg }}>
        <div className={`${cardInnerPad}`}>
          <p className="text-sm text-gray-800 text-justify">{text}</p>
        </div>
        <div className={`${cardInnerPad} pt-0 mt-auto flex justify-center`}>
          {primary?.to && (
            <NavLink
              to={primary.to}
              className={primaryBtn}
              aria-label={`Découvrir ${title}`}
            >
              {primary.label || "Découvrir"}
            </NavLink>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 🔹 CardFullDynamic — blog dynamique (données externes, on ne touche pas)
// ============================================================================
function CardFullDynamic({ img, title, author, views, link }) {
  return (
    <div
      className={`${cardShell} flex flex-col h-full bg-white`}
      aria-label={title}
    >
      <img
        src={img}
        alt={title}
        className="w-full h-48 object-cover rounded-t-2xl"
      />
      <div className={`${cardInnerPad} flex flex-col flex-1`}>
        <h3 className="text-xl font-semibold text-center">{title}</h3>
        <div className="mt-2 text-sm text-gray-600 text-center">
          Par <span className="font-medium text-gray-800">{author}</span>
          <span className="mx-2">•</span>
          <span className="font-medium">{views}</span> vues
        </div>
        {link && (
          <div className="mt-auto pt-4 flex justify-center">
            <NavLink
              to={link}
              className={primaryBtn}
              aria-label={`Lire l’article ${title}`}
            >
              Lire l’article
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 🔹 CardEvent — évènement dynamique (texte dépend des données ; pas de <strong> ici)
// ============================================================================
function CardEvent({ img, title, ville, dateDebut, dateFin, link }) {
  return (
    <div
      className={`${cardShell} flex flex-col h-full bg-white`}
      aria-label={title}
    >
      <img
        src={img}
        alt={title}
        className="w-full h-48 object-cover rounded-t-2xl"
      />
      <div className={`${cardInnerPad} flex flex-col flex-1`}>
        <h3 className="text-xl font-semibold text-center">{title}</h3>
        <div className="mt-2 text-sm text-gray-700 text-center">
          {ville ? (
            <span className="font-medium">{ville}</span>
          ) : (
            <span>&nbsp;</span>
          )}
        </div>
        <div className="mt-1 text-xs text-gray-600 text-center">
          {dateDebut && dateFin && dateDebut !== dateFin
            ? `Du ${dateDebut} au ${dateFin}`
            : dateDebut
            ? `Le ${dateDebut}`
            : ""}
        </div>
        {link && (
          <div className="mt-auto pt-4 flex justify-center">
            <NavLink
              to={link}
              className={primaryBtn}
              aria-label={`Voir l’évènement ${title}`}
            >
              Voir l’évènement
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
}

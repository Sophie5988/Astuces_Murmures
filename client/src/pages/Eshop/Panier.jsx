import React, { useState } from "react";

const CartWaitingPage = () => {
  // ===================== ÉTAT DU PANIER =====================
  const [quantities, setQuantities] = useState({
    1: 1,
    2: 1,
    3: 1,
  });

  // ===================== DONNÉES DES PRODUITS =====================
  const products = [
    {
      id: 1,
      name: "QKnatur - Huile de Massage Relaxante fleur de Monoi - BIO - 200ml",
      description:
        "Pour des Massages Corporelles - Monoi de Tahiti authentique",
      price: 16.75,
      pricePerUnit: "84,75€ / l",
      inStock: true,
      prime: true,
      delivery: "Livraison GRATUITE demain 07:00 - 13:00",
      giftOption: true,
      discount: "5% offerts pour 4 articles acheté(s)",
      image: "/assets/images/huile-massage-monoi.jpg",
      category: "🌿 Soin naturel",
    },
    {
      id: 2,
      name: "MIJOMA Figurine de Bouddha - Or et blanc - Aspect vintage",
      description:
        "En polyrésine - Hauteur : 14-34 cm - Avec photophore en option",
      price: 24.99,
      inStock: true,
      stockLeft: 15,
      prime: true,
      delivery: "Livraison GRATUITE demain",
      giftOption: true,
      image: "/assets/images/figurine-bouddha.jpg",
      size: "10 x 8,5 x 14 cm mit Teelichthalter",
      category: "🪷 Décoration zen",
    },
    {
      id: 3,
      name: "Lachineuse - Gong sur Socle Bouddha Rieur - Gong Tibétain Buddha",
      description:
        "Décoration Zen en Bois & Cuivre - Objet Déco Chinoise pour Maison, Bureau",
      price: 34.5,
      inStock: true,
      stockLeft: 15,
      prime: true,
      delivery: "Livraison GRATUITE demain 07:00 - 13:00",
      giftOption: false,
      image: "/assets/images/gong-bouddha.jpg",
      style: "Gong Bouddha Rieur",
      category: "🎵 Méditation sonore",
    },
  ];

  // ===================== FONCTIONS DU PANIER =====================
  const updateQuantity = (id, change) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + change),
    }));
  };

  const subtotal = products.reduce(
    (total, product) => total + product.price * quantities[product.id],
    0
  );

  return (
    <div className="min-h-screen bg-[#ddd9c4] p-3 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* ===================== EN-TÊTE AVEC BOUTONS DE NAVIGATION ===================== */}
        <div className="mb-6">
          {/* Titre principal */}
          <h1 className="text-2xl md:text-3xl font-semibold text-[#7a6a5a] mb-4">
            🛒 Votre panier Astuces & Murmures
          </h1>

          {/* ===================== BOUTONS DE NAVIGATION ===================== */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Bouton Retour à l'accueil */}
            <a
              href="/"
              className="flex items-center justify-center bg-[#a89a8a] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#8a7a6a] transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              ← Retour à la page d'accueil
            </a>

            {/* Bouton Vers l'E-SHOP */}
            <a
              href="/boutique"
              className="flex items-center justify-center bg-[#8a7a6a] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#7a6a5a] transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              🛍️ Continuer mes achats (E-SHOP)
            </a>
          </div>

          {/* Sélection des articles */}
          <div className="flex items-center justify-between">
            <button className="text-[#8a7a6a] text-sm md:text-base flex items-center hover:text-[#7a6a5a] transition-colors">
              <span className="mr-2">☑</span>
              Désélectionner tous les éléments
            </button>
            <span className="text-[#7a6a5a] text-sm md:text-base font-medium">
              {products.length} article(s) dans votre panier
            </span>
          </div>
        </div>

        {/* ===================== LISTE DES ARTICLES DU PANIER ===================== */}
        <div className="space-y-4 mb-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-[#f2dcdb] rounded-lg shadow-lg p-4 md:p-6 border-2 border-[#e0c9c8]"
            >
              {/* Ligne produit : image + infos */}
              <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-4">
                {/* Zone photo du produit */}
                <div className="flex-shrink-0">
                  <div className="w-full md:w-32 h-32 bg-[#e8d1d0] rounded-lg overflow-hidden border-2 border-[#d8c1c0]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="hidden w-full h-full items-center justify-center text-4xl text-[#a89a8a] bg-gradient-to-br from-[#f2dcdb] to-[#e8d1d0]">
                      {product.category ? product.category.charAt(0) : "🛍️"}
                    </div>
                  </div>
                </div>

                {/* Informations du produit */}
                <div className="flex-grow">
                  {/* Catégorie et nom */}
                  {product.category && (
                    <div className="text-xs font-semibold text-[#8a6a5a] mb-1">
                      {product.category}
                    </div>
                  )}
                  <h3 className="text-base md:text-lg font-semibold text-[#5a5a5a] mb-2 leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-sm text-[#6a5a5a] mb-3 italic">
                    {product.description}
                  </p>

                  {/* Disponibilité */}
                  <div className="flex items-center space-x-2 text-sm text-green-600 mb-1">
                    <span>●</span>
                    <span>En stock</span>
                  </div>
                  {product.stockLeft && (
                    <p className="text-xs text-amber-600 mb-2">
                      ⚠️ Il ne reste plus que {product.stockLeft} exemplaire(s)
                      en stock.
                    </p>
                  )}

                  {/* Options Prime */}
                  {product.prime && (
                    <div className="mb-3">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                        ✔ prime Livré en un jour
                      </span>
                      <span className="text-sm text-green-600">
                        {product.delivery}
                      </span>
                    </div>
                  )}

                  {/* Option cadeau */}
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      id={`gift-${product.id}`}
                      disabled={!product.giftOption}
                      className="mr-2 w-4 h-4 text-[#a89a8a]"
                    />
                    <label
                      htmlFor={`gift-${product.id}`}
                      className={`text-sm ${
                        product.giftOption ? "text-[#5a5a5a]" : "text-gray-400"
                      }`}
                    >
                      Ceci sera un cadeau{" "}
                      {product.giftOption
                        ? "En savoir plus"
                        : "Option cadeau indisponible"}
                    </label>
                  </div>

                  {/* Taille/Style */}
                  {(product.size || product.style) && (
                    <div className="mb-3 p-2 bg-white/50 rounded">
                      <strong className="text-sm">
                        {(product.size && "📏 Taille:") ||
                          (product.style && "🎨 Style:")}
                      </strong>
                      <span className="text-sm ml-1">
                        {product.size || product.style}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section prix et actions */}
              <div className="border-t border-[#e0c9c8] pt-3 mt-3">
                {/* Prix et quantité */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0 mb-3">
                  <div className="flex items-center space-x-4">
                    {/* Sélecteur de quantité */}
                    <div className="flex items-center border border-[#d8c1c0] rounded-lg bg-white">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        className="px-3 py-1 text-lg text-[#7a6a5a] hover:bg-[#e8d1d0] transition-colors"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-base font-medium min-w-[40px] text-center">
                        {quantities[product.id]}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        className="px-3 py-1 text-lg text-[#7a6a5a] hover:bg-[#e8d1d0] transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Prix */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#7a6a5a]">
                        {(product.price * quantities[product.id]).toFixed(2)}€
                      </div>
                      {product.pricePerUnit && (
                        <div className="text-xs text-[#8a7a6a]">
                          {product.pricePerUnit}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 text-sm">
                  <button className="text-[#8a6a5a] hover:text-[#7a5a5a] hover:underline transition-colors">
                    Supprimer
                  </button>
                  <span className="text-[#d8c1c0]">|</span>
                  <button className="text-[#8a6a5a] hover:text-[#7a5a5a] hover:underline transition-colors">
                    Mettre de côté
                  </button>
                  <span className="text-[#d8c1c0]">|</span>
                  <button className="text-[#8a6a5a] hover:text-[#7a5a5a] hover:underline transition-colors">
                    Voir plus de produits similaires
                  </button>
                  <span className="text-[#d8c1c0]">|</span>
                  <button className="text-[#8a6a5a] hover:text-[#7a5a5a] hover:underline transition-colors">
                    Partager
                  </button>
                </div>
              </div>

              {/* Promotion */}
              {product.discount && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-sm text-amber-700 font-medium">
                    🎉 {product.discount}
                  </span>
                  <button className="ml-2 text-sm text-blue-600 hover:underline">
                    Acheter des articles
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ===================== RÉSUMÉ DE COMMANDE ===================== */}
        <div className="bg-[#f2dcdb] rounded-lg shadow-lg p-4 md:p-6 border-2 border-[#e0c9c8]">
          <h2 className="text-xl font-semibold text-[#7a6a5a] mb-4">
            Résumé de votre commande
          </h2>

          {/* Détail des prix */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Sous-total ({products.length} article(s))</span>
              <span className="font-medium">{subtotal.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Livraison</span>
              <span className="text-green-600 font-semibold">GRATUITE</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taxes</span>
              <span>Incluses</span>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-[#e0c9c8] pt-3 mb-4">
            <div className="flex justify-between text-lg font-bold text-[#7a6a5a]">
              <span>Total TTC</span>
              <span>{subtotal.toFixed(2)}€</span>
            </div>
          </div>

          {/* Message livraison offerte */}
          <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
            <p className="text-sm text-amber-700 font-medium">
              Félicitations ! Votre commande est éligible à la Livraison
              GRATUITE
            </p>
          </div>

          {/* Bouton de commande */}
          <button className="w-full bg-[#a89a8a] text-white py-3 rounded-lg font-semibold hover:bg-[#8a7a6a] transition-colors duration-300 shadow-md hover:shadow-lg">
            Passer la commande sécurisée
          </button>

          <p className="text-xs text-center text-[#8a7a6a] mt-3">
            En passant votre commande, vous acceptez les Conditions générales de
            vente d'Astuces & Murmures
          </p>
        </div>

        {/* ===================== MESSAGE DE CONSTRUCTION ===================== */}
        <div className="mt-8 text-center">
          <div className="bg-[#f2dcdb] rounded-lg p-6 inline-block border-2 border-[#e0c9c8] max-w-md">
            <h3 className="text-lg font-semibold text-[#7a6a5a] mb-2">
              🚧 Page panier en construction
            </h3>
            <p className="text-sm text-[#6a5a5a] mb-3">
              Cette page panier est actuellement en développement.
              <br />
              La fonctionnalité complète sera disponible prochainement.
            </p>
            {/* Boutons de navigation supplémentaires */}
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={() => navigate("/")}
                className="rounded-xl border-2 border-indigo-800 focus:border-indigo-800 focus:outline-none transition-colors bg-[#fddede] text-indigo-800 px-4 py-3 font-medium shadow-md flex items-center justify-center gap-2 whitespace-nowrap hover:bg-[#fcc8c8]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Retour Accueil
              </button>
              <button
                onClick={() => navigate("/eshop")}
                className="rounded-xl border-2 border-indigo-800 focus:border-indigo-800 focus:outline-none transition-colors bg-[#fddede] text-indigo-800 px-4 py-3 font-medium shadow-md flex items-center justify-center gap-2 whitespace-nowrap hover:bg-[#fcc8c8]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Retour E-shop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartWaitingPage;

// src/pages/Eshop/Eshop.jsx
// ============================================================================
// Boutique — Astuces & Murmures (UX alignée + panier localStorage)
// ---------------------------------------------------------------------------
// ✅ Grille produits (MongoDB) — via listProducts()
// ✅ Filtres: catégorie / prix min-max / couleur + recherche
// ✅ Bouton unique "Ajouter au panier" (jaune)
//    → après ajout : [🗑️]  [quantité]  [+]
// ✅ Pastille panier (en haut à droite) : nb. d’articles + total (€)
// ✅ Aucun bouton Admin ici (la gestion se fera sur la page Admin)
// ✅ Design zen: beige clair, ombres, hover:scale, responsive ≥390px
// ============================================================================

import React, { useEffect, useMemo, useState } from "react";
import { listProducts } from "../../api/eshop";

// -------- Catégories proposées (filtre déroulant) --------
const CATEGORIES = [
  "yoga",
  "méditation",
  "respiration",
  "sommeil",
  "relaxation",
  "huiles essentielles",
  "tisanes & thés",
  "accessoires bien-être",
  "cristaux & minéraux",
  "journals & carnets",
];

// -------- Clé localStorage pour le panier --------
const LS_CART = "am_cart";

// -------- Helpers Panier (localStorage) --------------------------------------
function loadCart() {
  try {
    const raw = localStorage.getItem(LS_CART);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveCart(items) {
  try {
    localStorage.setItem(LS_CART, JSON.stringify(items));
  } catch {}
}

// ============================================================================
// Composant principal
// ============================================================================
export default function EshopPage() {
  // ------------------ données produits ------------------
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(24);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ------------------ recherche & filtres ------------------
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [color, setColor] = useState("");

  // ------------------ panier local ------------------
  const [cart, setCart] = useState(() => loadCart());

  // Montant total du panier (memoisé)
  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0),
        0
      ),
    [cart]
  );
  // Nombre total d’articles (memoisé)
  const cartCount = useMemo(
    () => cart.reduce((sum, it) => sum + (Number(it.qty) || 0), 0),
    [cart]
  );

  // ------------------ chargement produits ------------------
  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await listProducts({
        page,
        limit,
        search,
        category,
        minPrice: minPrice !== "" ? Number(minPrice) : undefined,
        maxPrice: maxPrice !== "" ? Number(maxPrice) : undefined,
        color,
        sort: "createdAt:desc",
      });
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotal(Number(data.total || 0));
    } catch (e) {
      setErr(e.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  // 1) première charge + pagination
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // 2) debounce recherche/filtres (300ms)
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, minPrice, maxPrice, color]);

  // 3) persistance panier
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  // ------------------ helpers panier ------------------
  // Vérifie si un produit est dans le panier
  const inCart = (productId) => cart.find((c) => c.productId === productId);

  // Ajoute 1 unité (ou crée l’entrée)
  const addOne = (p) => {
    setCart((old) => {
      const found = old.find((c) => c.productId === p._id);
      if (found) {
        // incrémente
        return old.map((c) =>
          c.productId === p._id ? { ...c, qty: (Number(c.qty) || 0) + 1 } : c
        );
      }
      // crée l’entrée
      return [
        ...old,
        { productId: p._id, name: p.name, price: Number(p.price) || 0, qty: 1 },
      ];
    });
  };

  // Supprime complètement le produit du panier
  const removeAll = (productId) =>
    setCart((old) => old.filter((c) => c.productId !== productId));

  // ------------------ rendu ------------------
  return (
    <div className="min-h-screen bg-[#efeadd]">
      <div className="relative max-w-[1200px] mx-auto px-4 py-6">
        {/* ---------- Pastille panier (compteur + total) ---------- */}
        <div className="absolute right-4 top-4 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#e0ecc4] shadow">
            <span className="text-sm text-[#1b2a1b]">
              Panier : <strong>{cartCount}</strong>
            </span>
            <span className="text-sm font-semibold text-[#1b2a1b]">
              {cartTotal.toFixed(2)} €
            </span>
          </div>
        </div>

        {/* ---------- Titre ---------- */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1b2a1b]">
            Boutique — Astuces &amp; Murmures
          </h1>
          <p className="text-[#355235]">
            Produits sélectionnés pour le bien-être et la sérénité.
          </p>
        </div>

        {/* ---------- Recherche + filtres ---------- */}
        <div className="mb-5 rounded-2xl bg-white border border-[#e0ecc4] shadow p-4">
          <div className="mb-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit…"
              className="px-3 py-2 rounded-xl bg-[#f6f1e4] border border-[#e0ecc4] shadow w-full md:w-80"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-[#1b2a1b] mb-1">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-[#f6f1e4] border border-[#e0ecc4] px-3 py-2 shadow"
              >
                <option value="">Toutes</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Prix min */}
            <div>
              <label className="block text-sm font-medium text-[#1b2a1b] mb-1">
                Prix min (€)
              </label>
              <input
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full rounded-xl bg-[#f6f1e4] border border-[#e0ecc4] px-3 py-2 shadow"
                placeholder="ex: 10"
              />
            </div>

            {/* Prix max */}
            <div>
              <label className="block text-sm font-medium text-[#1b2a1b] mb-1">
                Prix max (€)
              </label>
              <input
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-xl bg-[#f6f1e4] border border-[#e0ecc4] px-3 py-2 shadow"
                placeholder="ex: 50"
              />
            </div>

            {/* Couleur */}
            <div>
              <label className="block text-sm font-medium text-[#1b2a1b] mb-1">
                Couleur
              </label>
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full rounded-xl bg-[#f6f1e4] border border-[#e0ecc4] px-3 py-2 shadow"
                placeholder="ex: vert, beige…"
              />
            </div>
          </div>
        </div>

        {/* ---------- Messages ---------- */}
        {err && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800">
            {err}
          </div>
        )}

        {/* ---------- Grille produits ---------- */}
        {loading ? (
          <div className="py-16 text-center text-[#355235]">Chargement…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-[#355235]">
            Aucun produit pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((p) => {
              // produit présent dans le panier ?
              const line = inCart(p._id);

              return (
                <article
                  key={p._id}
                  className="rounded-2xl border border-[#e0ecc4] shadow bg-[#f6f1e4] overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* ----- Image (hauteur fixe pour alignement) ----- */}
                  <div className="h-44 bg-white overflow-hidden">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🪷
                      </div>
                    )}
                  </div>

                  {/* ----- Corps de carte ----- */}
                  <div className="p-4 space-y-2">
                    {/* Titre (max 2 lignes + hauteur réservée pour aligner) */}
                    <h3 className="font-semibold text-[#1b2a1b] line-clamp-2 min-h-[48px]">
                      {p.name}
                    </h3>

                    {/* Description (max 2 lignes + hauteur réservée) */}
                    {p.description && (
                      <p className="text-sm text-[#355235] line-clamp-2 min-h-[42px]">
                        {p.description}
                      </p>
                    )}

                    {/* Prix + Stock */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#1b2a1b]">
                        {Number(p.price).toFixed(2)} €
                      </span>
                      {typeof p.stock === "number" && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Stock: {p.stock}
                        </span>
                      )}
                    </div>

                    {/* Tags catégories (facultatif) */}
                    {Array.isArray(p.categories) && p.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 min-h-[24px]">
                        {p.categories.slice(0, 4).map((c, i) => (
                          <span
                            key={`${c}_${i}`}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* ----- CTA Panier ----- */}
                    {!line ? (
                      // 1) Pas encore dans le panier → bouton jaune
                      <button
                        onClick={() => addOne(p)}
                        className="mt-2 w-full px-4 py-2 rounded-full bg-yellow-400 text-black font-medium shadow hover:scale-[1.02] transition-transform"
                      >
                        Ajouter au panier
                      </button>
                    ) : (
                      // 2) Déjà dans le panier → Poubelle • Quantité • +
                      <div className="mt-2 w-full flex items-center justify-between gap-2">
                        {/* Poubelle = retire tout */}
                        <button
                          onClick={() => removeAll(p._id)}
                          className="px-3 py-2 rounded-full bg-white border border-[#e0ecc4] shadow hover:scale-[1.02]"
                          title="Retirer du panier"
                          aria-label="Retirer du panier"
                        >
                          🗑️
                        </button>

                        {/* Quantité (lecture seule ici) */}
                        <div className="flex-1 text-center px-3 py-2 rounded-full bg-yellow-100 border border-yellow-300 shadow text-[#1b2a1b] font-semibold">
                          {line.qty}
                        </div>

                        {/* +1 */}
                        <button
                          onClick={() => addOne(p)}
                          className="px-4 py-2 rounded-full bg-yellow-400 text-black font-medium shadow hover:scale-[1.02]"
                          title="Ajouter 1"
                          aria-label="Ajouter 1"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

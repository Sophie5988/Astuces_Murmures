import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import BlogCard from "./BlogCard";

export default function BlogSlider({ posts = [], blogs = [] }) {
  // 1) Source (compat : posts OU blogs)
  const data = posts?.length ? posts : blogs || [];
  const total = Math.min(data.length, 6);
  if (!total) return null;

  // 2) 1 / 2 / 3 cartes visibles selon largeur
  const computeVisible = () => {
    const w = typeof window !== "undefined" ? window.innerWidth : 0;
    if (w >= 1440) return 3;
    if (w >= 768) return 2;
    return 1;
  };

  const [visible, setVisible] = useState(computeVisible());
  useEffect(() => {
    const onResize = () => setVisible(computeVisible());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 3) Index et bornes
  const [index, setIndex] = useState(0);
  const maxIndex = useMemo(
    () => Math.max(0, total - visible),
    [total, visible]
  );

  const go = (to) => {
    if (to < 0) return setIndex(maxIndex);
    if (to > maxIndex) return setIndex(0);
    setIndex(to);
  };
  const prev = () => go(index - 1);
  const next = () => go(index + 1);

  // 4) Navigation clavier
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, maxIndex]);

  // 5) Gestes tactiles
  const startX = useRef(null);
  const onTouchStart = (e) => (startX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) dx > 0 ? prev() : next();
    startX.current = null;
  };

  // 6) Largeur / décalage
  const itemPercent = useMemo(() => 100 / visible, [visible]);
  const translatePct = (index * itemPercent).toFixed(4);

  // 7) Rendu
  return (
    <div className="bg-[#F8F4EF] rounded-3xl shadow-2xl p-3 sm:p-4 md:p-5 max-w-[1400px] mx-auto">
      {/* Titre */}
      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-800 mb-3 md:mb-4">
        Articles à la une !
      </h2>

      {/* Fenêtre + piste */}
      <div
        className="relative w-full pb-8"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${translatePct}%)` }}
          >
            {data.slice(0, total).map((post) => (
              <div
                key={post._id || post.slug}
                className="flex-shrink-0 px-1.5 md:px-2"
                style={{ width: `${itemPercent}%` }}
              >
                <BlogCard blog={post} />
              </div>
            ))}
          </div>
        </div>

        {/* Flèche gauche */}
        <button
          onClick={prev}
          aria-label="Précédent"
          className="absolute inset-y-0 left-0 my-auto h-12 w-12 md:h-14 md:w-14 rounded-full bg-white/70 hover:bg-white backdrop-blur-sm shadow-xl flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-black/10 transition"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 md:h-6 md:w-6">
            <path
              d="M15 19l-7-7 7-7"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Flèche droite */}
        <button
          onClick={next}
          aria-label="Suivant"
          className="absolute inset-y-0 right-0 my-auto h-12 w-12 md:h-14 md:w-14 rounded-full bg-white/70 hover:bg-white backdrop-blur-sm shadow-xl flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-black/10 transition"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 md:h-6 md:w-6">
            <path
              d="M9 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Indicateurs */}
      <div className="mt-1 flex items-center justify-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(Math.min(i, maxIndex))}
            aria-label={`Aller à l’article ${i + 1}`}
            className={[
              "h-2.5 w-2.5 md:h-3 md:w-3 rounded-full",
              i >= index && i < index + visible
                ? "bg-neutral-900"
                : "bg-neutral-400/60",
              "ring-1 ring-black/10",
            ].join(" ")}
          />
        ))}
      </div>

      {/* Bouton vers la bibliothèque */}
      <div className="mt-4 md:mt-6 flex justify-end">
        {/* ⬇️ CHANGEMENT ICI : to='/blog/list' */}
        <Link
          to="/blog/list"
          className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full shadow-xl bg-white hover:scale-[1.02] active:scale-[0.99] text-sm md:text-base font-medium text-neutral-800 transition focus:outline-none focus:ring-4 focus:ring-black/10"
        >
          Voir plus d’articles
          <svg viewBox="0 0 24 24" className="h-4 w-4">
            <path
              d="M9 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}

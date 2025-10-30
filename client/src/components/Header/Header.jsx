// src/components/Header/Header.jsx
// ============================================================================
// Header du site "Astuces & Murmures" — version 3 zones (gauche / centre / droite)
// (Modif minime : affichage du prénom si disponible. Le reste est inchangé.)
// ============================================================================

import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  FaBlog,
  FaNewspaper,
  FaShoppingCart,
  FaInfoCircle,
  FaUser,
  FaUserPlus,
  FaSignOutAlt,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaSignInAlt,
} from "react-icons/fa";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { userConnected, logout } = useAuth() || {};

  const commonBtnSurface =
    "rounded-xl shadow-lg bg-[#e7f0c2] hover:bg-[#d8e5a8] active:scale-95 transition text-[#1b2a1b]";
  const baseBtn =
    `w-28 h-12 ${commonBtnSurface} ` +
    "flex flex-col items-center justify-center gap-2 text-sm";
  const brandBtn =
    `w-48 h-12 ${commonBtnSurface} ` +
    "flex items-center justify-start pl-[10px] text-left font-semibold tracking-wide";

  // ✅ Affiche d'abord le prénom si dispo, sinon pseudo/displayName/email
  const displayName =
    userConnected?.firstName ||
    userConnected?.prenom ||
    userConnected?.pseudo ||
    userConnected?.displayName ||
    (userConnected?.email ? userConnected.email.split("@")[0] : undefined) ||
    "Utilisateur";

  return (
    <header className="w-full bg-[#0b140b] text-white shadow-md">
      {/* ===================== DESKTOP (md et +) ===================== */}
      <div className="mx-auto max-w-7xl px-0 py-2 hidden md:grid grid-cols-3 items-center">
        {/* Marque */}
        <div className="pl-[10px] flex">
          <NavLink
            to="/"
            className={brandBtn}
            aria-label="Retour à l'accueil Astuces & Murmures"
          >
            Astuces &nbsp;&amp;&nbsp; Murmures
          </NavLink>
        </div>

        {/* NAV centrale */}
        <nav className="flex items-center justify-center gap-3 pr-3">
          <NavLink to="/blog" className={baseBtn}>
            <FaBlog aria-hidden />
            <span>Blog</span>
          </NavLink>
          <NavLink to="/actualites" className={baseBtn}>
            <FaNewspaper aria-hidden />
            <span>Actualités</span>
          </NavLink>
          <NavLink to="/eshop" className={baseBtn}>
            <FaShoppingCart aria-hidden />
            <span>E-shop</span>
          </NavLink>
          <NavLink to="/about" className={baseBtn}>
            <FaInfoCircle aria-hidden />
            <span>À propos</span>
          </NavLink>
        </nav>

        {/* AUTH droite */}
        <div className="pr-[10px] flex items-center justify-end gap-3">
          {userConnected ? (
            <>
              <div className="px-3 py-2 rounded-lg bg-[#233323] text-sm shadow">
                Bienvenue,&nbsp;<strong>{displayName}</strong>
              </div>
              <NavLink to="/profile" className={baseBtn}>
                <FaUserCircle aria-hidden />
                <span>Profil</span>
              </NavLink>
              <button type="button" onClick={logout} className={baseBtn}>
                <FaSignOutAlt aria-hidden />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={baseBtn}>
                <FaSignInAlt aria-hidden />
                <span>Login</span>
              </NavLink>
              <NavLink to="/register" className={baseBtn}>
                <FaUserPlus aria-hidden />
                <span>Inscription</span>
              </NavLink>
              <NavLink to="/profile" className={baseBtn}>
                <FaUser aria-hidden />
                <span>Profil</span>
              </NavLink>
            </>
          )}
        </div>
      </div>

      {/* ===================== MOBILE (sm) ===================== */}
      <div className="mx-auto max-w-7xl px-0 py-2 flex md:hidden items-center justify-between">
        <div className="pl-[10px]">
          <NavLink to="/" className={brandBtn}>
            Astuces &nbsp;&amp;&nbsp; Murmures
          </NavLink>
        </div>
        <div className="pr-[10px]">
          <button
            aria-label="Ouvrir le menu"
            onClick={() => setOpen(true)}
            className="p-2 rounded-md bg-[#e7f0c2] hover:bg-[#d8e5a8] active:scale-95 transition text-[#1b2a1b] shadow"
          >
            <FaBars />
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50">
          <div className="absolute right-0 top-0 h-full w-72 bg-[#0f1d0f] shadow-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Menu</span>
              <button
                aria-label="Fermer le menu"
                onClick={() => setOpen(false)}
                className="p-2 rounded-md bg-[#e7f0c2] hover:bg-[#d8e5a8] active:scale-95 transition text-[#1b2a1b]"
              >
                <FaTimes />
              </button>
            </div>

            <NavLink
              to="/blog"
              onClick={() => setOpen(false)}
              className={baseBtn}
            >
              <FaBlog aria-hidden />
              <span>Blog</span>
            </NavLink>
            <NavLink
              to="/actualites"
              onClick={() => setOpen(false)}
              className={baseBtn}
            >
              <FaNewspaper aria-hidden />
              <span>Actualités</span>
            </NavLink>
            <NavLink
              to="/eshop"
              onClick={() => setOpen(false)}
              className={baseBtn}
            >
              <FaShoppingCart aria-hidden />
              <span>E-shop</span>
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setOpen(false)}
              className={baseBtn}
            >
              <FaInfoCircle aria-hidden />
              <span>À propos</span>
            </NavLink>

            <div className="h-px bg-white/10 my-2" />

            {userConnected ? (
              <>
                <div className="px-3 py-2 rounded-lg bg-[#233323] text-sm shadow">
                  Bienvenue,&nbsp;<strong>{displayName}</strong>
                </div>
                <NavLink
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className={baseBtn}
                >
                  <FaUserCircle aria-hidden />
                  <span>Profil</span>
                </NavLink>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      logout?.();
                    } finally {
                      setOpen(false);
                    }
                  }}
                  className={baseBtn}
                >
                  <FaSignOutAlt aria-hidden />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setOpen(false)}
                  className={baseBtn}
                >
                  <FaSignInAlt aria-hidden />
                  <span>Login</span>
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setOpen(false)}
                  className={baseBtn}
                >
                  <FaUserPlus aria-hidden />
                  <span>Inscription</span>
                </NavLink>
                <NavLink
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className={baseBtn}
                >
                  <FaUser aria-hidden />
                  <span>Profil</span>
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

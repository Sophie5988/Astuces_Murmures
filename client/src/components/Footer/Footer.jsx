// ===============================
// 🌿 Footer.jsx - Pied de page allégé
// ===============================

import { NavLink } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaSnapchat,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";

export default function Footer() {
  return (
    // Conteneur principal du footer
    <footer className="bg-[#000e00] text-white py-3 px-4 mt-auto shadow-inner">
      {/* 3 colonnes principales */}
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 text-sm">
        {/* ===== Coordonnées ===== */}
        <div className="text-center md:text-left text-[#bdd273]">
          <h3 className="text-base underline font-semibold mb-2">
            Nos coordonnées
          </h3>
          <address className="not-italic text-[#FEF8F8] leading-tight">
            <p>Astuces & Murmures</p>
            <p>13 rue de l'égalité</p>
            <p>62220 Carvin</p>
            <p>Tel: 06 99 41 42 22</p>
          </address>
          <NavLink
            to="/contact"
            className="text-[#05FFFF] hover:text-[#00A6A2] transition text-sm mt-1 inline-block"
          >
            Nous contacter
          </NavLink>
        </div>

        {/* ===== Liens légaux ===== */}
        <div className="text-center text-[#bdd273]">
          <h3 className="text-base underline font-semibold mb-2">
            Informations Générales
          </h3>
          <nav className="flex flex-col space-y-1 text-[#FEF8F8]">
            <NavLink to="/politique" className="hover:text-[#bdd273]">
              Politique de confidentialité
            </NavLink>
            <NavLink to="/mentions" className="hover:text-[#bdd273]">
              Mentions Légales
            </NavLink>
            <NavLink to="/pci" className="hover:text-[#bdd273]">
              PCI-DSS
            </NavLink>
            <NavLink to="/cgv" className="hover:text-[#bdd273]">
              Conditions de Ventes
            </NavLink>
            <NavLink to="/livraison" className="hover:text-[#bdd273]">
              Livraison & Retours
            </NavLink>
          </nav>
        </div>

        {/* ===== Réseaux sociaux ===== */}
        <div className="text-center md:text-right">
          <h3 className="text-[#bdd273] text-base underline font-semibold mb-2">
            Suivez-nous
          </h3>
          <div className="flex justify-center md:justify-end gap-3 text-xl text-[#FEF8F8]">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#bdd273] transition"
              aria-label="Facebook"
            >
              <FaFacebook />
            </a>
            <a
              href="https://wa.me/33699414222"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#bdd273] transition"
              aria-label="WhatsApp"
            >
              <FaWhatsapp />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#bdd273] transition"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://snapchat.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#bdd273] transition"
              aria-label="Snapchat"
            >
              <FaSnapchat />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#bdd273] transition"
              aria-label="Twitter"
            >
              <FaTwitter />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-[#bdd273] mt-2 border-t border-gray-600 pt-1 text-xs">
        &copy; {new Date().getFullYear()} Astuces & Murmures - Tous droits
        réservés
      </div>
    </footer>
  );
}

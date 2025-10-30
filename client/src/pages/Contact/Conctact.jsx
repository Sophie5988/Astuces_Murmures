import { useState } from "react";
import bgContact from "../../assets/images/2.webp"; // 🔹 Image de fond pour la page login
import { NavLink } from "react-router-dom";

export default function Contact() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    message: "",
    accept: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.accept) {
      alert("Veuillez accepter le traitement des informations.");
      return;
    }
    console.log("Formulaire envoyé ✅", formData);
    alert("Merci pour votre message. Nous reviendrons vers vous rapidement.");
  };

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bgContact})` }} // 🔹 Image en background
    >
      {/* --- Conteneur du cadre de connexion --- */}
      <div className="max-w-3xl bg-[#ddd9c4] w-400 h-200 mx-auto mt-5 p-6 rounded-2xl shadow-[5px_5px_5px_rgba(0,0,0,0.65)] hover:shadow-[8px_8px_8px_rgba(0,0,0,0.7)]">
        {/* --- Titre principal --- */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mt-7 mb-5">
          🌿 Formulaire de contact
        </h1>

        <p className="text-lg text-gray-700 text-center mb-8">
          Besoin de nous contacter ? Remplissez ce formulaire, nous vous
          répondrons rapidement.
        </p>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom + Prénom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="nom"
                className="block text-gray-800 font-medium mb-2"
              >
                Nom*
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-400 focus:outline-none bg-[#f5f2ed]"
              />
            </div>
            <div>
              <label
                htmlFor="prenom"
                className="block text-gray-800 font-medium mb-2"
              >
                Prénom
              </label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-400 focus:outline-none bg-[#f5f2ed]"
              />
            </div>
          </div>

          {/* Email + Téléphone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="email"
                className="block text-gray-800 font-medium mb-2"
              >
                Email*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-400 focus:outline-none bg-[#f5f2ed]"
              />
            </div>
            <div>
              <label
                htmlFor="telephone"
                className="block text-gray-800 font-medium mb-2"
              >
                Téléphone
              </label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-400 focus:outline-none bg-[#f5f2ed]"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-gray-800 font-medium mb-2"
            >
              Message*
            </label>
            <textarea
              id="message"
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-400 focus:outline-none bg-[#f5f2ed]"
            />
          </div>

          {/* Case à cocher */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="accept"
              name="accept"
              checked={formData.accept}
              onChange={handleChange}
              className="mt-1"
              required
            />
            <label
              htmlFor="accept"
              className="text-gray-700 text-sm leading-relaxed"
            >
              <b>Accepter le traitement de mes informations.</b>
              <br />
              En renseignant vos informations personnelles, vous acceptez que
              nous les traitions pour répondre à votre demande. Pour plus
              d’informations, veuillez consulter{" "}
              <NavLink
                to="/politique"
                className="text-green-500 hover:underline"
              >
                notre politique de confidentialité
              </NavLink>
            </label>
          </div>

          {/* Bouton */}
          <div className="text-center text-white">
            <button
              type="submit"
              className="px-8 py-3 bg-[#bdd273] text-white font-semibold rounded-lg shadow-md hover:bg-[#888f57] hover:shadow-lg hover:scale-105 transition"
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

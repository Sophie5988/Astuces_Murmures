import { NavLink } from "react-router-dom";

export default function Politique() {
  return (
    <div className="min-h-screen bg-amber-50 bg-opacity-70 p-6 md:p-8 font-serif">
      {/* Container principal avec effet vieux papier */}
      <div className="max-w-4xl mx-auto bg-white bg-opacity-90 rounded-lg shadow-lg p-6 md:p-8 border border-amber-200">
        {/* Titre principal en rose */}
        <h1 className="text-3xl md:text-4xl font-bold text-pink-600 mb-6 text-center">
          POLITIQUE DE CONFIDENTIALITÉ
        </h1>

        {/* Contenu */}
        <div className="space-y-6 text-gray-700">
          {/* Article 1 */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600 mb-3">
              ARTICLE 1 – RENSEIGNEMENTS PERSONNELS RECUEILLIS
            </h2>
            <p className="mb-4">
              Lorsque vous effectuez un achat sur notre boutique, dans le cadre
              de notre processus d'achat et de vente, nous recueillons les
              renseignements personnels que vous nous fournissez, tels que votre
              nom, votre adresse et votre adresse e-mail.
            </p>
            <p className="mb-4">
              Lorsque vous naviguez sur notre boutique, nous recevons également
              automatiquement l'adresse de protocole Internet (adresse IP) de
              votre ordinateur, qui nous permet d'obtenir plus de détails au
              sujet du navigateur et du système d'exploitation que vous
              utilisez.
            </p>
            <p>
              Marketing par e-mail (le cas échéant): Avec votre permission, nous
              pourrions vous envoyer des e-mails au sujet de notre boutique, de
              nouveaux produits et d'autres mises à jour.
            </p>
          </section>

          {/* Article 2 */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600 mb-3">
              ARTICLE 2 - CONSENTEMENT
            </h2>
            <h3 className="text-lg font-semibold text-pink-500 mb-2">
              Comment obtenez-vous mon consentement?
            </h3>
            <p className="mb-4">
              Lorsque vous nous fournissez vos renseignements personnels pour
              conclure une transaction, vérifier votre carte de crédit, passer
              une commande, planifier une livraison ou retourner un achat, nous
              présumons que vous consentez à ce que nous recueillions vos
              renseignements et à ce que nous les utilisions à cette fin
              uniquement.
            </p>
            <p className="mb-4">
              Si nous vous demandons de nous fournir vos renseignements
              personnels pour une autre raison, à des fins de marketing par
              exemple, nous vous demanderons directement votre consentement
              explicite, ou nous vous donnerons la possibilité de refuser.
            </p>

            <h3 className="text-lg font-semibold text-pink-500 mb-2">
              Comment puis-je retirer mon consentement?
            </h3>
            <p>
              Si après nous avoir donné votre consentement, vous changez d'avis
              et ne consentez plus à ce que nous puissions vous contacter,
              recueillir vos renseignements ou les divulguer, vous pouvez nous
              en aviser en nous contactant à contact@Astuces&Murmures.com.
            </p>
          </section>

          {/* Articles suivants... */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600 mb-3">
              ARTICLE 3 – DIVULGATION
            </h2>
            <p>
              Nous pouvons divulguer vos renseignements personnels si la loi
              nous oblige à le faire ou si vous violez nos Conditions Générales
              de Vente et d'Utilisation.
            </p>
          </section>

          {/* Autres articles... */}
        </div>

        {/* Signature */}
        <div className="mt-8 pt-6 border-t border-amber-200">
          <p className="text-center text-gray-600 italic">
            L'équipe Astuces & Murmures
          </p>
        </div>

        {/* Bouton retour */}
        <div className="text-center mt-8">
          <NavLink
            to="/"
            className="inline-block bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition"
          >
            Retour à l'accueil
          </NavLink>
        </div>
      </div>
    </div>
  );
}

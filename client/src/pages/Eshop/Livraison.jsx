import { NavLink } from "react-router-dom";

export default function Livraison() {
  return (
    <div className="min-h-screen bg-amber-50 bg-opacity-70 p-6 md:p-8 font-serif">
      <div className="max-w-4xl mx-auto bg-white bg-opacity-90 rounded-lg shadow-lg p-6 md:p-8 border border-amber-200">
        <h1 className="text-3xl md:text-4xl font-bold text-pink-600 mb-6 text-center">
          CONDITIONS DE LIVRAISON – DE RETOUR ET REMBOURSEMENT
        </h1>

        <div className="space-y-6 text-gray-700">
          {/* Section I - Livraison */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600 mb-3">
              I. Livraison
            </h2>
            <p className="mb-4">
              Nous travaillons directement auprès de producteurs, de
              commerçants, de fabricants et d'artisans du monde entier
              spécialisés en matière de produits zen.
            </p>
            <p className="mb-4">
              Nous proposons des tarifs aussi compétitifs car nous n'avons aucun
              intermédiaire.
            </p>
            <p className="mb-4">
              Afin d'éviter les frais de stockage et de main d'œuvre élevés, nos
              marchandises se trouvent chez nos partenaires internationaux, d'où
              nos délais de livraison entre 1 à 8 semaines pour recevoir vos
              articles.
            </p>
            <p className="mb-4">
              Le délai de traitement des commandes varie entre 1 et 3 jours.
            </p>
            <p className="mb-4">
              La livraison est gratuite sur tous nos produits sur la France et
              sur le reste du monde.
            </p>
            <p>
              Il est important de préciser qu'étant donné du fait que nous
              travaillons avec différents partenaires, si vous commandez
              plusieurs produits, ceux-ci arriveront par des colis différents.
            </p>
          </section>

          {/* Section II - Retour et Remboursement */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600 mb-3">
              II. Retour et Remboursement
            </h2>

            <h3 className="text-lg font-semibold text-pink-500 mb-2">
              a. Politique d'annulation de commande
            </h3>
            <p className="mb-4">
              Toutes commandes effectuées sur notre site sont traitées en
              général en 24h (sauf week-end et jour féries), si vous souhaitez
              annuler votre commande, il est impératif de nous contacter durant
              ce délai par email à contact@Astuces&Murmures.com avant que
              celle-ci soit traitée et expédiée.
            </p>
            <p className="mb-4">
              Un e-mail vous sera envoyé dès l'expédition de votre colis,
              comprenant le numéro de suivi de votre commande afin d'être
              informé du bon acheminement de celui-ci.
            </p>

            <h3 className="text-lg font-semibold text-pink-500 mb-2">
              b. Politique de retour et de rétractation
            </h3>
            <p className="mb-4">
              Dans le cas où le ou les produits commandés ne vous conviennent
              pas, pas d'inquiétude, vous avez 14 jours pour exercer votre droit
              de rétractation.
            </p>
            <p className="mb-4">
              Il vous suffit de nous contacter au préalable par email à
              contact@Astuces&Murmures.com, en nous expliquant votre problème et
              en y joignant les photos de votre produit et nous vous indiqueront
              la marche à suivre.
            </p>
            <p className="mb-4">
              Pour pouvoir faire l'objet d'un échange ou d'un remboursement, les
              produits ne doivent en aucun cas avoir été portés, lavés ou abîmés
              et doivent être retournés dans leur emballage d'origine avec
              étiquette, en parfait état de revente.
            </p>
            <p className="mb-4">
              Tout retour impropre à la revente, comme énoncés ci-dessus sera
              dégagé de toute responsabilité.
            </p>
            <p className="mb-4">
              Votre demande d'échange sera traitée dans un délai maximum de 14
              jours suivant la réception de vos produits et selon la
              disponibilité des articles. Dans le cas d'une indisponibilité des
              articles, nous vous en informerons par email.
            </p>
            <p className="mb-4">
              Dans le cas d'une demande de remboursement, celle-ci sera traitée
              dans les 14 jours suivant la réception de vos produits, le
              versement s'effectuera sur le compte associé la carte bancaire
              utilisée lors du paiement ou sur le compte Paypal ayant servi au
              paiement.
            </p>
            <p>Les frais de retour sont à la charge du client.</p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-amber-200">
          <p className="text-center text-gray-600 italic">
            L'équipe Astuces & Murmures
          </p>
        </div>

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

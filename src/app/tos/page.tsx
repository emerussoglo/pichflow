import React from "react";
import Link from "next/link";

export default function TOSPage() {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <Link href="/" className="back-link">
          <i className="fa-solid fa-arrow-left"></i> Retour à l'accueil
        </Link>

        <h1>Conditions d'utilisation</h1>
        <p className="last-update">Dernière mise à jour : 21 Décembre 2025</p>

        <section>
          <h2>1. Acceptation des conditions</h2>
          <p>
            En accédant ou en utilisant la plateforme PichFlow, vous acceptez
            sans réserve les présentes Conditions d’Utilisation. Si vous
            n’acceptez pas ces conditions, vous devez cesser immédiatement
            d’utiliser nos services.
          </p>
        </section>

        <section>
          <h2>2. Description des services</h2>
          <p>
            PichFlow est une plateforme de gestion et de facturation, proposant :
            <ul>
              <li>
                des outils de facturation, de création de devis et de gestion financière simplifiée
              </li>
              <li>
                des fonctionnalités d’aide à la productivité, au suivi de trésorerie et à la gestion des clients
              </li>
            </ul>
          </p>
        </section>

        <section>
          <h2>3. Utilisation de la plateforme</h2>
          <p>
            L’utilisateur s’engage à utiliser la plateforme conformément aux lois en vigueur et reconnaît que :
          </p>
          <ul>
            <li>
              il est seul responsable de l'exactitude des données financières et des informations saisies (montants, clients, taxes)
            </li>
            <li>
              PichFlow ne garantit pas l’adéquation des documents générés à des cas juridiques particuliers
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Responsabilité financière</h2>
          <p>
            Les outils de facturation et de comptabilité sont fournis à titre
            d’assistance. PichFlow ne constitue pas un cabinet comptable ni un
            organisme fiscal. L’utilisateur est seul responsable :
            <ul>
              <li>de la conformité légale et fiscale de ses documents</li>
              <li>
                de ses obligations déclaratives auprès des autorités compétentes
              </li>
            </ul>
          </p>
        </section>

        <section>
          <h2>5. Comptes et Sécurité</h2>
          <p>
            L’utilisateur est responsable de la confidentialité de ses
            identifiants de connexion. Toute activité réalisée depuis son compte
            est réputée effectuée par lui. PichFlow s’engage à mettre en œuvre
            des mesures raisonnables pour assurer la sécurité des données
            conformément à sa Politique de Confidentialité.
          </p>
        </section>

        <section>
          <h2>6. Abonnements et Paiements</h2>
          <p>
            Les services sont facturés sur une base d'abonnement (mensuel ou
            annuel).
          </p>
          <ul>
            <li>
              <strong>Essai gratuit :</strong> Accès initial selon les conditions en vigueur à l'inscription.
            </li>
            <li>
              <strong>Annulation :</strong> Vous pouvez annuler votre abonnement
              à tout moment depuis votre tableau de bord.
            </li>
            <li>
              <strong>Remboursement :</strong> Sauf disposition contraire de la
              loi, les paiements ne sont pas remboursables.
            </li>
          </ul>
        </section>

        <section>
          <h2>7. Limitation de responsabilité</h2>
          <p>
           PichFlow ne pourra être tenu responsable :
           <ul>
              <li>des dommages indirects ou pertes de profits</li>
              <li>des pertes de données</li>
              <li>de l’utilisation incorrecte de la plateforme</li>
            </ul>
          </p>
        </section>

        <section>
          <h2>8. Disponibilité du service</h2>
          <p>
            PichFlow vise une disponibilité continue du service, sans garantie absolue. Des interruptions temporaires peuvent survenir pour maintenance, mise à jour ou raisons techniques.
          </p>
        </section>
        
        <section>
          <h2>9. Propriété intellectuelle</h2>
          <p>
            L’ensemble de la plateforme PichFlow (interface, design, fonctionnalités, code, algorithmes) est protégé par les droits de propriété intellectuelle. Toute reproduction, distribution ou exploitation non autorisée est strictement interdite.
          </p>
        </section>

        <section>
          <h2>10. Modification des conditions</h2>
          <p>
            PichFlow se réserve le droit de modifier les présentes Conditions d’Utilisation à tout moment. Les utilisateurs seront informés des modifications importantes par email ou via la plateforme.
          </p>
        </section>

        <section>
          <h2>11. Droit applicable</h2>
          <p>
            Les présentes Conditions d’Utilisation sont régies par le droit applicable dans le pays d’exploitation de la société éditrice.
          </p>
        </section>
      </div>
    </div>
  );
}
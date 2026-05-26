import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <Link href="/" className="back-link">
          <i className="fa-solid fa-arrow-left"></i> Retour à l'accueil
        </Link>
        
        <h1>Politique de Confidentialité – PichFlow </h1>
        <p className="last-update">Dernière mise à jour : 21 Décembre 2025</p>

        <section>
          <h2>1. Responsable du traitement</h2>
          <p>
            PichFlow, solution SaaS éditée par Nexix. Email de contact : support@pichflow.com. Hébergement : Vercel.
          </p>
        </section>

        <section>
          <h2>2. Données collectées</h2>
          <p>Nous collectons uniquement les informations nécessaires au fonctionnement de la plateforme :</p>
          <ul>
            <li><strong>Informations de compte :</strong> Nom, adresse email, mot de passe.</li>
            <li><strong>Données professionnelles :</strong> Nom de l'entreprise, adresse de facturation, numéro de TVA (si applicable) et d'autres numéros.</li>
            <li><strong>Données de contenu :</strong> Historique des actions sur le dashboard (création de factures, devis, contenus, etc.).</li>
            <li><strong>Données financières :</strong> Montant, date et type d’abonnement. Historique des factures et devis créés via PichFlow. Aucune donnée bancaire n’est stockée : les paiements sont gérés par nos prestataires (ex. Stripe, PayPal, Mobile Money via API tierce).</li>
          </ul>
        </section>

        <section>
          <h2>3. Finalités du traitement</h2>
          <p>Vos données sont utilisées exclusivement pour :</p>
          <ul>
            <li>Assurer l’accès sécurisé à votre compte.</li>
            <li>Générer vos documents (factures, devis, contenus IA).</li>
            <li>Gérer vos abonnements et paiements.</li>
            <li>Vous envoyer des alertes et notifications importantes.</li>
            <li>Améliorer la qualité du service et nos modèles IA (données anonymisées uniquement)
            </li>
          </ul>
          <p>  Aucune donnée n’est exploitée à des fins publicitaires.</p>
        </section>

        <section>
          <h2>4. Conservation des données</h2>
          <ul>
            <li>Documents comptables (factures, devis) : jusqu’à 5 ans (obligations légales)</li>
            <li>Données de paiement : gérées par Stripe/PayPal/Mobile Money (non conservées par PichFlow)</li>
          </ul>
        </section>

        <section>
          <h2>5. Partage des données</h2>
          <p>
           Vos données ne sont jamais vendues.
          </p>
           <ul>
            <li>Nos prestataires techniques (hébergeur, email provider, services IA).</li>
            <li>Nos prestataires de paiement (Stripe, PayPal, Mobile Money API).</li>
            <li>Les autorités compétentes si la loi l’exige.</li>
          </ul>
          <p>Chaque utilisateur n’accède qu’à ses propres données.</p>
        </section>

        <section>
          <h2>6. Sécurité</h2>
          <p>
            Nous appliquons des mesures renforcées :
             </p>
          <ul>
            <li>Chiffrement HTTPS/TLS</li>
            <li>Hashage des mots de passe (bcrypt/argon2).</li>
            <li>Stockage isolé des données sensibles.</li>
            <li>Accès par rôle pour les administrateurs.</li>
            <li>Jetons d’accès sécurisés et expirant automatiquement.</li>
          </ul>
        </section>

        <section>
          <h2>7. Contact</h2>
          <p>
           Pour toute question relative à la confidentialité :
           support@pichflow.com
          </p>
        </section>
      </div>
    </div>
  );
}
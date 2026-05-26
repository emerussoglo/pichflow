'use client';

import React from 'react';
import Link from 'next/link';

export default function FacturationPage() {
  return (
    <div className="pichflow-billing-landing">
      {/* HERO SECTION */}
      

      {/* SECTION : C'EST QUOI UNE FACTURE & UN DEVIS ? */}
      <section className="billing-definition">
        <div className="section-container">
          <div className="text-center-block">
            <span className="section-tagline">Les bases de la gestion</span>
            <h2>Facture et Devis : Quelles différences ?</h2>
            <p className="section-desc">
              Pour piloter sereinement votre activité économique, il est essentiel de maîtriser ces deux documents commerciaux obligatoires.
            </p>
          </div>
          
          <div className="definition-grid">
            <div className="def-card">
              <div className="def-icon"><i className="fa-solid fa-file-signature"></i></div>
              <h3>Le Devis</h3>
              <p>
                C'est une proposition de contrat. Il estime le prix et décrit les prestations avant le début des travaux. Une fois signé par le client, il engage juridiquement les deux parties.
              </p>
            </div>
            <div className="def-card">
              <div className="def-icon"><i className="fa-solid fa-file-invoice-dollar"></i></div>
              <h3>La Facture</h3>
              <p>
                C'est le document juridique, comptable et fiscal obligatoire qui atteste de l'achat ou de la vente de services ou de marchandises. Elle déclenche l'obligation de paiement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION : POURQUOI EMETTRE DES FACTURES ? */}
      <section className="billing-why">
        <div className="section-container">
          <div className="text-center-block">
            <span className="section-tagline">Avantages clés</span>
            <h2>Pourquoi est-il obligatoire d'émettre des factures ?</h2>
          </div>

          <div className="why-grid">
            <div className="why-item">
              <i className="fa-solid fa-chart-line"></i>
              <div>
                <h4>Protection de votre Trésorerie</h4>
                <p>Émettre des factures claires avec des dates d'échéance strictes vous protège contre les retards de paiement et facilite les processus de relance.</p>
              </div>
            </div>
            <div className="why-item">
              <i className="fa-solid fa-user-tie"></i>
              <div>
                <h4>Crédibilité Professionnelle</h4>
                <p>Un document propre, sans erreur de calcul, respectant la numérotation légale et affichant vos mentions obligatoires renforce la confiance de vos clients.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION : À QUI S'ADRESSE PICHFLOW ? */}
      <section className="billing-audience">
        <div className="section-container">
          <div className="text-center-block">
            <span className="section-tagline">Pour qui ?</span>
            <h2>À qui s'adresse Pichflow ?</h2>
            <p className="section-desc">Pichflow s'adapte à toutes les structures pour simplifier le quotidien de ceux qui créent de la valeur.</p>
          </div>

          <div className="audience-grid">
            <div className="audience-card">
              <i className="fa-solid fa-laptop-code"></i>
              <h4>Freelances & Indépendants</h4>
              <p>Facturez vos prestations de services ou de consulting en 30 secondes chrono, suivez vos plafonds de chiffre d'affaires et concentrez-vous sur votre cœur de métier.</p>
            </div>
            <div className="audience-card">
              <i className="fa-solid fa-rocket"></i>
              <h4>Entrepreneurs & TPE</h4>
              <p>Gérez votre catalogue de services, transformez vos devis acceptés en factures en un seul clic et automatisez la comptabilité courante sans stress.</p>
            </div>
            <div className="audience-card">
              <i className="fa-solid fa-building"></i>
              <h4>Agences & PME</h4>
              <p>Centralisez la gestion de vos clients multi-projets, configurez des factures récurrentes (abonnements) et pilotez vos flux financiers depuis un tableau de bord collaboratif.</p>
            </div>
            <div className="audience-card">
              <i className="fa-solid fa-user"></i>
              <h4>Particuliers & Associations</h4>
              <p>Besoin d'émettre un reçu officiel ou de générer des justificatifs conformes pour des cotisations ou ventes ponctuelles ? Pichflow s'occupe de tout.</p>
            </div>
          </div>
        </div>
      </section>


      {/* SECTION : FAQ */}
      <section className="billing-faq">
        <div className="section-container">
          <div className="text-center-block">
            <h2>Questions Fréquentes</h2>
          </div>
          <div className="faq-list">
            <div className="faq-item">
              <h5>Comment créer ma première facture sur Pichflow ?</h5>
              <p>Rien de plus simple. Cliquez sur "Créer une facture", sélectionnez un client pré-enregistré (ou ajoutez-en un nouveau), saisissez vos lignes de prestations, puis validez. Les calculs de totaux HT, TVA et TTC s'exécutent de façon entièrement automatisée.</p>
            </div>
            <div className="faq-item">
              <h5>Puis-je personnaliser les designs de mes factures ?</h5>
              <p>Oui ! Pichflow vous permet de choisir entre plusieurs dispositions d'éléments (Classique ou Moderne) ainsi que la couleur d'accentuation principale (Bleu ciel, Rose, Violet, Turquoise, etc.) pour refléter au mieux votre image de marque, le tout sans altérer vos informations légales.</p>
            </div>
            <div className="faq-item">
              <h5>Mes données de facturation sont-elles sécurisées ?</h5>
              <p>Absolument. Vos documents, catalogues de services et fichiers clients sont chiffrés et stockés de manière sécurisée pour garantir une confidentialité totale et un accès permanent, où que vous soyez.</p>
            </div>
          </div>
        </div>
      </section>

      <header className="billing-hero">
        <div className="hero-container">
          {/* <h1>Créez vos factures et devis en quelques clics avec Pichflow</h1> */}
          <p className="hero-subtitle">
            Gérez votre facturation de A à Z sur une interface moderne. Suivez vos paiements en temps réel, automatisez vos relances et restez 100% conforme à la nouvelle réglementation.
          </p>
          <div className="hero-actions">
            <Link href="/inscription" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
    Essayer  gratuitement
  </Link>
            </div>
        </div>
      </header>

      
    </div>
  );
}
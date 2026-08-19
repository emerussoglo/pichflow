"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<number | null>(null);

  const faqs = [
    { 
      q: "Comment créer un compte sur PichFlow ?", 
      a: "L'inscription est rapide : cliquez sur le bouton 'S'inscrire', renseignez votre nom et email, puis validez votre compte avec le code OTP reçu par mail pour accéder instantanément à votre tableau de bord." 
    },
    { 
      q: "Comment générer un devis professionnel ?", 
      a: "Rendez-vous dans l'onglet 'Devis', choisissez 'Nouveau Devis', remplissez les informations de votre client et vos prestations. Vous pouvez ensuite l'exporter ou l'envoyer directement." 
    },
    { 
      q: "Comment créer une facture normalisée ?", 
      a: "Rendez-vous dans l'onglet 'Factures', cliquez sur 'Nouvelle Facture' (ou transformez un devis validé en facture en un clic). Le système génère un document conforme à vos attentes." 
    },
    { 
      q: "Puis-je suivre mes factures en attente ou impayées ?", 
      a: "Oui, votre tableau de bord et votre page de rapports centralisent le Chiffre d'Affaires global, les montants en attente ainsi que les alertes sur les factures ayant dépassé leur date d'échéance." 
    },
    { 
      q: "Comment exporter mes rapports d'activité ?", 
      a: "Depuis la section 'Rapports', vous disposez d'un bouton d'export PDF en haut à droite pour télécharger un récapitulatif complet de vos factures, devis et revenus." 
    },
    { 
      q: "Puis-je gérer facilement mes clients sur la plateforme ?", 
      a: "Tout à fait. L'onglet 'Clients' vous permet de centraliser toutes les coordonnées de vos clients pour les associer rapidement à vos devis et factures." 
    },
    { 
      q: "Puis-je gérer mes finances si je suis freelance ou PME ?", 
      a: "Oui, PichFlow est conçu spécifiquement pour les indépendants et petites structures afin de simplifier toute la gestion administrative et financière au même endroit." 
    }
  ];

  return (
    <div className="sup-wrapper">
      <div className="sup-container">
        
        <br /><br /> 
        <div className="sup-header">
          <span className="sup-tag">Assistance PichFlow</span>
          <h1>Besoin d'un <span>coup de main ?</span></h1>
          <p>Trouvez une réponse immédiate ou contactez notre équipe technique.</p>
        </div>

        <div className="sup-grid">
          
          <div className="sup-faq">
            <h2 className="sup-title">Questions fréquentes</h2>
            <div className="faq-stack">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`faq-box ${activeTab === index ? 'open' : ''}`}
                  onClick={() => setActiveTab(activeTab === index ? null : index)}
                >
                  <div className="faq-top">
                    <span className="faq-q">{faq.q}</span>
                    <div className="faq-icon-wrapper">
                      {activeTab === index ? (
                        <i className="fa-solid fa-minus"></i>
                      ) : (
                        <i className="fa-solid fa-plus"></i>
                      )}
                    </div>
                  </div>
                  <div className="faq-bottom">
                    <p>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sup-form-section">
            <div className="form-card">
              <h2 className="sup-title">Envoyez-nous un message</h2>
              <form className="custom-form" onSubmit={(e) => e.preventDefault()}>
                <div className="field">
                  <label>Nom complet</label>
                  <input type="text" placeholder="Ex: Jean Dupont" />
                </div>
                
                <div className="field">
                  <label>Email professionnel</label>
                  <input type="email" placeholder="jean@exemple.com" />
                </div>

                <div className="field">
                  <label>Votre demande</label>
                  <textarea rows={4} placeholder="Comment pouvons-nous vous aider ?"></textarea>
                </div>

                <button type="submit" className="sup-btn">
                  Envoyer le ticket <i className="fa-solid fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
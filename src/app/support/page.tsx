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
    a: "Rendez-vous dans l'onglet 'Documents', choisissez 'Nouveau Devis', remplissez les informations de votre client et vos prestations. Vous pouvez ensuite l'envoyer directement ou le télécharger." 
  },
  { 
    q: "Comment créer une facture normalisée ?", 
    a: "Une fois votre prestation terminée, vous pouvez transformer un devis en facture en un clic ou en créer une nouvelle. Le système génère automatiquement une facture conforme à vos obligations fiscales." 
  },
  { 
    q: "Comment utiliser l'IA pour mon contenu marketing ?", 
    a: "Accédez à l'outil de génération de contenu, décrivez votre produit ou service, et notre IA vous proposera des publications optimisées pour vos réseaux sociaux en quelques secondes." 
  },
  { 
    q: "L'IA peut-elle m'aider pour le copywriting ?", 
    a: "Absolument. PichFlow inclut des modèles de copywriting basés sur les meilleures structures de vente pour rédiger vos emails marketing, fiches produits et pages de vente percutantes." 
  },
  { 
    q: "Comment fonctionne le système de crédits ?", 
    a: "Chaque génération de contenu par l'IA consomme des crédits. Vous recevez des crédits gratuits à l'inscription, et vous pouvez recharger votre compte selon vos besoins (Essential ou Business)." 
  },
  { 
    q: "Puis-je gérer mes finances si je suis freelance ?", 
    a: "Oui, PichFlow est conçu spécifiquement pour les freelances et PME. Il centralise votre facturation, votre gestion de clients et votre marketing au même endroit pour vous faire gagner du temps." 
  }
];

  return (
    <div className="sup-wrapper">
      <div className="sup-container">
        
        {/* En-tête */}
        <br /><br /> 
        <div className="sup-header">
          <span className="sup-tag">Assistance PichFlow</span>
          <h1>Besoin d'un <span>coup de main ?</span></h1>
          <p>Trouvez une réponse immédiate ou contactez notre équipe technique.</p>
        </div>

        <div className="sup-grid">
          
          {/* Section FAQ avec boutons + et - explicites */}
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

          {/* Formulaire stylisé */}
          <div className="sup-form-section">
            <div className="form-card">
              <h2 className="sup-title">Envoyez-nous un message</h2>
              <form className="custom-form">
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
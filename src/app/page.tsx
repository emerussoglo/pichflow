"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const sectionsToReveal = document.querySelectorAll("#features, #pricing");
    sectionsToReveal.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);
  
  const [open, setOpen] = useState(false);

  const testimonials = [
    { name: "Julie B.", text: "La gestion de mes factures n'a jamais été aussi simple et rapide.", color: "orange" },
    { name: "Thomas R.", text: "Un outil indispensable pour tout freelance qui veut gérer sa comptabilité proprement.", color: "green" },
    { name: "Anna L.", text: "Une approche structurée pour améliorer efficacement les fonctionnalités de gestion.", color: "blue" },
    { name: "Marc D.", text: "L'interface est d'une fluidité incroyable. La facturation ne me prend plus que quelques secondes par jour.", color: "purple" },
    { name: "Sarah M.", text: "Le support est réactif et les outils de comptabilité sont d'une clarté exemplaire.", color: "blue" }
  ];

  const duplicatedTestimonials = [...testimonials, ...testimonials];

  interface CurrencyConfig {
    symbol: string;
    rate: number;
    label: string;
    symbolAfter?: boolean;
  }

  const pricingConfig: Record<string, CurrencyConfig> = {
    'EUR': { symbol: '€', rate: 1, label: 'EUR', symbolAfter: true },
    'XOF': { symbol: ' FCFA', rate: 655.957, label: 'XOF', symbolAfter: true },
    'XAF': { symbol: ' FCFA', rate: 655.957, label: 'XAF', symbolAfter: true },
    'USD': { symbol: '$', rate: 1.08, label: 'USD', symbolAfter: false },
    'GBP': { symbol: '£', rate: 0.86, label: 'GBP', symbolAfter: false },
    'CAD': { symbol: 'CA$', rate: 1.48, label: 'CAD', symbolAfter: false },
    'MAD': { symbol: ' DH', rate: 10.95, label: 'MAD', symbolAfter: true },
    'GNF': { symbol: ' FG', rate: 9300, label: 'GNF', symbolAfter: true },
  };

  const [currentImg, setCurrentImg] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev === 3 ? 1 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const [currency, setCurrency] = useState<CurrencyConfig>(pricingConfig['EUR']);

  useEffect(() => {
    async function detectLocation() {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const suggested = data.currency;
        if (pricingConfig[suggested]) {
          setCurrency(pricingConfig[suggested]);
        } else if (data.continent_code === 'AF') {
          setCurrency(pricingConfig['XOF']);
        }
      } catch (error) {
        console.error("Erreur localisation:", error);
      }
    }
    detectLocation();
  }, []);

  const formatPrice = (euroAmount: number): string => {
    if (euroAmount === 0) return currency.symbolAfter ? `0${currency.symbol}` : `${currency.symbol}0`;
    const convertedPrice = Math.round(euroAmount * currency.rate);
    const formattedNumber = convertedPrice.toLocaleString('fr-FR');
    return currency.symbolAfter ? `${formattedNumber}${currency.symbol}` : `${currency.symbol}${formattedNumber}`;
  };

  return (
    <main>
      <section className="hero" id="top">
        <div className="hero-social reveal delay-3">
          <div className="avatar-group">
            <div className="avatar"><img src="https://i.pravatar.cc/100?u=166" alt="user" /></div>
            <div className="avatar"><img src="https://i.pravatar.cc/100?u=167" alt="user" /></div>
            <div className="avatar"><img src="https://i.pravatar.cc/100?u=4" alt="user" /></div>
            <div className="avatar"><img src="https://i.pravatar.cc/100?u=2" alt="user" /></div>
            <div className="avatar"><img src="https://i.pravatar.cc/100?u=151" alt="user" /></div>
          </div>
          <div className="social-text">
            <span className="count" style={{ marginBottom: '8px' }}>+150 utilisateurs</span> 
            <div className="stars">
              <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
              <span className="rating">3.8/5</span>
            </div>
          </div>
        </div>
        
        <br />

        <h1 className="reveal delay-1">
          Simplifiez votre <span className="span1">facturation</span> et <br />
          
          boostez votre gestion.  <br /> 
        </h1>
 
        <p className="reveal delay-2">
         Une seule plateforme pour piloter votre activité. PichFlow vous permet de créer devis, factures 
         et de suivre votre comptabilité dans une interface simple, rapide et automatisable.
        </p>

        <div className="hero-btns reveal delay-3">
          <a href="/inscription" className="btn-primary">
            Essai gratuit <i className="fa-solid fa-circle-arrow-right"></i>
          </a>
          <a href="#features" className="btn-outline">
           Fonctionnalités{" "}
            <i className="fa-solid fa-arrow-down"></i>
          </a> 
        </div>
      </section>

      <section className="dashboard-preview reveal delay-3">
        <div className="preview-container">
          <img src="/img/dashboard-prev.png" alt="Aperçu du Dashboard PitchFlow" className="main-preview" /> 
          
        </div>  
      </section>

      <section id="features" className="features reveal">
        <div className="features-header">
          <h2>
            Fonctionnalités de la <span>plateforme</span>
          </h2>
          <p>PichFlow regroupe les outils essentiels pour les freelances et PME : facturation, devis et gestion financière automatisée.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card active-border">
            <div className="icon-box blue-alt"><i className="fa-solid fa-file-invoice-dollar"></i></div>
            <h3>Facturation</h3>
            <p>Créez des factures professionnelles en quelques secondes, avec envoi automatique par mail et téléchargements illimités.</p> 
          </div>
          <div className="feature-card active-border">
            <div className="icon-box blue-alt"><i className="fa-solid fas fa-receipt"></i></div>
            <h3>Devis Rapides</h3>
            <p>Générez des devis clairs, précis et prêts à l’envoi. Téléchargement PDF illimité et mise en forme automatique.</p>
          </div>
          <div className="feature-card"> 
            <div className="icon-box orange-alt"><i className="fa-solid fa-chart-pie"></i></div>
            <h3>Comptabilité et rapports</h3>
            <p>Vos revenus et dépenses sont automatiquement catégorisés, avec alertes intelligentes et rapports prêts à exporter.</p>
          </div>
        </div>
      </section>

      <section className="showcase-section reveal">
        <div className="showcase-container reveal">
          <div className="showcase-text">
            <h2>PichFlow est <span>idéal</span> pour</h2>
            <ul className="showcase-list">
              <li><i className="fa-solid fa-check"></i> Entrepreneurs</li>
              <li><i className="fa-solid fa-check"></i> Freelances (graphistes, développeurs, rédacteurs, coachs...)</li>
              <li><i className="fa-solid fa-check"></i> Artisans (électriciens, plombiers, décorateurs...)</li>
              <li><i className="fa-solid fa-check"></i> Agences et studios créatifs</li>
              <li><i className="fa-solid fa-check"></i> Prestataires de services B2B</li>
            </ul>
          </div> 
          <div className="showcase-visual">
            <div className="circle-bg"></div>
            <img src="/img/img2.jpg" alt="Entrepreneur" className="person-img" />
            <div className="floating-badge badge-bottom-left">
              <div className="badge-icon-check"><i className="fa-solid fa-check"></i></div> 
              <div className="badge-content">
                <span className="amount">Facture</span>
                <small>Créée</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="video-section">
        <div className="container">
          <div className="video-header">
            <h2>Un tableau de bord simple et intuitif</h2>
            <p>Découvrez comment gérer vos devis et factures en toute sérénité.</p>
          </div>
          <div className="video-wrapper">
            <iframe width="560" height="315" src="https://www.youtube.com/embed/HDDZczlqPvs?rel=0" title="Démonstration PichFlow" frameBorder="0" allowFullScreen></iframe>
          </div> 
        </div>
      </section> 

      <section className="pichflow-automated-compta reveal">
        <div className="pich-container reveal">
          <div className="pich-header">
            <h2 className="pich-title">Votre comptabilité automatisée</h2>
            <p className="pich-subtitle">Grâce à la catégorisation intelligente, au suivi des paiements et aux rapports instantanés, votre gestion devient fluide.</p> 
          </div> <br/>
          <div className="pich-grid">
            <div className="pich-card">
              <div className="pich-image-box bg-soft-blue">
                <div className="pich-badge">
                  <span>Valider et <br /> transmettre <br/> <b>facture électronique</b></span>
                  <button>valider</button>
                </div>
                <img src={`/img/fact${currentImg}.png`} alt="Conformité" style={{ transition: 'all 0.5s ease' }} />
              </div>
              <div className="pich-content">
                <h3>Conformité simplifiée</h3>
                <p>Assurez une conformité native avec la facturation électronique sans effort supplémentaire.</p>
              </div>
            </div>
            <div className="pich-card">
              <div className="pich-image-box bg-soft-blue"> 
                <div className="pich-badge">
                  <span>Suivi en <br/> <b>temps réel</b></span>
                  <button>suivi</button>
                </div>
                <img src="/img/img8.jpg" alt="suivi" />
              </div>
              <div className="pich-content">
                <h3>Vérification d'authenticité</h3>
                <p>Vérifiez instantanément la validité d'une facture ou d'un devis émis sur Pichflow pour éviter toute falsification.</p>
              </div>
            </div>
          </div>
          <div className="pich-footer">
            <a href="/verifier" className="btn-primary" style={{ display: 'inline-flex' }}>Vérifier une facture ou un devis</a>
          </div>
        </div> 
      </section>

      <section className="testimonials reveal" id="testimonials">
        <div className="features-header">
          <h3>Ce qu'ils <span>disent de nous</span></h3>
          <p>Découvrez les avis de nos utilisateurs ci-dessous.</p>
        </div>
        <div className="testimonials-container">
          <div className="testimonials-marquee">
            <div className="testimonials-track">
              {duplicatedTestimonials.map((item, index) => (
                <div key={index} className="testimonial-card">
                  <p className="testimonial-text">“{item.text}”</p>
                  <div className="testimonial-user">
                    <div className="testimonial-avatar"><i className="fa-solid fa-user"></i></div>
                    <span className="testimonial-name">{item.name}</span>
                  </div>
                  <div className={`card-gradient`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="faq-container">
          <div className="faq-header">
            <span className="faq-badge">FAQ</span>
            <h2>Questions <span>fréquentes</span></h2>
            <p>Tout ce que vous devez savoir sur PichFlow</p>
          </div>
          <div className="faq-list">
            {[
              { q: "Comment générer une facture ?", a: "Commencez par configurer vos informations dans les paramètres. Rendez-vous dans la section Factures, remplissez le formulaire, puis cliquez sur Générer." },
              { q: "Mes données sont-elles sécurisées ?", a: "Oui. PichFlow stocke vos données de manière sécurisée et garantit leur confidentialité." },
              { q: "Puis-je utiliser PichFlow sur mobile ?", a: "Absolument. PichFlow est entièrement responsive pour gérer votre activité où que vous soyez." }
            ].map((item, i) => (
              <details key={i} className="faq-item">
                <summary className="faq-question">{item.q}<i className="fa-solid fa-chevron-down"></i></summary>
                <div className="faq-answer">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="final-cta reveal">
        <div className="cta-content">
          <h2>Prêt à propulser votre activité ?</h2>
          <p>Rejoignez plus de 150 professionnels qui automatisent déjà leur gestion avec PichFlow.</p> 
          <div className="hero-btns">
            <a href="/inscription" className="btn-white">Essayez maintenant <i className="fa-solid fa-rocket"></i></a>
          </div>
          <span className="no-card">Aucune carte de crédit requise pour commencer votre essai.</span>
        </div>
      </section>

      <section id="pricing" className="pricing reveal">
        <div className="pricing-header">
          <h2>Des tarifs <span>simples et flexibles</span></h2>
          <p>Essayez gratuitement, puis rechargez vos crédits selon vos besoins.</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Essai Gratuit</h3>
            <div className="price">{formatPrice(0)}</div>
            <ul className="price-features">
              <li><i className="fa-solid fa-circle-check"></i> Crédits offerts</li>
              <li><i className="fa-solid fa-circle-check"></i> Facturation & rapports</li>
            </ul>
            <button className="btn-outline-pricing">Essai gratuit</button>
          </div>
          <div className="pricing-card featured">
            <h3>Pack Essentiel</h3>
            <div className="price">{formatPrice(1.525)}<span>/80 crédits</span></div>
            <ul className="price-features">
              <li><i className="fa-solid fa-circle-check"></i> 80 crédits inclus</li>
              <li><i className="fa-solid fa-circle-check"></i> Facturation illimitée</li>
            </ul>
            <button className="btn-primary-pricing">Acheter pack</button>
          </div>
          <div className="pricing-card"> 
            <h3>Pack Business</h3>
            <div className="price">{formatPrice(2.438)}<span>/200 crédits</span></div> 
            <ul className="price-features">
              <li><i className="fa-solid fa-circle-check"></i> 200 crédits inclus</li>
              <li><i className="fa-solid fa-circle-check"></i> Économisez 20%</li>
            </ul>
            <button className="btn-blue-pricing">Acheter pack</button>
          </div>
        </div>
      </section>

      <button className="chatbot-button" aria-label="Ouvrir le chat" onClick={() => setOpen(!open)}><i className="fa-solid fa-comments"></i></button>
      {open && (
        <div className="chatbot-container">
          <iframe src="https://www.chatbase.co/chatbot-iframe/6Zi-FfmZynEP6KSsGyXKE?lang=fr" style={{ width: "100%", height: "100%" }}></iframe>
        </div>
      )}
      <a href="#top" className="back-to-top" aria-label="Retour en haut"><i className="fa-solid fa-circle-arrow-up"></i></a>
    </main>
  ); 
}
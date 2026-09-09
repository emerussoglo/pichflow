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

    { name: "Kodjo T.", text: "La gestion de mes factures normalisées n'a jamais été aussi simple.", color: "orange" },
    { name: "Aïcha S.", text: "Un outil indispensable pour mon entreprise, je gagne un temps précieux sur ma comptabilité.", color: "green" },
    { name: "Moussa D.", text: "Enfin une solution qui comprend les besoins des entrepreneurs au Bénin.", color: "blue" },
    { name: "Bénédicte K.", text: "Interface fluide et rapide. Ma facturation est réglée en quelques secondes.", color: "purple" },
    { name: "Fabrice O.", text: "Le support est réactif et les outils sont parfaitement adaptés à notre marché.", color: "blue" }
  
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
    'USD': { symbol: '$', rate: 1.08, label: 'USD', symbolAfter: false },
  };

  const [currentImg, setCurrentImg] = useState(1);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev === 3 ? 1 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const [currency, setCurrency] = useState<CurrencyConfig>(pricingConfig['XOF']);

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
            <div className="avatar"><img src="/img/h/h1.jpeg" alt="user" /></div>
            <div className="avatar"><img src="https://i.pravatar.cc/100?u=167" alt="user" /></div>
            <div className="avatar"><img src="/img/h/h2.jpeg" alt="user" /></div>
            <div className="avatar"><img src="/img/h/f1.jpeg" alt="user" /></div>
            <div className="avatar"><img src="/img/h/f2.jpeg" alt="user" /></div>
            <div className="avatar"><img src="/img/h/h3.jpeg" alt="user" /></div>
          </div>
          <div className="social-text">
            <span className="count" style={{ marginBottom: '8px' }}>+150 entrepreneurs</span> 
            <div className="stars">
              <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
              <span className="rating">4.8/5</span>
            </div>
          </div>
        </div> 
        
        <br />

        <h1 className="reveal delay-1">
          Simplifiez votre <br /> <span className="span1">facturation</span> et boostez <br />
          votre gestion.  <br /> 
        </h1>
 
        <p className="reveal delay-2">
          La solution tout-en-un pour les entreprises au Bénin. Créez vos factures normalisées, gérez vos devis et pilotez votre activité en toute conformité, sans avoir besoin d'être un expert-comptable.
        </p> 

        <div className="hero-btns reveal delay-3">
          <a href="/inscription" className="btn-primary">
            Démarrer gratuitement <i className="fa-solid fa-circle-arrow-right"></i>
          </a>
          <a href="#features" className="btn-outline">
            Nos fonctionnalités{" "}
            {/* <i className="fa-solid fa-arrow-down"></i> */}
          </a> 
        </div>
      </section>

      <section className="dashboard-preview reveal delay-3">
        <div className="preview-container">
          <img src="/img/dashboard-prev.png" alt="Aperçu du Dashboard PichFlow" className="main-preview" /> 
        </div>  
      </section>

      <section id="features" className="features reveal delay-2">
        <div className="features-header">
          <h2>
            Tout ce qu'il vous faut pour gérer<span> votre activité</span>.
          </h2>
          <p>PichFlow offre une suite financière complète pour simplifier la vie des entrepreneurs et petites entreprises au Bénin.</p>
        </div>
        <div className="features-grid reveal delay-3">
  <div className="feature-card active-border reveal delay-2">
    <div className="icon-box blue-alt"><i className="fa-solid fa-file-invoice-dollar"></i></div>
    <h3>Factures normalisées</h3>
    <p>Générez des factures conformes aux exigences fiscales locales en quelques secondes.</p> 
  </div>
  
  <div className="feature-card active-border reveal delay-2">
    <div className="icon-box blue-alt"><i className="fa-solid fas fa-receipt"></i></div>
    <h3>Devis professionnels</h3>
    <p>Créez des devis clairs, professionnels et prêts à être transformés en factures.</p>
  </div>
  
  <div className="feature-card reveal delay-2"> 
    <div className="icon-box orange-alt"><i className="fa-solid fa-chart-pie"></i></div>
    <h3>Gestion simplifiée</h3>
    <p>Suivez vos revenus, dépenses et performances depuis un espace unique.</p>
  </div>

  <div className="feature-card reveal delay-2"> 
    <div className="icon-box blue-alt"><i className="fa-solid fa-users"></i></div>
    <h3>Gestion clients</h3>
    <p>Centralisez vos clients et retrouvez rapidement toutes leurs informations.</p>
  </div>

  <div className="feature-card reveal delay-2"> 
    <div className="icon-box blue-alt"><i className="fa-solid fa-shield-halved"></i></div>
    <h3>Vérification des documents</h3>
    <p>Permettez à vos clients de vérifier instantanément l’authenticité de vos documents.</p>
  </div>

  <div className="feature-card reveal delay-2"> 
    <div className="icon-box blue-alt"><i className="fa-solid fa-envelope-open-text"></i></div>
    <h3>Rapports & activité</h3>
    <p>Obtenez une vision claire de votre activité grâce à des données faciles à comprendre.</p>
  </div>
</div>
      </section>
 
      <section className="showcase-section reveal delay-1">
  <div className="showcase-container reveal delay-1">
    
    {/* En-tête centré */}
    <div className="showcase-header-center">
      {/* <span className="showcase-badge-top">Pour chaque activité</span> */}
      <h2>Conçu pour ceux qui font avancer <span>l'économie locale</span>.</h2>
      <p>Que vous soyez indépendant ou à la tête d'une PME, PichFlow s'adapte à votre activité.</p>
    </div>

    {/* Grande image principale avec effet */}
    <div className="showcase-visual-main reveal delay-1">
      <div className="circle-bg"></div>
      <img src="/img/image-3.jpg" alt="Entrepreneur local" className="person-img" />
      <div className="floating-badge badge-bottom-left">
        {/* <div className="badge-icon-check"><i className="fa-solid fa-check"></i></div> 
        <div className="badge-content">
          <span className="amount">Conforme</span>
          <small>DGI</small>
        </div> */}
      </div>
    </div>

    {/* Grille des 6 avatars / profils animés */}
    <div className="avatars-grid">
      <div className="avatar-card">
        <div className="avatar"><img src="/img/h/h3.jpeg" alt="Freelances" /></div>
        <span>Freelances</span>
      </div>
      <div className="avatar-card">
        <div className="avatar"><img src="https://i.pravatar.cc/100?u=167" alt="Commerçants" /></div>
        <span>Commerçants</span>
      </div>
      <div className="avatar-card">
        <div className="avatar"><img src="/img/h/h5.jpg" alt="Artisans" /></div>
        <span>Artisans</span>
      </div>
      <div className="avatar-card">
        <div className="avatar"><img src="/img/h/h1.jpeg" alt="Agences" /></div>
        <span>Agences</span>
      </div>
      <div className="avatar-card">
        <div className="avatar"><img src="/img/h/f2.jpeg" alt="Consultants" /></div>
        <span>Consultants</span>
      </div>
      <div className="avatar-card">
        <div className="avatar"><img src="/img/h/h4.jpg" alt="PME" /></div>
        <span>PME</span>
      </div>
    </div>

  </div>
</section>

      <section className="video-section reveal delay-1">
        <div className="container">
          <div className="video-header">
            <h2>PichFlow en action</h2>
            <p>Un tableau de bord intuitif pour gérer votre entreprise, sans comptable.</p>
          </div>
          <div className="video-wrapper">
            <iframe width="600" height="315" src="https://www.youtube.com/embed/HDDZczlqPvs?rel=0" title="Démonstration PichFlow" frameBorder="0" allowFullScreen></iframe>
          </div> 
        </div>
      </section> 

      <section className="pichflow-automated-compta reveal">
  <div className="pich-container reveal"> 
    <div className="pich-header">
      {/* <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Confiance</span> */}
      <h2 className="pich-title">La confiance avant <span>tout</span>.</h2>
      <p className="pich-subtitle">Vos documents doivent être fiables, vérifiables et conformes.</p> 
    </div>
    
    <div className="pich-grid">
      {/* Carte 1 */}
      <div className="pich-card">
        <div>
          <div className="pich-card-top">
            <div className="pich-icon-box">
              <i className="fa-solid fa-file-invoice"></i>
            </div>
            <span className="pich-status-badge">Valide</span>
          </div>
          <div className="pich-content">
            <h3>Conformité fiscale</h3>
            <p>Respectez vos obligations grâce à des documents normalisés, reconnus et acceptés.</p>
          </div>
        </div>
        <div className="pich-image-box">
          <img src={`/img/fact${currentImg}.png`} alt="Facture normalisée" style={{ transition: 'all 0.5s ease' }} />
        </div>
      </div>

      {/* Carte 2 */}
      <div className="pich-card">
        <div>
          <div className="pich-card-top">
            <div className="pich-icon-box">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <span className="pich-status-badge">Vérifié</span>
          </div>
          <div className="pich-content">
            <h3>Authenticité vérifiée</h3>
            <p>Vos clients peuvent vérifier l'authenticité de vos documents instantanément.</p>
          </div>
        </div>
        <div className="pich-image-box">
          <img src="/img/img8.jpg" alt="Vérification de document" />
        </div>
      </div>
    </div>

    <div className="pich-footer">
      <a href="/verifier" className="btn-primary" style={{ display: 'inline-flex', padding: '16px 35px', borderRadius: '50px', background: '#2563eb', color: '#fff', textDecoration: 'none', fontWeight: 700, gap: '10px', alignItems: 'center' }}>
        Vérifier une facture ou un devis <i className="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  </div> 
</section>

      <section className="testimonials reveal delay-1" id="testimonials">
        <div className="features-header">
          <h3>La communauté <span>PichFlow</span>.</h3>
          <p>Ils ont adopté la solution pour faire croître leur entreprise au Bénin.</p>
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
            <h2>On réponds à <span>tout</span>.</h2>
            <p>Tout ce que vous devez savoir pour démarrer</p>
          </div>
          <div className="faq-list">
            {[
              
              { q: "PichFlow permet-il de créer des factures normalisées ?", a: "Oui, PichFlow est conçu pour aider les entreprises au Bénin à éditer des factures conformes aux normes fiscales locales et sécurisées." },
              { q: "Est-ce que je peux utiliser PichFlow sans comptable ?", a: "Absolument. La plateforme est conçue pour être simple et intuitive, accessible à tout entrepreneur, avec ou sans base en comptabilité." },
              { q: "Quelles sont les méthodes de paiement disponibles ?", a: "PichFlow s'adapte à vos besoins. Vous pouvez gérer vos documents et nous intégrons les solutions de paiement mobiles locales." },
              { q: "Comment fonctionnent les crédits sur PichFlow ?", a: "Les crédits vous permettent de générer vos documents et d'utiliser les fonctionnalités avancées. Vous commencez gratuitement, puis vous rechargez avec le pack de votre choix selon vos besoins." },
              { q: "Mes données et factures sont-elles sécurisées ?", a: "Oui, toutes vos données de facturation et de comptabilité sont strictement protégées et hébergées sur des serveurs hautement sécurisés." },
              { q: "Comment mes clients peuvent-ils vérifier une facture ?", a: "Chaque document émis dispose d'options de traçabilité permettant de valider son authenticité instantanément via notre module de vérification dédié." }
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
          <h2>Prêt à propulser votre entreprise ?</h2>
          <p>Rejoignez les entrepreneurs béninois qui ont déjà automatisé leur gestion avec PichFlow.</p> 
          <div className="hero-btns">
            <a href="/inscription" className="btn-white">Essayer gratuitement <i className="fa-solid fa-rocket"></i></a>
          </div>
          <span className="no-card">Aucune carte bancaire requise pour commencer votre essai.</span>
        </div>
      </section>

     <section id="pricing" className="pricing reveal">
        <div className="pricing-header">
          <h2>Des tarifs <span>simples et accessibles</span></h2>
          <p>Commencez gratuitement, puis rechargez vos crédits selon votre volume d'activité pour gérer vos factures en toute sérénité.</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Essai Gratuit</h3>
            <div className="price">{formatPrice(0)}</div>
            <ul className="price-features">
              <li><i className="fa-solid fa-circle-check"></i> Crédits offerts pour tester</li>
              <li><i className="fa-solid fa-circle-check"></i> Facturation & rapports</li>
              <li><i className="fa-solid fa-circle-check"></i> Génération de devis</li>
              <li><i className="fa-solid fa-circle-check"></i> Support par email</li>
            </ul>
            <a href="/inscription" className="btn-outline-pricing" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Essai gratuit</a>
          </div>
          
          <div className="pricing-card featured">
            <h3>Pack Essentiel</h3>
            <div className="price">{formatPrice(1.525)}<span>/80 crédits</span></div>
            <ul className="price-features">
              <li><i className="fa-solid fa-circle-check"></i> 80 crédits inclus</li>
              <li><i className="fa-solid fa-circle-check"></i> Facturation illimitée</li>
              <li><i className="fa-solid fa-circle-check"></i> Devis et reçus instantanés</li>
              <li><i className="fa-solid fa-circle-check"></i> Support prioritaire</li>
            </ul>
            <a href="/buy-credits" className="btn-primary-pricing" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Acheter pack</a>
          </div>

          <div className="pricing-card"> 
            <h3>Pack Business</h3>
            <div className="price">{formatPrice(2.438)}<span>/200 crédits</span></div> 
            <ul className="price-features">
              <li><i className="fa-solid fa-circle-check"></i> 200 crédits inclus</li>
              <li><i className="fa-solid fa-circle-check"></i> Économisez 20%</li>
              <li><i className="fa-solid fa-circle-check"></i> Volume élevé pour PME</li>
              <li><i className="fa-solid fa-circle-check"></i> Gestion multi-clients</li>
            </ul>
            <a href="/buy-credits" className="btn-blue-pricing" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Acheter pack</a>
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
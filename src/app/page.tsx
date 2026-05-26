"use client";
import React, { useEffect, useState } from "react";

import Link from "next/link";

export default function Home() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2, // Se déclenche quand 15% de la section est visible au scroll
    }; 

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          // Une fois l'animation jouée, on peut arrêter d'observer la section
          observer.unobserve(entry.target);
        }
      }); 
    }, observerOptions);

    // Cible les sections spécifiques pour le déclenchement au scroll
    const sectionsToReveal = document.querySelectorAll("#features, #pricing");
    sectionsToReveal.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);
   const [open, setOpen] = useState(false);

  const testimonials = [
  { name: "Julie B.", text: "L'IA de PichFlow comprend parfaitement mon ton de voix pour mes articles de blog marketing.", color: "orange" },
  { name: "Thomas R.", text: "Un outil indispensable pour tout freelance qui veut scaler son activité proprement.", color: "green" },
  { name: "Anna L.", text: "Nous avons privilégié une approche structurée pour améliorer efficacement les fonctionnalités de gestion.", color: "blue" },
  { name: "Marc D.", text: "L'interface est d'une fluidité incroyable. La facturation ne me prend plus que quelques secondes par jour.", color: "purple" },
  { name: "Sarah M.", text: "Le support est réactif et les outils de comptabilité sont d'une clarté exemplaire.", color: "blue" }
];

const duplicatedTestimonials = [...testimonials, ...testimonials];

// Types pour éviter les erreurs TypeScript (soulignements rouges)
interface CurrencyConfig {
  symbol: string;
  rate: number;
  label: string;
  symbolAfter?: boolean; // Pour savoir si on met le symbole après le chiffre
}

const pricingConfig: Record<string, CurrencyConfig> = {
  'EUR': { symbol: '€', rate: 1, label: 'EUR', symbolAfter: true },
  'XOF': { symbol: ' FCFA', rate: 655.957, label: 'XOF', symbolAfter: true },
  'XAF': { symbol: ' FCFA', rate: 655.957, label: 'XAF', symbolAfter: true },
  'USD': { symbol: '$', rate: 1.08, label: 'USD', symbolAfter: false },
  'GBP': { symbol: '£', rate: 0.86, label: 'GBP', symbolAfter: false },
  'CAD': { symbol: 'CA$', rate: 1.48, label: 'CAD', symbolAfter: false },
  'MAD': { symbol: ' DH', rate: 10.95, label: 'MAD', symbolAfter: true }, // Maroc
  'GNF': { symbol: ' FG', rate: 9300, label: 'GNF', symbolAfter: true },   // Guinée
};


const [currentImg, setCurrentImg] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev === 3 ? 1 : prev + 1));
    }, 3000);

    return () => clearInterval(timer); // Nettoyage du timer à la fermeture
  }, []);

// On double la liste pour l'effet infini

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
        // Par défaut pour l'Afrique si la devise spécifique n'est pas listée
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

  // Calcul du prix converti
  const convertedPrice = Math.round(euroAmount * currency.rate);
  
  // Formatage propre avec séparateur de milliers
  const formattedNumber = convertedPrice.toLocaleString('fr-FR');

  // Placement du symbole selon la configuration
  return currency.symbolAfter 
    ? `${formattedNumber}${currency.symbol}` 
    : `${currency.symbol}${formattedNumber}`;
};
  
  return (
    <main>
      <section className="hero" id="top">
        
        

           <div className="hero-social reveal delay-3">
          <div className="avatar-group">
            <div className="avatar">
              <img src="https://i.pravatar.cc/100?u=166" alt="user" />
            </div>
            <div className="avatar">
              <img src="https://i.pravatar.cc/100?u=167" alt="user" />
            </div>
            <div className="avatar">
              <img src="https://i.pravatar.cc/100?u=4" alt="user" />
            </div>
            <div className="avatar">
              <img src="https://i.pravatar.cc/100?u=2" alt="user" />
            </div>
            <div className="avatar">
              <img src="https://i.pravatar.cc/100?u=151" alt="user" />
            </div>
          </div>

          <div className="social-text">
            <span className="count">+150 utilisateurs</span>
            <div className="stars">
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <span className="rating">3.8/5</span>
            </div>
          </div>
        </div>
        
        <br />

        {/* Titre animé */}
        <h1 className="reveal delay-1">
          Votre outil de <span className="span1"> croissance  </span>
          <br />
           en un seul endroit.  <br /> 
        </h1>
 
        {/* Sous-titre animé */}
        <p className="reveal delay-2">
         Une seule plateforme pour développer votre activité. PichFlow vous permet de créer devis, factures, 
         contenus marketing et textes de copywriting dans une interface simple, rapide et automatisable.
        </p>

        {/* Boutons animés */}
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
          <img
            src="/img/dashboard-prev.png"
            alt="Aperçu du Dashboard PitchFlow"
            className="main-preview"
          /> 
          <div className="floating-card update-card">
            <i className="fa-solid fa-check-circle"></i> Mise à jour effectuée
          </div>
          <div className="floating-card export-card">
            <i className="fa-solid fa-file-export"></i> Rapport prêt à exporter
          </div>
        </div>  
      </section>

      <section id="features" className="features reveal">
        <div className="features-header">
          <h2>
            Fonctionalités de la <span> plateforme </span>
          </h2>
          <p>
           PichFlow regroupe les outils essentiels pour les freelances, particuliers et PME : 
           marketing, copywriting, facturation, devis et gestion financière automatisée.
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card active-border">
            <div className="icon-box blue-alt">
              <i className="fa-solid fa-file-invoice-dollar"></i>
            </div>
            <h3>Facturation</h3>
            <p>
              Créez des factures professionnelles en quelques secondes, avec envoi automatique par mail et téléchargements illimités. 
              Suivi automatique des paiements inclus.
            </p>
          </div>
          <div className="feature-card active-border">
            <div className="icon-box blue-alt">
              <i className="fa-solid fas fa-receipt"></i>
            </div>
            <h3>Devis Rapides</h3>
            <p>
              Générez des devis clairs, précis et prêts à l’envoi. 
              Téléchargement PDF illimité et mise en forme automatique.
            </p>
          </div>
          <div className="feature-card">
            <div className="icon-box blue">
              <i className="fa-solid fa-handshake"></i>
            </div>
            <h3>Contenu Marketing</h3>
            <p>
              Produisez des articles de blog SEO, posts pour réseaux sociaux, 
              scripts vidéo et emails marketing en un clic, adaptés à votre niche.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon-box orange"> 
              <i className="fa-solid fa-lightbulb"></i>
            </div>
            <h3>Copywriting</h3>
            <p>
              Générez des textes publicitaires percutants utilisant les meilleures 
              méthodes : AIDA, PAS, BAB, 4C, et plus encore.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon-box orange-alt">
              <i className="fa-solid fa-chart-pie"></i>
            </div>
            <h3>Comptabilité et rapport</h3>
            <p>
              Vos revenus et dépenses sont automatiquement catégorisés, 
              avec alertes intelligentes et rapports prêts à exporter.
            </p>
          </div>
  
          <div className="feature-card"> 
            <div className="icon-box blue">
              <i className="fa-solid fa-circle-nodes"></i>
            </div>
            <h3>Multi-plateformes</h3>
            <p>Créez du contenu optimisé pour Facebook, Instagram, LinkedIn, TikTok, 
              YouTube, email marketing et autres canaux. Vous pouvez aussi automatiser les publications.</p>
          </div>
        </div>
        
        
     

      </section>


<section className="showcase-section reveal">
        <div className="showcase-container reveal">
          <div className="showcase-text">
            <h2> 
             PichFlow est  <span>ideal</span> pour
            </h2>
            
            <ul className="showcase-list">
              <li>
  <i className="fa-solid fa-check"></i> Entrepreneurs
</li>
<li>
  <i className="fa-solid fa-check"></i> Petites entreprises de services
</li>
<li>
  <i className="fa-solid fa-check"></i> Petites entreprises de services
</li>
<li>
  <i className="fa-solid fa-check"></i>Freelances (graphistes, développeurs, redacteurs, coachs, monteurs...)
</li>
<li>
  <i className="fa-solid fa-check"></i>Artisans (électriciens, plombiers, décorateurs...)
</li>
<li>
  <i className="fa-solid fa-check"></i> Agences (marketing, communication, studios créatifs...)
</li>
<li>
  <i className="fa-solid fa-check"></i> Commerçants et prestataires de services (formateurs, prestataires B2B...)
</li>

            </ul>
          </div>
          <div className="showcase-visual">
            <div className="circle-bg"></div>
            <img
              src="/img/img2.jpg"
              alt="Entrepreneur"
              className="person-img"
            />
            <div className="floating-badge badge-top-left">
              <div className="badge-logo">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <div className="badge-content">
                <span>PichFlow </span>
                <small>Marketing Engine</small>
              </div>
            </div>
            <div className="floating-badge badge-mid-right">
              <div className="badge-logo-globe">
                <i className="fa-solid fa-globe"></i>
              </div>
            </div>
            <div className="floating-badge badge-bottom-left">
              <div className="badge-icon-check">
                <i className="fa-solid fa-check"></i>
              </div> 
              <div className="badge-content">
                <span className="amount">Facture</span>
                <small>Créee</small>
              </div>
            </div>
            <div className="dot dot-1"></div>
            <div className="dot dot-2"></div>
          </div>
        </div>
      </section>



<section className="video-section">
  <div className="container">
    <div className="video-header">
      <h2>Un tableau de bord simple et intuitif</h2>
      <p>Comment créer des devis, des factures ou du contenu marketing ou copywriting ?</p>
    </div>
    
    <div className="video-wrapper">
      <iframe   
  width="560" 
  height="315" 
  src="https://www.youtube.com/embed/HDDZczlqPvs?rel=0" 
  title="Démonstration PichFlow" 
  frameBorder="0" 
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
  allowFullScreen>
</iframe>
    </div> 
  </div>
</section> 

<section className="pichflow-automated-compta reveal">
  <div className="pich-container reveal">
    {/* En-tête centré */}
    <div className="pich-header">
      <h2 className="pich-title">Votre comptabilité automatisée</h2>
      <p className="pich-subtitle">
        Grâce à la catégorisation intelligente, au suivi des paiements et aux rapports instantanés, 
        votre gestion devient plus simple, plus rapide et totalement fluide.
         </p> 
    </div> <br/>

    <div className="pich-grid">
      
      {/* Carte 1 */}
      <div className="pich-card">

 <div className="pich-image-box bg-soft-blue">
      {/* Le petit popup qui glisse */}
      <div className="pich-badge">
        <span>Valider et <br /> transmettre <br/> <b> facture électronique </b> </span>
        <button>valider</button>
      </div>
      
      {/* L'image dynamique */}
      <img 
        src={`/img/fact${currentImg}.png`} 
        alt="Conformité" 
        style={{ transition: 'all 0.5s ease' }} // Petit bonus pour une transition douce
      />
    </div>

  <div className="pich-content">
    <h3>Conformité simplifiée</h3>
    <p>Assurez une conformité native avec la facturation électronique sans effort supplémentaire.</p>
  </div>
</div>

      {/* Carte 2 */}
      <div className="pich-card">
  <div className="pich-image-box bg-soft-orange">
     {/* L'image change dynamiquement entre mk1.png, mk2.png et mk3.png */}
     <img 
       src="/img/img9.jpg"
       alt="Création" 
       style={{ transition: 'all 0.5s ease' }}  
     />
  </div>
  <div className="pich-content">
    <h3>Copywriting & Marketing</h3>
    <p>Personnalisez vos contenu en quelques clics grâce à notre outil intuitif.</p>
  </div>
</div>
      {/* Carte 3 */}
    
       <div className="pich-card">
  <div className="pich-image-box bg-soft-blue"> 
    {/* Le petit popup qui glisse */}
    <div className="pich-badge">
      <span>Suivi en  <br/> <b> temps réel </b> </span>
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

    {/* Bouton centré avec ton effet miroir */}
    <div className="pich-footer">
      <a href="/verifier" className="btn-primary" style={{ display: 'inline-flex' }}>
  Vérifier une facture ou un devis
</a>
    </div>
  </div> 
</section>


<section className="integration-wrapper reveal">
  {/* SECTION GAUCHE : TEXTE */}
  <div className="integration-left">
    <h2>Automatisez du contenu sur vos différents <span> canaux</span></h2>
    <ul className="network-list">
      <li><i className="fa-solid fa-check"></i> Réseaux sociaux: Facebook, Instagram, LinkedIn, TikTok, YouTube</li>
      <li><i className="fa-solid fa-check"></i> Emailing & communication: Campagnes email marketing, messages professionnels, newsletters</li>
      <li><i className="fa-solid fa-check"></i> Communautés & plateformes: Discord, Reddit et autres espaces de discussion</li>

    </ul>
  </div>
 
  {/* SECTION DROITE : L'ORBITE */}
  <div className="integration-right-visual">
    <div className="orbit-container">
      {/* Image centrale */}
      <div className="center-image">
        <img src="/img/img3.jpg" alt="User" />
      </div>

      {/* Icônes orbitantes */}
      <div className="orbit-icons-rotating">
        <div className="icon-wrapper facebook"><i className="fa-brands fa-facebook"></i></div>
        <div className="icon-wrapper linkedin"><i className="fa-brands fa-linkedin"></i></div>
        <div className="icon-wrapper instagram"><i className="fa-brands fa-instagram"></i></div>
        <div className="icon-wrapper email"><i className="fa-solid fa-envelope"></i></div>
        <div className="icon-wrapper youtube"><i className="fa-brands fa-youtube"></i></div>
        <div className="icon-wrapper tiktok"><i className="fa-brands fa-tiktok"></i></div>
        <div className="icon-wrapper discord"><i className="fa-brands fa-discord"></i></div>
        <div className="icon-wrapper reddit"><i className="fa-brands fa-reddit"></i></div>
      </div>

      {/* Cercles décoratifs */}
      <div className="orbit-ring ring-1"></div>
      <div className="orbit-ring ring-2"></div>
    </div>
  </div>
</section>



      

<section className="testimonials reveal" id="testimonials">
      <div className="features-header">
        <h3>Ce qu'ils  <span>disent de nous</span></h3>
        <p>Découvrez les avis de nos utilisateurs ci-dessous.</p>
      </div>
 
      <div className="testimonials-container">
        {/* Le wrapper qui contient l'animation */}
        <div className="testimonials-marquee">
          <div className="testimonials-track">
            {duplicatedTestimonials.map((item, index) => (
              <div key={index} className="testimonial-card">
                <p className="testimonial-text">“{item.text}”</p>
                <div className="testimonial-user">
                  <div className="testimonial-avatar">
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <span className="testimonial-name">{item.name}</span>
                </div>
                <div className={`card-gradient `}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    

      {/* --- SECTION FAQ --- */}
<section className="faq-section">
  <div className="faq-container">
    <div className="faq-header">
      <span className="faq-badge">FAQ</span>
      <h2>Questions <span>fréquentes</span> </h2>
      <p>Tout ce que vous devez savoir sur PichFlow</p>
    </div>
 
    <div className="faq-list">
      {[
        { 
          q: "Comment générer une facture ?", 
          a: "Commencez par configurer vos informations de facturation dans les paramètres de votre dashboard.Ensuite, rendez-vous dans la section Factures, remplissez le formulaire, puis cliquez sur Générer.Votre facture est automatiquement créée et disponible en PDF instantané." 
        },
        { 
          q: "Mes données sont-elles sécurisées ?", 
          a: "Oui. PitchFlow stocke vos données de manière sécurisée et garantit leur confidentialité grâce à des systèmes de protection avancés." 
        },
        {
          q: "Est-ce gratuit ?", 
          a: "Oui. Lors de votre inscription, vous recevez 15 crédits gratuits pour tester toutes les fonctionnalités : facturation, devis, marketing et copywriting." 
        },
        { 
          q: "Puis-je utiliser PitchFlow sur mobile ?", 
          a: "Absolument. PitchFlow est entièrement responsive et optimisé pour smartphones et tablettes, vous permettant de gérer votre activité où que vous soyez." 
        }
      ].map((item, i) => (
        <details key={i} className="faq-item">
          <summary className="faq-question">
            {item.q}
            <i className="fa-solid fa-chevron-down"></i>
          </summary>
          <div className="faq-answer">
            {item.a}
          </div>
        </details>
      ))}
    </div>
  </div>
</section>

 
  <section className="final-cta reveal">
        <div className="cta-content">
          <h2>Prêt à propulser votre activité ?</h2>
          <p>
            Rejoignez plus de 150 professionnels qui automatisent déjà 
            leur gestion avec PitchFlow et gagnent du temps chaque jour.
          </p> 
          <div className="hero-btns">
            <a href="/inscription" className="btn-white">
              Essayez maintenant <i className="fa-solid fa-rocket"></i>
            </a>
          </div>
          <span className="no-card">
            Aucune carte de crédit requise pour commencer votre essai.
          </span>
        </div>
      </section>



    <section id="pricing" className="pricing reveal">
  <div className="pricing-header">
    <h2>
      Des tarifs <span>simples et flexibles</span>
    </h2>
    <p>
      Essayez gratuitement pendant 7 jours, puis rechargez vos crédits
      selon vos besoins.
    </p>
  </div>

  <div className="pricing-grid">
    <div className="pricing-card">
      <h3>Essai Gratuit</h3>
      <div className="price">{formatPrice(0)}</div>
      <p className="price-desc">
        Testez la puissance de PichFlow sans engagement avec 15 crédits gratuits à l'inscription
      </p>
      <ul className="price-features">
        <li><i className="fa-solid fa-circle-check"></i> 15 crédits inclus pour tester</li>
        <li><i className="fa-solid fa-circle-check"></i> Accès complet aux outils IA</li>
        <li><i className="fa-solid fa-circle-check"></i> Marketing & Copywriting</li>
        <li><i className="fa-solid fa-circle-check"></i> Facturation & rapports</li>
      </ul>
      <button className="btn-outline-pricing">Essai gratuit : 15 crédits</button>
    </div>

    <div className="pricing-card featured">
      <div className="popular-badge">
        <i className="fa-solid fa-bolt"></i> Plus Populaire
      </div> 
      <h3>Pack Essentiel</h3>
      <div className="price">
        {formatPrice(1.525)}<span>/80 crédits</span>
      </div>
      <p className="price-desc">Idéal pour vos besoins </p>
      <ul className="price-features">
        <li><i className="fa-solid fa-circle-check"></i> <strong>80 crédits</strong> automatique</li>
        <li><i className="fa-solid fa-circle-check"></i> Génération de contenu haute qualité</li>
        <li><i className="fa-solid fa-circle-check"></i> Accès illimité aux différents outils</li>
        <li><i className="fa-solid fa-circle-check"></i> Export PDF disponible</li>
      </ul>
      <button className="btn-primary-pricing">+ 80 crédits</button>
    </div>

    <div className="pricing-card"> 
      <h3>Pack Business</h3>
      <div className="price"> 
        {formatPrice(2.438)}<span>/200 crédits</span>
      </div> 
      <p className="price-desc">Economique et approprié</p>
      <ul className="price-features">
        <li><i className="fa-solid fa-circle-check"></i> <strong>200 crédits</strong> automatique</li>
        <li><i className="fa-solid fa-circle-check"></i> Économisez 20% sur le prix</li>
        <li><i className="fa-solid fa-circle-check"></i> Génération de contenu haute qualité</li>
        <li><i className="fa-solid fa-circle-check"></i> Export PDF disponible</li>
      </ul>
      <button className="btn-blue-pricing">+ 200 crédits</button>
    </div>
  </div>

  <div className="pricing-trust reveal delay-2">
    <p>Recharges sécurisées via nos partenaires</p>
    <div className="trust-badges">
      <div className="trust-card">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/9/98/Visa_Inc._logo_%282005%E2%80%932014%29.svg"
          alt="Visa"
          style={{ height: "26px", marginRight: "10px" }}
        />
      </div>
      <div className="trust-card">
        <img src="/img/mastercard.jpg" alt="Mastercard" style={{ height: "30px" }} />
      </div>
      <div className="trust-card">
        <img src="/img/Orange.png" alt="Orange" style={{ height: "30px" }} />
      </div>
      <div className="trust-card">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/2/29/MTN-Logo.png"
          alt="MTN"
          style={{ height: "26px" }}
        />
      </div>
      <div className="trust-card">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/a/a8/Moov_Money_Flooz.png"
          alt="Moov"
          style={{ height: "26px" }}
        />
      </div>
      <div className="trust-card">
        <img src="/img/celtiis.jpg" alt="Celtiis" style={{ height: "30px" }} />
      </div>
      <div className="trust-card">
        <img src="/img/free-money.png" alt="Free-money" style={{ height: "30px" }} />
      </div>
      <div className="trust-card">
        <img src="/img/wave.png" alt="Wave" style={{ height: "30px" }} />
      </div>
      <div className="trust-card">
        <img src="/img/mixx.svg" alt="Mixx" style={{ height: "30px" }} /> 
      </div>
    </div>
  </div>
</section>


<button
        className="chatbot-button"
        aria-label="Ouvrir le chat"
        onClick={() => setOpen(!open)}
      >
        <i className="fa-solid fa-comments"></i>
      </button>

      {/* Fenêtre du chatbot */}
      {open && (
        <div className="chatbot-container">
          <iframe
            src="https://www.chatbase.co/chatbot-iframe/6Zi-FfmZynEP6KSsGyXKE?lang=fr"
            style={{ width: "100%", height: "100%" }}
            
          ></iframe>
        </div>
      )}
      <div id="top"></div>
      <a href="#top" className="back-to-top" aria-label="Retour en haut">
        <i className="fa-solid fa-circle-arrow-up"></i>
      </a>
    </main>
  ); 
}

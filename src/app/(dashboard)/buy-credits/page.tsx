"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserEmail } from "@/app/actions/auth";

// On garde pricingConfig uniquement pour l'affichage de l'équivalence
const pricingConfig: Record<string, any> = {
  EUR: { symbol: "€", rate: 1, label: "EUR", symbolAfter: true },
  XOF: { symbol: " FCFA", rate: 655.957, label: "XOF", symbolAfter: true },
  XAF: { symbol: " FCFA", rate: 655.957, label: "XAF", symbolAfter: true },
  USD: { symbol: "$", rate: 1.08, label: "USD", symbolAfter: false },
GBP: { symbol: "£", rate: 0.86, label: "GBP", symbolAfter: false },
CAD: { symbol: "CA$", rate: 1.48, label: "CAD", symbolAfter: false },
MAD: { symbol: " DH", rate: 10.95, label: "MAD", symbolAfter: true },
GNF: { symbol: " FG", rate: 9300, label: "GNF", symbolAfter: true },
};

export default function BuyCreditsPage() {
  const router = useRouter();
  const [selectedPack, setSelectedPack] = useState<number>(0);
  const [isPaying, setIsPaying] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [localCurrency, setLocalCurrency] = useState(pricingConfig["XOF"]);
  const [successPopup, setSuccessPopup] = useState({ visible: false, credits: 0 });

  useEffect(() => {
    async function initializePage() {
      try {
        const email = await getCurrentUserEmail();
        setUserEmail(email);

        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (pricingConfig[data.currency]) {
          setLocalCurrency(pricingConfig[data.currency]);
        }
      } catch (error) {
        console.error("Erreur initialisation:", error);
      }
    }
    initializePage();
  }, []);

  const packs = [
    { id: 1, name: "Offre Débutant", credits: 80, price: 1.525, icon: "fa-seedling" },
    { id: 2, name: "Pack Croissance", credits: 200, price: 2.438, icon: "fa-rocket", popular: true },
  ];

  // Affiche "1.525 EUR ( 1000 FCFA )"
  const renderCombinedPrice = (euroAmount: number) => {
    const localAmount = Math.round(euroAmount * localCurrency.rate).toLocaleString("fr-FR");
    const formattedLocal = localCurrency.symbolAfter 
      ? `${localAmount}${localCurrency.symbol}` 
      : `${localCurrency.symbol}${localAmount}`;
    
    return (
      <>
        {euroAmount.toFixed(3)} EUR <span className="local-equiv">({formattedLocal})</span>
      </>
    );
  };

  const handlePayment = async () => {
    if (selectedPack === 0 || !userEmail) return;
    setIsPaying(true);

    try {
      const pack = packs.find((p) => p.id === selectedPack);
      if (!pack) return;

      // On envoie toujours le prix en EUR (converti en unité entière pour FedaPay si besoin)
      // Note: FedaPay utilise souvent le XOF en base, si tu veux 1000 FCFA fixe, 
      // il vaut mieux envoyer 1000 et fixer la devise à XOF dans l'API.
      const res = await fetch("/api/create-transactio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(pack.price * 655.957), // On force la conversion en FCFA pour FedaPay
          email: userEmail,
          nbCredits: pack.credits,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Au lieu d'un alert qui bloque, on redirige ou on affiche un message stylé
        console.error("Lien non généré");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="credits-page-container">
      {successPopup.visible && (
        <div className="success-popup">
          <strong>Crédits ajoutés !</strong>
          <p>{successPopup.credits} crédits ajoutés.</p>
        </div>
      )}

      <div className="credits-header">
        <button className="back-btn" onClick={() => router.back()}>
          <i className="fa-solid fa-arrow-left"></i> Retour
        </button>
        <h1>Acheter des crédits</h1>
        <p>Paiement sécurisé via FedaPay</p>
      </div>

      <div className="credits-grid-layout">
        {packs.map((pack) => (
          <div
            key={pack.id}
            className={`credit-pack-card ${pack.popular ? "is-popular" : ""} ${selectedPack === pack.id ? "is-selected" : ""}`}
            onClick={() => setSelectedPack(pack.id)}
          >
            {pack.popular && <div className="popular-ribbon">Le plus choisi</div>}
            <div className="pack-icon-wrapper"><i className={`fa-solid ${pack.icon}`}></i></div>
            <h3>{pack.name}</h3>
            <div className="credit-amount">{pack.credits} crédits</div>
            <div className="pack-price">
              <span className="price-val">{renderCombinedPrice(pack.price)}</span>
            </div>
            <button type="button" className="select-box-btn">
              {selectedPack === pack.id ? "Pack Sélectionné" : "Choisir ce pack"}
            </button>
          </div>
        ))}
      </div>

      {selectedPack !== 0 && (
        <div className="fixed-checkout-bar">
          <div className="checkout-content">
            <div className="total-text">
              Total : <span>{renderCombinedPrice(packs.find(p => p.id === selectedPack)?.price || 0)}</span>
            </div>
            <button className="final-pay-btn" onClick={handlePayment} disabled={isPaying || !userEmail}>
              {isPaying ? "Traitement..." : "Payer maintenant"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
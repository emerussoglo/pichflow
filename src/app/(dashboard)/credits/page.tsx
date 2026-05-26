"use client";

import { useKKiaPay } from "kkiapay-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserEmail } from "@/app/actions/auth";

const packs = [
  {
    id: 1,
    name: "Offre Débutant",
    credits: 80,
    price: 1000,
    icon: "fa-seedling",
  },
  {
    id: 2,
    name: "Pack Croissance",
    credits: 200,
    price: 2000,
    icon: "fa-rocket",
    popular: true,
  },
];

type PopupType = "success" | "error" | null;

interface PopupState {
  type: PopupType;
  message: string;
}

function Popup({
  popup,
  onClose,
}: {
  popup: PopupState;
  onClose: () => void;
}) {
  if (!popup.type) return null;

  const isSuccess = popup.type === "success";

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 9998,
        }}
        onClick={onClose}
      />

      {/* Popup */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          backgroundColor: "#1a1a2e",
          border: `2px solid ${isSuccess ? "#22c55e" : "#ef4444"}`,
          borderRadius: "16px",
          padding: "40px 32px",
          minWidth: "320px",
          maxWidth: "420px",
          width: "90%",
          textAlign: "center",
          boxShadow: `0 0 40px ${isSuccess ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
          animation: "popupIn 0.25s ease",
        }}
      >
        {/* Icone */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: isSuccess
              ? "rgba(34,197,94,0.15)"
              : "rgba(239,68,68,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <i
            className={`fa-solid ${isSuccess ? "fa-circle-check" : "fa-circle-xmark"}`}
            style={{
              fontSize: "32px",
              color: isSuccess ? "#22c55e" : "#ef4444",
            }}
          />
        </div>

        {/* Titre */}
        <h3
          style={{
            color: isSuccess ? "#22c55e" : "#ef4444",
            fontSize: "20px",
            fontWeight: 700,
            marginBottom: "12px",
          }}
        >
          {isSuccess ? "Paiement réussi !" : "Paiement échoué"}
        </h3>

        {/* Message */}
        <p
          style={{
            color: "#ccc",
            fontSize: "15px",
            lineHeight: "1.6",
            marginBottom: "28px",
          }}
        >
          {popup.message}
        </p>

        {/* Bouton */}
        <button
          onClick={onClose}
          style={{
            backgroundColor: isSuccess ? "#22c55e" : "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "12px 36px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          D&apos;accord
        </button>
      </div>

      <style>{`
        @keyframes popupIn {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.95); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}

export default function BuyCreditsPage() {
  const router = useRouter();
  const [selectedPack, setSelectedPack] = useState<number>(0);
  const [isPaying, setIsPaying] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [popup, setPopup] = useState<PopupState>({ type: null, message: "" });
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { openKkiapayWidget, addKkiapayListener, removeKkiapayListener } =
    useKKiaPay();

  useEffect(() => {
    getCurrentUserEmail().then(setUserEmail).catch(console.error);
  }, []);

  function showPopup(type: "success" | "error", message: string) {
    // Annule l'ancien timer si on en ouvre un nouveau
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);

    setPopup({ type, message });

    // Fermeture automatique après 5 secondes
    autoCloseRef.current = setTimeout(() => {
      closePopup();
    }, 5000);
  }

  function closePopup() {
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    setPopup({ type: null, message: "" });
  }

  function successHandler(response: unknown) {
    console.log("✅ Paiement réussi:", response);
    setIsPaying(false);
    showPopup(
      "success",
      "Vos crédits seront ajoutés dans quelques secondes. Merci pour votre achat !"
    );
    router.refresh();
  }

  function failureHandler(error: unknown) {
    console.error("❌ Paiement échoué:", error);
    setIsPaying(false);
    showPopup("error", "Le paiement a échoué. Veuillez réessayer.");
  }

  useEffect(() => {
    addKkiapayListener("success", successHandler);
    addKkiapayListener("failed", failureHandler);

    return () => {
      removeKkiapayListener("success");
      removeKkiapayListener("failed");
    };
  }, [addKkiapayListener, removeKkiapayListener]);

  // Nettoyage du timer au démontage du composant
  useEffect(() => {
    return () => {
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
  }, []);

  async function open() {
    if (!userEmail || selectedPack === 0) return;

    const pack = packs.find((p) => p.id === selectedPack);
    if (!pack) return;

    const publicKey = process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY;
    if (!publicKey) {
      console.error("Clé publique KKiaPay manquante");
      return;
    }

    setIsPaying(true);

    try {
      const res = await fetch("/api/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          credits: pack.credits,
          amount: pack.price,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.transactionId) {
        console.error("Erreur création transaction:", data);
        showPopup("error", "Erreur lors de la préparation du paiement. Réessayez.");
        setIsPaying(false);
        return;
      }

      openKkiapayWidget({
        amount: pack.price,
        api_key: publicKey,
        sandbox: true,
        email: userEmail,
        partnerId: data.transactionId,
        name: pack.name,
      } as Parameters<typeof openKkiapayWidget>[0]);
    } catch (err) {
      console.error("Erreur:", err);
      showPopup("error", "Une erreur est survenue. Veuillez réessayer.");
      setIsPaying(false);
    }
  }

  return (
    <>
      <Popup popup={popup} onClose={closePopup} />

      <div className="credits-page-container">
        <div className="credits-header">
          <button className="back-btn" onClick={() => router.back()}>
            <i className="fa-solid fa-arrow-left"></i> Retour
          </button>
          <h1>Acheter des crédits</h1>
          <p>Paiement sécurisé via KKiaPay</p>
        </div>

        <div className="credits-grid-layout">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className={`credit-pack-card ${"popular" in pack && pack.popular ? "is-popular" : ""} ${selectedPack === pack.id ? "is-selected" : ""}`}
              onClick={() => setSelectedPack(pack.id)}
            >
              {"popular" in pack && pack.popular && (
                <div className="popular-ribbon">Le plus choisi</div>
              )}
              <div className="pack-icon-wrapper">
                <i className={`fa-solid ${pack.icon}`}></i>
              </div>
              <h3>{pack.name}</h3>
              <div className="credit-amount">{pack.credits} crédits</div>
              <div className="pack-price">{pack.price} FCFA</div>
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
                Total : {packs.find((p) => p.id === selectedPack)?.price} FCFA
              </div>
              <button
                className="final-pay-btn"
                onClick={open}
                disabled={isPaying || !userEmail}
              >
                {isPaying ? "Traitement..." : "Payer maintenant"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
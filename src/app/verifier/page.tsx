"use client";

import React, { useState } from "react";


export default function VerifierDocument() {
  const [numero, setNumero] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/verify-document?numero=${encodeURIComponent(numero)}`);
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Document introuvable");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  const totalHT = result?.prestations?.reduce((acc: number, p: any) => acc + (p.prix_unitaire * p.quantite), 0) || 0;
  const montantTVA = totalHT * ((result?.tva_rate || 0) / 100);
  const totalTTC = totalHT + montantTVA;

  // Configuration du bleu Pichflow
  const pichBlue = "#a5d1f0"; 

  return (
    <div className="verify-page-wrapper">
      <div className="verify-container">
        <header className="verify-header">
          <br /><br /><br /><br />
          <h1>Vérification de Document</h1>
          <p>Saisissez le numéro pour vérifier l'authenticité (ex: F2026#...)</p>
        </header>

        <form onSubmit={handleVerify} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Numéro de facture ou devis..."
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
          <button type="submit" className="btn-verify" disabled={loading} style={{ backgroundColor: pichBlue }}>
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : "Vérifier"}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {result && (
          <div className="invoice-scroll-container">
            {/* DESIGN EXACT COPIÉ SUR TON MODÈLE AVEC ACCENTS BLEUS */}
            <div style={{ 
              padding: "50px", 
              fontFamily: "'Roboto', sans-serif", 
              color: "#000", 
              borderLeft: `15px solid ${pichBlue}`, 
              minWidth: "850px",
              minHeight: "1000px",
              position: "relative", 
              background: "#dde8f0",
              boxShadow: "0 0 20px rgba(0,0,0,0.05)"
            }}>
              
              {/* Entête */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
                <div>
                  <h2 style={{ fontFamily: "'Antonio', sans-serif", fontSize: "22px", fontWeight: "800", margin: 0, color: "#000" }}>
                    {(result.sender_nom || "PichFlow Service").toUpperCase()}
                  </h2>
                  <p style={{ fontSize: "12px", marginTop: "5px", color: "#444", lineHeight: "1.4" }}>
                    {result.sender_adresse}<br />
                    {result.sender_contact}
                    {result.ifu_siret && <><br />IFU: {result.ifu_siret}</>}
                    {result.autre_num && <><br />{result.autre_num}</>}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <h2 style={{ fontFamily: "'Antonio', sans-serif", fontSize: "22px", fontWeight: "800", color: "#000", margin: 0, lineHeight: "1" }}>
                    {result.numero_facture?.startsWith('D') ? 'DEVIS' : 'FACTURE'}
                  </h2>
                  <p style={{ fontWeight: "800", marginTop: "10px" }}>n° {result.numero_facture}</p>
                </div>
              </div>

              {/* Infos client et Dates */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px", gap: "13px" }}>
                <div style={{ flex: 1, border: "1.5px solid #e9edf0", padding: "15px", borderRadius: "2px" }}>
                  <p style={{ fontSize: "10px", fontWeight: "700", marginBottom: "8px", color: "#666" }}>Détails</p>
                  <p style={{ fontSize: "13px", margin: 0 }}>Date : {result.date_emission}</p>
                  <p style={{ fontSize: "13px", margin: "5px 0 0 0" }}>Échéance : {result.date_echeance}</p>
                </div>
                <div style={{ flex: 1, border: "1.5px solid #e9edf0", textAlign: "right", padding: "15px", borderRadius: "2px", background: "#dde8f0" }}>
                  <p style={{ fontSize: "10px", fontWeight: "700", marginBottom: "8px", color: "#666" }}>Destinataire</p>
                  <p style={{ fontSize: "15px", fontWeight: "800", margin: 0 }}>{result.client_nom?.toUpperCase()}</p>
                  <p style={{ fontSize: "12px", marginTop: "5px", color: "#444" }}>{result.client_contact}<br />{result.client_adresse}</p>
                </div>
              </div>

              {/* Table des prestations */}
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{  color: "#fff", borderBottom: `2px solid ${pichBlue}` }}>
                    <th style={{ fontFamily: "'Antonio', sans-serif", textAlign: "left", padding: "12px", fontSize: "12px", color: "#333", textTransform: "uppercase", letterSpacing: "0.5px" }}>Libellé / Description</th>
                    <th style={{ fontFamily: "'Antonio', sans-serif", textAlign: "right", padding: "12px", fontSize: "12px", color: "#333", borderLeft: "1px solid #00000011", textTransform: "uppercase", letterSpacing: "0.5px", width: "120px" }}>Prix Unit.</th>
                    <th style={{ fontFamily: "'Antonio', sans-serif", textAlign: "right", padding: "12px", fontSize: "12px", color: "#333", borderLeft: "1px solid #00000011", textTransform: "uppercase", letterSpacing: "0.5px", width: "60px" }}>Qté</th>
                    <th style={{ fontFamily: "'Antonio', sans-serif", textAlign: "right", padding: "12px", fontSize: "12px", color: "#333", borderLeft: "1px solid #00000011", textTransform: "uppercase", letterSpacing: "0.5px", width: "120px" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {result.prestations.map((p: any, i: number) => (
                    <tr key={i} style={{ borderBottom: "1px solid #00000011" }}>
                      <td style={{ padding: "15px 12px", verticalAlign: "top" }}>
                        <div style={{ fontWeight: "600", fontSize: "13px", color: "#000" }}>{p.description}</div>
                      </td>
                      <td style={{ padding: "15px 12px", textAlign: "right", borderLeft: "1px solid #00000011", fontSize: "13px", verticalAlign: "top" }}>
                        {p.prix_unitaire.toLocaleString()} {result.devise}
                      </td>
                      <td style={{ padding: "15px 12px", textAlign: "right", borderLeft: "1px solid #00000011", fontSize: "13px", verticalAlign: "top" }}>
                        {p.quantite}
                      </td>
                      <td style={{ padding: "15px 12px", textAlign: "right", fontWeight: "600", borderLeft: "1px solid #00000011", fontSize: "13px", color: "#000", verticalAlign: "top" }}>
                        {(p.prix_unitaire * p.quantite).toLocaleString()} {result.devise}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Bloc Totaux */}
              <div style={{ marginLeft: "auto", width: "300px", marginTop: "30px", border: `1.5px solid ${pichBlue}`  }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", borderBottom: "1px solid #eceaea" }}>
                  <span style={{ fontSize: "13px", color: "#666" }}>Total HT</span>
                  <span style={{ fontSize: "13px", fontWeight: "800" }}>{totalHT.toLocaleString()} {result.devise}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", borderBottom: "1px solid #eceaea" }}>
                  <span style={{ fontSize: "13px", color: "#666" }}>TVA ({result.tva_rate}%)</span>
                  <span style={{ fontSize: "13px", fontWeight: "800" }}>{montantTVA.toLocaleString()} {result.devise}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 12px", background: pichBlue, color: "#fff" }}>
                  <span style={{ fontFamily: "'Antonio', sans-serif", fontSize: "14px", fontWeight: "bold", textTransform: "uppercase" }}>Total TTC </span>
                  <span style={{ fontSize: "18px", fontWeight: "900" }}>{totalTTC.toLocaleString()} {result.devise}</span>
                </div>
              </div>

              {/* Mentions Légales Pied de page */}
              <div style={{ position: "absolute", bottom: "40px", left: "50px", width: "calc(100% - 100px)" }}>
                <div style={{ fontSize: "11px", color: "#555", lineHeight: "1.6", marginBottom: "25px", maxWidth: "80%" }}>
                  <p style={{ margin: "0 0 5px 0" }}>Ce document a été généré et certifié via la plateforme Pichflow. Toute modification manuelle rend ce document invalide.</p>
                </div>
                
              </div>
            </div>
          </div>
        )}

        <br /><br />
      </div>
    </div>
  );
}
"use client";
import React, { useState, useEffect } from 'react';
import { saveSenderInfoAction, getSenderInfo } from './senderAction';

export default function FactureInfoPage() {
  const [info, setInfo] = useState({ 
    nomService: '', 
    adresse: '', 
    contact: '', 
    tvaRate: 0,
    ifuSiret: '', 
    autreNum: '',
    logo: '',           // Nouveau
    paymentMethod: ''   // Nouveau
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await getSenderInfo();
      if (data) {
        setInfo({
          nomService: (data.nomService as string) || '',
          adresse: (data.adresse as string) || '',
          contact: (data.contact as string) || '',
          tvaRate: Number(data.tvaRate) || 0,
          ifuSiret: (data.ifuSiret as string) || '', 
          autreNum: (data.autreNum as string) || '',
          logo: (data.logo as string) || '',                 // Récupération
          paymentMethod: (data.paymentMethod as string) || '' // Récupération
        });
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // Fonction de traitement et conversion du Logo en Base64
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInfo({ ...info, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await saveSenderInfoAction({
      nom_service: info.nomService,
      adresse: info.adresse,
      contact: info.contact,
      tva_rate: info.tvaRate,
      ifu_siret: info.ifuSiret, 
      autre_num: info.autreNum,
      logo: info.logo,                   // Envoi
      payment_method: info.paymentMethod // Envoi
    });

    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      alert("Erreur lors de la sauvegarde");
    }
    setLoading(false);
  };

  if (loading && info.nomService === '') return <div style={{padding: "10px"}}>Chargement...</div>;

  return (
    <div className="fi-wrapper">
      <div className="fi-header">
        <h1>Facturation</h1>
        <p>Infos de l'émetteur et configuration fiscale.</p>
      </div>

      <div className="fi-main-layout">
        <div className="fi-form-section">
          <section className="fi-card">
            <div className="fi-card-title">
              <i className="fa-solid fa-pen"></i> Informations
            </div>
            <form onSubmit={handleSave} className="fi-form">
              
              {/* INPUT LOGO */}
              <div className="fi-field">
                <label>Votre logo</label>
                <input type="file" accept="image/*" onChange={handleLogoChange} style={{ border: 'none', padding: '0' }} />
                {info.logo && (
                  <div style={{ marginTop: '10px' }}>
                    <img src={info.logo} alt="Aperçu logo" style={{ maxHeight: '60px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                  </div>
                )}
              </div>

              <div className="fi-field">
                <label>Nom du Service *</label>
                <input type="text" value={info.nomService} onChange={(e)=>setInfo({...info, nomService: e.target.value})} required />
              </div>
              
              <div className="fi-field">
                <label>Adresse *</label>
                <input type="text" value={info.adresse} onChange={(e)=>setInfo({...info, adresse: e.target.value})} required />
              </div>

              <div className="fi-field">
                <label>Contact (Email/Tél) *</label>
                <input type="text" value={info.contact} onChange={(e)=>setInfo({...info, contact: e.target.value})} required />
              </div>

              <div className="fi-field">
                <label>Numéro IFU ou SIRET ou autres</label>
                <input 
                  type="text" 
                  value={info.ifuSiret} 
                  onChange={(e)=>setInfo({...info, ifuSiret: e.target.value})} 
                  placeholder="IFU : 320201....." 
                />
              </div>

              <div className="fi-field">
                <label>Autre numéro (RCCM, Registre, etc.)</label>
                <input 
                  type="text" 
                  value={info.autreNum} 
                  onChange={(e)=>setInfo({...info, autreNum: e.target.value})} 
                  placeholder="RB/COT/..."
                />
              </div>

              {/* INPUT MODE DE PAIEMENT */}
              <div className="fi-field">
                <label>Mode de paiement par défaut (Optionel)</label>
                <input 
                  type="text" 
                  value={info.paymentMethod} 
                  onChange={(e)=>setInfo({...info, paymentMethod: e.target.value})} 
                  placeholder="Virement bancaire (IBAN), Mobile Money, Espèces..."
                  
                />
              </div>

              <div className="fi-field">
                <label>Taux de TVA par défaut (%)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={info.tvaRate} 
                  placeholder='18%'
                  onChange={(e)=>setInfo({...info, tvaRate: parseFloat(e.target.value) || 0})} 
                  required 
                />
              </div>

              <button type="submit" disabled={loading} className={`fi-btn-save ${saved ? 'success' : ''}`}>
                {loading ? "..." :  (saved ? "Enregistré !" :  "Sauvegarder")} <i className="fa-solid fa-floppy-disk"></i>
              </button>
            </form>
          </section>
        </div>
 
        <div className="fi-preview-section">
          <section className="fi-card">
            <div className="fi-card-title">
              <i className="fa-solid fa-eye"></i> Aperçu émetteur
            </div>
            <div className="fi-preview-box">
              {/* LOGO DANS L'APERÇU */}
              {info.logo && (
                <div style={{ marginBottom: '15px' }}>
                  <img src={info.logo} alt="Logo" style={{ maxHeight: '50px', maxWidth: '150px', objectFit: 'contain' }} />
                </div>
              )}
              <h2 style={{ textTransform: 'uppercase', color: '#000', marginBottom: '10px' }}>
                {info.nomService || "NOM DU SERVICE"}
              </h2>
              <div style={{ color: '#555', fontSize: '14px' }}>
                <p><strong>📍</strong> {info.adresse || "Adresse..."}</p>
                <p><strong>📞</strong> {info.contact || "Contact..."}</p>
                {info.ifuSiret && <p><strong>ID:</strong> {info.ifuSiret}</p>}
                {info.autreNum && <p><strong>Reg:</strong> {info.autreNum}</p>}
                
                {/* APERÇU MODE DE PAIEMENT */}
                {info.paymentMethod && <p style={{ marginTop: '5px', color: '#1e3a8a' }}><strong>💳 Paiement:</strong> {info.paymentMethod}</p>}
                
                <p style={{ marginTop: '10px', color: '#000', fontWeight: 'bold' }}>
                   Taxe : {info.tvaRate}%
                </p>
              </div>
            </div> 
          </section> <br /> <br />
        </div> 
      </div>
    </div>
  );
}
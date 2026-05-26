"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUserSettings, logoutAction } from './settingsAction';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    credits: 0
  });

  // Seuil théorique pour la barre de progression
  const creditsTotal = 1000;

  useEffect(() => {
    async function loadData() {
      const data = await getUserSettings();
      if (data) {
        setProfile({
          name: String(data.name || "Utilisateur"),
          email: String(data.email || ""),
          credits: Number(data.credits || 0)
        });
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const progressWidth = Math.min((profile.credits / creditsTotal) * 100, 100);

  const forceButtonStyle: React.CSSProperties = {
    cursor: 'pointer',
    pointerEvents: 'auto', 
    position: 'relative',
    zIndex: 9999
  };

  if (loading) {
    return (
      <div className="reports-loader-container">
        <div className="pichflow-custom-loader"></div>
        <p style={{ marginTop: '20px', color: '#64748b', fontWeight: '500' }}>
          Chargement de vos paramètres...
        </p>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>Paramètres</h1>
        <p>Gérez vos informations personnelles et votre sécurité.</p>
      </header>

      <div className="settings-grid">
        {/* SECTION PROFIL & CRÉDITS */}
        <section className="settings-card reveal">
          <div className="card-header-flex">
            <div className="card-header">
              <i className="fa-solid fa-user-gear"></i>
              <h3>Mon Profil</h3>
            </div>
          </div>
          
          <div className="credits-display">
            <div className="credits-info">
              <span className="label">Solde de crédits actuel</span>
              <span className="count">{profile.credits.toLocaleString()} crédits</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progressWidth}%`, background: '#10B981' }}></div>
            </div>
            <Link href="/credits" className="btn-buy" style={forceButtonStyle}>
               <i className="fa-solid fa-coins"></i> Achat de crédits
            </Link>
          </div>

          <div className="input-group-row">
            <div className="input-field"> 
              <label>Nom complet</label>
              <input 
                type="text" 
                value={profile.name} 
                readOnly
                className="readonly-field"
              />
            </div>
            <div className="input-field">
              <label>Adresse Email</label>
              <input 
                type="email" 
                value={profile.email} 
                readOnly
                className="readonly-field"
              />
            </div> 
          </div>
        </section>

        {/* SECTION : CONFIGURATION FACTURATION */}
        <section className="settings-card reveal delay-1">
          <div className="card-header">
            <i className="fa-solid fa-file-invoice"></i>
            <h3>Paramètres de Facturation</h3>
          </div>

          <div className="security-actions">
            <div className="action-item">
              <div>
                <h4>Informations de l'émetteur</h4>
                <p>Configurez le nom, l'adresse et les contacts qui s'affichent sur vos factures PDF.</p>
              </div>
              <Link 
                href="/dashboard/factureinfo" 
                className='btn-outline-sm' 
                style={{...forceButtonStyle, textDecoration: 'none', display: 'inline-block', background:'#2563eb', color:'#fff', textAlign:'center'}}
              >
                <i className="fa-solid fa-file-invoice"></i> Configurer
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION SÉCURITÉ */}
        <section className="settings-card reveal delay-1">
          <div className="card-header">
            <i className="fa-solid fa-lock"></i>
            <h3>Sécurité & Session</h3>
          </div>

          <div className="security-actions">
            <div className="action-item">
              <div>
                <h4>Mot de passe</h4>
                <p>Sécurisez votre compte avec un mot de passe robuste.</p>
              </div>
              <Link href="/change-password" title="Modifier" className='change-password' style={forceButtonStyle}>
               <i className="fa-solid fa-shield-halved"></i> Changer le mot de passe 
              </Link>
            </div> 

            <hr className="divider" />

            <div className="action-item logout-item">
              <div>
                <h4>Déconnexion</h4>
                <p>Souhaitez-vous quitter votre session actuelle ?</p> 
              </div>
              <button 
                type="button"
                className="btn-logout" 
                style={{...forceButtonStyle, backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold'}} 
                onClick={async () => { await logoutAction(); }}
              >
                <i className="fa-solid fa-right-from-bracket"></i> Se déconnecter
              </button>
            </div>
          </div>
          
        </section>
        <p style={{justifyContent: 'center', textAlign: 'center', fontWeight: '900px'}} >Pichflow v 1.0.0</p>
        <br />
      </div>
    </div>
  );
}
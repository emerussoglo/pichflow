"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { changePasswordAction } from './passwordAction';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const isMatching = passwords.new === passwords.confirm;
  const canSubmit = passwords.current !== '' && passwords.new.length >= 8 && isMatching;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setErrorMsg("");

    const result = await changePasswordAction(passwords);

    if (result?.error) {
      setErrorMsg(result.error);
      setLoading(false);
    } else {
      alert("Mot de passe modifié avec succès !");
      router.push('/parametres');
    }
  };

  if (loading) {
    return (
      <div className="reports-loader-container">
        <div className="pichflow-custom-loader"></div>
        <p style={{ marginTop: '20px', color: '#64748b', fontWeight: '500' }}>
          Mise à jour de votre sécurité...
        </p>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <button className="btn-back-link" onClick={() => router.back()} style={{ border: 'none', background: 'none', cursor: 'pointer', marginBottom: '20px', color: '#64748b' }}>
        <i className="fa-solid fa-chevron-left"></i> Retour aux paramètres
      </button>

      <div className="settings-grid single-col" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <section className="settings-card reveal">
          <div className="card-header" style={{ marginBottom: '25px' }}>
            <i className="fa-solid fa-shield-halved" style={{ color: '#2563EB', marginRight: '10px' }}></i>
            <h3 style={{ display: 'inline' }}>Sécurité du compte</h3>
          </div>
          
          {errorMsg && (
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
              <i className="fa-solid fa-triangle-exclamation"></i> {errorMsg}
            </div>
          )}

          <form onSubmit={handleUpdate} className="password-form-container">
            <div className="input-field full-width" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Mot de passe actuel</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={passwords.current}
                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </div>
            
            <div className="input-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
              <div className="input-field">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Nouveau mot de passe</label>
                <input 
                  type="password" 
                  placeholder="8+ caractères" 
                  required 
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
              </div>
              <div className="input-field">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Confirmer le nouveau</label>
                <input 
                  type="password" 
                  placeholder="Confirmez" 
                  required 
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: '1px solid',
                    borderColor: !isMatching && passwords.confirm.length > 0 ? '#ef4444' : '#e2e8f0' 
                  }}
                />
                {!isMatching && passwords.confirm.length > 0 && (
                  <span style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '4px', display: 'block' }}>
                    Les mots de passe ne correspondent pas
                  </span>
                )}
              </div>
            </div>

            <div className="form-footer">
              <button 
                type="submit" 
                className="btn-save" 
                disabled={loading || !canSubmit}
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  backgroundColor: canSubmit ? '#1e3a8a' : '#94a3b8', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  fontWeight: '600'
                }}
              >
                Mettre à jour le mot de passe
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
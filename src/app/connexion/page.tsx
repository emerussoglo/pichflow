'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
// --- IMPORT DES ACTIONS DE CONNEXION ---
import { loginAction, googleLoginAction } from '@/app/actions/auth';

/**
 * Composant du bouton Google mis à jour pour communiquer avec le serveur
 */
function GoogleLoginButton({ 
  onLoading, 
  onError 
}: { 
  onLoading: (loading: boolean) => void, 
  onError: (msg: string) => void 
}) {
  const router = useRouter();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      onLoading(true);
      try {
        // On envoie l'access_token au serveur pour vérification en base Turso
        const result = await googleLoginAction(tokenResponse.access_token);
        
        if (result?.success) {
          router.push('/dashboard');
        } else {
          onError(result?.error || "Connexion Google refusée.");
          onLoading(false);
        }
      } catch (err) {
        onError("Erreur de communication avec le serveur.");
        onLoading(false);
      }
    },
    onError: () => {
      onError("Échec de l'authentification Google.");
      onLoading(false);
    },
  });

  return (
    <button 
      type="button" 
      className="btn-google" 
      onClick={() => login()}
      style={{borderRadius: '40px'}}
    >
      <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google" />
      <span>Continuer avec Google</span>
    </button>
  );
}

export default function Connexion() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); 
  const [formData, setFormData] = useState({ email: '', password: '' });

  const passwordRequirements = useMemo(() => {
    const p = formData.password;
    return [
      { label: "8 caractères minimum", met: p.length >= 8 },
      { label: "Une majuscule (A-Z)", met: /[A-Z]/.test(p) },
      { label: "Une minuscule (a-z)", met: /[a-z]/.test(p) },
      { label: "Un chiffre (0-9)", met: /[0-9]/.test(p) },
      { label: "Un symbole (!@#$%...)", met: /[^A-Za-z0-9]/.test(p) },
    ];
  }, [formData.password]); 

  const isPasswordValid = passwordRequirements.every(req => req.met);

  /**
   * Logique de connexion classique (Email/Password)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!isPasswordValid) {
      return alert("Le mot de passe ne respecte pas les critères de sécurité.");
    }

    setIsLoading(true);

    try {
      const result = await loginAction(formData);

      if (result?.error) {
        setErrorMsg(result.error);
        setIsLoading(false);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setErrorMsg("Une erreur de connexion est survenue.");
      setIsLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);


  return (
    <GoogleOAuthProvider clientId="917194298260-1sp5ltg1h2lprjmne64elqgqltsdogor.apps.googleusercontent.com">
      <div className="auth-container">
        <div className="auth-form-side">
          <div className="auth-content">
            <p className="auth-switch">
              <Link href="/"><i className="fa-solid fa-arrow-left"></i> Retour à l'acceuil</Link>
            </p>
            <h1 style={{textAlign:'center'}}>Ravis de vous revoir !</h1>
            <p style={{textAlign:'center'}} className="subtitle">Connectez-vous pour accéder à votre dashboard</p>

            {/* Affichage des erreurs dynamiques */}
            {errorMsg && (
              <div style={{ color: '#EF4444', backgroundColor: '#FEE2E2', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.875rem' }}>
                <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>
                {errorMsg}
              </div>
            )}

            {isGoogleLoading ? (
              <button className="btn-google" disabled>
                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                <span>Connexion en cours...</span>
              </button>
            ) : (
              <GoogleLoginButton onLoading={setIsGoogleLoading} onError={setErrorMsg} />
            )}

            <div className="auth-separator">
              <span>OU</span>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <i className="fa-regular fa-envelope"></i>
                  <input 
                    type="email" 
                    placeholder="john@example.com" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="label-row">
                  <label>Mot de passe</label>
                  <Link href="/forgot-password">Mot de passe oublié ?</Link>
                </div>
             <div className="input-wrapper" style={{ position: 'relative' }}>
  <i className="fa-solid fa-lock"></i>
  <input 
    type={showPassword ? "text" : "password"} // Alterne entre texte et masqué
    placeholder="........" 
    required 
    value={formData.password}
    onChange={(e) => setFormData({...formData, password: e.target.value})}
    style={{ paddingRight: '40px' }} // Laisse de la place pour l'icône
  />
  {/* Le bouton de l'œil */} 
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    style={{
      position: 'absolute',
      right: '40px',
      top: '40%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#9CA3AF',
      padding: '0',
    }}
  >
    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
  </button>
</div>

                {formData.password.length > 0 && (
                  <div className="password-checklist" style={{ marginTop: '10px', fontSize: '0.75rem' }}>
                    {passwordRequirements.map((req, i) => (
                      <div key={i} style={{ 
                        color: req.met ? '#10B981' : '#9CA3AF', 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '2px'
                      }}>
                        <i className={req.met ? "fa-solid fa-circle-check" : "fa-regular fa-circle"}></i>
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="btn-auth-submit" 
                disabled={isLoading || isGoogleLoading || !isPasswordValid}
                style={{ opacity: (!isPasswordValid || isLoading) ? 0.6 : 1 }}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: '8px' }}></i> 
                    Vérification...
                  </>
                ) : (
                  <>Se connecter <i className="fa-solid fa-arrow-right"></i></>
                )} 
              </button>
            </form>

            <p className="auth-switch">
              En vous connectant, vous acceptez nos <Link href="/tos">CGU</Link> et notre <Link href="/privacy">Politique de confidentialité</Link>
            </p>
            <p className="auth-switch">
              Pas encore de compte ? <Link href="/inscription">S'inscrire</Link>
            </p>
          </div>
        </div>
 
        <div className="auth-info-side">
          <div className="info-content">
            <div className="info-icon-box">
              <i className="fa-solid fa-bolt-lightning"></i>
            </div>
            <h2>Marketing IA + Facturation</h2>
            <p>Générez du contenu percutant et gérez vos finances en toute simplicité.</p>
            
            <ul className="info-list">
              <li><i className="fa-solid fa-circle-check"></i> Articles SEO et posts réseaux sociaux</li>
              <li><i className="fa-solid fa-circle-check"></i> Copywriting avec méthodes AIDA, PAS</li>
              <li><i className="fa-solid fa-circle-check"></i> Facturation et comptabilité automatisées</li>
            </ul>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
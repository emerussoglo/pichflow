'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
// --- IMPORT DE L'ACTION BACKEND ---
import { signUpAction } from '@/app/actions/auth';

function GoogleSignupButton({ onDataFetched, onLoading }: { 
  onDataFetched: (data: any) => void, 
  onLoading: (loading: boolean) => void 
}) {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      onLoading(true);
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const data = await res.json();
        onDataFetched(data);
      } catch (error) {
        console.error("Erreur Google", error);
      } finally {
        onLoading(false);
      }
    },
    onError: () => onLoading(false),
  });

  return ( 
    
    <button type="button" className="btn-google" onClick={() => { onLoading(true); login(); }} style={{borderRadius: '40px'}}>
      <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google" />
      <span>S'inscrire avec Google</span>
    </button>
  );
}

export default function Inscription() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); // Pour afficher les erreurs Turso
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const passwordRequirements = useMemo(() => {
    const pw = formData.password;
    return [
      { label: "8 caractères minimum", met: pw.length >= 8 },
      { label: "Une majuscule (A-Z)", met: /[A-Z]/.test(pw) },
      { label: "Une minuscule (a-z)", met: /[a-z]/.test(pw) },
      { label: "Un chiffre (0-9)", met: /[0-9]/.test(pw) },
      { label: "Un symbole (!@#$%...)", met: /[^A-Za-z0-9]/.test(pw) },
    ];
  }, [formData.password]);

  const isPasswordValid = passwordRequirements.every(req => req.met);

  const handleGoogleData = (data: any) => {
    setFormData({
      ...formData,
      name: `${data.given_name} ${data.family_name}`,
      email: data.email,
    });
  };

  // --- LOGIQUE DE SOUMISSION RÉELLE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      // On appelle le backend (Turso + 250 crédits)
      const result = await signUpAction(formData);

      if (result?.error) {
        setErrorMsg(result.error);
        setIsLoading(false);
      } else {
        // Succès ! Redirection vers le dashboard
        router.push('/dashboard');
      }
    } catch (err) {
      setErrorMsg("Une erreur imprévue est survenue.");
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
              <Link href="/"><i className="fa-solid fa-arrow-left"></i> Retour à l'acceuil </Link>
            </p>
            <h1 style={{textAlign:'center'}} >Créez votre compte</h1>
            <p style={{textAlign:'center'}} className="subtitle">Commencez avec vos 15 crédits gratuits offerts</p>

            {/* Affichage des erreurs de la base de données */}
            {errorMsg && (
              <div style={{ color: '#EF4444', backgroundColor: '#FEE2E2', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.875rem' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i>
                {errorMsg}
              </div>
            )}

            {/* {isGoogleLoading ? (
              <button className="btn-google" disabled>
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>Récupération...</span>
              </button>
            ) : (
              <GoogleSignupButton onDataFetched={handleGoogleData} onLoading={setIsGoogleLoading} />
            )} */}

            {/* <div className="auth-separator"><span>OU TAPEZ VOS INFOS</span></div> */}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Nom complet</label>
                <div className="input-wrapper">
                  <i className="fa-regular fa-user"></i>
                  <input type="text" placeholder="John Doe" required value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>

              <div className="input-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <i className="fa-regular fa-envelope"></i>
                  <input type="email" placeholder="john@example.com" required value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div className="input-group">
                <label>Mot de passe</label>
                <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
  <i className="fa-solid fa-lock"></i>
  <input 
    type={showPassword ? "text" : "password"} 
    placeholder="Mot de passe fort" 
    required 
    value={formData.password}
    onChange={(e) => setFormData({...formData, password: e.target.value})}
    style={{ width: '100%', paddingRight: '40px' }} // On laisse de la place pour l'œil à droite
  />
  
  {/* Icône cliquable pour afficher/masquer */}
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    style={{
      position: 'absolute',
      right: '40px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#9CA3AF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0'
    }}
  >
    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
  </button>  <br /> 
</div>
                {formData.password.length > 0 && (
                  <div className="password-checklist" style={{ marginTop: '12px' }}>
                    {passwordRequirements.map((req, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: req.met ? '#10B981' : '#9CA3AF', marginBottom: '4px' }}>
                        <i className={req.met ? "fa-solid fa-circle-check" : "fa-solid fa-circle-dot"}></i>
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="btn-auth-submit" disabled={isLoading || isGoogleLoading || !isPasswordValid}
                style={{ marginTop: '15px', opacity: isPasswordValid ? 1 : 0.6 }}>
                {isLoading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Création du compte...</> : <>Créer mon compte <i className="fa-solid fa-arrow-right"></i></>}
              </button>
            </form>
<p className="auth-switch">
              En vous inscrivant, vous acceptez nos <Link href="/tos">CGU</Link> et notre <Link href="/privacy">Politique de confidentialité</Link>
            </p>
            <p className="auth-switch">Déjà un compte ? <Link href="/connexion">Se connecter</Link></p>
          </div>
        </div>

        <div className="auth-info-side">
          <div className="info-content">
            <div className="info-icon-box"><i className="fa-solid fa-bolt-lightning"></i></div>
            <h2>Marketing IA + Facturation</h2>
            <p>Générez du contenu percutant et gérez vos finances en toute simplicité.</p>
            <ul className="info-list">
              <li><i className="fa-solid fa-circle-check"></i> Articles SEO et posts réseaux sociaux</li>
              <li><i className="fa-solid fa-circle-check"></i> Copywriting (AIDA, PAS)</li>
              <li><i className="fa-solid fa-circle-check"></i> 15 crédits offerts à l'inscription</li>
            </ul>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
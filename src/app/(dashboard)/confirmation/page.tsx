'use client';
import { useState } from 'react';
import { verifyOTPAction } from '@/app/actions/auth'; // Ajuste le chemin si besoin
import { useRouter } from 'next/navigation';

export default function ConfirmationPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await verifyOTPAction(otp);
    if (res.success) {
      router.push('/dashboard/factureinfo'); // Direction le dashboard enfin !
    } else {
      setError(res.error || "Code invalide");
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', padding: '20px' }}>
      <div style={{ maxWidth: '400px', width: '100%', background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Bienvenu</h1>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Vérifiez votre compte</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>Nous avons envoyé un code à 6 chiffres dans votre boîte mail. Mettez-le ci-dessous pour activer votre compte PichFlow.</p>
        
        <form onSubmit={handleVerify}>
          <input 
            type="text" 
            placeholder="000000" 
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ width: '100%', padding: '15px', fontSize: '28px', textAlign: 'center', letterSpacing: '10px', borderRadius: '8px', border: '2px solid #ddd', marginBottom: '20px', outline: 'none' }}
            required
          />
          {error && <p style={{ color: '#ef4444', marginBottom: '20px', fontSize: '14px' }}>{error}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '15px', background: '#000', color: '#fff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
          >
            {loading ? "Vérification..." : "Confirmer mon compte"}
          </button>
        </form>
      </div>
    </div>
  );
}
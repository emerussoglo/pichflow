"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestPasswordReset, resetPasswordWithOTP } from "../../lib/pass";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); 
  
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await requestPasswordReset(email);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess(res?.message || "");
      setStep(2); 
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    const res = await resetPasswordWithOTP({
      email,
      otpCode,
      newPassword,
      confirmPassword,
    });
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess(res?.message || "");
      setTimeout(() => {
        router.push("/connexion");
      }, 2500);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1>Mot de passe oublié</h1>
          <p>
            {step === 1 
              ? "Saisissez votre e-mail pour recevoir un code de vérification." 
              : "Entrez le code reçu et configurez votre nouveau mot de passe."}
          </p>
        </div>

        {error && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

        {step === 1 ? (
          /* FORMULAIRE ÉTAPE 1 : ENVOI DU CODE */
          <form onSubmit={handleSendOTP} className="forgot-password-form">
            <div className="form-group">
              <label className="form-label">Adresse e-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="form-input"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-submit-primary"
            >
              {loading ? "Envoi en cours..." : "Recevoir le code de récupération"}
            </button>
          </form>
        ) : (
          /* FORMULAIRE ÉTAPE 2 : CODE OTP + NOUVEAU MOT DE PASSE */
          <form onSubmit={handleResetPassword} className="forgot-password-form">
            <div className="form-group">
              <label className="form-label">Code de vérification (OTP)</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="form-input form-input-otp"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nouveau mot de passe</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-submit-success"
            >
              {loading ? "Mise à jour..." : "Réinitialiser le mot de passe"}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-link"
            >
              Renvoyer un nouveau code
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
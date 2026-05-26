"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Configuration du transporteur Nodemailer avec Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Ton mot de passe d'application à 16 lettres
  },
});

/**
 * Fonction réelle d'envoi d'email avec Nodemailer
 */
async function sendOTPEmail(email: string, code: string) {
  const mailOptions = {
    from: `"Pichflow" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "🔑 Code de récupération - Pichflow",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px;">
        <h2 style="color: #4f46e5; text-align: center;">Pichflow</h2>
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code de vérification OTP (valable 15 minutes) :</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; background-color: #f4f4f5; padding: 10px 20px; border-radius: 8px; border: 1px solid #e4e4e7;">
            ${code}
          </span>
        </div>
        <p style="color: #71717a; font-size: 13px;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.</p>
      </div>
    `,
  };

  // Envoi effectif de l'e-mail
  await transporter.sendMail(mailOptions);
}

/**
 * ÉTAPE 1 : Demande de réinitialisation & envoi de l'OTP
 */
export async function requestPasswordReset(email: string) {
  try {
    if (!email) return { error: "L'adresse email est requise." };

    // Vérifier si l'utilisateur existe
    const userRes = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email],
    });

    if (userRes.rows.length === 0) {
      // Sécurité : On retourne success même si l'email n'existe pas pour éviter le dénombrement d'emails
      return { success: true, message: "Si cet e-mail existe, un code a été envoyé." };
    }

    // Générer un code à 6 chiffres
    const otpCode = crypto.randomInt(100000, 999999).toString();
    // Expiration dans 15 minutes (timestamp en millisecondes)
    const expiresAt = Date.now() + 15 * 60 * 1000;

    // Sauvegarder l'OTP en base de données
    await db.execute({
      sql: "UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE email = ?",
      args: [otpCode, expiresAt, email],
    });

    // Envoyer le vrai e-mail via Gmail
    await sendOTPEmail(email, otpCode);

    return { success: true, message: "Code envoyé avec succès par e-mail !" };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'OTP:", error);
    return { error: "Une erreur est survenue lors de l'envoi du code." };
  }
}

/**
 * ÉTAPE 2 : Vérification du code et mise à jour du mot de passe
 */
export async function resetPasswordWithOTP(formData: any) {
  const { email, otpCode, newPassword, confirmPassword } = formData;

  try {
    if (!email || !otpCode || !newPassword) {
      return { error: "Tous les champs sont obligatoires." };
    }

    if (newPassword !== confirmPassword) {
      return { error: "Les mots de passe ne correspondent pas." };
    }

    // Récupérer l'utilisateur avec son code et son expiration
    const userRes = await db.execute({
      sql: "SELECT otp_code, otp_expires_at FROM users WHERE email = ?",
      args: [email],
    });

    if (userRes.rows.length === 0) {
      return { error: "Utilisateur introuvable." };
    }

    const user = userRes.rows[0];
    const dbOtp = user.otp_code as string;
    const dbExpires = Number(user.otp_expires_at);

    // Vérifications de l'OTP
    if (!dbOtp || dbOtp !== otpCode) {
      return { error: "Le code OTP est incorrect." };
    }

    if (Date.now() > dbExpires) {
      return { error: "Le code OTP a expiré. Veuillez en demander un nouveau." };
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe et vider les champs OTP par sécurité
    await db.execute({
      sql: "UPDATE users SET password_hash = ?, otp_code = NULL, otp_expires_at = NULL WHERE email = ?",
      args: [hashedPassword, email],
    });

    return { success: true, message: "Votre mot de passe a été modifié avec succès." };
  } catch (error) {
    console.error("Erreur lors du reset du mot de passe:", error);
    return { error: "Impossible de réinitialiser le mot de passe." };
  }
}
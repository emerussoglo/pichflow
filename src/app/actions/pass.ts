"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Simulation d'un service d'envoi d'email (Resend, Nodemailer, etc.)
async function sendOTPEmail(email: string, code: string) {
  console.log(`[Pichflow] Email envoyé à ${email} avec le code OTP : ${code}`);
  // Intègre ici ton service Resend ou autre :
  // await resend.emails.send({ from: '...', to: email, subject: '...', html: '...' })
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

    // Envoyer l'email
    await sendOTPEmail(email, otpCode);

    return { success: true, message: "Code envoyé avec succès par e-mail !" };
  } catch (error) {
    console.error(error);
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
    console.error(error);
    return { error: "Impossible de réinitialiser le mot de passe." };
  }
}
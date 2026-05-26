"use server";

import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

// Configuration de la clé JWT
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Configuration de Nodemailer (Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Envoi de l'email avec le code OTP
 */
async function sendOTPEmail(to: string, otp: string) {
  const mailOptions = {
    from: `"PichFlow" <${process.env.GMAIL_USER}>`,
    to: to,
    subject: "Code de confirmation - PichFlow",
    html: `
      <div style="font-family: sans-serif; text-align: center; padding: 40px; background-color: #f9f9f9;">
        <div style="max-width: 400px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h1 style="color: #333;">Bienvenue sur PichFlow</h1>
          <p style="color: #666;">Merci de nous avoir rejoint ! Voici votre code de confirmation :</p>
          <div style="font-size: 32px; font-weight: bold; background: #eee; padding: 15px; border-radius: 5px; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #999;">Si vous n'avez pas créé de compte, ignorez simplement cet email.</p>
        </div>
      </div>
    `,
  };
  return await transporter.sendMail(mailOptions);
}

/** 
 * Crée un cookie de session sécurisé
 */
async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();

  cookieStore.set("pichflow_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
}

/**
 * ACTION : INSCRIPTION AVEC GÉNÉRATION OTP
 */
export async function signUpAction(userData: any) {
  const { email, password, name } = userData;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const existingUser = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email],
    });

    if (existingUser.rows.length > 0) {
      return { error: "Cet email est déjà utilisé." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await db.execute({
      sql: "INSERT INTO users (id, email, password_hash, credits, name, is_verified, otp_code) VALUES (?, ?, ?, ?, ?, 0, ?)",
      args: [userId, email, hashedPassword, 15, name, otp],
    });

    await db.execute({
      sql: "INSERT INTO sender_info (id, user_id, nom_service) VALUES (?, ?, ?)",
      args: [uuidv4(), userId, name]
    });

    await sendOTPEmail(email, otp);
    await createSession(userId);

    return { success: true };
  } catch (e) {
    console.error("Erreur Inscription:", e);
    return { error: "Une erreur est survenue lors de la création du compte." };
  }
}



/**
 * Envoi de l'email de bienvenue après confirmation
 */
async function sendWelcomeEmail(to: string, name: string) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://pichflow.com"}/dashboard`;
  
  const mailOptions = {
    from: `"PichFlow" <${process.env.GMAIL_USER}>`,
    to: to,
    subject: "Bienvenue sur PichFlow ! 🚀",
    html: `
      <div style="font-family: "Poppins", sans-serif; padding: 10px; background-color: #f9f9f9; color: #333;">
        <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <h1 style="color: #2563eb; margin-bottom: 20px;">Félicitation ${name} !</h1>
          <p style="font-size: 16px; line-height: 1.6;">Votre compte pichflow a été vérifié avec succès.</p>
          <p style="font-size: 16px; line-height: 1.6;">Vous pouvez dès maintenant commencer à créer des factures, des devis et les envoyer directement à vos clients. Vous pouvez aussi créer du contenu marketing et copywriting.</p>
          
          <div style=" font-family: "Poppins", sans-serif; text-align: center; margin: 30px 0;">
            <a href="https://pichflow.vercel.app/dashboard" style="background-color: #2563eb; color: white; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Accéder à mon Dashboard
            </a>
          </div>
          
          <div style="display: flex; flex-direction: column; align-items: center; gap: 15px; padding: 20px; background:#fff; color: #000;">
  <p style="margin: 0; font-family: sans-serif; font-size: 14px; font-weight: 500;">Suivez-nous sur les réseaux</p>
<br/>
  <div style="display: flex; gap: 50px;">

    <a href="https://www.tiktok.com/@pichflow" target="_blank" rel="noopener noreferrer">
      <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png"
           width="30" height="30" alt="TikTok" style="display:block;">
    </a>

    <a href="https://www.youtube.com/@pichflow" target="_blank" rel="noopener noreferrer">
      <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png"
           width="30" height="30" alt="YouTube" style="display:block;">
    </a>

  </div>
</div>
          
        </div>
      </div>
    `,
  };
  return await transporter.sendMail(mailOptions);
}

/**
 * ACTION : VÉRIFIER LE CODE OTP
 */
/**
 * ACTION : VÉRIFIER LE CODE OTP + EMAIL DE BIENVENUE
 */
export async function verifyOTPAction(submittedOtp: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pichflow_token")?.value;
    if (!token) return { error: "Session expirée." };

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    // On récupère aussi le nom et l'email pour le mail de bienvenue
    const res = await db.execute({
      sql: "SELECT otp_code, email, name FROM users WHERE id = ?",
      args: [userId]
    });

    if (res.rows.length === 0) return { error: "Compte introuvable." };

    const user = res.rows[0];

    if (user.otp_code === submittedOtp) {
      // 1. Marquer le compte comme vérifié
      await db.execute({
        sql: "UPDATE users SET is_verified = 1, otp_code = NULL WHERE id = ?",
        args: [userId]
      });

      // 2. Envoyer le mail de bienvenue en arrière-plan
      try {
        await sendWelcomeEmail(user.email as string, user.name as string);
      } catch (emailErr) {
        console.error("Erreur envoi email bienvenue:", emailErr);
        // On ne bloque pas l'utilisateur si le mail échoue
      }

      return { success: true };
    } else {
      return { error: "Code de confirmation incorrect." };
    }
  } catch (e) {
    console.error(e);
    return { error: "Erreur lors de la vérification." };
  }
}

/**
 * ACTION : VÉRIFIER LE STATUT (Pour le Layout)
 * Gère le cas où l'utilisateur est supprimé de la DB mais possède encore un cookie
 */
export async function checkEmailVerification() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pichflow_token")?.value;
    if (!token) return { status: "unauthenticated" };

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    const result = await db.execute({
      sql: "SELECT is_verified FROM users WHERE id = ?",
      args: [userId],
    });

    // Cas où le compte a été supprimé manuellement dans Turso
    if (result.rows.length === 0) {
      return { status: "deleted" };
    }

    return { 
      status: "authenticated", 
      isVerified: result.rows[0]?.is_verified === 1 
    };
  } catch (error) {
    return { status: "error" };
  }
}

/**
 * ACTION : CONNEXION CLASSIQUE
 */
export async function loginAction(credentials: any) {
  const { email, password } = credentials;

  try {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [email],
    });

    const user = result.rows[0];
    if (!user) {
      return { error: "Identifiants incorrects." };
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash as string
    );

    if (!isPasswordValid) {
      return { error: "Identifiants incorrects." };
    }

    await createSession(user.id as string);

    return { success: true, isVerified: user.is_verified === 1 };
  } catch (e) {
    console.error("Erreur Connexion:", e);
    return { error: "Une erreur est survenue lors de la connexion." };
  }
}

/**
 * ACTION : CONNEXION VIA GOOGLE (Stricte)
 */
export async function googleLoginAction(googleAccessToken: string) {
  try {
    const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${googleAccessToken}` },
    });
    
    const googleData = await googleRes.json();
    
    if (!googleData.email) {
      return { error: "Impossible de récupérer l'email Google." };
    }

    const email = googleData.email;

    const result = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email],
    });

    // Si pas de compte en base, on refuse la connexion Google
    if (result.rows.length === 0) {
      return { 
        error: "Aucun compte trouvé avec cet email. Veuillez d'abord vous inscrire." 
      };
    }

    const userId = result.rows[0].id as string;
    await createSession(userId);

    return { success: true };
  } catch (e) {
    console.error("Erreur Google Login:", e);
    return { error: "Erreur lors de la communication avec Google." };
  }
}

/**
 * Récupérer les crédits (Sécurisé contre les comptes supprimés)
 */
export async function getUserCredits() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pichflow_token")?.value;
    if (!token) return 0;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    const result = await db.execute({
      sql: "SELECT credits FROM users WHERE id = ?",
      args: [userId],
    });

    if (result.rows.length === 0) return 0;

    return Number(result.rows[0]?.credits) || 0;
  } catch (error) {
    return 0;
  }
}


/**
 * FONCTION UTILITAIRE : RÉCUPÉRER L'UTILISATEUR ACTUEL
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pichflow_token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    const result = await db.execute({
      sql: "SELECT email, name FROM users WHERE id = ?",
      args: [userId],
    });

    if (result.rows.length === 0) return null;

    return {
      id: userId,
      email: result.rows[0]?.email as string,
      name: result.rows[0]?.name as string,
    };
  } catch (error) {
    return null;
  }
}

/**
 * ACTION : RÉCUPÉRER L'EMAIL DE L'UTILISATEUR CONNECTÉ (pour les achats)
 */
export async function getCurrentUserEmail() {
  const user = await getCurrentUser();
  return user?.email || null;
}
/**
 * Déconnexion
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("pichflow_token");
}
"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";

/**
 * Récupère l'ID de l'utilisateur via le JWT
 */
async function getAuthUserId() {
  const cookieStore = await cookies(); 
  const token = cookieStore.get("pichflow_token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string;
  } catch (error) {
    return null;
  }
}

/**
 * Récupère les clients pour le formulaire
 */
export async function getClientsAction() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return [];
    const res = await db.execute({
      sql: "SELECT nom, contact, adresse FROM clients WHERE user_id = ? ORDER BY nom ASC",
      args: [userId]
    });
    return res.rows;
  } catch (e) {
    return [];
  }
}

/**
 * CRÉATION : Applique la TVA de sender_info à la facture et génère un numéro chronologique
 */
export async function createFactureAction(formData: any) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { success: false, error: "Non connecté" };

    // 1. Vérification des crédits
    const userRes = await db.execute({
      sql: "SELECT credits FROM users WHERE id = ?",
      args: [userId],
    });
    const currentCredits = Number(userRes.rows[0]?.credits || 0);
    if (currentCredits < 5) return { success: false, error: "Crédits insuffisants (5 requis)" };

    // 2. RÉCUPÉRATION DES INFOS SENDER
    const senderRes = await db.execute({
      sql: "SELECT nom_service, adresse, contact, tva_rate, ifu_siret, autre_num FROM sender_info WHERE user_id = ?",
      args: [userId],
    });
    
    const sender = senderRes.rows[0];
    const tvaAAppliquer = Number(sender?.tva_rate || 0);

    // 3. GÉNÉRATION CHRONOLOGIQUE DU NUMÉRO DE FACTURE
    const currentYear = new Date().getFullYear();
    
    // On cherche la dernière facture de l'utilisateur pour l'année en cours
    const lastFactureRes = await db.execute({
      sql: `SELECT numero_facture FROM factures 
            WHERE user_id = ? AND numero_facture LIKE ? 
            ORDER BY id DESC LIMIT 1`,
      args: [userId, `${currentYear}-%`],
    });

    let nextCount = 1;

    if (lastFactureRes.rows.length > 0) {
      const lastNumero = lastFactureRes.rows[0].numero_facture as string; // ex: "2026-002"
      const parts = lastNumero.split("-");
      if (parts.length === 2) {
        const lastCount = parseInt(parts[1], 10);
        if (!isNaN(lastCount)) {
          nextCount = lastCount + 1;
        }
      }
    }

    // Formatage avec padding de zéros (ex: 1 -> "001", 12 -> "012")
    const formattedCount = String(nextCount).padStart(3, "0");
    const numeroFacture = `${currentYear}-${formattedCount}`;

    const factureUuid = "fact_" + Date.now().toString();
 
    const queries: any[] = [
      // Déduction crédits
      { sql: "UPDATE users SET credits = credits - 5 WHERE id = ?", args: [userId] },
      // Insertion facture avec status par défaut
      {
        sql: `INSERT INTO factures (
          id, user_id, numero_facture, sender_nom, sender_adresse, sender_contact, 
          ifu_siret, autre_num, client_nom, client_contact, client_adresse, 
          devise, date_emission, date_echeance, tva_rate, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          factureUuid, 
          userId, 
          numeroFacture, 
          sender?.nom_service || "Nom du Service", 
          sender?.adresse || "", 
          sender?.contact || "",
          sender?.ifu_siret || "", 
          sender?.autre_num || "",
          formData.client, 
          formData.clientContact, 
          formData.clientAdresse,
          formData.devise, 
          new Date().toLocaleDateString('fr-FR'), 
          new Date(formData.echeance).toLocaleDateString('fr-FR'),
          tvaAAppliquer,
          'en attente'
        ]
      }
    ];

    // 4. Lignes de prestations
    formData.prestations.forEach((p: any) => {
      queries.push({
        sql: `INSERT INTO lignes_prestations (id, parent_id, parent_type, description, prix_unitaire, quantite) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [Math.random().toString(36).substr(2, 9), factureUuid, 'facture', p.description, p.prixUnitaire, p.quantite]
      });
    });

    await db.batch(queries, "write");
    revalidatePath("/factures");
    return { success: true };

  } catch (error) {
    console.error("Erreur creation facture:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

/**
 * LISTE : Renvoie les factures avec leur TVA et leur STATUS
 */
export async function getFacturesAction() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return [];

    const res = await db.execute({
      sql: "SELECT * FROM factures WHERE user_id = ? ORDER BY id DESC",
      args: [userId]
    });

    return await Promise.all(res.rows.map(async (f: any) => {
      const lines = await db.execute({
        sql: "SELECT description, prix_unitaire, quantite FROM lignes_prestations WHERE parent_id = ? AND parent_type = 'facture'",
        args: [f.id]
      });

      return {
        dbId: String(f.id),
        id: String(f.numero_facture),
        client: String(f.client_nom),
        clientContact: String(f.client_contact),
        clientAdresse: String(f.client_adresse),
        senderNom: String(f.sender_nom || "PichFlow Service"),
        senderAdresse: String(f.sender_adresse || ""),
        senderContact: String(f.sender_contact || ""),
        senderIfu: String(f.ifu_siret || ""),
        senderAutre: String(f.autre_num || ""),
        tvaRate: Number(f.tva_rate || 0),
        status: String(f.status || 'en attente'),
        prestations: lines.rows.map((l: any) => ({
          description: String(l.description),
          prixUnitaire: Number(l.prix_unitaire),
          quantite: Number(l.quantite)
        })),
        devise: String(f.devise),
        date: String(f.date_emission),
        echeance: String(f.date_echeance)
      };
    }));
  } catch (e) {
    return [];
  }
}

/**
 * MODIFICATION DU STATUT
 */
export async function updateFactureStatusAction(dbId: string, newStatus: string) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { success: false };

    await db.execute({
      sql: "UPDATE factures SET status = ? WHERE id = ? AND user_id = ?",
      args: [newStatus, dbId, userId]
    });

    revalidatePath("/factures");
    return { success: true }; 
  } catch (e) {
    return { success: false };
  }
}

/**
 * SUPPRESSION
 */
export async function deleteFactureAction(dbId: string) {
  try {
    await db.batch([
      { sql: "DELETE FROM lignes_prestations WHERE parent_id = ? AND parent_type = 'facture'", args: [dbId] },
      { sql: "DELETE FROM factures WHERE id = ?", args: [dbId] }
    ], "write");
    revalidatePath("/factures");
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

/**
 * ENVOI PAR EMAIL
 */
export async function sendFactureEmailAction(emailDestinataire: string, pdfBase64: string, numeroFacture: string) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { success: false, error: "Non connecté" };

    const transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Pichflow" <${process.env.GMAIL_USER}>`,
      to: emailDestinataire,
      subject: `Votre Facture ${numeroFacture}`,
      text: `Veuillez trouver ci-joint votre facture ${numeroFacture}.\n\nCordialement,\nL'équipe Pichflow.`,
      attachments: [
        {
          filename: `Facture_${numeroFacture}.pdf`,
          content: pdfBase64,
          encoding: 'base64'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    return { success: true };

  } catch (error) {
    console.error("Erreur Nodemailer:", error);
    return { success: false, error: "Erreur lors de l'envoi de l'email" };
  }
}
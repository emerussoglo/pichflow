"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";

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
 * Traitement e-MCF conforme aux spécifications de l'API DGI Bénin (3 étapes)
 */
async function processEmcfInvoiceFull(
  items: any[],
  rawIfu: string,
  operatorName: string,
  clientDetails?: {
    ifu?: string;
    name?: string;
    address?: string;
    contact?: string;
  },
) {
  const apiToken = process.env.EMCF_API_TOKEN;
  const baseUrl = "https://developper.impots.bj/sygmef-emcf/api";

  const cleanIfu = rawIfu ? rawIfu.replace(/\D/g, "") : "";

  if (!cleanIfu || cleanIfu.length < 10) {
    return {
      success: false,
      error: `Numéro IFU invalide (${rawIfu}). Il doit contenir uniquement des chiffres.`,
    };
  }

  const totalAmount = items.reduce((sum, p) => {
    const unitPrice = Number(p.prixUnitaire ?? p.price ?? 0);
    const quantity = Number(p.quantite ?? p.quantity ?? 1);
    return sum + Math.round(unitPrice * quantity);
  }, 0);

  const payloadData: Record<string, unknown> = {
    ifu: cleanIfu,
    aib: "A",
    type: "FV",
    items: items.map((p) => ({
      name: String(p.description || p.name || "Prestation"),
      price: Math.round(Number(p.prixUnitaire ?? p.price ?? 0)),
      quantity: Number(p.quantite ?? p.quantity ?? 1),
      taxGroup: String(p.taxGroup || "B"),
    })),
    operator: {
      name: String(operatorName || "PichFlow"),
    },
    payment: [
      {
        name: "ESPECES",
        amount: totalAmount,
      },
    ],
    reference: `PICHFLOW-${Date.now()}`,
  };

  if (
    clientDetails &&
    (clientDetails.ifu ||
      clientDetails.name ||
      clientDetails.address ||
      clientDetails.contact)
  ) {
    payloadData.client = {
      ifu: clientDetails.ifu || "",
      name: String(clientDetails.name || ""),
      address: String(clientDetails.address || ""),
      contact: String(clientDetails.contact || ""),
    };
  }

  console.log("PAYLOAD DGI:", JSON.stringify(payloadData));

  try {
    const postRes = await fetch(`${baseUrl}/invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(payloadData),
    });

    const postText = await postRes.text();
    if (!postRes.ok) {
      console.error("DGI POST Error:", postText);
      return {
        success: false,
        error: `Erreur POST (${postRes.status}): ${postText}`,
      };
    }

    const postData = JSON.parse(postText);
    const uid = postData.uid;
    if (!uid)
      return {
        success: false,
        error: "UID introuvable dans la réponse de la DGI.",
      };

    const getRes = await fetch(`${baseUrl}/invoice/${uid}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    const getText = await getRes.text();
    const invoiceDetails = getRes.ok && getText ? JSON.parse(getText) : {};

    const putRes = await fetch(`${baseUrl}/invoice/${uid}/confirm`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${apiToken}` },
    });

    const putText = await putRes.text();
    if (!putRes.ok) {
      console.error("DGI PUT Error:", putText);
      return {
        success: false,
        error: `Erreur confirmation DGI (${putRes.status}): ${putText}`,
      };
    }

    const confirmData = putText ? JSON.parse(putText) : {};
    const merged = { ...invoiceDetails, ...confirmData };

    const normalizeText = (value: unknown): string => {
      if (typeof value === "string") return value.trim();
      if (value == null) return "";
      return String(value).trim();
    };

    const normalizeQrCode = (value: unknown): string => {
      const raw = normalizeText(value);
      if (!raw) return "";
      if (raw.startsWith("data:image")) return raw;
      if (/^https?:\/\//i.test(raw)) return raw;
      if (/^[A-Za-z0-9+/=]+$/.test(raw)) return `data:image/png;base64,${raw}`;
      return raw;
    };

    const codeDgi = normalizeText(
      merged.codeMECeFDGI ??
        merged.code ??
        merged.securityCode ??
        merged.codeDgi ??
        merged.codeMECeF ??
        "",
    );
    const counter = normalizeText(
      merged.counters ??
        merged.counter ??
        merged.compteurs ??
        merged.countersText ??
        "",
    );
    const nim = normalizeText(
      merged.nim ?? merged.nimDgi ?? merged.emcfNim ?? "",
    );
    const qrCode = normalizeQrCode(
      merged.qrCode ?? merged.qr ?? merged.qrCodeImage ?? "",
    );

    if (!codeDgi) {
      return {
        success: false,
        error: "La DGI n'a pas retourné de code MECeF/DGI valide.",
      };
    }

    return {
      success: true,
      uid,
      nim,
      codeDgi,
      counter,
      qrCode,
    };
  } catch (error: any) {
    console.error("Erreur technique e-MCF:", error);
    return {
      success: false,
      error: error.message || "Erreur de communication avec l'API e-MCF",
    };
  }
}

export async function getClientsAction() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return [];
    const res = await db.execute({
      sql: "SELECT nom, contact, adresse FROM clients WHERE user_id = ? ORDER BY nom ASC",
      args: [userId],
    });
    // Conversion explicite en objets purs (Plain JavaScript Objects) pour éviter l'erreur Client Component
    return res.rows.map((row) => ({
      nom: String(row.nom || ""),
      contact: String(row.contact || ""),
      adresse: String(row.adresse || ""),
    }));
  } catch (e) {
    return [];
  }
}

export async function createFactureAction(formData: any) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { success: false, error: "Non connecté" };

    const userRes = await db.execute({
      sql: "SELECT credits FROM users WHERE id = ?",
      args: [userId],
    });
    const currentCredits = Number(userRes.rows[0]?.credits || 0);
    if (currentCredits < 5)
      return { success: false, error: "Crédits insuffisants (5 requis)" };

    const senderRes = await db.execute({
      sql: "SELECT nom_service, adresse, contact, tva_rate, ifu_siret, autre_num FROM sender_info WHERE user_id = ?",
      args: [userId],
    });

    const sender = senderRes.rows[0];
    const tvaAAppliquer = Number(sender?.tva_rate || 0);
    const rawIfu = String(sender?.ifu_siret || "");

    if (!rawIfu) {
      return {
        success: false,
        error:
          "Veuillez renseigner votre numéro IFU dans vos paramètres vendeur.",
      };
    }

    const emcfResult = await processEmcfInvoiceFull(
      formData.prestations,
      rawIfu,
      (sender?.nom_service as string) || "PichFlow",
      {
        ifu: String(formData.clientIfu || ""),
        name: String(formData.client || ""),
        address: String(formData.clientAdresse || ""),
        contact: String(formData.clientContact || ""),
      },
    );

    if (!emcfResult.success) {
      return {
        success: false,
        error: `Validation DGI échouée : ${emcfResult.error}`,
      };
    }

    const currentYear = new Date().getFullYear();
    const lastFactureRes = await db.execute({
      sql: `SELECT numero_facture FROM factures 
            WHERE user_id = ? AND numero_facture LIKE ? 
            ORDER BY id DESC LIMIT 1`,
      args: [userId, `${currentYear}-%`],
    });

    let nextCount = 1;
    if (lastFactureRes.rows.length > 0) {
      const lastNumero = lastFactureRes.rows[0].numero_facture as string;
      const parts = lastNumero.split("-");
      if (parts.length === 2) {
        const lastCount = parseInt(parts[1], 10);
        if (!isNaN(lastCount)) nextCount = lastCount + 1;
      }
    }

    const formattedCount = String(nextCount).padStart(3, "0");
    const numeroFacture = `${currentYear}-${formattedCount}`;
    const factureUuid = "fact_" + Date.now().toString();

    const queries: any[] = [
      {
        sql: "UPDATE users SET credits = credits - 5 WHERE id = ?",
        args: [userId],
      },
      {
        sql: `INSERT INTO factures (
          id, user_id, numero_facture, sender_nom, sender_adresse, sender_contact, 
          ifu_siret, autre_num, client_nom, client_contact, client_adresse, 
          devise, date_emission, date_echeance, tva_rate, status,
          emcf_uid, emcf_qr_code, emcf_counter, emcf_code_dgi
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          new Date().toLocaleDateString("fr-FR"),
          new Date(formData.echeance).toLocaleDateString("fr-FR"),
          tvaAAppliquer,
          "normalisée",
          emcfResult.nim || emcfResult.uid,
          emcfResult.qrCode,
          emcfResult.counter,
          emcfResult.codeDgi,
        ],
      },
    ];

    formData.prestations.forEach((p: any) => {
      queries.push({
        sql: `INSERT INTO lignes_prestations (id, parent_id, parent_type, description, prix_unitaire, quantite) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          Math.random().toString(36).substr(2, 9),
          factureUuid,
          "facture",
          p.description,
          p.prixUnitaire,
          p.quantite,
        ],
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

export async function getFacturesAction() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return [];

    const senderRes = await db.execute({
      sql: "SELECT logo, payment_method, email FROM sender_info WHERE user_id = ?",
      args: [userId],
    });

    const userLogo = senderRes.rows[0]?.logo
      ? String(senderRes.rows[0].logo)
      : "";
    const userPaymentMethod = senderRes.rows[0]?.payment_method
      ? String(senderRes.rows[0].payment_method)
      : "";
    const userEmail = senderRes.rows[0]?.email
      ? String(senderRes.rows[0].email)
      : "";

    const res = await db.execute({
      sql: "SELECT * FROM factures WHERE user_id = ? ORDER BY id DESC",
      args: [userId],
    });

    return await Promise.all(
      res.rows.map(async (f: any) => {
        const lines = await db.execute({
          sql: "SELECT description, prix_unitaire, quantite FROM lignes_prestations WHERE parent_id = ? AND parent_type = 'facture'",
          args: [f.id],
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
          senderEmail: userEmail,
          senderIfu: String(f.ifu_siret || ""),
          senderAutre: String(f.autre_num || ""),
          senderLogo: userLogo,
          paymentMethod: userPaymentMethod,
          tvaRate: Number(f.tva_rate || 0),
          status: String(f.status || "en attente"),
          emcfUid: String(f.emcf_uid || ""),
          emcfQrCode: String(f.emcf_qr_code || ""),
          emcfCounter: String(f.emcf_counter || ""),
          emcfCodeDgi: String(f.emcf_code_dgi || ""),
          prestations: lines.rows.map((l: any) => ({
            description: String(l.description),
            prixUnitaire: Number(l.prix_unitaire),
            quantite: Number(l.quantite),
          })),
          devise: String(f.devise),
          date: String(f.date_emission),
          echeance: String(f.date_echeance),
        };
      }),
    );
  } catch (e) {
    return [];
  }
}

export async function updateFactureStatusAction(
  dbId: string,
  newStatus: string,
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { success: false };

    await db.execute({
      sql: "UPDATE factures SET status = ? WHERE id = ? AND user_id = ?",
      args: [newStatus, dbId, userId],
    });

    revalidatePath("/factures");
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

export async function deleteFactureAction(dbId: string) {
  try {
    await db.batch(
      [
        {
          sql: "DELETE FROM lignes_prestations WHERE parent_id = ? AND parent_type = 'facture'",
          args: [dbId],
        },
        { sql: "DELETE FROM factures WHERE id = ?", args: [dbId] },
      ],
      "write",
    );
    revalidatePath("/factures");
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

export async function sendFactureEmailAction(
  emailDestinataire: string,
  pdfBase64: string,
  numeroFacture: string,
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { success: false, error: "Non connecté" };

    const senderRes = await db.execute({
      sql: "SELECT nom_service, adresse, contact, autre_num, email FROM sender_info WHERE user_id = ?",
      args: [userId],
    });
    const sender = senderRes.rows[0];

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${sender?.nom_service || "PichFlow"}" <${process.env.GMAIL_USER}>`,
      to: emailDestinataire,
      subject: `Facture normalisée ${numeroFacture} - ${sender?.nom_service || "PichFlow"}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #000;">Bonjour,</h2>
          <p>Vous trouverez ci-joint votre facture normalisée <strong>n°${numeroFacture}</strong> émise par <strong>${sender?.nom_service || "notre service"}</strong>.</p>
        </div>
      `,
      attachments: [
        {
          filename: `Facture_${numeroFacture}.pdf`,
          content: pdfBase64,
          encoding: "base64",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Erreur Nodemailer:", error);
    return { success: false, error: "Erreur lors de l'envoi de l'email" };
  }
}

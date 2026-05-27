"use server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

async function getAuthUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("pichflow_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || ""));
    return payload.userId as string;
  } catch (error) { return null; }
}

export async function getReportData() {
  try {
    const userId = await getAuthUserId();

    

    if (!userId) return null;

    // 1. CALCUL DU CHIFFRE D'AFFAIRES TOTAL (Toutes les factures confondues ou payées selon ton choix, ici total)
    const revRes = await db.execute({
      sql: `
        SELECT 
          SUM(lp.prix_unitaire * lp.quantite) as total 
        FROM factures f
        JOIN lignes_prestations lp ON f.id = lp.parent_id
        WHERE f.user_id = ? AND lp.parent_type = 'facture'
      `,
      args: [userId],
    });

    // 1b. TOTAL DES FACTURES PAYÉES
    const paidRes = await db.execute({
      sql: `
        SELECT SUM(lp.prix_unitaire * lp.quantite) as total 
        FROM factures f
        JOIN lignes_prestations lp ON f.id = lp.parent_id
        WHERE f.user_id = ? AND lp.parent_type = 'facture' AND f.status = 'payée'
      `,
      args: [userId],
    });

    // 1c. TOTAL DES FACTURES EN ATTENTE
    const pendingRes = await db.execute({
      sql: `
        SELECT SUM(lp.prix_unitaire * lp.quantite) as total 
        FROM factures f
        JOIN lignes_prestations lp ON f.id = lp.parent_id
        WHERE f.user_id = ? AND lp.parent_type = 'facture' AND f.status = 'en attente'
      `,
      args: [userId],
    });

    // 1d. LISTE DES FACTURES EN ATTENTE POUR VÉRIFIER LES RETARDS
    const pendingInvoicesList = await db.execute({
      sql: "SELECT numero_facture, client_nom, date_echeance FROM factures WHERE user_id = ? AND status = 'en attente'",
      args: [userId],
    });

    // RÉCUPÉRATION DE LA DEVISE
    const currencyRes = await db.execute({
      sql: "SELECT devise FROM factures WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      args: [userId],
    });

    // 2. ÉVOLUTION MENSUELLE
    const monthlyRes = await db.execute({
      sql: `
        SELECT 
          SUBSTR(f.date_emission, 4, 2) as month, 
          SUM(lp.prix_unitaire * lp.quantite) as total
        FROM factures f
        JOIN lignes_prestations lp ON f.id = lp.parent_id
        WHERE f.user_id = ? AND lp.parent_type = 'facture'
        GROUP BY month
      `,
      args: [userId],
    });

    const countMarketing = await db.execute({
      sql: "SELECT COUNT(*) as count FROM marketing_history WHERE user_id = ?",
      args: [userId],
    });

    const countCopy = await db.execute({
      sql: "SELECT COUNT(*) as count FROM copywriting_history WHERE user_id = ?",
      args: [userId],
    });

    const countFactures = await db.execute({
  sql: "SELECT COUNT(*) as count FROM factures WHERE user_id = ?",
  args: [userId],
});

const countDevis = await db.execute({
  sql: "SELECT COUNT(*) as count FROM devis WHERE user_id = ?",
  args: [userId],
});
    

    return {
      totalRevenue: Number(revRes.rows[0]?.total || 0),
      paidRevenue: Number(paidRes.rows[0]?.total || 0),
      pendingRevenue: Number(pendingRes.rows[0]?.total || 0),
      pendingInvoices: pendingInvoicesList.rows, // Envoyé au front pour vérification des dates
      devise: currencyRes.rows[0]?.devise || "€",
      monthlyRevenue: monthlyRes.rows,
      marketingCount: Number(countMarketing.rows[0]?.count || 0),
      copywritingCount: Number(countCopy.rows[0]?.count || 0),
      facturesCount: Number(countFactures.rows[0]?.count || 0),
  devisCount: Number(countDevis.rows[0]?.count || 0),
    };
  } catch (error) {
    console.error("Erreur rapports:", error);
    return null;
  }
}


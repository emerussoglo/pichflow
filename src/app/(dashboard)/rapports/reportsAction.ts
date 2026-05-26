"use server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

async function getAuthUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("pichflow_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return payload.userId as string;
  } catch (error) { return null; }
}

export async function getReportData() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return null;

    // 1. CALCUL DU CHIFFRE D'AFFAIRES
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

    // 1b. RÉCUPÉRATION DE LA DEVISE (Prend la devise de la facture la plus récente)
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

    return {
      totalRevenue: Number(revRes.rows[0]?.total || 0),
      devise: currencyRes.rows[0]?.devise || "€", // On récupère la vraie devise ici
      monthlyRevenue: monthlyRes.rows,
      marketingCount: Number(countMarketing.rows[0]?.count || 0),
      copywritingCount: Number(countCopy.rows[0]?.count || 0),
    };
  } catch (error) {
    console.error("Erreur rapports:", error);
    return null;
  }
}
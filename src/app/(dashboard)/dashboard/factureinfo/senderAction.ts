"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function saveSenderInfoAction(data: { 
  nom_service: string, 
  adresse: string, 
  contact: string,
  tva_rate: number,
  ifu_siret: string, // Nouveau
  autre_num: string  // Nouveau
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pichflow_token")?.value;
    if (!token) return { success: false, error: "Session expirée" };

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const existing = await db.execute({
      sql: "SELECT id FROM sender_info WHERE user_id = ?",
      args: [userId],
    });

    if (existing.rows.length > 0) {
      await db.execute({
        sql: "UPDATE sender_info SET nom_service = ?, adresse = ?, contact = ?, tva_rate = ?, ifu_siret = ?, autre_num = ? WHERE user_id = ?",
        args: [data.nom_service, data.adresse, data.contact, data.tva_rate, data.ifu_siret, data.autre_num, userId],
      });
    } else {
      const id = "snd_" + Date.now().toString();
      await db.execute({
        sql: "INSERT INTO sender_info (id, user_id, nom_service, adresse, contact, tva_rate, ifu_siret, autre_num) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [id, userId, data.nom_service, data.adresse, data.contact, data.tva_rate, data.ifu_siret, data.autre_num],
      });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur serveur" };
  }
}

export async function getSenderInfo() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pichflow_token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    
    const res = await db.execute({
      sql: "SELECT nom_service as nomService, adresse, contact, tva_rate as tvaRate, ifu_siret as ifuSiret, autre_num as autreNum FROM sender_info WHERE user_id = ?",
      args: [payload.userId as string],
    });
    return res.rows[0] || null;
  } catch (e) { return null; }
}
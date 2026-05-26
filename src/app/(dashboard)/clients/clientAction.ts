"use server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { revalidatePath } from "next/cache";

// Fonction pour récupérer l'ID de l'utilisateur via le token
async function getAuthUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("pichflow_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return payload.userId as string;
  } catch (error) { return null; }
}

// Récupérer tous les clients de l'utilisateur
export async function getClientsAction() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return [];

    const res = await db.execute({
      sql: "SELECT * FROM clients WHERE user_id = ? ORDER BY created_at DESC",
      args: [userId]
    });

    return res.rows.map((c: any) => ({
      id: String(c.id),
      nom: String(c.nom),
      contact: String(c.contact),
      adresse: String(c.adresse)
    }));
  } catch (e) { 
    return []; 
  }
}

// Créer ou Modifier un client
export async function saveClientAction(formData: any, editingId: string | null) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { success: false, error: "Non connecté" };

    if (editingId) {
      // UPDATE SQL
      await db.execute({
        sql: "UPDATE clients SET nom = ?, contact = ?, adresse = ? WHERE id = ? AND user_id = ?",
        args: [formData.nom, formData.contact, formData.adresse, editingId, userId]
      });
    } else {
      // INSERT SQL
      const clientUuid = "cli_" + Date.now().toString();
      await db.execute({
        sql: "INSERT INTO clients (id, user_id, nom, contact, adresse) VALUES (?, ?, ?, ?, ?)",
        args: [clientUuid, userId, formData.nom, formData.contact, formData.adresse]
      });
    }

    revalidatePath("/dashboard/clients");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors de l'enregistrement" };
  }
}

// Supprimer un client
export async function deleteClientAction(id: string) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { success: false };

    await db.execute({
      sql: "DELETE FROM clients WHERE id = ? AND user_id = ?",
      args: [id, userId]
    });

    revalidatePath("/dashboard/clients");
    return { success: true };
  } catch (e) { 
    return { success: false }; 
  }
}
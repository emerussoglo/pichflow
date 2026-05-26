"use server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";

export async function changePasswordAction(formData: any) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pichflow_token")?.value;
    if (!token) return { error: "Session expirée." };

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    const userId = payload.userId as string;

    // 1. Récupérer le hash actuel
    const userRes = await db.execute({
      sql: "SELECT password_hash FROM users WHERE id = ?",
      args: [userId],
    });

    if (userRes.rows.length === 0) return { error: "Utilisateur non trouvé." };
    const currentHash = userRes.rows[0].password_hash as string;

    // 2. Vérifier l'ancien mot de passe
    const isOldCorrect = await bcrypt.compare(formData.current, currentHash);
    if (!isOldCorrect) return { error: "Le mot de passe actuel est incorrect." };

    // 3. Hasher le nouveau et sauvegarder
    const newHash = await bcrypt.hash(formData.new, 10);
    await db.execute({
      sql: "UPDATE users SET password_hash = ? WHERE id = ?",
      args: [newHash, userId],
    });

    return { success: true };
  } catch (error) {
    return { error: "Une erreur est survenue." };
  }
}
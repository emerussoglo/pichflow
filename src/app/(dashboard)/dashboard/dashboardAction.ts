"use server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function getUserName() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pichflow_token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    
    const userId = payload.userId as string;

    // On récupère le nom directement depuis la colonne que tu viens de créer
    const res = await db.execute({
      sql: "SELECT name FROM users WHERE id = ?",
      args: [userId],
    });

    return res.rows[0]?.name as string || "Utilisateur";
  } catch (error) {
    return "Utilisateur";
  }
}
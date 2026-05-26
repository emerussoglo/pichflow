"use server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";

async function getAuthUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("pichflow_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return payload.userId as string;
  } catch (error) { return null; }
}

export async function getUserSettings() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return null;

    // Récupération selon ton schéma : name, email, credits
    const res = await db.execute({
      sql: "SELECT name, email, credits FROM users WHERE id = ?",
      args: [userId],
    });

    return res.rows[0] || null;
  } catch (e) { return null; }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("pichflow_token");
  redirect("/");
}
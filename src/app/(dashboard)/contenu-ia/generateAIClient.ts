"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db"; 
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

interface GenerateParams {
  prompt: string;
  systemInstruction: string;
  type: string; 
}

interface GenerateResponse {
  success: boolean;
  text?: string;
  error?: string;
  dbItem?: {
    id: string;
    type: string;
    sujet: string;
    contenu: string;
    date: string;
  };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// --- FONCTION DE GÉNÉRATION ---
export async function generateMarketingAction({ 
  prompt, 
  systemInstruction, 
  type 
}: GenerateParams): Promise<GenerateResponse> {
  const apiKey = process.env.GOOGLE_AI_AP_KEY;
  const jwtSecret = process.env.JWT_SECRET;

  if (!apiKey) return { success: false, error: "Clé API manquante." };
  if (!jwtSecret) return { success: false, error: "Secret JWT manquant." };

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pichflow_token")?.value;
    if (!token) return { success: false, error: "Vous n'êtes pas connecté." };

    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const userRow = await db.execute({
      sql: "SELECT credits FROM users WHERE id = ?",
      args: [userId],
    });

    const currentCredits = Number(userRow.rows[0]?.credits) || 0;
    if (currentCredits < 5) {
      return { success: false, error: "Crédits insuffisants (5 requis)." };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: { role: "system", parts: [{ text: systemInstruction }] } as any,
    });

    let text = "";
    const maxRetries = 2;
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const result = await model.generateContent(prompt);
        text = result.response.text();
        if (text) break;
      } catch (err: any) {
        if ((err.message?.includes("503") || err.message?.includes("429")) && i < maxRetries) {
          await wait(2000);
          continue;
        }
        throw err;
      }
    }

    if (!text) throw new Error("L'IA a renvoyé un contenu vide.");

    const generationId = Date.now().toString();
    const dateNow = new Date().toISOString();

    await db.batch([
      {
        sql: "UPDATE users SET credits = credits - 5 WHERE id = ?",
        args: [userId],
      },
      {
        sql: "INSERT INTO marketing_history (id, user_id, type, subject, content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        args: [generationId, userId, type, prompt, text, dateNow],
      }
    ], "write");

    return { 
      success: true, 
      text, 
      dbItem: { id: generationId, type, sujet: prompt, contenu: text, date: dateNow } 
    };

  } catch (error: any) {
    console.error("Erreur Backend Pichflow:", error);
    return { success: false, error: "Échec de génération." };
  }
}

// --- FONCTION POUR RÉCUPÉRER L'HISTORIQUE ---
export async function getMarketingHistory() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pichflow_token")?.value;
    if (!token) return [];

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const result = await db.execute({
      sql: "SELECT id, type, subject as sujet, content as contenu, created_at as date FROM marketing_history WHERE user_id = ? ORDER BY created_at DESC",
      args: [userId],
    });

    return result.rows.map(row => ({
      ...row,
      date: new Date(row.date as string).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    }));
  } catch (error) {
    console.error("Erreur chargement historique:", error);
    return [];
  }
}

// --- FONCTION POUR SUPPRIMER UN ÉLÉMENT ---
export async function deleteMarketingItem(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pichflow_token")?.value;
    if (!token) return { success: false };

    await db.execute({
      sql: "DELETE FROM marketing_history WHERE id = ?",
      args: [id],
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
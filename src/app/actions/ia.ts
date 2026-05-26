"use server";

import { db } from "@/lib/db"; // Ton instance LibSQL/Turso
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

// Remplace par ton import Groq ou Gemini
// Ici j'utilise une structure générique que tu adapteras à ton modèle
export async function generateAIAction({ 
  prompt, 
  systemInstruction, 
  cost = 5 
}: { 
  prompt: string; 
  systemInstruction: string; 
  cost?: number 
}) {
  try {
    // 1. Authentification & Identification de l'utilisateur
    const cookieStore = await cookies();
    const token = cookieStore.get("pichflow_token")?.value;
    if (!token) throw new Error("Non authentifié");

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    // 2. Vérification des crédits dans Turso
    const userResult = await db.execute({
      sql: "SELECT credits FROM users WHERE id = ?",
      args: [userId],
    });

    const currentCredits = Number(userResult.rows[0]?.credits) || 0;

    if (currentCredits < cost) {
      return { success: false, error: "Crédits insuffisants. Veuillez en racheter." };
    }

    // 3. Appel à ton IA (Gemini ou Groq)
    // Exemple avec ta logique actuelle :
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemInstruction}\n\nSujet: ${prompt}` }] }]
      })
    });

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;

    if (!generatedText) throw new Error("L'IA n'a pas renvoyé de texte.");

    // 4. TRANSACTION : Déduction des crédits & Sauvegarde en base
    // On utilise un batch pour s'assurer que les deux se font ensemble
    await db.batch([
      {
        sql: "UPDATE users SET credits = credits - ? WHERE id = ?",
        args: [cost, userId],
      },
      {
        sql: "INSERT INTO contents (id, user_id, type, subject, body, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        args: [
            Date.now().toString(), 
            userId, 
            "IA-Generation", 
            prompt.substring(0, 50), 
            generatedText, 
            new Date().toISOString()
        ],
      }
    ], "write");

    return { 
      success: true, 
      text: generatedText, 
      remainingCredits: currentCredits - cost 
    };

  } catch (error: any) {
    console.error("Erreur génération IA:", error);
    return { success: false, error: error.message };
  }
}
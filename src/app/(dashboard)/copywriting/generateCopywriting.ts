"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db"; 
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

interface GenerateParams {
  prompt: string;
  systemInstruction: string;
  type: string; // Ajouté pour correspondre à ton interface frontend
}

interface GenerateResponse {
  success: boolean;
  text?: string;
  error?: string;
  dbItem?: {
    id: string;
    method: string;
    product: string;
    content: string;
    date: string;
  };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateCopywritingAction({ 
  prompt, 
  systemInstruction,
  type 
}: GenerateParams): Promise<GenerateResponse> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  const jwtSecret = process.env.JWT_SECRET;

  if (!apiKey) return { success: false, error: "Clé API manquante dans .env" };

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pichflow_token")?.value;
    if (!token) return { success: false, error: "Vous n'êtes pas connecté." };

    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    // 1. Vérification crédits
    const userRow = await db.execute({
      sql: "SELECT credits FROM users WHERE id = ?",
      args: [userId],
    });
    const currentCredits = Number(userRow.rows[0]?.credits) || 0;
    if (currentCredits < 5) return { success: false, error: "Crédits insuffisants (5 requis)." };

    // 2. Initialisation Gemini (Utilisation de 1.5 Flash pour plus de stabilité)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest", 
      systemInstruction: systemInstruction,
    });

    let text = "";
    // Tentatives de génération pour gérer les erreurs 503 temporaires
    for (let i = 0; i <= 2; i++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
        if (text) break;
      } catch (err) {
        console.error(`Tentative ${i+1} échouée:`, err);
        if (i < 2) await wait(2000);
        else throw err;
      }
    }

    if (!text) throw new Error("L'IA n'a retourné aucun texte.");

    // 3. Préparation des données pour la DB
    const generationId = "copy_" + Date.now().toString();
    const dateNow = new Date().toISOString();

    // Extraction sécurisée des informations
    const methodUsed = prompt.includes("Méthode : ") ? prompt.split("Méthode : ")[1].trim() : "AIDA";
    const productUsed = prompt.includes("Produit/Service : ") 
      ? prompt.split(". Cible")[0].replace("Produit/Service : ", "").trim() 
      : "Produit inconnu";

    // 4. Exécution de la transaction (Débit crédits + Insertion historique)
  await db.batch([
      { 
        sql: "UPDATE users SET credits = credits - 5 WHERE id = ?", 
        args: [userId] 
      },
      {
        // AJOUT DE 'subject' DANS LA LISTE DES COLONNES
        sql: `INSERT INTO copywriting_history 
              (id, user_id, method, product, subject, content, type, created_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          generationId, 
          userId, 
          methodUsed, 
          productUsed, // pour la colonne 'product'
          productUsed, // pour la colonne 'subject' (on utilise la même donnée)
          text, 
          type || "Non spécifié", 
          dateNow
        ],
      }
    ], "write");

    return { 
      success: true, 
      text, 
      dbItem: { 
        id: generationId, 
        method: methodUsed, 
        product: productUsed, 
        content: text, 
        date: dateNow 
      } 
    };

  } catch (error: any) {
    console.error("ERREUR GENERATION COPYWRITING:", error);
    // Retourne un message d'erreur plus précis à l'utilisateur
    let errorMessage = "Échec de la génération.";
    if (error.message?.includes("NOT NULL constraint failed")) {
        errorMessage = "Erreur DB: Un champ obligatoire est manquant (type).";
    } else if (error.status === 503) {
        errorMessage = "Le service Google est temporairement surchargé. Réessayez.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function getCopyHistory() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pichflow_token")?.value;
    if (!token) return [];

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    
    const result = await db.execute({
      sql: "SELECT id, method, product, content, created_at as date FROM copywriting_history WHERE user_id = ? ORDER BY created_at DESC",
      args: [payload.userId as string],
    });

    return result.rows.map(row => ({
      id: row.id,
      method: row.method,
      product: row.product,
      content: row.content,
      date: new Date(row.date as string).toLocaleString("fr-FR", { 
        day: "2-digit", 
        month: "short", 
        hour: "2-digit", 
        minute: "2-digit" 
      })
    }));
  } catch (error) { 
    console.error("Erreur récupération historique:", error);
    return []; 
  }
}

export async function deleteCopyItem(id: string) {
  try {
    await db.execute({ sql: "DELETE FROM copywriting_history WHERE id = ?", args: [id] });
    return { success: true };
  } catch (error) { 
    console.error("Erreur suppression item:", error);
    return { success: false }; 
  }
}
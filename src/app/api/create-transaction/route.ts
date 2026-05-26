import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

const PACKS = [
  { credits: 80, price: 1000 },
  { credits: 200, price: 2000 },
];

export async function POST(req: Request) {
  try {
    const { email, credits, amount } = await req.json();

    // Vérification que le pack est valide (sécurité)
    const validPack = PACKS.find(
      (p) => p.credits === credits && p.price === amount
    );

    if (!validPack || !email) {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }

    const transactionId = uuidv4();

    await db.execute({
      sql: `INSERT INTO credit_transactions 
              (id, user_email, credits, amount, status) 
            VALUES (?, ?, ?, ?, 'pending')`,
      args: [transactionId, email.toLowerCase().trim(), credits, amount],
    });

    return NextResponse.json({ transactionId });
  } catch (err) {
    console.error("Erreur create-transaction:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
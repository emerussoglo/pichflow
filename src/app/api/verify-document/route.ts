import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const numero = searchParams.get("numero");

  if (!numero) {
    return NextResponse.json({ error: "Numéro requis" }, { status: 400 });
  }

  try {
    // 1. Chercher le document (Facture ou Devis)
    // On cherche dans la table factures par numero_facture
    const docRes = await db.execute({
      sql: "SELECT * FROM factures WHERE numero_facture = ?",
      args: [numero],
    });

    if (docRes.rows.length === 0) {
      return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
    }

    const doc = docRes.rows[0];

    // 2. Chercher les lignes de prestations associées
    const linesRes = await db.execute({
      sql: "SELECT description, prix_unitaire, quantite FROM lignes_prestations WHERE parent_id = ?",
      args: [doc.id],
    });

    // 3. Retourner le tout combiné
    return NextResponse.json({
      ...doc,
      prestations: linesRes.rows
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de la vérification" }, { status: 500 });
  }
}
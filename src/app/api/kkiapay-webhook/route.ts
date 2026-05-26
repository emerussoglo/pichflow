import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  // 1. Vérification du secret webhook
  const receivedSecret = req.headers.get("x-kkiapay-secret");
  const expectedSecret = process.env.KKIAPAY_WEBHOOK_SECRET;

  if (
    !receivedSecret ||
    !expectedSecret ||
    receivedSecret !== expectedSecret
  ) {
    console.error("❌ Secret webhook invalide");
    // On retourne 200 quand même pour éviter les retries inutiles
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // 2. Lecture du body
  const body = await req.json();
  console.log("📥 Webhook reçu:", JSON.stringify(body, null, 2));

  // 3. On ne traite que les succès
  if (body.event !== "transaction.success" || body.isPaymentSucces !== true) {
    console.log("ℹ️ Événement ignoré:", body.event);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const kkiapayTransactionId = body.transactionId;

  // 4. Récupérer le partnerId = notre transactionId interne
  const internalTransactionId = body.partnerId;

  if (!internalTransactionId) {
    console.error("❌ partnerId manquant dans le webhook");
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // 5. Vérifier que la transaction existe et est bien en pending
  let transaction;
  try {
    const result = await db.execute({
      sql: `SELECT * FROM credit_transactions WHERE id = ? AND status = 'pending'`,
      args: [internalTransactionId],
    });

    if (result.rows.length === 0) {
      console.error(
        "❌ Transaction introuvable ou déjà traitée:",
        internalTransactionId
      );
      return NextResponse.json({ received: true }, { status: 200 });
    }

    transaction = result.rows[0];
  } catch (err) {
    console.error("❌ Erreur lecture transaction:", err);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const userEmail = transaction.user_email as string;
  const nbCredits = transaction.credits as number;

  // 6. Marquer la transaction comme complétée (évite les doublons)
  try {
    await db.execute({
      sql: `UPDATE credit_transactions 
            SET status = 'completed', kkiapay_transaction_id = ? 
            WHERE id = ? AND status = 'pending'`,
      args: [kkiapayTransactionId, internalTransactionId],
    });
  } catch (err) {
    console.error("❌ Erreur update transaction:", err);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // 7. Ajouter les crédits à l'utilisateur
  try {
    const result = await db.execute({
      sql: `UPDATE users 
            SET credits = COALESCE(credits, 0) + ? 
            WHERE LOWER(email) = ?`,
      args: [nbCredits, userEmail.toLowerCase()],
    });

    if (result.rowsAffected === 0) {
      console.error("❌ Aucun utilisateur trouvé:", userEmail);
    } else {
      console.log(`✅ ${nbCredits} crédits ajoutés à ${userEmail}`);
    }
  } catch (err) {
    console.error("❌ Erreur ajout crédits:", err);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
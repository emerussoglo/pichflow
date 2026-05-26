import { NextResponse } from "next/server";
import { Webhook } from "fedapay";
import { db } from "@/lib/db"; // Ton client LibSQL/Turso

export async function POST(req: Request) {
  // 1. Récupération de la signature et du secret
  const sig = req.headers.get("x-fedapay-signature");
  const endpointSecret = process.env.FEDAPAY_WEBHOOK_SECRET;

  if (!sig || !endpointSecret) {
    return NextResponse.json({ error: "Sécurité absente" }, { status: 400 });
  }

  try {
    // 2. Lecture du corps brut (raw body)
    const rawBody = await req.text();
    
    // 3. Vérification authentique de l'événement
    const event = Webhook.constructEvent(rawBody, sig, endpointSecret);

    // 4. Traitement uniquement si la transaction est approuvée
    if (event.name === "transaction.approved") {
            const transaction = event.entity || event.data || event;
      
      // Récupération des données personnalisées
      const userEmail = transaction.custom_metadata?.user_email;
      const nbCredits = parseInt(transaction.custom_metadata?.nb_credits);

      if (userEmail && !isNaN(nbCredits)) {
        // 🚀 Mise à jour de ta table Turso
        // On utilise COALESCE pour s'assurer que si credits est NULL, on part de 0
        await db.execute({
          sql: "UPDATE users SET credits = COALESCE(credits, 0) + ? WHERE email = ?",
          args: [nbCredits, userEmail.trim()],
        });

        console.log(`✅ SUCCESS: ${nbCredits} crédits livrés à ${userEmail}`);
      }
    }

    // 5. Réponse 2xx immédiate pour acquitter la réception
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (err: any) {
    // En cas d'erreur de signature ou autre
    console.error("⚠️ Webhook Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
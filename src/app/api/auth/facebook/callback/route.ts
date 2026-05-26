import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  
  // Récupération de l'ID utilisateur Pichflow
  const cookieStore = await cookies();
  const token = cookieStore.get("pichflow_token")?.value;
  if (!token || !code) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  const userId = payload.userId as string;

  try {
    // 1. Échange du code contre un Token Facebook
    const fbTokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&code=${code}`;
    const tokenRes = await fetch(fbTokenUrl);
    const tokenData = await tokenRes.json();

    // 2. Récupération de la Page ID (on prend la première page gérée par l'utilisateur)
    const pagesRes = await fetch(`https://graph.facebook.com/me/accounts?access_token=${tokenData.access_token}`);
    const pagesData = await pagesRes.json();
    const page = pagesData.data[0]; 

    // 3. Sauvegarde dans ta base Turso (table facebook_accounts)
    await db.execute({
      sql: "INSERT INTO facebook_accounts (user_id, access_token, page_id) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET access_token = excluded.access_token, page_id = excluded.page_id",
      args: [userId, page.access_token, page.id]
    });

    // Redirection vers l'historique avec succès
    return NextResponse.redirect(new URL("/dashboard/historique-ai?success=true", req.url));
  } catch (error) {
    return NextResponse.redirect(new URL("/dashboard/historique-ai?error=fb_failed", req.url));
  }
}
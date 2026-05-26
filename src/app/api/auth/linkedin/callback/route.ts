import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  
  const cookieStore = await cookies();
  const token = cookieStore.get("pichflow_token")?.value;
  if (!token || !code) return NextResponse.redirect(new URL("/historique-ai?error=unauthorized", req.url));

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    // 1. Échanger le code contre un Access Token LinkedIn
    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) throw new Error(tokenData.error_description);

    // 2. Récupérer l'ID de l'utilisateur LinkedIn (openid)
    const userRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();

    // 3. Sauvegarder dans ta base Turso (table social_accounts)
    await db.execute({
      sql: `INSERT INTO social_accounts (user_id, platform, access_token, platform_id) 
            VALUES (?, 'linkedin', ?, ?) 
            ON CONFLICT(user_id, platform) DO UPDATE SET 
            access_token = excluded.access_token, platform_id = excluded.platform_id`,
      args: [userId, tokenData.access_token, userData.sub]
    });

    return NextResponse.redirect(new URL("/historique-ai?success=linkedin_connected", req.url));
  } catch (error) {
    console.error("LinkedIn Auth Error:", error);
    return NextResponse.redirect(new URL("/historique-ai?error=linkedin_failed", req.url));
  }
}
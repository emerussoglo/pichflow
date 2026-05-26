import { createClient } from "@libsql/client";

// On vérifie que les variables sont présentes pour éviter de faire planter l'app
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("ERREUR : Les clés Turso ne sont pas définies dans .env.local");
}

export const db = createClient({
  url: url || "",
  authToken: authToken || "",
});
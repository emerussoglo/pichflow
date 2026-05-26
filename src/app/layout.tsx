"use client";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isDashboard =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/parametres") ||
    pathname?.startsWith("/factures") ||
    pathname?.startsWith("/clients") ||
    pathname?.startsWith("/rapports") ||
    pathname?.startsWith("/contenu-ia") || 
    pathname?.startsWith("/buy-credits") ||
    pathname?.startsWith("/credits") ||
    pathname?.startsWith("/change-password") ||
    pathname?.startsWith("/confirmation") ||
    pathname?.startsWith("/devis") ||
    pathname?.startsWith("/connexion") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/inscription") || 
    pathname?.startsWith("/historique-ai") ||
    pathname?.startsWith("/copywriting");

  return (
    <html lang="fr">
     <head>
  <title>PichFlow | Facturation, Marketing & Copywriting IA pour PME</title>
  <meta name="description" content="Gérez votre business de A à Z : génération de contenu SEO, copywriting AIDA, facturation automatisée et rapports financiers. Testez PichFlow gratuitement." />
  <meta name="keywords" content="facturation en ligne, copywriting IA, marketing digital, gestion PME, freelance, rapports financiers, outil SEO" />
  
  {/* Open Graph (Pour le partage sur Facebook, LinkedIn, etc.) */}
  <meta property="og:title" content="PichFlow - Votre outil de croissance tout-en-un" />
  <meta property="og:description" content="Automatisez votre marketing et votre comptabilité avec l'intelligence artificielle." />
  <meta property="og:image" content="/logo.png" />
  <meta property="og:url" content="https://www.pichflow.com" />
  <meta property="og:type" content="website" />

  {/* Twitter Card */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="PichFlow | Gestion & IA" />
  <meta name="twitter:description" content="Gagnez du temps sur vos factures et votre contenu marketing." />
  <meta name="twitter:image" content="/logo.png" />

  {/* Favicon et Mobile */}
  <link rel="icon" href="/logo.png" type="image/png" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="index, follow" />
<link href="https://fonts.googleapis.com/css2?family=Antonio:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap" rel="stylesheet" />

<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
 
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
  
  {/* Tes scripts existants */}
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
</head>

      <body>
        {!isDashboard && <Navbar />}
        <main>{children}</main>
        {!isDashboard && <Footer />}
      </body>
    </html>
  );
}

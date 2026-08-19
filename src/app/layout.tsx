"use client";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Liste des chemins qui n'affichent pas la Navbar/Footer standard
  const dashboardRoutes = [
    "/dashboard", "/parametres", "/factures", "/clients", 
    "/rapports", "/buy-credits", "/credits", "/change-password", 
    "/confirmation", "/devis", "/connexion", "/forgot-password", "/inscription"
  ];

  const isDashboard = dashboardRoutes.some(route => pathname?.startsWith(route));

  return (
    <html lang="fr">
      <head>
        <title>PichFlow | Facturation & Gestion pour PME</title>
        <meta name="description" content="Gérez votre activité de A à Z avec la facturation automatisée et le suivi financier. PichFlow, la solution pour les entrepreneurs." />
        <meta name="keywords" content="facturation en ligne, gestion PME, freelance, rapports financiers, devis, suivi client" />
        
        {/* Open Graph */}
        <meta property="og:title" content="PichFlow - Votre outil de gestion tout-en-un" />
        <meta property="og:description" content="Automatisez votre facturation et pilotez votre activité." />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content="https://www.pichflow.com" />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PichFlow | Gestion Professionnelle" />
        <meta name="twitter:description" content="Gagnez du temps sur la gestion de vos factures et de vos devis." />
        <meta name="twitter:image" content="/logo.png" />

        {/* Favicon et Mobile */}
        <link rel="icon" href="/logo.png" type="image/png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        
        {/* Polices */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Antonio:wght@300;400;600&family=Bodoni+Moda:wght@400;600&family=Open+Sans:wght@300;400;600&family=Roboto:wght@300;400;700&display=swap" rel="stylesheet" />
        
        {/* Scripts et Icons */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" async></script>
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
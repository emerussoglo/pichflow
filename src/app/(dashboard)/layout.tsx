'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import "@/app/dashboard.css";
import { getUserCredits, logoutAction, checkEmailVerification } from "@/app/actions/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [credits, setCredits] = useState<number | string>("..."); 

  const isConfirmationPage = pathname === "/confirmation";

  useEffect(() => {
    const verifyUserStatus = async () => {
      // On récupère le statut complet (authenticated, unauthenticated, ou deleted)
      const authStatus = await checkEmailVerification();

      // 1. CAS CRITIQUE : L'utilisateur a été supprimé de la base de données
      if (authStatus.status === "deleted") {
        await logoutAction(); // On nettoie le cookie côté serveur
        window.location.href = "/login"; // Redirection forcée pour nettoyer l'état client
        return;
      }

      // 2. CAS : Pas de session (non connecté)
      if (authStatus.status === "unauthenticated") {
        router.push("/login");
        return;
      }

      // 3. CAS : Connecté mais email non vérifié
      if (authStatus.status === "authenticated" && !authStatus.isVerified) {
        if (!isConfirmationPage) {
          router.push("/confirmation");
        }
        return;
      }
    };

    verifyUserStatus();

    const fetchCredits = async () => {
      if (isConfirmationPage) return;
      try {
        const val = await getUserCredits();
        setCredits(val);
      } catch (error) {
        setCredits(0);
      }
    };

    fetchCredits();

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pathname, router, isConfirmationPage]);

  // Rendu de la page de confirmation (sans sidebar/topbar)
  if (isConfirmationPage) {
    return <>{children}</>;
  }

  // --- Configuration du Menu ---
  const allMenuItems = [
    { name: "Acceuil", path: "/dashboard", icon: "fa-house" },
    { name: "Clients", path: "/clients", icon: "fa-user-group" },
    { name: "Devis", path: "/devis", icon: "fas fa-receipt" },
    { name: "Factures", path: "/factures", icon: "fa-file-invoice-dollar" },
    { name: "Marketing ", path: "/contenu-ia", icon: "fa-handshake" },
    { name: "Copywriting ", path: "/copywriting", icon: "fa-lightbulb" },
    { name: "Rapports ", path: "/rapports", icon: "fa-chart-pie" },
    { name: "Paramètres ", path: "/parametres", icon: "fa-gear" },
  ];

  const sidebarPrimaryItems = allMenuItems.slice(0, 6);
  const sidebarSecondaryItems = allMenuItems.slice(6);
  const mobileMenuItems = allMenuItems.filter((item) => item.name !== "Rapports " && item.name !== "Paramètres ");

  const activeItem = allMenuItems.find((item) => item.path === pathname);
  const activeTitle = activeItem ? activeItem.name : "Dashboard";

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = "/";
  };
  
  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/dashboard" className="logo">
            <span className="logo-text">
              <span className="ft">ll</span>Pich<span className="blue-text">Flow</span>
            </span>
          </Link>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-group">
            {sidebarPrimaryItems.map((item) => (
              <Link key={item.path} href={item.path} className={`menu-item ${pathname === item.path ? "active" : ""}`}>
                <i className={`fa-solid ${item.icon}`}></i> {item.name}
              </Link>
            ))}
          </div>

          <div className="menu-group bottom">
            {sidebarSecondaryItems.map((item) => (
              <Link key={item.path} href={item.path} className={`menu-item ${pathname === item.path ? "active" : ""}`}>
                <i className={`fa-solid ${item.icon}`}></i> {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            <h1>
              <span>{activeTitle === "Paramètres" ? "Gérez votre compte" : "PichFlow"} - </span>
              {activeTitle}
            </h1>
          </div>

          <div className="topbar-right" ref={profileRef}>
            <button
              className="user-btn"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "3px 7px", borderRadius: "20px", background: "rgba(0,0,0,0.03)", border: "2px solid rgba(0,0,0,0.5)", cursor: "pointer" }}
            >
              <div className="credits-badge" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.9rem", fontWeight: "900", color: "#000", padding: "2px 6px", background: "#fff", borderRadius: "12px" }}>
                <i className="fa-solid fa-coins" style={{ color: "#000" }}></i>
                <span>{credits}</span>
              </div>
              <span style={{ color: "#000", fontSize: "20px" }} className="user-badge">
                <i className="fa-solid fa-bars"></i>
              </span>
            </button> 

            {isProfileOpen && (
              <div className="profile-dropdown">
                
                <Link href="/dashboard/factureinfo" className="menu-item" onClick={() => setIsProfileOpen(false)}>
                   <i className="fa-solid fa-file-invoice"></i> Infos de facturation
                </Link>
                <Link href="/historique-ai" className="menu-item" onClick={() => setIsProfileOpen(false)}>
                  <i className="fa-solid fa-robot"></i> Automatisation
                </Link>
                <Link href="/credits" className="menu-item" onClick={() => setIsProfileOpen(false)}>
                  <i className="fa-solid fa-coins"></i> Achat crédits
                </Link>
                <Link href="/rapports" className="menu-item" onClick={() => setIsProfileOpen(false)}>
                  <i className="fa-solid fa-chart-pie"></i> Rapports
                </Link>
                 <Link href="/parametres" className="menu-item" onClick={() => setIsProfileOpen(false)}>
                  <i className="fa-solid fa-user-gear"></i> Paramètres
                </Link>
                <button className="menu-item logout-btn" onClick={handleLogout} style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                  <i className="fa-solid fa-right-from-bracket"></i> Déconnexion
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="content-area">{children}</section>
      </main>

      <nav className="mobile-tab-bar">
        {mobileMenuItems.map((item) => (
          <Link key={item.path} href={item.path} className={`tab-item ${pathname === item.path ? "active" : ""}`}>
            <i className={`fa-solid ${item.icon}`}></i>
            <span>{item.name}</span>
          </Link>
        ))} 
      </nav> 
    </div>
  );
}
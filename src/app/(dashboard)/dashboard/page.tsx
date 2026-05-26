"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { getUserName } from "./dashboardAction";

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Bonjour");
  const [userName, setUserName] = useState("...");
  const [loading, setLoading] = useState(true); // État pour le loader

  useEffect(() => {
    // 1. Déterminer le salut selon l'heure locale
    const hour = new Date().getHours();
    if (hour >= 12 || hour < 12) {
      setGreeting("Bonsoir");
    } else {
      setGreeting("Bonjour");
    }

    // 2. Récupérer le nom de l'utilisateur
    const fetchUser = async () => {
      try {
        const name = await getUserName();
        if (name) {
          setUserName(name);
        } else {
          setUserName("Utilisateur");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du nom:", error);
        setUserName("Utilisateur");
      } finally {
        setLoading(false); // Arrêt du loader peu importe le résultat
      }
    };
    
    fetchUser();
  }, []);

  const tools = [
    {
      title: "Clients",
      desc: "Ajoutez des clients pour vous permettre de ne pas répéter les informations au cour de la création de facture.",
      icon: "fa-user-group",
      className: "icon-facture",
      link: "/clients",
    },
    {
      title: "Devis Rapide",
      desc: "Créez des devis de manière facile et rapide avec téléchargement illimité sur pichflow.",
      icon: "fa-receipt",
      className: "icon-facture",
      link: "/devis",
    },
    {
      title: "Facturation Rapide",
      desc: "Créez des factures rapidement avec téléchargement illimité sur pichflow.",
      icon: "fa-file-invoice-dollar",
      className: "icon-facture",
      link: "/factures",
    },
    {
      title: "Contenu Marketing IA",
      desc: "Générez des articles de blog SEO, posts réseaux sociaux et emails marketing en quelques clics.",
      icon: "fa-handshake",
      className: "icon-marketing",
      link: "/contenu-ia",
    },
    {
      title: "Copywriting IA",
      desc: "Créez des pages de vente, landing pages et textes publicitaires avec les méthodes AIDA, PAS et plus.",
      icon: "fa-lightbulb",
      className: "icon-copy",
      link: "/copywriting",
    },
    {
      title: "Rapports",
      desc: "Catégorisation automatique des revenus et dépenses avec alertes financières intelligentes.",
      icon: "fa-chart-pie",
      className: "icon-compta",
      link: "/rapports",
    },
  ];

  // Affichage du loader identique à la page Rapports
  if (loading) {
    return (
      <div className="reports-loader-container">
        <div className="pichflow-custom-loader"></div>
        <p style={{ marginTop: '20px', color: '#64748b', fontWeight: '500' }}>
          Préparation de votre espace...
        </p>
      </div>
    ); 
  }

  return (
    <div className="dashboard-home">
      <h3
        className="welcome"
        style={{ marginBottom: "20px", marginTop: "-10px" }}
      > 
        {greeting} <span className="animated-username">  {userName}</span>. Votre dashboard est prêt.
      </h3>
       
<div className="pich-nav-wrapper">
  <div className="pich-nav-scroll">
    <Link href="/dashboard/factureinfo" className="pich-nav-item">
      <i className="fa-solid fa-file-invoice"></i> Infos de facturation
    </Link>
      <Link href="/historique-ai" className="pich-nav-item"> 
      <i className="fa-solid fa-robot"></i> Automatisation
    </Link>
    
    
  </div>
</div>  

      <div className="tools-grid">
        {tools.map((tool, index) => (  
          <div key={index} className="tool-card">
            <div className={`tool-icon-wrapper ${tool.className}`}>
              <i className={`fa-solid ${tool.icon}`}></i>
            </div>
            <h3>{tool.title}</h3>
            <p>{tool.desc}</p>
            <Link href={tool.link} className="btn-access">
              Accéder <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        ))}
      </div>

      <br /> <br /> <br />
    </div>
  );
}
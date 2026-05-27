"use client";
import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { getReportData } from './reportsAction';

export default function RapportsPage() {
  const [realData, setRealData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [overdueInvoices, setOverdueInvoices] = useState<any[]>([]);



const exportToPDF = async () => {
  if (!realData) return;

  try {
    // 1. Créer un conteneur temporaire caché pour injecter le HTML du rapport
    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '-9999px';
    printContainer.style.width = '800px'; // Largeur fixe idéale pour le rendu A4
    printContainer.style.padding = '40px';
    printContainer.style.backgroundColor = '#ffffff';
    printContainer.style.fontFamily = 'Arial, sans-serif';
    printContainer.style.color = '#334155';

    // 2. Construire la liste des factures en retard si elles existent
    let overdueHTML = '';
    if (overdueInvoices.length > 0) {
      overdueHTML = `
        <div style="margin-bottom: 25px; padding: 15px; background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 8px;">
          <h4 style="color: #991B1B; margin: 0 0 10px 0; font-size: 16px;">⚠️ Factures en retard de paiement</h4>
          <ul style="margin: 0; padding-left: 20px; color: #7F1D1D; font-size: 13px; line-height: 1.5;">
            ${overdueInvoices.map(inv => `
              <li>La facture <strong>${inv.numero_facture}</strong> de <strong>${inv.client_nom}</strong> a dépassé son échéance (${inv.date_echeance}).</li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    // 3. Injecter la structure innerHTML avec un design épuré
    printContainer.innerHTML = `
      <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #1e3a8a; margin: 0; font-size: 26px;">Pichflow — Rapport d'activité</h1>
        <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Généré le ${new Date().toLocaleDateString('fr-FR')} pour l'année ${new Date().getFullYear()}</p>
      </div>

      ${overdueHTML}

     <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 40px;">
  <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #10d409;">
    <span style="color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">CA Global</span>
    <span style="display: block; color: #0f172a; font-size: 18px; font-weight: bold; margin-top: 5px;">
      ${Number(realData.totalRevenue || 0).toLocaleString()} ${currentCurrency}
    </span>
  </div>
  <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid ##ff7a30;">
    <span style="color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">En Attente</span>
    <span style="display: block; color: #ff7a30; font-size: 18px; font-weight: bold; margin-top: 5px;">
      ${Number(realData.pendingRevenue || 0).toLocaleString()} ${currentCurrency}
    </span>
  </div>
  <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #2532eb;">
    <span style="color: #2532eb; font-size: 11px; font-weight: bold; text-transform: uppercase;">Factures</span>
    <span style="display: block; color: #0f172a; font-size: 18px; font-weight: bold; margin-top: 5px;">
      ${realData.facturesCount || 0}
    </span>
  </div>
  <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #2532eb;">
    <span style="color: #2532eb; font-size: 11px; font-weight: bold; text-transform: uppercase;">Devis</span>
    <span style="display: block; color: #0f172a; font-size: 18px; font-weight: bold; margin-top: 5px;">
      ${realData.devisCount || 0}
    </span>
  </div>
  <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #2563EB;">
    <span style="color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">Textes IA</span>
    <span style="display: block; color: #0f172a; font-size: 18px; font-weight: bold; margin-top: 5px;">
      ${totalIA}
    </span>
  </div>
</div>
      <div style="margin-bottom: 40px;">
        <h3 style="color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px;">Répartition de l'utilisation IA</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left;">
              <th style="padding: 10px; border: 1px solid #cbd5e1;">Outil</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">Générations effectuées</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 10px; border: 1px solid #cbd5e1;">Marketing &amp; Stratégie</td>
              <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #2563EB;">${realData.marketingCount || 0}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #cbd5e1;">Copywriting &amp; Contenus</td>
              <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #10d409;">${realData.copywritingCount || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>

      
    `;

    document.body.appendChild(printContainer);

    // 4. Passer le conteneur isolé à html2canvas
    const canvas = await html2canvas(printContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    
    // 5. Nettoyer et supprimer l'élément du DOM
    document.body.removeChild(printContainer);

    // 6. Construire le PDF final
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`Rapport_Activite_${new Date().getFullYear()}.pdf`);
  } catch (error) {
    console.error("Erreur lors de la génération du PDF via innerHTML :", error);
  }
};

  useEffect(() => {
    getReportData().then(data => {
      setRealData(data);
      
      if (data?.pendingInvoices) {
        const today = new Date();
        // Mettre les heures à zéro pour comparer uniquement les jours
        today.setHours(0, 0, 0, 0);

        const late = data.pendingInvoices.filter((invoice: any) => {
          if (!invoice.date_echeance) return false;
          
          // Conversion du format "DD/MM/YYYY" vers un objet Date valide
          const parts = invoice.date_echeance.split('/');
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Les mois commencent à 0 en JS
            const year = parseInt(parts[2], 10);
            
            const dueDate = new Date(year, month, day);
            return dueDate < today; // Vrai si l'échéance est dépassée
          }
          return false;
        });
        
        setOverdueInvoices(late);
      }
      
      setLoading(false);
    });
  }, []);

  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  
  const dataArea = monthNames.map((name, index) => {
    const monthNum = (index + 1).toString().padStart(2, '0');
    const dbMonth = realData?.monthlyRevenue?.find((m: any) => m.month === monthNum);
    return {
      name: name,
      rev: dbMonth ? Number(dbMonth.total) : 0,
    };
  });

  const dataPie = [
    { name: 'Marketing', value: realData?.marketingCount || 0, color: '#2563EB' },
    { name: 'Copywriting', value: realData?.copywritingCount || 0, color: '#10d409' },
  ];

  if (loading) {
    return (
      <div className="reports-loader-container">
        <div className="pichflow-custom-loader"></div>
        <p style={{ marginTop: '20px', color: '#64748b', fontWeight: '500' }}>
          Analyse de vos données...
        </p>
      </div>
    );
  }

  const totalIA = (realData?.marketingCount || 0) + (realData?.copywritingCount || 0);
  const currentCurrency = realData?.devise || "€";

  return (
    <div className="reports-container" style={{ padding: '20px' }}>
      
      {/* SECTION DES ALERTES DE RETARD */}
      {overdueInvoices.length > 0 && (
        <div className="no-print" style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px' }}>
          <h4 style={{ color: '#991B1B', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>⚠️</span> Factures en retard de paiement
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#7F1D1D', fontSize: '14px', lineHeight: '1.6' }}>
            {overdueInvoices.map((inv, idx) => (
              <li key={idx}>
                La facture <strong>{inv.numero_facture}</strong> de <strong>{inv.client_nom}</strong> a dépassé sa date d'échéance ({inv.date_echeance}).
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="reports-header-actions no-print" style={{ display: 'flex', justifyContent: 'space-between', displayFlex: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
        <h2 style={{ color: "var(--primary-color)", margin: 0 }}>Rapport d'activité</h2>
        <button className="btn-export" onClick={exportToPDF} style={{ backgroundColor: '#1e3a8a', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
        <i className="fa-solid fa-file-pdf"></i> Export PDF
      </button>
      </div> 

      {/* GRILLE DES STATISTIQUES MISE À JOUR */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '10px' }}>
         <div className="stat-card" style={{ background: 'white', padding: '10px', borderRadius: '12px', borderLeft: '5px solid #10d409', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <span className="stat-label" style={{ color: '#64748b', fontSize: '14px' }}>Chiffre d'Affaires Global</span>
            <span className="stat-value" style={{ color: '#0f172a', display: 'block', fontSize: '15px', fontWeight: 'bold', marginTop: '5px' }}>
                {Number(realData?.totalRevenue || 0).toLocaleString()} {currentCurrency}
            </span>
         </div>

         <div className="stat-card" style={{ background: 'white', padding: '10px', borderRadius: '12px', borderLeft: '5px solid #EC4899', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
   <span className="stat-label" style={{ color: '#64748b', fontSize: '14px' }}>Total Factures</span>
   <span className="stat-value" style={{ color: '#0f172a', display: 'block', fontSize: '15px', fontWeight: 'bold', marginTop: '5px' }}>
       {realData?.facturesCount || 0} émanation(s)
   </span>
</div>

<div className="stat-card" style={{ background: 'white', padding: '10px', borderRadius: '12px', borderLeft: '5px solid #EC4899', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
   <span className="stat-label" style={{ color: '#64748b', fontSize: '14px' }}>Total Devis</span>
   <span className="stat-value" style={{ color: '#0f172a', display: 'block', fontSize: '15px', fontWeight: 'bold', marginTop: '5px' }}>
       {realData?.devisCount || 0} proposition(s)
   </span>
</div>

         <div className="stat-card" style={{ background: 'white', padding: '10px', borderRadius: '12px', borderLeft: '5px solid #ff7a30', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <span className="stat-label" style={{ color: '#64748b', fontSize: '14px' }}>Factures en Attente</span>
            <span className="stat-value" style={{ color: '#F59E0B', display: 'block', fontSize: '15px', fontWeight: 'bold', marginTop: '5px' }}>
                {Number(realData?.pendingRevenue || 0).toLocaleString()} {currentCurrency}
            </span>
         </div>
         
         <div className="stat-card" style={{ background: 'white', padding: '10px', borderRadius: '12px', borderLeft: '5px solid #2532eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <span className="stat-label" style={{ color: '#64748b', fontSize: '14px' }}>Total Contenus IA</span>
            <span className="stat-value" style={{ color: '#0f172a', display: 'block', fontSize: '15px', fontWeight: 'bold', marginTop: '5px' }}>
                {totalIA} textes
            </span>
         </div>
      </div>

      <div className="charts-main-grid">
        <div className="chart-card area-chart-section">
          <h4 style={{ marginBottom: '20px' }}>Évolution des revenus</h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dataArea}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [`${value} ${currentCurrency}`, 'Revenus']} />
              <Area type="monotone" dataKey="rev" stroke="#2563EB" fill="#2563EB" fillOpacity={0.1} strokeWidth={3} name={`Revenus (${currentCurrency})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card donut-chart-section">
          <h4 style={{ marginBottom: '20px' }}>Production IA</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={dataPie} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {dataPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend-custom" style={{ marginTop: '20px' }}>
              {dataPie.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                  <span><i className="fa-solid fa-circle" style={{ color: item.color, fontSize: '8px', marginRight: '8px' }}></i> {item.name}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
          </div>
        </div>
      </div>
      <br /><br /><br />
    </div>
  );
}
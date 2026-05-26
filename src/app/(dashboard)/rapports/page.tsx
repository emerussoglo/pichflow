"use client";
import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { getReportData } from './reportsAction';

export default function RapportsPage() {
  const [realData, setRealData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReportData().then(data => {
      setRealData(data);
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
  const currentCurrency = realData?.devise || "€"; // Stockage de la devise

  return (
    <div className="reports-container">
      <div className="reports-header-actions no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
        <h2 style={{ color: "var(--primary-color)" }}>Rapport d'activité </h2>
        <button className="btn-export" onClick={() => window.print()} style={{ backgroundColor: '#1e3a8a', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}>
          <i className="fa-solid fa-file-pdf"></i> Export PDF
        </button>
      </div> 

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
         <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #10B981', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <span className="stat-label" style={{ color: '#64748b', fontSize: '14px' }}>Chiffre d'Affaires Total</span>
            <span className="stat-value" style={{ color: '#0f172a', display: 'block', fontSize: '28px', fontWeight: 'bold', marginTop: '5px' }}>
                {Number(realData?.totalRevenue || 0).toLocaleString()} {currentCurrency}
            </span>
         </div>
         
         <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #2563EB', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <span className="stat-label" style={{ color: '#64748b', fontSize: '14px' }}>Total Contenus IA</span>
            <span className="stat-value" style={{ color: '#0f172a', display: 'block', fontSize: '28px', fontWeight: 'bold', marginTop: '5px' }}>
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
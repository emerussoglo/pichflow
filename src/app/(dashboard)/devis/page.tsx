'use client';
import React, { useState, useEffect } from 'react';
import { createDevisAction, getDevisAction, deleteDevisAction, getClientsAction, sendFactureEmailAction } from './devisAction';

interface Prestation {
  description: string;
  prixUnitaire: number;
  quantite: number;
}

interface Devis {
  dbId?: string; 
  id: string;
  client: string;
  clientContact: string;
  clientAdresse: string;
  senderNom?: string;
  senderAdresse?: string;
  senderContact?: string;
  senderIfu?: string;
  senderAutre?: string;
  tvaRate?: number;
  prestations: Prestation[];
  devise: string;
  date: string;
  echeance: string;
}

export default function DevisPage() {
  const [devis, setDevis] = useState<Devis[]>([]);
  const [savedClients, setSavedClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    client: '',
    clientContact: '',
    clientAdresse: '',
    echeance: '',
    devise: 'FCFA',
    prestations: [{ description: '', prixUnitaire: 0, quantite: 1 }] as Prestation[]
  });

  const loadData = async () => {
    const [devisData, clientsData] = await Promise.all([
      getDevisAction(),
      getClientsAction()
    ]);
    setDevis(devisData as Devis[]);
    setSavedClients(clientsData);
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (isModalOpen) {
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(today.getDate() + 30);
      setFormData(prev => ({ ...prev, echeance: nextMonth.toISOString().split('T')[0] }));
    }
  }, [isModalOpen]);


  const [showErrorPopup, setShowErrorPopup] = useState(false);

  
const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const scripts = ["https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js", "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"];
    scripts.forEach(src => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const s = document.createElement("script"); s.src = src; s.async = true; document.body.appendChild(s);
      }
    });
  }, []);


  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
const [selectedDevis, setSelectedDevis] = useState<Devis | null>(null);
const [selectedTemplate, setSelectedTemplate] = useState('bleu');



const [showEmailPopup, setShowEmailPopup] = useState(false);
const [emailDestinataire, setEmailDestinataire] = useState('');
const [isSendingEmail, setIsSendingEmail] = useState(false);


const [showEmailSuccess, setShowEmailSuccess] = useState(false);
const [showEmailError, setShowEmailError] = useState(false);
const [emailErrorMessage, setEmailErrorMessage] = useState("");



  const handleSelectSavedClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientFound = savedClients.find(c => c.nom === e.target.value);
    if (clientFound) {
      setFormData({ ...formData, client: clientFound.nom, clientContact: clientFound.contact, clientAdresse: clientFound.adresse });
    }
  };

  const calculateTotal = (prestations: Prestation[]) => {
    return prestations.reduce((acc, curr) => acc + (curr.prixUnitaire * curr.quantite), 0);
  };

const downloadPDF = async (item: Devis, template: string) => {
  // Configuration des couleurs
  const configs: any = {
    bleu: { border: '#a5d1f0', bg: '#eef3f7', table: '#a5d1f0' },
    rose: { border: '#FA5D89', bg: '#FEF7EC', table: '#FA5D89' },
    violet: { border: '#D09EE7', bg: '#f0fdf4', table: '#D09EE7' }
  };
  const colors = configs[template] || configs.bleu;

  const totalHT = calculateTotal(item.prestations); 
  const tvaRate = item.tvaRate || 0;
  const montantTVA = (totalHT * tvaRate) / 100;
  const totalTTC = totalHT + montantTVA;

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed; left:-9999px; width:800px; background:white;';
  document.body.appendChild(container);

  container.innerHTML = `
    <div style="padding: 50px; font-family: 'Roboto', sans-serif; color: #000; border-left: 15px solid ${colors.border}; min-height: 1130px; position: relative; background: ${colors.bg};">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
        <div>
          <h2 style="font-family: 'Antonio', sans-serif; font-size: 22px; font-weight: 800; margin: 0; color: #000;">${(item.senderNom || "PichFlow Service").toUpperCase()}</h2>
          <p style="font-size: 12px; margin-top: 5px; color: #444; line-height: 1.4;">
            ${item.senderAdresse}<br>${item.senderContact}
            ${item.senderIfu ? `<br>${item.senderIfu}` : ''}
            ${item.senderAutre ? `<br>${item.senderAutre}` : ''}
          </p>
        </div>
        <div style="text-align: right;">
          <h2 style="font-family: 'Antonio', sans-serif; font-size: 22px; font-weight: 800; color: #000; margin: 0; line-height: 1;">DEVIS </h2>
          <p style="font-weight: 800; margin-top: 10px;">n° ${item.id}</p>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 40px; gap: 20px;">
        <div style="flex: 1; border: 1.5px solid #00000011; padding: 15px; border-radius: 2px; background: #ffffff55;">
          <p style="font-size: 10px; font-weight: 700; margin-bottom: 8px; color: #666;">Dates</p>
          <p style="font-size: 13px; margin: 0;">Date de création : ${item.date}</p>
          <p style="font-size: 13px; margin: 5px 0 0 0;">Valide jusqu'au : ${item.echeance}</p>
        </div>
        <div style="flex: 1; border: 1.5px solid #00000011; text-align: right; padding: 15px; border-radius: 2px; background: #ffffff55;">
          <p style="font-size: 10px; font-weight: 700; margin-bottom: 8px; color: #666;">Destinataire</p>
          <p style="font-size: 16px; font-weight: 800; margin: 0;">${item.client.toUpperCase()}</p>
          <p style="font-size: 12px; margin-top: 5px; color: #444;">${item.clientContact}<br>${item.clientAdresse}</p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: ${colors.table}; color: #000;">
            <th style="font-family: 'Antonio', sans-serif; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase;">Description</th>
            <th style="font-family: 'Antonio', sans-serif; text-align: right; padding: 12px; font-size: 12px; border-left: 1px solid #00000011; width: 120px;">Prix Unitaire</th>
            <th style="font-family: 'Antonio', sans-serif; text-align: right; padding: 12px; font-size: 12px; border-left: 1px solid #00000011; width: 60px;">Qté</th>
            <th style="font-family: 'Antonio', sans-serif; text-align: right; padding: 12px; font-size: 12px; border-left: 1px solid #00000011; width: 120px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${item.prestations.map((p) => `
            <tr style="border-bottom: 1px solid #00000011;">
              <td style="padding: 15px 12px; vertical-align: top;"><div style="font-weight: 600; font-size: 13px;">${p.description}</div></td>
              <td style="padding: 15px 12px; text-align: right; border-left: 1px solid #00000011;">${p.prixUnitaire.toLocaleString()} ${item.devise}</td>
              <td style="padding: 15px 12px; text-align: right; border-left: 1px solid #00000011;">${p.quantite}</td>
              <td style="padding: 15px 12px; text-align: right; font-weight: 600; border-left: 1px solid #00000011;">${(p.prixUnitaire * p.quantite).toLocaleString()} ${item.devise}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="margin-left: auto; width: 280px; margin-top: 20px; border: 1.5px solid #313030; background: #fff;">
        <div style="display: flex; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #eee;">
          <span style="font-size: 12px; font-weight: 800; color: #666;">TOTAL HT</span>
          <span style="font-size: 13px;">${totalHT.toLocaleString()} ${item.devise}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #eee;">
          <span style="font-size: 12px; font-weight: 800; color: #666;">TVA</span>
          <span style="font-size: 13px;">${montantTVA.toLocaleString()} ${item.devise}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 15px 12px; background: #313030; color: #fff;">
          <span style="font-family: 'Antonio', sans-serif; font-size: 14px; font-weight: bold; text-transform: uppercase;">Total Estimé (TTC)</span>
          <span style="font-size: 16px; font-weight: 900;">${totalTTC.toLocaleString()} ${item.devise}</span>
        </div>
      </div>

      <div style="position: absolute; bottom: 40px; left: 50px; width: calc(100% - 100px); text-align: center;">
        <p style="font-style: italic; font-size: 13px; font-weight: 600;">Estimation valable 30 jours. Merci pour votre confiance !</p>
      </div>
    </div>
  `;

  try {
    const canvas = await (window as any).html2canvas(container, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const pdf = new (window as any).jspdf.jsPDF('p', 'mm', 'a4'); 
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    pdf.save(`Devis_${item.client}_${item.id}.pdf`);
  } finally { document.body.removeChild(container); }
};



const sendPDFByEmail = async (item: Devis, template: string, email: string) => {
  setIsSendingEmail(true);
  
  // 1. Logique de couleurs (identique à ton downloadPDF)
  const configs: any = {
    bleu: { border: '#a5d1f0', bg: '#eef3f7', table: '#a5d1f0' },
    rose: { border: '#FA5D89', bg: '#FEF7EC', table: '#FA5D89' },
    violet: { border: '#D09EE7', bg: '#f0fdf4', table: '#D09EE7' }
  };
  const colors = configs[template] || configs.bleu;

 const totalHT = calculateTotal(item.prestations); 
  const tvaRate = item.tvaRate || 0;
  const montantTVA = (totalHT * tvaRate) / 100;
  const totalTTC = totalHT + montantTVA;

  // 2. Création du container fantôme pour html2canvas
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed; left:-9999px; width:800px; background:white;';
  document.body.appendChild(container);

  // ... (ICI : Copie tout le bloc container.innerHTML de ta fonction downloadPDF) ...
  
   container.innerHTML = `
    <div style="padding: 50px; font-family: 'Roboto', sans-serif; color: #000; border-left: 15px solid ${colors.border}; min-height: 1130px; position: relative; background: ${colors.bg};">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
        <div>
          <h2 style="font-family: 'Antonio', sans-serif; font-size: 22px; font-weight: 800; margin: 0; color: #000;">${(item.senderNom || "PichFlow Service").toUpperCase()}</h2>
          <p style="font-size: 12px; margin-top: 5px; color: #444; line-height: 1.4;">
            ${item.senderAdresse}<br>${item.senderContact}
            ${item.senderIfu ? `<br>${item.senderIfu}` : ''}
            ${item.senderAutre ? `<br>${item.senderAutre}` : ''}
          </p>
        </div>
        <div style="text-align: right;">
          <h2 style="font-family: 'Antonio', sans-serif; font-size: 22px; font-weight: 800; color: #000; margin: 0; line-height: 1;">DEVIS</h2>
          <p style="font-weight: 800; margin-top: 10px;">n°: ${item.id}</p>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 40px; gap: 20px;">
        <div style="flex: 1; border: 1.5px solid #00000011; padding: 15px; border-radius: 2px; background: #ffffff55;">
          <p style="font-size: 10px; font-weight: 700; margin-bottom: 8px; color: #666;">Informations</p>
          <p style="font-size: 13px; margin: 0;">Date : ${item.date}</p>
          <p style="font-size: 13px; margin: 5px 0 0 0;">Valide jusqu'au : ${item.echeance}</p>
        </div>
        <div style="flex: 1; border: 1.5px solid #00000011; text-align: right; padding: 15px; border-radius: 2px; background: #ffffff55;">
          <p style="font-size: 10px; font-weight: 700; margin-bottom: 8px; color: #666;">Destinataire</p>
          <p style="font-size: 16px; font-weight: 800; margin: 0;">${item.client.toUpperCase()}</p>
          <p style="font-size: 12px; margin-top: 5px; color: #444;">${item.clientContact}<br>${item.clientAdresse}</p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: ${colors.table}; color: #000;">
            <th style="font-family: 'Antonio', sans-serif; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase;">Description</th>
            <th style="font-family: 'Antonio', sans-serif; text-align: right; padding: 12px; font-size: 12px; border-left: 1px solid #00000011; width: 120px;">Prix Unitaire</th>
            <th style="font-family: 'Antonio', sans-serif; text-align: right; padding: 12px; font-size: 12px; border-left: 1px solid #00000011; width: 60px;">Qté</th>
            <th style="font-family: 'Antonio', sans-serif; text-align: right; padding: 12px; font-size: 12px; border-left: 1px solid #00000011; width: 120px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${item.prestations.map((p) => `
            <tr style="border-bottom: 1px solid #00000011;">
              <td style="padding: 15px 12px; vertical-align: top;"><div style="font-weight: 600; font-size: 13px;">${p.description}</div></td>
              <td style="padding: 15px 12px; text-align: right; border-left: 1px solid #00000011;">${p.prixUnitaire.toLocaleString()} ${item.devise}</td>
              <td style="padding: 15px 12px; text-align: right; border-left: 1px solid #00000011;">${p.quantite}</td>
              <td style="padding: 15px 12px; text-align: right; font-weight: 600; border-left: 1px solid #00000011;">${(p.prixUnitaire * p.quantite).toLocaleString()} ${item.devise}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="margin-left: auto; width: 280px; margin-top: 20px; border: 1.5px solid #313030; background: #fff;">
        <div style="display: flex; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #eee;">
          <span style="font-size: 12px; font-weight: 800; color: #666;">TOTAL HT</span>
          <span style="font-size: 13px;">${totalHT.toLocaleString()} ${item.devise}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #eee;">
          <span style="font-size: 12px; font-weight: 800; color: #666;">TVA</span>
          <span style="font-size: 13px;">${montantTVA.toLocaleString()} ${item.devise}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 15px 12px; background: #313030; color: #fff;">
          <span style="font-family: 'Antonio', sans-serif; font-size: 14px; font-weight: bold; text-transform: uppercase;">Total Estimé (TTC)</span>
          <span style="font-size: 16px; font-weight: 900;">${totalTTC.toLocaleString()} ${item.devise}</span>
        </div>
      </div>

      <div style="position: absolute; bottom: 40px; left: 50px; width: calc(100% - 100px); text-align: center;">
        <p style="font-style: italic; font-size: 13px; font-weight: 600;">Estimation valable 30 jours. Merci pour votre confiance !</p>
      </div>
    </div>
  `;
  
  try {
    const canvas = await (window as any).html2canvas(container, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const pdf = new (window as any).jspdf.jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    
    // Extraction du Base64 (sans le préfixe data:application/pdf;base64,)
    const pdfBase64 = pdf.output('datauristring').split(',')[1];

    // 3. APPEL AU BACKEND
    const res = await sendFactureEmailAction(email, pdfBase64, item.id);

    if (res.success) {
      setShowEmailPopup(false); // On ferme le formulaire de saisie
      setEmailDestinataire('');
      setShowEmailSuccess(true); // On ouvre le popup de succès
    } else {
      setEmailErrorMessage(res.error || "Le serveur n'a pas pu envoyer l'email.");
      setShowEmailError(true); // On ouvre le popup d'erreur
    }
  } catch (err) {
    setErrorMessage("Erreur lors de la génération du mail");
    setShowErrorPopup(true);
  } finally {
    setIsSendingEmail(false);
    document.body.removeChild(container);
  }
};



 const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const res = await createDevisAction(formData);

    if (res.success) {
      await loadData();
      setIsModalOpen(false);
      
      // Réinitialisation complète pour le prochain devis
      setFormData({ 
        client: '', 
        clientContact: '', 
        clientAdresse: '', 
        echeance: '', 
        devise: 'FCFA', 
        prestations: [{ description: '', prixUnitaire: 0, quantite: 1 }] 
      });
    } else {
      // --- UTILISATION DU POPUP AU LIEU DE L'ALERT ---
      setErrorMessage(res.error || "Erreur lors de la création du devis");
      setShowErrorPopup(true);
    }
  } catch (error) {
    setErrorMessage("Une erreur réseau est survenue. Veuillez réessayer.");
    setShowErrorPopup(true);
  } finally {
    setIsLoading(false);
  }
};

  const handleDelete = async (dbId: string) => {
    if (confirm("Supprimer ce devis ?")) {
      const res = await deleteDevisAction(dbId);
      if (res.success) await loadData();
    }
  };

  const filtered = devis.filter(d => d.client.toLowerCase().includes(searchTerm.toLowerCase()) || d.id.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="factures-container">
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content custom-modal">
            <h3>Nouveau Devis</h3>
            <form onSubmit={handleSave} className="modern-form">
              <div className="form-section">
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '11px', color: '#666', marginBottom: '4px', display: 'block' }}>CHOISIR UN CLIENT ENREGISTRÉ</label>
                  <select style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} onChange={handleSelectSavedClient} defaultValue="">
                    <option value="" disabled>-- Sélectionner un client --</option>
                    {savedClients.map((c, i) => (<option key={i} value={c.nom}>{c.nom}</option>))}
                  </select> 
                </div> 
                <input type="text" placeholder="Nom du Client" required value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} className="main-input" />
                <div className="row">
                  <input style={{ width: '100%' }} type="text" placeholder="Contact" required value={formData.clientContact} onChange={(e) => setFormData({ ...formData, clientContact: e.target.value })} />
                  <input style={{ width: '100%' }} type="text" placeholder="Adresse" required value={formData.clientAdresse} onChange={(e) => setFormData({ ...formData, clientAdresse: e.target.value })} />
                </div>
                <div className="row">
                  <div style={{ width: '100%' }}>
                    <label style={{ fontSize: '11px', color: '#666', display: 'block' }}>VALIDITÉ (Auto +30j)</label>
                    <input style={{ width: '100%' }} type="date" required value={formData.echeance} onChange={(e) => setFormData({ ...formData, echeance: e.target.value })} />
                  </div>
                  <div style={{ width: '100%' }}>
                    <label style={{ fontSize: '11px', color: '#666', display: 'block' }}>DEVISE</label>
                    <select style={{ width: '100%' }} value={formData.devise} onChange={(e) => setFormData({ ...formData, devise: e.target.value })}>
                      <option value="FCFA">FCFA</option>
                      <option value="€">EUR (€)</option>
                      <option value="$">USD ($)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="prestations-list">
                <label>Prestations</label>
                <div className="prestations-scroll-area">
                  {formData.prestations.map((p, index) => (
                    <div key={index} className="prestation-row">
                      <input type="text" placeholder="Description" value={p.description} onChange={(e) => {
                        const news = [...formData.prestations]; news[index].description = e.target.value;
                        setFormData({ ...formData, prestations: news });
                      }} required />
                      <div className="row-inner" style={{ display: 'flex', gap: '10px' }}>
                        <input type="number" placeholder="Prix" min="0"  onChange={(e) => {
                          const news = [...formData.prestations]; news[index].prixUnitaire = parseFloat(e.target.value);
                          setFormData({ ...formData, prestations: news });
                        }} required />
                        <input type="number" placeholder="Qté" min="1"  onChange={(e) => {
                          const news = [...formData.prestations]; news[index].quantite = parseInt(e.target.value);
                          setFormData({ ...formData, prestations: news });
                        }} required />
                        {index !== 0 && (
                          <button type="button" onClick={() => {
                            const news = formData.prestations.filter((_, i) => i !== index);
                            setFormData({ ...formData, prestations: news });
                          }} style={{ color: '#ef4444', border: '0', background: 'none' }}><i className="fa-solid fa-trash-can"></i></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setFormData({ ...formData, prestations: [...formData.prestations, { description: '', prixUnitaire: 0, quantite: 1 }] })} className="btn-add-line">+ Ajouter une ligne</button>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Fermer</button>
                <button type="submit" disabled={isLoading} className="btn-submit">
                  <i className="fa-solid fa-coins"></i> 5 {isLoading ? "Création..." : "Créer le devis"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-toolbar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <button className="btn-new" onClick={() => setIsModalOpen(true)}>+ Nouveau Devis</button>
      </div>

      <div className="div-table-container">
        <div className="div-table-header">
          <div className="col-id">N°</div>
          <div className="col-client">Client</div>
          <div className="col-desc">Prestations</div>
          <div className="col-date">Date</div>
          <div className="col-actions">Actions</div>
        </div>
        <div className="div-table-body">
          {filtered.length > 0 ? filtered.map((d) => (
            <div className="div-table-row" key={d.dbId}>
              <div className="col-id font-bold" data-label="N° :">{d.id}</div>
              <div className="col-client font-bold" data-label="Client :">{d.client}</div>
              <div className="col-desc" data-label="Prestations :">
                {d.prestations.map((p, i) => (
                  <div key={i} className="desc-tag">{p.description} (x{p.quantite})</div>
                ))}
              </div>
              <div className="col-date" data-label="Date :">{d.date}</div>
              <div className="col-actions">
                <button onClick={() => { setSelectedDevis(d); setShowDownloadPopup(true); }}> <i className="fa fa-file-pdf" style={{ color: '#e11d48' }}></i> </button>
<button 
  onClick={() => { setSelectedDevis(d); setShowEmailPopup(true); }} 
  title="Envoyer par email"
>
  <i className="fa-solid fa-paper-plane" style={{color: '#3b82f6', marginRight: '10px'}}></i>
</button>

                <button onClick={() => d.dbId && handleDelete(d.dbId)}><i className="fa-solid fa-trash-arrow-up" style={{ color: '#ef4444' }}></i></button>
              </div>
            </div>
          )) : <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Aucun devis.</div>}
        </div>
      </div> <br /> <br /> <br />

      {/* --- POPUP DE TÉLÉCHARGEMENT AJOUTÉ ICI --- */}

    {showDownloadPopup && (
  <div className="download-popup-overlay">
    <div className="download-popup-content" style={{ maxWidth: '450px' }}>
      <button className="download-popup-close" onClick={() => setShowDownloadPopup(false)}>
        <i className="fa-solid fa-xmark"></i>
      </button>
      <h4>Choisir le style du Devis</h4>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>Sélectionnez un modèle visuel avant le téléchargement.</p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        {/* BLEU */}
        <div onClick={() => setSelectedTemplate('bleu')} className={`template-option ${selectedTemplate === 'bleu' ? 'active' : ''}`} 
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, cursor: 'pointer', padding: '10px', borderRadius: '10px', border: selectedTemplate === 'bleu' ? '2px solid #a5d1f0' : '1px solid #eee', background: selectedTemplate === 'bleu' ? '#f0f9ff' : '#fff' }}>
          <div style={{ height: '40px', width: "40px", background: '#a5d1f0', borderRadius: '50%', marginBottom: '8px' }}></div>
          <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Classique</span>
        </div>

        {/* ROSE */}
        <div onClick={() => setSelectedTemplate('rose')}
          style={{display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, cursor: 'pointer', padding: '10px', borderRadius: '10px', border: selectedTemplate === 'rose' ? '2px solid #FA5D89' : '1px solid #eee', background: selectedTemplate === 'rose' ? '#fff1f2' : '#fff' }}>
          <div style={{ height: '40px', width: "40px", background: '#FA5D89', borderRadius: '50%', marginBottom: '8px' }}></div>
          <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Moderne</span>
        </div>

        {/* VERT */}
        <div onClick={() => setSelectedTemplate('violet')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, cursor: 'pointer', padding: '10px', borderRadius: '10px', border: selectedTemplate === 'violet' ? '2px solid #D09EE7' : '1px solid #eee', background: selectedTemplate === 'violet' ? '#fdf0fb' : '#fff' }}>
          <div style={{ height: '40px', width: "40px", background: '#D09EE7', borderRadius: '50%', marginBottom: '8px' }}></div>
          <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Émeraude</span>
        </div>
      </div>

      <button className="download-popup-btn" onClick={() => {
        if (selectedDevis) {
          downloadPDF(selectedDevis, selectedTemplate);
          setShowDownloadPopup(false);
        }
      }}>
        Générer le Devis PDF
      </button>
    </div>
  </div>
)}

      {/* --- POPUP D'ERREUR (CRÉDITS INSUFFISANTS) --- */}
      {showErrorPopup && (
        <div className="error-popup-overlay">
          <div className="error-popup-content">
            <div className="error-popup-icon">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h4>Action impossible</h4>
            <p>{errorMessage}</p>
            <button className="error-popup-btn" onClick={() => setShowErrorPopup(false)}>
              Compris
            </button>
          </div>
        </div>
      )}
      


           
{showEmailPopup && (
  <div className="download-popup-overlay">
    <div className="download-popup-content" style={{ maxWidth: '400px' }}>
      <button className="download-popup-close" onClick={() => setShowEmailPopup(false)}>
        <i className="fa-solid fa-xmark"></i>
      </button>
      
      <div className="download-popup-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
        <i className="fa-solid fa-envelope"></i>
      </div>
      
      <h4>Envoyer au client</h4>
      <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
        Entrez l'adresse Gmail ou l'email du client ci-dessous.
      </p>

      <input 
        type="email" 
        placeholder="exemple@gmail.com"
        value={emailDestinataire}
        onChange={(e) => setEmailDestinataire(e.target.value)}
        className="main-input"
        style={{ width: '100%', marginBottom: '20px', textAlign: 'center' }}
      />

      <button 
        className="download-popup-btn" 
        style={{ width: '100%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        disabled={isSendingEmail || !emailDestinataire}
        onClick={() => selectedDevis && sendPDFByEmail(selectedDevis, selectedTemplate, emailDestinataire)}
      >
        <i className={isSendingEmail ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-paper-plane"}></i>
        {isSendingEmail ? "Envoi en cours..." : "Envoyer maintenant"}
      </button>
    </div>
  </div>
)}
   

      {/* --- POPUP SUCCÈS EMAIL --- */}
{showEmailSuccess && (
  <div className="download-popup-overlay">
    <div className="download-popup-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
      <div className="download-popup-icon" style={{ backgroundColor: '#dcfce7', color: '#166534', margin: '0 auto 15px' }}>
        <i className="fa-solid fa-circle-check"></i>
      </div>
      <h4 style={{ color: '#166534' }}>Email Envoyé !</h4>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        Le Devis a été transmise avec succès à votre client.
      </p>
      <button 
        className="download-popup-btn" 
        style={{ width: '100%', backgroundColor: '#166534', color: 'white', border: 'none', padding: '12px', borderRadius: '8px' }}
        onClick={() => setShowEmailSuccess(false)}
      >
        Génial, merci !
      </button>
    </div>
  </div>
)}

{/* --- POPUP ERREUR EMAIL --- */}
{showEmailError && (
  <div className="download-popup-overlay">
    <div className="download-popup-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
      <div className="download-popup-icon" style={{ backgroundColor: '#fee2e2', color: '#991b1b', margin: '0 auto 15px' }}>
        <i className="fa-solid fa-triangle-excursion"></i>
      </div>
      <h4 style={{ color: '#991b1b' }}>Échec de l'envoi</h4>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        {emailErrorMessage}
      </p>
      <button 
        className="download-popup-btn" 
        style={{ width: '100%', backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '8px' }}
        onClick={() => setShowEmailError(false)}
      >
        Réessayer
      </button>
    </div>
  </div>
)}



      
    </div>
  );
}
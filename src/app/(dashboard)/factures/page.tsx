'use client';
import React, { useState, useEffect } from 'react';
import { createFactureAction, getFacturesAction, deleteFactureAction, getClientsAction, updateFactureStatusAction, sendFactureEmailAction } from './factureAction';

interface Prestation {
  description: string;
  prixUnitaire: number;
  quantite: number;
}

interface ClientSuggestion {
  nom: string;
  contact: string;
  adresse: string;
}

interface Facture {
  dbId?: string;
  id: string;
  client: string;
  clientContact: string;
  clientAdresse: string;
  senderNom?: string;
  senderAdresse?: string;
  senderContact?: string;
  senderIfu?: string;      // Ajouté
  senderAutre?: string;    // Ajouté
  tvaRate: number; 
  prestations: Prestation[];
  devise: string;
  date: string;
  echeance: string;
  status: string;
}

export default function FacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [savedClients, setSavedClients] = useState<ClientSuggestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
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
  const handleToggleStatus = async (dbId: string, selectedStatus: string) => {
  // On appelle directement l'action avec la valeur sélectionnée (payer ou en attente)
  const res = await updateFactureStatusAction(dbId, selectedStatus);
  if (res.success) {
    await loadData();
  } else {
    alert("Erreur lors de la mise à jour du statut");
  }
};
  const loadData = async () => {
    const [factData, clientData] = await Promise.all([
      getFacturesAction(),
      getClientsAction()
    ]);
    setFactures(factData as Facture[]);
    setSavedClients(clientData as any);
  };

  useEffect(() => { loadData(); }, []);

useEffect(() => {
  if (isModalOpen) {
    const today = new Date();
    
    // On ne calcule l'échéance auto que si elle n'est pas déjà définie
    if (!formData.echeance) {
      const nextMonth = new Date();
      nextMonth.setDate(today.getDate() + 30);
      const echeanceAuto = nextMonth.toISOString().split('T')[0];
      
      setFormData(prev => ({ 
        ...prev, 
        echeance: echeanceAuto 
      }));
    }
  }
}, [isModalOpen]); // On garde isModalOpen en dépendance

const [showErrorPopup, setShowErrorPopup] = useState(false);
const [errorMessage, setErrorMessage] = useState("");

 

  useEffect(() => { 
    const scripts = [
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
    ];
    scripts.forEach(src => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const s = document.createElement("script");
        s.src = src; s.async = true; document.body.appendChild(s);
      }
    });
  }, []);


const [showDownloadPopup, setShowDownloadPopup] = useState(false);
const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null); // Pour savoir quelle facture télécharger
const [selectedTemplate, setSelectedTemplate] = useState('bleu'); // 'bleu' ou 'rose'
const [selectedLayout, setSelectedLayout] = useState('moderne');



const [showEmailPopup, setShowEmailPopup] = useState(false);
const [emailDestinataire, setEmailDestinataire] = useState('');
const [isSendingEmail, setIsSendingEmail] = useState(false);


const [showEmailSuccess, setShowEmailSuccess] = useState(false);
const [showEmailError, setShowEmailError] = useState(false);
const [emailErrorMessage, setEmailErrorMessage] = useState("");



  const handleSelectSavedClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedNom = e.target.value;
    if (!selectedNom) return;
    const clientFound = savedClients.find(c => c.nom === selectedNom);
    if (clientFound) {
      setFormData({
        ...formData,
        client: clientFound.nom,
        clientContact: clientFound.contact,
        clientAdresse: clientFound.adresse
      });
    }
  };

  const addPrestationLine = () => {
    setFormData({ ...formData, prestations: [...formData.prestations, { description: '', prixUnitaire: 0, quantite: 1 }] });
  };

  const removePrestationLine = (index: number) => {
    const newPrestations = formData.prestations.filter((_, i) => i !== index);
    setFormData({ ...formData, prestations: newPrestations });
  };

  const updatePrestation = (index: number, field: keyof Prestation, value: string | number) => {
    const newPrestations = [...formData.prestations];
    newPrestations[index] = { ...newPrestations[index], [field]: value };
    setFormData({ ...formData, prestations: newPrestations });
  };

  const calculateTotalHT = (prestations: Prestation[]) => {
    return prestations.reduce((acc, curr) => acc + (curr.prixUnitaire * curr.quantite), 0);
  };

const getInvoiceHTML = (item: Facture, colors: any, layout: string) => {
  const totalHT = calculateTotalHT(item.prestations);
  const montantTVA = totalHT * (item.tvaRate / 100); 
  const totalTTC = totalHT + montantTVA;

  if (layout === 'moderne') {
    // TON SECOND MODÈLE (Celui que je viens de te faire)
    return `
    <div style="padding: 50px 40px; font-family: 'Roboto', sans-serif; color: #000;  min-height: 1130px; position: relative; background: ${colors.bg};">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
        <div style="flex: 1;">
          <h2 style="font-family: 'Antonio', sans-serif; font-size: 20px; font-weight: 800; margin: 0; color: #000;">${(item.senderNom || "PichFlow Service").toUpperCase()}</h2>
          <p style="font-size: 13px; margin-top: 8px; color: #444; line-height: 1.5;">
            ${item.senderAdresse}<br>${item.senderContact}${item.senderIfu ? `<br>IFU : ${item.senderIfu}` : ''}${item.senderAutre ? `<br>${item.senderAutre}` : ''}
          </p>
        </div>
        <div style="flex: 1; text-align: right;">
          <p>Client</p>
          <h2 style="font-family: 'Antonio', sans-serif; font-size: 20px; font-weight: 800; margin: 0; color: #000;">${item.client.toUpperCase()}</h2>
          <p style="font-size: 13px; margin-top: 8px; color: #444; line-height: 1.5;">${item.clientAdresse}<br>${item.clientContact}</p>
        </div>
      </div> 
      <div style="margin-bottom: 40px;">
        <h1 style="font-family: 'Antonio', sans-serif; font-size: 18px; font-weight: 800; color: #000; margin: 0; letter-spacing: -1px;">Facture n° ${item.id}</h1>
        <div style="display: flex; gap: 20px; margin-top: 15px; font-size: 13px; color: #666;">
           <span>Émise le : <strong>${item.date}</strong></span><span>Échéance : <strong>${item.echeance}</strong></span>
        </div>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style=" background: ${colors.table};">
            <th style="font-family: 'Antonio', sans-serif; text-align: left; padding: 15px 10px; font-size: 12px; text-transform: uppercase;">Libellé / Description</th>
            <th style="font-family: 'Antonio', sans-serif; text-align: center; padding: 15px 10px; font-size: 12px; text-transform: uppercase; width: 80px;">Qté</th>
            <th style="font-family: 'Antonio', sans-serif; text-align: right; padding: 15px 10px; font-size: 12px; text-transform: uppercase; width: 140px;">PU HT</th>
            <th style="font-family: 'Antonio', sans-serif; text-align: right; padding: 15px 10px; font-size: 12px; text-transform: uppercase; width: 140px;">Total HT</th>
          </tr>
        </thead>
        <tbody>
          ${item.prestations.map((p) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 5px;"><div style="font-weight: 500; font-size: 14px;">${p.description}</div></td>
              <td style="padding: 10px 5px; text-align: center; font-size: 14px;">${p.quantite}</td>
              <td style="padding: 10px 5px; text-align: right; font-size: 14px;">${p.prixUnitaire.toLocaleString()} ${item.devise}</td>
              <td style="padding: 10px 5px; text-align: right; font-weight: 500; font-size: 14px;">${(p.prixUnitaire * p.quantite).toLocaleString()} ${item.devise}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      <div style="margin-left: auto; width: 320px;">
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee;"><span style="color:#666">Total HT</span><span>${totalHT.toLocaleString()} ${item.devise}</span></div>
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 2px solid #000;"><span style="color:#666">TVA</span><span>${montantTVA.toLocaleString()} ${item.devise}</span></div>
        <div style="display: flex; justify-content: space-between; padding: 20px 0;"><span style="font-family:'Roboto'; font-size:16px; font-weight:700;">TOTAL TTC</span><span style="font-size:16px; font-weight:700;">${totalTTC.toLocaleString()} ${item.devise}</span></div>
      </div>
      <div style="position: absolute; bottom: 60px; left: 50px; width: calc(100% - 100px); font-size: 11px; color: #666; border-top: 1px solid #eee; padding-top: 20px;">
        <p>La facture devra être payée automatiquement ou dans les 30 jours à compter de la réalisation de la prestation ou de la réception de la marchandise.</p>
        <div style="display: flex; justify-content: space-between; margin-top: 10px;">
          <span>${item.senderIfu ? `${item.senderIfu}` : ''}</span>
          <span style="font-family:'Antonio'; font-weight:800;">Facture n° ${item.id}</span>
        </div>
      </div>
    </div>`;
  }

  // TON PREMIER MODÈLE (Celui avec les cadres autour de Date/Destinataire)
  return `
    <div style="padding: 50px; font-family: 'Roboto', sans-serif; color: #000; border-left: 15px solid ${colors.border}; min-height: 1130px; position: relative; background: ${colors.bg};">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
        <div>
          <h2 style="font-family: 'Antonio', sans-serif; font-size: 22px; font-weight: 800; margin: 0; color: #000;">${(item.senderNom || "PichFlow Service").toUpperCase()}</h2>
          <p style="font-size: 12px; margin-top: 5px; color: #444; line-height: 1.4;">
            ${item.senderAdresse}<br>
            ${item.senderContact}
            ${item.senderIfu ? `<br>${item.senderIfu}` : ''}
            ${item.senderAutre ? `<br>${item.senderAutre}` : ''}
          </p>
        </div>
        <div style="text-align: right;">
          <h2 style="font-family: 'Antonio', sans-serif; font-size: 22px; font-weight: 800; color: #000; margin: 0; line-height: 1;">FACTURE</h2>
          <p style="font-weight: 800; margin-top: 10px;">n° ${item.id}</p>
        </div>
      </div> 

      <div style="display: flex; justify-content: space-between; margin-bottom: 40px; gap: 13px;">
        <div style="flex: 1; border: 1.5px solid #e9edf0; padding: 15px; padding-left: 3px; border-radius: 2px;">
          <p style="font-size: 10px; font-weight: 700;  margin-bottom: 8px; color: #666; ">Dates</p>
          <p style="font-size: 13px; margin: 0;">Date de création : ${item.date}</p>
          <p style="font-size: 13px; margin: 5px 0 0 0;">Echéance : ${item.echeance}</p>
        </div>
        <div style="flex: 1; border: 1.5px solid #e9edf0; text-align: right; padding: 15px; padding-right: 3px; border-radius: 2px; background: #ffffff55;">
          <p style="font-size: 10px; font-weight: 700; margin-bottom: 8px; color: #666; ">Destinataire</p>
          <p style="font-size: 15px; font-weight: 800; margin: 0;">${item.client.toUpperCase()}</p>
          <p style="font-size: 12px; margin-top: 5px; color: #444;">${item.clientContact}<br>${item.clientAdresse}</p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: ${colors.table}; color: #000;">
            <th style="font-family: 'Antonio', sans-serif; text-align: left; padding: 12px; font-size: 12px; color: #333232; text-transform: uppercase; letter-spacing: 0.5px;">Libellé / Description</th>
            <th style="font-family: 'Antonio', sans-serif; text-align: right; padding: 12px; font-size: 12px; color: #333232; border-left: 1px solid #00000011; text-transform: uppercase; letter-spacing: 0.5px; width: 120px;">Prix Unitaire</th>
            <th style="font-family: 'Antonio', sans-serif; text-align: right; padding: 12px; font-size: 12px; color: #333232; border-left: 1px solid #00000011; text-transform: uppercase; letter-spacing: 0.5px; width: 60px;">Qté</th>
            <th style="font-family: 'Antonio', sans-serif; text-align: right; padding: 12px; font-size: 12px; color: #333232; border-left: 1px solid #00000011; text-transform: uppercase; letter-spacing: 0.5px; width: 120px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${item.prestations.map((p) => {
            const verticalDivider = 'border-left: 1px solid #00000011;';
            return `
              <tr style="border-bottom: 1px solid #00000011;">
                <td style="padding: 15px 12px; border: none; vertical-align: top;">
                  <div style="font-weight: 600; font-size: 13px; color: #000;">${p.description}</div>
                </td>
                <td style="padding: 15px 12px; text-align: right; ${verticalDivider} font-size: 13px; vertical-align: top;">${p.prixUnitaire.toLocaleString()} ${item.devise}</td>
                <td style="padding: 15px 12px; text-align: right; ${verticalDivider} font-size: 13px; vertical-align: top;">${p.quantite}</td>
                <td style="padding: 15px 12px; text-align: right; font-weight: 600; ${verticalDivider} font-size: 13px; color: #000; vertical-align: top;">${(p.prixUnitaire * p.quantite).toLocaleString()} ${item.devise}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div style="margin-left: auto; width: 300px; margin-top: 30px; border: 1.5px solid #313030; background: #fff;">
        <div style="display: flex; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #eceaea;">
          <span style="font-size: 13px; color: #666;">Total HT</span>
          <span style="font-size: 13px; font-weight: 800;">${totalHT.toLocaleString()} ${item.devise}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #eceaea;">
          <span style="font-size: 13px; color: #666;">TVA</span>
          <span style="font-size: 13px; font-weight: 800;">${montantTVA.toLocaleString()} ${item.devise}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 15px 12px; background: #313030; color: #fff;">
          <span style="font-family: 'Antonio', sans-serif; font-size: 14px; font-weight: bold; text-transform: uppercase;">Total TTC </span>
          <span style="font-size: 18px; font-weight: 900;">${totalTTC.toLocaleString()} ${item.devise}</span>
        </div>
      </div>

      <div style="position: absolute; bottom: 40px; left: 50px; width: calc(100% - 100px);">
        <div style="font-size: 11px; color: #555; line-height: 1.6; margin-bottom: 25px; max-width: 80%;">
          <p style="margin: 0 0 5px 0;">La facture devra être payée automatiquement ou dans les 30 jours à compter de la réalisation de la prestation ou de la réception de la marchandise.</p>
          <p style="margin: 0;">Le règlement par espèce, par chèque et par carte bancaire est accepté.</p>
        </div>
        <div style="text-align: center; border-top: 1px solid #e0e0e0; padding-top: 20px;">
           <p style="font-style: italic; font-size: 13px; color: #000; font-weight: 600; margin: 0;">Merci pour votre confiance !</p>
        </div>
      </div>
    </div>`;
};


const downloadPDF = async (item: Facture, template: string) => {
  // Nouvelle logique de couleurs (3 modèles)
  const configs: any = {
    bleu: { border: '#a5d1f0', bg: '#eef3f7', table: '#a5d1f0' },
    rose: { border: '#FA5D89', bg: '#FEF7EC', table: '#FA5D89' },
    violet: { border: '#D09EE7', bg: '#f0fdf4', table: '#D09EE7' },
    vert: { border: '#10b981', bg: '#f0fdf4', table: '#10b981' },
    orange: { border: '#eab308', bg: '#fffbeb', table: '#eab308' },
  gris: { border: '#808283', bg: '#f0fbfc', table: '#808283' },
  };
  
  const colors = configs[template] || configs.bleu;

  const totalHT = calculateTotalHT(item.prestations);
  const montantTVA = totalHT * (item.tvaRate / 100); 
  const totalTTC = totalHT + montantTVA;  

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed; left:-9999px; width:800px; background:white;';
  document.body.appendChild(container);

  // Dans downloadPDF (et identiquement dans sendPDFByEmail)
const layoutToUse = selectedLayout; // Utilise l'état choisi par l'utilisateur
container.innerHTML = getInvoiceHTML(item, colors, layoutToUse);

  try {
    const canvas = await (window as any).html2canvas(container, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const pdf = new (window as any).jspdf.jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width, undefined, 'FAST');
    pdf.save(`Facture_${item.client}_${item.id}.pdf`);
  } finally { 
    document.body.removeChild(container); 
  }
};

const sendPDFByEmail = async (item: Facture, template: string, email: string) => {
  setIsSendingEmail(true);
  
  // 1. Logique de couleurs (identique à ton downloadPDF)
  const configs: any = {
    bleu: { border: '#a5d1f0', bg: '#eef3f7', table: '#a5d1f0' },
    rose: { border: '#FA5D89', bg: '#FEF7EC', table: '#FA5D89' },
    violet: { border: '#D09EE7', bg: '#f0fdf4', table: '#D09EE7' }
  };
  const colors = configs[template] || configs.bleu;

  const totalHT = calculateTotalHT(item.prestations);
  const montantTVA = totalHT * (item.tvaRate / 100); 
  const totalTTC = totalHT + montantTVA;  

  // 2. Création du container fantôme pour html2canvas
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed; left:-9999px; width:800px; background:white;';
  document.body.appendChild(container);

  // ... (ICI : Copie tout le bloc container.innerHTML de ta fonction downloadPDF) ...
  
  // Dans downloadPDF (et identiquement dans sendPDFByEmail)
const layoutToUse = selectedLayout; // Utilise l'état choisi par l'utilisateur
container.innerHTML = getInvoiceHTML(item, colors, layoutToUse);
  
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
    const res = await createFactureAction(formData);

    if (res.success) {
      await loadData();
      setIsModalOpen(false);
      
      // On réinitialise tout le formulaire
      setFormData({
        client: '', 
        clientContact: '', 
        clientAdresse: '', 
        echeance: '', // Laisser vide pour que le useEffect puisse pré-remplir la prochaine fois
        devise: 'FCFA',
        prestations: [{ description: '', prixUnitaire: 0, quantite: 1 }]
      });
    } else {
      // --- MODIFICATION ICI ---
      // Au lieu de l'alert, on utilise ton nouveau popup
      setErrorMessage(res.error || "Une erreur est survenue lors de la création");
      setShowErrorPopup(true);
    }
  } catch (error) {
    // Gestion des erreurs de réseau/serveur inattendues
    setErrorMessage("Impossible de contacter le serveur. Vérifiez votre connexion.");
    setShowErrorPopup(true);
  } finally {
    setIsLoading(false);
  }
};



  const handleDelete = async (dbId: string) => {
    if (confirm("Supprimer définitivement cette facture ?")) {
      const res = await deleteFactureAction(dbId);
      if (res.success) await loadData();
    }
  };

 const filtered = factures.filter(f => {
  const matchesSearch = f.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        f.id.toLowerCase().includes(searchTerm.toLowerCase());
  
  const matchesStatus = filterStatus === 'tous' || f.status === filterStatus;

  return matchesSearch && matchesStatus;
});

  return (
    <div className="factures-container"> 
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content custom-modal">
            <h3>Nouvelle Facture</h3>
            <form onSubmit={handleSave} className="modern-form">
              <div className="form-section">
                <div style={{marginBottom: '10px'}}>
                    <label style={{fontSize: '11px', color: '#666', marginBottom: '4px', display: 'block'}}>CHOISIR UN CLIENT EXISTANT (OPTIONNEL)</label>
                    <select 
                        style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd'}}
                        onChange={handleSelectSavedClient}
                        defaultValue=""
                    >
                        <option value="" disabled>-- Sélectionner un client --</option>
                        {savedClients.map((c, i) => (
                            <option key={i} value={c.nom}>{c.nom}</option>
                        ))}
                    </select>
                </div>

                <input type="text" placeholder="Nom du Client" required value={formData.client} onChange={(e)=>setFormData({...formData, client: e.target.value})} className="main-input" />
                <div className="row">
                  <input style={{width: '100%'}} type="text" placeholder="Contact (Tél/Email)" required value={formData.clientContact} onChange={(e)=>setFormData({...formData, clientContact: e.target.value})} /> 
                  <input style={{width: '100%'}} type="text" placeholder="Adresse Client" required value={formData.clientAdresse} onChange={(e)=>setFormData({...formData, clientAdresse: e.target.value})} />
                </div>
                <div className="row">
                  <div style={{width: '100%'}}>
                    <label style={{fontSize: '11px', color: '#666', marginBottom: '4px', display: 'block'}}>DATE D'ÉCHÉANCE (Auto +30j)</label>
                    <input style={{textTransform: 'uppercase', width: '100%'}} type="date" required value={formData.echeance} onChange={(e)=>setFormData({...formData, echeance: e.target.value})} />
                 
                  </div>
                  <div style={{width: '100%'}}>
                    <label style={{fontSize: '11px', color: '#666', marginBottom: '4px', display: 'block'}}>DEVISE</label>
                    <select style={{width: '100%'}} value={formData.devise} onChange={(e)=>setFormData({...formData, devise: e.target.value})}>
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
                    <div key={index} className="prestation-row" style={{position: 'relative'}}>
                      <input type="text" placeholder="Description" value={p.description} onChange={(e) => updatePrestation(index, 'description', e.target.value)} required />
                      <div className="row-inner" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                         <input type="number" placeholder="Prix unitaire" min="0" step="1" onChange={(e) => updatePrestation(index, 'prixUnitaire', Math.max(0, parseFloat(e.target.value)))} required />
                         <input type="number" placeholder="Qté" min="1" onChange={(e) => updatePrestation(index, 'quantite', Math.max(1, parseInt(e.target.value)))} required />
                         {index !== 0 && (
                           <button type="button" onClick={() => removePrestationLine(index)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px'}}>
                             <i className="fa-solid fa-trash-can"></i>
                           </button>
                         )}
                      </div>
                      <hr className="separator" />
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addPrestationLine} className="btn-add-line">+ Ajouter une autre prestation</button>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={()=>setIsModalOpen(false)} className="btn-cancel">Fermer</button>
                <button type="submit" disabled={isLoading} className="btn-submit">
                  <i className="fa-solid fa-coins"></i> 5 {isLoading ? "Création..." : "Créer "} 
                </button>
              </div>
            </form>
          </div>
        </div>
      )} 

      <div className="table-toolbar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Rechercher par nom ou numéro..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-box" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '10px' }}>
  <i className="fa-solid fa-filter" style={{ color: '#666', fontSize: '14px' }}></i>
  <select 
    value={filterStatus} 
    onChange={(e) => setFilterStatus(e.target.value)}
    style={{
      padding: '8px 12px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '14px',
      backgroundColor: '#fff',
      cursor: 'pointer',
      outline: 'none',
      minWidth: '130px'
    }}
  >
    <option value="tous">Tous les statuts</option>
    <option value="en attente">En attente</option>
    <option value="payer">Payées</option>
  </select>
</div>
        <button className="btn-new" onClick={() => { setIsModalOpen(true); }}>
          + Nouvelle Facture 
        </button>
      </div>

      <div className="div-table-container">
        <div className="div-table-header">
          <div className="col-id">N°</div>
          <div className="col-client">Client</div>
          <div className="col-desc">Description (Prestations)</div>
          <div className="col-date">Date Émission</div>
          <div className="col-actions">Actions</div>
        </div>

        <div className="div-table-body">  
          {filtered.length > 0 ? filtered.map((f) => ( 
            <div className="div-table-row" key={f.dbId}>
              <div className="col-id font-bold" data-label="ID :">{f.id}</div>
              <div className="col-client font-bold" data-label="Client :">{f.client}</div>
              <div className="col-desc" data-label="Prestations :">
                {f.prestations.map((p, i) => (
                  <div key={i} className="desc-tag">{p.description} (x{p.quantite})</div>
                ))}
              </div>
              <div className="col-date" data-label="Émission :">{f.date}</div>

<div className="col-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
  {/* Sélecteur de Statut */}
  <select
    value={f.status}
    onChange={(e) => f.dbId && handleToggleStatus(f.dbId, e.target.value)}
    style={{
      padding: '3px 6px',
      borderRadius: '15px',
      fontSize: '11px',
      fontWeight: '900',
      cursor: 'pointer',
      backgroundColor: f.status === 'payer' ? '#dcfce7' : '#fef9c3',
      color: f.status === 'payer' ? '#166534' : '#85730e',
      border: `1px solid ${f.status === 'payer' ? '#10b981' : '#fc9f00'}`,
      outline: 'none'
    }}
  >
    <option value="en attente">En attente</option>
    <option value="payer">Payée</option>
  </select> 

  {/* Tes boutons existants (Logique et balises conservées à 100%) */}
 <button onClick={() => { setSelectedFacture(f); setShowDownloadPopup(true); }} title="Télécharger">
  <i className="fa fa-file-pdf" style={{color: '#e11d48', marginRight: '10px'}}></i>
</button>
  
  <button 
  onClick={() => { setSelectedFacture(f); setShowEmailPopup(true); }} 
  title="Envoyer par email"
>
  <i className="fa-solid fa-paper-plane" style={{color: '#3b82f6', marginRight: '10px'}}></i>
</button>

  <button onClick={() => f.dbId && handleDelete(f.dbId)} title="Supprimer">
    <i className="fa-solid fa-trash-arrow-up" style={{color: '#ef4444'}}></i>
  </button>
</div>
            </div>
          )) : (
            <div style={{padding:'20px', textAlign:'center', color:'#888'}}>Aucune facture trouvée.</div>
          )} 
        </div> <br /> <br /> <br /> <br /> 
      </div> 

      {/* --- POPUP DE TÉLÉCHARGEMENT AJOUTÉ ICI --- */}
    {showDownloadPopup && (
  <div className="download-popup-overlay">
    <div className="download-popup-content" style={{ maxWidth: '400px' }}>
      <button className="download-popup-close" onClick={() => setShowDownloadPopup(false)}>
        <i className="fa-solid fa-xmark"></i>
      </button>
      
      <div className="download-popup-icon" style={{ backgroundColor: '#f0f9ff', color: '#0369a1' }}>
        <i className="fa-solid fa-palette"></i>
      </div>
      
      <h4>Personnalisez votre facture</h4>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>Configurez le design avant téléchargement.</p>

      {/* --- SECTION 1 : CHOIX DU MODÈLE VISUEL (LAYOUT) --- */}
      <label style={{ fontSize: '11px', fontWeight: '800', color: '#999', display: 'block', marginBottom: '8px', textAlign: 'left', textTransform: 'uppercase' }}>1. Style de disposition</label>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button 
          onClick={() => setSelectedLayout('classique')}
          style={{
            flex: 1, padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
            border: selectedLayout === 'classique' ? '2px solid #0369a1' : '1px solid #ddd',
            backgroundColor: selectedLayout === 'classique' ? '#e0f2fe' : '#fff',
            transition: 'all 0.2s'
          }}
        >
          <i className="fa-solid fa-table-cells-large" style={{ marginRight: '8px' }}></i> Classique
        </button>
        <button 
          onClick={() => setSelectedLayout('moderne')}
          style={{
            flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
            border: selectedLayout === 'moderne' ? '2px solid #0369a1' : '1px solid #ddd',
            backgroundColor: selectedLayout === 'moderne' ? '#e0f2fe' : '#fff',
            transition: 'all 0.2s'
          }}
        >
          <i className="fa-solid fa-file-invoice" style={{ marginRight: '8px' }}></i> Moderne
        </button>
      </div>

      {/* --- SECTION 2 : CHOIX DE LA COULEUR --- */}
      <label style={{ fontSize: '11px', fontWeight: '800', color: '#999', display: 'block', marginBottom: '8px', textAlign: 'left', textTransform: 'uppercase' }}>2. Couleur d'accentuation</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
        {/* MODÈLE BLEU */}
        <div 
          onClick={() => setSelectedTemplate('bleu')}
          style={{
            flex: 1, cursor: 'pointer', padding: '10px', borderRadius: '12px',
            border: selectedTemplate === 'bleu' ? '2.5px solid #a5d1f0' : '2px solid #eee',
            backgroundColor: selectedTemplate === 'bleu' ? '#f0f9ff' : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', 
            transition: 'all 0.2s ease', textAlign: 'center'
          }}
        >
          <div style={{ width: '40px', height: '40px', backgroundColor: '#a5d1f0', borderRadius: '50px', marginBottom: '8px', border: '1px solid #ddd' }}></div>
          <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#333' }}>Bleu</span>
        </div>

        {/* MODÈLE ROSE */}
        <div 
          onClick={() => setSelectedTemplate('rose')}
          style={{
            flex: 1, cursor: 'pointer', padding: '10px', borderRadius: '12px',
            border: selectedTemplate === 'rose' ? '2.5px solid #FA5D89' : '2px solid #eee',
            backgroundColor: selectedTemplate === 'rose' ? '#fff1f2' : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', 
            transition: 'all 0.2s ease', textAlign: 'center'
          }}
        >
          <div style={{ width: '40px', height: '40px', backgroundColor: '#FA5D89', borderRadius: '50px', marginBottom: '8px', border: '1px solid #ddd' }}></div>
          <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#333' }}>Rose</span>
        </div>

        {/* MODÈLE VIOLET */}
        <div 
          onClick={() => setSelectedTemplate('violet')}
          style={{
            flex: 1, cursor: 'pointer', padding: '10px', borderRadius: '12px',
            border: selectedTemplate === 'violet' ? '2.5px solid #D09EE7' : '2px solid #eeeeee',
            backgroundColor: selectedTemplate === 'violet' ? '#f5f3ff' : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', 
            transition: 'all 0.2s ease', textAlign: 'center'
          }}
        >
          <div style={{ width: '40px', height: '40px', backgroundColor: '#D09EE7', borderRadius: '50px', marginBottom: '8px', border: '1px solid #ddd' }}></div>
          <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#333' }}>Violet</span>
        </div>

        {/* MODÈLE VERT */}
<div 
  onClick={() => setSelectedTemplate('vert')}
  style={{
    flex: 1, cursor: 'pointer', padding: '10px', borderRadius: '12px',
    border: selectedTemplate === 'vert' ? '2.5px solid #10b981' : '2px solid #eee',
    backgroundColor: selectedTemplate === 'vert' ? '#f0fdf4' : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', 
    transition: 'all 0.2s ease', textAlign: 'center'
  }}
>
  <div style={{ width: '40px', height: '40px', backgroundColor: '#10b981', borderRadius: '50px', marginBottom: '8px', border: '1px solid #ddd' }}></div>
  <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#333' }}>Vert</span>
</div>

{/* MODÈLE ORANGE */}
<div 
  onClick={() => setSelectedTemplate('orange')}
  style={{
    flex: 1, cursor: 'pointer', padding: '10px', borderRadius: '12px',
    border: selectedTemplate === 'orange' ? '2.5px solid #f59e0b' : '2px solid #eee',
    backgroundColor: selectedTemplate === 'orange' ? '#fffbeb' : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', 
    transition: 'all 0.2s ease', textAlign: 'center'
  }}
>
  <div style={{ width: '40px', height: '40px', backgroundColor: '#f59e0b', borderRadius: '50px', marginBottom: '8px', border: '1px solid #ddd' }}></div>
  <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#333' }}>Orange</span>
</div>




{/* MODÈLE GRIS */}
<div 
  onClick={() => setSelectedTemplate('gris')}
  style={{
    flex: 1, cursor: 'pointer', padding: '10px', borderRadius: '12px',
    border: selectedTemplate === 'gris' ? '2.5px solid #808283' : '2px solid #eee',
    backgroundColor: selectedTemplate === 'gris' ? '#f0fbfc' : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center',
    transition: 'all 0.2s ease', textAlign: 'center'
  }}
>
  <div style={{ width: '40px', height: '40px', backgroundColor: '#808283', borderRadius: '50px', marginBottom: '8px', border: '1px solid #ddd' }}></div>
  <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#333' }}>Gris</span>
</div>
      </div>

      <button 
        className="download-popup-btn" 
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        onClick={() => {
          if (selectedFacture) {
            // On passe maintenant les deux réglages à la fonction
            downloadPDF(selectedFacture, selectedTemplate); 
            setShowDownloadPopup(false);
          }
        }}
      >
        <i className="fa-solid fa-download"></i>
        Télécharger
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
        onClick={() => selectedFacture && sendPDFByEmail(selectedFacture, selectedTemplate, emailDestinataire)}
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
        La facture a été transmise avec succès à votre client.
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




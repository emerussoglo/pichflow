'use client';
import React, { useState, useEffect } from 'react';
import { createFactureAction, getFacturesAction, deleteFactureAction, getClientsAction, updateFactureStatusAction, sendFactureEmailAction } from './factureAction';
import { getInvoiceHTML, templateConfigs } from './invoiceTemplates';



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



const downloadPDF = async (item: Facture, template: string) => {
  const colors = templateConfigs[template] || templateConfigs.bleu;

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed; left:-9999px; width:800px; background:white;';
  document.body.appendChild(container);

  const layoutToUse = selectedLayout; 
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
  
  const colors = templateConfigs[template] || templateConfigs.bleu;

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed; left:-9999px; width:800px; background:white;';
  document.body.appendChild(container);

  const layoutToUse = selectedLayout; 
  container.innerHTML = getInvoiceHTML(item, colors, layoutToUse);
  
  try {
    const canvas = await (window as any).html2canvas(container, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const pdf = new (window as any).jspdf.jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    
    const pdfBase64 = pdf.output('datauristring').split(',')[1];

    const res = await sendFactureEmailAction(email, pdfBase64, item.id);

    if (res.success) {
      setShowEmailPopup(false); 
      setEmailDestinataire('');
      setShowEmailSuccess(true); 
    } else {
      setEmailErrorMessage(res.error || "Le serveur n'a pas pu envoyer l'email.");
      setShowEmailError(true); 
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
  
  {/* Bouton CLASSIQUE */}
  <button 
    onClick={() => setSelectedLayout('classique')}
    style={{
      flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
      border: selectedLayout === 'classique' ? '2px solid #0369a1' : '1px solid #ddd',
      backgroundColor: selectedLayout === 'classique' ? '#e0f2fe' : '#fff',
      transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'
    }}
  >
    <img src="/img/class.png" alt="Classique" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
    Classique
  </button>
   {/* Bouton PROFESSIONEL */}
  <button 
    onClick={() => setSelectedLayout('professionel')}
    style={{
      flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
      border: selectedLayout === 'professionel' ? '2px solid #0369a1' : '1px solid #ddd',
      backgroundColor: selectedLayout === 'professionel' ? '#e0f2fe' : '#fff',
      transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'
    }}
  >
    <img src="/img/aveclogo.png" alt="Professionel" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
    Professionel (avec logo)
  </button>

  {/* Bouton MODERNE */}
  <button 
    onClick={() => setSelectedLayout('moderne')}
    style={{
      flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
      border: selectedLayout === 'moderne' ? '2px solid #0369a1' : '1px solid #ddd',
      backgroundColor: selectedLayout === 'moderne' ? '#e0f2fe' : '#fff',
      transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'
    }}
  >
    <img src="/img/classique.png" alt="Moderne" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
    Moderne
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




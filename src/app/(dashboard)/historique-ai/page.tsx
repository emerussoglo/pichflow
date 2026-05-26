'use client';

import React, { useState, useEffect } from 'react';
import { 
  getFullAIHistoryAction, 
  getLinkedInLoginUrlAction,
  checkLinkedInLinkedAction, 
  publishToLinkedInAction,
  disconnectLinkedInAction,
  scheduleLinkedInPostAction
} from './aiAction';

interface AIHistoryItem { 
  id: string; type: string; subject: string; content: string;
  category: 'marketing' | 'copywriting' | 'manuel'; date: number;
}

export default function HistoriqueAIPage() {
  const [items, setItems] = useState<AIHistoryItem[]>([]);
  const [filter, setFilter] = useState<'tous' | 'marketing' | 'copywriting' | 'manuel'>('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<AIHistoryItem | null>(null);
  const [copied, setCopied] = useState(false);
  
  // States LinkedIn
  const [isLinked, setIsLinked] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  
  // States Modales & Toasts
  const [confirmPublish, setConfirmPublish] = useState<{content: string, subject: string} | null>(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
    show: false, msg: '', type: 'success'
  });

  // State Manuel & Scheduling
  const [manualText, setManualText] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    getFullAIHistoryAction().then(data => {
      setItems(data as AIHistoryItem[]);
      setLoading(false);
    });
    checkLinkedInLinkedAction().then(setIsLinked);
  };

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const handleLink = async () => {
    const url = await getLinkedInLoginUrlAction();
    window.location.href = url;
  };

  const handleDisconnect = async () => {
    const res = await disconnectLinkedInAction();
    setShowDisconnectConfirm(false);
    if (res.success) {
      setIsLinked(false);
      triggerToast("Compte LinkedIn déconnecté");
    } else triggerToast("Erreur déconnexion", "error");
  };

  const startPublishFlow = (content: string, subject: string) => {
    if (!isLinked) return handleLink();
    setConfirmPublish({ content, subject });
  };

  const executePublish = async () => {
    if (!confirmPublish) return;
    const content = confirmPublish.content;
    setConfirmPublish(null);
    setPublishingId('current');
    
    const res = await publishToLinkedInAction(content);
    setPublishingId(null);

    if (res.success) triggerToast("Publié sur LinkedIn !");
    else triggerToast("Erreur: " + res.error, 'error');
  };

  const handleSchedulePost = async () => {
    if (!manualText || !schedDate || !schedTime) {
        return triggerToast("Veuillez remplir tous les champs", "error");
    }
    const res = await scheduleLinkedInPostAction(manualText, schedDate, schedTime);
    if (res.success) {
        triggerToast("Post programmé !");
        setManualText('');
        setShowSchedule(false);
    } else triggerToast("Erreur programmation", "error");
  };

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'tous' || item.category === filter;
    return matchesFilter && (item.subject.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="history-container" style={{ position: 'relative', minHeight: '100vh', paddingBottom: '50px' }}>
      
      {/* 1. TOAST */}
      {toast.show && (
        <div style={{ ...toastStyle, borderLeft: `5px solid ${toast.type === 'success' ? '#16a34a' : '#e11d48'}` }}>
          <div style={{ ...toastIconStyle, backgroundColor: toast.type === 'success' ? '#dcfce7' : '#fee2e2', color: toast.type === 'success' ? '#16a34a' : '#e11d48' }}>
            <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i>
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{toast.msg}</div>
        </div>
      )}

      {/* 2. STATS BAR */}
      <div style={statsBarStyle}>
         <div style={{ display: 'flex', gap: '10px' }}>
            <div >
                <p style={statLabel}>Automatisez du contenu</p>
                {/* <p style={statValue}>{items.length}</p> */}
            </div>
            {/* <div>
                <p style={statLabel}>Réseau</p>
                <p style={{ ...statValue, color: '#0A66C2' }}><i className="fa-brands fa-linkedin"></i></p>
            </div> */}
         </div>
         <button className='tot-link' onClick={isLinked ? () => setShowDisconnectConfirm(true) : handleLink} style={btnSocialStyle(isLinked)}>
            {isLinked ? 'LinkedIn Connecté' : 'Lier LinkedIn'}
         </button>
      </div>

      {/* 3. CONFIRM PUBLISH MODAL */}
      {confirmPublish && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="modal-content-ai" style={{ maxWidth: '400px', textAlign: 'center' }}>
             <h3>Confirmer la publication</h3>
             <p style={{ margin: '15px 0' }}>Voulez-vous publier ce contenu sur LinkedIn ?</p>
             <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setConfirmPublish(null)} style={modalBtnSec}>Annuler</button>
                <button onClick={executePublish} style={modalBtnPrim}>Confirmer</button>
             </div>
          </div>
        </div>
      )}

      {/* 4. CONFIRM DISCONNECT MODAL */}
      {showDisconnectConfirm && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="modal-content-ai" style={{ maxWidth: '400px', textAlign: 'center' }}>
             <h3 style={{ color: '#e11d48' }}>Déconnexion</h3>
             <p style={{ margin: '15px 0' }}>Délier votre compte LinkedIn de Pichflow ?</p>
             <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowDisconnectConfirm(false)} style={modalBtnSec}>Garder</button>
                <button onClick={handleDisconnect} style={{ ...modalBtnPrim, backgroundColor: '#e11d48' }}>Déconnecter</button>
             </div>
          </div>
        </div>
      )}
 
      <div className="history-header" style={{ marginTop: '30px' }}>
        <h1>Gestionnaire de Contenu</h1>
        <div className="filter-tabs">
          <button className={filter === 'tous' ? 'active' : ''} onClick={() => setFilter('tous')}>Historique AI</button>
          <button className={filter === 'marketing' ? 'active' : ''} onClick={() => setFilter('marketing')}>Marketing</button>
          <button className={filter === 'copywriting' ? 'active' : ''} onClick={() => setFilter('copywriting')}>Copywriting</button>
          <button className={filter === 'manuel' ? 'active' : ''} onClick={() => setFilter('manuel')} style={{ color: '#0A66C2' }}>✍️ Écriture Libre</button>
        </div>
      </div>

      {/* ÉDITEUR MANUEL */}
      {filter === 'manuel' ? (
        <div style={manualEditorStyle}>
            <textarea 
                value={manualText} 
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Écrivez votre post LinkedIn ici..." 
                style={manualInput}
            />
            <div style={{ display: 'flex', flexDirection:'column', justifyContent: 'space-between', marginTop: '20px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection:'column', gap: '10px', alignItems: 'center' }}>
                    {/* <button onClick={() => setShowSchedule(!showSchedule)} style={btnSchedStyle}>
                        <i className="fa-regular fa-clock"></i> Programmer
                    </button> */}
                    {showSchedule && (
                        <div style={{ display: 'flex', gap: '5px', flexDirection:'column', }}>
                            <input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)} style={dateInput} />
                            <input type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)} style={dateInput} />
                            <button onClick={handleSchedulePost} style={btnOkSched}>OK</button>
                        </div>
                    )}
                </div>
                <button 
                    disabled={!manualText || publishingId === 'current'} 
                    onClick={() => startPublishFlow(manualText, "Post Manuel")} 
                    style={modalBtnPrim}
                >
                    {publishingId === 'current' ? <i className="fas fa-spinner fa-spin"></i> : 'Publier Maintenant'}
                </button>
            </div>
        </div>
      ) : (
        <div className="history-grid">
            {loading ? <p>Chargement...</p> : filteredItems.map(item => (
            <div key={item.id} className={`history-card ${item.category}`} onClick={() => setSelectedItem(item)}>
                <div className="card-inner">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="card-tag">{item.type}</div>
                    <button onClick={(e) => { e.stopPropagation(); startPublishFlow(item.content, item.subject); }} style={iconBtnStyle}>
                        <i className="fa-brands fa-linkedin-in"></i>
                    </button>
                </div>
                <h3 className="card-subject">{item.subject}</h3>
                <p className="card-excerpt">{item.content}</p>
                </div>
            </div>
            ))}
        </div>
      )}

      {/* MODALE DE DÉTAIL */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content-ai" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="card-tag">{selectedItem.type}</span>
              <button className="close-btn" onClick={() => setSelectedItem(null)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <pre className="full-content" style={{ maxHeight: '400px', overflowY: 'auto', padding: '15px' }}>{selectedItem.content}</pre>
            <div className="modal-footer" style={{ gap: '10px' }}>
              <button className="btn-copy" onClick={() => {
                navigator.clipboard.writeText(selectedItem.content);
                triggerToast("Copié !");
              }} style={{ flex: 1 }}>Copier</button>
              <button onClick={() => startPublishFlow(selectedItem.content, selectedItem.subject)} style={modalBtnPrim}>Publier</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const statsBarStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 25px', backgroundColor: 'white', borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '30px'
};

const statLabel = { fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' as const, fontWeight: '800' as const };
const statValue = { fontSize: '1.4rem', fontWeight: '700', marginTop: '4px' };

const manualEditorStyle: React.CSSProperties = {
    backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
};

const manualInput: React.CSSProperties = {
    width: '100%', minHeight: '250px', border: '1px solid #e2e8f0', borderRadius: '12px',
    padding: '20px', fontSize: '1.1rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical'
};

const btnSocialStyle = (linked: boolean) => ({
    backgroundColor: linked ? '#f0fdf4' : '#0A66C2', color: linked ? '#16a34a' : 'white',
    padding: '8px 15px', borderRadius: '30px', border: linked ? '1px solid #16a34a' : 'none',
    fontWeight: '800' as const, cursor: 'pointer'
});

const toastStyle: React.CSSProperties = {
  position: 'fixed', top: '20px', right: '20px', zIndex: 10002,
  backgroundColor: 'white', padding: '12px 25px', borderRadius: '12px',
  display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', minWidth: '300px'
};

const toastIconStyle = { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' };

const modalBtnPrim = { backgroundColor: '#0A66C2', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold' as const, cursor: 'pointer', flex: 1 };
const modalBtnSec = { backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold' as const, cursor: 'pointer', flex: 1 };

const btnSchedStyle = { background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontWeight: '600' };
const dateInput = { padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' };
const btnOkSched = { background: '#16a34a', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' };

const iconBtnStyle = { backgroundColor: '#0A66C2', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' };
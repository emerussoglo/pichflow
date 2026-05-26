'use client';
import React, { useState, useEffect } from 'react';
import { getClientsAction, saveClientAction, deleteClientAction } from './clientAction';

interface Client {
  id: string; // On utilise 'id' comme dans la base de données
  nom: string;
  contact: string;
  adresse: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nom: '',
    contact: '',
    adresse: ''
  });

  // --- CHARGEMENT RÉEL ---
  const loadClients = async () => {
    const data = await getClientsAction();
    setClients(data as Client[]);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingId(client.id);
      setFormData({ nom: client.nom, contact: client.contact, adresse: client.adresse });
    } else {
      setEditingId(null);
      setFormData({ nom: '', contact: '', adresse: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // APPEL AU BACKEND
    const result = await saveClientAction(formData, editingId);

    if (result.success) {
      await loadClients(); // On rafraîchit la liste
      setIsModalOpen(false);
      setFormData({ nom: '', contact: '', adresse: '' });
    } else {
      alert(result.error || "Une erreur est survenue");
    }
    
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer ce client définitivement ?")) {
      const result = await deleteClientAction(id);
      if (result.success) {
        await loadClients();
      } else {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const filtered = clients.filter(c => 
    c.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="factures-container">
      
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content custom-modal client-modal-size">
            <h3 style={{fontFamily: 'Antonio', textTransform: 'uppercase', fontWeight: 800}}>
                {editingId ? 'Modifier le Client' : 'Nouveau Client'}
            </h3>
            <form onSubmit={handleSave} className="modern-form">
              <div className="form-section card-style">
                <div className="form-group-custom">
                  <label>NOM DU CLIENT / ENTREPRISE</label>
                  <input 
                    type="text" 
                    placeholder="ex: John DOE" 
                    required 
                    value={formData.nom} 
                    onChange={(e)=>setFormData({...formData, nom: e.target.value})} 
                    className="main-input-client" 
                  />
                </div>

                <div className="form-group-custom">
                  <label>CONTACT (TÉL OU EMAIL)</label>
                  <input 
                    type="text" 
                    placeholder="ex: +33 6 12 34 56 78" 
                    required 
                    value={formData.contact} 
                    onChange={(e)=>setFormData({...formData, contact: e.target.value})} 
                  />
                </div>

                <div className="form-group-custom">
                  <label>ADRESSE COMPLÈTE</label>
                  <textarea 
                    placeholder="12 Rue des Fleurs, 75008 Paris, France" 
                    required 
                    value={formData.adresse} 
                    onChange={(e)=>setFormData({...formData, adresse: e.target.value})} 
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={()=>setIsModalOpen(false)} className="btn-cancel">Annuler</button>
                <button type="submit" disabled={isLoading} className="btn-submit">
                   <i className={`fa-solid ${editingId ? 'fa-pen-to-square' : 'fa-user-check'}`}></i> 
                   &nbsp;{isLoading ? "En cours..." : (editingId ? "Mettre à jour" : "Enregistrer")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-toolbar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Rechercher un client..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
        </div>
        <button className="btn-new" onClick={() => handleOpenModal()}>
          <i className="fa-solid fa-user-plus"></i> Nouveau Client
        </button>
      </div>

      <div className="div-table-container">
        <div className="div-table-header hide-mobile">
          <div className="col-client">Client</div>
          <div className="col-desc">Coordonnées</div>
          <div className="col-date">Localisation</div>
          <div className="col-actions">Actions</div>
        </div>

        <div className="div-table-body">
          {filtered.length > 0 ? filtered.map((c) => (
            <div className="div-table-row" key={c.id}>
              <div className="col-client font-bold" data-label="CLIENT :">{c.nom}</div>
              <div className="col-desc" data-label="CONTACT :">{c.contact}</div>
              <div className="col-date" data-label="ADRESSE :">{c.adresse}</div>
              <div className="col-actions">
                <button onClick={() => handleOpenModal(c)} title="Modifier">
                    <i className="fa-solid fa-pen-to-square" style={{color: 'var(--primary-blue)'}}></i>
                </button>
                <button onClick={() => handleDelete(c.id)} title="Supprimer">
                    <i className="fa-solid fa-trash-arrow-up" style={{color: '#ef4444'}}></i>
                </button>
              </div>
            </div>
          )) : (
            <div style={{padding:'40px', textAlign:'center', color:'#888'}}>
               <i className="fa-solid fa-users-slash" style={{fontSize:'30px', marginBottom:'10px', display:'block'}}></i>
               {searchTerm ? "Aucun résultat pour cette recherche." : "Aucun client enregistré dans votre base."}
            </div>
          )}
        </div>
      </div>
      <br /> <br />
    </div>
  );
}
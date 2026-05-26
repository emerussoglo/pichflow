"use client";

import React, { useState, useEffect } from "react";
import { 
  generateMarketingAction, 
  getMarketingHistory, 
  deleteMarketingItem 
} from "./generateAIClient";

interface HistoriqueItem {
  id: string;
  type: string;
  sujet: string;
  contenu: string;
  date: string;
}

export default function MarketingRoute() {
  const [selectedType, setSelectedType] = useState("Réseau sociaux");
  const [tone, setTone] = useState("Professionnel");
  const [textLength, setTextLength] = useState("100-200");
  const [prompt, setPrompt] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const [historique, setHistorique] = useState<HistoriqueItem[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<HistoriqueItem | null>(null);

  // --- CHARGEMENT DEPUIS LA BASE DE DONNÉES ---
  useEffect(() => {
    const loadData = async () => {
      const data = await getMarketingHistory();
      if (data) setHistorique(data as unknown as HistoriqueItem[]);
    };
    loadData();
  }, []);

  const contentTypes = [
    { id: "social", label: "Réseau sociaux", icon: "fa-share-nodes" },
    { id: "email", label: "Email marketing", icon: "fa-envelope" },
    { id: "video", label: "Script vidéo", icon: "fa-video" },
  ];

  // --- LOADERS ET UTILITAIRES ---
  const RippleLoader = ({ size = 50 }) => (
    <div
      className="loader-react"
      style={{
        width: size,
        height: (size * 28) / 50,
        margin: "0 auto", 
        position: "relative",
        "--g": "no-repeat radial-gradient(farthest-side,#000 94%,#0000)",
        background: `var(--g) 50% 0, var(--g) 100% 0`,
        backgroundSize: `${(size * 12) / 50}px ${(size * 12) / 50}px`,
        animation: "l23-0 1.5s linear infinite",
        display: "block"
      } as React.CSSProperties}
    >
      <style>{`
        .loader-react::before {
          content: "";
          position: absolute;
          height: 12px;
          aspect-ratio: 1;
          border-radius: 50%;
          background: #000;
          left: 0;
          top: 0;
          animation: l23-1 1.5s linear infinite, l23-2 0.5s cubic-bezier(0,200,.8,200) infinite;
        }
        @keyframes l23-0 {
          0%,31%  {background-position: 50% 0, 100% 0}
          33%     {background-position: 50% 100%, 100% 0}
          43%,64% {background-position: 50% 0, 100% 0}
          66%     {background-position: 50% 0, 100% 100%}
          79%     {background-position: 50% 0, 100% 0}
          100%    {transform: translateX(calc(-100%/3))}
        }
        @keyframes l23-1 { 100% { left: calc(100% + 7px); } }
        @keyframes l23-2 { 100% { top: -0.1px; } }
      `}</style>
    </div>
  );

  const SolidBlackLoader = ({ size = "20px" }) => (
    <div
      style={{
        width: size,
        height: size,
        border: "3px solid #000",
        borderBottomColor: "transparent",
        borderRadius: "50%",
        display: "inline-block",
        animation: "rotation 1s linear infinite",
      }}
    >
      <style>{`@keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const cleanFormat = (text: string) =>
    text.replace(/^#+\s*/gm, "").replace(/[*_~`]/g, "").replace(/\n{3,}/g, "\n\n").trim();

  const handleCopy = async (text?: string) => {
    const contentToCopy = text || generatedResult;
    if (!contentToCopy) return;
    await navigator.clipboard.writeText(contentToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = (text?: string, type?: string) => {
    const content = text || generatedResult;
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pichflow-${(type || selectedType).toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- SUPPRESSION EN BASE DE DONNÉES ---
  const deleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Voulez-vous vraiment supprimer cette génération de votre historique ?")) return;
    
    const result = await deleteMarketingItem(id);
    if (result.success) {
      setHistorique(prev => prev.filter(h => h.id !== id));
    } else {
      alert("Erreur lors de la suppression en base de données.");
    }
  };

  const referenceStyleText = `
Style Réseau sociaux :
[
🚀 Vous avez du talent… mais pas encore de revenus ?
Bonne nouvelle : en seulement 7 jours, vous pouvez transformer vos compétences en un produit digital rentable.
✔ Créez votre site depuis votre téléphone
✔ Attirez vos clients grâce à des contenus simples et efficaces
Si vous êtes prêt à passer de l'idée à l'action, c'est maintenant.
🔥 Rejoignez la formation et commencez votre business digital !

] 

Style Email marketing :
[
Objet : Transformez vos compétences en revenu dès ce mois-ci

Bonjour [Prénom],
Vous avez une compétence, mais vous ne savez pas comment la monétiser ?  
Notre Masterclass Digital Addict vous montre comment créer votre premier produit digital et le vendre efficacement.
Voici ce que vous allez apprendre :
- Créer un site professionnel directement depuis votre téléphone ;
- Lancer vos premières ventes rapidement et sans capital.
Offre limitée : seulement 20 places disponibles.

]
Style Script vidéo :
[
[Intro]
Comment percer sur YouTube ?
Ca c'est une question que 80 % des gens se posent se basant souvent sur des youtubeurs connus et d'ailleurs il y a plein de tutos qui expliquent le sujet mais aucun n'explique vraiment comment bien percer.
[Accroche]
Déjà les premières questions à se poser quand on se lance sur Youtube c'est comment je veux percer et dans quelle domaine ? Est-ce dans le divertissement, tout ce qui est trend, ou tuto général ? etc.
Le but c'est de trouver un domaine qui vous plaît car avant d'être connu sur YouTube il y a un long chemin à parcourir et si vous n'aimez pas ce que vous faites vous risquez d'abandonner.
Après, pour ce qui est de comment percer, vous avez le choix entre  les shorts et les vidéos longues, sachant que votre choix aura un impact sur votre future communauté. 

[Corps de la vidéo ou explication]
Aussi vous devez avoir un planning de vidéos régulier parce que l'algorithme mettra plus vos vidéos en avant si vous en postez une fois par semaine par exemple alors que si c'est cinq par jour elles seront beaucoup moins mises en avant. Et en fait si par exemple vidéo a 1000 vues et que vous avez genre 700 likes, 400 commentaires et 200 partages alors elle va vraiment être mise en avant.
[Conclusion et outro]
Donc essayez de trouver un planning de vidéo stable qui vous convient que vous pouvez bien respecter. Le secret pour percer sur Youtube c'est de faire ce que l'on aime et si vous avez des commentaires négatifs sur vos vidéos supprimez-les et ne lâchez jamais.
Gardez un mental d'acier car les personnes les plus fortes ne sont pas toujours ceelles qui gagnent toujours mais celles qui n'abandonnent jamais quand elles perdent.

]
IMPORTANT  
Tu ne dois jamais copier les textes mot pour mot.  
Tu dois uniquement imiter la structure, le ton et l'énergie de tous les styles présentés ci-dessus.
`; 

  const handleGenerate = async () => {
    if (!prompt) return alert("Veuillez décrire un sujet !");
    
    setIsGenerating(true);
    setGeneratedResult("");

    const systemInstruction = `
      Tu es un expert en marketing digital. Rédige un(e) ${selectedType} avec un ton ${tone}.
      La longueur du texte doit être d'environ ${textLength} mots.
      IMPORTANT : Ne fournis que le texte brut. Pas de Markdown. Respecte les accents.
      UTILISE LES STYLES SUIVANTS COMME RÉFÉRENCE : ${referenceStyleText}
      
      Tu dois uniquement imiter la structure, le ton et l’énergie de tous les styles présentés ci-dessus.
    `;

    try {
      const result = await generateMarketingAction({ 
        prompt, 
        systemInstruction,
        type: selectedType 
      });

      if (!result.success || !result.dbItem) {
        alert(result.error || "Une erreur est survenue.");
        return;
      }

      const cleaned = cleanFormat(result.text as string);
      setGeneratedResult(cleaned);

      const newItem: HistoriqueItem = {
        id: result.dbItem.id, 
        type: result.dbItem.type,
        sujet: result.dbItem.sujet,
        contenu: cleaned,
        date: new Date(result.dbItem.date).toLocaleString("fr-FR", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setHistorique(prev => [newItem, ...prev]);

    } catch (error: any) {
      console.error("Erreur interface:", error);
      alert("Une erreur technique est survenue.");
    } finally {
      setIsGenerating(false);
    }
  };

  return ( 
    <div className="ia-page-container" style={{ width: "100%", overflowX: "hidden" }}>
      {selectedHistory && (
        <div className="modal-overlay" onClick={() => setSelectedHistory(null)}>
          {/* Largeur adaptative pour la modal */}
          <div className="modal-content custom-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', width: '95%', margin: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem' }}>{selectedHistory.type}</h3>
              <button onClick={() => setSelectedHistory(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            <p style={{ fontSize: '12px', color: '#666' }}>Sujet : {selectedHistory.sujet}</p>
            <hr />
            <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '10px', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem' }}>
              {selectedHistory.contenu}
            </div>
            <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn-cancel" style={{ flex: 1 }} onClick={() => handleDownload(selectedHistory.contenu, selectedHistory.type)}>Télécharger</button>
              <button className="btn-submit" style={{ flex: 1 }} onClick={() => { handleCopy(selectedHistory.contenu); setSelectedHistory(null); }}>Copier</button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION PRINCIPALE : CONFIGURATION (GAUCHE) & RÉSULTAT (DROITE) */}
      <div style={{ 
        display: "grid", 
        // CHANGEMENT ICI : minmax(0, 1fr) permet de descendre en dessous de 500px sur mobile
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", 
        gap: "20px",
        alignItems: "start" 
      }}>
        
        {/* CÔTÉ CONFIGURATION */}
        <div className="ia-config-side" style={{ background: "#fff", padding: "clamp(15px, 4vw, 25px)", borderRadius: "16px", border: "1px solid #eee" }}>
          <div className="config-section" style={{ marginBottom: "20px" }}>
            <h4 style={{ marginBottom: "15px" }}>Type de contenu</h4>
            {/* S'assurer que la grille de types ne casse pas le layout */}
            <div className="type-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px" }}>
              {contentTypes.map(type => (
                <button key={type.id} className={`type-card ${selectedType === type.label ? "active" : ""}`} onClick={() => setSelectedType(type.label)} style={{ width: "100%", padding: "10px" }}>
                  <i className={`fa-solid ${type.icon}`}></i> {type.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ 
            display: "grid", 
            // Bascule en 1 colonne sur mobile très étroit
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", 
            gap: "15px", 
            marginBottom: "20px" 
          }}>
            <div className="config-section">
              <h4>Ton du contenu</h4>
              <select className="ia-select" style={{ width: "100%" }} value={tone} onChange={e => setTone(e.target.value)}>
                <option>Professionnel</option>
                <option>Amical</option>
                <option>Persuasif</option>
                <option>Enthousiaste</option>
              </select>
            </div>

            <div className="config-section">
              <h4>Longueur (mots)</h4>
              <select className="ia-select" style={{ width: "100%" }} value={textLength} onChange={e => setTextLength(e.target.value)}>
                <option value="100-200">100 - 200</option>
                <option value="200-300">200 - 300</option>
                <option value="300-400">300 - 400</option>
                <option value="500-700">500 - 700</option>
              </select>
            </div>
          </div>

          <div className="config-section" style={{ marginBottom: "25px" }}>
            <h4>Sujet ou thème</h4>
            <textarea 
              className="ia-textarea" 
              placeholder="Décrivez précisément ce que vous voulez générer..." 
              value={prompt} 
              onChange={e => setPrompt(e.target.value)}
              style={{ minHeight: "120px", width: "100%" }}
            ></textarea>
          </div>

          <button className="btn-generate" onClick={handleGenerate} disabled={isGenerating} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", width: "100%", padding: "15px" }}>
            {isGenerating ? "Génération..." : <> Générer <i className="fa-solid fa-coins"></i>5</>}
          </button>
        </div>

        {/* CÔTÉ RÉSULTAT */}
        <div className="ia-result-side">
          <div className="result-card" style={{ background: "#fff", padding: "clamp(15px, 4vw, 25px)", borderRadius: "16px", border: "1px solid #eee", minHeight: "300px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #f5f5f5", paddingBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
              <h4 style={{ margin: 0 }}>Résultat</h4>
              {generatedResult && (
                <button onClick={() => handleCopy()} style={{ background: "#f0fdf4", border: "none", color: "#10b981", padding: "8px 15px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}>
                  {isCopied ? "Copié !" : "Copier"}
                </button>
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              {generatedResult ? (
                <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.8", color: "#333", fontSize: "1rem" }}>{generatedResult}</div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
                  {isGenerating ? <RippleLoader /> : (
                    <>
                      <i className="fa-solid fa-robot" style={{ fontSize: "40px", marginBottom: "15px", display: "block", opacity: 0.3 }}></i>
                      <p style={{ fontSize: "14px" }}>Configurez à gauche et lancez la magie...</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION HISTORIQUE */}
      <div style={{ marginTop: "40px", paddingTop: "30px", borderTop: "2px solid #f8f8f8" }}>
        <h4 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px", fontSize: "1.1rem" }}>
          <i className="fa-solid fa-clock-rotate-left" style={{ color: "#6366f1" }}></i> Historique
        </h4>
        
        {historique.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", background: "#f9f9f9", borderRadius: "12px", border: "1px dashed #ddd" }}>
            <p style={{ color: "#999", fontSize: "14px" }}>Aucune génération.</p>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            // Grille d'historique responsive
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", 
            gap: "15px" 
          }}>
            {historique.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedHistory(item)}
                className="history-card"
                style={{ 
                  background: "#fff", 
                  padding: "15px", 
                  borderRadius: "15px", 
                  border: "1px solid #eee", 
                  cursor: "pointer",
                  position: "relative" 
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "10px", fontWeight: "700", background: "#EEF2FF", color: "#4F46E5", padding: "3px 8px", borderRadius: "5px" }}>
                    {item.type}
                  </span>
                  <button onClick={e => deleteHistory(item.id, e)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
                <p style={{ fontSize: "13px", fontWeight: "600", margin: "5px 0", color: "#1f2937", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {item.sujet}
                </p>
              </div>
            ))} 
          </div> 
        )}
      </div> <br /> <br /> <br />
    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { 
  generateCopywritingAction, 
  getCopyHistory, 
  deleteCopyItem 
} from "./generateCopywriting";

interface CopyHistoryItem {
  id: string;
  method: string;
  product: string;
  content: string;
  date: string;
}

export default function CopywritingPage() {
  const [activeMethod, setActiveMethod] = useState("AIDA");
  const [type, setType] = useState("Page de vente");
  const [product, setProduct] = useState("");
  const [target, setTarget] = useState("");
  const [objective, setObjective] = useState("Professionnel");
  const [textLength, setTextLength] = useState("100-200");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const [history, setHistory] = useState<CopyHistoryItem[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<CopyHistoryItem | null>(null);

  // --- CHARGEMENT DE L'HISTORIQUE DEPUIS LA DB ---
  useEffect(() => {
    const loadHistory = async () => {
      const data = await getCopyHistory();
      setHistory(data as unknown as CopyHistoryItem[]);
    };
    loadHistory();
  }, []);

  const methods = [
    { id: "AIDA", title: "AIDA", desc: "Attention, Interest, Desire, Action" },
    { id: "PAS", title: "PAS", desc: "Problem, Agitation, Solution" },
    { id: "BAB", title: "BAB", desc: "Avant, Après, Pont" },
  ];

  // --- COMPOSANTS DE CHARGEMENT ---
  const RippleLoader = ({ size = 40, color = "black" }) => {
    const height = (size * 20) / 40;
    return ( 
      <div className="loader-react" style={{ width: size, height, background: color, position: "relative", margin: "0 auto", animation: "l9-0 1.5s infinite linear" }}>
        <style>{`
          .loader-react::before, .loader-react::after { content: ""; position: absolute; background: inherit; bottom: 100%; width: 50%; height: 100%; animation: inherit; animation-name: l9-1; }
          .loader-react::before { left: 0; transform-origin: bottom left; --s: -1; }
          .loader-react::after { right: 0; transform-origin: bottom right; }
          @keyframes l9-0 { 0%,10% {transform:translateY(0%) scaleY(1);} 49.99% {transform:translateY(-50%) scaleY(1);} 50% {transform:translateY(-50%) scaleY(-1);} 90%,100% {transform:translateY(-100%) scaleY(-1);} }
          @keyframes l9-1 { 10%,90% {transform: rotate(0deg);} 50% {transform: rotate(calc(var(--s,1)*180deg));} }
        `}</style>
      </div>
    );
  };

  const SolidBlackLoader = ({ size = "20px" }) => (
    <div style={{ width: size, height: size, border: "3px solid #000", borderBottomColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "rotation 1s linear infinite" }}>
      <style>{`@keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // --- FONCTIONS UTILITAIRES ---
  const cleanFormat = (text: string): string =>
    text.replace(/^#+\s*/gm, "").replace(/[*_~`]/g, "").replace(/\n{3,}/g, "\n\n").trim();

  const handleCopy = async (textToCopy?: string) => {
    const content = textToCopy || generatedResult;
    if (!content) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) { console.error("Erreur copie:", err); }
  };

  const handleDownload = (textToDownload?: string, methodUsed?: string) => {
    const content = textToDownload || generatedResult;
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `copy-${(methodUsed || activeMethod).toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const deleteFromHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Supprimer cet élément de l'historique ?")) return;
    const res = await deleteCopyItem(id);
    if (res.success) {
      setHistory(prev => prev.filter((item) => item.id !== id));
    }
  };

  const systemInstruction = `
Tu es un expert en copywriting émotionnel optimisé pour Facebook et Instagram.
🎯 OBJECTIF PRINCIPAL
Générer un contenu persuasif, basé sur AIDA, PAS ou BAB , avec un ton motivant et accessible.
📌 RÈGLES D'ÉCRITURE  
- Tutoies le lecteur sauf si le prompt le demande.  
- Utilises beaucoup de verbes d’action et des métaphores simples.  
- Ajoute des emojis pertinents et rassures le lecteur à chaque obstacle.  
- Tu donnes des exemples concrets et tu termines par un CTA fort.  
📌 LONGUEUR DU TEXTE  
Le texte généré doit être entre ${textLength} mots.
📌 STYLE EXACT À IMITER 

[Tu crois encore qu’un site web est “optionnel” ?
Laisse-moi te poser une question simple :
Si demain quelqu’un entend parler de toi… il fait quoi ?
Il tape ton nom sur Google, mais rien venant de toi.

Donc toi tu développes ton activité mais tu laisses pas de trace en ligne.

👉 C’est comme avoir un restaurant sans enseigne.
👉 Ou une boutique sans vitrine.
---

Un site web, c’est un outil de conversion.
✔ Il travaille pour toi 24h/24
✔ Il transforme un simple visiteur en client

Pendant que toi, tu dors… lui, il vend.
---
Imagine une seconde qu'un client potentiel tombe sur ton site.
Il voit :
- Ce que tu proposes (clair et structuré) 👌
- Un bouton pour te contacter immédiatement 😍 

Tu viens de transformer une curiosité… en opportunité réelle.
---

Et c’est là que tout se joue.

Tu as donc besoin d’un système.
Un système qui :
- Attire
- Rassure
- Convertit
C’est là toute la différence entre
👉 “être présent en ligne”
et
👉 “gagner de l’argent grâce à internet”
---
Je vais être direct avec toi :
Si aujourd’hui tu n’as pas de site, tu laisses beaucoup d’argent sur la table.
---

Alors voici ce que je fais concrètement :
Je ne te crée pas juste un “beau site”.

Je crée un site qui :
- Met en valeur ton activité
- Et surtout… te génère des résultats
---
La vraie question, c’est :
👉 Combien de clients es-tu prêt à perdre avant de passer à l’action ?
---

Si tu veux passer au niveau supérieur, envoie-moi un message et on va construire quelque chose qui rapporte. ]
IMPORTANT  
Tu ne dois jamais copier les textes mot pour mot.  
Tu dois uniquement imiter la structure, le ton et l’énergie de tous les styles présentés ci-dessus.
`;

  const handleGenerate = async () => {
    if (!product) return alert("Veuillez décrire votre produit !");

    setIsGenerating(true);  
    setGeneratedResult("");

    const userPrompt = `Produit/Service : ${product}. Cible : ${target || "tout le monde"}. Objectif : ${objective}. Méthode : ${activeMethod}.`;

    try {
      const result = await generateCopywritingAction({
        systemInstruction,
        prompt: userPrompt,
        type: type,
      });

      if (!result.success || !result.dbItem) {
        throw new Error(result.error || "Erreur inconnue");
      }

      const cleaned = cleanFormat(result.text as string);
      setGeneratedResult(cleaned);

      const newItem: CopyHistoryItem = {
        id: result.dbItem.id,
        method: result.dbItem.method,
        product: result.dbItem.product,
        content: cleaned,
        date: new Date(result.dbItem.date).toLocaleString("fr-FR", {
          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
        })
      };
      setHistory(prev => [newItem, ...prev]);

    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (

  <div className="ia-page-container" style={{ width: "100%", overflowX: "hidden", paddingBottom: "10px" }}>

  {/* MODAL HISTORIQUE (Inchangé) */}
  {selectedHistory && (
    <div className="modal-overlay" onClick={() => setSelectedHistory(null)}>
      <div className="modal-content custom-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px", width: "90%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1px" }}>
          <h3>Copie - {selectedHistory.method}</h3>
          <button onClick={() => setSelectedHistory(null)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}>×</button>
        </div>
        <p style={{ fontSize: "13px", color: "#555", marginBottom: "0px" }}><strong>Produit :</strong> {selectedHistory.product}</p>
        <hr />
        <div style={{ maxHeight: "430px", overflowY: "auto", padding: "15px", whiteSpace: "pre-wrap", lineHeight: "1.7", fontSize: "0.95rem", background: "#f9f9f9", borderRadius: "8px" }}>
          {selectedHistory.content}
        </div>
        <div className="modal-actions" style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button className="btn-cancel" onClick={() => handleDownload(selectedHistory.content, selectedHistory.method)}>Télécharger</button>
          <button className="btn-submit" onClick={() => { handleCopy(selectedHistory.content); setSelectedHistory(null); }}>Copier & Fermer</button>
        </div>
      </div>
    </div>
  )}

  {/* CONTENEUR GRILLE PRINCIPALE */}
  <div style={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%" }}>
    
    {/* LIGNE DU HAUT : CONFIG + HISTORIQUE */}
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", 
      gap: "15px" 
    }}>
      
      {/* 1. Configuration Side */}
      <div className="ia-config-side" style={{ padding: "15px", background: "#fff", borderRadius: "12px", border: "1px solid #eee" }}>
        <div className="config-section">
          <h4>Type de copywriting</h4>
          <select className="ia-select" value={type} onChange={(e) => setType(e.target.value)}>
            <option>Page de vente</option>
            <option>Landing page</option>
            <option>Publicité Facebook</option>
            <option>Fiche produit</option>
          </select>
        </div>

        <div className="config-section">
          <h4>Méthode de copywriting</h4>
          <div className="method-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "4px" }}>
            {methods.map((method) => (
              <div key={method.id} className={`method-card ${activeMethod === method.id ? "active" : ""}`} onClick={() => setActiveMethod(method.id)} style={{ padding: "7px", cursor: "pointer" }}>
                <span className="method-title" style={{ fontSize: "0.9rem" }}>{method.title}</span>
                <span className="method-desc" style={{ fontSize: "0.65rem" }}>{method.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="config-section">
          <h4>Produit / Service</h4>
          <textarea className="ia-textarea" style={{ width: "100%" }} placeholder="Décrivez votre produit..." value={product} onChange={(e) => setProduct(e.target.value)} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "15px" }}>
          <div className="config-section">
            <h4>Cible</h4>
            <input type="text" className="ia-input" style={{ width: "100%" }} placeholder="Ex: Entrepreneurs..." value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
          <div className="config-section">
            <h4>Objectif</h4>
            <select className="ia-select" style={{ width: "100%" }} value={objective} onChange={(e) => setObjective(e.target.value)}>
              <option>Professionnel</option>
              <option>Persuasif</option>
              <option>Urgent</option>
            </select>
          </div>
        </div>

        <div className="config-section">
          <h4>Longueur du texte (mots)</h4>
          <select className="ia-select" value={textLength} onChange={(e) => setTextLength(e.target.value)}>
            <option value="100-200">100 - 200</option>
            <option value="200-300">200 - 300</option>
            <option value="300-400">300 - 400</option>
            <option value="500-700">500 - 700</option>
          </select>
        </div>

        <button className="btn-generate" onClick={handleGenerate} disabled={isGenerating} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", width: "100%", padding: "15px" }}>
          {isGenerating ? "Génération..." : <>Générer le copy <i className="fa-solid fa-coins"></i>5</>}
        </button>
      </div>

      {/* 2. SECTION HISTORIQUE */}
      <div style={{ padding: "15px", background: "#fff", borderRadius: "12px", border: "1px solid #eee", maxHeight: "400px", overflowY: "auto" }}>
        <h4 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <i className="fa-solid fa-clock-rotate-left"></i> Historique
        </h4>
        {history.length === 0 ? (
          <p style={{ color: "#999", fontStyle: "italic", textAlign: "center", padding: "20px" }}>Aucun texte sauvegardé.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {history.map((item) => (
              <div key={item.id} onClick={() => setSelectedHistory(item)} style={{ background: "#fcfcfc", padding: "12px", borderRadius: "10px", border: "1px solid #f0f0f0", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "9px", fontWeight: "bold", background: "#000", color: "#fff", padding: "2px 8px", borderRadius: "4px" }}>{item.method}</span>
                  <button onClick={(e) => deleteFromHistory(item.id, e)} style={{ background: "none", border: "none", color: "#ff4d4d", cursor: "pointer" }}>
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
                <p style={{ fontSize: "13px", fontWeight: "700", margin: "0", color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.product}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>

    {/* LIGNE DU BAS : RÉSULTAT */}
    <div className="ia-result-side" style={{ width: "100%" }}>
      <div className="result-card" style={{ padding: "20px", background: "#fff", borderRadius: "12px", border: "1px solid #eee", minHeight: "300px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #f5f5f5", paddingBottom: "15px" }}>
          <h4 style={{ margin: 0 }}>Texte généré</h4>
          {generatedResult && (
            <button onClick={() => handleCopy()} style={{ background: "#f0fdf4", border: "none", color: "#10B981", padding: "8px 15px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
               {isCopied ? "Copié" : "Copier"}
            </button>
          )}
        </div>
        <div style={{ flex: 1 }}>
          {generatedResult ? (
            <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.8", color: "#333", fontSize: "0.95rem" }}>{generatedResult}</div>
          ) : (
            <div style={{ textAlign: "center", marginTop: "40px", color: "#999" }}>
              <i className="fa-solid fa-pen-nib" style={{ fontSize: "30px", marginBottom: "10px", display: "block", opacity: 0.2 }}></i>
              <p style={{ fontSize: "14px" }}>Le résultat de votre génération s'affichera ici.</p>
            </div>
          )}
        </div>
      </div>
    </div> <br /> <br /> <br /> 
  </div>
</div>
  );
}
export interface Prestation {
  description: string;
  prixUnitaire: number;
  quantite: number;
}

export interface Facture {
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
  senderLogo?: string; // Ajouté pour recevoir l'image/logo de l'utilisateur
  paymentMethod?: string;
  tvaRate: number; 
  prestations: Prestation[];
  devise: string;
  date: string;
  echeance: string;
  status: string; 
}

export const templateConfigs: Record<string, { border: string; bg: string; table: string }> = {
  bleu: { border: '#a5d1f0', bg: '#eef3f7', table: '#a5d1f0' },
  rose: { border: '#FA5D89', bg: '#FEF7EC', table: '#FA5D89' },
  violet: { border: '#D09EE7', bg: '#f5f3ff', table: '#D09EE7' },
  vert: { border: '#10b981', bg: '#f0fdf4', table: '#10b981' },
  orange: { border: '#eab308', bg: '#fffbeb', table: '#eab308' },
  gris: { border: '#808283', bg: '#f0fbfc', table: '#808283' },
};

const calculateTotalHT = (prestations: Prestation[]) => {
  return prestations.reduce((acc, curr) => acc + (curr.prixUnitaire * curr.quantite), 0);
};

export const getInvoiceHTML = (item: Facture, colors: { border: string; bg: string; table: string }, layout: string) => {
  const totalHT = calculateTotalHT(item.prestations);
  const montantTVA = totalHT * (item.tvaRate / 100); 
  const totalTTC = totalHT + montantTVA;

  // --- MODÈLE : INDY (Basé sur le modèle Moderne avec Logo) ---

  if (layout === 'indy') {
    return `
    <div style="padding: 50px 40px; font-family: 'Roboto', sans-serif; color: #000; min-height: 1130px; position: relative; background: #fffdf9; box-sizing: border-box;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
        <div style="display: flex; align-items: center; gap: 20px; flex: 1;">
          ${item.senderLogo ? `
            <img src="${item.senderLogo}" alt="Logo" style="width: 70px; height: 70px; object-fit: cover; border-radius: 50%; border: 2px solid #ddd;" />
          ` : `
            <div style="width: 70px; height: 70px; border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #aaa; font-weight: bold;">LOGO</div>
          `}
          <div>
            <h2 style="font-family: 'Antonio', sans-serif; font-size: 20px; font-weight: 800; margin: 0; color: #000;">${(item.senderNom || "PichFlow Service").toUpperCase()}</h2>
            <p style="font-size: 13px; margin-top: 5px; color: #000; line-height: 1.5;">
               ${item.senderAdresse}<br>
            ${item.senderContact}
            ${item.senderIfu ? `<br>${item.senderIfu}` : ''}
            ${item.senderAutre ? `<br>${item.senderAutre}` : ''}
            </p>
          </div>
        </div>
        <div style="flex: 1; text-align: right;">
          <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase;">Client</p>
          <h2 style="font-family: 'Antonio', sans-serif; font-size: 20px; font-weight: 800; margin: 0; color: #000;">${item.client.toUpperCase()}</h2>
          <p style="font-size: 13px; margin-top: 5px; color: #444; line-height: 1.5;">${item.clientAdresse}<br>${item.clientContact}</p>
        </div>
      </div> 

      <div style="margin-bottom: 40px;">
        <h1 style="font-family: 'Antonio', sans-serif; font-size: 24px; font-weight: 800; color: #000; margin: 0; letter-spacing: -1px;">Facture n° ${item.id}</h1>
        <div style="display: flex; gap: 20px; margin-top: 15px; font-size: 13px; color: #000; border-bottom: 1px solid #eee; padding-bottom: 15px;">
           <span>Émise le : <strong>${item.date}</strong></span><span>Échéance : <strong>${item.echeance}</strong></span>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background: ${colors.table}; color: #fff;">
            <th style="font-family: 'Antonio', sans-serif; text-align: left; padding: 15px 10px; font-size: 12px; text-transform: uppercase;">Libellé / Description</th>
            <th style="font-family: 'Antonio', sans-serif; text-align: center; padding: 15px 10px; font-size: 12px; text-transform: uppercase; width: 80px;">Qté</th>
            <th style="font-family: 'Antonio', sans-serif; text-align: right; padding: 15px 10px; font-size: 12px; text-transform: uppercase; width: 140px;">PU HT</th>
            <th style="font-family: 'Antonio', sans-serif; text-align: right; padding: 15px 10px; font-size: 12px; text-transform: uppercase; width: 140px;">Total HT</th>
          </tr>
        </thead>
        <tbody>
          ${item.prestations.map((p) => `
            <tr style="border-bottom: 1px solid #000;">
              <td style="padding: 12px 5px;"><div style="font-weight: 500; font-size: 14px;">${p.description}</div></td>
              <td style="padding: 12px 5px; text-align: center; font-size: 14px;">${p.quantite}</td>
              <td style="padding: 12px 5px; text-align: right; font-size: 14px;">${p.prixUnitaire.toLocaleString()} ${item.devise}</td>
              <td style="padding: 12px 5px; text-align: right; font-weight: 500; font-size: 14px;">${(p.prixUnitaire * p.quantite).toLocaleString()} ${item.devise}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      

      <div style="margin-left: auto; width: 320px; margin-bottom: 40px;">
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #000;"><span style="color:#666">Total HT</span><span>${totalHT.toLocaleString()} ${item.devise}</span></div>
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 2px solid #000;"><span style="color:#666">TVA (${item.tvaRate}%)</span><span>${montantTVA.toLocaleString()} ${item.devise}</span></div>
        <div style="display: flex; justify-content: space-between; padding: 20px 0;"><span style="font-family:'Roboto'; font-size:16px; font-weight:700;">TOTAL TTC</span><span style="font-size:16px; font-weight:700;">${totalTTC.toLocaleString()} ${item.devise}</span></div>
      </div>


      <div style="display: flex; gap: 20px; margin-top: 15px; font-size: 13px; color: #000; border-bottom: 1px solid #eee; padding-bottom: 15px;">
           <span>à payer avant le: <strong>${item.echeance}</strong></span>
        </div>

      <div style="position: absolute; bottom: 50px; left: 40px; width: calc(100% - 80px); font-size: 11px; color: #000; border-top: 1px solid #eee; padding-top: 20px;">
        <p style="margin: 0 0 10px 0;">La facture devra être payée automatiquement ou dans les 30 jours à compter de la réalisation de la prestation ou de la réception de la marchandise.</p>
        
        ${item.paymentMethod ? `
          <div style="background: rgba(0,0,0,0.02); border: 1px solid #eaeaea; padding: 10px; border-radius: 4px; margin-bottom: 10px;">
            <strong style="color: #000; display: block; margin-bottom: 2px;">Méthode de paiement :</strong>
            <span style="color: #000;">${item.paymentMethod}</span>
          </div>
        ` : `
          <p style="margin-top: 5px; font-weight: 500;">Méthode de paiement acceptée : Chèque, Espèces, Virement bancaire.</p>
        `}

        <div style="display: flex; justify-content: space-between; margin-top: 15px; align-items: center;">
          <span>${item.senderIfu ? ` ${item.senderIfu}` : ''}</span>
          <span style="font-family:'Antonio'; font-weight:800; color: #000;"> • Facture n° ${item.id}</span>
        </div>
      </div>
    </div>`;
  }

  // --- MODÈLE : MODERNE ---
  if (layout === 'moderne') {
    return `
    <div style="padding: 50px 40px; font-family: 'Roboto', sans-serif; color: #000;  min-height: 1130px; position: relative; background: ${colors.bg};">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
        <div style="flex: 1;">
          <h2 style="font-family: 'Antonio', sans-serif; font-size: 20px; font-weight: 800; margin: 0; color: #000;">${(item.senderNom || "PichFlow Service").toUpperCase()}</h2>
          <p style="font-size: 13px; margin-top: 8px; color: #000; line-height: 1.5;">
            ${item.senderAdresse}<br>${item.senderContact}${item.senderIfu ? `<br>IFU : ${item.senderIfu}` : ''}${item.senderAutre ? `<br>${item.senderAutre}` : ''}
          </p>
        </div>
        <div style="flex: 1; text-align: right;">
          <p>Client</p>
          <h2 style="font-family: 'Antonio', sans-serif; font-size: 20px; font-weight: 800; margin: 0; color: #000;">${item.client.toUpperCase()}</h2>
          <p style="font-size: 13px; margin-top: 8px; color: #000; line-height: 1.5;">${item.clientAdresse}<br>${item.clientContact}</p>
        </div>
      </div> 
      <div style="margin-bottom: 40px;">
        <h1 style="font-family: 'Antonio', sans-serif; font-size: 18px; font-weight: 800; color: #000; margin: 0; letter-spacing: -1px;">Facture n° ${item.id}</h1>
        <div style="display: flex; gap: 20px; margin-top: 15px; font-size: 13px; color: #000;">
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
            <tr style="border-bottom: 1px solid #000;">
              <td style="padding: 10px 5px;"><div style="font-weight: 500; font-size: 14px;">${p.description}</div></td>
              <td style="padding: 10px 5px; text-align: center; font-size: 14px;">${p.quantite}</td>
              <td style="padding: 10px 5px; text-align: right; font-size: 14px;">${p.prixUnitaire.toLocaleString()} ${item.devise}</td>
              <td style="padding: 10px 5px; text-align: right; font-weight: 500; font-size: 14px;">${(p.prixUnitaire * p.quantite).toLocaleString()} ${item.devise}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      <div style="margin-left: auto; width: 320px;">
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #000;"><span style="color:#666">Total HT</span><span>${totalHT.toLocaleString()} ${item.devise}</span></div>
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 2px solid #000;"><span style="color:#666">TVA</span><span>${montantTVA.toLocaleString()} ${item.devise}</span></div>
        <div style="display: flex; justify-content: space-between; padding: 20px 0;"><span style="font-family:'Roboto'; font-size:16px; font-weight:700;">TOTAL TTC</span><span style="font-size:16px; font-weight:700;">${totalTTC.toLocaleString()} ${item.devise}</span></div>
      </div>
      <div style="position: absolute; bottom: 60px; left: 50px; width: calc(100% - 100px); font-size: 11px; color: #000; border-top: 1px solid #eee; padding-top: 20px;">
        <p>La facture devra être payée automatiquement ou dans les 30 jours à compter de la réalisation de la prestation ou de la réception de la marchandise.</p>
        <p style="margin-top: 5px; font-weight: 500;">Méthode de paiement acceptée : Chèque, Espèces, Virement bancaire.</p>
        <div style="display: flex; justify-content: space-between; margin-top: 10px;">
          <span>${item.senderIfu ? `${item.senderIfu}` : ''}</span>
          <span style="font-family:'Antonio'; font-weight:800;">Facture n° ${item.id}</span>
        </div>
      </div>
    </div>`;
  }

  // --- MODÈLE PAR DÉFAUT : CLASSIQUE ---
  return `
    <div style="padding: 50px; font-family: 'Roboto', sans-serif; color: #000; border-left: 15px solid ${colors.border}; min-height: 1130px; position: relative; background: ${colors.bg};">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
        <div>
          <h2 style="font-family: 'Antonio', sans-serif; font-size: 22px; font-weight: 800; margin: 0; color: #000;">${(item.senderNom || "PichFlow Service").toUpperCase()}</h2>
          <p style="font-size: 12px; margin-top: 5px; color: #000; line-height: 1.4;">
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
          <p style="font-size: 10px; font-weight: 700;  margin-bottom: 8px; color: #000; ">Dates</p>
          <p style="font-size: 13px; margin: 0;">Date de création : ${item.date}</p>
          <p style="font-size: 13px; margin: 5px 0 0 0;">Echéance : ${item.echeance}</p>
        </div>
        <div style="flex: 1; border: 1.5px solid #e9edf0; text-align: right; padding: 15px; padding-right: 3px; border-radius: 2px; background: #ffffff55;">
          <p style="font-size: 10px; font-weight: 700; margin-bottom: 8px; color: #000; ">Destinataire</p>
          <p style="font-size: 15px; font-weight: 800; margin: 0;">${item.client.toUpperCase()}</p>
          <p style="font-size: 12px; margin-top: 5px; color: #000;">${item.clientContact}<br>${item.clientAdresse}</p>
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
          <span style="font-size: 13px; color: #000;">Total HT</span>
          <span style="font-size: 13px; font-weight: 800;">${totalHT.toLocaleString()} ${item.devise}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #eceaea;">
          <span style="font-size: 13px; color: #000;">TVA</span>
          <span style="font-size: 13px; font-weight: 800;">${montantTVA.toLocaleString()} ${item.devise}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 15px 12px; background: #313030; color: #fff;">
          <span style="font-family: 'Antonio', sans-serif; font-size: 14px; font-weight: bold; text-transform: uppercase;">Total TTC </span>
          <span style="font-size: 18px; font-weight: 900;">${totalTTC.toLocaleString()} ${item.devise}</span>
        </div>
      </div>
 
      <div style="position: absolute; bottom: 40px; left: 50px; width: calc(100% - 100px);">
        <div style="font-size: 11px; color: #000; line-height: 1.6; margin-bottom: 25px; max-width: 80%;">
          <p style="margin: 0 0 5px 0;">La facture devra être payée automatiquement le jous défini par le prestataire ou dans les 30 jours à compter de la réalisation de la prestation ou de la réception de la marchandise.</p>
          <p style="margin: 0; font-weight: 500;">Méthode de paiement : Espèces, Chèque ou Virement bancaire.</p>
        </div>
        <div style="text-align: center; border-top: 1px solid #e0e0e0; padding-top: 20px;">
           <p style="font-style: italic; font-size: 13px; color: #000; font-weight: 600; margin: 0;">Merci pour votre confiance !</p>
        </div>
      </div> 
    </div>`;
};
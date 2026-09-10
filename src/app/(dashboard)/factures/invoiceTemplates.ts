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
  senderEmail?: string;
  senderIfu?: string;
  senderAutre?: string;
  senderLogo?: string;
  paymentMethod?: string;
  tvaRate: number; 
  prestations: Prestation[];
  devise: string;
  date: string;
  echeance: string;
  status: string; 
  emcfUid?: string;
  emcfQrCode?: string;
  emcfCounter?: string;
  emcfCodeDgi?: string;
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

  // Bloc e-MCF sécurisé (DGI Bénin) mis en forme selon les standards officiels constatés
  const emcfSection = `
    <div style="margin-top: 30px; padding: 15px; background: ${colors.bg}; border: 1px solid ${colors.border}; border-radius: 6px; page-break-inside: avoid;">
      <div style="text-align: center; font-size: 10px; font-weight: bold; text-transform: uppercase; color: #475569; margin-bottom: 10px; letter-spacing: 0.5px;">
        — ÉLÉMENTS DE SÉCURITÉ DE LA FACTURE NORMALISÉE —
      </div>
      <div style="display: flex; align-items: center; gap: 20px;">
        ${item.emcfQrCode ? `<img src="${item.emcfQrCode}" alt="QR Code e-MCF" style="width: 90px; height: 90px; object-fit: contain; background: #fff; padding: 4px; border-radius: 4px; border: 1px solid #cbd5e1;" />` : '<div style="width: 90px; height: 90px; background: #fff; border: 1px solid #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #94a3b8;">QR CODE</div>'}
        <div style="font-size: 11px; color: #1e293b; line-height: 1.5; flex: 1;">
          <div style="text-align: center; margin-bottom: 4px;">
            <span style="font-size: 10px; color: #475569; display: block;">Code MECeF/DGI</span>
            <span style="font-family: monospace; font-weight: bold; font-size: 11px; color: #0f172a;">${item.emcfCodeDgi || 'NON CERTIFIÉ'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 4px;">
            <span><strong>MECeF NIM:</strong></span>
            <span style="font-family: monospace; font-weight: bold;">${item.emcfUid || 'N/A'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span><strong>MECeF Compteurs:</strong></span>
            <span>${item.emcfCounter || 'N/A'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span><strong>MECeF Heure:</strong></span>
            <span>${item.date}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // --- MODÈLE : PROFESSIONNEL ---
  if (layout === 'professionel') {
    return `
    <div style="padding: 40px; font-family: 'Roboto', sans-serif; color: #1e293b; min-height: 1130px; position: relative; background: #fff; box-sizing: border-box;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 3px solid ${colors.border}; padding-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
          ${item.senderLogo ? `<img src="${item.senderLogo}" alt="Logo" style="width: 70px; height: 70px; object-fit: cover; border-radius: 50%; border: 2px solid ${colors.border};" />` : ''}
          <div>
            <h2 style="font-size: 18px; font-weight: 800; margin: 0; color: #0f172a;">${(item.senderNom || "").toUpperCase()}</h2>
            <p style="font-size: 11px; margin-top: 4px; color: #475569; line-height: 1.4;">
               ${item.senderAdresse || ''}<br>
               ${item.senderContact || ''}
               ${item.senderIfu ? `<br><strong>IFU :</strong> ${item.senderIfu}` : ''}
            </p>
          </div>
        </div>
        <div style="text-align: right; background: ${colors.bg}; padding: 15px; border-radius: 8px; border-left: 4px solid ${colors.border};">
          <h2 style="font-size: 16px; font-weight: 800; margin: 0; color: #0f172a;">FACTURE DE VENTE</h2>
          <p style="font-size: 12px; margin: 4px 0; font-weight: bold; color: #334155;"># ${item.id}</p>
          <p style="font-size: 11px; color: #64748b; margin: 0;">Date : ${item.date}</p>
        </div>
      </div> 

      <div style="display: flex; justify-content: space-between; margin-bottom: 25px; gap: 20px;">
        <div style="flex: 1; border: 1px solid #cbd5e1; padding: 12px; font-size: 11px; border-radius: 6px; background: #f8fafc;">
          <div style="font-weight: bold; margin-bottom: 6px; text-transform: uppercase; color: #475569; font-size: 10px; letter-spacing: 0.5px;">Informations Émetteur</div>
          <div><strong>Adresse :</strong> ${item.senderAdresse || 'N/A'}</div>
          <div><strong>Contact :</strong> ${item.senderContact || 'N/A'}</div>
          <div><strong>Email :</strong> ${item.senderEmail || 'N/A'}</div>
        </div>
        <div style="flex: 1; border: 1px solid ${colors.border}; padding: 0; font-size: 11px; border-radius: 6px; overflow: hidden;">
          <div style="background: ${colors.border}; color: #0f172a; padding: 6px 10px; font-weight: bold; text-transform: uppercase; font-size: 10px;">Client</div>
          <div style="padding: 10px; background: #fff;">
            <div><strong>Nom :</strong> ${item.client.toUpperCase()}</div>
            <div><strong>Adresse :</strong> ${item.clientAdresse || 'N/A'}</div>
            <div><strong>Contact :</strong> ${item.clientContact || 'N/A'}</div>
          </div>
        </div>
      </div> 

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background: ${colors.table}; color: #0f172a; border-top: 1px solid #000; border-bottom: 1px solid #000;">
            <th style="text-align: left; padding: 10px; font-size: 11px; width: 30px;">#</th>
            <th style="text-align: left; padding: 10px; font-size: 11px;">Désignation</th>
            <th style="text-align: right; padding: 10px; font-size: 11px; width: 100px;">Prix U.</th>
            <th style="text-align: center; padding: 10px; font-size: 11px; width: 70px;">Qté</th>
            <th style="text-align: right; padding: 10px; font-size: 11px; width: 120px;">Total TTC</th>
          </tr>
        </thead>
        <tbody>
          ${item.prestations.map((p, idx) => `
            <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#fff' : '#f8fafc'};">
              <td style="padding: 10px; font-size: 11px; color: #64748b;">${idx + 1}</td>
              <td style="padding: 10px; font-size: 11px; font-weight: 500;">${p.description}</td>
              <td style="padding: 10px; text-align: right; font-size: 11px;">${p.prixUnitaire.toLocaleString()}</td>
              <td style="padding: 10px; text-align: center; font-size: 11px;">${p.quantite}</td>
              <td style="padding: 10px; text-align: right; font-size: 11px; font-weight: bold;">${(p.prixUnitaire * p.quantite).toLocaleString()} ${item.devise}</td>
            </tr>`).join('')}
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end; margin-bottom: 25px;">
        <div style="width: 250px; background: ${colors.bg}; padding: 15px; border-radius: 6px; border: 1px solid ${colors.border};">
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
            <span>Total HT :</span>
            <span>${totalHT.toLocaleString()} ${item.devise}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
            <span>TVA (${item.tvaRate}%) :</span>
            <span>${montantTVA.toLocaleString()} ${item.devise}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; border-top: 2px solid ${colors.border}; padding-top: 8px; color: #0f172a;">
            <span>NET À PAYER :</span>
            <span>${totalTTC.toLocaleString()} ${item.devise}</span>
          </div>
        </div>
      </div>

      ${emcfSection}
    </div>`;
  }

  // --- MODÈLE : MODERNE ---
  if (layout === 'moderne') {
    return `
    <div style="padding: 40px; font-family: 'Roboto', sans-serif; color: #1e293b; min-height: 1130px; position: relative; background: #fff;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #0f172a; padding-bottom: 20px;">
        <div>
          <h2 style="font-size: 20px; font-weight: 900; margin: 0; color: #0f172a; letter-spacing: -0.5px;">${(item.senderNom || "").toUpperCase()}</h2>
          <p style="font-size: 11px; margin-top: 6px; color: #64748b; line-height: 1.4;">
            ${item.senderAdresse || ''}<br>
            <strong>IFU :</strong> ${item.senderIfu || 'N/A'}
          </p>
        </div>
        <div style="text-align: right;">
          <span style="background: #0f172a; color: #fff; padding: 4px 10px; font-size: 10px; font-weight: bold; text-transform: uppercase; border-radius: 4px;">Facture</span>
          <h2 style="font-size: 16px; font-weight: 800; margin: 5px 0 0 0; color: #0f172a;"># ${item.id}</h2>
          <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0;">Date : ${item.date}</p>
        </div>
      </div> 

      <div style="margin-bottom: 25px; background: ${colors.bg}; padding: 15px; border-radius: 8px; border-left: 4px solid ${colors.border}; font-size: 11px;">
        <strong style="text-transform: uppercase; color: #475569; font-size: 10px; display: block; margin-bottom: 4px;">Facturé à :</strong>
        <div style="font-size: 13px; font-weight: bold; color: #0f172a;">${item.client.toUpperCase()}</div>
        <div>${item.clientAdresse || ''}</div>
        <div>${item.clientContact || ''}</div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px;">
        <thead>
          <tr style="background: #0f172a; color: #fff;">
            <th style="text-align: left; padding: 10px; border-top-left-radius: 6px; border-bottom-left-radius: 6px;">Description</th>
            <th style="text-align: center; padding: 10px; width: 60px;">Qté</th>
            <th style="text-align: right; padding: 10px; width: 100px;">PU</th>
            <th style="text-align: right; padding: 10px; width: 110px; border-top-right-radius: 6px; border-bottom-right-radius: 6px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${item.prestations.map((p, idx) => `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px; font-weight: 500;">${p.description}</td>
              <td style="text-align: center; padding: 10px; color: #64748b;">${p.quantite}</td>
              <td style="text-align: right; padding: 10px; color: #64748b;">${p.prixUnitaire.toLocaleString()}</td>
              <td style="text-align: right; padding: 10px; font-weight: bold; color: #0f172a;">${(p.prixUnitaire * p.quantite).toLocaleString()}</td>
            </tr>`).join('')}
        </tbody>
      </table>

      <div style="text-align: right; font-size: 13px; margin-bottom: 25px; padding: 10px; background: #f8fafc; border-radius: 6px;">
        <span style="color: #64748b;">Total TTC : </span>
        <strong style="font-size: 15px; color: #0f172a;">${totalTTC.toLocaleString()} ${item.devise}</strong>
      </div>

      ${emcfSection}
    </div>`;
  }

  // --- MODÈLE : MINIMALISTE ---
  else if (layout === 'minimaliste') {
    return `
    <div style="padding: 40px; font-family: 'Helvetica', sans-serif; color: #111; min-height: 1130px; position: relative; background: #fff;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px;">
        <div>
          <h2 style="font-size: 16px; font-weight: 700; margin: 0; letter-spacing: 1px;">${(item.senderNom || "").toUpperCase()}</h2>
          <p style="font-size: 10px; color: #6b7280; margin-top: 4px;">IFU : ${item.senderIfu || 'N/A'}</p>
        </div>
        <div style="text-align: right;">
          <h1 style="font-size: 22px; font-weight: 200; margin: 0; letter-spacing: 2px; color: #111;">FACTURE</h1>
          <p style="font-size: 11px; color: #6b7280; margin: 2px 0 0 0;"># ${item.id}</p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 11px;">
        <thead>
          <tr style="border-bottom: 2px solid #111; color: #111;">
            <th style="text-align: left; padding: 8px 0; font-weight: 600;">Description</th>
            <th style="text-align: center; padding: 8px 0; font-weight: 600;">Qté</th>
            <th style="text-align: right; padding: 8px 0; font-weight: 600;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${item.prestations.map((p) => `
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; color: #374151;">${p.description}</td>
              <td style="text-align: center; padding: 10px 0; color: #6b7280;">${p.quantite}</td>
              <td style="text-align: right; padding: 10px 0; font-weight: 500; color: #111;">${(p.prixUnitaire * p.quantite).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="text-align: right; font-size: 14px; font-weight: bold; margin-bottom: 30px; color: #111;">
        Total : ${totalTTC.toLocaleString()} ${item.devise}
      </div>

      ${emcfSection}
    </div>`;
  }
  
  // --- MODÈLE : CLASSIQUE (PAR DÉFAUT) ---
  return `
    <div style="padding: 40px; font-family: 'Roboto', sans-serif; color: #000; min-height: 1130px; position: relative; background: #fff; box-sizing: border-box;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; border-bottom: 2px solid #333; padding-bottom: 15px;">
        <div>
          <h2 style="font-size: 16px; font-weight: 800; margin: 0;">${(item.senderNom || "").toUpperCase()}</h2>
          <p style="font-size: 11px; margin-top: 3px; color: #555;">IFU : ${item.senderIfu || 'N/A'}</p>
        </div>
        <div style="text-align: right;">
          <h2 style="font-size: 16px; font-weight: 800; margin: 0;">FACTURE DE VENTE</h2>
          <p style="font-size: 11px; margin: 2px 0; font-weight: bold;">Facture # ${item.id}</p>
          <p style="font-size: 11px; color: #555; margin: 0;">Date : ${item.date}</p>
        </div>
      </div> 

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
        <thead>
          <tr style="border-bottom: 1px solid #000; border-top: 1px solid #000; background: #f8fafc;">
            <th style="text-align: left; padding: 8px;">Libellé / Description</th>
            <th style="text-align: right; padding: 8px;">Prix Unitaire</th>
            <th style="text-align: center; padding: 8px;">Qté</th>
            <th style="text-align: right; padding: 8px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${item.prestations.map((p) => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px;">${p.description}</td>
              <td style="text-align: right; padding: 8px;">${p.prixUnitaire.toLocaleString()}</td>
              <td style="text-align: center; padding: 8px;">${p.quantite}</td>
              <td style="text-align: right; padding: 8px; font-weight: bold;">${(p.prixUnitaire * p.quantite).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="text-align: right; font-size: 13px; font-weight: bold; margin-bottom: 20px;">
        NET A PAYER : ${totalTTC.toLocaleString()} ${item.devise}
      </div>

      ${emcfSection}
    </div>`;
};
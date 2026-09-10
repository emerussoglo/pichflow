// lib/emcf.ts
"use server";

const EMCF_BASE_URL = "https://developper.impots.bj/sygmef-emcf/api";

export async function processEmcfInvoice(invoiceData: {
  ifu: string;
  type: string; // ex: "FV"
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    taxGroup: string;
  }>;
  operatorName: string;
  client?: {
    ifu?: string;
    name?: string;
    address?: string;
    contact?: string;
  };
}) {
  try {
    const token = process.env.EMCF_API_TOKEN;
    if (!token) {
      return {
        success: false,
        error: "Token e-MCF manquant dans les variables d'environnement.",
      };
    }

    const requestPayload: any = {
      ifu: invoiceData.ifu,
      aib: "A",
      type: invoiceData.type || "FV",
      items: invoiceData.items.map((item) => ({
        name: String(item.name),
        price: Number(item.price),
        quantity: Number(item.quantity),
        taxGroup: String(item.taxGroup || "B"),
      })),
      operator: {
        name: String(invoiceData.operatorName || "PichFlow"),
      },
      payment: [
        {
          name: "ESPECES",
          amount: invoiceData.items.reduce(
            (sum, item) =>
              sum + Math.round(Number(item.price) * Number(item.quantity)),
            0,
          ),
        },
      ],
      reference: `PICHFLOW-${Date.now()}`,
    };

    if (invoiceData.client && invoiceData.client.ifu) {
      requestPayload.client = {
        ifu: invoiceData.client.ifu,
        name: invoiceData.client.name || "",
        address: invoiceData.client.address || "",
        contact: invoiceData.client.contact || "",
      };
    }

    // 1. POST : Créer le brouillon de facture (InvoiceRequestDto -> InvoiceResponseDto)
    const postRes = await fetch(`${EMCF_BASE_URL}/invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestPayload),
    });

    const postText = await postRes.text();
    if (!postRes.ok) {
      return {
        success: false,
        error: `Erreur POST e-MCF (${postRes.status}): ${postText}`,
      };
    }

    const postData = JSON.parse(postText);
    const uid = postData.uid;
    if (!uid) {
      return {
        success: false,
        error: "UID e-MCF introuvable dans la réponse.",
      };
    }

    // 2. GET : Récupérer les détails de la facture (InvoiceDetailsDto)
    const getRes = await fetch(`${EMCF_BASE_URL}/invoice/${uid}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const getText = await getRes.text();
    const invoiceDetails = getRes.ok && getText ? JSON.parse(getText) : {};

    // 3. PUT : Confirmer / Finaliser la facture (SecurityElementsDto)
    const putRes = await fetch(`${EMCF_BASE_URL}/invoice/${uid}/confirm`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const putText = await putRes.text();
    if (!putRes.ok) {
      return {
        success: false,
        error: `Erreur confirmation e-MCF (${putRes.status}): ${putText}`,
      };
    }

    const confirmData = putText ? JSON.parse(putText) : {};
    const merged = { ...invoiceDetails, ...confirmData };

    const normalizeText = (value: unknown): string => {
      if (typeof value === "string") return value.trim();
      if (value == null) return "";
      return String(value).trim();
    };

    const normalizeQrCode = (value: unknown): string => {
      const raw = normalizeText(value);
      if (!raw) return "";
      if (raw.startsWith("data:image")) return raw;
      if (/^https?:\/\//i.test(raw)) return raw;
      if (/^[A-Za-z0-9+/=]+$/.test(raw)) return `data:image/png;base64,${raw}`;
      return raw;
    };

    const codeDgi = normalizeText(
      merged.codeMECeFDGI ??
        merged.code ??
        merged.securityCode ??
        merged.codeDgi ??
        merged.codeMECeF ??
        "",
    );
    const counter = normalizeText(
      merged.counters ??
        merged.counter ??
        merged.compteurs ??
        merged.countersText ??
        "",
    );
    const nim = normalizeText(
      merged.nim ?? merged.nimDgi ?? merged.emcfNim ?? "",
    );
    const qrCode = normalizeQrCode(
      merged.qrCode ?? merged.qr ?? merged.qrCodeImage ?? "",
    );

    if (!codeDgi) {
      return {
        success: false,
        error: "La DGI n'a pas retourné de code MECeF/DGI valide.",
      };
    }

    return {
      success: true,
      uid,
      codeDgi,
      counter,
      nim,
      qrCode,
    };
  } catch (error: any) {
    console.error("Erreur technique e-MCF:", error);
    return {
      success: false,
      error: error.message || "Erreur de communication avec l'API e-MCF",
    };
  }
}

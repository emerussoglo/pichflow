import fs from "node:fs";

const baseUrl = "https://developper.impots.bj/sygmef-emcf/api";
const token = process.env.EMCF_API_TOKEN;

if (!token) {
  console.error(
    "Missing EMCF_API_TOKEN env var. Example: EMCF_API_TOKEN=... node scripts/test-emcf-normalization.mjs",
  );
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // keep raw text if not JSON
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
    raw: text,
  };
}

function normalizeText(value) {
  if (typeof value === "string") return value.trim();
  if (value == null) return "";
  return String(value).trim();
}

function normalizeQrCode(value) {
  const raw = normalizeText(value);
  if (!raw) return "";
  if (raw.startsWith("data:image")) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^[A-Za-z0-9+/=]+$/.test(raw)) return `data:image/png;base64,${raw}`;
  return raw;
}

async function main() {
  const ifu = process.env.EMCF_IFU || "XXXXXXXXXXXXX";

  const infoStatus = await requestJson(`${baseUrl}/info/status`);
  console.log("\n[1] GET /api/info/status");
  console.log(JSON.stringify(infoStatus.data, null, 2));

  const invoiceStatus = await requestJson(`${baseUrl}/invoice`);
  console.log("\n[2] GET /api/invoice");
  console.log(JSON.stringify(invoiceStatus.data, null, 2));

  const invoiceRequest = {
    ifu,
    aib: "A",
    type: "FV",
    items: [
      {
        name: "Jus d'orange",
        price: 1800,
        quantity: 2,
        taxGroup: "B",
      },
      {
        name: "Article exonéré",
        price: 600,
        quantity: 2.5,
        taxGroup: "A",
      },
    ],
    operator: {
      name: "Test",
    },
    payment: [
      {
        name: "ESPECES",
        amount: 6000,
      },
    ],
    reference: `PICHFLOW-TEST-${Date.now()}`,
  };

  console.log("\n[3] POST /api/invoice");
  console.log("Request payload:", JSON.stringify(invoiceRequest, null, 2));

  const postResponse = await requestJson(`${baseUrl}/invoice`, {
    method: "POST",
    body: JSON.stringify(invoiceRequest),
  });

  console.log("HTTP status:", postResponse.status);
  console.log("Response:", JSON.stringify(postResponse.data, null, 2));

  if (!postResponse.ok || !postResponse.data?.uid) {
    console.error("\nPOST failed. Check token, IFU, or API availability.");
    console.error(postResponse.raw);
    process.exit(1);
  }

  const uid = postResponse.data.uid;

  console.log(`\n[4] GET /api/invoice/${uid}`);
  const detailsResponse = await requestJson(`${baseUrl}/invoice/${uid}`);
  console.log(JSON.stringify(detailsResponse.data, null, 2));

  console.log(`\n[5] PUT /api/invoice/${uid}/confirm`);
  const confirmResponse = await requestJson(
    `${baseUrl}/invoice/${uid}/confirm`,
    {
      method: "PUT",
    },
  );
  console.log(JSON.stringify(confirmResponse.data, null, 2));

  const merged = {
    ...(detailsResponse.data || {}),
    ...(confirmResponse.data || {}),
  };

  const normalized = {
    codeMECeFDGI: normalizeText(
      merged.codeMECeFDGI ??
        merged.code ??
        merged.securityCode ??
        merged.codeDgi ??
        merged.codeMECeF ??
        "",
    ),
    nim: normalizeText(merged.nim ?? merged.nimDgi ?? merged.emcfNim ?? ""),
    counters: normalizeText(
      merged.counters ??
        merged.counter ??
        merged.compteurs ??
        merged.countersText ??
        "",
    ),
    qrCode: normalizeQrCode(
      merged.qrCode ?? merged.qr ?? merged.qrCodeImage ?? "",
    ),
    hasQrDataUri: normalizeQrCode(
      merged.qrCode ?? merged.qr ?? merged.qrCodeImage ?? "",
    ).startsWith("data:image"),
  };

  console.log("\n[6] Normalized values");
  console.log(JSON.stringify(normalized, null, 2));

  // Write the result to a local file for easy inspection
  fs.writeFileSync(
    "scripts/test-emcf-normalization-result.json",
    JSON.stringify({ uid, request: invoiceRequest, normalized }, null, 2),
  );

  console.log("\nSaved result to scripts/test-emcf-normalization-result.json");
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});

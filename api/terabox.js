/* ═══════════════════════════════════════════════════════════
   TERABOX DOWNLOADER API (Fallback System)
   Brand: 𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋
   Dev: 𝐙𝐔𝐋𝐐𝐀𝐑𝐍𝐀𝐈𝐍 𝐗 𝐇𝐀𝐈𝐃𝐄𝐑
   ═══════════════════════════════════════════════════════════ */

const BRANDING = {
  brand: "𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋",
  dev: "𝐙𝐔𝐋𝐐𝐀𝐑𝐍𝐀𝐈𝐍 𝐗 𝐇𝐀𝐈𝐃𝐄𝐑",
  channel: "https://whatsapp.com/channel/0029Vb6lszR7YSd3iYfa2V0n",
  credit: "Powered by 𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋"
};

// ✅ کام کرنے والے APIs کی فہرست (ترتیب وار آزمائے جائیں گے)
const API_ENDPOINTS = [
  "https://terabox-worker.robinkumarshakya103.workers.dev/api",
  "https://playterabox.online/api/extract",
  "https://pika-terabox-dl.vercel.app/api"
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") {
    return res.status(405).json({ status: "error", ...BRANDING, message: "GET method only" });
  }

  const teraboxUrl = req.query.url;
  if (!teraboxUrl) {
    return res.status(400).json({
      status: "error",
      ...BRANDING,
      message: "?url= parameter required",
      example: "/api/terabox?url=https://www.terabox.com/s/your_link_here"
    });
  }

  if (!teraboxUrl.toLowerCase().includes("terabox.com") && !teraboxUrl.toLowerCase().includes("terabox.app")) {
    return res.status(400).json({ status: "error", ...BRANDING, message: "Only Terabox URLs are supported." });
  }

  // ✅ ملٹی-API Fallback لوپ
  let data = null;
  let successEndpoint = null;

  for (const endpoint of API_ENDPOINTS) {
    try {
      const targetUrl = `${endpoint}?url=${encodeURIComponent(teraboxUrl)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000); // 8 سیکنڈ ٹائم آؤٹ

      const upstream = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (!upstream.ok) {
        console.warn(`Endpoint ${endpoint} failed with status ${upstream.status}`);
        continue;
      }

      const json = await upstream.json();
      
      // چیک کریں کہ جواب میں ڈیٹا موجود ہے
      if (json && (json.success || json.status === 'success' || json.data || json.file_name)) {
        data = json;
        successEndpoint = endpoint;
        break;
      } else {
        console.warn(`Endpoint ${endpoint} returned invalid data`);
      }
    } catch (e) {
      console.warn(`Endpoint ${endpoint} error:`, e.message);
      continue;
    }
  }

  if (!data) {
    return res.status(502).json({
      status: "error",
      ...BRANDING,
      platform: "terabox",
      message: "تمام APIs ناکام رہیں۔ براہ کرم بعد میں دوبارہ کوشش کریں۔"
    });
  }

  return res.status(200).json({
    status: "success",
    ...BRANDING,
    platform: "terabox",
    requested_url: teraboxUrl,
    timestamp: new Date().toISOString(),
    source: successEndpoint,
    data: data
  });
      }

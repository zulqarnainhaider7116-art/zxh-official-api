/* ═══════════════════════════════════════════════════════════
   TERABOX DOWNLOADER API
   Brand: 𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋
   Dev: 𝐙𝐔𝐋𝐐𝐀𝐑𝐍𝐀𝐈𝐍 𝐗 𝐇𝐀𝐈𝐃𝐄𝐑
   ═══════════════════════════════════════════════════════════ */

const BRANDING = {
  brand: "𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋",
  dev: "𝐙𝐔𝐋𝐐𝐀𝐑𝐍𝐀𝐈𝐍 𝐗 𝐇𝐀𝐈𝐃𝐄𝐑",
  channel: "https://whatsapp.com/channel/0029Vb6lszR7YSd3iYfa2V0n",
  credit: "Powered by 𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋"
};

// یہاں آپ اپنی مرضی سے کوئی بھی اوپن سورس یا مفت API استعمال کر سکتے ہیں۔
// اس وقت یہ ایک مقبول اوپن سورس API استعمال کر رہے ہیں۔
const UPSTREAM_API = "https://terabox-api.vercel.app/api"; 

export default async function handler(req, res) {
  // CORS Headers
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

  // URL چیک کریں کہ یہ ٹیرا باکس کا ہی ہے
  if (!teraboxUrl.toLowerCase().includes("terabox.com") && !teraboxUrl.toLowerCase().includes("terabox.app")) {
    return res.status(400).json({
      status: "error",
      ...BRANDING,
      message: "Only Terabox URLs are supported."
    });
  }

  try {
    // اپ اسٹریم API کو کال کریں
    const targetUrl = `${UPSTREAM_API}?url=${encodeURIComponent(teraboxUrl)}`;
    const upstream = await fetch(targetUrl);

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        status: "error",
        ...BRANDING,
        message: `Upstream API error: ${upstream.status}`
      });
    }

    let data;
    try {
      data = await upstream.json();
    } catch (parseError) {
      return res.status(502).json({
        status: "error",
        ...BRANDING,
        message: "Upstream API نے JSON کے بجائے HTML بھیجا۔ لنک چیک کریں۔"
      });
    }

    // اپنی برانڈنگ کے ساتھ ڈیٹا واپس کریں
    return res.status(200).json({
      status: "success",
      ...BRANDING,
      platform: "terabox",
      requested_url: teraboxUrl,
      timestamp: new Date().toISOString(),
      data: data
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      ...BRANDING,
      message: "Failed to fetch from upstream API",
      error: error.message
    });
  }
    }

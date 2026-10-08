/* ═══════════════════════════════════════════════════════════
   TERABOX DOWNLOADER — Self Contained (No npm packages)
   Brand: 𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋
   Dev: 𝐙𝐔𝐋𝐐𝐀𝐑𝐍𝐀𝐈𝐍 𝐗 𝐇𝐀𝐈𝐃𝐄𝐑
   ═══════════════════════════════════════════════════════════ */

const BRANDING = {
  brand: "𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋",
  dev: "𝐙𝐔𝐋𝐐𝐀𝐑𝐍𝐀𝐈𝐍 𝐗 𝐇𝐀𝐈𝐃𝐄𝐑",
  channel: "https://whatsapp.com/channel/0029Vb6lszR7YSd3iYfa2V0n",
  credit: "Powered by 𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋"
};

// 🔑 Yahan apni Terabox cookie daalo (ndus value)
// Browser mein terabox.com login karo → F12 → Application → Cookies → "ndus" copy karo
const TERABOX_COOKIE = process.env.TERABOX_COOKIE || "";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") {
    return res.status(405).json({ status: "error", ...BRANDING, message: "GET only" });
  }

  const teraboxUrl = req.query.url;
  if (!teraboxUrl) {
    return res.status(400).json({
      status: "error", ...BRANDING,
      message: "?url= parameter required"
    });
  }

  // Short URL nikalo (/s/XXXX ka part)
  const match = teraboxUrl.match(/\/s\/([a-zA-Z0-9_-]+)/);
  if (!match) {
    return res.status(400).json({
      status: "error", ...BRANDING,
      message: "Invalid Terabox URL format"
    });
  }

  const shortUrl = match[1];

  try {
    // Step 1: Share page se jsToken nikalo
    const sharePageUrl = `https://www.terabox.com/s/${shortUrl}`;
    const pageRes = await fetch(sharePageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
        ...(TERABOX_COOKIE ? { "Cookie": `ndus=${TERABOX_COOKIE}` } : {})
      }
    });

    const html = await pageRes.text();

    // jsToken nikalo
    const tokenMatch = html.match(/jsToken"?\s*[:=]\s*"([^"]+)"/);
    const jsToken = tokenMatch ? tokenMatch[1] : null;

    // Step 2: API se data mango
    const apiUrl = new URL("https://www.terabox.com/share/list");
    apiUrl.searchParams.set("app_id", "250528");
    apiUrl.searchParams.set("shorturl", shortUrl);
    apiUrl.searchParams.set("root", "1");
    if (jsToken) apiUrl.searchParams.set("jsToken", jsToken);

    const apiRes = await fetch(apiUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Referer": sharePageUrl,
        ...(TERABOX_COOKIE ? { "Cookie": `ndus=${TERABOX_COOKIE}` } : {})
      }
    });

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({
        status: "error", ...BRANDING,
        message: `Terabox API error: ${apiRes.status}`
      });
    }

    const data = await apiRes.json();

    // Files check
    if (!data.list || data.list.length === 0) {
      return res.status(404).json({
        status: "error", ...BRANDING,
        message: "No files found. Terabox link invalid ya expire ho gaya hai.",
        hint: "Ya phir Terabox ne is request ko block kar diya — cookie update karni pad sakti hai.",
        raw: data
      });
    }

    // Files format karo
    const files = data.list.map(f => ({
      name: f.server_filename || f.filename || "Unknown",
      size_bytes: f.size || 0,
      size_human: f.size ? `${(f.size / 1048576).toFixed(2)} MB` : "Unknown",
      download_url: f.dlink || f.downloadLink || null,
      thumbnail: f.thumbs?.url3 || f.thumbs?.url2 || f.thumbs?.url1 || null,
      type: f.category === 1 ? "video" : f.category === 2 ? "image" : "file",
      is_dir: f.isdir === 1
    }));

    return res.status(200).json({
      status: "success",
      ...BRANDING,
      platform: "terabox",
      requested_url: teraboxUrl,
      short_url: shortUrl,
      timestamp: new Date().toISOString(),
      total_files: files.length,
      files: files
    });

  } catch (error) {
    console.error("Terabox error:", error);
    return res.status(500).json({
      status: "error", ...BRANDING,
      message: "Failed to fetch Terabox data",
      error: error.message
    });
  }
  }

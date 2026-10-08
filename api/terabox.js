/* ═══════════════════════════════════════════════════════════
   TERABOX DOWNLOADER — With Direct Download Link Extraction
   Brand: 𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋
   Dev: 𝐙𝐔𝐋𝐐𝐀𝐑𝐍𝐀𝐈𝐍 𝐗 𝐇𝐀𝐈𝐃𝐄𝐑
   ═══════════════════════════════════════════════════════════ */

const BRANDING = {
  brand: "𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋",
  dev: "𝐙𝐔𝐋𝐐𝐀𝐑𝐍𝐀𝐈𝐍 𝐗 𝐇𝐀𝐈𝐃𝐄𝐑",
  channel: "https://whatsapp.com/channel/0029Vb6lszR7YSd3iYfa2V0n",
  credit: "Powered by 𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋"
};

const TERABOX_COOKIE = process.env.TERABOX_COOKIE || "";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

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
    return res.status(400).json({ status: "error", ...BRANDING, message: "?url= required" });
  }

  const match = teraboxUrl.match(/\/s\/([a-zA-Z0-9_-]+)/);
  if (!match) {
    return res.status(400).json({ status: "error", ...BRANDING, message: "Invalid Terabox URL" });
  }
  const shortUrl = match[1];
  const sharePageUrl = `https://www.terabox.com/s/${shortUrl}`;

  try {
    // STEP 1: Share page se HTML + jsToken nikalo
    const pageRes = await fetch(sharePageUrl, {
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
        ...(TERABOX_COOKIE ? { "Cookie": `ndus=${TERABOX_COOKIE}` } : {})
      }
    });

    const html = await pageRes.text();

    const tokenMatch = html.match(/jsToken"?\s*[:=]\s*"([^"]+)"/);
    const jsToken = tokenMatch ? tokenMatch[1] : null;

    // STEP 2: Share list API se metadata lo
    const apiUrl = new URL("https://www.terabox.com/share/list");
    apiUrl.searchParams.set("app_id", "250528");
    apiUrl.searchParams.set("shorturl", shortUrl);
    apiUrl.searchParams.set("root", "1");
    apiUrl.searchParams.set("web", "1");
    apiUrl.searchParams.set("channel", "dubox");
    apiUrl.searchParams.set("clienttype", "0");
    if (jsToken) apiUrl.searchParams.set("jsToken", jsToken);

    const apiRes = await fetch(apiUrl.toString(), {
      headers: {
        "User-Agent": UA,
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

    if (!data.list || data.list.length === 0) {
      return res.status(404).json({
        status: "error", ...BRANDING,
        message: "No files found. Link invalid ya expire.",
        raw: data
      });
    }

    // STEP 3: HTML se direct dlink extract karo (kaam karta hai mostly)
    const dlinkMatches = html.match(/"dlink"\s*:\s*"([^"]+)"/g) || [];
    const htmlDlinks = dlinkMatches.map(m => {
      const url = m.match(/"dlink"\s*:\s*"([^"]+)"/);
      return url ? url[1].replace(/\\\//g, "/") : null;
    }).filter(Boolean);

    // STEP 4: Files format karo — aur dlink attach karo
    const files = data.list.map((f, idx) => {
      // Priority: HTML se mila dlink > list ka dlink > null
      const dlink = htmlDlinks[idx] || f.dlink || f.downloadLink || null;

      return {
        name: f.server_filename || f.filename || "Unknown",
        size_bytes: f.size || 0,
        size_human: f.size ? `${(f.size / 1048576).toFixed(2)} MB` : "Unknown",
        download_url: dlink,
        thumbnail: f.thumbs?.url3 || f.thumbs?.url2 || f.thumbs?.url1 || null,
        type: f.category === 1 ? "video" : f.category === 2 ? "image" : "file",
        is_dir: f.isdir === 1,
        fs_id: f.fs_id || null,
        md5: f.md5 || null
      };
    });

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

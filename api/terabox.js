/* ═══════════════════════════════════════════════════════════
   TERABOX DOWNLOADER API — Self Hosted (No Upstream)
   Brand: 𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋
   Dev: 𝐙𝐔𝐋𝐐𝐀𝐑𝐍𝐀𝐈𝐍 𝐗 𝐇𝐀𝐈𝐃𝐄𝐑
   ═══════════════════════════════════════════════════════════ */

import Terabox from "terabox-downloader";

const BRANDING = {
  brand: "𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋",
  dev: "𝐙𝐔𝐋𝐐𝐀𝐑𝐍𝐀𝐈𝐍 𝐗 𝐇𝐀𝐈𝐃𝐄𝐑",
  channel: "https://whatsapp.com/channel/0029Vb6lszR7YSd3iYfa2V0n",
  credit: "Powered by 𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋"
};

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
      message: "?url= parameter required",
      example: "/api/terabox?url=https://www.terabox.com/s/xxxxx"
    });
  }

  if (!teraboxUrl.toLowerCase().includes("terabox")) {
    return res.status(400).json({
      status: "error", ...BRANDING,
      message: "Only Terabox URLs supported"
    });
  }

  try {
    // 🚀 Direct call — no upstream API
    const result = await Terabox.getInfo(teraboxUrl);

    if (!result || !result.length) {
      return res.status(404).json({
        status: "error", ...BRANDING, platform: "terabox",
        message: "No files found or invalid URL"
      });
    }

    // Format the response
    const files = result.map(file => ({
      name: file.file_name || file.name || "Unknown",
      size: file.size || "Unknown",
      download_url: file.downloadLink || file.dlink || file.url || null,
      thumbnail: file.thumbnail || file.thumb || null,
      type: file.type || "file"
    }));

    return res.status(200).json({
      status: "success",
      ...BRANDING,
      platform: "terabox",
      requested_url: teraboxUrl,
      timestamp: new Date().toISOString(),
      total_files: files.length,
      data: {
        files,
        // Pehla file direct top-level mein bhi
        ...files[0]
      }
    });

  } catch (error) {
    console.error("Terabox error:", error);
    return res.status(500).json({
      status: "error", ...BRANDING, platform: "terabox",
      message: "Failed to fetch Terabox info",
      error: error.message
    });
  }
       }

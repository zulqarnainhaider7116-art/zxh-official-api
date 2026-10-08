const BRANDING = {
  brand: "𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋",
  dev: "𝐙𝐔𝐋𝐐𝐀𝐑𝐍𝐀𝐈𝐍 𝐗 𝐇𝐀𝐈𝐃𝐄𝐑",
  channel: "https://whatsapp.com/channel/0029Vb6lszR7YSd3iYfa2V0n",
  credit: "Powered by 𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋",
  version: "1.0.0"
};

const UPSTREAM = "https://fak-media-downloaders.jokerkeep057.workers.dev/dl/?url=";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const url = req.query.url;
  if (!url) {
    return res.status(400).json({
      status: "error", ...BRANDING, platform: "youtube", message: "?url= required"
    });
  }

  const u = url.toLowerCase();
  if (!u.includes("youtube.com") && !u.includes("youtu.be")) {
    return res.status(400).json({
      status: "error", ...BRANDING, platform: "youtube",
      message: "Not a YouTube URL. Use /api/auto instead."
    });
  }

  try {
    const upstream = await fetch(`${UPSTREAM}${encodeURIComponent(url)}`);

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        status: "error", ...BRANDING, platform: "youtube",
        message: `Upstream error: ${upstream.status}`
      });
    }

    let data;
    try {
      data = await upstream.json();
    } catch (parseError) {
      return res.status(502).json({
        status: "error", ...BRANDING, platform: "youtube",
        message: "Upstream API ne JSON ke bajaye HTML bheja.",
        requested_url: url
      });
    }

    return res.status(200).json({
      status: "success", ...BRANDING, platform: "youtube",
      requested_url: url,
      timestamp: new Date().toISOString(),
      data
    });

  } catch (e) {
    return res.status(500).json({
      status: "error", ...BRANDING, platform: "youtube", error: e.message
    });
  }
        }

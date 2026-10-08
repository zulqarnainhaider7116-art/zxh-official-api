const BRANDING = {
  brand: "𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋",
  dev: "𝐙𝐔𝐋𝐐𝐀𝐑𝐍𝐀𝐈𝐍 𝐗 𝐇𝐀𝐈𝐃𝐄𝐑",
  channel: "https://whatsapp.com/channel/0029Vb6lszR7YSd3iYfa2V0n",
  credit: "Powered by 𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋",
  version: "1.0.0"
};

const UPSTREAM = {
  tiktok:    "https://fak-media-downloaders.jokerkeep057.workers.dev/dl/?url=",
  instagram: "https://fak-media-downloaders.jokerkeep057.workers.dev/dl/?url=",
  youtube:   "https://fak-media-downloaders.jokerkeep057.workers.dev/dl/?url=",
  facebook:  "https://fak-media-downloaders.jokerkeep057.workers.dev/dl/?url=",
  twitter:   "https://fak-media-downloaders.jokerkeep057.workers.dev/dl/?url=",
  snapchat:  "https://fak-media-downloaders.jokerkeep057.workers.dev/dl/?url=",
  pinterest: "https://fak-media-downloaders.jokerkeep057.workers.dev/dl/?url=",
  linkedin:  "https://fak-media-downloaders.jokerkeep057.workers.dev/dl/?url=",
  threads:   "https://fak-media-downloaders.jokerkeep057.workers.dev/dl/?url=",
  reddit:    "https://fak-media-downloaders.jokerkeep057.workers.dev/dl/?url=",
};

function detectPlatform(url) {
  if (!url) return null;
  const u = url.toLowerCase();
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("facebook.com") || u.includes("fb.watch")) return "facebook";
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
  if (u.includes("snapchat.com")) return "snapchat";
  if (u.includes("pinterest.com")) return "pinterest";
  if (u.includes("linkedin.com")) return "linkedin";
  if (u.includes("threads.net")) return "threads";
  if (u.includes("reddit.com")) return "reddit";
  return "unknown";
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") {
    return res.status(405).json({ status: "error", ...BRANDING, message: "GET method only" });
  }

  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).json({
      status: "error", ...BRANDING,
      message: "?url= parameter required",
      example: "/api/auto?url=https://tiktok.com/..."
    });
  }

  const platform = detectPlatform(videoUrl);
  if (platform === "unknown" || !UPSTREAM[platform]) {
    return res.status(400).json({
      status: "error", ...BRANDING,
      message: `Unsupported platform: ${platform}`,
      supported: Object.keys(UPSTREAM)
    });
  }

  try {
    const targetUrl = `${UPSTREAM[platform]}${encodeURIComponent(videoUrl)}`;
    const upstream = await fetch(targetUrl);

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        status: "error", ...BRANDING, platform,
        message: `Upstream error: ${upstream.status}`
      });
    }

    let data;
    try {
      data = await upstream.json();
    } catch (parseError) {
      return res.status(502).json({
        status: "error", ...BRANDING, platform,
        message: "Upstream API ne JSON ke bajaye HTML bheja. Link check karo ya video private ho sakti hai.",
        requested_url: videoUrl
      });
    }

    return res.status(200).json({
      status: "success", ...BRANDING, platform,
      requested_url: videoUrl,
      timestamp: new Date().toISOString(),
      data
    });

  } catch (error) {
    return res.status(500).json({
      status: "error", ...BRANDING, platform,
      message: "Failed to fetch from upstream",
      error: error.message
    });
  }
}

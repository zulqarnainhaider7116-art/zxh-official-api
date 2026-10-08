import { BRANDING } from "./shared/branding.js";
import { setCors } from "./shared/cors.js";
import { detectPlatform } from "./shared/detect.js";

// 🔗 Upstream APIs (dost ki API)
const UPSTREAM = {
  tiktok:    "https://fak-media-downloaders.jokerkeep057.workers.dev/dl/?url=",
  instagram: "https://fak-media-downloaders.jokerkeep057.workers.dev/dl/?url=",
  youtube:   "https://fak-media-downloaders.jokerkeep057.workers.dev/dl/?url=",
  facebook:  "https://fak-media-downloaders.jokerkeep057.workers.dev/dl/?url=",
  twitter:   "https://fak-media-downloaders.jokerkeep057.workers.dev/dl/?url=",
  // ... baqi platforms (snapchat, pinterest, etc.) agar hain to yahan add karein
};

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") {
    return res.status(405).json({ status: "error", ...BRANDING, message: "GET method only" });
  }

  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).json({
      status: "error", ...BRANDING, message: "?url= parameter required",
      example: "/api/auto?url=https://tiktok.com/..."
    });
  }

  const platform = detectPlatform(videoUrl);
  if (platform === "unknown" || !UPSTREAM[platform]) {
    return res.status(400).json({
      status: "error", ...BRANDING, message: `Unsupported platform: ${platform}`,
      supported: Object.keys(UPSTREAM)
    });
  }

  try {
    const targetUrl = `${UPSTREAM[platform]}${encodeURIComponent(videoUrl)}`;
    
    // ✅ FIX 1: Headers hata diye, taake upstream API sahi jawab de
    const upstream = await fetch(targetUrl);

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        status: "error", ...BRANDING, platform,
        message: `Upstream error: ${upstream.status} ${upstream.statusText}`
      });
    }

    let data;
    // ✅ FIX 2: JSON parse karne ke liye try-catch
    try {
      data = await upstream.json();
    } catch (parseError) {
      // Agar upstream JSON ke bajaye HTML bhej de
      return res.status(502).json({
        status: "error", ...BRANDING, platform,
        message: "Upstream API ne JSON ke bajaye HTML bheja. Link check karo ya video private ho sakti hai.",
        requested_url: videoUrl
      });
    }

    // Agar sab theek hai to data wapas bhejo
    return res.status(200).json({
      status: "success", ...BRANDING, platform,
      requested_url: videoUrl,
      timestamp: new Date().toISOString(),
      data
    });

  } catch (error) {
    // Agar fetch mein koi aur network error aaye
    return res.status(500).json({
      status: "error", ...BRANDING, platform,
      message: "Failed to fetch from upstream",
      error: error.message
    });
  }
        }

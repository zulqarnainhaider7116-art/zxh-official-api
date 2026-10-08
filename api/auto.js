import { BRANDING } from "./_shared/branding.js";
import { setCors } from "./_shared/cors.js";
import { detectPlatform } from "./_shared/detect.js";

// 🔗 Upstream APIs (dost ki API)
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

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") {
    return res.status(405).json({ status: "error", ...BRANDING, message: "GET method only" });
  }

  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({
      status: "error",
      ...BRANDING,
      message: "?url= parameter required",
      example: "/api/auto?url=https://tiktok.com/..."
    });
  }

  const platform = detectPlatform(videoUrl);

  if (platform === "unknown" || !UPSTREAM[platform]) {
    return res.status(400).json({
      status: "error",
      ...BRANDING,
      message: `Unsupported platform. Detected: ${platform}`,
      supported: Object.keys(UPSTREAM)
    });
  }

  try {
    const targetUrl = `${UPSTREAM[platform]}${encodeURIComponent(videoUrl)}`;
    const upstream = await fetch(targetUrl, {
      headers: {
        "User-Agent": "ZXH-Official-API/1.0",
        "Accept": "application/json"
      }
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        status: "error",
        ...BRANDING,
        platform,
        message: `Upstream error: ${upstream.status} ${upstream.statusText}`
      });
    }

    const data = await upstream.json();

    return res.status(200).json({
      status: "success",
      ...BRANDING,
      platform,
      requested_url: videoUrl,
      timestamp: new Date().toISOString(),
      data
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      ...BRANDING,
      platform,
      message: "Failed to fetch from upstream",
      error: error.message
    });
  }
}
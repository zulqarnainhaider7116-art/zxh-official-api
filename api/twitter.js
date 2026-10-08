import { BRANDING } from "./_shared/branding.js";
import { setCors } from "./_shared/cors.js";
import { detectPlatform } from "./_shared/detect.js";

const UPSTREAM = "https://fak-media-downloaders.jokerkeep057.workers.dev/dl/?url=";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const url = req.query.url;
  if (!url) {
    return res.status(400).json({
      status: "error", ...BRANDING, platform: "twitter", message: "?url= required"
    });
  }

  if (detectPlatform(url) !== "twitter") {
    return res.status(400).json({
      status: "error", ...BRANDING, platform: "twitter",
      message: "Not a Twitter/X URL. Use /api/auto instead."
    });
  }

  try {
    const upstream = await fetch(`${UPSTREAM}${encodeURIComponent(url)}`);
    const data = await upstream.json();

    return res.status(200).json({
      status: "success", ...BRANDING, platform: "twitter",
      requested_url: url,
      timestamp: new Date().toISOString(),
      data
    });
  } catch (e) {
    return res.status(500).json({
      status: "error", ...BRANDING, platform: "twitter", error: e.message
    });
  }
}
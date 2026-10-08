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
      status: "error", ...BRANDING, platform: "youtube", message: "?url= required"
    });
  }

  if (detectPlatform(url) !== "youtube") {
    return res.status(400).json({
      status: "error", ...BRANDING, platform: "youtube",
      message: "Not a YouTube URL. Use /api/auto instead."
    });
  }

  try {
    const upstream = await fetch(`${UPSTREAM}${encodeURIComponent(url)}`);
    const data = await upstream.json();

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
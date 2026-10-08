import { BRANDING } from "./_shared/branding.js";
import { setCors } from "./_shared/cors.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  return res.status(200).json({
    status: "success",
    ...BRANDING,
    message: "🎬 Welcome to 𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋 Downloader API",

    endpoints: {
      auto:      "/api/auto?url=VIDEO_URL",
      tiktok:    "/api/tiktok?url=VIDEO_URL",
      instagram: "/api/instagram?url=VIDEO_URL",
      youtube:   "/api/youtube?url=VIDEO_URL",
      facebook:  "/api/facebook?url=VIDEO_URL",
      twitter:   "/api/twitter?url=VIDEO_URL"
    },

    example: "/api/auto?url=https://www.tiktok.com/@user/video/12345",
    note: "Use /api/auto for automatic platform detection",
    supported: ["tiktok", "instagram", "youtube", "facebook", "twitter", "snapchat", "pinterest", "linkedin", "threads", "reddit"]
  });
    }

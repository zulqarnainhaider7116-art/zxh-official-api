export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  return res.status(200).json({
    status: "success",
    brand: "𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋",
    dev: "𝐙𝐔𝐋𝐐𝐀𝐑𝐍𝐀𝐈𝐍 𝐗 𝐇𝐀𝐈𝐃𝐄𝐑",
    channel: "https://whatsapp.com/channel/0029Vb6lszR7YSd3iYfa2V0n",
    credit: "Powered by 𝐙𝐗𝐇 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋",
    version: "1.0.0",
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
    note: "Use /api/auto for automatic platform detection"
  });
}

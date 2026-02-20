/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  // Required to use ytdl-core in API routes (it uses Node.js modules)
  serverExternalPackages: ["@distube/ytdl-core"],
};

module.exports = nextConfig;

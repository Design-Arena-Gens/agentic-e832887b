/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["replicate", "googleapis", "@upstash/redis", "openai"]
  },
  async headers() {
    return [
      {
        source: "/api/telegram/webhook",
        headers: [{ key: "Content-Type", value: "application/json" }]
      }
    ];
  }
};

export default nextConfig;

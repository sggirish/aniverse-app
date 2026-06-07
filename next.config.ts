import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.myanimelist.net" },
      { protocol: "https", hostname: "api-cdn.myanimelist.net" },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/og/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js inline scripts + Plausible + AdSense
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io https://pagead2.googlesyndication.com https://www.googletagmanager.com",
              // AdSense iframes + fonts
              "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // MAL images + AdSense images + self
              "img-src 'self' data: https://cdn.myanimelist.net https://api-cdn.myanimelist.net https://pagead2.googlesyndication.com",
              // API calls: Jikan, Supabase, Upstash, Anthropic (all server-side so 'self' covers it)
              "connect-src 'self' https://plausible.io https://pagead2.googlesyndication.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

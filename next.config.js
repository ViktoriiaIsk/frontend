/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Enable image optimization for production
    unoptimized: false,
    remotePatterns: [
      // Backend domain
      {
        protocol: "https",
        hostname: "api.bookswap.space",
      },

      // Allow common image CDNs
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      // Allow all domains for development (fallback)
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Add error handling for external images
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Add formats for better optimization
    formats: ["image/webp", "image/avif"],
  },

  // Direct HTTPS backend - no proxy needed

  // Turbopack configuration for Next.js 15
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // Add output configuration for Vercel
  output: "standalone",

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

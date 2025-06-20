/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Enable image optimization for production
    unoptimized: false,
    remotePatterns: [
      // Backend domain
      {
        protocol: "https",
        hostname: "bookswap-save-planet.vercel.app",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
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

  // API Proxy is now handled by pages/api/proxy/[...path].ts
  // Removed rewrites to avoid conflicts with the new proxy API

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

  // Environment variables
  env: {
    NEXT_PUBLIC_BACKEND_URL:
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "https://bookswap-save-planet.vercel.app",
    NEXT_PUBLIC_IMAGE_BASE_URL:
      process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
      "https://bookswap-save-planet.vercel.app",
  },
};

module.exports = nextConfig;

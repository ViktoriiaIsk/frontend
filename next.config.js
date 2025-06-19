/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Disable image optimization to avoid proxy issues
    unoptimized: true,
    remotePatterns: [
      // Allow all domains for development
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
};

module.exports = nextConfig;

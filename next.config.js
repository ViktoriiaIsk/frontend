/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // HTTP for development
      {
        protocol: "http",
        hostname: "13.37.117.93",
        port: "",
        pathname: "/book-images/**",
      },
      {
        protocol: "http",
        hostname: "13.37.117.93",
        port: "",
        pathname: "/storage/**",
      },
      // HTTPS for production
      {
        protocol: "https",
        hostname: "13.37.117.93",
        port: "",
        pathname: "/book-images/**",
      },
      {
        protocol: "https",
        hostname: "13.37.117.93",
        port: "",
        pathname: "/storage/**",
      },
    ],
    // Add error handling for external images
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Disable image optimization for external images if they cause issues
    unoptimized: false,
  },

  // API Proxy to handle HTTPS/HTTP mixed content issues
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://13.37.117.93/api/:path*",
      },
    ];
  },

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

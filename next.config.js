/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
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
    ],
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

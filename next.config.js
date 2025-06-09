/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "15.237.117.132",
        port: "",
        pathname: "/book-images/**",
      },
      {
        protocol: "http",
        hostname: "15.237.117.132",
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

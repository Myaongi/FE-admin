// next.config.js
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "54.180.54.51",
        port: "8080",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;

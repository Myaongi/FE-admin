/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ 빌드 시 ESLint 에러 무시
  },
  async rewrites() {
    return [
      {
        source: "/proxy/:path*",
        destination: "http://54.180.54.51:8080/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gangajikimi-server.s3.ap-northeast-2.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;

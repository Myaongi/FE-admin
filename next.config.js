/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ 빌드 시 ESLint 에러 무시
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*", // 프론트에서 /api 로 요청
        destination: "http://54.180.54.51:8080/api/:path*", // 실제 백엔드로 전달
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

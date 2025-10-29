/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    eslint: {
      ignoreDuringBuilds: true, // ✅ 빌드 시 ESLint 에러 무시
    },
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

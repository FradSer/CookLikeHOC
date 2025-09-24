import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/CookLikeHOC' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/CookLikeHOC/' : '',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 性能优化
  compress: true,
};

export default nextConfig;

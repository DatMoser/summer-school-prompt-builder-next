import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['pdfjs-dist'],
  devIndicators: false,
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;

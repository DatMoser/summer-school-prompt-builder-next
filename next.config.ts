import type { NextConfig } from "next";

// Dynamic environment loading based on mode
const { config } = require('dotenv');

if (process.env.NEXT_BUILD_MODE === 'development') {
  // Load development environment variables for both build and runtime
  config({ path: '.env.development', override: true });
  console.log('✅ Loading development environment from .env.development');
} else {
  // Load production environment variables  
  config({ path: '.env.production', override: false });
  console.log('✅ Loading production environment from .env.production');
}

const nextConfig: NextConfig = {
  // Enable standalone output only for Docker production builds
  ...(process.env.NODE_ENV === 'production' && process.env.DOCKER_BUILD && { output: "standalone" }),
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: false,
  serverExternalPackages: ['pdfjs-dist'],
  
  // Skip problematic static generation during development builds
  generateBuildId: () => 'development',
  
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    experimental: {
      typedRoutes: false,
      optimizeCss: false,
    },
    reactStrictMode: false,
  }),
};

export default nextConfig;

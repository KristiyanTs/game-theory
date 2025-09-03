import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable server-side rendering optimizations
    optimizePackageImports: ['@supabase/supabase-js'],
    // API routes timeout (for long-running match operations)
    serverActions: {
      bodySizeLimit: '2mb',
    }
  },
  // Enable TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
  }
};

export default nextConfig;

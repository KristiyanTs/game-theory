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
  // Disable Turbopack for production builds in Docker
  turbo: {
    rules: {
      '*.css': {
        loaders: ['postcss-loader'],
        as: '*.css',
      },
    },
  },
  // Enable TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // SEO optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Enable static optimization
  trailingSlash: false,
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
};

export default nextConfig;

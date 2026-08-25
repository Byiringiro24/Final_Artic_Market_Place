import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // Skip ESLint and TypeScript errors during production build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      // Production server — backend runs on :5010
      { protocol: 'http', hostname: '102.37.128.81', port: '5010' },
      { protocol: 'http', hostname: '102.37.128.81' },
      // Development
      { protocol: 'http', hostname: 'localhost', port: '5010' },
      { protocol: 'http', hostname: 'localhost', port: '5000' },
      { protocol: 'http', hostname: 'localhost' },
      // Cloud storage
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'utfs.io' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      // Unsplash (used in seeds)
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    unoptimized: true, // serve backend images without Next.js optimization to avoid domain issues
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

export default withNextIntl(nextConfig);

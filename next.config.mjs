/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Vercel handles image optimization natively — keep unoptimized false in production
    unoptimized: process.env.ELECTRON_BUILD === 'true',
  },
  devIndicators: {
    appIsrStatus: false,
  },
  // Required for proxy/middleware to work correctly
  experimental: {
    proxyPrefetch: 'flexible',
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'date-fns',
      '@radix-ui/react-icons',
      '@radix-ui/react-avatar',
      '@radix-ui/react-select',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-tabs'
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}/api/:path*`,
      },
    ];
  },
}

export default nextConfig

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
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ];
  },
}

export default nextConfig

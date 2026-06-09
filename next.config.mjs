/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Required for middleware to work correctly on Vercel edge runtime
  experimental: {
    middlewarePrefetch: 'flexible',
  },
}

export default nextConfig

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
  // Explicitly include all server-side dependencies in the standalone output.
  // Next.js Turbopack file tracing misses dynamically-imported packages like
  // mongoose, mongodb, cloudinary, etc. — this forces them to be copied into
  // .next/standalone/node_modules so the packaged Electron app can find them.
  outputFileTracingIncludes: {
    '/api/**': [
      './node_modules/mongoose/**/*',
      './node_modules/mongodb/**/*',
      './node_modules/bson/**/*',
      './node_modules/mquery/**/*',
      './node_modules/mpath/**/*',
      './node_modules/kareem/**/*',
      './node_modules/sift/**/*',
      './node_modules/mongodb-connection-string-url/**/*',
      './node_modules/@mongodb-js/**/*',
      './node_modules/cloudinary/**/*',
      './node_modules/nodemailer/**/*',
      './node_modules/jsonwebtoken/**/*',
      './node_modules/bcryptjs/**/*',
      './node_modules/twilio/**/*',
      './node_modules/dotenv/**/*',
      './node_modules/xlsx/**/*',
      './node_modules/@next/env/**/*',
      './node_modules/@swc/helpers/**/*',
    ],
  },
}

export default nextConfig

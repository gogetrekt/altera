/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Use empty turbopack config to silence the warning
  turbopack: {},
  // Exclude pino and thread-stream from server-side bundling
  serverExternalPackages: ['pino', 'thread-stream', 'pino-pretty'],
}

export default nextConfig

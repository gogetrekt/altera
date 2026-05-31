/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Use empty turbopack config to silence the warning
  turbopack: {},
  // Avoid Turbopack parsing pino internals pulled by walletconnect deps.
  serverExternalPackages: ['pino', 'thread-stream', 'pino-pretty'],
}

export default nextConfig

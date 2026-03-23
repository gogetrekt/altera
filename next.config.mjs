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
}

export default nextConfig

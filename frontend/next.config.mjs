/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Docker/AWS deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

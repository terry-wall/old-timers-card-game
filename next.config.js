/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [],
  },
  // Remove custom server configuration since we're using standard Next.js
}

module.exports = nextConfig
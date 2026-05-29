/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a self-contained server in .next/standalone for small Docker images
  output: 'standalone',
};

module.exports = nextConfig;

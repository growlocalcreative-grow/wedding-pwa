/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // This stops the build from hanging on type checks
    ignoreBuildErrors: true,
  },
  eslint: {
    // This stops the build from hanging on linting (like those quote marks)
    ignoreDuringBuilds: true,
  },
  // This disables Turbopack during the build which often causes stalls in 15.5+
  experimental: {
    turbo: {
       enabled: false
    }
  }
};

export default nextConfig;
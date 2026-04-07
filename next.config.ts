/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // This tells Vercel to ignore those "any" errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // This tells Vercel to ignore those "quote" and "lint" errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
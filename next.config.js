/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal config for stability
  reactStrictMode: false,

  webpack: (config) => {
    // Disable caching that's causing issues
    config.cache = false;

    // Simplify module resolution
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },
};

module.exports = nextConfig;
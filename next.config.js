/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic config without complex optimizations
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Minimal webpack config
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },
};
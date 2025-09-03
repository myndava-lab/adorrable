const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure server for Replit environment
  experimental: {
    serverComponentsExternalPackages: []
  },
  webpack: (config, { dev }) => {
    // Disable PackFileCacheStrategy (prevents .pack.gz ENOENT & stale imports)
    config.cache = false;

    // Optional: quiet infra warnings about cache packs
    if (config.infrastructureLogging) {
      config.infrastructureLogging.level = 'error';
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // Optimize compiler settings
  compiler: {
    removeConsole: false,
  },

  // Advanced webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Add path alias
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };

    // Treat raw text-like files as emitted assets (URL), not inlined strings
    config.module.rules.push({
      test: /\.(md|sql|txt)$/i,
      type: 'asset/resource',
      generator: { filename: 'static/assets/[hash][ext][query]' },
    });

    // Handle SVGs properly instead of inlining as strings
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [{ loader: '@svgr/webpack', options: { icon: true } }],
    });

    // Exclude attached_assets from webpack processing to prevent bundle bloat
    config.module.rules.push({
      test: /attached_assets\//,
      type: 'asset/resource',
      generator: { filename: 'static/assets/[name][ext][query]' },
    });

    // Basic fallbacks for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Disable source maps in production to prevent corruption
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
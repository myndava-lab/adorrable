/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable optimizations for production
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Re-enable SWC for better performance
  swcMinify: true,
  // Optimize for better chunk loading
  experimental: {
    optimizeCss: true,
  },
  webpack: (config, { isServer }) => {
    // Fix for module resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Fix chunk loading issues
    if (!isServer) {
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 150000,
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            enforce: true,
          },
        },
      };

      // Increase timeout significantly
      config.output = config.output || {};
      config.output.chunkLoadTimeout = 600000; // 10 minutes
      config.output.publicPath = '/_next/';
    }

    return config;
  },
};

module.exports = nextConfig;
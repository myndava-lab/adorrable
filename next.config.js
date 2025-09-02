
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
    
    // Fix chunk loading timeouts and hydration issues
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 244000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
            enforce: true,
          },
        },
      };
      
      // Increase chunk load timeout to prevent timeout errors
      config.output.chunkLoadTimeout = 120000;
    }
    
    return config;
  },
};

module.exports = nextConfig;

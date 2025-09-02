
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
        maxSize: 200000,
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
            maxSize: 200000,
          },
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            priority: 40,
            enforce: true,
          },
        },
      };
      
      // Increase chunk load timeout and add retry logic
      config.output.chunkLoadTimeout = 300000;
      config.output.crossOriginLoading = 'anonymous';
    }
    
    return config;
  },
};

module.exports = nextConfig;

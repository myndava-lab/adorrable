
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable experimental features that can cause instability
  experimental: {},
  
  // Optimize compiler settings
  compiler: {
    removeConsole: false,
  },
  
  // Advanced webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Prevent module corruption
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      path: false,
      stream: false,
      util: false,
      url: false,
    };

    // Fix chunk loading with advanced optimization
    if (!isServer) {
      // Disable module concatenation that's causing syntax errors
      config.optimization.concatenateModules = false;
      
      // Custom chunk splitting strategy
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 0,
        maxSize: 250000,
        minChunks: 1,
        cacheGroups: {
          default: false,
          vendors: false,
          
          // Framework chunk
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          
          // Libraries chunk
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name: 'lib',
            priority: 30,
            chunks: 'all',
            enforce: true,
          },
          
          // App chunks
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: 20,
          },
        },
      };

      // Fix output configuration
      config.output = {
        ...config.output,
        crossOriginLoading: false,
        chunkFormat: 'array-push',
        chunkLoadTimeout: 30000,
        publicPath: '/_next/',
        
        // Prevent syntax errors in chunks
        chunkFilename: dev 
          ? 'static/chunks/[name].js'
          : 'static/chunks/[name].[contenthash:8].js',
      };
    }

    // Add webpack plugins to prevent corruption
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production'),
      })
    );

    // Optimize module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };

    return config;
  },

  // Disable source maps in production to prevent corruption
  productionBrowserSourceMaps: false,
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
};

module.exports = nextConfig;

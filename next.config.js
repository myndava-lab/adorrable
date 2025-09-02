
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable problematic features
  reactStrictMode: false,
  poweredByHeader: false,
  
  // Advanced compiler optimizations
  compiler: {
    removeConsole: false,
  },
  
  // Experimental features for stability
  experimental: {
    // Disable features causing hydration issues
    appDocumentPreloading: false,
    optimizePackageImports: ['lucide-react'],
    // Force client-side navigation
    clientRouterFilter: false,
  },

  // Advanced webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Disable problematic optimizations
    config.cache = false;
    config.optimization = config.optimization || {};
    
    if (!isServer) {
      // Custom chunk splitting strategy
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
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

      // Force immediate chunk loading without timeouts
      config.output = {
        ...config.output,
        chunkLoadTimeout: 120000,
        crossOriginLoading: false,
        publicPath: '/_next/',
        chunkFilename: dev ? '[name].js' : '[name].[contenthash].js',
      };

      // Resolve fallbacks
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        util: false,
      };

      // Module federation compatibility
      config.externals = config.externals || [];
      
      // Disable tree shaking for problematic modules
      config.optimization.usedExports = false;
      config.optimization.sideEffects = false;
    }

    return config;
  },

  // Headers for chunk loading
  async headers() {
    return [
      {
        source: '/_next/static/chunks/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },

  // Disable image optimization that can cause hydration issues
  images: {
    unoptimized: true,
  },

  // Output configuration
  output: 'standalone',
  trailingSlash: false,
  
  // Disable static optimization for problematic pages
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;

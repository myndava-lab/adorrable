import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Replit configuration
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Allow all origins in development
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

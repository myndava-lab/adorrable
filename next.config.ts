
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper static file handling
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Remove problematic headers for now
  output: 'standalone',
  trailingSlash: false,
};

export default nextConfig;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Remove output standalone for development
  trailingSlash: false,
  // Ensure proper asset handling
  assetPrefix: '',
};

export default nextConfig;

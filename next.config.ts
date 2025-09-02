
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal config to avoid webpack issues
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Disable problematic features temporarily
  swcMinify: false,
};

export default nextConfig;

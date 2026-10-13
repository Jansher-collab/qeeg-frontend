import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Fail the production build on any TypeScript compilation error so type
    // regressions can never ship silently.
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
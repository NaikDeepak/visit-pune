import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow ALL external images (aggregated from web)
      },
    ],
  },
};

export default nextConfig;

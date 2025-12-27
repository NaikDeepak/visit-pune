import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Keep for now as bridge
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn1.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn2.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn3.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'tbn1.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'tbn2.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'tbn3.gstatic.com',
      },
    ],
  },
};

export default nextConfig;

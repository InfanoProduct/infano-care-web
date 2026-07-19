import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',
  allowedDevOrigins: ['192.168.1.6'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4005',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
      },
      {
        protocol: 'https',
        hostname: 'api.infano.care', // Assuming production API host
      },
      {
        protocol: 'https',
        hostname: 'infano-prod.duckdns.org',
      },
      {
        protocol: 'http',
        hostname: '109.199.120.104',
        port: '8084',
      },
      {
        protocol: 'http',
        hostname: '109.199.120.104',
        port: '4005',
      }
    ],
  },
};

export default nextConfig;

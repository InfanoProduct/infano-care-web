// Next.config.ts - Trigger route manifest reload
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',
  allowedDevOrigins: ['192.168.1.6'],
  async redirects() {
    return [
      {
        source: '/adolescentProgram',
        destination: '/',
        permanent: true,
      },
      {
        source: '/adolescentprogram',
        destination: '/',
        permanent: true,
      },
      {
        source: '/:locale(en-us|en-uk|en-fr|fr)/adolescentProgram',
        destination: '/:locale',
        permanent: true,
      },
      {
        source: '/:locale(en-us|en-uk|en-fr|fr)/adolescentprogram',
        destination: '/:locale',
        permanent: true,
      },
    ];
  },
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
        protocol: 'https',
        hostname: 'api-dev.infano.care',
      },
      {
        protocol: 'https',
        hostname: 'dev.infano.care',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ],
  },
};

export default nextConfig;

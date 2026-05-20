import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://infano.care';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/peerline/dashboard/',
        '/checkout/success/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

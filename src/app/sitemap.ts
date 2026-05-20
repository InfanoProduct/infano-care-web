import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://infano.care';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005/api';

  // Static routes config
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/gigi-the-awkward-age-book',
    '/the-support-circle',
    '/blog',
    '/schools',
    '/impact',
    '/ecosystem',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Dynamic Blog Post routes
  let blogRoutes: any[] = [];
  try {
    const res = await fetch(`${apiUrl}/blog/posts?page=1&limit=100`, {
      next: { revalidate: 3600 } // Cache sitemap fetches for 1 hour
    });
    
    if (res.ok) {
      const data = await res.json();
      const posts = data.items || [];
      
      blogRoutes = posts
        .filter((post: any) => post.isPublished)
        .map((post: any) => ({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: new Date(post.updatedAt || post.createdAt || Date.now()),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }));
    }
  } catch (error) {
    console.error('Sitemap dynamic blog fetch failed:', error);
  }

  return [...staticRoutes, ...blogRoutes];
}

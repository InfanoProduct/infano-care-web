import { Metadata } from 'next';
import { blogService } from '@/services/blog.service';
import { getImageUrl } from '@/lib/utils';
import { BlogPostDetailClient } from './BlogPostDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await blogService.getPostBySlug(slug) as any;
    if (!post) {
      return {
        title: 'Blog Story | Infano Care',
      };
    }
    
    const cleanTitle = post.title || 'Healthcare Story';
    const cleanDesc = post.summary || post.metaDescription || 'Read this post on Infano Care.';
    const category = post.categories?.[0]?.name || 'Healthcare';
    const author = post.author?.name || 'Infano Care';
    
    const encodedTitle = encodeURIComponent(cleanTitle);
    const encodedCategory = encodeURIComponent(category);
    const encodedAuthor = encodeURIComponent(author);
    const apiOgImageUrl = `/api/og?title=${encodedTitle}&category=${encodedCategory}&author=${encodedAuthor}`;
    const ogImageUrl = post.thumbnailUrl ? getImageUrl(post.thumbnailUrl) : apiOgImageUrl;

    return {
      title: cleanTitle,
      description: cleanDesc,
      openGraph: {
        title: cleanTitle,
        description: cleanDesc,
        type: 'article',
        publishedTime: post.createdAt,
        modifiedTime: post.updatedAt,
        authors: [author],
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: cleanTitle,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: cleanTitle,
        description: cleanDesc,
        images: [ogImageUrl],
      },
    };
  } catch (error) {
    console.error('Failed to generate metadata for blog post:', error);
    return {
      title: 'Story | Infano Care',
      description: 'Read the latest stories and insights from adolescent healthcare experts.',
    };
  }
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <BlogPostDetailClient slug={slug} />;
}

import { Metadata } from 'next';
import { ShopService } from '@/services/shop.service';
import { WebinarDetailClient } from './WebinarDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_UPLOAD_API_URL || 'https://dev.infano.care';
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const ogImageUrl = `${cleanBaseUrl}/uploads/assets/s1-heroimage.png`;

  try {
    const webinar = await ShopService.getWebinarBySlug(slug);
    if (!webinar) {
      return {
        title: {
          absolute: 'Live Parent Webinar: Understand Your Teen Daughter | Infano Care'
        },
        description: 'Join Decoding Her Silence - a 90-minute live session for parents navigating adolescence. Learn to read the signs, open the conversation, and reconnect. Limited seats.',
        openGraph: {
          images: [{ url: ogImageUrl }]
        },
        twitter: {
          images: [ogImageUrl]
        }
      };
    }

    const seoTitle = webinar.seoTitle || webinar.title || 'Live Parent Webinar: Understand Your Teen Daughter';
    const seoDescription = webinar.seoDescription || webinar.description || 'Join Decoding Her Silence - a 90-minute live session for parents navigating adolescence. Learn to read the signs, open the conversation, and reconnect. Limited seats.';
    const keywords = webinar.seoKeywords || 'parenting, teenager, puberty, mother daughter bond';

    const finalTitle = (seoTitle.toLowerCase().includes('| infano care'))
      ? seoTitle
      : seoTitle.toLowerCase().includes('| infano')
        ? seoTitle.replace(/\|\s*infano/i, '| Infano Care')
        : `${seoTitle} | Infano Care`;

    return {
      title: {
        absolute: finalTitle
      },
      description: seoDescription,
      keywords: keywords,
      openGraph: {
        title: finalTitle,
        description: seoDescription,
        type: 'website',
        url: `${cleanBaseUrl}/webinar/${slug}`,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: finalTitle,
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: finalTitle,
        description: seoDescription,
        images: [ogImageUrl],
      }
    };
  } catch (error) {
    console.error('Failed to generate metadata for webinar page:', error);
    return {
      title: {
        absolute: 'Live Parent Webinar: Understand Your Teen Daughter | Infano Care'
      },
      description: 'Join Decoding Her Silence - a 90-minute live session for parents navigating adolescence. Learn to read the signs, open the conversation, and reconnect. Limited seats.',
      openGraph: {
        images: [{ url: ogImageUrl }]
      },
      twitter: {
        images: [ogImageUrl]
      }
    };
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  let webinar = null;

  try {
    webinar = await ShopService.getWebinarBySlug(slug);
  } catch (error) {
    console.error('Failed to fetch webinar on server:', error);
  }

  return <WebinarDetailClient initialWebinar={webinar} slug={slug} />;
}

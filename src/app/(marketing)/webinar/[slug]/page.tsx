import { Metadata } from 'next';
import { ShopService } from '@/services/shop.service';
import { WebinarDetailClient } from './WebinarDetailClient';
import { getImageUrl } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://infano.care';
  const cleanAppUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;
  
  const defaultTitle = 'Live Parent Webinar: Understand Your Teen Daughter';
  const ogImageUrl = getImageUrl('/uploads/assets/s1-heroimage.png');

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

    const seoTitle = webinar.seoTitle || webinar.title || defaultTitle;
    const rawSeoDescription = webinar.seoDescription || webinar.description || 'Join Decoding Her Silence - a 90-minute live session for parents navigating adolescence. Learn to read the signs, open the conversation, and reconnect. Limited seats.';
    const seoDescription = rawSeoDescription.replace(/Rs\.\s*99|Rs\s*99|₹\s*99/gi, `Rs. ${webinar.price}`);
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
        url: `${cleanAppUrl}/webinar/${slug}`,
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

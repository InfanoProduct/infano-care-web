import { Metadata } from 'next';
import { ShopService } from '@/services/shop.service';
import { WebinarDetailClient } from './WebinarDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const webinar = await ShopService.getWebinarBySlug(slug);
    if (!webinar) {
      return {
        title: 'Live Parent Webinar: Understand Your Teen Daughter',
        description: 'Join Decoding Her Silence - a 90-minute live session for parents navigating adolescence. Learn to read the signs, open the conversation, and reconnect. Limited seats.',
      };
    }

    const seoTitle = webinar.seoTitle || webinar.title || 'Live Parent Webinar: Understand Your Teen Daughter';
    const seoDescription = webinar.seoDescription || webinar.description || 'Join Decoding Her Silence - a 90-minute live session for parents navigating adolescence. Learn to read the signs, open the conversation, and reconnect. Limited seats.';
    const keywords = webinar.seoKeywords || 'parenting, teenager, puberty, mother daughter bond';

    const finalTitle = (seoTitle.toLowerCase().includes('| infano') || seoTitle.toLowerCase().includes('| infano care'))
      ? seoTitle
      : `${seoTitle} | Infano`;

    return {
      title: finalTitle,
      description: seoDescription,
      keywords: keywords,
      openGraph: {
        title: finalTitle,
        description: seoDescription,
        type: 'website',
        url: `https://dev.infano.care/webinar/${slug}`,
        images: [
          {
            url: '/webinar-hero.png',
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
        images: ['/webinar-hero.png'],
      }
    };
  } catch (error) {
    console.error('Failed to generate metadata for webinar page:', error);
    return {
      title: 'Live Parent Webinar: Understand Your Teen Daughter | Infano',
      description: 'Join Decoding Her Silence - a 90-minute live session for parents navigating adolescence. Learn to read the signs, open the conversation, and reconnect. Limited seats.',
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

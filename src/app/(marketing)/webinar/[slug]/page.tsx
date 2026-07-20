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
        title: 'Decoding Her Silence: Parent Webinar | Infano Care',
        description: 'Join our exclusive live masterclass for parents of adolescent girls.',
      };
    }

    const seoTitle = webinar.seoTitle || webinar.title || 'Decoding Her Silence: Parent Webinar';
    const seoDescription = webinar.seoDescription || webinar.description || 'Join our exclusive live masterclass for parents of adolescent girls.';
    const keywords = webinar.seoKeywords || 'parenting, teenager, puberty, mother daughter bond';

    return {
      title: `${seoTitle} | Infano Care`,
      description: seoDescription,
      keywords: keywords,
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        type: 'website',
        url: `https://dev.infano.care/webinar/${slug}`,
        images: [
          {
            url: '/webinar-hero.png',
            width: 1200,
            height: 630,
            alt: seoTitle,
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: seoTitle,
        description: seoDescription,
        images: ['/webinar-hero.png'],
      }
    };
  } catch (error) {
    console.error('Failed to generate metadata for webinar page:', error);
    return {
      title: 'Decoding Her Silence: Parent Webinar | Infano Care',
      description: 'Join our exclusive live masterclass for parents of adolescent girls.',
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

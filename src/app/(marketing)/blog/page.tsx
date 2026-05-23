import { Metadata } from 'next';
import { BlogListingClient } from './BlogListingClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Infano Care Blog | Adolescent Health & Parenting Stories | Infano Care',
  },
  description: 'Discover expert stories, health tips, and educational puberty guides written by professionals to empower adolescent girls and support parents.',
  openGraph: {
    title: 'Infano Care Blog | Adolescent Health & Parenting Stories | Infano Care',
    description: 'Discover expert stories, health tips, and educational puberty guides written by professionals to empower adolescent girls and support parents.',
    url: 'https://infano.care/blog',
    images: [
      {
        url: '/og-images/landing-og-image.png',
        width: 1200,
        height: 630,
        alt: 'Infano Care Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Infano Care Blog | Adolescent Health & Parenting Stories | Infano Care',
    description: 'Discover expert stories, health tips, and educational puberty guides written by professionals to empower adolescent girls and support parents.',
    images: ['/og-images/landing-og-image.png'],
  },
};

export default function BlogListingPage() {
  return <BlogListingClient />;
}

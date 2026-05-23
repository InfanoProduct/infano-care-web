import { Metadata } from 'next';
import { TheBookClient } from './TheBookClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Gigi - The Awkward Age | Adolescent Puberty Guide for Girls | Infano Care',
  },
  description: "Empower adolescent girls with scientific guidance, body-positivity, and self-love. India's first dedicated guidebook addressing female puberty transitions with absolute clarity.",
  openGraph: {
    title: 'Gigi - The Awkward Age | Adolescent Puberty Guide for Girls | Infano Care',
    description: "Empower adolescent girls with scientific guidance, body-positivity, and self-love. India's first dedicated guidebook addressing female puberty transitions with absolute clarity.",
    url: 'https://infano.care/gigi-the-awkward-age-book',
    images: [
      {
        url: '/og-images/cover-og.png',
        width: 1200,
        height: 630,
        alt: 'Gigi - The Awkward Age Book Puberty Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gigi - The Awkward Age | Adolescent Puberty Guide for Girls | Infano Care',
    description: "Empower adolescent girls with scientific guidance, body-positivity, and self-love. India's first dedicated guidebook addressing female puberty transitions with absolute clarity.",
    images: ['/og-images/cover-og.png'],
  },
};

export default function TheBookPage() {
  return <TheBookClient />;
}

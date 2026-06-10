import { Metadata } from 'next';
import { ContactClient } from './ContactClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Contact Us | School & Parent Enquiries | Infano Care',
  },
  description: 'Reach out to the Infano Care team. Whether you represent a school looking to run health workshops or are a parent seeking adolescent advice, we respond within 24 hours.',
  openGraph: {
    title: 'Contact Us | School & Parent Enquiries | Infano Care',
    description: 'Reach out to the Infano Care team. Whether you represent a school looking to run health workshops or are a parent seeking adolescent advice, we respond within 24 hours.',
    url: 'https://infano.care/contact',
    images: [
      {
        url: '/og-images/landing-og.png',
        width: 1200,
        height: 630,
        alt: 'Contact Infano Care',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | School & Parent Enquiries | Infano Care',
    description: 'Reach out to the Infano Care team. Whether you represent a school looking to run health workshops or are a parent seeking adolescent advice, we respond within 24 hours.',
    images: ['/og-images/landing-og.png'],
  },
};

export default function ContactPage() {
  return <ContactClient />;
}

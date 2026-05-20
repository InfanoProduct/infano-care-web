import { Metadata } from 'next';
import { ContactClient } from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us | School & Parent Enquiries',
  description: 'Reach out to the Infano Care team. Whether you represent a school looking to run health workshops or are a parent seeking adolescent advice, we respond within 24 hours.',
  openGraph: {
    title: 'Contact Infano Care | Partner & Parent Enquiries',
    description: 'Reach out to the Infano Care team. Whether you represent a school looking to run health workshops or are a parent seeking adolescent advice, we respond within 24 hours.',
    url: 'https://infano.care/contact',
    images: [
      {
        url: '/api/og?title=Contact+Us&category=Contact&author=Infano+Care',
        width: 1200,
        height: 630,
        alt: 'Contact Infano Care',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Infano Care | Partner & Parent Enquiries',
    description: 'Get in touch with us for school consultations, parent support, and partnerships.',
    images: ['/api/og?title=Contact+Us&category=Contact&author=Infano+Care'],
  },
};

export default function ContactPage() {
  return <ContactClient />;
}

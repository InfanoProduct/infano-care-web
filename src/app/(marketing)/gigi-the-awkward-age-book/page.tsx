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
        url: '/og-images/book-og.png',
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
    images: ['/og-images/book-og.png'],
  },
};

const bookSchema = {
  "@context": "https://schema.org",
  "@type": ["Book", "Product"],
  "name": "Gigi — The Awkward Age",
  "alternateName": "Gigi The Awkward Age Book",
  "description": "India's first illustrated guidebook addressing female puberty with scientific clarity, body-positivity, and self-love. 230 pages of empathetic stories, practical prompts, and expert-backed guidance for girls aged 10–17. Co-created with counsellors and teachers.",
  "url": "https://infano.care/gigi-the-awkward-age-book",
  "image": "https://infano.care/api/og?title=Gigi+-+The+Awkward+Age&category=Gigi+Book&author=Infano+Care",
  "bookFormat": "https://schema.org/Paperback",
  "numberOfPages": 230,
  "inLanguage": "en",
  "typicalAgeRange": "10-17",
  "genre": ["Adolescent Health", "Puberty Education", "Self-Help", "Children's Non-Fiction"],
  "about": { "@type": "Thing", "name": "Adolescent puberty education for girls in India" },
  "publisher": { "@type": "Organization", "name": "Infano Care", "url": "https://infano.care" },
  "author": { "@type": "Organization", "name": "Infano Care Team", "description": "Co-created with qualified counsellors and teachers" },
  "offers": {
    "@type": "Offer",
    "url": "https://infano.care/checkout",
    "price": "499",
    "priceCurrency": "INR",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": { "@type": "Organization", "name": "Infano Care" },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "IN" },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "businessDays": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"]
        },
        "transitTime": { "@type": "QuantitativeValue", "minValue": 3, "maxValue": 7, "unitCode": "DAY" }
      }
    }
  },
  "interactionStatistic": {
    "@type": "InteractionCounter",
    "interactionType": "https://schema.org/ReadAction",
    "userInteractionCount": 10000
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "reviewCount": "871",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "reviewBody": "Reading this with my daughter turned awkward questions into honest chats. The illustrations kept her engaged, and the prompts helped me guide the conversation.",
      "author": { "@type": "Person", "name": "Ananya S." },
      "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }
    },
    {
      "@type": "Review",
      "reviewBody": "Before Infano, I thought what I was feeling was just me being dramatic. Now I know my emotions are real and I have the tools to understand them.",
      "author": { "@type": "Person", "name": "Priya" },
      "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }
    },
    {
      "@type": "Review",
      "reviewBody": "Learning about my body and health in a safe space has given me so much confidence. I feel empowered every day.",
      "author": { "@type": "Person", "name": "Sara" },
      "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }
    },
    {
      "@type": "Review",
      "reviewBody": "The workshops on emotional intelligence helped me navigate tough times. I feel much more resilient now.",
      "author": { "@type": "Person", "name": "Diya" },
      "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }
    },
    {
      "@type": "Review",
      "reviewBody": "Seeing my daughter grow more self-assured and happy is the greatest gift. Infano has been a blessing for our family.",
      "author": { "@type": "Person", "name": "Meera" },
      "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }
    }
  ]
};

export default function TheBookPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }}
      />
      <TheBookClient />
    </>
  );
}

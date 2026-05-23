import { Metadata } from 'next';
import { EcosystemHero } from '@/features/marketing/components/sections/ecosystem/EcosystemHero';
import { LearningPillar } from '@/features/marketing/components/sections/ecosystem/LearningPillar';
import { WellnessPillar } from '@/features/marketing/components/sections/ecosystem/WellnessPillar';
import { EducationPillar } from '@/features/marketing/components/sections/ecosystem/EducationPillar';
import { SupportPillar } from '@/features/marketing/components/sections/ecosystem/SupportPillar';
import { CommunityPillar } from '@/features/marketing/components/sections/ecosystem/CommunityPillar';
import { BookPillar } from '@/features/marketing/components/sections/ecosystem/BookPillar';
import { EcosystemFaq } from '@/features/marketing/components/sections/ecosystem/EcosystemFaq';

export const metadata: Metadata = {
  title: {
    absolute: 'Our Ecosystem | Puberty Education, Wellness & Care | Infano Care',
  },
  description: "Explore the Infano Care Ecosystem — combining book guides, digital physical tracking, clinical expert support, and moderated communities for a safe puberty transition.",
  openGraph: {
    title: 'Our Ecosystem | Puberty Education, Wellness & Care | Infano Care',
    description: "Explore the Infano Care Ecosystem — combining book guides, digital physical tracking, clinical expert support, and moderated communities for a safe puberty transition.",
    url: 'https://infano.care/ecosystem',
    images: [
      {
        url: '/og-images/landing-og-image.png',
        width: 1200,
        height: 630,
        alt: 'Infano Care Ecosystem',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Ecosystem | Puberty Education, Wellness & Care | Infano Care',
    description: "Explore the Infano Care Ecosystem — combining book guides, digital physical tracking, clinical expert support, and moderated communities for a safe puberty transition.",
    images: ['/og-images/landing-og-image.png'],
  },
};

const ecosystemSchema = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  "name": "Infano Care",
  "description": "India's first holistic wellness app for adolescent girls — combining story-based learning, AI cycle tracking, mental wellness tools, expert-led circles, and a safe peer community. For girls aged 10–21.",
  "url": "https://infano.care",
  "applicationCategory": "HealthApplication",
  "applicationSubCategory": "Women's Health",
  "operatingSystem": "iOS, Android",
  "downloadUrl": "https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME",
  "installUrl": "https://apps.apple.com/in/app/infano-care/YOUR_APP_ID",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock",
    "description": "Free to download. Premium journeys from Rs.799."
  },
  "featureList": [
    "Story-based learning journeys",
    "AI wellness and menstrual cycle tracker",
    "Mental wellness and mood tracking",
    "Gamified education with badges and streaks",
    "Expert-led live and async support circles",
    "Safe moderated peer community",
    "Offline content access",
    "Parent progress dashboard"
  ],
  "screenshot": [
    "https://infano.care/homehero-1.png",
    "https://infano.care/homehero-2.png",
    "https://infano.care/homehero-3.png"
  ],
  "contentRating": "Everyone 10+",
  "inLanguage": "en",
  "countriesSupported": "IN",
  "author": {
    "@type": "Organization",
    "name": "BerryBird Technologies Private Limited",
    "url": "https://infano.care"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "ADD_YOUR_STORE_RATING",
    "reviewCount": "ADD_YOUR_REVIEW_COUNT",
    "bestRating": "5",
    "worstRating": "1"
  }
};

export default function EcosystemPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ecosystemSchema) }}
      />
      <EcosystemHero />

      <div id="pillars" className="space-y-0">
        <LearningPillar />
        <WellnessPillar />
        <EducationPillar />
        <SupportPillar />
        <CommunityPillar />
        <BookPillar />
        <EcosystemFaq />
      </div>
    </div>
  );
}

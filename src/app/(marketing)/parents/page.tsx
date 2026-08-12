import { Metadata } from 'next';
import { ParentsHero } from '@/features/marketing/components/sections/parents/ParentsHero';
import { WhatSchoolsMiss } from '@/features/marketing/components/sections/parents/WhatSchoolsMiss';
import { ParentsPrograms } from '@/features/marketing/components/sections/parents/ParentsPrograms';
import { SupportSystem } from '@/features/marketing/components/sections/parents/SupportSystem';
import { ParentsResponse } from '@/features/marketing/components/sections/parents/ParentsResponse';
import { DaughterExperience } from '@/features/marketing/components/sections/parents/DaughterExperience';
import { ParentDashboard } from '@/features/marketing/components/sections/parents/ParentDashboard';
import { ParentsFAQ } from '@/features/marketing/components/sections/parents/ParentsFAQ';

export const metadata: Metadata = {
  title: {
    absolute: 'Parents Programme | Support Your Daughter Through Puberty | Infano Care',
  },
  description: 'Empower your daughter during female puberty with clinical guidance, parent tracking, and empathetic resources built for modern families.',
  openGraph: {
    title: 'Parents Programme | Support Your Daughter Through Puberty | Infano Care',
    description: 'Empower your daughter during female puberty with clinical guidance, parent tracking, and empathetic resources built for modern families.',
    url: 'https://infano.care/parents',
    images: [
      {
        url: '/og-images/parent-og.png',
        width: 1200,
        height: 630,
        alt: 'Infano Parents Programme',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Parents Programme | Support Your Daughter Through Puberty | Infano Care',
    description: 'Empower your daughter during female puberty with clinical guidance, parent tracking, and empathetic resources built for modern families.',
    images: ['/og-images/parent-og.png'],
  },
};

const parentServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Infano Care Parents Programme",
  "alternateName": "Infano For Families & Caregivers",
  "description": "A safe, expert-supported digital companion that helps parents support their daughters through puberty, emotional wellness, and adolescent growth. Includes the Infano app for girls aged 10–21, a non-intrusive parent dashboard, weekly learning summaries, wellness flags, curated conversation prompts, and access to expert-led circles. Trusted by 2,000+ families across India.",
  "url": "https://infano.care/parents",
  "image": "https://infano.care/api/og?title=Parents+Programme&category=Parents&author=Infano+Care",
  "serviceType": "Adolescent Girl Wellness & Parent Support Programme",
  "provider": {
    "@type": "Organization",
    "name": "Infano Care",
    "legalName": "BerryBird Technologies Private Limited",
    "url": "https://infano.care",
    "email": "connect@infano.care",
    "telephone": "+91-9243019243"
  },
  "areaServed": { "@type": "Country", "name": "India" },
  "audience": {
    "@type": "Audience",
    "audienceType": "Parents and caregivers of adolescent girls aged 10–21 in India"
  },
  "availableChannel": {
    "@type": "ServiceChannel",
    "name": "Enrol your daughter directly",
    "serviceUrl": "https://infano.care/programs/the-unfiltered-journey",
    "availableLanguage": "English"
  },
  "serviceOutput": "Infano app access for daughter (ages 10–21), non-intrusive parent dashboard, weekly learning summary of modules and topics completed, wellness flags with parental notification on consent, monthly progress milestones and skill development tracking, curated weekly conversation starter prompts for use at home",
  "termsOfService": "https://infano.care/legal#terms",
  "interactionStatistic": {
    "@type": "InteractionCounter",
    "interactionType": "https://schema.org/RegisterAction",
    "userInteractionCount": 2000
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Access Options for Parents",
    "itemListElement": [
      {
        "@type": "Offer",
        "name": "Through Your School",
        "description": "If your daughter's school is an Infano Care partner, she may already have access. Contact your school's wellness coordinator to activate.",
        "url": "https://infano.care/contact",
        "itemOffered": { "@type": "Service", "name": "School-integrated Infano access for students and parents" },
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "Direct Family Access",
        "description": "Enrol directly through the Infano website or app. Includes full app access for your daughter and the parent dashboard with weekly insights and conversation prompts.",
        "url": "https://infano.care/programs/the-unfiltered-journey",
        "itemOffered": { "@type": "Service", "name": "Infano app + parent dashboard — direct family enrolment" },
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "Gift the Book",
        "description": "Start the conversation with the Infano book — an illustrated, expert-backed guide for adolescent girls.",
        "url": "https://infano.care/gigi-the-awkward-age-book",
        "price": "499",
        "priceCurrency": "INR",
        "itemOffered": { "@type": "Book", "name": "Gigi — The Awkward Age", "url": "https://infano.care/gigi-the-awkward-age-book" },
        "availability": "https://schema.org/InStock"
      }
    ]
  },
  "review": {
    "@type": "Review",
    "reviewBody": "Infano has given me a bridge back to my daughter. We use the weekly prompts over dinner and she actually talks to me now.",
    "author": { "@type": "Person", "name": "Parent, Bengaluru" },
    "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }
  }
};

const parentFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "name": "Frequently Asked Questions — Infano Care Parents Programme",
  "url": "https://infano.care/parents",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Will my daughter's health data be shared with the school?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Never, without your daughter's explicit consent. Health data — including period tracking, mood logs, and journal entries — is entirely private to your daughter. The school dashboard only shows aggregate, anonymised class-level wellbeing trends, never individual health records."
      }
    },
    {
      "@type": "Question",
      "name": "What age is the Infano app suitable for?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Infano is designed for girls aged 10 to 21. Content is segmented by age group and unlocks progressively as your daughter grows — so a 10-year-old and a 17-year-old access age-appropriate, relevant material at every stage."
      }
    },
    {
      "@type": "Question",
      "name": "What if my daughter encounters something that upsets her on the app?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Infano is a closed, moderated environment. All content is pre-approved by our expert council of qualified medical professionals, psychologists, and educators before it reaches your daughter. There are no public feeds, no strangers, and no user-generated content that bypasses moderation."
      }
    },
    {
      "@type": "Question",
      "name": "Can I see what my daughter is doing on the Infano app?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — you have access to a parent dashboard that shows her learning journey progress, badges earned, and community engagement levels. Her private data — journal entries, period tracking logs, and mood records — are never visible to parents. The dashboard is designed to keep you informed without invading her privacy."
      }
    }
  ]
};

export default function ParentsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(parentServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(parentFaqSchema) }}
      />
      <ParentsHero />
      <WhatSchoolsMiss />
      <ParentsPrograms />
      <SupportSystem />
      <ParentsResponse />
      <DaughterExperience />
      <ParentDashboard />
      <ParentsFAQ />
    </div>
  );
}

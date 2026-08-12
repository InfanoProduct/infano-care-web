import { Metadata } from 'next';
import { HeroSection } from '@/features/marketing/components/sections/HeroSection';
import { ProblemSection } from '@/features/marketing/components/sections/ProblemSection';
import { EcosystemSection } from '@/features/marketing/components/sections/EcosystemSection';
import { AudienceSection } from '@/features/marketing/components/sections/AudienceSection';
import { ImpactSection } from '@/features/marketing/components/sections/ImpactSection';
import { BookSection } from '@/features/marketing/components/sections/BookSection';
import { PartnershipBanner } from '@/features/marketing/components/sections/PartnershipBanner';
import { NewsScrollerSection } from '@/features/marketing/components/sections/NewsScrollerSection';


export const metadata: Metadata = {
  title: {
    absolute: 'Empowering Adolescent Girls & Families | Infano Care',
  },
  description: "India's first holistic platform supporting adolescent girls and their parents through puberty education, mental wellness programs, and digital healthcare resources.",
  openGraph: {
    title: 'Empowering Adolescent Girls & Families | Infano Care',
    description: "India's first holistic platform supporting adolescent girls and their parents through puberty education, mental wellness programs, and digital healthcare resources.",
    url: 'https://infano.care',
    images: [
      {
        url: '/og-images/landing-og.png',
        width: 1200,
        height: 630,
        alt: 'Infano Care',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Empowering Adolescent Girls & Families | Infano Care',
    description: "India's first holistic platform supporting adolescent girls and their parents through puberty education, mental wellness programs, and digital healthcare resources.",
    images: ['/og-images/landing-og.png'],
  },
};

const homeSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Infano Care",
  "alternateName": "infano.care",
  "legalName": "BerryBird Technologies Private Limited",
  "description": "India's first holistic platform supporting adolescent girls aged 10–21 and their parents through puberty education, mental wellness programs, and digital healthcare resources.",
  "slogan": "From Girlhood to Adulthood to Womanhood",
  "url": "https://infano.care",
  "logo": {
    "@type": "ImageObject",
    "url": "https://infano.care/logo/infano-logo-for-light-bg.png"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Bangalore",
    "addressRegion": "Karnataka",
    "addressCountry": "IN"
  },
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "connect@infano.care",
      "areaServed": "IN",
      "availableLanguage": "English"
    },
    {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "telephone": "+91-9243019243",
      "areaServed": "IN",
      "availableLanguage": "English"
    }
  ],
  "sameAs": [
    "https://www.instagram.com/infano.care/",
    "https://www.linkedin.com/company/infanocare/",
    "https://www.youtube.com/channel/UCjJ06NX_nNaWoezl3-QeeLg"
  ],
  "areaServed": {
    "@type": "Country",
    "name": "India"
  },
  "knowsAbout": [
    "Adolescent healthcare",
    "Puberty education",
    "Menstrual health and hygiene",
    "Mental wellness for girls",
    "Parenting teenage girls",
    "School health workshops",
    "Life skills education",
    "Emotional intelligence"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Infano Care Programmes & Products",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Course",
          "name": "Menstrual Health & Hygiene",
          "description": "8-episode expert-backed course on menstrual health. 1200+ students empowered.",
          "provider": { "@type": "Organization", "name": "Infano Care" }
        },
        "price": "799",
        "priceCurrency": "INR",
        "url": "https://infano.care/programs/the%20unfiltered%20journey"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Course",
          "name": "Mind & Harmony",
          "description": "6-episode mindfulness and emotional resilience program. 850+ students empowered.",
          "provider": { "@type": "Organization", "name": "Infano Care" }
        },
        "price": "799",
        "priceCurrency": "INR",
        "url": "https://infano.care/programs/the%20unfiltered%20journey"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Course",
          "name": "Confidence & Beyond",
          "description": "10-episode self-esteem and leadership program. 1500+ students empowered.",
          "provider": { "@type": "Organization", "name": "Infano Care" }
        },
        "price": "999",
        "priceCurrency": "INR",
        "url": "https://infano.care/programs/the%20unfiltered%20journey"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Book",
          "name": "Gigi — The Awkward Age",
          "description": "India's first illustrated guide for adolescent girls. 230 pages, target age 10–17.",
          "numberOfPages": "230",
          "publisher": { "@type": "Organization", "name": "Infano Care" },
          "url": "https://infano.care/gigi-the-awkward-age-book"
        },
        "price": "499",
        "priceCurrency": "INR",
        "url": "https://infano.care/checkout"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "School Partnership Programme",
          "description": "Curriculum-aligned wellness and life-skills programme for schools with teacher dashboards and impact reporting. 20+ schools enrolled across India.",
          "provider": { "@type": "Organization", "name": "Infano Care" },
          "url": "https://infano.care/schools"
        }
      }
    ]
  },
  "employee": [
    { "@type": "Person", "name": "Dr. Isha Kapoor", "jobTitle": "Menstrual Health Specialist, Gynaecology" },
    { "@type": "Person", "name": "Jasika Makhija", "jobTitle": "Clinical Nutritionist, Dietetics" },
    { "@type": "Person", "name": "Ms. Gazal Luthra", "jobTitle": "Counselling Psychologist & Psychotherapist" },
    { "@type": "Person", "name": "Ms. Shipra Chawla", "jobTitle": "Soft Skills & Communication Coach" }
  ],
  "foundingLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Bangalore",
      "addressCountry": "IN"
    }
  }
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      <HeroSection />
      <NewsScrollerSection />
      <ProblemSection />
      <EcosystemSection />
      <AudienceSection />
      <ImpactSection />
      <BookSection />
      <PartnershipBanner />
    </div>
  );
}


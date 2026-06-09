import { Metadata } from 'next';
import { SchoolHero } from '@/features/marketing/components/sections/schools/SchoolHero';
import { SituationSection } from '@/features/marketing/components/sections/schools/SituationSection';
import { RealitySection } from '@/features/marketing/components/sections/schools/RealitySection';
import { GapSection } from '@/features/marketing/components/sections/schools/GapSection';
import { IntroductionSection } from '@/features/marketing/components/sections/schools/IntroductionSection';
import { JourneySection } from '@/features/marketing/components/sections/schools/JourneySection';
import { SessionSection } from '@/features/marketing/components/sections/schools/SessionSection';
import { DigitalPlatformSection } from '@/features/marketing/components/sections/schools/DigitalPlatformSection';
import { TeacherTrainingSection } from '@/features/marketing/components/sections/schools/TeacherTrainingSection';
import { ParentLayerSection } from '@/features/marketing/components/sections/schools/ParentLayerSection';
import { ImpactSection } from '@/features/marketing/components/sections/schools/ImpactSection';
import { SchoolBeyondSection } from '@/features/marketing/components/sections/schools/SchoolBeyondSection';
import { SchoolAdvantage } from '@/features/marketing/components/sections/schools/SchoolAdvantage';
import { PartnershipTiers } from '@/features/marketing/components/sections/schools/PartnershipTiers';
import { FoundingSchoolsSection } from '@/features/marketing/components/sections/schools/FoundingSchoolsSection';
import { PartnershipBanner } from '@/features/marketing/components/sections/PartnershipBanner';

export const metadata: Metadata = {
  title: {
    absolute: 'School Partnerships | Puberty & Wellness Programmes | Infano Care',
  },
  description: "Bring Infano's NEP-aligned puberty and wellness curriculum to your school. Comprehensive teacher training, expert workshops, and secure student platforms.",
  openGraph: {
    title: 'School Partnerships | Puberty & Wellness Programmes | Infano Care',
    description: "Bring Infano's NEP-aligned puberty and wellness curriculum to your school. Comprehensive teacher training, expert workshops, and secure student platforms.",
    url: 'https://infano.care/schools',
    images: [
      {
        url: '/og-images/school-og.png',
        width: 1200,
        height: 630,
        alt: 'Infano School Partnerships',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'School Partnerships | Puberty & Wellness Programmes | Infano Care',
    description: "Bring Infano's NEP-aligned puberty and wellness curriculum to your school. Comprehensive teacher training, expert workshops, and secure student platforms.",
    images: ['/og-images/school-og.png'],
  },
};

const schoolServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Infano Care School Partnership Programme",
  "alternateName": "Infano.Care For Schools",
  "description": "India's first age-progressive wellness and life-skills programme for adolescent girls in schools. Covers menstrual health, mental wellness, consent, digital safety and identity across Grades 5–9. Includes in-school expert sessions, teacher training, a digital platform, and a parent engagement layer. NEP-aligned. 20+ schools enrolled across India.",
  "url": "https://infano.care/schools",
  "image": "https://infano.care/api/og?title=School+Partnerships&category=Schools&author=Infano+Care",
  "serviceType": "Adolescent Wellness & Life Skills School Programme",
  "provider": {
    "@type": "Organization",
    "name": "Infano Care",
    "legalName": "BerryBird Technologies Private Limited",
    "url": "https://infano.care"
  },
  "areaServed": { "@type": "Country", "name": "India" },
  "audience": {
    "@type": "Audience",
    "audienceType": "Schools, educational institutions, and school administrators across India"
  },
  "availableChannel": {
    "@type": "ServiceChannel",
    "name": "Request a 30-minute demo consultation",
    "serviceUrl": "https://infano.care/contact",
    "availableLanguage": "English"
  },
  "serviceOutput": "Infano.Care Certified School credential and lobby plaque, structured in-school expert sessions, teacher training with handbook, digital wellness platform for students, parent welcome kits and weekly engagement, school dashboard with aggregate wellbeing data, quarterly and annual impact reports, PR and social media content pack, media coverage support",
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "Period-related school absence reduction", "value": "25%" },
    { "@type": "PropertyValue", "name": "Likelihood of reporting unsafe situations", "value": "3x more likely" },
    { "@type": "PropertyValue", "name": "Weekly digital learning engagement rate", "value": "79%" },
    { "@type": "PropertyValue", "name": "Girls who identify a trusted adult in Session 1", "value": "68%" },
    { "@type": "PropertyValue", "name": "Partner schools across India", "value": "20+" }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "School Partnership Tiers",
    "itemListElement": [
      {
        "@type": "Offer",
        "name": "Seeding — Essential Tier",
        "description": "Entry partnership for 100 students across Grades 5–6. Includes 1 in-school expert session per grade, half-day teacher training, digital platform access for Grades 5–6, parent welcome packets, quarterly impact report, and the Infano.Care Certified School badge.",
        "url": "https://infano.care/contact",
        "itemOffered": {
          "@type": "Service",
          "name": "Infano School Wellness Programme — Seeding",
          "description": "100 students · Grades 5–6 · 2 grades · 1 session per grade · Half-day teacher training · Platform Grades 5–6 · Parent welcome packet · Quarterly report · Certified School badge"
        },
        "availability": "https://schema.org/InStock",
        "areaServed": { "@type": "Country", "name": "India" }
      },
      {
        "@type": "Offer",
        "name": "Grow — Recommended Tier",
        "description": "Recommended partnership for 200 students across Grades 5–7. Includes 1 session per grade, teacher training with handbook, digital platform for 3 grades, parent app onboarding, quarterly and annual reports, media coverage support, and school dashboard access.",
        "url": "https://infano.care/contact",
        "itemOffered": {
          "@type": "Service",
          "name": "Infano School Wellness Programme — Grow",
          "description": "200 students · Grades 5–7 · 3 grades · 1 session per grade · Teacher training + handbook · Platform 3 grades · Parent app + onboarding · Quarterly and annual report · Media coverage · School dashboard"
        },
        "availability": "https://schema.org/InStock",
        "areaServed": { "@type": "Country", "name": "India" }
      },
      {
        "@type": "Offer",
        "name": "Thrive — Complete Tier",
        "description": "Complete 5-year partnership for 300 students across all Grades 5–9. Full age-progressive curriculum, complete teacher training, platform for all 5 grades, full parent programme, PR and social media pack, real-time school dashboard with alerts, and an annual Wellness Day event.",
        "url": "https://infano.care/contact",
        "itemOffered": {
          "@type": "Service",
          "name": "Infano School Wellness Programme — Thrive",
          "description": "300 students · All Grades 5–9 · 5 grades · Full teacher training · Platform all 5 grades · Full parent programme · PR + social media pack · Dashboard + alerts · Annual Wellness Day event"
        },
        "availability": "https://schema.org/InStock",
        "areaServed": { "@type": "Country", "name": "India" }
      }
    ]
  }
};

const schoolProgramSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOccupationalProgram",
  "name": "Infano Care 5-Year Age-Progressive Girls Wellness Programme",
  "description": "A structured 5-year NEP-aligned wellness and life-skills curriculum for adolescent girls in Indian schools, covering Grades 5 through 9 (ages 10–15). Each year builds on the last — from body literacy and puberty readiness in Grade 5 through to reproductive health, ambition, and life skills in Grade 9. Delivered through blended in-school expert sessions and a digital learning platform.",
  "url": "https://infano.care/schools",
  "educationalProgramMode": "blended",
  "typicalAgeRange": "10-15",
  "timeToComplete": "P5Y",
  "programType": "Wellness & Life Skills",
  "provider": {
    "@type": "Organization",
    "name": "Infano Care",
    "legalName": "BerryBird Technologies Private Limited",
    "url": "https://infano.care"
  },
  "applicationContact": {
    "@type": "ContactPoint",
    "contactType": "admissions",
    "email": "support@infano.care",
    "telephone": "+91-9243019243",
    "url": "https://infano.care/contact"
  },
  "hasCourse": [
    {
      "@type": "Course",
      "name": "My Body, My Story",
      "courseCode": "INFANO-G5",
      "description": "Grade 5 module covering body literacy, puberty awareness, and menstruation readiness. Designed to equip girls aged 10–11 with accurate, stigma-free knowledge before their first period.",
      "educationalLevel": "Grade 5",
      "typicalAgeRange": "10-11",
      "inLanguage": "en",
      "provider": { "@type": "Organization", "name": "Infano Care" }
    },
    {
      "@type": "Course",
      "name": "Emotions Are My Superpower",
      "courseCode": "INFANO-G6",
      "description": "Grade 6 module covering emotional intelligence, social media reality, and self-regulation skills. Designed for girls aged 11–12 navigating early adolescence.",
      "educationalLevel": "Grade 6",
      "typicalAgeRange": "11-12",
      "inLanguage": "en",
      "provider": { "@type": "Organization", "name": "Infano Care" }
    },
    {
      "@type": "Course",
      "name": "My Relationships, My Rules",
      "courseCode": "INFANO-G7",
      "description": "Grade 7 module covering consent education, digital safety, grooming awareness, and healthy boundary-setting. POCSO-aligned.",
      "educationalLevel": "Grade 7",
      "typicalAgeRange": "12-13",
      "inLanguage": "en",
      "provider": { "@type": "Organization", "name": "Infano Care" }
    },
    {
      "@type": "Course",
      "name": "I Know Who I Am",
      "courseCode": "INFANO-G8",
      "description": "Grade 8 module covering mental health awareness, identity development, self-esteem, and early intervention for anxiety and depression.",
      "educationalLevel": "Grade 8",
      "typicalAgeRange": "13-14",
      "inLanguage": "en",
      "provider": { "@type": "Organization", "name": "Infano Care" }
    },
    {
      "@type": "Course",
      "name": "Ready for the World",
      "courseCode": "INFANO-G9",
      "description": "Grade 9 capstone module covering reproductive health, ambition planning, career goals, and essential life skills for girls aged 14–15.",
      "educationalLevel": "Grade 9",
      "typicalAgeRange": "14-15",
      "inLanguage": "en",
      "provider": { "@type": "Organization", "name": "Infano Care" }
    }
  ]
};

export default function SchoolsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schoolServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schoolProgramSchema) }}
      />
      <SchoolHero />
      <SituationSection />
      <RealitySection />
      <GapSection />
      <IntroductionSection />
      <JourneySection />
      <SessionSection />
      <DigitalPlatformSection />
      <TeacherTrainingSection />
      <ParentLayerSection />
      <ImpactSection />
      <SchoolBeyondSection />
      <PartnershipTiers />
      <FoundingSchoolsSection />
      <PartnershipBanner />
    </div>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SchoolSubPage } from '@/features/marketing/components/sections/schools/SchoolSubPage';

const schoolPages = {
  programme: 'School Programme',
  requirements: 'School Requirements Self-Check',
  packages: 'School Packages & Pricing',
  'health-check': 'Free School Health Check',
  parents: 'For Parents at Partner Schools',
} satisfies Record<string, string>;

type SchoolPageSlug = keyof typeof schoolPages;

function isSchoolPageSlug(slug: string): slug is SchoolPageSlug {
  return Object.hasOwn(schoolPages, slug);
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: isSchoolPageSlug(slug) ? schoolPages[slug] : 'School Partnerships | Infano Care',
  };
}

export default async function SchoolSectionPage({ params }: PageProps) {
  const { slug } = await params;
  if (!isSchoolPageSlug(slug)) notFound();

  return <SchoolSubPage slug={slug} />;
}

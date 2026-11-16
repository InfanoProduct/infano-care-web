import { SchoolHealthCheckPage } from './health-check/SchoolHealthCheckPage';
import { SchoolParentsPage } from './parents/SchoolParentsPage';
import { SchoolPricingPage } from './pricing/SchoolPricingPage';
import { SchoolProgrammePage } from './programme/SchoolProgrammePage';
import { SchoolRequirementsPage } from './requirements/SchoolRequirementsPage';

const pages = {
  programme: SchoolProgrammePage,
  requirements: SchoolRequirementsPage,
  packages: SchoolPricingPage,
  'health-check': SchoolHealthCheckPage,
  parents: SchoolParentsPage,
};

export type SchoolPageSlug = keyof typeof pages;

export function SchoolSubPage({ slug }: { slug: SchoolPageSlug }) {
  const Page = pages[slug];
  return <Page />;
}

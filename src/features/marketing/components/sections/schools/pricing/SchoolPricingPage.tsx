import { SchoolTemplateShell } from '../SchoolTemplateShell';
import { PricingDesignSection00 } from './sections/PricingDesignSection00';
import { PricingDesignSection01 } from './sections/PricingDesignSection01';
import { PricingDesignSection02 } from './sections/PricingDesignSection02';
import { PricingDesignSection03 } from './sections/PricingDesignSection03';
import { PricingDesignSection04 } from './sections/PricingDesignSection04';
import { PricingDesignSection05 } from './sections/PricingDesignSection05';

export function SchoolPricingPage() {
  return (
    <SchoolTemplateShell pageClass="pr" activePage="/schools/packages">
      <PricingDesignSection00 />
      <PricingDesignSection01 />
      <PricingDesignSection02 />
      <PricingDesignSection03 />
      <PricingDesignSection04 />
      <PricingDesignSection05 />
    </SchoolTemplateShell>
  );
}

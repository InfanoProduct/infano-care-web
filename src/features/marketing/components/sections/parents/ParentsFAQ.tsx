'use client';

import { FaqSection } from '../FaqSection';
import { PARENTS_FAQS } from '../../../data/faqs';

export function ParentsFAQ() {
  return (
    <FaqSection 
      title="Frequently Asked Questions."
      items={PARENTS_FAQS}
      theme="slate"
    />
  );
}

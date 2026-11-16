import { SchoolTemplateShell } from '../SchoolTemplateShell';
import { OverviewDesignSection00 } from './sections/OverviewDesignSection00';
import { OverviewDesignSection01 } from './sections/OverviewDesignSection01';
import { OverviewDesignSection02 } from './sections/OverviewDesignSection02';
import { OverviewDesignSection03 } from './sections/OverviewDesignSection03';
import { OverviewDesignSection04 } from './sections/OverviewDesignSection04';
import { OverviewDesignSection05 } from './sections/OverviewDesignSection05';
import { OverviewDesignSection06 } from './sections/OverviewDesignSection06';
import { OverviewDesignSection07 } from './sections/OverviewDesignSection07';
import { OverviewDesignSection08 } from './sections/OverviewDesignSection08';
import { OverviewDesignSection09 } from './sections/OverviewDesignSection09';
import { OverviewDesignSection10 } from './sections/OverviewDesignSection10';
import { OverviewDesignSection11 } from './sections/OverviewDesignSection11';

export function SchoolOverviewPage() {
  return (
    <SchoolTemplateShell pageClass="hm" activePage="/schools">
      <OverviewDesignSection00 />
      <OverviewDesignSection01 />
      <OverviewDesignSection02 />
      <OverviewDesignSection03 />
      <OverviewDesignSection04 />
      <OverviewDesignSection05 />
      <OverviewDesignSection06 />
      <OverviewDesignSection07 />
      <OverviewDesignSection08 />
      <OverviewDesignSection09 />
      <OverviewDesignSection10 />
      <OverviewDesignSection11 />
    </SchoolTemplateShell>
  );
}

import { SchoolTemplateShell } from '../SchoolTemplateShell';
import { ProgrammeDesignSection00 } from './sections/ProgrammeDesignSection00';
import { ProgrammeDesignSection01 } from './sections/ProgrammeDesignSection01';
import { ProgrammeDesignSection02 } from './sections/ProgrammeDesignSection02';
import { ProgrammeDesignSection03 } from './sections/ProgrammeDesignSection03';
import { ProgrammeDesignSection04 } from './sections/ProgrammeDesignSection04';
import { ProgrammeDesignSection05 } from './sections/ProgrammeDesignSection05';
import { ProgrammeDesignSection06 } from './sections/ProgrammeDesignSection06';

export function SchoolProgrammePage() {
  return (
    <SchoolTemplateShell pageClass="pg" activePage="/schools/programme">
      <ProgrammeDesignSection00 />
      <ProgrammeDesignSection01 />
      <ProgrammeDesignSection02 />
      <ProgrammeDesignSection03 />
      <ProgrammeDesignSection04 />
      <ProgrammeDesignSection05 />
      <ProgrammeDesignSection06 />
    </SchoolTemplateShell>
  );
}

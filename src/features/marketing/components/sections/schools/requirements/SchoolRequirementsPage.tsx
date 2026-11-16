import { SchoolTemplateShell } from '../SchoolTemplateShell';
import { RequirementsDesignSection00 } from './sections/RequirementsDesignSection00';
import { RequirementsDesignSection01 } from './sections/RequirementsDesignSection01';
import { RequirementsDesignSection02 } from './sections/RequirementsDesignSection02';
import { RequirementsDesignSection03 } from './sections/RequirementsDesignSection03';

export function SchoolRequirementsPage() {
  return (
    <SchoolTemplateShell pageClass="rq" activePage="/schools/requirements">
      <RequirementsDesignSection00 />
      <RequirementsDesignSection01 />
      <RequirementsDesignSection02 />
      <RequirementsDesignSection03 />
    </SchoolTemplateShell>
  );
}

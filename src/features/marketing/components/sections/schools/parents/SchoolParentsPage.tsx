import { SchoolTemplateShell } from '../SchoolTemplateShell';
import { ParentsDesignSection00 } from './sections/ParentsDesignSection00';
import { ParentsDesignSection01 } from './sections/ParentsDesignSection01';
import { ParentsDesignSection02 } from './sections/ParentsDesignSection02';
import { ParentsDesignSection03 } from './sections/ParentsDesignSection03';
import { ParentsDesignSection04 } from './sections/ParentsDesignSection04';
import { ParentsDesignSection05 } from './sections/ParentsDesignSection05';

export function SchoolParentsPage() {
  return (
    <SchoolTemplateShell pageClass="pa" activePage="/schools/parents">
      <ParentsDesignSection00 />
      <ParentsDesignSection01 />
      <ParentsDesignSection02 />
      <ParentsDesignSection03 />
      <ParentsDesignSection04 />
      <ParentsDesignSection05 />
    </SchoolTemplateShell>
  );
}

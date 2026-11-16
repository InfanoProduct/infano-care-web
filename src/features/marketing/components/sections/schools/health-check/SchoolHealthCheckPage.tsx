import { SchoolTemplateShell } from '../SchoolTemplateShell';
import { HealthCheckDesignSection00 } from './sections/HealthCheckDesignSection00';

export function SchoolHealthCheckPage() {
  return (
    <SchoolTemplateShell pageClass="hc" activePage="/schools/health-check">
      <HealthCheckDesignSection00 />
    </SchoolTemplateShell>
  );
}

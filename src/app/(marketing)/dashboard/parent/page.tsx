import { ParentLinkManager } from "@/features/parent/components/ParentLinkManager";

export default function ParentDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="admin-header">
        <h1 className="text-3xl font-bold tracking-tight">Family Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your linked family accounts.
        </p>
      </div>

      <ParentLinkManager />
    </div>
  );
}

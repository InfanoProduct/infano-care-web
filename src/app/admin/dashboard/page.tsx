import { DashboardStats } from "@/features/dashboard/components/DashboardStats";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back to the Infano Care admin panel.
        </p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">System Activity</h3>
            <div className="flex gap-2">
              <span className="w-3 h-3 bg-primary rounded-full" />
              <span className="text-xs text-muted-foreground">User Growth</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
             Activity Chart Placeholder 
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6">Pending Tasks</h3>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 border-b border-border pb-4 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium">Verify Expert Application</p>
                  <p className="text-xs text-muted-foreground">Pending since 2 hours</p>
                </div>
                <button className="text-xs font-medium text-primary">Review</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

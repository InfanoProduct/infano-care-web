import { DashboardStats } from "@/features/dashboard/components/DashboardStats";
import { RevenueOverview } from "@/features/dashboard/components/RevenueOverview";
import { DashboardCharts } from "@/features/dashboard/components/DashboardCharts";
import { RecentActivity } from "@/features/dashboard/components/RecentActivity";
import { DetailedFeeds } from "@/features/dashboard/components/DetailedFeeds";
import { Calendar, ChevronDown } from "lucide-react";

export default function AdminDashboard() {
  const formatDate = () => {
    const d = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className="space-y-8 bg-[#F8F9FC] p-2 min-h-screen">
      {/* Overview Top Greetings & Date Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0F172A]">Welcome back, Admin! 👋</h1>
          <p className="text-xs font-bold text-[#64748B] mt-1">
            Here's what's happening with Infano Care today.
          </p>
        </div>

        {/* Date Selector Pill */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm cursor-pointer hover:bg-slate-50 transition-colors shrink-0">
          <Calendar size={15} className="text-[#64748B]" />
          <span className="text-xs font-black text-[#334155]">{formatDate()}</span>
          <ChevronDown size={14} className="text-[#94A3B8]" />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <DashboardStats />

      {/* Analytics: Revenue Donut & Growth Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <RevenueOverview />
        </div>
        <div className="lg:col-span-2">
          <DashboardCharts />
        </div>
      </div>

      {/* Middle section: Recent Activity & Shortcuts */}
      <RecentActivity />

      {/* Bottom section: Schools, Learning Programs, and Expert Bookings Detailed Feeds */}
      <DetailedFeeds />
    </div>
  );
}

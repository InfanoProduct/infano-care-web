'use client';

import Link from 'next/link';
import { 
  Users, ShieldCheck, Award, BookOpen, Book, ShoppingBag
} from 'lucide-react';
import { useDashboardStats } from '../hooks/use-dashboard-data';

interface DashboardStatsProps {
  startDate?: string;
  endDate?: string;
}

export function DashboardStats({ startDate, endDate }: DashboardStatsProps) {
  const { data, isLoading } = useDashboardStats(startDate, endDate);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl animate-pulse h-36" />
        ))}
      </div>
    );
  }

  const getBadgeStyles = (badgeStr: string) => {
    if (badgeStr.includes('↗')) {
      return 'bg-[#DCFCE7] text-[#15803D]';
    }
    if (badgeStr.includes('↘')) {
      return 'bg-[#FEE2E2] text-[#991B1B]';
    }
    return 'bg-[#F1F5F9] text-[#64748B]';
  };

  const kpis = [
    { 
      label: 'Total Members', 
      value: data?.totalMembers ?? 0, 
      icon: Users, 
      color: 'text-[#4F46E5]', 
      bg: 'bg-[#EEF2FF] border border-[#E0E7FF]',
      badge: data?.memberGrowth ?? '- 0%',
      href: '/admin/users' 
    },
    { 
      label: 'School Partners', 
      value: data?.schools ?? 0, 
      icon: ShieldCheck, 
      color: 'text-[#16A34A]', 
      bg: 'bg-[#ECFDF5] border border-[#D1FAE5]',
      badge: data?.schoolGrowth ?? '- 0%',
      href: '/admin/schools' 
    },
    { 
      label: 'Learning Programs', 
      value: data?.learningPrograms ?? 0, 
      icon: Award, 
      color: 'text-[#9333EA]', 
      bg: 'bg-[#FDF4FF] border border-[#F3E8FF]',
      badge: data?.programGrowth ?? '- 0%',
      href: '/admin/programs' 
    },
    { 
      label: 'Learning Journeys', 
      value: data?.totalJourneys ?? 0, 
      icon: BookOpen, 
      color: 'text-[#EA580C]', 
      bg: 'bg-[#FFF7ED] border border-[#FFEDD5]',
      badge: data?.journeyGrowth ?? '- 0%',
      href: '/admin/learning' 
    },
    { 
      label: 'Book Store Items', 
      value: data?.books ?? 0, 
      icon: Book, 
      color: 'text-[#DB2777]', 
      bg: 'bg-[#FDF2F8] border border-[#FCE7F3]',
      badge: data?.bookGrowth ?? '- 0%',
      href: '/admin/books' 
    },
    { 
      label: 'Shop Transactions', 
      value: data?.orders ?? 0, 
      icon: ShoppingBag, 
      color: 'text-[#E11D48]', 
      bg: 'bg-[#FFF1F2] border border-[#FFE4E6]',
      badge: data?.orderGrowth ?? '- 0%',
      href: '/admin/orders' 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {kpis.map((kpi) => (
        <Link key={kpi.label} href={kpi.href} className="block group">
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-40">
            {/* Icon Container */}
            <div className={`w-11 h-11 ${kpi.bg} rounded-2xl flex items-center justify-center`}>
              <kpi.icon className={kpi.color} size={22} />
            </div>

            {/* Labels and values */}
            <div className="mt-4">
              <p className="text-xs font-bold text-[#64748B]">{kpi.label}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-3xl font-black text-[#0F172A]">{kpi.value}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getBadgeStyles(kpi.badge)}`}>
                  {kpi.badge}
                </span>
              </div>
              <p className="text-[10px] text-[#94A3B8] font-bold mt-1">vs last 30 days</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

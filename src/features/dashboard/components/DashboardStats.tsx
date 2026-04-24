'use client';

import { Users, Calendar, DollarSign, TrendingUp, Book } from 'lucide-react';
import { useDashboardStats } from '../hooks/use-dashboard-data';

export function DashboardStats() {
  const { data, isLoading } = useDashboardStats();

  const stats = [
    { label: 'Total Members', value: data?.totalMembers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Consultations', value: data?.activeConsultations, icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Learning Journeys', value: data?.totalJourneys, icon: Book, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Growth', value: data?.growth, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-6 rounded-2xl animate-pulse">
            <div className="w-10 h-10 bg-secondary rounded-xl mb-4" />
            <div className="h-4 bg-secondary rounded w-1/2 mb-2" />
            <div className="h-8 bg-secondary rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat) => (
        <div key={stat.label} className="glass-card p-8 rounded-[2rem] transition-all hover:scale-[1.05] hover:shadow-glow border-white/50 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          
          <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white/40 group-hover:rotate-6 transition-transform`}>
            <stat.icon className={stat.color} size={28} />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground/80 mb-1">{stat.label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black tracking-tight text-foreground">{stat.value}</p>
            <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-md">+2.4%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

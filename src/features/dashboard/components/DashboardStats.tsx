'use client';

import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { useDashboardStats } from '../hooks/use-dashboard-data';

export function DashboardStats() {
  const { data, isLoading } = useDashboardStats();

  const stats = [
    { label: 'Total Patients', value: data?.totalPatients, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Appointments', value: data?.appointmentsToday, icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Revenue', value: data?.revenue, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="glass-card p-6 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-2xl">
          <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
            <stat.icon className={stat.color} size={24} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
          <p className="text-3xl font-bold mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

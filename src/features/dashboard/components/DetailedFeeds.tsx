'use client';

import Link from 'next/link';
import { 
  ShieldCheck, Award, Calendar, ArrowRight, ExternalLink 
} from 'lucide-react';
import { useDashboardStats } from '../hooks/use-dashboard-data';

interface DetailedFeedsProps {
  startDate?: string;
  endDate?: string;
}

export function DetailedFeeds({ startDate, endDate }: DetailedFeedsProps) {
  const { data, isLoading } = useDashboardStats(startDate, endDate);

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse h-48" />
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('active') || s.includes('completed') || s.includes('delivered')) {
      return 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]';
    }
    if (s.includes('scheduled') || s.includes('shipped') || s.includes('onboarding')) {
      return 'bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]';
    }
    return 'bg-[#FFE4E6] text-[#E11D48] border-[#FECDD3]';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 1. School Partnerships Feed */}
      <div className="bg-white border border-[#E2E8F0] p-8 rounded-[2rem] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#16A34A]" />
                <span>Partner Schools</span>
              </h3>
              <p className="text-[10px] text-[#64748B] font-bold mt-1">
                Latest signed school partnerships.
              </p>
            </div>
            <Link href="/admin/schools" className="text-xs font-black text-[#4F46E5] flex items-center gap-1 hover:underline">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {data.recentSchools.length === 0 ? (
              <p className="text-xs text-[#94A3B8] text-center py-6 font-bold">No school partnerships found.</p>
            ) : (
              data.recentSchools.map((school) => (
                <div key={school.id} className="flex justify-between items-center border-b border-[#F1F5F9] pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-xs font-black text-[#0f172a]">{school.name}</p>
                    <p className="text-[10px] text-[#64748B] font-bold mt-0.5">
                      {school.city} • <span className="text-[#4F46E5] font-black">{school.tier}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-[#0f172a]">
                      {school.totalMouValue ? `₹${school.totalMouValue.toLocaleString('en-IN')}` : 'MOU Pending'}
                    </p>
                    <span className="text-[9px] font-bold text-[#64748B] uppercase">{school.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 2. Learning Programs Feed */}
      <div className="bg-white border border-[#E2E8F0] p-8 rounded-[2rem] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                <Award size={18} className="text-[#9333EA]" />
                <span>Learning Programs</span>
              </h3>
              <p className="text-[10px] text-[#64748B] font-bold mt-1">
                Latest created learning courses.
              </p>
            </div>
            <Link href="/admin/programs" className="text-xs font-black text-[#4F46E5] flex items-center gap-1 hover:underline">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {data.recentPrograms.length === 0 ? (
              <p className="text-xs text-[#94A3B8] text-center py-6 font-bold">No learning programs created.</p>
            ) : (
              data.recentPrograms.map((prog) => (
                <div key={prog.id} className="flex justify-between items-center border-b border-[#F1F5F9] pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-xs font-black text-[#0f172a] truncate max-w-[180px]" title={prog.title}>
                      {prog.title}
                    </p>
                    <p className="text-[10px] text-[#64748B] font-bold mt-0.5">
                      {prog.duration}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-[#0f172a]">
                      ₹{(prog.revenue ?? 0).toLocaleString('en-IN')}
                    </p>
                    <span className="text-[9px] font-bold text-[#16A34A]">{prog.enrolledCount} enrolled</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. 1:1 Expert Bookings Feed */}
      <div className="bg-white border border-[#E2E8F0] p-8 rounded-[2rem] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                <Calendar size={18} className="text-[#14B8A6]" />
                <span>1:1 Expert Bookings</span>
              </h3>
              <p className="text-[10px] text-[#64748B] font-bold mt-1">
                Latest 1:1 consultation bookings.
              </p>
            </div>
            <Link href="/admin/expert" className="text-xs font-black text-[#4F46E5] flex items-center gap-1 hover:underline">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {data.recentBookings.length === 0 ? (
              <p className="text-xs text-[#94A3B8] text-center py-6 font-bold">No scheduled bookings logged.</p>
            ) : (
              data.recentBookings.map((booking) => (
                <div key={booking.id} className="flex justify-between items-center border-b border-[#F1F5F9] pb-3 last:border-0 last:pb-0 group">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs font-black text-[#0f172a] truncate max-w-[180px]">
                        {booking.user?.profile?.displayName || booking.user?.username || 'Client'}
                      </p>
                      <p className="text-[9px] text-[#64748B] font-bold mt-0.5">
                        {formatDate(booking.scheduledAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-[#0f172a]">
                      {booking.amount ? `₹${booking.amount.toLocaleString('en-IN')}` : '₹0'}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

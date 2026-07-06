'use client';

import { Info, Sparkles } from 'lucide-react';
import { useDashboardStats } from '../hooks/use-dashboard-data';

export function RevenueOverview() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading || !data) {
    return (
      <div className="bg-white border border-[#E2E8F0] p-8 rounded-[2rem] h-[360px] animate-pulse" />
    );
  }

  const total = data.totalRevenue || 1;
  const bookVal = data.bookRevenue ?? 0;
  const progVal = data.programRevenue ?? 0;
  const expVal = data.expertRevenue ?? 0;

  const bookPct = Math.round((bookVal / total) * 100);
  const progPct = Math.round((progVal / total) * 100);
  const expPct = Math.round((expVal / total) * 100);

  // SVG Donut Chart Geometry
  const r = 50;
  const perimeter = 2 * Math.PI * r; // ~314.16

  const seg1Length = (bookVal / total) * perimeter;
  const seg2Length = (progVal / total) * perimeter;
  const seg3Length = (expVal / total) * perimeter;

  const offset1 = 0;
  const offset2 = -seg1Length;
  const offset3 = -(seg1Length + seg2Length);

  return (
    <div className="bg-white border border-[#E2E8F0] p-8 rounded-[2rem] flex flex-col justify-between h-full">
      <div>
        <h3 className="text-[#0F172A] text-lg font-black tracking-tight">Revenue Overview</h3>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-center mt-6">
        {/* Left Side Details */}
        <div className="xl:col-span-5 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[#64748B]">
              <span className="text-xs font-bold uppercase tracking-wider">Total Combined Revenue</span>
              <Info size={14} className="cursor-help" />
            </div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-4xl font-black tracking-tight text-[#0F172A]">
                ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#15803D]">
                ↗ {data.growth ?? '14.3%'}
              </span>
              <span className="text-[10px] text-[#94A3B8] font-bold">vs last 30 days</span>
            </div>
          </div>

          <div className="p-4 bg-[#FEF3C7] rounded-2xl border border-[#FDE68A] flex items-start gap-2.5">
            <Sparkles size={16} className="text-[#D97706] shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#D97706] font-bold leading-normal">
              Aggregated across all store sales, learning program enrollment fees, and expert bookings.
            </p>
          </div>
        </div>

        {/* Donut Chart & Legends */}
        <div className="xl:col-span-7 flex flex-col sm:flex-row items-center gap-10 sm:gap-14 justify-start xl:justify-center">
          {/* SVG Donut Chart */}
          <div className="relative w-48 h-48 sm:w-52 sm:h-52 shrink-0">
            <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r={r}
                fill="transparent"
                stroke="#F1F5F9"
                strokeWidth="12"
              />
              {/* Segment 1: Book Store Sales (Pink: #EC4899) */}
              {bookVal > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={r}
                  fill="transparent"
                  stroke="#EC4899"
                  strokeWidth="12"
                  strokeDasharray={`${seg1Length} ${perimeter}`}
                  strokeDashoffset={offset1}
                  strokeLinecap={bookVal === total ? 'butt' : 'round'}
                  className="transition-all duration-500"
                />
              )}
              {/* Segment 2: Program Enrollment Fees (Purple: #8B5CF6) */}
              {progVal > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={r}
                  fill="transparent"
                  stroke="#8B5CF6"
                  strokeWidth="12"
                  strokeDasharray={`${seg2Length} ${perimeter}`}
                  strokeDashoffset={offset2}
                  strokeLinecap={progVal === total ? 'butt' : 'round'}
                  className="transition-all duration-500"
                />
              )}
              {/* Segment 3: Expert Consultation Bookings (Green: #10B981) */}
              {expVal > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={r}
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="12"
                  strokeDasharray={`${seg3Length} ${perimeter}`}
                  strokeDashoffset={offset3}
                  strokeLinecap={expVal === total ? 'butt' : 'round'}
                  className="transition-all duration-500"
                />
              )}
            </svg>
            {/* Center Text inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Total</span>
              <span className="text-base sm:text-lg font-black text-[#0F172A] truncate max-w-[110px] mt-0.5">
                ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Legends */}
          <div className="space-y-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EC4899]" />
                <span className="text-[10px] font-bold text-[#475569]">Book Store Sales</span>
              </div>
              <p className="text-xs font-black text-[#0F172A] pl-3.5">
                ₹{bookVal.toLocaleString('en-IN')}
              </p>
              <p className="text-[9px] text-[#64748B] pl-3.5 font-bold">{bookPct}% of total</p>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                <span className="text-[10px] font-bold text-[#475569]">Program Enrollment Fees</span>
              </div>
              <p className="text-xs font-black text-[#0F172A] pl-3.5">
                ₹{progVal.toLocaleString('en-IN')}
              </p>
              <p className="text-[9px] text-[#64748B] pl-3.5 font-bold">{progPct}% of total</p>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-[10px] font-bold text-[#475569]">Expert Consultation Bookings</span>
              </div>
              <p className="text-xs font-black text-[#0F172A] pl-3.5">
                ₹{expVal.toLocaleString('en-IN')}
              </p>
              <p className="text-[9px] text-[#64748B] pl-3.5 font-bold">{expPct}% of total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

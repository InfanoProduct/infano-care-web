'use client';

import React, { useState } from 'react';
import { DashboardStats } from "@/features/dashboard/components/DashboardStats";
import { RevenueOverview } from "@/features/dashboard/components/RevenueOverview";
import { DashboardCharts } from "@/features/dashboard/components/DashboardCharts";
import { RecentActivity } from "@/features/dashboard/components/RecentActivity";
import { DetailedFeeds } from "@/features/dashboard/components/DetailedFeeds";
import { useDashboardStats } from "@/features/dashboard/hooks/use-dashboard-data";
import { Calendar } from "lucide-react";

export default function AdminDashboard() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const { data, isLoading } = useDashboardStats(
    startDate || undefined,
    endDate || undefined
  );

  const handleClearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  const isEmptyData = data && (startDate || endDate) && 
    data.totalRevenue === 0 && 
    (!data.recentOrders || data.recentOrders.length === 0) && 
    (!data.recentSchools || data.recentSchools.length === 0) && 
    (!data.recentBookings || data.recentBookings.length === 0) && 
    (!data.recentPrograms || data.recentPrograms.length === 0);

  return (
    <div className="space-y-8 bg-[#F8F9FC] p-2 min-h-screen">
      
      {/* Overview Top Greetings & Date selector */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0F172A]">Welcome back, Admin! 👋</h1>
          <p className="text-xs font-bold text-[#64748B] mt-1">
            Here's what's happening with Infano Care today.
          </p>
        </div>

        {/* Date Selector Inputs at the top right */}
        <div className="flex flex-wrap items-center gap-3 bg-white px-5 py-3 border border-[#E2E8F0] rounded-[1.5rem] shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-primary shrink-0" />
            <span className="text-[10px] font-black text-slate-400 uppercase shrink-0">From</span>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-primary/50 bg-slate-50/50 cursor-pointer text-slate-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase shrink-0">To</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-primary/50 bg-slate-50/50 cursor-pointer text-slate-700"
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={handleClearDates}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 animate-in fade-in duration-300">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl animate-pulse h-36" />
          ))}
        </div>
      ) : isEmptyData ? (
        <div className="bg-white border border-[#E2E8F0] p-12 rounded-[2rem] text-center space-y-4 shadow-sm animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto text-2xl">
            ⚠️
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-black text-slate-800">No Data Available</h3>
            <p className="text-xs text-slate-400 font-bold leading-relaxed">
              No transactions, members, bookings, or school collaborations were recorded in the selected period from <span className="text-slate-700">{startDate}</span> to <span className="text-slate-700">{endDate}</span>.
            </p>
          </div>
          <button 
            onClick={handleClearDates}
            className="px-6 py-2.5 bg-primary text-white text-xs font-black rounded-xl shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            Clear Date Range Filter
          </button>
        </div>
      ) : (
        <>
          {/* KPI Cards Grid */}
          <DashboardStats startDate={startDate} endDate={endDate} />

          {/* Analytics: Revenue Donut & Growth Line Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <RevenueOverview startDate={startDate} endDate={endDate} />
            </div>
            <div className="lg:col-span-2">
              <DashboardCharts startDate={startDate} endDate={endDate} />
            </div>
          </div>

          {/* Middle section: Recent Activity & Shortcuts */}
          <RecentActivity startDate={startDate} endDate={endDate} />

          {/* Bottom section: Schools, Learning Programs, and Expert Bookings Detailed Feeds */}
          <DetailedFeeds startDate={startDate} endDate={endDate} />
        </>
      )}
    </div>
  );
}

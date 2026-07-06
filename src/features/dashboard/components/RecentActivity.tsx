'use client';

import Link from 'next/link';
import { 
  ShoppingBag, ArrowRight, Plus, FileText, Library, BarChart2, Award, BookOpen, ShieldCheck
} from 'lucide-react';
import { useDashboardStats } from '../hooks/use-dashboard-data';

export function RecentActivity() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse h-48" />
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'am' : 'pm';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');
    
    return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
  };

  const getStatusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('delivered') || s.includes('completed')) {
      return 'bg-[#DCFCE7] text-[#15803D]';
    }
    if (s.includes('shipped') || s.includes('scheduled')) {
      return 'bg-[#DBEAFE] text-[#1D4ED8]';
    }
    return 'bg-[#FFE4E6] text-[#E11D48]'; // PLACED or PENDING
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 1. Recent Shop Transactions Table */}
      <div className="lg:col-span-2 bg-white border border-[#E2E8F0] p-8 rounded-[2rem] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#E11D48]" />
                <span>Recent Shop Transactions</span>
              </h3>
              <p className="text-xs text-[#64748B] font-bold mt-1">
                Latest orders received in the book store.
              </p>
            </div>
            <Link href="/admin/orders" className="text-xs font-black text-[#4F46E5] flex items-center gap-1 hover:underline">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F1F5F9]">
                  <th className="text-[10px] font-black uppercase tracking-wider text-[#94A3B8] pb-3">User</th>
                  <th className="text-[10px] font-black uppercase tracking-wider text-[#94A3B8] pb-3">Date</th>
                  <th className="text-[10px] font-black uppercase tracking-wider text-[#94A3B8] pb-3">Amount</th>
                  <th className="text-[10px] font-black uppercase tracking-wider text-[#94A3B8] pb-3">Status</th>
                  <th className="text-[10px] font-black uppercase tracking-wider text-[#94A3B8] pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {data.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-[#94A3B8] font-bold">No orders found.</td>
                  </tr>
                ) : (
                  data.recentOrders.map((order) => {
                    let displayName = 'Guest User';
                    if (order.user) {
                      displayName = order.user.profile?.displayName || order.user.username || 'User';
                      if (displayName.includes('@')) {
                        displayName = displayName.split('@')[0];
                      }
                    } else if (order.guestName) {
                      displayName = order.guestName;
                    }
                    const firstChar = displayName[0]?.toUpperCase() || 'G';
                    return (
                      <tr key={order.id} className="group hover:bg-[#F8F9FC]/30 transition-colors">
                        <td className="py-4 flex items-center gap-3">
                          {/* Round Avatar badge */}
                          <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center font-black text-xs">
                            {firstChar}
                          </div>
                          <span className="text-xs font-black text-[#0F172A]">
                            {displayName}
                          </span>
                        </td>
                        <td className="py-4 text-[11px] text-[#64748B] font-bold">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-4 text-xs font-black text-[#0F172A]">
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusClass(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <Link href={`/admin/orders/${order.id}`} className="text-xs font-black text-[#4F46E5] inline-flex items-center gap-1 hover:underline">
                            <span>Details</span>
                            <ArrowRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. Shortcuts & Publishing Actions */}
      <div className="bg-white border border-[#E2E8F0] p-8 rounded-[2rem] flex flex-col justify-between gap-6">
        <div>
          <h3 className="text-lg font-black text-[#0F172A] tracking-tight flex items-center gap-2 mb-6">
            <BarChart2 size={20} className="text-[#F59E0B] rotate-90" />
            <span>Shortcuts & Publishing</span>
          </h3>

          <div className="space-y-4">
            {/* Shortcut 1: Write a Blog Post */}
            <div className="border border-[#E2E8F0] p-3 rounded-2xl flex items-center justify-between bg-white hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center border border-[#E9E3FF] shrink-0">
                  <FileText size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#0F172A]">Write a Blog Post</h4>
                  <p className="text-[9px] text-[#64748B] font-bold">{data.blogs} total published posts</p>
                </div>
              </div>
              <Link href="/admin/blogs" className="w-7 h-7 rounded-full bg-[#F8F9FC] text-[#0F172A] hover:bg-[#EEF2FF] hover:text-[#4F46E5] flex items-center justify-center transition-colors border border-slate-100 shadow-sm shrink-0">
                <Plus size={14} />
              </Link>
            </div>

            {/* Shortcut 2: Add Shop Book */}
            <div className="border border-[#E2E8F0] p-3 rounded-2xl flex items-center justify-between bg-white hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center border border-[#FFE4E6] shrink-0">
                  <Library size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#0F172A]">Add Shop Book</h4>
                  <p className="text-[9px] text-[#64748B] font-bold">Manage your book inventory</p>
                </div>
              </div>
              <Link href="/admin/books" className="w-7 h-7 rounded-full bg-[#F8F9FC] text-[#0F172A] hover:bg-[#FFF1F2] hover:text-[#E11D48] flex items-center justify-center transition-colors border border-slate-100 shadow-sm shrink-0">
                <Plus size={14} />
              </Link>
            </div>

            {/* Shortcut 3: Add Learning Program */}
            <div className="border border-[#E2E8F0] p-3 rounded-2xl flex items-center justify-between bg-white hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FDF4FF] text-[#9333EA] flex items-center justify-center border border-[#F3E8FF] shrink-0">
                  <Award size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#0F172A]">Add Learning Program</h4>
                  <p className="text-[9px] text-[#64748B] font-bold">{data.learningPrograms} total programs</p>
                </div>
              </div>
              <Link href="/admin/programs" className="w-7 h-7 rounded-full bg-[#F8F9FC] text-[#0F172A] hover:bg-[#FDF4FF] hover:text-[#9333EA] flex items-center justify-center transition-colors border border-slate-100 shadow-sm shrink-0">
                <Plus size={14} />
              </Link>
            </div>

            {/* Shortcut 4: Create Learning Journey */}
            <div className="border border-[#E2E8F0] p-3 rounded-2xl flex items-center justify-between bg-white hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center border border-[#FFEDD5] shrink-0">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#0F172A]">Create Learning Journey</h4>
                  <p className="text-[9px] text-[#64748B] font-bold">{data.totalJourneys} total journeys</p>
                </div>
              </div>
              <Link href="/admin/learning" className="w-7 h-7 rounded-full bg-[#F8F9FC] text-[#0F172A] hover:bg-[#FFF7ED] hover:text-[#EA580C] flex items-center justify-center transition-colors border border-slate-100 shadow-sm shrink-0">
                <Plus size={14} />
              </Link>
            </div>

            {/* Shortcut 5: Register Partner School */}
            <div className="border border-[#E2E8F0] p-3 rounded-2xl flex items-center justify-between bg-white hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#16A34A] flex items-center justify-center border border-[#D1FAE5] shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#0F172A]">Register Partner School</h4>
                  <p className="text-[9px] text-[#64748B] font-bold">{data.schools} partner schools</p>
                </div>
              </div>
              <Link href="/admin/schools" className="w-7 h-7 rounded-full bg-[#F8F9FC] text-[#0F172A] hover:bg-[#ECFDF5] hover:text-[#16A34A] flex items-center justify-center transition-colors border border-slate-100 shadow-sm shrink-0">
                <Plus size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

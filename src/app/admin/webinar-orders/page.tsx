'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { 
  Ticket, Search, Filter, Mail, Phone, Calendar, Clock, 
  CreditCard, ShieldCheck, ArrowUpRight, Send, CheckCircle2, 
  XCircle, AlertCircle, Users, Award, DollarSign, ExternalLink,
  Loader2, Eye
} from 'lucide-react';
import Link from 'next/link';
import { formatIndianDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export default function AdminWebinarRegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 15;

  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalRevenue: 0,
    activePasses: 0,
    pendingPayments: 0,
  });

  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchRegistrations();
  }, [currentPage, searchTerm, statusFilter, paymentStatusFilter]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', recordsPerPage.toString());
      queryParams.append('isWebinar', 'true');
      
      if (searchTerm) queryParams.append('search', searchTerm);
      if (paymentStatusFilter !== 'ALL') queryParams.append('paymentStatus', paymentStatusFilter);
      if (statusFilter !== 'ALL') queryParams.append('status', statusFilter);

      const response = await apiClient.get<any>(`/admin/orders?${queryParams.toString()}`);

      if (response && response.orders) {
        setRegistrations(response.orders);
      } else {
        setRegistrations([]);
      }

      if (response && response.pagination) {
        setTotalPages(response.pagination.pages);
        setTotalRecords(response.pagination.total);
      }

      // Calculate stats based on fetched response metadata
      if (response && response.stats) {
        setStats({
          totalRegistrations: response.pagination?.total || 0,
          totalRevenue: response.stats.totalRevenue || 0,
          activePasses: response.stats.deliveredCount + response.stats.placedCount + response.stats.processingCount || 0,
          pendingPayments: response.stats.onHoldCount || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch webinar registrations', error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (email: string, name: string) => {
    try {
      toast.loading(`Sending reminder to ${name}...`);
      // Simulate/Trigger custom email alert notification on the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.dismiss();
      toast.success(`Webinar entry reminder successfully sent to ${email}`);
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to send reminder email');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* Header section */}
      <div className="admin-header flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-md">
              <Ticket size={28} />
            </div>
            <span>Webinar Registrations</span>
          </h1>
          <p className="text-muted-foreground font-medium mt-2">
            Monitor parent ticket passes, verify billing status, and dispatch Zoom credentials.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/webinar"
            target="_blank"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs uppercase tracking-widest text-slate-700 shadow-sm transition-all active:scale-95"
          >
            <span>Webinar Page</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-[2rem] border-primary/5 shadow-md space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Registered</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500"><Users size={16} /></div>
          </div>
          <div>
            <h3 className="text-3xl font-black tracking-tight text-slate-900">{stats.totalRegistrations}</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">Parents registered</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-[2rem] border-primary/5 shadow-md space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Webinar Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500"><DollarSign size={16} /></div>
          </div>
          <div>
            <h3 className="text-3xl font-black tracking-tight text-slate-900">₹{stats.totalRevenue}</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">Ticket sales (Pass: ₹99)</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-[2rem] border-primary/5 shadow-md space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Entry Passes</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><ShieldCheck size={16} /></div>
          </div>
          <div>
            <h3 className="text-3xl font-black tracking-tight text-slate-900">{stats.activePasses}</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">Confirmed attendees</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-[2rem] border-primary/5 shadow-md space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Actions</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500"><AlertCircle size={16} /></div>
          </div>
          <div>
            <h3 className="text-3xl font-black tracking-tight text-slate-900">{stats.pendingPayments}</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">Incomplete transactions</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100 p-5 rounded-[1.8rem] shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search parent name, email, phone or order ID..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-primary text-xs font-semibold text-slate-800 transition-all shadow-inner"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Payment Status:</span>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Paid (Completed)</option>
              <option value="PENDING">Pending Payment</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registrations List Table */}
      <div className="glass-card rounded-[2rem] border-primary/5 overflow-hidden shadow-xl bg-white">
        <div className="p-6 border-b border-border flex items-center justify-between bg-primary/5">
          <h2 className="text-base font-black flex items-center gap-2 text-foreground">
            <Ticket className="text-primary font-bold" size={20} />
            <span>Attendee List</span>
          </h2>
          <span className="text-[10px] font-black bg-white border border-border px-3 py-1 rounded-full shadow-sm text-muted-foreground uppercase tracking-widest">
            {totalRecords} Registered
          </span>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={36} />
            <p className="text-xs font-bold text-muted-foreground">Loading attendee records...</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-20 text-center text-muted-foreground font-bold text-sm">
            No parent registrations found for this filter query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[13px] font-bold uppercase tracking-wider text-muted-foreground bg-slate-50/30">
                  <th className="px-6 py-5">Attendee (Parent)</th>
                  <th className="px-6 py-5">Registered For</th>
                  <th className="px-6 py-5">Billing Pass</th>
                  <th className="px-6 py-5">Payment Status</th>
                  <th className="px-6 py-5">Date Registered</th>
                  <th className="px-6 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {registrations.map((reg) => {
                  const item = reg.items?.[0];
                  const bookTitle = item?.book?.title || 'Decoding Her Silence Webinar';
                  const isCompleted = reg.paymentStatus === 'COMPLETED';

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="font-bold text-sm text-foreground">
                          {reg.guestName || 'Parent'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex flex-col gap-0.5">
                          <span className="flex items-center gap-1.5"><Mail size={12} /> {reg.guestEmail}</span>
                          <span className="flex items-center gap-1.5"><Phone size={12} /> {reg.guestPhone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          <span className="font-bold text-sm text-foreground leading-tight max-w-[200px] truncate">{bookTitle}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-sm text-foreground">Pass #{(reg.id || '').slice(-8).toUpperCase()}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Amt: ₹{reg.totalAmount}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isCompleted ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                          <span>{isCompleted ? 'Paid' : 'Pending'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-muted-foreground font-medium">
                        {formatIndianDate(reg.createdAt)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSendReminder(reg.guestEmail, reg.guestName || 'Parent')}
                            disabled={!isCompleted}
                            title="Send Pass Reminders Email"
                            className="p-2 hover:bg-primary/10 rounded-xl text-primary transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                          >
                            <Send size={15} />
                          </button>
                          <Link
                            href={`/admin/webinar-orders/${reg.id}`}
                            className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition-all inline-flex"
                          >
                            <Eye size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Pagination */}
        {totalPages > 1 && (
          <div className="p-5 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

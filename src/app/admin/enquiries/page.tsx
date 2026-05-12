'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useEnquiries } from '@/features/enquiries/hooks/use-enquiries';
import { 
  FileQuestion, Search, Mail, Phone, 
  Building2, Clock, Eye
} from 'lucide-react';

export default function EnquiriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: enquiries = [], isLoading, error } = useEnquiries();

  const filteredEnquiries = enquiries.filter((enq: any) => 
    enq.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    enq.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    enq.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Skeleton Row Component
  const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-border">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
          <div className="space-y-2">
            <div className="h-3 w-24 bg-slate-100 rounded" />
            <div className="h-2 w-12 bg-slate-100 rounded" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-slate-100 rounded" />
          <div className="h-2 w-28 bg-slate-100 rounded" />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-7 w-24 bg-slate-100 rounded-xl" />
      </td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="h-3 w-16 bg-slate-100 rounded" />
          <div className="h-2 w-10 bg-slate-100 rounded" />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-3 w-20 bg-slate-100 rounded" />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="h-8 w-8 bg-slate-100 rounded-xl ml-auto" />
      </td>
    </tr>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            School <span className="text-primary">Enquiries</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and respond to school partnership enquiries</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search enquiries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-5 py-2.5 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary/30 outline-none w-full md:w-72 shadow-sm transition-all text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="glass-card rounded-2xl overflow-hidden border-white/40 shadow-xl relative min-h-[300px]">
        {error ? (
          <div className="p-12 text-center text-red-500 bg-red-50/50">
            <p className="font-bold">Error loading enquiries. Please try again later.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-border">
                  <th className="px-6 py-4 text-[11px] uppercase tracking-[0.15em] font-semibold text-muted-foreground">School Info</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-[0.15em] font-semibold text-muted-foreground">Contact Person</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-[0.15em] font-semibold text-muted-foreground">Phone Number</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-[0.15em] font-semibold text-muted-foreground">Submitted On</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-[0.15em] font-semibold text-muted-foreground">Preferred Time</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white/40">
                {isLoading ? (
                  // Show 5 skeleton rows while loading
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : (
                  filteredEnquiries.map((enquiry: any) => (
                    <tr key={enquiry.id} className="hover:bg-primary/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary-light/5 flex items-center justify-center text-primary font-bold text-sm shadow-sm border border-primary/10 group-hover:scale-110 transition-transform shrink-0">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-slate-800 block leading-tight">{enquiry.schoolName}</span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{enquiry.schoolType || 'General'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <span className="text-sm font-medium text-slate-600 block">{enquiry.contactName || '—'}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail size={12} /> {enquiry.email}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary rounded-xl text-sm font-bold border border-primary/10">
                          <Phone size={14} />
                          {enquiry.phone || '—'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-600 font-medium">{formatDate(enquiry.createdAt)}</span>
                          <span className="text-[10px] text-muted-foreground">{formatTime(enquiry.createdAt)}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-medium flex items-center gap-1">
                          <Clock size={14} className="text-muted-foreground" />
                          {enquiry.preferredTime || '—'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/enquiries/${enquiry.id}`}
                          className="p-2 hover:bg-primary/10 rounded-xl transition-all text-primary inline-block"
                        >
                          <Eye size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}

                {!isLoading && filteredEnquiries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                          <FileQuestion size={22} className="text-slate-300" />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">No enquiries found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

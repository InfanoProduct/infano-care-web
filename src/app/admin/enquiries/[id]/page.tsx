'use client';

import { useEnquiry } from '@/features/enquiries/hooks/use-enquiries';
import { 
  Loader2, Mail, Phone, Building2, User, Clock, 
  MessageSquare, ChevronLeft, Calendar, MapPin
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EnquiryDetailPage() {
  const { id } = useParams() as { id: string };
  const { data: enquiry, isLoading, error } = useEnquiry(id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header - Always Visible */}
      <div className="flex flex-col gap-4">
        <Link href="/admin/enquiries" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold text-sm w-fit">
          <ChevronLeft size={18} /> Back to all Enquiries
        </Link>
        
        {enquiry && (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-primary rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-primary/20">
                <Building2 size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-800">{enquiry.schoolName}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-wider border border-primary/20">
                    {enquiry.schoolType || 'General Enquiry'}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Calendar size={14} /> Submitted {formatDate(enquiry.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-4 rounded-[2.5rem]">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-sm font-bold text-primary/60 italic tracking-widest uppercase">Loading Details...</p>
          </div>
        )}

        {error || (!enquiry && !isLoading) ? (
          <div className="p-12 text-center text-red-500 bg-red-50 rounded-[2.5rem] border border-red-100">
            <p className="font-bold">Error loading enquiry details. It may not exist or has been removed.</p>
            <Link href="/admin/enquiries" className="mt-4 inline-flex items-center gap-2 text-primary font-bold hover:underline">
              <ChevronLeft size={20} /> Back to Enquiries
            </Link>
          </div>
        ) : enquiry && (
          <div className={`grid lg:grid-cols-3 gap-8 transition-opacity duration-300 ${isLoading ? 'opacity-20' : 'opacity-100'}`}>
            {/* Left Column: Details Cards */}
            <div className="lg:col-span-2 space-y-8">
              {/* Main Info Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Contact Card */}
                <div className="glass-card p-8 rounded-[2rem] border-white/40 shadow-xl space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <User size={16} /> Contact Representative
                  </h3>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Name & Position</p>
                        <p className="text-lg font-black text-slate-700">{enquiry.contactName || 'Not Provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                        <Mail size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Email Address</p>
                        <p className="text-sm font-bold text-slate-700">{enquiry.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Phone size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Phone Number</p>
                        <p className="text-xl font-black text-primary">{enquiry.phone || '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* School Detail Card */}
                <div className="glass-card p-8 rounded-[2rem] border-white/40 shadow-xl space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <Building2 size={16} /> School Statistics
                  </h3>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Location</p>
                        <p className="text-sm font-bold text-slate-700">{enquiry.cityState || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Total Girls (Grades 6–12)</p>
                        <p className="text-lg font-black text-slate-700">{enquiry.totalGirls || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Preferred Consult Time</p>
                        <p className="text-sm font-bold text-slate-700">{enquiry.preferredTime || '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Goals Card */}
              <div className="glass-card p-10 rounded-[2.5rem] border-white/40 shadow-xl space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                  <MessageSquare size={18} /> Strategic Programme Goals
                </h3>
                <div className="p-8 bg-slate-50/50 rounded-[1.5rem] border border-slate-100">
                  <p className="text-lg text-slate-600 leading-relaxed italic font-medium">
                    "{enquiry.goals || "The applicant did not provide specific goals for this enquiry."}"
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Meta Info */}
            <div className="space-y-8">
              <div className="glass-card p-8 rounded-[2rem] border-white/40 shadow-xl bg-gradient-to-br from-white/50 to-primary/5">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                  <Clock size={16} /> Submission Timeline
                </h3>
                <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  <div className="relative pl-12">
                    <div className="absolute left-0 top-1 w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center z-10">
                      <Calendar size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Date Received</p>
                      <p className="text-sm font-bold text-slate-700">{formatDate(enquiry.createdAt)}</p>
                    </div>
                  </div>
                  <div className="relative pl-12">
                    <div className="absolute left-0 top-1 w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center z-10">
                      <Clock size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Exact Time</p>
                      <p className="text-sm font-bold text-slate-700">{formatTime(enquiry.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 rounded-[2rem] border-white/40 shadow-xl bg-white/30 backdrop-blur-sm">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Internal Actions</h3>
                <div className="space-y-3">
                  <button className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Mail size={18} /> Mark as Responded
                  </button>
                  <button className="w-full py-4 bg-white border border-border text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <Clock size={18} /> Schedule Follow-up
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

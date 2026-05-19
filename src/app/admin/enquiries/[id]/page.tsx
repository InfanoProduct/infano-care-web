'use client';

import { useEnquiry } from '@/features/enquiries/hooks/use-enquiries';
import { 
  Loader2, Mail, Phone, Building2, User, Clock, 
  MessageSquare, ChevronLeft, Calendar, MapPin, UserCircle, Handshake
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EnquiryDetailPage() {
  const { id } = useParams() as { id: string };
  const { data: realEnquiry, isLoading, error } = useEnquiry(id);

  // Fallback to empty data to ensure instant UI layout rendering while loading
  const enquiry = realEnquiry || {
    id: id as string,
    type: 'school',
    schoolName: '',
    contactName: '',
    email: '',
    phone: '',
    createdAt: new Date().toISOString(),
    schoolType: '',
    totalGirls: 0,
    cityState: '',
    preferredTime: '',
    goals: '',
    details: '',
    ngoDetail: '',
    peerMentorName: '',
    preferredDate: ''
  };
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'school': return 'bg-primary text-white shadow-primary/20';
      case 'parent': return 'bg-emerald-500 text-white shadow-emerald-500/20';
      case 'partner': return 'bg-blue-500 text-white shadow-blue-500/20';
      case 'peer_connect': return 'bg-violet-600 text-white shadow-violet-600/20';
      default: return 'bg-slate-500 text-white shadow-slate-500/20';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'school': return 'School Partnership';
      case 'parent': return 'Parent/Carer Enquiry';
      case 'partner': return 'NGO/Partner Enquiry';
      case 'peer_connect': return 'Peer Mentor Booking';
      default: return 'Enquiry';
    }
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
              <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-xl ${getTypeColor(enquiry.type)}`}>
                {enquiry.type === 'school' ? <Building2 size={28} /> : enquiry.type === 'peer_connect' ? <UserCircle size={28} /> : enquiry.type === 'parent' ? <UserCircle size={28} /> : <Handshake size={28} />}
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                  {enquiry.type === 'peer_connect' ? `Session with ${enquiry.peerMentorName || 'Peer Mentor'}` : enquiry.type === 'school' ? enquiry.schoolName : enquiry.contactName}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${enquiry.type === 'school' ? 'bg-primary/10 text-primary border-primary/20' : enquiry.type === 'parent' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : enquiry.type === 'peer_connect' ? 'bg-violet-600/10 text-violet-600 border-violet-600/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'}`}>
                    {getTypeLabel(enquiry.type)}
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
        {error ? (
          <div className="p-12 text-center text-red-500 bg-red-50 rounded-[2.5rem] border border-red-100">
            <p className="font-bold">Error loading enquiry details. It may not exist or has been removed.</p>
            <Link href="/admin/enquiries" className="mt-4 inline-flex items-center gap-2 text-primary font-bold hover:underline">
              <ChevronLeft size={20} /> Back to Enquiries
            </Link>
          </div>
        ) : (
          <div className={`grid lg:grid-cols-3 gap-8 transition-opacity duration-300 ${isLoading && !realEnquiry ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
            {/* Left Column: Details Cards */}
            <div className="lg:col-span-2 space-y-8">
              {/* Main Info Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Contact Card */}
                <div className="glass-card p-8 rounded-[2rem] border-white/40 shadow-xl space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <User size={16} /> Contact Information
                  </h3>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Full Name</p>
                        <p className="text-lg font-black text-slate-700">{enquiry.contactName || '—'}</p>
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

                {/* Specific Detail Card */}
                <div className="glass-card p-8 rounded-[2rem] border-white/40 shadow-xl space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    {enquiry.type === 'school' ? <Building2 size={16} /> : enquiry.type === 'partner' ? <Handshake size={16} /> : enquiry.type === 'peer_connect' ? <UserCircle size={16} /> : <MapPin size={16} />}
                    {enquiry.type === 'school' ? 'School Statistics' : enquiry.type === 'partner' ? 'Organization Detail' : enquiry.type === 'peer_connect' ? 'Session Details' : 'Location Details'}
                  </h3>
                  <div className="space-y-5">
                    {enquiry.type === 'school' ? (
                      <>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">School Type</p>
                            <p className="text-sm font-bold text-slate-700">{enquiry.schoolType || '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Total Girls (6–12)</p>
                            <p className="text-lg font-black text-slate-700">{enquiry.totalGirls || '—'}</p>
                          </div>
                        </div>
                      </>
                    ) : enquiry.type === 'partner' ? (
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                          <Handshake size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Organization Info</p>
                          <p className="text-sm font-bold text-slate-700">{enquiry.ngoDetail || '—'}</p>
                        </div>
                      </div>
                    ) : enquiry.type === 'peer_connect' ? (
                      <>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Selected Peer Mentor</p>
                            <p className="text-sm font-bold text-slate-700">{enquiry.peerMentorName || '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                            <Calendar size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Preferred Date</p>
                            <p className="text-sm font-bold text-slate-700">{enquiry.preferredDate || '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                            <Clock size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Preferred Time Slot</p>
                            <p className="text-sm font-bold text-slate-700">{enquiry.preferredTime || '—'}</p>
                          </div>
                        </div>
                      </>
                    ) : null}
                    
                    {enquiry.type !== 'peer_connect' && (
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">City & State</p>
                          <p className="text-sm font-bold text-slate-700">{enquiry.cityState || '—'}</p>
                        </div>
                      </div>
                    )}

                    {enquiry.type === 'school' && (
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                          <Clock size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Preferred Consult Time</p>
                          <p className="text-sm font-bold text-slate-700">{enquiry.preferredTime || '—'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Message / Goals Card */}
              <div className="glass-card p-10 rounded-[2.5rem] border-white/40 shadow-xl space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                  <MessageSquare size={18} /> {enquiry.type === 'parent' ? 'Enquiry Details' : enquiry.type === 'peer_connect' ? 'Booking Details' : 'Strategic Programme Goals'}
                </h3>
                <div className="p-8 bg-slate-50/50 rounded-[1.5rem] border border-slate-100">
                  <p className="text-lg text-slate-600 leading-relaxed italic font-medium">
                    "{enquiry.type === 'parent' ? (enquiry.details || 'No details provided.') : enquiry.type === 'peer_connect' ? (enquiry.details || 'No session details.') : (enquiry.goals || "No specific goals provided.")}"
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


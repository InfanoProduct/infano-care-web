'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Edit, Calendar, Clock, MapPin, Video, 
  IndianRupee, User, FileText, CheckCircle2, AlertCircle, 
  ExternalLink, Loader2
} from 'lucide-react';
import { ShopService, Webinar } from '@/services/shop.service';
import { toast } from 'react-hot-toast';

export default function WebinarDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadWebinar();
    }
  }, [id]);

  const loadWebinar = async () => {
    setLoading(true);
    try {
      const data = await ShopService.adminGetWebinar(id);
      setWebinar(data);
    } catch (error) {
      console.error('Failed to load webinar details:', error);
      toast.error('Failed to load webinar details');
      router.push('/admin/webinar-products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-bold text-muted-foreground">Retrieving webinar details...</p>
      </div>
    );
  }

  if (!webinar) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="text-rose-500" size={48} />
        <p className="font-bold text-slate-800">Webinar not found</p>
        <Link href="/admin/webinar-products" className="btn-secondary px-6 py-2.5 rounded-2xl flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Webinars
        </Link>
      </div>
    );
  }

  const dateObj = new Date(webinar.date);
  const dateStr = dateObj.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const timeStr = dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Link 
          href="/admin/webinar-products" 
          className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
          Back to Webinars
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/webinar/${webinar.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs uppercase tracking-widest text-slate-700 shadow-sm transition-all active:scale-95"
          >
            <span>Webinar Page</span>
            <ExternalLink size={14} />
          </Link>

          <Link
            href={`/admin/webinar-products/${webinar.id}/edit`}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover active:scale-98 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 transition-all"
          >
            <Edit size={14} />
            Edit & Update
          </Link>
        </div>
      </div>

      {/* Main visual glass-card */}
      <div className="glass-card rounded-[2.5rem] border-primary/5 shadow-2xl overflow-hidden bg-white">
        {/* Banner with gradient overlay */}
        <div className="h-44 bg-linear-to-r from-purple-750 via-purple-650 to-indigo-650 relative p-8 flex flex-col justify-end">
          <div className="absolute top-6 right-8">
            <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${
              webinar.isActive 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              {webinar.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="space-y-1 relative z-10 text-white">
            <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/20 mb-2`}>
              {webinar.mode} Session
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-sm leading-tight text-white">
              {webinar.title}
            </h1>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-8 sm:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Column 1: Schedule and Logistics */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Logistics & Presenter</h3>
              
              <div className="flex gap-4 items-start bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl mt-0.5">
                  <Calendar size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Date</span>
                  <span className="text-sm font-black text-slate-800">{dateStr}</span>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl mt-0.5">
                  <Clock size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Time</span>
                  <span className="text-sm font-black text-slate-800">{timeStr}</span>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl mt-0.5">
                  <User size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Instructor / Speaker</span>
                  <span className="text-sm font-black text-slate-800">{webinar.instructor || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Venue and Pricing */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Access & Pricing</h3>
              
              <div className="flex gap-4 items-start bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl mt-0.5">
                  <IndianRupee size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Ticket Price</span>
                  <span className="text-sm font-black text-slate-800">₹{webinar.price}</span>
                </div>
              </div>

              {webinar.mode === 'ONLINE' ? (
                <div className="flex gap-4 items-start bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl mt-0.5">
                    <Video size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Zoom / Meet link</span>
                    {webinar.zoomLink ? (
                      <a 
                        href={webinar.zoomLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm font-black text-primary hover:underline flex items-center gap-1 mt-0.5 group"
                      >
                        <span className="truncate">{webinar.zoomLink}</span>
                        <ExternalLink size={12} className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    ) : (
                      <span className="text-sm font-bold text-slate-400">Not configured</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 items-start bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl mt-0.5">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Venue Location</span>
                    <span className="text-sm font-black text-slate-800 mt-0.5 block">{webinar.zoomLink || 'No venue configured'}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-4 items-start bg-purple-50/20 p-4 rounded-3xl border border-purple-100/50">
                <div className="p-3 bg-purple-50 text-purple-650 rounded-2xl mt-0.5">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-650 block">Registration Access</span>
                  <span className="text-xs font-semibold text-slate-600 leading-relaxed block mt-0.5">
                    Tickets can be booked via the marketing portal. Direct slug access: 
                    <Link href={`/webinar/${webinar.slug}`} target="_blank" className="text-primary font-bold hover:underline ml-1">
                      /webinar/{webinar.slug}
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Description Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FileText size={16} />
              Webinar Description
            </h3>
            <div className="p-6 bg-slate-50/30 rounded-3xl border border-slate-100 text-sm font-medium text-slate-650 leading-relaxed whitespace-pre-wrap">
              {webinar.description || 'No description configured.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

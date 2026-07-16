'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Ticket, Eye, Plus, Loader2, ArrowUpRight, CheckCircle2, 
  Trash2, Edit, Calendar, Clock, Users, DollarSign, ExternalLink
} from 'lucide-react';
import { ShopService, Book } from '@/services/shop.service';
import { toast } from 'react-hot-toast';

export default function WebinarManagementPage() {
  const [webinars, setWebinars] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    loadWebinars(); 
  }, []);

  const loadWebinars = async () => {
    setLoading(true);
    try {
      // Calls adminGetBooks with isWebinar=true to fetch only webinar entries
      const data = await ShopService.adminGetBooks(true);
      setWebinars(data);
    } catch { 
      toast.error('Failed to load webinar masterclasses'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDeleteWebinar = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webinar? This will not affect existing registered parents.')) return;
    try {
      await ShopService.adminDeleteBook(id);
      toast.success('Webinar masterclass deleted');
      loadWebinars();
    } catch { 
      toast.error('Failed to delete webinar'); 
    }
  };

  const toggleWebinarStatus = async (webinar: Book) => {
    try {
      await ShopService.adminUpdateBook(webinar.id, { isActive: !webinar.isActive });
      toast.success(`Webinar ${!webinar.isActive ? 'activated' : 'deactivated'}`);
      loadWebinars();
    } catch { 
      toast.error('Failed to update webinar status'); 
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-bold text-slate-400">Loading webinars...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header section */}
      <div className="admin-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-md">
              <Ticket size={28} />
            </div>
            <span>Webinar Masterclasses</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-semibold">
            Create, update, and manage parent webinar products, entry ticket prices, and schedule metadata.
          </p>
        </div>
        <Link 
          href="/admin/webinar-products/new" 
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
          <span>Add New Webinar</span>
        </Link>
      </div>

      {/* Webinars listing grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {webinars.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-100 p-16 rounded-[2.5rem] shadow-sm text-center text-slate-400 font-bold text-sm">
            No webinar products are currently set up. Create your first webinar to get started!
          </div>
        ) : (
          webinars.map((webinar) => {
            return (
              <div 
                key={webinar.id} 
                className="glass-card rounded-[2.5rem] border-primary/5 overflow-hidden shadow-lg bg-white flex flex-col hover:shadow-xl transition-all duration-300 group"
              >
                
                {/* Visual Cover card area */}
                <div className="relative h-44 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-6 flex flex-col justify-between text-white overflow-hidden">
                  
                  {/* Backdrop elements for aesthetics */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-80" />
                  
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[9px] font-black bg-white/20 border border-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                      PASS TICKET
                    </span>
                    <button
                      onClick={() => toggleWebinarStatus(webinar)}
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border backdrop-blur-sm ${
                        webinar.isActive 
                          ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300' 
                          : 'bg-slate-500/20 border-slate-400/30 text-slate-300'
                      }`}
                    >
                      {webinar.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div className="space-y-1.5 z-10">
                    <h3 className="font-extrabold text-xl leading-tight tracking-tight line-clamp-2">
                      {webinar.title}
                    </h3>
                    <p className="text-[10px] text-purple-200 font-bold">
                      Grade target: Grades 5–9 (Adolescent parents)
                    </p>
                  </div>
                </div>

                {/* Body details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  
                  <div className="space-y-4 text-xs font-semibold text-slate-600">
                    <p className="text-slate-400 line-clamp-2 font-medium leading-relaxed">
                      {webinar.description || 'Provide interactive guidance for parents through adolescence.'}
                    </p>

                    <div className="border-t border-slate-100 pt-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5 text-slate-400"><DollarSign size={14} /> Ticket Pass Fee</span>
                        <span className="font-extrabold text-slate-900">₹{webinar.price} INR</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5 text-slate-400"><Users size={14} /> Provision Role</span>
                        <span className="font-bold text-slate-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">PARENT</span>
                      </div>
                    </div>
                  </div>

                  {/* Card footer actions */}
                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                    
                    <button
                      onClick={() => handleDeleteWebinar(webinar.id)}
                      className="p-3 bg-rose-50 hover:bg-rose-100 rounded-2xl text-rose-600 hover:text-rose-700 transition-colors shadow-sm"
                      title="Delete Webinar"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/webinar-products/${webinar.id}/edit`}
                        className="p-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-2xl text-slate-700 hover:text-slate-800 transition-colors shadow-sm"
                        title="Edit Settings"
                      >
                        <Edit size={16} />
                      </Link>
                      <Link
                        href="/admin/webinar-orders"
                        className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-purple-600/10"
                      >
                        <span>Registrations</span>
                        <ArrowUpRight size={16} />
                      </Link>
                    </div>

                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

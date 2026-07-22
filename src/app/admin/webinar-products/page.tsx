'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Ticket, Eye, Plus, Loader2, ArrowUpRight, CheckCircle2, 
  Trash2, Edit, Calendar, Clock, Users, DollarSign, ExternalLink,
  MoreVertical
} from 'lucide-react';
import { ShopService, Webinar } from '@/services/shop.service';
import { toast } from 'react-hot-toast';

export default function WebinarManagementPage() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  useEffect(() => { 
    loadWebinars(); 

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.actions-dropdown-btn') || target.closest('.actions-dropdown-menu')) {
        return;
      }
      setActiveDropdownId(null);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const loadWebinars = async () => {
    setLoading(true);
    try {
      const data = await ShopService.adminGetWebinars();
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
      await ShopService.adminDeleteWebinar(id);
      toast.success('Webinar masterclass deleted');
      loadWebinars();
    } catch { 
      toast.error('Failed to delete webinar'); 
    }
  };

  const toggleWebinarStatus = async (webinar: Webinar) => {
    try {
      await ShopService.adminUpdateWebinar(webinar.id, { isActive: !webinar.isActive });
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

      {/* Tabular List-wise View of Webinars */}
      <div className="glass-card rounded-[2rem] border-primary/5 overflow-hidden shadow-xl bg-white">
        <div className="p-6 border-b border-border flex items-center justify-between bg-primary/5">
          <h2 className="text-base font-black flex items-center gap-2 text-foreground">
            <Ticket className="text-primary font-bold" size={20} />
            <span>Webinar Catalog List</span>
          </h2>
          <span className="text-[10px] font-black bg-white border border-border px-3 py-1 rounded-full shadow-sm text-muted-foreground uppercase tracking-widest">
            {webinars.length} Webinars
          </span>
        </div>

        {webinars.length === 0 ? (
          <div className="p-16 text-center text-slate-400 font-bold text-sm">
            No webinar products are currently set up. Create your first webinar to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[13px] font-bold uppercase tracking-wider text-muted-foreground bg-slate-50/30">
                  <th className="px-6 py-5">Webinar Name</th>
                  <th className="px-6 py-5">Schedule (Date & Time)</th>
                  <th className="px-6 py-5">Instructor</th>
                  <th className="px-6 py-5">Mode & Link</th>
                  <th className="px-6 py-5">Price</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {webinars.map((webinar) => {
                  const dateObj = webinar.date ? new Date(webinar.date) : null;
                  const dateStr = dateObj ? dateObj.toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'N/A';
                  const timeStr = dateObj ? dateObj.toLocaleTimeString('en-IN', { timeStyle: 'short' }) : 'N/A';
                  
                  return (
                    <tr key={webinar.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="font-extrabold text-sm text-slate-900 leading-tight">
                          {webinar.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1 truncate max-w-62.5">
                          {webinar.description || 'No description provided.'}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5"><Calendar size={13} className="text-slate-400" /> {dateStr}</div>
                        <div className="flex items-center gap-1.5 text-slate-400 mt-1"><Clock size={13} /> {timeStr}</div>
                      </td>
                      <td className="px-6 py-5 text-xs font-extrabold text-slate-800">
                        {webinar.instructor || 'N/A'}
                      </td>
                      <td className="px-6 py-5 text-xs font-semibold text-slate-700">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          webinar.mode === 'ONLINE' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {webinar.mode}
                        </span>
                        {webinar.zoomLink && (
                          <div className="mt-1.5 flex items-center gap-1">
                            {webinar.mode === 'OFFLINE' ? (
                              <span className="text-slate-500 font-bold truncate max-w-37.5 block" title={webinar.zoomLink}>
                                Venue: {webinar.zoomLink}
                              </span>
                            ) : (
                              <a href={webinar.zoomLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold truncate max-w-37.5 flex items-center gap-0.5">
                                Zoom Link <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-xs font-extrabold text-slate-900">
                        ₹{webinar.price}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          webinar.isActive 
                            ? 'bg-emerald-50 border-emerald-250 text-emerald-700' 
                            : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}>
                          {webinar.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 relative">
                          <Link
                            href="/admin/webinar-orders"
                            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] uppercase tracking-wider transition-all"
                          >
                            <span>Attendees</span>
                            <ArrowUpRight size={12} />
                          </Link>

                          <Link
                            href={`/admin/webinar-products/${webinar.id}`}
                            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-700 hover:text-slate-800 transition-colors shadow-sm"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </Link>

                          {/* 3-dot Actions Dropdown Container */}
                          <div className="relative">
                            <button
                              onClick={() => {
                                setActiveDropdownId(activeDropdownId === webinar.id ? null : webinar.id);
                              }}
                              className="actions-dropdown-btn p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-700 hover:text-slate-800 transition-colors shadow-sm"
                              title="Actions"
                            >
                              <MoreVertical size={14} />
                            </button>

                            {activeDropdownId === webinar.id && (
                              <div className="actions-dropdown-menu absolute right-0 bottom-full mb-2 w-40 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-bottom-1 duration-150 text-left">
                                <button
                                  onClick={() => {
                                    toggleWebinarStatus(webinar);
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                  {webinar.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <hr className="border-slate-100" />
                                <button
                                  onClick={() => {
                                    handleDeleteWebinar(webinar.id);
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

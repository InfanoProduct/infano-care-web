'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save, X, Type, AlignLeft, Loader2, CheckCircle2,
  Calendar, IndianRupee, Globe
} from 'lucide-react';
import { ShopService, Webinar } from '@/services/shop.service';
import ImageUploader from '@/components/upload/ImageUploader';
import { toast } from 'react-hot-toast';

interface WebinarFormProps {
  webinarId?: string;
}

export default function WebinarForm({ webinarId }: WebinarFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!webinarId);
  const [formData, setFormData] = useState<Partial<Webinar>>({
    title: '',
    description: '',
    price: 0,
    date: '',
    zoomLink: '',
    isActive: true,
    mode: 'ONLINE',
    instructor: '',
  });

  useEffect(() => {
    if (webinarId) {
      loadWebinar();
    }
  }, [webinarId]);

  const loadWebinar = async () => {
    try {
      const data = await ShopService.adminGetWebinar(webinarId!);
      // Format the ISO Date String to datetime-local input format (YYYY-MM-DDTHH:MM)
      if (data.date) {
        const dateObj = new Date(data.date);
        const tzOffset = dateObj.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(dateObj.getTime() - tzOffset)).toISOString().slice(0, 16);
        data.date = localISOTime;
      }
      setFormData(data);
    } catch (error) {
      console.error('Failed to load webinar details:', error);
      toast.error('Failed to load webinar details');
      router.push('/admin/webinar-products');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: Partial<Webinar> = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        zoomLink: formData.zoomLink || null,
        isActive: formData.isActive,
        mode: formData.mode || 'ONLINE',
        instructor: formData.instructor || null,
        slug: formData.slug || undefined,
        link: formData.mode === 'OFFLINE' ? formData.zoomLink : null,
      };

      if (webinarId) {
        await ShopService.adminUpdateWebinar(webinarId, payload);
        toast.success('Webinar updated successfully');
      } else {
        await ShopService.adminCreateWebinar(payload);
        toast.success('Webinar created successfully');
      }
      router.push('/admin/webinar-products');
    } catch (error: any) {
      console.error('Failed to save webinar:', error);
      toast.error(error?.response?.data?.message || 'Failed to save webinar');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-bold text-muted-foreground">Retrieving webinar details...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
      <div className="admin-header flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            {webinarId ? 'Edit' : 'Add New'} <span className="text-primary">Webinar</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure parent masterclass topic, pricing ticket pass details, and Zoom/Offline schedule
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-4 bg-secondary/50 rounded-2xl hover:bg-secondary transition-all text-muted-foreground"
          >
            <X size={24} />
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span className="font-bold">Save Webinar</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic details card */}
          <div className="glass-card p-8 rounded-[2.5rem] border-primary/5 shadow-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Webinar Title *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Type size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setFormData(prev => {
                        const nextData = { ...prev, title: newTitle };
                        // By default autogenerate slug if it is empty or matches old title
                        if (!webinarId && (!prev.slug || prev.slug === prev.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))) {
                          nextData.slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        }
                        return nextData;
                      });
                    }}
                    placeholder="e.g. Decoding Her Silence"
                    className="w-full pr-6 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Webinar Slug (URL Path) *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Globe size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') })}
                    placeholder="e.g. decoding-her-silence"
                    className="w-full pr-6 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Description *</label>
              <div className="relative group">
                <div className="absolute top-3 left-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <AlignLeft size={18} />
                </div>
                <textarea
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell parents what this webinar masterclass is about..."
                  className="w-full pr-6 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Webinar Schedule Card */}
          <div className="glass-card p-8 rounded-[2.5rem] border-primary/5 shadow-2xl space-y-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar size={20} className="text-primary" />
              Webinar Schedule & Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-5 py-4 bg-secondary/30 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none rounded-2xl transition-all text-sm font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Instructor / Speaker</label>
                <input
                  type="text"
                  value={formData.instructor || ''}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  placeholder="e.g. Dr. Deepa"
                  className="w-full px-5 py-4 bg-secondary/30 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none rounded-2xl transition-all text-sm font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Webinar Mode</label>
                <select
                  value={formData.mode || 'ONLINE'}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
                  className="w-full px-5 py-4 bg-secondary/30 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none rounded-2xl transition-all text-sm font-bold"
                >
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {formData.mode === 'OFFLINE' ? 'Venue Details' : 'Zoom Meeting Link'}
                </label>
                <input
                  type={formData.mode === 'OFFLINE' ? 'text' : 'url'}
                  value={formData.zoomLink || ''}
                  onChange={(e) => setFormData({ ...formData, zoomLink: e.target.value })}
                  placeholder={formData.mode === 'OFFLINE' ? 'e.g. 5th Floor Auditorium, New Delhi' : 'https://zoom.us/j/...'}
                  className="w-full px-5 py-4 bg-secondary/30 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none rounded-2xl transition-all text-sm font-bold"
                />
              </div>
            </div>


          </div>

          {/* Pricing Card */}
          <div className="glass-card rounded-[2.5rem] border-primary/5 shadow-2xl overflow-hidden p-8 space-y-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <IndianRupee size={20} className="text-primary" />
              Ticket Pricing
            </h3>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                Webinar Ticket Price (₹) *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <IndianRupee size={18} />
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price || 0}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 99"
                  className="w-full pr-6 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-8 rounded-[2.5rem] border-primary/5 shadow-2xl space-y-6">
            <div className="pt-6 border-t border-border/30">
              <label className="flex items-center gap-4 cursor-pointer group">
                <div
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`w-14 h-8 rounded-full transition-all relative ${formData.isActive ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-muted'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${formData.isActive ? 'left-7' : 'left-1'}`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black">Active Status</span>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    {formData.isActive ? 'Visible in store' : 'Hidden from store'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] bg-linear-to-br from-primary/5 to-transparent border-primary/10 border space-y-4">
            <h4 className="text-sm font-black flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary" />
              Publishing Checklist
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Webinar price set', checked: (formData.price || 0) > 0 },
                { label: 'Webinar date set', checked: !!formData.date },
                { label: 'Zoom/Meet details configured', checked: !!formData.zoomLink },
                { label: 'Catchy description', checked: (formData.description || '').length > 20 },
              ].map(item => (
                <li key={item.label} className="flex items-center gap-3 text-xs font-bold transition-all">
                  <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-border bg-white'}`}>
                    {item.checked && <CheckCircle2 size={10} />}
                  </div>
                  <span className={item.checked ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}

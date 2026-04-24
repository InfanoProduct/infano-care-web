'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';

interface EpisodeFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onClose: () => void;
  title: string;
}

export function EpisodeForm({ initialData, onSubmit, onClose, title }: EpisodeFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    points: initialData?.points || 50,
    isActive: initialData?.isActive ?? true,
    order: initialData?.order || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-slate-50/50">
          <h3 className="text-2xl font-black premium-gradient-text">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
            <X size={24} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Episode Title</label>
            <input 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-5 py-3.5 bg-slate-50 border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none font-bold"
              placeholder="e.g., Intro to Hormones"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
            <textarea 
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-5 py-3.5 bg-slate-50 border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none font-medium text-sm"
              placeholder="What will users learn in this episode?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">XP Points</label>
              <input 
                type="number"
                value={formData.points}
                onChange={e => setFormData({...formData, points: parseInt(e.target.value)})}
                className="w-full px-5 py-3.5 bg-slate-50 border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Display Order</label>
              <input 
                type="number"
                value={formData.order}
                onChange={e => setFormData({...formData, order: parseInt(e.target.value)})}
                className="w-full px-5 py-3.5 bg-slate-50 border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none font-bold"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 px-1">
            <input 
              type="checkbox"
              id="isActiveEpisode"
              checked={formData.isActive}
              onChange={e => setFormData({...formData, isActive: e.target.checked})}
              className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary"
            />
            <label htmlFor="isActiveEpisode" className="text-sm font-bold text-slate-700 select-none">Active and visible</label>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3.5 border border-border rounded-2xl font-bold hover:bg-secondary transition-all">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2">
              <Save size={20} /> Save Episode
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

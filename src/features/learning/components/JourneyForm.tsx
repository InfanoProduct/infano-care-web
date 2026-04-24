'use client';

import { useState } from 'react';
import { LearningJourney } from '../services/learning-api';
import { X, Save, Image as ImageIcon, Target, Hash, MessageSquare, Shield } from 'lucide-react';

interface JourneyFormProps {
  initialData?: Partial<LearningJourney>;
  onSubmit: (data: Partial<LearningJourney>) => void;
  onClose: () => void;
  title: string;
}

export function JourneyForm({ initialData, onSubmit, onClose, title }: JourneyFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    ageBand: initialData?.ageBand || '13-18',
    isActive: initialData?.isActive ?? true,
    topics: initialData?.topics?.join(', ') || '',
    goals: initialData?.goals?.join(', ') || '',
    tags: initialData?.tags?.join(', ') || '',
    contentTone: initialData?.contentTone || 'moderate',
    minContentTier: initialData?.minContentTier || 'TEEN_EARLY',
    bannerImage: initialData?.bannerImage || '',
    thumbnailUrl: initialData?.thumbnailUrl || '',
    totalXP: initialData?.totalXP || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      topics: formData.topics.split(',').map(s => s.trim()).filter(Boolean),
      goals: formData.goals.split(',').map(s => s.trim()).filter(Boolean),
      tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean),
      totalXP: Number(formData.totalXP),
    };
    onSubmit(submissionData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="px-10 py-6 border-b border-border flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-3xl font-black premium-gradient-text">{title}</h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Configure full journey metadata</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-secondary rounded-2xl transition-colors">
            <X size={28} className="text-muted-foreground" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                 <Target size={18} />
               </div>
               <h4 className="font-black text-lg text-slate-800">Basic Information</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 ml-1">Journey Title</label>
                <input 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-border rounded-[1.25rem] focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none font-bold text-slate-700 transition-all"
                  placeholder="e.g., Reproductive Wellness"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 ml-1">Category</label>
                <input 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-border rounded-[1.25rem] focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none font-bold text-slate-700 transition-all"
                  placeholder="e.g., Health & Science"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 ml-1">Full Description</label>
              <textarea 
                required
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-border rounded-[1.25rem] focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none font-medium text-sm text-slate-600 transition-all"
                placeholder="Describe what users will achieve in this journey..."
              />
            </div>
          </div>

          {/* Section 2: Visuals & Branding */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                 <ImageIcon size={18} />
               </div>
               <h4 className="font-black text-lg text-slate-800">Visuals & Branding</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 ml-1">Banner Image URL</label>
                <input 
                  value={formData.bannerImage}
                  onChange={e => setFormData({...formData, bannerImage: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-border rounded-[1.25rem] focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none font-bold text-slate-700 transition-all"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 ml-1">Thumbnail URL</label>
                <input 
                  value={formData.thumbnailUrl}
                  onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-border rounded-[1.25rem] focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none font-bold text-slate-700 transition-all"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Section 3: Classification & Audience */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                 <Shield size={18} />
               </div>
               <h4 className="font-black text-lg text-slate-800">Classification & Audience</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 ml-1">Content Tone</label>
                <input 
                  value={formData.contentTone}
                  onChange={e => setFormData({...formData, contentTone: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-border rounded-[1.25rem] focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none font-bold text-slate-700 transition-all"
                  placeholder="moderate"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 ml-1">Minimum Tier</label>
                <select 
                  value={formData.minContentTier}
                  onChange={e => setFormData({...formData, minContentTier: e.target.value as any})}
                  className="w-full px-6 py-4 bg-slate-50 border border-border rounded-[1.25rem] focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                >
                  <option value="TEEN_EARLY">Teen Early</option>
                  <option value="TEEN_LATE">Teen Late</option>
                  <option value="ADULT">Adult</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 ml-1">Age Band</label>
                <input 
                  value={formData.ageBand}
                  onChange={e => setFormData({...formData, ageBand: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-border rounded-[1.25rem] focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none font-bold text-slate-700 transition-all"
                  placeholder="e.g., 13-18"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Metadata Lists */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                 <Hash size={18} />
               </div>
               <h4 className="font-black text-lg text-slate-800">Metadata Lists</h4>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 ml-1">Topics (comma separated)</label>
              <input 
                value={formData.topics}
                onChange={e => setFormData({...formData, topics: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-border rounded-[1.25rem] focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none font-bold text-slate-700 transition-all"
                placeholder="Biology, Hormones, Self-care..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 ml-1">Learning Goals (comma separated)</label>
              <input 
                value={formData.goals}
                onChange={e => setFormData({...formData, goals: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-border rounded-[1.25rem] focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none font-bold text-slate-700 transition-all"
                placeholder="Track cycle, Understand symptoms..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 ml-1">Tags (comma separated)</label>
              <input 
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-border rounded-[1.25rem] focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none font-bold text-slate-700 transition-all"
                placeholder="period, ovulation, puberty..."
              />
            </div>
          </div>

          {/* Section 5: Reward & Status */}
          <div className="space-y-6">
             <div className="flex items-center gap-2 mb-2">
               <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                 <MessageSquare size={18} />
               </div>
               <h4 className="font-black text-lg text-slate-800">Rewards & Status</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 ml-1">Total Completion XP</label>
                <input 
                  type="number"
                  value={formData.totalXP}
                  onChange={e => setFormData({...formData, totalXP: parseInt(e.target.value)})}
                  className="w-full px-6 py-4 bg-slate-50 border border-border rounded-[1.25rem] focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none font-black text-slate-800 transition-all"
                />
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-4 p-5 bg-slate-50 border border-border rounded-[1.5rem]">
                  <input 
                    type="checkbox"
                    id="isActiveJourney"
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    className="w-6 h-6 rounded-lg border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <div>
                    <label htmlFor="isActiveJourney" className="font-black text-slate-800 cursor-pointer select-none">Publish Journey</label>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Visible to all eligible app users</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-10 py-8 border-t border-border bg-white shrink-0 flex gap-4">
          <button type="button" onClick={onClose} className="flex-1 px-8 py-4 border-2 border-slate-100 rounded-[1.5rem] font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs">
            Discard Changes
          </button>
          <button onClick={handleSubmit} className="flex-2 btn-primary flex items-center justify-center gap-3 py-4 shadow-xl shadow-primary/20">
            <Save size={24} /> 
            <span className="uppercase tracking-widest text-sm font-black">Finalize & Save Journey</span>
          </button>
        </div>
      </div>
    </div>
  );
}

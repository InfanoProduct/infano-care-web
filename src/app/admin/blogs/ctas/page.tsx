'use client';

import { useState, useEffect } from 'react';
import { Plus, MousePointer2, ExternalLink, Loader2, Edit, Trash2, Layout, BarChart3, X } from 'lucide-react';
import { blogService } from '@/services/blog.service';
import ImageUploader from '@/components/upload/ImageUploader';

export default function CTAsPage() {
  const [ctas, setCtas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newCTA, setNewCTA] = useState({
    title: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    type: 'primary',
    imageUrl: ''
  });

  useEffect(() => {
    loadCTAs();
  }, []);

  const loadCTAs = async () => {
    setLoading(true);
    try {
      const data = await blogService.getCTAs() as any;
      setCtas(data);
    } catch (error) {
      console.error('Failed to load CTAs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await blogService.updateCTA(editingId, newCTA);
      } else {
        await blogService.createCTA(newCTA);
      }
      setIsAdding(false);
      setEditingId(null);
      setNewCTA({ title: '', description: '', buttonText: '', buttonLink: '', type: 'primary', imageUrl: '' });
      loadCTAs();
    } catch (error) {
      alert(editingId ? 'Failed to update CTA' : 'Failed to create CTA');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (cta: any) => {
    setNewCTA({
      title: cta.title || '',
      description: cta.description || '',
      buttonText: cta.buttonText || '',
      buttonLink: cta.buttonLink || '',
      type: cta.type || 'primary',
      imageUrl: cta.imageUrl || ''
    });
    setEditingId(cta.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this CTA?')) return;
    try {
      await blogService.deleteCTA(id);
      loadCTAs();
    } catch (error) {
      alert('Failed to delete CTA');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="admin-header flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Call-to-Actions (CTAs)</h1>
          <p className="text-muted-foreground mt-1">Design reusable interaction blocks for your articles</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            if (isAdding) {
              setEditingId(null);
              setNewCTA({ title: '', description: '', buttonText: '', buttonLink: '', type: 'primary', imageUrl: '' });
            }
          }}
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg transition-all"
        >
          {isAdding ? 'Close Form' : <><Plus size={20} /> Create CTA</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreateOrUpdate} className="glass-card p-8 rounded-[2.5rem] border-primary/10 shadow-2xl space-y-6 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">{editingId ? 'Edit CTA' : 'New CTA'}</h2>
            <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-muted-foreground hover:text-primary transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Destination URL</label>
              <input
                required
                className="w-full bg-secondary/30 border-none rounded-2xl py-3 px-6 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="https://..."
                value={newCTA.buttonLink}
                onChange={(e) => setNewCTA({...newCTA, buttonLink: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Image URL (Optional if uploading)</label>
              <input
                className="w-full bg-secondary/30 border-none rounded-2xl py-3 px-6 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Paste Image URL instead..."
                value={newCTA.imageUrl}
                onChange={(e) => setNewCTA({...newCTA, imageUrl: e.target.value})}
              />
            </div>

            <div className="pt-6 border-t border-border/30 md:col-span-2 space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Live Banner Preview & Upload Area</p>
              
              <div 
                className="relative p-0 rounded-[2rem] flex flex-col items-center justify-center overflow-hidden shadow-2xl group/preview bg-slate-50 border-2 border-dashed border-primary/20 min-h-[260px]"
              >
                {newCTA.imageUrl ? (
                  <>
                    <img 
                      src={newCTA.imageUrl} 
                      alt="CTA Preview" 
                      className="w-full h-full object-cover max-h-[300px]"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 p-12 text-center select-none">
                    <Layout className="w-12 h-12 text-slate-300" />
                    <p className="text-sm font-bold text-slate-400">No CTA Banner Uploaded</p>
                    <p className="text-xs text-slate-400">Upload an image or paste a URL above</p>
                  </div>
                )}

                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center z-20">
                  <label className="cursor-pointer flex flex-col items-center gap-2 p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 hover:bg-white/20 transition-all">
                    {isSaving ? <Loader2 className="animate-spin text-white" size={32} /> : <Plus size={32} className="text-white" />}
                    <span className="text-white font-black text-xs uppercase tracking-widest">Upload Banner</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsSaving(true);
                        try {
                          const result = await blogService.uploadImage(file) as any;
                          setNewCTA(prev => ({ ...prev, imageUrl: result.url }));
                        } catch (error) {
                          alert('Failed to upload image');
                        } finally {
                          setIsSaving(false);
                        }
                      }} 
                    />
                  </label>
                  {newCTA.imageUrl && (
                    <button 
                      type="button"
                      onClick={() => setNewCTA({...newCTA, imageUrl: ''})}
                      className="absolute top-6 right-6 p-3 bg-red-500/20 backdrop-blur-md rounded-2xl hover:bg-red-500/40 transition-all border border-red-500/20"
                    >
                      <Trash2 size={20} className="text-white" />
                    </button>
                  )}
                </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSaving} className="btn-primary w-full py-4 rounded-2xl font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
          {isSaving && <Loader2 className="animate-spin" size={20} />}
          {editingId ? 'Update CTA' : 'Deploy New CTA'}
        </button>
      </form>
    )}

    {loading ? (
      <div className="py-24 text-center flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="font-bold text-muted-foreground">Fetching interactive elements...</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {ctas.map((cta) => (
          <div key={cta.id} className="glass-card p-8 rounded-[2.5rem] border-primary/5 hover:border-primary/20 transition-all group shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Layout size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reusable Component</span>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleEdit(cta)}
                  className="p-2 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(cta.id)}
                  className="p-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="relative rounded-[2rem] border border-slate-100 overflow-hidden min-h-[200px] flex flex-col justify-center bg-slate-50">
              {cta.imageUrl ? (
                <a href={cta.buttonLink} target="_blank" rel="noopener noreferrer" className="block relative w-full h-full min-h-[200px]">
                  <img src={cta.imageUrl} className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-300" alt="CTA Banner" />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center group">
                    <span className="bg-white/90 text-slate-800 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 border border-slate-100">
                      Test Link <ExternalLink size={12} />
                    </span>
                  </div>
                </a>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                  No Image Uploaded
                </div>
              )}
            </div>

              <div className="mt-8 flex items-center justify-between pt-6 border-t border-border/30 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Engagement</span>
                    <span className="text-lg font-black flex items-center gap-1 mt-1">
                      <BarChart3 size={16} className="text-emerald-500" /> {cta.clicks || 0} <span className="text-xs text-muted-foreground">Clicks</span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</span>
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                  </span>
                </div>
              </div>
            </div>
          ))}

          {ctas.length === 0 && (
            <div className="col-span-full py-24 glass-card rounded-[2.5rem] border-dashed border-2 border-border/50 flex flex-col items-center justify-center opacity-40">
              <MousePointer2 size={64} className="mb-4" />
              <p className="text-xl font-black">No CTAs found</p>
              <p className="font-bold">Create your first Call-to-Action to boost engagement</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

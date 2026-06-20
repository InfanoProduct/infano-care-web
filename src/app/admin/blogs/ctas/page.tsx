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
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Button Text</label>
              <input
                required
                className="w-full bg-secondary/30 border-none rounded-2xl py-3 px-6 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="e.g. Sign Up Now"
                value={newCTA.buttonText}
                onChange={(e) => setNewCTA({...newCTA, buttonText: e.target.value})}
              />
            </div>

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

            <div className="pt-6 border-t border-border/30 md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Live Preview & Poster Customization</p>
                <div className="flex gap-2">
                  <input
                    className="bg-secondary/30 border-none rounded-xl py-1.5 px-4 text-[10px] font-bold focus:ring-1 focus:ring-primary/20 outline-none transition-all w-48"
                    placeholder="Paste Image URL instead..."
                    value={newCTA.imageUrl}
                    onChange={(e) => setNewCTA({...newCTA, imageUrl: e.target.value})}
                  />
                </div>
              </div>
              
              <div 
                className={`relative p-12 rounded-[2.5rem] flex flex-col items-center text-center transition-all min-h-[300px] justify-center overflow-hidden shadow-2xl group/preview ${
                  newCTA.imageUrl ? 'text-white' : 
                  newCTA.type === 'primary' ? 'bg-primary text-white' : 
                  newCTA.type === 'dark' ? 'bg-black text-white' : 'bg-white text-foreground'
                }`}
              >
                {newCTA.imageUrl && (
                  <>
                    <img 
                      src={newCTA.imageUrl} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <div className="absolute inset-0 bg-black/25" />
                  </>
                )}

                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center z-20">
                  <label className="cursor-pointer flex flex-col items-center gap-2 p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 hover:bg-white/20 transition-all">
                    {isSaving ? <Loader2 className="animate-spin text-white" size={32} /> : <Plus size={32} className="text-white" />}
                    <span className="text-white font-black text-xs uppercase tracking-widest">Update Poster</span>
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
                
                <div className="relative z-10 space-y-4">
                  {newCTA.title && (
                    <h3 className="text-4xl font-black tracking-tight leading-tight">{newCTA.title}</h3>
                  )}
                  {newCTA.description && (
                    <p className={`mt-4 max-w-xl text-lg font-bold ${newCTA.imageUrl || newCTA.type === 'primary' || newCTA.type === 'dark' ? 'text-white/90' : 'text-muted-foreground'}`}>
                      {newCTA.description}
                    </p>
                  )}
                  <div className="mt-8">
                    <div className={`px-10 py-4 rounded-2xl font-black text-sm transition-all shadow-xl inline-block ${
                      newCTA.imageUrl || newCTA.type === 'dark' || newCTA.type === 'primary' ? 'bg-white text-primary' : 'bg-primary text-white'
                    }`}>
                      {newCTA.buttonText || 'Button Text'}
                    </div>
                  </div>
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

              <div className={`relative p-8 rounded-[2rem] border-2 border-dashed border-primary/10 min-h-[220px] flex flex-col justify-center overflow-hidden ${
                cta.imageUrl ? 'text-white' : 
                cta.type === 'primary' ? 'bg-primary/5' : 'bg-secondary/30'
              }`}>
                {cta.imageUrl && (
                  <>
                    <img src={cta.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/25" />
                  </>
                )}
                
                <div className="relative z-10 text-center flex flex-col items-center justify-center">
                  <div className="absolute -top-3 left-4 bg-white px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest text-black">Live Preview</div>
                  {cta.title && <h3 className="text-xl font-black">{cta.title}</h3>}
                  {cta.description && (
                    <p className={`text-sm mt-2 font-medium line-clamp-2 ${cta.imageUrl ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {cta.description}
                    </p>
                  )}
                  <div className={`mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs transition-all shadow-lg ${
                    cta.imageUrl || cta.type === 'primary' ? 'bg-white text-primary' : 'bg-primary text-white'
                  }`}>
                    {cta.buttonText || 'Click Here'} <ExternalLink size={14} />
                  </div>
                </div>
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

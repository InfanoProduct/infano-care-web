'use client';

import { useState, useEffect } from 'react';
import { Globe, Plus, Loader2, Edit, Trash2, CheckCircle2, X, Save, Hash, Type, AlignLeft, Palette, Layers, ShieldCheck, UserCheck } from 'lucide-react';
import { CommunityService, CommunityCircle } from '@/services/community.service';
import { toast } from 'react-hot-toast';

export default function CircleManagement() {
  const [circles, setCircles] = useState<CommunityCircle[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCircle, setEditingCircle] = useState<CommunityCircle | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<CommunityCircle>>({
    name: '',
    slug: '',
    description: '',
    iconEmoji: '💬',
    accentColor: '#3B82F6',
    sortOrder: 0,
    isActive: true,
    requiresPreReview: false,
    isAgeSpecific: false,
    minContentTier: undefined,
    maxContentTier: undefined,
    benefits: [],
    moderatorIds: []
  });

  const [benefitInput, setBenefitInput] = useState('');

  const addBenefit = () => {
    if (benefitInput.trim() && !formData.benefits?.includes(benefitInput.trim())) {
      setFormData({
        ...formData,
        benefits: [...(formData.benefits || []), benefitInput.trim()]
      });
      setBenefitInput('');
    }
  };

  const removeBenefit = (benefit: string) => {
    setFormData({
      ...formData,
      benefits: formData.benefits?.filter(b => b !== benefit)
    });
  };

  const contentTiers = [
    { value: 'JUNIOR', label: 'Junior' },
    { value: 'TEEN_EARLY', label: 'Teen Early' },
    { value: 'TEEN_LATE', label: 'Teen Late' },
    { value: 'ADULT', label: 'Adult' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [circlesData, mentorsData] = await Promise.all([
        CommunityService.adminGetCircles(),
        CommunityService.adminGetMentors()
      ]);
      setCircles(circlesData);
      setMentors(mentorsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (circle?: CommunityCircle) => {
    if (circle) {
      setEditingCircle(circle);
      setFormData({
        ...circle,
        benefits: circle.benefits || [],
        moderatorIds: circle.moderators?.map(m => m.id) || []
      });
    } else {
      setEditingCircle(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        iconEmoji: '💬',
        accentColor: '#3B82F6',
        sortOrder: circles.length + 1,
        isActive: true,
        requiresPreReview: false,
        isAgeSpecific: false,
        minContentTier: undefined,
        maxContentTier: undefined,
        benefits: [],
        moderatorIds: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCircle(null);
    setBenefitInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Clean up empty tiers
    const payload = { ...formData };
    if (payload.minContentTier === '') payload.minContentTier = undefined;
    if (payload.maxContentTier === '') payload.maxContentTier = undefined;

    try {
      if (editingCircle) {
        await CommunityService.adminUpdateCircle(editingCircle.id, payload);
        toast.success('Circle updated successfully');
      } else {
        await CommunityService.adminCreateCircle(payload);
        toast.success('Circle created successfully');
      }
      handleCloseModal();
      loadData();
    } catch (error) {
      toast.error('Failed to save circle');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this circle? This action cannot be undone.')) return;
    try {
      await CommunityService.adminDeleteCircle(id);
      toast.success('Circle deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete circle');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-bold text-muted-foreground">Loading community data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground italic">Circle <span className="text-primary">Management</span></h1>
          <p className="text-muted-foreground mt-1">Configure community groups and discovery settings</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
          <span>Create New Circle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {circles.map((circle) => (
          <div key={circle.id} className="glass-card rounded-[2.5rem] border-primary/5 p-8 flex flex-col gap-6 group hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
             <div 
              className="absolute top-0 right-0 w-32 h-32 opacity-[0.05] pointer-events-none translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500"
              style={{ color: circle.accentColor }}
            >
              <Globe size={128} />
            </div>

            <div className="flex items-start justify-between relative z-10">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:rotate-6 transition-transform"
                style={{ backgroundColor: `${circle.accentColor}15` }}
              >
                {circle.iconEmoji}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleOpenModal(circle)}
                  className="p-2 bg-secondary/50 rounded-xl hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(circle.id)}
                  className="p-2 bg-secondary/50 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all shadow-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-1 relative z-10">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black italic">{circle.name}</h3>
                {!circle.isActive && (
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Draft
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1 opacity-60">
                <Hash size={10} /> {circle.slug}
              </p>
            </div>

            <p className="text-sm text-muted-foreground font-medium line-clamp-2 leading-relaxed min-h-[2.5rem]">
              {circle.description || 'No description provided.'}
            </p>

            <div className="pt-6 border-t border-border/30 flex flex-wrap gap-2 mt-auto">
              {circle.requiresPreReview && (
                <span className="text-[8px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-600 px-2 py-1 rounded-md border border-rose-500/10">
                  Pre-Review
                </span>
              )}
              {circle.isAgeSpecific && (
                <span className="text-[8px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-600 px-2 py-1 rounded-md border border-blue-500/10">
                  Age-Gated
                </span>
              )}
              {circle.minContentTier && (
                <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-md border border-emerald-500/10">
                  Min: {circle.minContentTier}
                </span>
              )}
               {circle.maxContentTier && (
                <span className="text-[8px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-600 px-2 py-1 rounded-md border border-purple-500/10">
                  Max: {circle.maxContentTier}
                </span>
              )}
            </div>

            {circle.benefits && circle.benefits.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {circle.benefits.slice(0, 3).map((benefit, i) => (
                  <span key={i} className="text-[7px] font-bold bg-secondary/50 px-2 py-0.5 rounded text-muted-foreground truncate max-w-[80px]">
                    {benefit}
                  </span>
                ))}
                {circle.benefits.length > 3 && (
                  <span className="text-[7px] font-bold bg-secondary/50 px-2 py-0.5 rounded text-muted-foreground">
                    +{circle.benefits.length - 3}
                  </span>
                )}
              </div>
            )}

            {circle.moderators && circle.moderators.length > 0 && (
              <div className="flex flex-col gap-2 pt-4 border-t border-border/30">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Moderated By</p>
                <div className="flex -space-x-2">
                  {circle.moderators.map((mod, i) => (
                    <div 
                      key={mod.id} 
                      className="w-8 h-8 rounded-full border-2 border-white bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shadow-sm"
                      title={mod.username || mod.profile?.displayName}
                    >
                      {mod.username?.substring(0, 2).toUpperCase() || '??'}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-2">
               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Order #{circle.sortOrder}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Circle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={handleCloseModal} />
          
          <div className="glass-card w-full max-w-2xl rounded-[3rem] border-primary/10 shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[95vh]">
            <div className="p-8 border-b border-border/30 flex items-center justify-between bg-primary/5">
              <div>
                <h2 className="text-2xl font-black italic">
                  {editingCircle ? 'Edit' : 'Create'} <span className="text-primary">Circle</span>
                </h2>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-60">Configure community space</p>
              </div>
              <button onClick={handleCloseModal} className="p-3 bg-secondary/50 rounded-2xl hover:bg-secondary transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Circle Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                      <Type size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Period Talk"
                      className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">URL Slug</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                      <Hash size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="e.g. period-talk"
                      className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                <div className="relative group">
                  <div className="absolute top-4 left-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <AlignLeft size={18} />
                  </div>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Briefly describe this community space..."
                    className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Benefits of Joining</label>
                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                      <CheckCircle2 size={18} />
                    </div>
                    <input
                      type="text"
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                      placeholder="e.g. Expert moderation, safe space..."
                      className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:border-primary transition-all font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="px-6 py-4 bg-secondary hover:bg-secondary/80 rounded-2xl font-bold transition-all"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.benefits?.map((benefit, index) => (
                    <span 
                      key={index}
                      className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-bold border border-primary/10 animate-in zoom-in duration-300"
                    >
                      {benefit}
                      <button 
                        type="button" 
                        onClick={() => removeBenefit(benefit)}
                        className="hover:text-destructive transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  {(!formData.benefits || formData.benefits.length === 0) && (
                    <p className="text-[10px] text-muted-foreground italic ml-1">No benefits added yet.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Min Content Tier</label>
                  <select
                    value={formData.minContentTier || ''}
                    onChange={(e) => setFormData({ ...formData, minContentTier: e.target.value })}
                    className="w-full px-4 py-4 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:border-primary transition-all font-bold appearance-none cursor-pointer"
                  >
                    <option value="">No Minimum</option>
                    {contentTiers.map(tier => (
                      <option key={tier.value} value={tier.value}>{tier.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Max Content Tier</label>
                  <select
                    value={formData.maxContentTier || ''}
                    onChange={(e) => setFormData({ ...formData, maxContentTier: e.target.value })}
                    className="w-full px-4 py-4 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:border-primary transition-all font-bold appearance-none cursor-pointer"
                  >
                    <option value="">No Maximum</option>
                    {contentTiers.map(tier => (
                      <option key={tier.value} value={tier.value}>{tier.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-primary" />
                  Assigned Moderators (Peer Mentors)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-secondary/20 rounded-2xl border border-border/50 max-h-[200px] overflow-y-auto">
                  {mentors.map((mentor) => (
                    <label 
                      key={mentor.id} 
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                        formData.moderatorIds?.includes(mentor.id) 
                          ? 'bg-primary/10 border-primary/20 text-primary' 
                          : 'bg-white/50 border-transparent hover:bg-white transition-all'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.moderatorIds?.includes(mentor.id)}
                        onChange={(e) => {
                          const ids = formData.moderatorIds || [];
                          if (e.target.checked) {
                            setFormData({ ...formData, moderatorIds: [...ids, mentor.id] });
                          } else {
                            setFormData({ ...formData, moderatorIds: ids.filter(id => id !== mentor.id) });
                          }
                        }}
                        className="w-4 h-4 rounded border-primary text-primary focus:ring-primary"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{mentor.profile?.displayName || mentor.username}</span>
                        <span className="text-[10px] opacity-60 font-semibold">{mentor.profile?.mentorStatus || 'Certified Mentor'}</span>
                      </div>
                    </label>
                  ))}
                  {mentors.length === 0 && (
                    <div className="col-span-full py-8 flex flex-col items-center justify-center text-muted-foreground opacity-60">
                      <UserCheck size={24} />
                      <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-center">No qualified peer mentors found</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Emoji Icon</label>
                  <input
                    type="text"
                    required
                    value={formData.iconEmoji}
                    onChange={(e) => setFormData({ ...formData, iconEmoji: e.target.value })}
                    className="w-full px-4 py-4 bg-secondary/30 border border-border/50 rounded-2xl text-center text-2xl focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Accent Color</label>
                  <div className="relative">
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="w-full h-[60px] p-1 bg-secondary/30 border border-border/50 rounded-2xl cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Display Order</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                      <Layers size={18} />
                    </div>
                    <input
                      type="number"
                      required
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                      className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border/50 rounded-2xl focus:outline-none focus:border-primary transition-all font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <label className="flex items-center gap-3 p-4 bg-secondary/20 rounded-2xl cursor-pointer hover:bg-secondary/30 transition-all border border-border/50">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded-lg border-primary text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-black italic">Is Active</span>
                </label>
                
                <label className="flex items-center gap-3 p-4 bg-secondary/20 rounded-2xl cursor-pointer hover:bg-secondary/30 transition-all border border-border/50">
                  <input
                    type="checkbox"
                    checked={formData.requiresPreReview}
                    onChange={(e) => setFormData({ ...formData, requiresPreReview: e.target.checked })}
                    className="w-5 h-5 rounded-lg border-primary text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-black italic">Pre-Review</span>
                </label>

                <label className="flex items-center gap-3 p-4 bg-secondary/20 rounded-2xl cursor-pointer hover:bg-secondary/30 transition-all border border-border/50">
                  <input
                    type="checkbox"
                    checked={formData.isAgeSpecific}
                    onChange={(e) => setFormData({ ...formData, isAgeSpecific: e.target.checked })}
                    className="w-5 h-5 rounded-lg border-primary text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-black italic">Age-Specific</span>
                </label>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-4 bg-secondary rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-secondary/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  <span>{editingCircle ? 'Save Changes' : 'Create Circle'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

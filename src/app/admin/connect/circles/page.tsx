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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Community <span className="text-primary">Circles</span></h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and curate safe spaces for the community.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-md transition-all hover:translate-y-[-2px]"
        >
          <Plus size={18} />
          <span className="text-sm font-semibold">New Circle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {circles.map((circle) => (
          <div key={circle.id} className="bg-white border border-border/60 rounded-2xl p-5 flex flex-col gap-4 group hover:shadow-xl hover:border-primary/20 transition-all duration-500 relative">
            <div className="flex items-center justify-between">
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-inner bg-slate-50"
                style={{ color: circle.accentColor }}
              >
                {circle.iconEmoji}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenModal(circle)}
                  className="p-1.5 hover:bg-primary/10 hover:text-primary transition-all text-muted-foreground"
                >
                  <Edit size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(circle.id)}
                  className="p-1.5 hover:bg-destructive/10 hover:text-destructive transition-all text-muted-foreground"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">{circle.name}</h3>
                {!circle.isActive && (
                  <span className="text-[8px] font-medium bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-200">
                    Draft
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground font-mono opacity-50">
                /{circle.slug}
              </p>
            </div>

            <p className="text-[11px] text-muted-foreground/80 font-normal line-clamp-2 leading-relaxed">
              {circle.description || 'No description provided.'}
            </p>

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
              <div className="flex gap-1.5">
                {circle.requiresPreReview && <div className="w-1.5 h-1.5 rounded-full bg-rose-400" title="Moderated" />}
                {circle.isAgeSpecific && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" title="Age-Gated" />}
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Active" />
              </div>
              <span className="text-[9px] font-medium text-slate-400">
                Ord. {circle.sortOrder}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Circle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={handleCloseModal} />
          
          <div className="glass-card w-full max-w-2xl rounded-3xl border-primary/10 shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[95vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingCircle ? 'Edit' : 'Create'} <span className="text-primary">Circle</span>
                </h2>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Configure your community space settings</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8 overflow-y-auto">
              {/* Section: Basic Information */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary/70 border-b border-primary/10 pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-700 ml-1">Circle Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                        <Type size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Period Talk"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-700 ml-1">URL Slug</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                        <Hash size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        placeholder="e.g. period-talk"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700 ml-1">Description</label>
                <div className="relative group">
                  <div className="absolute top-3 left-3.5 text-slate-400 group-focus-within:text-primary transition-colors">
                    <AlignLeft size={16} />
                  </div>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Briefly describe this community space..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700 ml-1">Benefits of Joining</label>
                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                      <CheckCircle2 size={16} />
                    </div>
                    <input
                      type="text"
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                      placeholder="e.g. Expert moderation, safe space..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.benefits?.map((benefit, index) => (
                    <span 
                      key={index}
                      className="flex items-center gap-1.5 bg-primary/5 text-primary px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-primary/10"
                    >
                      {benefit}
                      <button 
                        type="button" 
                        onClick={() => removeBenefit(benefit)}
                        className="hover:text-destructive transition-colors opacity-60 hover:opacity-100"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Section: Discovery & Access */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary/70 border-b border-primary/10 pb-2">Discovery & Access</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-700 ml-1">Min Content Tier</label>
                    <select
                      value={formData.minContentTier || ''}
                      onChange={(e) => setFormData({ ...formData, minContentTier: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all text-sm font-medium appearance-none cursor-pointer"
                    >
                      <option value="">No Minimum</option>
                      {contentTiers.map(tier => (
                        <option key={tier.value} value={tier.value}>{tier.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-700 ml-1">Max Content Tier</label>
                    <select
                      value={formData.maxContentTier || ''}
                      onChange={(e) => setFormData({ ...formData, maxContentTier: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all text-sm font-medium appearance-none cursor-pointer"
                    >
                      <option value="">No Maximum</option>
                      {contentTiers.map(tier => (
                        <option key={tier.value} value={tier.value}>{tier.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section: Moderation & Assignment */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary/70 border-b border-primary/10 pb-2">Moderation & Assignment</h3>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-700 ml-1 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-primary" />
                    Assigned Peer Mentors
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100 max-h-[160px] overflow-y-auto">
                    {mentors.map((mentor) => (
                      <label 
                        key={mentor.id} 
                        className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
                          formData.moderatorIds?.includes(mentor.id) 
                            ? 'bg-white border-primary/30 text-primary shadow-sm' 
                            : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'
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
                          className="w-3.5 h-3.5 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <div className="flex flex-col leading-tight">
                          <span className="text-[11px] font-bold">{mentor.profile?.displayName || mentor.username}</span>
                          <span className="text-[9px] opacity-60 font-medium">Mentor</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section: Visuals & Order */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div className="space-y-1.5 text-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Emoji Icon</label>
                  <input
                    type="text"
                    required
                    value={formData.iconEmoji}
                    onChange={(e) => setFormData({ ...formData, iconEmoji: e.target.value })}
                    className="w-full py-2 bg-white border border-slate-200 rounded-lg text-center text-xl focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-1.5 text-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Accent</label>
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-full h-11 p-1 bg-white border border-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5 text-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Order</label>
                  <input
                    type="number"
                    required
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                    className="w-full py-2 bg-white border border-slate-200 rounded-lg text-center text-sm font-bold focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span className="text-[11px] font-bold text-slate-700">Active</span>
                </label>
                
                <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.requiresPreReview}
                    onChange={(e) => setFormData({ ...formData, requiresPreReview: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span className="text-[11px] font-bold text-slate-700">Pre-Review</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.isAgeSpecific}
                    onChange={(e) => setFormData({ ...formData, isAgeSpecific: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span className="text-[11px] font-bold text-slate-700">Age-Specific</span>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/10 hover:translate-y-[-1px] active:translate-y-[0px] transition-all flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
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

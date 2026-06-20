'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Plus, Pencil, Trash2, Search, Loader2, User, AlertCircle, X, Check } from 'lucide-react';

interface ExpertProfile {
  displayName: string;
  specialisation?: string;
  consultationPrice?: number;
  bio?: string;
}

interface Expert {
  id: string;
  email: string;
  phone: string;
  username: string;
  profile: ExpertProfile;
  createdAt: string;
}

export default function ManageExperts() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    displayName: '',
    specialisation: '',
    consultationPrice: '',
    bio: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<Expert[]>('/admin/experts');
      setExperts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch experts', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingExpert(null);
    setFormData({
      email: '',
      phone: '',
      displayName: '',
      specialisation: '',
      consultationPrice: '500',
      bio: ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (expert: Expert) => {
    setEditingExpert(expert);
    setFormData({
      email: expert.email || '',
      phone: expert.phone || '',
      displayName: expert.profile?.displayName || '',
      specialisation: expert.profile?.specialisation || '',
      consultationPrice: expert.profile?.consultationPrice?.toString() || '500',
      bio: expert.profile?.bio || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingExpert) {
        await apiClient.patch(`/admin/experts/${editingExpert.id}`, formData);
      } else {
        await apiClient.post('/admin/experts', formData);
      }
      await fetchExperts();
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save expert');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expert? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/admin/experts/${id}`);
      setExperts(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete expert');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredExperts = experts.filter(e => {
    const q = searchTerm.toLowerCase();
    const name = e.profile?.displayName?.toLowerCase() || '';
    const email = e.email?.toLowerCase() || '';
    return name.includes(q) || email.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search experts by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none text-sm transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Expert
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : filteredExperts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-16 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <User size={24} className="text-slate-400" />
          </div>
          <p className="font-bold text-slate-600">No experts found</p>
          <p className="text-sm text-muted-foreground mt-1.5">
            {searchTerm ? 'Try a different search term.' : 'Click "Add Expert" to create one.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExperts.map(expert => (
            <div key={expert.id} className="bg-white rounded-3xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(expert)}
                  className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="Edit Expert"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(expert.id)}
                  disabled={deletingId === expert.id}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Expert"
                >
                  {deletingId === expert.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg">
                  {expert.profile?.displayName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{expert.profile?.displayName || 'Unnamed'}</h3>
                  <p className="text-xs text-muted-foreground">{expert.profile?.specialisation || 'No specialisation'}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[150px]">{expert.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Phone</span>
                  <span className="font-semibold text-slate-700">{expert.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Consultation Price</span>
                  <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-xs">
                    ₹{expert.profile?.consultationPrice || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800">
                {editingExpert ? 'Edit Expert' : 'Add New Expert'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {error && (
                <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-xl flex items-center gap-2 text-sm font-semibold border border-rose-100">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              
              <form id="expert-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Display Name *</label>
                    <input
                      required
                      type="text"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none text-sm transition-all bg-slate-50 focus:bg-white"
                      value={formData.displayName}
                      onChange={e => setFormData({...formData, displayName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Consultation Price (₹) *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none text-sm transition-all bg-slate-50 focus:bg-white"
                      value={formData.consultationPrice}
                      onChange={e => setFormData({...formData, consultationPrice: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email {editingExpert ? '' : '*'}</label>
                    <input
                      required={!editingExpert}
                      type="email"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none text-sm transition-all bg-slate-50 focus:bg-white"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Phone {editingExpert ? '' : '*'}</label>
                    <input
                      required={!editingExpert}
                      type="tel"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none text-sm transition-all bg-slate-50 focus:bg-white"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Specialisation</label>
                  <input
                    type="text"
                    placeholder="e.g. Child Psychologist"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none text-sm transition-all bg-slate-50 focus:bg-white"
                    value={formData.specialisation}
                    onChange={e => setFormData({...formData, specialisation: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Bio</label>
                  <textarea
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none text-sm transition-all bg-slate-50 focus:bg-white resize-none"
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                  />
                </div>
                
                {!editingExpert && (
                  <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-500" />
                    Default password will be set to: <strong>Expert@123</strong>
                  </p>
                )}
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-border bg-slate-50/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="expert-form"
                disabled={saving}
                className="px-6 py-2 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editingExpert ? 'Save Changes' : 'Create Expert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

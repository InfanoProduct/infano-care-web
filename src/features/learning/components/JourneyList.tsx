'use client';

import { useState } from 'react';
import { useJourneys } from '../hooks/use-journeys';
import { LearningApiService, LearningJourney } from '../services/learning-api';
import { BookOpen, Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, MoreVertical } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { JourneyForm } from './JourneyForm';
import { EpisodeList } from './EpisodeList';

export function JourneyList() {
  const queryClient = useQueryClient();
  const { data: journeys, isLoading, error } = useJourneys();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJourney, setEditingJourney] = useState<LearningJourney | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<LearningJourney | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: Partial<LearningJourney>) => LearningApiService.createJourney(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-journeys'] });
      setIsFormOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<LearningJourney> }) => LearningApiService.updateJourney(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-journeys'] });
      setIsFormOpen(false);
      setEditingJourney(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => LearningApiService.deleteJourney(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-journeys'] });
    }
  });

  const handleCreate = (data: Partial<LearningJourney>) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: Partial<LearningJourney>) => {
    if (editingJourney) {
      updateMutation.mutate({ id: editingJourney.id, data });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this journey? All associated episodes will also be deleted.')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse font-bold text-muted-foreground">Syncing Journeys...</div>;
  if (error) return <div className="p-8 text-center text-rose-500 font-bold glass-card">Connection error while fetching content</div>;

  if (selectedJourney) {
    return (
      <EpisodeList 
        journeyId={selectedJourney.id}
        journeyTitle={selectedJourney.title}
        onBack={() => setSelectedJourney(null)}
      />
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight premium-gradient-text">Learning Repository</h2>
          <p className="text-muted-foreground mt-2 font-medium">Curate and manage educational content journeys</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search journeys..." 
              className="pl-12 pr-6 py-3.5 bg-white border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none w-full md:w-80 shadow-sm transition-all font-medium"
            />
          </div>
          <button 
            onClick={() => { setEditingJourney(null); setIsFormOpen(true); }}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={20} /> New Journey
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {journeys?.map((journey, index) => (
          <div key={journey.id} className="glass-card p-8 rounded-[2.5rem] flex flex-col gap-6 group hover:shadow-glow transition-all border border-transparent hover:border-primary/20 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
            
            <div className="flex items-start justify-between relative">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-black text-slate-200 group-hover:text-primary/20 transition-colors">
                  #{index + 1}
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary-light/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10 group-hover:scale-110 transition-transform">
                  <BookOpen size={28} />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  {journey.premiumEpisodesCount > 0 && journey.freeEpisodesCount > 0 ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-full uppercase tracking-wider border border-amber-500/20">
                      {journey.freeEpisodesCount} Episodes Free
                    </span>
                  ) : journey.isPremium || (journey.premiumEpisodesCount > 0 && journey.freeEpisodesCount === 0) ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-full uppercase tracking-wider border border-amber-500/20">
                      Premium
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-500/10 px-3 py-1.5 rounded-full uppercase tracking-wider border border-blue-500/20">
                      Free
                    </span>
                  )}
                  {journey.isActive ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-full uppercase tracking-wider border border-emerald-500/20">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-600 bg-rose-500/10 px-3 py-1.5 rounded-full uppercase tracking-wider border border-rose-500/20">
                      <XCircle size={12} /> Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="relative">
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-primary transition-colors leading-tight">{journey.title}</h3>
              <p className="text-sm text-muted-foreground font-medium line-clamp-2 mt-2 leading-relaxed">
                {journey.description}
              </p>
            </div>

            <div className="flex items-center gap-6 mt-auto pt-6 border-t border-slate-100/50 relative">
              <div className="text-xs">
                <p className="text-muted-foreground uppercase font-black tracking-widest opacity-60">Episodes</p>
                <p className="font-black text-xl text-slate-800">{journey._count.episodes}</p>
              </div>
              <div className="text-xs">
                <p className="text-muted-foreground uppercase font-black tracking-widest opacity-60">Category</p>
                <p className="font-black text-xl text-slate-800">{journey.category || 'General'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 relative">
              <button 
                onClick={() => setSelectedJourney(journey)}
                className="flex-1 py-3 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
              >
                View Episodes
              </button>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setEditingJourney(journey); setIsFormOpen(true); }}
                  className="p-3 bg-secondary/50 hover:bg-primary/10 hover:text-primary rounded-2xl text-muted-foreground transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(journey.id)}
                  className="p-3 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500/40 hover:text-rose-500 rounded-2xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <JourneyForm 
          title={editingJourney ? 'Edit Journey' : 'Create Journey'}
          initialData={editingJourney || {}}
          onClose={() => { setIsFormOpen(false); setEditingJourney(null); }}
          onSubmit={editingJourney ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LearningApiService } from '../services/learning-api';
import { Plus, Edit2, Trash2, ArrowLeft, GripVertical, CheckCircle2, XCircle, Layout } from 'lucide-react';
import { EpisodeForm } from './EpisodeForm';
import { ActivityEditor } from './ActivityEditor';

interface EpisodeListProps {
  journeyId: string;
  journeyTitle: string;
  onBack: () => void;
}

export function EpisodeList({ journeyId, journeyTitle, onBack }: EpisodeListProps) {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<any | null>(null);
  const [selectedEpisodeForContent, setSelectedEpisodeForContent] = useState<any | null>(null);

  const { data: episodes, isLoading } = useQuery({
    queryKey: ['episodes', journeyId],
    queryFn: () => LearningApiService.fetchEpisodes(journeyId),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => LearningApiService.createEpisode(journeyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['episodes', journeyId] });
      setIsFormOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => LearningApiService.updateEpisode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['episodes', journeyId] });
      setIsFormOpen(false);
      setEditingEpisode(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => LearningApiService.deleteEpisode(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['episodes', journeyId] }),
  });

  const handleCreate = (data: any) => createMutation.mutate(data);
  const handleUpdate = (data: any) => editingEpisode && updateMutation.mutate({ id: editingEpisode.id, data });

  const handleSaveContent = (content: any) => {
    if (selectedEpisodeForContent) {
      updateMutation.mutate({ id: selectedEpisodeForContent.id, data: { content } });
      setSelectedEpisodeForContent(null);
    }
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading Episodes...</div>;

  if (selectedEpisodeForContent) {
    return (
      <ActivityEditor 
        episodeId={selectedEpisodeForContent.id}
        episodeTitle={selectedEpisodeForContent.title}
        initialContent={selectedEpisodeForContent.content}
        onSave={handleSaveContent}
        onBack={() => setSelectedEpisodeForContent(null)}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-white border border-border rounded-2xl hover:bg-secondary transition-all shadow-sm group">
          <ArrowLeft size={24} className="text-muted-foreground group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h2 className="text-3xl font-black text-slate-800">Manage Episodes</h2>
          <p className="text-muted-foreground font-medium">Journey: <span className="text-primary font-bold">{journeyTitle}</span></p>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] overflow-hidden">
        <div className="px-8 py-6 border-b border-border bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-black text-lg uppercase tracking-wider text-muted-foreground">Curriculum Outline</h3>
          <button 
            onClick={() => { setEditingEpisode(null); setIsFormOpen(true); }}
            className="btn-primary flex items-center gap-2 py-2 text-sm"
          >
            <Plus size={18} /> Add Episode
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {episodes?.map((episode: any, index: number) => (
            <div key={episode.id} className="p-6 flex items-center gap-6 hover:bg-primary/[0.01] transition-colors group">
              <div className="text-muted-foreground/30 cursor-grab active:cursor-grabbing">
                <GripVertical size={20} />
              </div>
              
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 shrink-0">
                {index + 1}
              </div>

              {episode.thumbnailUrl && (
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-border shadow-sm">
                  <img src={episode.thumbnailUrl} alt={episode.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors">{episode.title}</h4>
                  {episode.isPremium && (
                    <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-black px-2 py-0.5 rounded-full">PRO</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-medium mt-1 line-clamp-1">{episode.description || 'No description provided.'}</p>
                <button 
                  onClick={() => setSelectedEpisodeForContent(episode)}
                  className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-colors"
                >
                  <Layout size={12} /> Manage Content / Activities
                </button>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Points</p>
                  <p className="font-black text-primary">{episode.points} XP</p>
                </div>

                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  episode.isActive 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                  {episode.isActive ? 'Active' : 'Draft'}
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setEditingEpisode(episode); setIsFormOpen(true); }}
                    className="p-2.5 hover:bg-secondary rounded-xl text-muted-foreground transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => { if(confirm('Delete episode?')) deleteMutation.mutate(episode.id) }}
                    className="p-2.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl text-muted-foreground/40 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {(!episodes || episodes.length === 0) && (
            <div className="p-12 text-center">
              <p className="text-muted-foreground font-bold italic">No episodes found for this journey.</p>
            </div>
          )}
        </div>
      </div>

      {isFormOpen && (
        <EpisodeForm 
          title={editingEpisode ? 'Edit Episode' : 'New Episode'}
          initialData={editingEpisode}
          onClose={() => { setIsFormOpen(false); setEditingEpisode(null); }}
          onSubmit={editingEpisode ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
}

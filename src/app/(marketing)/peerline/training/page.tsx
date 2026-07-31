"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, Lock, PlayCircle, Trophy } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function PeerLineTrainingDashboard() {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainingData = async () => {
      try {
        const response: any = await apiClient.get('/peerline/training/course');
        setEpisodes(response.episodes || []);
      } catch (err) {
        console.error('Failed to fetch training data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    // For guests, read progress from localStorage
    const saved = localStorage.getItem('peerline_completed_episodes');
    if (saved) {
      setCompletedSlugs(JSON.parse(saved));
    }
    
    fetchTrainingData();
  }, []);

  const progressPercentage = episodes.length > 0 ? Math.round((completedSlugs.length / episodes.length) * 100) : 0;
  const isAssessmentUnlocked = episodes.length > 0 && completedSlugs.length >= episodes.length;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Certification Journey...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="mb-12">
          <Link href="/dashboard/peer-training" className="text-sm font-bold text-primary flex items-center gap-1 mb-4 hover:underline">
            <ArrowLeft size={16} /> Back to Onboarding
          </Link>
          <h1 className="text-4xl font-bold font-heading text-slate-900 mb-4">Certification Journey</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Complete all 4 training episodes to unlock the Final Assessment. You must score 80% or higher to become a certified PeerLine Mentor.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl mb-12 flex flex-wrap items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Trophy size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Your Progress</h3>
              <p className="text-sm text-slate-500">{completedSlugs.length} of {episodes.length} Episodes Completed</p>
            </div>
          </div>
          <div className="flex-1 max-w-md h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-slate-900">{progressPercentage}%</span>
          </div>
        </div>

        {/* Episode Grid */}
        <div className="grid gap-6">
          {episodes.map((ep, i) => (
            <Link 
              key={ep.id} 
              href={`/peerline/training/${ep.slug}`}
              className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <PlayCircle size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded">EPISODE 0{i + 1}</span>
                    {completedSlugs.includes(ep.slug) && <CheckCircle2 size={14} className="text-green-500" />}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">{ep.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">{ep.description}</p>
                </div>
              </div>
              <ArrowLeft className="rotate-180 text-slate-300 group-hover:text-primary transition-colors" size={20} />
            </Link>
          ))}

          {/* Assessment */}
          {isAssessmentUnlocked ? (
            <Link href="/peerline/training/assessment" className="relative group overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-accent p-6 rounded-3xl border border-transparent shadow-xl flex items-center justify-between text-white hover:scale-[1.01] transition-transform">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black tracking-widest text-primary bg-white px-2 py-0.5 rounded shadow-sm">UNLOCKED</span>
                    </div>
                    <h4 className="text-lg font-bold text-white">Final Certification Assessment</h4>
                    <p className="text-sm text-white/80 mt-1">Take the 20-question quiz to earn your Mentor Badge.</p>
                  </div>
                </div>
                <ArrowLeft className="rotate-180 text-white/80 group-hover:text-white transition-colors" size={24} />
              </div>
            </Link>
          ) : (
            <div className="relative group overflow-hidden">
              <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200 flex items-center justify-between opacity-60">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                    <Lock size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black tracking-widest text-slate-400 bg-slate-200 px-2 py-0.5 rounded">FINAL STEP</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">Final Certification Assessment</h4>
                    <p className="text-sm text-slate-500 mt-1">Complete all {episodes.length} episodes to unlock the 20-question quiz.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

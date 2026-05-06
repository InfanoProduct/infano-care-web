"use client";

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, PlayCircle, Lock, Trophy, ArrowRight, Loader2, BookOpen, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

export default function MentorTrainingPage() {
  const { token, user } = useAuthStore();
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [completedEpisodes, setCompletedEpisodes] = useState<string[]>([]);
  const [certificationStatus, setCertificationStatus] = useState<string>('pending_training');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [journeyRes, statusRes]: [any, any] = await Promise.all([
        apiClient.get('/learning/journeys/peerline-mentor-certification'),
        apiClient.get('/peerline/training/status'),
      ]);
      setEpisodes(journeyRes.episodes || []);
      setCompletedEpisodes(statusRes.completedEpisodes || []);
      setCertificationStatus(statusRes.certificationStatus || 'pending_training');
    } catch (err) {
      console.error('Failed to fetch training data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validCompletedEpisodes = completedEpisodes.filter(slug => episodes.some(ep => ep.slug === slug));
  const progressPercentage = episodes.length > 0 ? Math.round((validCompletedEpisodes.length / episodes.length) * 100) : 0;
  const isAssessmentUnlocked = episodes.length > 0 && validCompletedEpisodes.length >= episodes.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-purple-500">
        <Loader2 className="animate-spin" size={28} />
        <span className="font-bold text-lg">Loading your Certification Journey...</span>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black tracking-widest uppercase mb-3">
            <BookOpen size={12} /> Certification Path
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Training Journey</h1>
          <p className="text-slate-500 text-lg">Complete all episodes to unlock the final assessment.</p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black text-purple-600 mb-1">{progressPercentage}%</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progress</div>
          {/* Progress bar */}
          <div className="mt-2 w-32 h-2 bg-slate-100 rounded-full overflow-hidden ml-auto">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full transition-all duration-700"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Submitted / Certified Banner */}
      {certificationStatus === 'unregistered' && (
        <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
            <Lock size={28} />
          </div>
          <div>
            <div className="font-black text-red-800">You haven't applied yet!</div>
            <div className="text-sm text-red-600">Please submit a mentor application to unlock the training journey.</div>
          </div>
          <Link href="/peerline/onboarding" className="ml-auto px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">
            Apply Now
          </Link>
        </div>
      )}
      {certificationStatus === 'submitted' && (
        <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4">
          <Trophy className="text-amber-500 shrink-0" size={28} />
          <div>
            <div className="font-black text-amber-800">Assessment Submitted!</div>
            <div className="text-sm text-amber-600">Your results have been sent to the admin for review. You'll be notified once approved.</div>
          </div>
        </div>
      )}
      {certificationStatus === 'certified' && (
        <div className="mb-8 p-6 bg-purple-50 border border-purple-200 rounded-2xl flex items-center gap-4">
          <CheckCircle2 className="text-purple-600 shrink-0" size={28} />
          <div>
            <div className="font-black text-purple-800">You are a Certified Peer Mentor! 🎉</div>
            <div className="text-sm text-purple-600">Access your full dashboard from the sidebar.</div>
          </div>
        </div>
      )}
      {certificationStatus === 'uncertified' && (
        <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4">
          <AlertCircle className="text-red-500 shrink-0" size={28} />
          <div>
            <div className="font-black text-red-800">Certification Revoked</div>
            <div className="text-sm text-red-600">Your peer certification has been revoked by an admin. Please contact support or re-apply if eligible.</div>
          </div>
        </div>
      )}

      {/* Episode List */}
      <div className="relative space-y-8 before:absolute before:left-12 before:top-12 before:bottom-12 before:w-0.5 before:bg-purple-100 before:-translate-x-1/2">
        {episodes.map((ep, i) => {
          const isCompleted = validCompletedEpisodes.includes(ep.slug);
          const isPreviousCompleted = i === 0 || validCompletedEpisodes.includes(episodes[i - 1].slug);
          const isLocked = !isPreviousCompleted && !isCompleted;

          return (
            <div key={ep.id} className="relative pl-24 group">
              {/* Timeline Dot */}
              <div className={`absolute left-12 top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full border-4 flex items-center justify-center z-10 transition-all duration-500 shadow-md ${
                isCompleted
                  ? 'bg-purple-600 border-purple-100 ring-4 ring-purple-100 shadow-purple-200'
                  : isLocked
                    ? 'bg-slate-200 border-white'
                    : 'bg-white border-purple-500 ring-4 ring-purple-100'
              }`}>
                {isCompleted && <CheckCircle2 size={16} className="text-white" />}
                {isLocked && <Lock size={13} className="text-slate-400" />}
                {!isCompleted && !isLocked && <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse" />}
              </div>

              {/* Card */}
              {isLocked ? (
                <div className="bg-white/40 p-7 rounded-[2rem] border border-dashed border-slate-200 flex items-center justify-between opacity-50">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                      <Lock size={24} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Episode {String(i + 1).padStart(2, '0')}</div>
                      <h4 className="text-xl font-bold text-slate-400">{ep.title}</h4>
                      <p className="text-sm text-slate-400 mt-1 italic">Complete the previous episode to unlock</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href={`/peerline/dashboard/training/${ep.slug}`}
                  className={`bg-white p-7 rounded-[2rem] border shadow-xl flex items-center justify-between transition-all hover:scale-[1.015] hover:shadow-2xl group/card ${
                    isCompleted
                      ? 'border-purple-100 hover:shadow-purple-100'
                      : 'border-purple-200/50 hover:shadow-purple-100'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                      isCompleted ? 'bg-purple-50 text-purple-600' : 'bg-purple-50 text-purple-500'
                    }`}>
                      {isCompleted ? <CheckCircle2 size={28} /> : <PlayCircle size={28} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full ${
                          isCompleted ? 'bg-purple-100 text-purple-700' : 'bg-purple-50 text-purple-500'
                        }`}>
                          EPISODE {String(i + 1).padStart(2, '0')}
                        </span>
                        {isCompleted && <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider">✓ Completed</span>}
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 group-hover/card:text-purple-700 transition-colors">{ep.title}</h4>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{ep.description}</p>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isCompleted ? 'bg-purple-50 text-purple-600' : 'bg-slate-50 text-slate-300 group-hover/card:bg-purple-50 group-hover/card:text-purple-500'
                  }`}>
                    <ArrowRight size={20} />
                  </div>
                </Link>
              )}
            </div>
          );
        })}

        {/* Final Assessment Node */}
        <div className="relative pl-24 pt-4">
          <div className={`absolute left-12 top-0 bottom-0 w-0.5 -translate-x-1/2 ${isAssessmentUnlocked ? 'bg-purple-400' : 'bg-purple-100'}`} />

          {isAssessmentUnlocked && certificationStatus === 'pending_training' ? (
            <Link
              href="/peerline/dashboard/assessment"
              className="p-10 bg-gradient-to-br from-purple-600 to-violet-700 rounded-[3rem] text-white flex items-center justify-between overflow-hidden relative shadow-2xl shadow-purple-300/40 hover:scale-[1.01] transition-transform group/assess"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Trophy size={24} />
                  </div>
                  <span className="text-xs font-black tracking-widest uppercase text-white/80">Certification Gate</span>
                </div>
                <h3 className="text-3xl font-bold mb-2">Final Assessment</h3>
                <p className="text-white/75 max-w-md leading-relaxed">20-question comprehensive quiz. 80% required to earn your badge.</p>
              </div>
              <div className="bg-white text-purple-700 px-8 py-5 rounded-2xl font-black flex items-center gap-3 shadow-2xl group-hover/assess:gap-5 transition-all shrink-0 ml-6">
                Start Assessment <ArrowRight size={24} />
              </div>
            </Link>
          ) : certificationStatus === 'pending_conduct' ? (
            <Link
              href="/peerline/dashboard/assessment"
              className="p-10 bg-amber-50 border border-amber-200 rounded-[3rem] flex items-center justify-between group/assess transition-transform hover:scale-[1.01] shadow-xl shadow-amber-100"
            >
              <div className="flex items-center gap-6">
                <Shield className="text-amber-500 shrink-0" size={48} />
                <div>
                  <h3 className="text-2xl font-bold text-amber-800 mb-1">Action Required: Code of Conduct</h3>
                  <p className="text-amber-600">You passed the assessment! Please sign the Code of Conduct to submit your application.</p>
                </div>
              </div>
              <div className="bg-amber-100 text-amber-700 px-6 py-4 rounded-2xl font-black flex items-center gap-2 group-hover/assess:gap-4 transition-all">
                Review & Sign <ArrowRight size={20} />
              </div>
            </Link>
          ) : certificationStatus === 'submitted' ? (
            <div className="p-10 bg-amber-50 border border-amber-200 rounded-[3rem] flex items-center gap-6">
              <Trophy className="text-amber-500 shrink-0" size={48} />
              <div>
                <h3 className="text-2xl font-bold text-amber-800 mb-1">Assessment Submitted</h3>
                <p className="text-amber-600">Awaiting admin review. You'll be promoted to Peer Mentor upon approval.</p>
              </div>
            </div>
          ) : certificationStatus === 'certified' ? (
            <div className="p-10 bg-purple-50 border border-purple-200 rounded-[3rem] flex items-center gap-6">
              <CheckCircle2 className="text-purple-600 shrink-0" size={48} />
              <div>
                <h3 className="text-2xl font-bold text-purple-800 mb-1">Certified Peer Mentor 🎉</h3>
                <p className="text-purple-600">You've completed the full certification journey.</p>
              </div>
            </div>
          ) : (
            <div className="p-10 bg-slate-900 rounded-[3rem] text-white flex items-center justify-between overflow-hidden relative opacity-50 border border-white/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-slate-400"><Lock size={24} /></div>
                  <span className="text-xs font-black tracking-widest uppercase text-slate-500">Locked Milestone</span>
                </div>
                <h3 className="text-3xl font-bold mb-2 text-slate-200 italic">Final Certification Assessment</h3>
                <p className="text-slate-500 max-w-md">Complete all episodes to unlock the graduation assessment.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

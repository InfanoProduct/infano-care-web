"use client";

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, PlayCircle, Lock, Trophy, ArrowRight, Loader2, BookOpen, Shield, AlertCircle, Download } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { getCertificateTemplate } from './certificate-template';

export default function MentorTrainingPage() {
  const { token, user } = useAuthStore();
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [completedEpisodes, setCompletedEpisodes] = useState<string[]>([]);
  const [certificationStatus, setCertificationStatus] = useState<string>('pending_training');
  const [userName, setUserName] = useState<string>('');
  const [certificateId, setCertificateId] = useState<string>('');
  const [certifiedAt, setCertifiedAt] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, journeyRes]: [any, any] = await Promise.all([
        apiClient.get('/peerline/training/status'),
        apiClient.get('/peerline/training/course'),
      ]);
      setEpisodes(journeyRes.episodes || []);
      setCompletedEpisodes(statusRes.completedEpisodes || []);
      setCertificationStatus(statusRes.certificationStatus || 'pending_training');
      setUserName(statusRes.name || '');
      setCertificateId(statusRes.certificateId || '');
      setCertifiedAt(statusRes.certifiedAt || '');
    } catch (err) {
      console.error('Failed to fetch training data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownloadCertificate = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dateStr = certifiedAt ? new Date(certifiedAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : new Date().toLocaleDateString(undefined, { dateStyle: 'long' });
    const htmlContent = getCertificateTemplate(userName, dateStr, certificateId);

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const validCompletedEpisodes = completedEpisodes.filter(slug => episodes.some(ep => ep.slug === slug));
  const progressPercentage = episodes.length > 0 ? Math.round((validCompletedEpisodes.length / episodes.length) * 100) : 0;
  const isAssessmentUnlocked = episodes.length > 0 && validCompletedEpisodes.length >= episodes.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-purple-500">
        <Loader2 className="animate-spin" size={24} />
        <span className="font-bold text-sm">Loading Certification Journey...</span>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-3xl mx-auto py-2">
      {/* Sleek Compact Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[9px] font-extrabold tracking-wider uppercase mb-1.5">
            <BookOpen size={11} /> Certification Path
          </div>
          <h1 className="text-2xl font-black text-slate-900">Training Journey</h1>
          <p className="text-slate-500 text-xs font-semibold mt-0.5">Complete all episodes to unlock the final assessment.</p>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-2xl font-black text-purple-700">{progressPercentage}%</span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Progress</span>
          </div>
          {/* Progress bar */}
          <div className="mt-1 w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden ml-auto">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full transition-all duration-700"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status Banners */}
      {certificationStatus === 'unregistered' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-500 shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <div className="font-extrabold text-xs text-red-800">Application Required</div>
              <div className="text-xs text-red-600">Please submit a mentor application to unlock the training journey.</div>
            </div>
          </div>
          <Link href="/peerline/onboarding" className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors shrink-0">
            Apply Now
          </Link>
        </div>
      )}

      {certificationStatus === 'submitted' && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3.5">
          <Trophy className="text-amber-500 shrink-0" size={22} />
          <div>
            <div className="font-extrabold text-xs text-amber-800">Assessment Submitted!</div>
            <div className="text-xs text-amber-600">Your results have been sent to the admin for review. You'll be notified once approved.</div>
          </div>
        </div>
      )}

      {certificationStatus === 'certified' && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-purple-600 shrink-0" size={22} />
            <div>
              <div className="font-extrabold text-xs text-purple-800">Certified Peer Mentor 🎉</div>
              <div className="text-xs text-purple-600">Access your full dashboard from the sidebar.</div>
            </div>
          </div>
          <button
            onClick={handleDownloadCertificate}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition-all shadow-md shadow-purple-200 active:scale-95 shrink-0"
            title="Download Certification"
          >
            <Download size={15} />
            Download Certificate
          </button>
        </div>
      )}

      {certificationStatus === 'unapproved' && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
          <AlertCircle className="text-amber-500 shrink-0" size={22} />
          <div>
            <div className="font-extrabold text-xs text-amber-800">Action Required: Re-assessment Needed</div>
            <div className="text-xs text-amber-600">Please re-complete all episodes and score 80% or above on the final assessment.</div>
          </div>
        </div>
      )}

      {certificationStatus === 'uncertified' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
          <AlertCircle className="text-red-500 shrink-0" size={22} />
          <div>
            <div className="font-extrabold text-xs text-red-800">Certification Revoked</div>
            <div className="text-xs text-red-600">Your peer certification has been revoked. Please contact support if eligible.</div>
          </div>
        </div>
      )}

      {/* Episode Timeline & Compact Cards */}
      <div className="relative space-y-4 before:absolute before:left-6 before:top-6 before:bottom-6 before:w-0.5 before:bg-purple-100 before:-translate-x-1/2">
        {episodes.map((ep, i) => {
          const isCompleted = validCompletedEpisodes.includes(ep.slug);
          const isPreviousCompleted = i === 0 || validCompletedEpisodes.includes(episodes[i - 1].slug);
          const isLocked = !isPreviousCompleted && !isCompleted;

          return (
            <div key={ep.id} className="relative pl-14 group">
              {/* Timeline Dot */}
              <div
                className={`absolute left-6 top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 shadow-xs ${
                  isCompleted
                    ? 'bg-purple-600 border-purple-100 ring-2 ring-purple-100'
                    : isLocked
                    ? 'bg-slate-200 border-white'
                    : 'bg-white border-purple-500 ring-2 ring-purple-100'
                }`}
              >
                {isCompleted && <CheckCircle2 size={13} className="text-white" />}
                {isLocked && <Lock size={11} className="text-slate-400" />}
                {!isCompleted && !isLocked && <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />}
              </div>

              {/* Compact Card */}
              {isLocked ? (
                <div className="bg-white/40 p-4.5 rounded-2xl border border-dashed border-slate-200 flex items-center justify-between opacity-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                      <Lock size={18} />
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                        Episode {String(i + 1).padStart(2, '0')}
                      </div>
                      <h4 className="text-base font-bold text-slate-400">{ep.title}</h4>
                      <p className="text-xs text-slate-400 italic mt-0.5">Complete previous episode to unlock</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href={`/dashboard/peer-training/${ep.slug}`}
                  className={`bg-white p-4.5 rounded-2xl border shadow-sm hover:shadow-md flex items-center justify-between transition-all group/card ${
                    isCompleted ? 'border-purple-100 hover:border-purple-200' : 'border-purple-200/60 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isCompleted ? 'bg-purple-50 text-purple-600' : 'bg-purple-50 text-purple-600'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={20} /> : <PlayCircle size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-full ${
                            isCompleted ? 'bg-purple-100 text-purple-700' : 'bg-purple-50 text-purple-600'
                          }`}
                        >
                          EPISODE {String(i + 1).padStart(2, '0')}
                        </span>
                        {isCompleted && <span className="text-[9px] font-black text-purple-600 uppercase tracking-wider">✓ Completed</span>}
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 group-hover/card:text-purple-700 transition-colors">
                        {ep.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{ep.description}</p>
                    </div>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ml-4 ${
                      isCompleted
                        ? 'bg-purple-50 text-purple-600'
                        : 'bg-slate-50 text-slate-300 group-hover/card:bg-purple-50 group-hover/card:text-purple-600'
                    }`}
                  >
                    <ArrowRight size={16} />
                  </div>
                </Link>
              )}
            </div>
          );
        })}

        {/* Final Assessment Milestone */}
        <div className="relative pl-14 pt-2">
          <div className={`absolute left-6 top-0 bottom-0 w-0.5 -translate-x-1/2 ${isAssessmentUnlocked ? 'bg-purple-400' : 'bg-purple-100'}`} />

          {isAssessmentUnlocked && (certificationStatus === 'pending_training' || certificationStatus === 'unapproved') ? (
            <Link
              href="/dashboard/peer-training/assessment"
              className="p-6 bg-gradient-to-br from-purple-600 to-violet-700 rounded-2xl text-white flex items-center justify-between relative shadow-lg shadow-purple-200/50 hover:scale-[1.01] transition-all group/assess"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xs">
                    <Trophy size={18} />
                  </div>
                  <span className="text-[10px] font-black tracking-widest uppercase text-white/80">Certification Gate</span>
                </div>
                <h3 className="text-xl font-black mb-1">Final Assessment</h3>
                <p className="text-xs text-white/80 max-w-sm">20-question quiz. 80% required to earn your badge.</p>
              </div>
              <div className="bg-white text-purple-700 px-5 py-3 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-md group-hover/assess:gap-3 transition-all shrink-0 ml-4">
                Start Assessment <ArrowRight size={16} />
              </div>
            </Link>
          ) : certificationStatus === 'pending_conduct' ? (
            <Link
              href="/dashboard/peer-training/assessment"
              className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between group/assess transition-all hover:scale-[1.01] shadow-sm"
            >
              <div className="flex items-center gap-4">
                <Shield className="text-amber-500 shrink-0" size={32} />
                <div>
                  <h3 className="text-lg font-bold text-amber-800 mb-0.5">Code of Conduct Required</h3>
                  <p className="text-xs text-amber-600">You passed the assessment! Sign the Code of Conduct to submit your application.</p>
                </div>
              </div>
              <div className="bg-amber-100 text-amber-700 px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 group-hover/assess:gap-2.5 transition-all shrink-0 ml-4">
                Review & Sign <ArrowRight size={15} />
              </div>
            </Link>
          ) : certificationStatus === 'submitted' ? (
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4">
              <Trophy className="text-amber-500 shrink-0" size={32} />
              <div>
                <h3 className="text-lg font-bold text-amber-800 mb-0.5">Assessment Submitted</h3>
                <p className="text-xs text-amber-600">Awaiting admin review. You'll be promoted to Peer Mentor upon approval.</p>
              </div>
            </div>
          ) : certificationStatus === 'certified' ? (
            <div className="p-6 bg-purple-50 border border-purple-200 rounded-2xl flex items-center gap-4">
              <CheckCircle2 className="text-purple-600 shrink-0" size={32} />
              <div>
                <h3 className="text-lg font-bold text-purple-800 mb-0.5">Certified Peer Mentor 🎉</h3>
                <p className="text-xs text-purple-600">You've completed the full certification journey.</p>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-900 rounded-2xl text-white flex items-center justify-between relative opacity-60 border border-white/5">
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-slate-400">
                    <Lock size={16} />
                  </div>
                  <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Locked Milestone</span>
                </div>
                <h3 className="text-lg font-bold mb-1 text-slate-200">Final Certification Assessment</h3>
                <p className="text-xs text-slate-400 max-w-sm">Complete all episodes to unlock the graduation assessment.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

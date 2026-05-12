'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { ASSESSMENT_QUESTIONS, EPISODE_QUESTIONS, EPISODE_ORDER, EPISODE_REFLECTION_PROMPTS } from '@/lib/peerline-constants';
import {
  ArrowLeft, Trophy, BookOpen, CheckCircle2, AlertCircle,
  Loader2, Award, Clock
} from 'lucide-react';

export default function PeerAssessmentPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approvingCert, setApprovingCert] = useState(false);

  useEffect(() => {
    apiClient.get(`/admin/users/${userId}`)
      .then((res: any) => setUser(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const handleApproveCertification = async () => {
    setApprovingCert(true);
    try {
      await apiClient.patch(`/admin/users/${userId}/approve-certification`, {});
      router.push('/admin/connect/peers');
    } catch (err: any) {
      alert(err.message || 'Failed to approve certification');
    } finally {
      setApprovingCert(false);
    }
  };

  const handleUnapproveAssessment = async () => {
    if (!confirm('This will unapprove the training/assessment part only. Continue?')) return;
    setApprovingCert(true);
    try {
      await apiClient.patch(`/admin/users/${userId}/unapprove-assessment`, {});
      router.push('/admin/connect/peers');
    } catch (err: any) {
      alert(err.message || 'Failed to unapprove');
    } finally {
      setApprovingCert(false);
    }
  };

  if (loading) return (
    <div className="p-16 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-primary" size={36} />
      <p className="text-sm text-muted-foreground">Loading assessment...</p>
    </div>
  );

  if (!user || !user.peerApplication) return (
    <div className="p-16 text-center">
      <p className="text-sm text-muted-foreground">Assessment data not found.</p>
    </div>
  );

  const app = user.peerApplication;
  const score = app.trainingScore ?? null;
  const passed = score !== null && score >= 80;

  const trainingAnswers = typeof app.trainingAnswers === 'string' ? JSON.parse(app.trainingAnswers) : app.trainingAnswers;
  const episodeAnswers = typeof app.episodeAnswers === 'string' ? JSON.parse(app.episodeAnswers) : app.episodeAnswers;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white border border-border rounded-xl hover:bg-secondary transition-all shadow-sm"
        >
          <ArrowLeft size={18} className="text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Certification <span className="text-purple-600">Assessment</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user.profile?.displayName || 'Candidate'} — Detailed Review
          </p>
        </div>
        <div className="ml-auto flex gap-3">
          {app.certificationStatus === 'submitted' && (
            <button
              disabled={approvingCert}
              onClick={handleApproveCertification}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-purple-300/30 active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              {approvingCert ? <Loader2 size={16} className="animate-spin" /> : <Trophy size={16} />}
              Approve Certification
            </button>
          )}
          {(app.certificationStatus === 'certified' || app.certificationStatus === 'submitted') && (
            <button
              disabled={approvingCert}
              onClick={handleUnapproveAssessment}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-amber-300/30 active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              {approvingCert ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
              Unapprove Assessment
            </button>
          )}
          {app.certificationStatus === 'certified' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl text-xs font-semibold border border-purple-200">
              <CheckCircle2 size={14} /> Certified
            </span>
          )}
        </div>
      </div>

      {/* Score Card */}
      <div className="glass-card rounded-2xl overflow-hidden border-white/40 shadow-xl">
        <div className={`p-6 flex items-center justify-between border-b border-border ${passed ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {passed ? <Award size={28} /> : <AlertCircle size={28} />}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Final Assessment Score</p>
              <h2 className="text-4xl font-bold" style={{ color: passed ? '#16a34a' : '#dc2626' }}>
                {score !== null ? `${score}%` : '—'}
              </h2>
              <p className={`text-sm mt-1 ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {passed ? 'Passed — 80% threshold met' : 'Not passed — Below 80% threshold'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Certification Status</p>
            {app.certificationStatus === 'certified' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold border border-purple-200"><CheckCircle2 size={13}/> Certified</span>
            )}
            {app.certificationStatus === 'submitted' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold border border-amber-200"><Clock size={13}/> Awaiting Approval</span>
            )}
            {!['certified','submitted'].includes(app.certificationStatus) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold"><Clock size={13}/> {app.certificationStatus}</span>
            )}
          </div>
        </div>

        {/* Score Bar */}
        {score !== null && (
          <div className="px-6 py-4 bg-white/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Score Progress</span>
              <span className="text-xs text-muted-foreground">Pass threshold: 80%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${passed ? 'bg-green-500' : 'bg-red-400'}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quiz Breakdown */}
      {trainingAnswers && (
        <div className="glass-card rounded-2xl overflow-hidden border-white/40 shadow-xl">
          <div className="p-6 border-b border-border bg-slate-50/30">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Trophy size={18} className="text-purple-600" />
              Final Quiz Breakdown
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Question-by-question candidate answers vs. correct answers</p>
          </div>
          <div className="p-6 space-y-3">
            {Object.entries(trainingAnswers as Record<string, any>).map(([qIdx, aIdx], i) => {
              const q = ASSESSMENT_QUESTIONS[parseInt(qIdx)];
              const isCorrect = aIdx === q?.answer;
              return (
                <div key={i} className={`rounded-2xl border overflow-hidden ${isCorrect ? 'border-green-100' : 'border-red-100'}`}>
                  <div className={`px-5 py-3 border-b flex items-start gap-3 ${isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isCorrect ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>
                      {isCorrect ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Question {parseInt(qIdx) + 1}</p>
                      <p className="text-sm font-medium text-slate-800">{q?.question || 'Unknown Question'}</p>
                    </div>
                  </div>
                  <div className="p-5 bg-white space-y-2">
                    <div className={`p-3 rounded-xl border text-sm ${isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                      <span className="font-semibold text-xs uppercase tracking-wide mr-2">Candidate:</span>
                      {q?.options[aIdx] || 'No Answer'}
                    </div>
                    {!isCorrect && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700">
                        <span className="font-semibold text-xs uppercase tracking-wide mr-2 text-green-700">✓ Correct:</span>
                        {q?.options[q.answer]}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Episode Reflections */}
      {episodeAnswers && (
        <div className="glass-card rounded-2xl overflow-hidden border-white/40 shadow-xl">
          <div className="p-6 border-b border-border bg-slate-50/30">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              Training Episodes & Reflections
            </h3>
          </div>
          <div className="p-6 space-y-8">
            {EPISODE_ORDER.map((slug, idx) => {
              const actualKey = Object.keys(episodeAnswers).find(k => k.includes(slug) || k.includes(`ep${idx + 1}`)) || slug;
              const data = episodeAnswers[actualKey];
              if (!data) return null;
              
              return (
                <div key={slug} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center rounded-lg">
                      {idx + 1}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-700">
                      {slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </h4>
                  </div>

                  {data.reflection && (
                    <div className="space-y-3">
                      {typeof data.reflection === 'object' ? (
                        Object.entries(data.reflection as Record<string, string>).map(([rKey, rValue], rIdx) => {
                          const prompts = EPISODE_REFLECTION_PROMPTS[slug];
                          const prompt = Array.isArray(prompts) ? prompts[parseInt(rKey)] : prompts;
                          return (
                            <div key={rKey} className="rounded-2xl border border-primary/10 overflow-hidden">
                              <div className="px-5 py-3 bg-primary/5 border-b border-primary/10">
                                <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">Reflection Part {rIdx + 1}</p>
                                <p className="text-xs font-medium text-slate-700">{prompt || 'Reflection Prompt'}</p>
                              </div>
                              <div className="p-5 bg-white">
                                <p className="text-sm text-slate-600 italic leading-relaxed">"{rValue}"</p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded-2xl border border-primary/10 overflow-hidden">
                          <div className="px-5 py-3 bg-primary/5 border-b border-primary/10">
                            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">Episode Reflection</p>
                            <p className="text-xs font-medium text-slate-700">{(EPISODE_REFLECTION_PROMPTS[slug] as string) || 'Reflection Prompt'}</p>
                          </div>
                          <div className="p-5 bg-white">
                            <p className="text-sm text-slate-600 italic leading-relaxed">"{data.reflection}"</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {data.checks && Object.keys(data.checks).length > 0 && (
                    <div className="grid gap-2 pl-3">
                      {Object.entries(data.checks as Record<string, string>).map(([qIdx, answer]) => (
                        <div key={qIdx} className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Check Question {parseInt(qIdx) + 1}</p>
                            <p className="text-xs font-medium text-slate-700">{EPISODE_QUESTIONS[slug]?.[parseInt(qIdx)] || 'Knowledge Check'}</p>
                          </div>
                          <div className="p-5 bg-white">
                            <p className="text-sm text-slate-600 italic leading-relaxed">"{answer}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

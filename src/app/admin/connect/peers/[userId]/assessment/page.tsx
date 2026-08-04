'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { ASSESSMENT_QUESTIONS, EPISODE_QUESTIONS, EPISODE_ORDER, EPISODE_REFLECTION_PROMPTS, ONBOARDING_SCENARIOS } from '@/lib/peerline-constants';
import {
  ArrowLeft, Trophy, BookOpen, CheckCircle2, AlertCircle,
  Loader2, Award, Clock, User, Mail, Phone, FileText, MessageCircle
} from 'lucide-react';

export default function PeerAssessmentPage() {
  const params = useParams();
  const userId = params?.userId as string;
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
      const res: any = await apiClient.patch(`/admin/users/${userId}/approve-certification`, {});
      // Optimistic/Local update before navigation
      if (user) {
        setUser({
          ...user,
          role: 'PEER',
          peerApplication: {
            ...user.peerApplication,
            certificationStatus: 'certified',
            certificateId: res.certificateId
          }
        });
      }
      setTimeout(() => router.push('/admin/connect/peers'), 500);
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
      // Optimistic update
      if (user) {
        setUser({
          ...user,
          role: 'TEEN',
          peerApplication: {
            ...user.peerApplication,
            certificationStatus: 'unapproved'
          }
        });
      }
      setTimeout(() => router.push('/admin/connect/peers'), 500);
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
  const parsedEligibility = typeof app.eligibility === 'string' ? JSON.parse(app.eligibility) : (app.eligibility || {});

  // Calculate age if not in parsedEligibility
  let displayAge = parsedEligibility?.age;
  if (!displayAge && user.birthYear && user.birthMonth) {
    const today = new Date();
    displayAge = today.getFullYear() - user.birthYear;
    if (today.getMonth() + 1 < user.birthMonth) displayAge--;
  } else if (!displayAge && user.ageAtSignup) {
    displayAge = user.ageAtSignup;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="admin-header flex items-center gap-4">
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
          {app.certificateId && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
              ID: {app.certificateId}
            </div>
          )}
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

      {/* Identity Card (from Application) */}
      <div className="glass-card rounded-2xl overflow-hidden border-white/40 shadow-xl">
        <div className="bg-slate-50/50 p-6 border-b border-border">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-light/10 flex items-center justify-center text-primary font-bold text-2xl shadow-lg border border-primary/10">
              {user.profile?.displayName?.[0] || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user.profile?.displayName || app.name || 'Unknown'}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">ID: {user.id}</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                <User size={14} className="text-primary" />
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Full Name</p>
            </div>
            <p className="font-semibold text-sm text-slate-800 truncate">{app.name || 'N/A'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail size={14} className="text-primary" />
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Email Address</p>
            </div>
            <p className="font-semibold text-sm text-slate-800 break-all" title={app.email}>{app.email || 'N/A'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone size={14} className="text-primary" />
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</p>
            </div>
            <p className="font-semibold text-sm text-slate-800 truncate">{app.phone || user.phone || 'N/A'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                <User size={14} className="text-primary" />
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Age</p>
            </div>
            <p className="font-semibold text-sm text-slate-800 truncate">
              {displayAge ? `${displayAge} years` : 'N/A'}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 size={14} className="text-primary" />
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Selected Topics</p>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {(parsedEligibility?.topicIds || user.profile?.certifiedTopicIds || []).length > 0 ? (
                (parsedEligibility?.topicIds || user.profile?.certifiedTopicIds as string[]).map((tId: string) => (
                  <span key={tId} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-[10px] font-bold whitespace-nowrap">
                    {tId.replace('topic-', '').replace(/-/g, ' ')}
                  </span>
                ))
              ) : (
                <p className="font-semibold text-sm text-slate-800">N/A</p>
              )}
            </div>
          </div>
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



      {/* Episode Reflections & Checks */}
      {episodeAnswers && Object.keys(episodeAnswers).length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden border-white/40 shadow-xl">
          <div className="p-6 border-b border-border bg-slate-50/30">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              Episode Reflections & Checks
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Candidate responses from the training episodes.</p>
          </div>
          <div className="p-6 space-y-6">
            {EPISODE_ORDER.map((slug, epIndex) => {
              const epData = episodeAnswers[slug] || episodeAnswers[`episode-${epIndex + 1}`];
              if (!epData) return null;
              
              const reflectionPrompt = EPISODE_REFLECTION_PROMPTS[slug];
              const epQuestions = EPISODE_QUESTIONS[slug] || [];
              
              return (
                <div key={slug} className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                  <div className="bg-primary/5 px-5 py-3 border-b border-primary/10">
                    <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">Episode {epIndex + 1}</p>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed capitalize">
                      {slug.replace(/-/g, ' ')}
                    </p>
                  </div>
                  <div className="p-5 bg-white space-y-5">
                    {/* Reflection */}
                    {epData.reflection && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Reflection</h4>
                        {Array.isArray(reflectionPrompt) ? (
                          <div className="space-y-3">
                            {reflectionPrompt.map((prompt, pIdx) => (
                              <div key={pIdx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                <p className="text-xs font-semibold text-slate-700 mb-2">{prompt}</p>
                                <p className="text-sm text-slate-600">{(epData.reflection as any)?.[pIdx] || 'No response'}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                            <p className="text-xs font-semibold text-slate-700 mb-2">{reflectionPrompt}</p>
                            <p className="text-sm text-slate-600">{typeof epData.reflection === 'string' ? epData.reflection : ((epData.reflection as any)?.[0] || 'No response')}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Checks */}
                    {epData.checks && Object.keys(epData.checks).length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Episode Checks</h4>
                        <div className="space-y-3">
                          {epQuestions.map((qText: string, cIdx: number) => {
                            const ans = (epData.checks as any)[cIdx];
                            if (!ans) return null; // Don't show unanswered checks
                            return (
                              <div key={cIdx} className="p-3 bg-white border border-slate-200 rounded-xl">
                                <p className="text-xs font-semibold text-slate-700 mb-1">Q: {qText}</p>
                                <p className="text-sm text-slate-600"><span className="font-semibold text-xs text-primary uppercase mr-1">A:</span> {ans}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

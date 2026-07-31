"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ChevronRight, BookOpen, Clock, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function MentorEpisodeViewer() {
  const params = useParams();
  const router = useRouter();
  const [episode, setEpisode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('lesson');

  // Progress tracking
  const [lessonRead, setLessonRead] = useState(false);
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<number, string>>({});
  const [checkAnswers, setCheckAnswers] = useState<Record<number, string>>({});

  const [certificationStatus, setCertificationStatus] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, epRes]: [any, any] = await Promise.all([
          apiClient.get('/peerline/training/status'),
          apiClient.get(`/peerline/training/episodes/${params.episodeSlug}`),
        ]);

        const ep = epRes.episode || epRes;
        setEpisode(ep);
        setCertificationStatus(statusRes.certificationStatus);

        // Pre-fill answers if they exist
        if (statusRes.episodeAnswers?.[ep.slug]) {
          const prev = statusRes.episodeAnswers[ep.slug];
          if (prev.reflection) {
            if (typeof prev.reflection === 'object') {
              setReflectionAnswers(prev.reflection);
            } else {
              setReflectionAnswers({ 0: prev.reflection });
            }
          }
          if (prev.checks) setCheckAnswers(prev.checks);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.episodeSlug]);

  // Effect to track tab views
  useEffect(() => {
    if (activeTab === 'lesson') setLessonRead(true);
  }, [activeTab]);

  const handleCheckAnswerChange = (index: number, val: string) => {
    setCheckAnswers((prev) => ({ ...prev, [index]: val }));
  };

  const handleComplete = async () => {
    if (!canComplete || !episode) return;
    setSaving(true);
    try {
      await apiClient.post('/peerline/training/progress', {
        episodeSlug: episode.slug,
        reflection: reflectionAnswers,
        checks: checkAnswers,
      });
    } catch (err) {
      console.error('Failed to save progress:', err);
    } finally {
      setSaving(false);
    }
    router.push('/dashboard/peer-training');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-purple-500">
        <Loader2 className="animate-spin" size={24} />
        <span className="font-bold text-xs">Loading lesson content...</span>
      </div>
    );
  }

  if (!episode) {
    return <div className="flex items-center justify-center py-20 font-bold text-red-500 text-sm">Episode not found.</div>;
  }

  const content = episode.content || {};

  const isReadOnly = ['pending_conduct', 'submitted', 'certified'].includes(certificationStatus);

  // Validation logic
  const reflectionDone = content.activity?.fields
    ? content.activity.fields.every((_: any, i: number) => reflectionAnswers[i]?.trim().length >= 10)
    : (reflectionAnswers[0] || '').trim().length >= 20;

  const checkDone = content.check?.every((_: any, i: number) => checkAnswers[i]?.trim().length > 0) ?? true;
  const canComplete = lessonRead && reflectionDone && checkDone;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 pb-16 max-w-3xl mx-auto py-2">
      {/* Compact Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/peer-training"
          className="text-xs font-bold text-purple-600 flex items-center gap-1 mb-3 hover:underline group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Journey
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[9px] font-black tracking-wider uppercase">
            EPISODE {episode.order}
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <Clock size={12} /> Mandatory Content
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">{episode.title}</h1>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">{episode.description}</p>
      </div>

      {/* Progress Indicators for Tabs */}
      <div className="flex gap-2 border-b border-slate-100 mb-6 overflow-x-auto pb-px custom-scrollbar">
        {[
          { id: 'lesson', label: '1. The Lesson', icon: BookOpen, done: lessonRead },
          { id: 'activity', label: '2. Reflection', icon: Clock, done: reflectionDone },
          { id: 'check', label: '3. Episode Check', icon: CheckCircle2, done: checkDone },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-xs font-extrabold tracking-wider whitespace-nowrap transition-all border-b-2 flex items-center gap-2 relative ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-700 bg-purple-50/70 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <tab.icon size={15} className={tab.done ? 'text-purple-600' : ''} />
            {tab.label}
            {tab.done && <CheckCircle2 size={12} className="absolute top-1.5 right-1.5 text-purple-600" />}
          </button>
        ))}
      </div>

      {/* Main Card */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-md">
        {/* TAB: LESSON */}
        {activeTab === 'lesson' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {content.overview && (
              <section>
                <h3 className="text-lg font-bold mb-3 text-slate-900">Overview</h3>
                <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">{content.overview}</p>
              </section>
            )}

            {content.nonNegotiable && (
              <div className="bg-red-50 border border-red-100 p-5 rounded-2xl relative overflow-hidden">
                <h4 className="text-red-800 font-extrabold tracking-wider uppercase text-[10px] mb-1">
                  Non-Negotiable Principle
                </h4>
                <p className="text-red-900 font-bold text-xs sm:text-sm leading-relaxed">{content.nonNegotiable}</p>
              </div>
            )}

            {content.objectives && (
              <section>
                <h3 className="text-base font-bold mb-4 text-slate-900">Learning Objectives</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {content.objectives.map((obj: string, i: number) => (
                    <div key={i} className="flex gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <CheckCircle2 size={16} className="text-purple-600 shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium text-xs leading-relaxed">{obj}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {content.modules && (
              <section>
                <h3 className="text-base font-bold mb-4 text-slate-900">Core Concepts</h3>
                <div className="space-y-4">
                  {content.modules.map((mod: any) => (
                    <div key={mod.id} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-7 h-7 bg-purple-600 text-white text-[10px] font-black flex items-center justify-center rounded-lg">
                          {mod.id}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{mod.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pl-10">{mod.detail}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {content.safeProtocol && (
              <section>
                <h3 className="text-base font-bold mb-4 text-slate-900">The SAFE Protocol Sequence</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {content.safeProtocol.map((sp: any, i: number) => (
                    <div key={i} className="p-5 bg-slate-900 text-white rounded-2xl border border-white/5 relative">
                      <h4 className="font-black text-purple-400 tracking-wider uppercase text-[10px] mb-1">{sp.step}</h4>
                      <p className="font-bold text-sm mb-2">{sp.action}</p>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 italic text-slate-300 text-xs">
                        "{sp.example}"
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveTab('activity')}
                className="bg-purple-700 hover:bg-purple-800 text-white font-extrabold px-6 py-3 rounded-xl flex items-center gap-2 text-xs shadow-md shadow-purple-200 group transition-all"
              >
                Proceed to Reflection <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* TAB: ACTIVITY */}
        {activeTab === 'activity' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">
                {content.reflection?.title || content.practice?.title || content.activity?.title || 'Reflection Activity'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {content.reflection?.prompt || content.practice?.prompt || "Apply what you've learned in this module."}
              </p>
            </div>

            <div className="space-y-6">
              {content.activity?.fields ? (
                <div className="grid gap-4">
                  {content.activity.fields.map((field: string, i: number) => (
                    <div key={i}>
                      <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                        {field}
                      </label>
                      <textarea
                        value={reflectionAnswers[i] || ''}
                        onChange={(e) => setReflectionAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                        readOnly={isReadOnly}
                        className={`w-full p-4 rounded-2xl border border-slate-200 min-h-[120px] outline-none text-xs sm:text-sm text-slate-700 leading-relaxed transition-all ${
                          isReadOnly
                            ? 'bg-slate-100 cursor-not-allowed'
                            : 'bg-slate-50 focus:ring-2 focus:ring-purple-500/30 focus:bg-white'
                        }`}
                        placeholder={isReadOnly ? 'Response locked after certification.' : 'Type your response...'}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <textarea
                  value={reflectionAnswers[0] || ''}
                  onChange={(e) => setReflectionAnswers((prev) => ({ ...prev, 0: e.target.value }))}
                  readOnly={isReadOnly}
                  className={`w-full p-4 rounded-2xl border border-slate-200 min-h-[220px] outline-none text-xs sm:text-sm text-slate-700 leading-relaxed transition-all ${
                    isReadOnly
                      ? 'bg-slate-100 cursor-not-allowed'
                      : 'bg-slate-50 focus:ring-2 focus:ring-purple-500/30 focus:bg-white'
                  }`}
                  placeholder={isReadOnly ? 'Response locked after certification.' : 'Share your thoughts here (minimum 20 characters)...'}
                />
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => setActiveTab('lesson')}
                className="px-4 py-2 font-bold text-slate-400 hover:text-slate-800 text-xs transition-colors"
              >
                Back to Lesson
              </button>
              <button
                onClick={() => setActiveTab('check')}
                className="bg-purple-700 hover:bg-purple-800 text-white font-extrabold px-6 py-3 rounded-xl flex items-center gap-2 text-xs shadow-md shadow-purple-200 group transition-all"
              >
                Proceed to Episode Check <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* TAB: CHECK */}
        {activeTab === 'check' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Episode Review</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Review these key questions before concluding the episode. This helps solidify your understanding for the final assessment.
              </p>
            </div>

            <div className="grid gap-4">
              {content.check?.map((q: string, i: number) => (
                <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 relative">
                  <div className="w-6 h-6 bg-white border border-slate-200 rounded-md flex items-center justify-center text-[9px] font-black text-purple-700 mb-2">
                    Q{i + 1}
                  </div>
                  <p className="font-bold text-slate-800 mb-3 text-xs sm:text-sm leading-relaxed">{q}</p>
                  <textarea
                    value={checkAnswers[i] || ''}
                    onChange={(e) => handleCheckAnswerChange(i, e.target.value)}
                    readOnly={isReadOnly}
                    className={`w-full p-3.5 rounded-xl border border-slate-200 text-xs outline-none transition-all ${
                      isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-purple-500/30'
                    } min-h-[80px]`}
                    placeholder={isReadOnly ? 'Response locked.' : 'Reflect on this question...'}
                  />
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100">
              {!canComplete && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-amber-800 text-xs font-bold">
                  <AlertCircle size={16} className="text-amber-500 shrink-0" />
                  Please ensure you have read the lesson and answered all reflection questions and episode checks.
                </div>
              )}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setActiveTab('activity')}
                  className="px-4 py-2 font-bold text-slate-400 hover:text-slate-800 text-xs transition-colors"
                >
                  Back to Reflection
                </button>
                <button
                  disabled={(!canComplete || saving) && !isReadOnly}
                  onClick={isReadOnly ? () => router.push('/dashboard/peer-training') : handleComplete}
                  className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-3.5 rounded-xl flex items-center gap-2 text-xs font-black shadow-lg shadow-purple-200 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving Progress...
                    </>
                  ) : isReadOnly ? (
                    <>
                      <CheckCircle2 size={16} /> Return to Dashboard
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Complete Episode
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
        // Fetch sequentially to reduce DB connection pool pressure
        const epRes: any = await apiClient.get(`/learning/episodes/${params.episodeSlug}`);
        const statusRes: any = await apiClient.get('/peerline/training/status');
        
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
    setCheckAnswers(prev => ({ ...prev, [index]: val }));
  };

  const handleComplete = async () => {
    if (!canComplete || !episode) return;
    setSaving(true);
    try {
      await apiClient.post('/peerline/training/progress', { 
        episodeSlug: episode.slug,
        reflection: reflectionAnswers,
        checks: checkAnswers
      });
    } catch (err) {
      console.error('Failed to save progress:', err);
    } finally {
      setSaving(false);
    }
    router.push('/peerline/dashboard/training');
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 font-bold text-slate-400">Loading lesson content...</div>;
  }

  if (!episode) {
    return <div className="flex items-center justify-center py-20 font-bold text-red-500">Episode not found.</div>;
  }

  const content = episode.content || {};
  
  const isReadOnly = ['pending_conduct', 'submitted', 'certified'].includes(certificationStatus);
  
  // Validation logic
  const reflectionDone = content.activity?.fields 
    ? content.activity.fields.every((_: any, i: number) => reflectionAnswers[i]?.trim().length >= 10) // Lowered min chars for multi-fields
    : (reflectionAnswers[0] || '').trim().length >= 20;

  const checkDone = content.check?.every((_: any, i: number) => checkAnswers[i]?.trim().length > 0) ?? true;
  const canComplete = lessonRead && reflectionDone && checkDone;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="mb-10">
        <Link href="/peerline/dashboard/training" className="text-sm font-bold text-purple-600 flex items-center gap-1 mb-6 hover:underline group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Journey
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black tracking-widest uppercase">
            EPISODE {episode.order}
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <Clock size={14} /> Mandatory Content
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold font-heading text-slate-900 mb-4">{episode.title}</h1>
        <p className="text-lg text-slate-500 max-w-3xl leading-relaxed">{episode.description}</p>
      </div>

      {/* Progress Indicators for Tabs */}
      <div className="flex gap-4 border-b border-slate-100 mb-10 overflow-x-auto pb-px scrollbar-hide">
        {[
          { id: 'lesson', label: '1. The Lesson', icon: BookOpen, done: lessonRead },
          { id: 'activity', label: '2. Reflection', icon: Clock, done: reflectionDone },
          { id: 'check', label: '3. Episode Check', icon: CheckCircle2, done: checkDone }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-5 text-sm font-bold tracking-wider whitespace-nowrap transition-all border-b-2 flex items-center gap-2.5 relative ${
              activeTab === tab.id 
                ? 'border-purple-600 text-purple-600 bg-purple-50 rounded-t-2xl' 
                : 'border-transparent text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-t-2xl'
            }`}
          >
            <tab.icon size={18} className={tab.done ? 'text-indigo-500' : ''} />
            {tab.label}
            {tab.done && <CheckCircle2 size={12} className="absolute top-2 right-2 text-indigo-500" />}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40">
        
        {/* TAB: LESSON */}
        {activeTab === 'lesson' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            {content.overview && (
              <section>
                <h3 className="text-2xl font-bold mb-6 text-slate-900">Overview</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{content.overview}</p>
              </section>
            )}

            {content.nonNegotiable && (
              <div className="bg-red-50 border border-red-100 p-8 rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/50 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
                <h4 className="text-red-800 font-black tracking-widest uppercase text-xs mb-3 relative z-10">Non-Negotiable Principle</h4>
                <p className="text-red-900 font-bold text-lg leading-relaxed relative z-10">{content.nonNegotiable}</p>
              </div>
            )}

            {content.objectives && (
              <section>
                <h3 className="text-xl font-bold mb-6 text-slate-900">Learning Objectives</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {content.objectives.map((obj: string, i: number) => (
                    <div key={i} className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <CheckCircle2 size={20} className="text-purple-600 shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium leading-relaxed">{obj}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {content.modules && (
              <section>
                <h3 className="text-xl font-bold mb-8 text-slate-900">Core Concepts</h3>
                <div className="space-y-6">
                  {content.modules.map((mod: any) => (
                    <div key={mod.id} className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="w-8 h-8 bg-purple-600 text-white text-xs font-black flex items-center justify-center rounded-xl shadow-lg shadow-purple-600/20">{mod.id}</span>
                        <h4 className="font-bold text-slate-900 text-lg">{mod.title}</h4>
                      </div>
                      <p className="text-slate-600 leading-relaxed pl-12">{mod.detail}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {content.safeProtocol && (
              <section>
                <h3 className="text-xl font-bold mb-8 text-slate-900">The SAFE Protocol Sequence</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {content.safeProtocol.map((sp: any, i: number) => (
                    <div key={i} className="p-8 bg-slate-900 text-white rounded-[2rem] border border-white/5 relative group hover:scale-[1.02] transition-all">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-purple-600/20 blur-2xl rounded-full" />
                      <h4 className="font-black text-purple-400 tracking-widest uppercase text-xs mb-2">{sp.step}</h4>
                      <p className="font-bold text-lg mb-4">{sp.action}</p>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10 italic text-slate-400 text-sm">
                        "{sp.example}"
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="pt-10 border-t border-slate-100 flex justify-end">
              <button onClick={() => setActiveTab('activity')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-10 py-4 rounded-2xl flex items-center gap-3 text-lg shadow-xl shadow-purple-600/20 group transition-all">
                Proceed to Reflection <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* TAB: ACTIVITY */}
        {activeTab === 'activity' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="max-w-2xl">
              <h3 className="text-3xl font-bold mb-4 text-slate-900">
                {content.reflection?.title || content.practice?.title || content.activity?.title || 'Reflection Activity'}
              </h3>
              <p className="text-lg text-slate-500 leading-relaxed">
                {content.reflection?.prompt || content.practice?.prompt || 'Apply what you\'ve learned in this module to the scenario below.'}
              </p>
            </div>
            
            <div className="space-y-8">
              {content.activity?.fields ? (
                <div className="grid gap-6">
                  {content.activity.fields.map((field: string, i: number) => (
                    <div key={i}>
                      <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">{field}</label>
                      <textarea 
                        value={reflectionAnswers[i] || ''}
                        onChange={(e) => setReflectionAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                        readOnly={isReadOnly}
                        className={`w-full p-6 rounded-3xl border border-slate-100 min-h-[150px] outline-none transition-all text-slate-700 leading-relaxed ${isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50 focus:ring-4 focus:ring-purple-600/10 focus:bg-white focus:border-purple-600/30'}`} 
                        placeholder={isReadOnly ? "Response locked after certification." : "Type your response..."} 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <textarea 
                  value={reflectionAnswers[0] || ''}
                  onChange={(e) => setReflectionAnswers(prev => ({ ...prev, 0: e.target.value }))}
                  readOnly={isReadOnly}
                  className={`w-full p-8 rounded-[2.5rem] border border-slate-100 min-h-[350px] outline-none transition-all text-slate-700 text-lg leading-relaxed shadow-inner ${isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50 focus:ring-4 focus:ring-purple-600/10 focus:bg-white focus:border-purple-600/30'}`}
                  placeholder={isReadOnly ? "Response locked after certification." : "Share your thoughts here (minimum 20 characters)..."}
                />
              )}
            </div>

            <div className="pt-10 border-t border-slate-100 flex justify-between items-center">
              <button onClick={() => setActiveTab('lesson')} className="px-8 py-4 font-bold text-slate-400 hover:text-slate-900 transition-colors">Back to Lesson</button>
              <button onClick={() => setActiveTab('check')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-10 py-4 rounded-2xl flex items-center gap-3 text-lg shadow-xl shadow-purple-600/20 group transition-all">
                Proceed to Episode Check <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* TAB: CHECK */}
        {activeTab === 'check' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="max-w-2xl">
              <h3 className="text-3xl font-bold mb-4 text-slate-900">Episode Review</h3>
              <p className="text-lg text-slate-500 leading-relaxed">
                Review these key questions before concluding the episode. This helps solidify your understanding for the final assessment.
              </p>
            </div>

            <div className="grid gap-6">
              {content.check?.map((q: string, i: number) => (
                <div key={i} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm relative group">
                  <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400 absolute -top-3 left-8 shadow-sm">Q{i+1}</div>
                  <p className="font-bold text-slate-800 mb-6 text-lg leading-relaxed">{q}</p>
                  <textarea 
                    value={checkAnswers[i] || ''}
                    onChange={(e) => handleCheckAnswerChange(i, e.target.value)}
                    readOnly={isReadOnly}
                    className={`w-full p-5 rounded-2xl border border-slate-200 text-sm outline-none transition-all ${isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white focus:ring-4 focus:ring-purple-600/10'} min-h-[100px]`}
                    placeholder={isReadOnly ? "Response locked." : "Reflect on this question..."}
                  />
                </div>
              ))}
            </div>

            <div className="pt-10 border-t border-slate-100">
              {!canComplete && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-700 text-sm font-bold animate-pulse">
                  <AlertCircle size={20} />
                  Please ensure you have read the lesson and answered all reflection questions (min 20 chars) and episode checks.
                </div>
              )}
              <div className="flex justify-between items-center">
                <button onClick={() => setActiveTab('activity')} className="px-8 py-4 font-bold text-slate-400 hover:text-slate-900 transition-colors">Back to Reflection</button>
                <button 
                  disabled={(!canComplete || saving) && !isReadOnly}
                  onClick={isReadOnly ? () => router.push('/peerline/dashboard/training') : handleComplete} 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-5 rounded-2xl flex items-center gap-3 text-lg font-bold shadow-2xl shadow-purple-300/40 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                  {saving ? (
                    <><Loader2 size={22} className="animate-spin" /> Saving Progress...</>
                  ) : isReadOnly ? (
                    <><CheckCircle2 size={22} /> Return to Dashboard</>
                  ) : (
                    <><CheckCircle2 size={22} /> Complete Episode</>
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

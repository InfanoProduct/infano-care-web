"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ChevronRight, Lock, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function EpisodeViewer() {
  const params = useParams();
  const router = useRouter();
  const [episode, setEpisode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lesson'); // lesson, activity, check

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        const res: any = await apiClient.get(`/learning/episodes/${params.episodeSlug}`);
        setEpisode(res.episode || res);
      } catch (err) {
        console.error('Failed to fetch episode:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEpisode();
  }, [params.episodeSlug]);

  const handleComplete = () => {
    // For guest users, we just mark it complete in local storage
    const completed = JSON.parse(localStorage.getItem('peerline_completed_episodes') || '[]');
    if (!completed.includes(episode?.slug)) {
      completed.push(episode?.slug);
      localStorage.setItem('peerline_completed_episodes', JSON.stringify(completed));
    }
    router.push('/peerline/training');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading episode...</div>;
  }

  if (!episode) {
    return <div className="min-h-screen flex items-center justify-center">Episode not found.</div>;
  }

  const content = episode.content || {};

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/peerline/training" className="text-sm font-bold text-primary flex items-center gap-1 mb-4 hover:underline">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black tracking-widest mb-4">
            EPISODE {episode.order}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-heading text-slate-900 mb-4">{episode.title}</h1>
          <p className="text-lg text-slate-600">{episode.description}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 mb-8 overflow-x-auto pb-px">
          {['lesson', 'activity', 'check'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab === 'lesson' ? 'The Lesson' : tab === 'activity' ? 'Reflection Activity' : 'Episode Check'}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-100 shadow-xl">
          
          {/* TAB: LESSON */}
          {activeTab === 'lesson' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              {content.overview && (
                <section>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><BookOpen className="text-primary" /> Overview</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">{content.overview}</p>
                </section>
              )}

              {content.nonNegotiable && (
                <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
                  <h4 className="text-red-800 font-bold mb-2">Non-Negotiable Principle</h4>
                  <p className="text-red-900/80 text-sm leading-relaxed">{content.nonNegotiable}</p>
                </div>
              )}

              {content.objectives && (
                <section>
                  <h3 className="text-xl font-bold mb-4">Learning Objectives</h3>
                  <ul className="space-y-3">
                    {content.objectives.map((obj: string, i: number) => (
                      <li key={i} className="flex gap-3 text-slate-600">
                        <CheckCircle2 size={20} className="text-primary shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {content.modules && (
                <section>
                  <h3 className="text-xl font-bold mb-6">Core Modules</h3>
                  <div className="space-y-4">
                    {content.modules.map((mod: any) => (
                      <div key={mod.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-slate-200 text-slate-700 text-xs font-black px-2 py-1 rounded">{mod.id}</span>
                          <h4 className="font-bold text-slate-900">{mod.title}</h4>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed ml-12">{mod.detail}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {content.safeProtocol && (
                <section>
                  <h3 className="text-xl font-bold mb-6">The SAFE Sequence</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {content.safeProtocol.map((sp: any, i: number) => (
                      <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                        <h4 className="font-black text-primary mb-1">{sp.step}</h4>
                        <p className="font-bold text-slate-900 mb-2">{sp.action}</p>
                        <p className="text-sm text-slate-500 italic">"{sp.example}"</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div className="pt-8 border-t border-slate-100 flex justify-end">
                <button onClick={() => setActiveTab('activity')} className="btn-primary px-8 py-3 flex items-center gap-2">
                  Next: Reflection Activity <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* TAB: ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h3 className="text-2xl font-bold mb-2">
                {content.reflection?.title || content.practice?.title || content.activity?.title || 'Activity'}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {content.reflection?.prompt || content.practice?.prompt || 'Complete the activity below before moving to the episode check.'}
              </p>
              
              {content.activity?.fields ? (
                <div className="space-y-6">
                  {content.activity.fields.map((field: string, i: number) => (
                    <div key={i}>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{field}</label>
                      <textarea className="w-full p-4 rounded-xl border border-slate-200 min-h-[100px] outline-none focus:ring-2 focus:ring-primary/50" placeholder="Your response..." />
                    </div>
                  ))}
                </div>
              ) : (
                <textarea 
                  className="w-full p-6 rounded-2xl border border-slate-200 min-h-[250px] outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 leading-relaxed"
                  placeholder="Write your reflection here..."
                />
              )}

              <div className="pt-8 border-t border-slate-100 flex justify-between">
                <button onClick={() => setActiveTab('lesson')} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-900">Back</button>
                <button onClick={() => setActiveTab('check')} className="btn-primary px-8 py-3 flex items-center gap-2">
                  Next: Episode Check <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* TAB: CHECK */}
          {activeTab === 'check' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h3 className="text-2xl font-bold mb-2">Episode Check</h3>
              <p className="text-slate-600 leading-relaxed mb-8">
                These questions are not graded, but you should be comfortable answering them before completing the episode.
              </p>

              <div className="space-y-6">
                {content.check?.map((q: string, i: number) => (
                  <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="font-bold text-slate-800 mb-3 text-sm">Q{i + 1}: {q}</p>
                    <textarea 
                      className="w-full p-3 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                      placeholder="Jot down your answer (optional)..."
                    />
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
                <button onClick={() => setActiveTab('activity')} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-900">Back</button>
                <button onClick={handleComplete} className="btn-primary px-8 py-4 flex items-center gap-2 text-lg">
                  <CheckCircle2 size={24} /> Mark Episode Complete
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

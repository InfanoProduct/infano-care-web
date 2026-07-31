"use client";

import { useState, useEffect } from 'react';
import { X, Sparkles, Shield, CheckCircle2, ArrowRight, ArrowLeft, Loader2, BookOpen, HeartHandshake, MessageSquare, CheckSquare } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface BecomePeerMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_TOPICS = [
  { id: 'topic-mental-health', name: 'Mental & Emotional Health', emoji: '🧠', accentColor: '#8B5CF6' },
  { id: 'topic-academic-stress', name: 'Academic & Exam Stress', emoji: '📚', accentColor: '#3B82F6' },
  { id: 'topic-relationships', name: 'Relationships & Peer Pressure', emoji: '💬', accentColor: '#EC4899' },
  { id: 'topic-self-esteem', name: 'Body Image & Self-Esteem', emoji: '✨', accentColor: '#F59E0B' },
  { id: 'topic-personal-growth', name: 'Identity & Personal Growth', emoji: '🌱', accentColor: '#10B981' },
  { id: 'topic-life-transitions', name: 'Family & Life Transitions', emoji: '🏡', accentColor: '#6366F1' },
];

export function BecomePeerMentorModal({ isOpen, onClose, onSuccess }: BecomePeerMentorModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [topics, setTopics] = useState<any[]>(DEFAULT_TOPICS);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    personalStatement: '',
    scenario1: '',
    scenario2: '',
    eligibility: {
      isOver18: false,
      hasLivedExperience: false,
      confidentiality: false,
      boundaries: false,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    const fetchTopics = async () => {
      try {
        const res: any = await apiClient.get('/peerline/topics');
        if (res.topics && res.topics.length > 0) {
          setTopics(res.topics);
        } else {
          setTopics(DEFAULT_TOPICS);
        }
      } catch {
        setTopics(DEFAULT_TOPICS);
      }
    };
    fetchTopics();
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleTopic = (id: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApply = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      await apiClient.post('/peerline/mentor/apply', {
        personalStatement: formData.personalStatement,
        scenarioResponses: [formData.scenario1, formData.scenario2],
        topicIds: selectedTopicIds,
        eligibility: {
          isOver18: formData.eligibility.isOver18,
          hasLivedExperience: formData.eligibility.hasLivedExperience,
          confidentiality: formData.eligibility.confidentiality,
          boundaries: formData.eligibility.boundaries,
          isFluent: true,
          isStable: true,
          isDigitallyLiterate: true,
          canCommit: true,
          agreesToVerification: true,
        },
      });
      setCurrentStep(4); // Advance to completion / training step
      onSuccess();
    } catch (err: any) {
      console.error('Application Error:', err);
      if (err?.message?.includes('already submitted')) {
        setCurrentStep(4);
        onSuccess();
      } else {
        setErrorMsg(err?.message || 'Failed to submit application. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartTraining = () => {
    onClose();
    router.push('/dashboard/peer-training');
  };

  const isStep1Valid = formData.personalStatement.trim().length >= 10;
  const isStep2Valid = formData.scenario1.trim().length >= 10 && formData.scenario2.trim().length >= 10;
  const isStep3Valid = Object.values(formData.eligibility).every(Boolean) && selectedTopicIds.length > 0;

  const stepsList = [
    { number: 1, title: 'Motivation', icon: HeartHandshake },
    { number: 2, title: 'Scenarios', icon: MessageSquare },
    { number: 3, title: 'Topics & Rules', icon: CheckSquare },
  ];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 select-none overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-[2.5rem] max-w-4xl w-full shadow-2xl border border-slate-100 z-10 p-6 md:p-10 space-y-8 animate-in zoom-in-95 duration-200 my-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all z-20"
        >
          <X size={20} />
        </button>

        {/* Modal Top Branding & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 pr-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Become a Peer Mentor</h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Join our supportive peer network and help guide others on their wellness journey.
              </p>
            </div>
          </div>

          {/* Stepper Progress Badges (Only shown for steps 1-3) */}
          {currentStep <= 3 && (
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 shrink-0 self-start md:self-auto">
              {stepsList.map((st) => {
                const Icon = st.icon;
                const active = currentStep === st.number;
                const completed = currentStep > st.number;
                return (
                  <div
                    key={st.number}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                      active
                        ? 'bg-purple-700 text-white shadow-md shadow-purple-200'
                        : completed
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-slate-400'
                    }`}
                  >
                    <Icon size={15} />
                    <span>{st.title}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-600 animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: Personal Motivation */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                Step 1 of 3: Personal Statement
              </span>
              <h3 className="text-xl font-bold text-slate-800 pt-2">Why do you want to become a Peer Mentor?</h3>
              <p className="text-xs text-slate-500 font-medium">
                Share what inspires you to offer peer support. There are no right or wrong answers.
              </p>
            </div>

            <div className="space-y-2">
              <textarea
                rows={5}
                required
                placeholder="Write a short statement (at least 1-2 sentences) about your interest in supporting peers..."
                className="w-full p-4 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-normal"
                value={formData.personalStatement}
                onChange={(e) => setFormData({ ...formData, personalStatement: e.target.value })}
              />
              <p className="text-[11px] text-slate-400 text-right">
                {formData.personalStatement.trim().length}/10 minimum characters
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                disabled={!isStep1Valid}
                onClick={() => setCurrentStep(2)}
                className="py-3.5 px-8 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-purple-200 transition-all disabled:opacity-50 active:scale-98"
              >
                Next: Scenarios <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Scenarios */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                Step 2 of 3: Active Listening Scenarios
              </span>
              <h3 className="text-xl font-bold text-slate-800 pt-2">How would you respond to these peer situations?</h3>
              <p className="text-xs text-slate-500 font-medium">
                Demonstrate active listening and empathy without offering unsolicited advice or clinical diagnoses.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Scenario 1 */}
              <div className="space-y-2 p-5 bg-purple-50/50 rounded-2xl border border-purple-100 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 mb-1">Scenario 1</div>
                  <p className="text-xs font-bold text-purple-950 mb-3 leading-relaxed">
                    User message: <span className="italic font-normal">"I've been feeling so alone lately. I don't think anyone understands."</span>
                  </p>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Write your empathetic, supportive response..."
                  className="w-full p-3.5 rounded-xl border border-purple-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  value={formData.scenario1}
                  onChange={(e) => setFormData({ ...formData, scenario1: e.target.value })}
                />
              </div>

              {/* Scenario 2 */}
              <div className="space-y-2 p-5 bg-purple-50/50 rounded-2xl border border-purple-100 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 mb-1">Scenario 2</div>
                  <p className="text-xs font-bold text-purple-950 mb-3 leading-relaxed">
                    User message: <span className="italic font-normal">"I'm so stressed about my exams. I feel like failing is not an option."</span>
                  </p>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Write your empathetic, supportive response..."
                  className="w-full p-3.5 rounded-xl border border-purple-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  value={formData.scenario2}
                  onChange={(e) => setFormData({ ...formData, scenario2: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="py-3 px-6 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold text-xs flex items-center gap-2 transition-all active:scale-98"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                disabled={!isStep2Valid}
                onClick={() => setCurrentStep(3)}
                className="py-3.5 px-8 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-purple-200 transition-all disabled:opacity-50 active:scale-98"
              >
                Next: Topics & Guidelines <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Topics & Eligibility */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                Step 3 of 3: Certified Topics & Guidelines
              </span>
              <h3 className="text-xl font-bold text-slate-800 pt-2">Select your certified topics & confirm guidelines</h3>
              <p className="text-xs text-slate-500 font-medium">
                Choose the topics you feel confident supporting peers in, so mentees can find you via topic search.
              </p>
            </div>

            {/* Certified Topics Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Topics of Support & Expertise <span className="text-purple-600">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {topics.map((t) => {
                  const isSelected = selectedTopicIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTopic(t.id)}
                      className={`flex items-center gap-2.5 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-50 border-purple-500 text-purple-950 ring-2 ring-purple-300 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-lg shrink-0">{t.emoji || '🌱'}</span>
                      <span className="text-xs font-bold leading-snug">{t.name}</span>
                    </button>
                  );
                })}
              </div>
              {selectedTopicIds.length === 0 && (
                <p className="text-[11px] text-purple-600 font-bold italic">
                  * Select at least one topic to continue.
                </p>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Eligibility & Conduct Confirmation <span className="text-purple-600">*</span>
              </label>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl cursor-pointer hover:bg-purple-50/50 transition-all border border-slate-200/80 hover:border-purple-200">
                  <input
                    type="checkbox"
                    checked={formData.eligibility.isOver18}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        eligibility: { ...formData.eligibility, isOver18: e.target.checked },
                      })
                    }
                    className="w-4.5 h-4.5 accent-purple-600 mt-0.5 shrink-0"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Age & Eligibility Requirement</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">I meet the age and eligibility criteria for Peer Mentors</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl cursor-pointer hover:bg-purple-50/50 transition-all border border-slate-200/80 hover:border-purple-200">
                  <input
                    type="checkbox"
                    checked={formData.eligibility.hasLivedExperience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        eligibility: { ...formData.eligibility, hasLivedExperience: e.target.checked },
                      })
                    }
                    className="w-4.5 h-4.5 accent-purple-600 mt-0.5 shrink-0"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Lived Experience & Empathy</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">I bring genuine lived experience and non-judgmental empathy</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl cursor-pointer hover:bg-purple-50/50 transition-all border border-slate-200/80 hover:border-purple-200">
                  <input
                    type="checkbox"
                    checked={formData.eligibility.confidentiality}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        eligibility: { ...formData.eligibility, confidentiality: e.target.checked },
                      })
                    }
                    className="w-4.5 h-4.5 accent-purple-600 mt-0.5 shrink-0"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Confidentiality & Safety</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">I agree to uphold user privacy and follow crisis escalation rules</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl cursor-pointer hover:bg-purple-50/50 transition-all border border-slate-200/80 hover:border-purple-200">
                  <input
                    type="checkbox"
                    checked={formData.eligibility.boundaries}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        eligibility: { ...formData.eligibility, boundaries: e.target.checked },
                      })
                    }
                    className="w-4.5 h-4.5 accent-purple-600 mt-0.5 shrink-0"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Role Boundaries</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">I understand peer support is lived experience, not clinical therapy</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="py-3 px-6 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold text-xs flex items-center gap-2 transition-all active:scale-98"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                disabled={!isStep3Valid || loading}
                onClick={handleApply}
                className="py-3.5 px-8 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-200 transition-all disabled:opacity-50 active:scale-98"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Submit Application <ArrowRight size={18} /></>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Next Step - Peer Training Required */}
        {currentStep === 4 && (
          <div className="py-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-[2.5rem] bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-xl shadow-purple-100">
              <CheckCircle2 size={44} />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="text-3xl font-black text-slate-900">Application Submitted! 🎉</h3>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                Thank you for applying. Your certified topics have been registered. To officially become a certified Peer Mentor, please complete your training modules.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200/80 p-6 rounded-3xl text-left space-y-3 max-w-xl mx-auto shadow-xs">
              <div className="flex items-center gap-2.5 text-purple-900 font-extrabold text-base">
                <BookOpen size={20} className="text-purple-600" />
                Required Next Step: Complete Peer Training
              </div>
              <p className="text-xs text-purple-800 font-medium">
                Your application has been received. Click below to start your 4-episode training journey:
              </p>
              <ul className="text-xs text-purple-700 space-y-1.5 list-disc list-inside font-semibold pt-1">
                <li>Episode 1: What Is Peer Support?</li>
                <li>Episode 2: Listening Without Fixing</li>
                <li>Episode 3: Safeguarding & Crisis Recognition</li>
                <li>Episode 4: Your Wellbeing as a Mentor</li>
              </ul>
            </div>

            <div className="pt-4">
              <button
                onClick={handleStartTraining}
                className="w-full sm:w-auto py-4 px-12 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-black text-base inline-flex items-center justify-center gap-3 shadow-xl shadow-purple-200 transition-all active:scale-98"
              >
                Start Peer Training Now <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

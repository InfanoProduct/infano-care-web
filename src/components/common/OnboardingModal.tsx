'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { AuthService } from '@/services/auth.service';
import { Loader2, ArrowRight, ArrowLeft, Check, Sparkles, Heart, Star, BookOpen, User, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface OnboardingModalProps {
  isOpen: boolean;
}

export function OnboardingModal({ isOpen }: OnboardingModalProps) {
  const { user, token, refreshToken, setAuth } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Profile fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDay, setBirthDay] = useState(1);
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthYear, setBirthYear] = useState(2010);
  const handleSkip = () => {
    toast.success('Onboarding skipped for this session!');
    if (user) {
      setAuth(token || '', refreshToken || '', {
        ...user,
        isOnboardingCompleted: true, // Skips locally for this session
      });
    }
  };

  // Step 2: Personalization fields
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const isTeen = user?.role === 'TEEN';

  useEffect(() => {
    if (user?.profile?.displayName) {
      setDisplayName(user.profile.displayName);
    }
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  // Constants based on user role
  const TEEN_GOALS = [
    { id: 'Build Self-Confidence', label: 'Build Self-Confidence', desc: 'Gain confidence in school and daily life' },
    { id: 'Understand Puberty & Body Changes', label: 'Understand Puberty & Changes', desc: 'Know what to expect as your body grows' },
    { id: 'Improve Mental Well-being & Emotions', label: 'Manage Emotions & Stress', desc: 'Learn healthy coping skills for high moods' },
    { id: 'Learn Hormonal Health & Hygiene', label: 'Hormonal Health & Hygiene', desc: 'Master physical care and hormone changes' },
  ];

  const PARENT_GOALS = [
    { id: "Track Daughter's Developmental Progress", label: "Track Daughter's Progress", desc: "Understand adolescent growth phases" },
    { id: 'Get Support for Parenting Challenges', label: 'Get Parenting Support', desc: 'Navigate complex puberty topics together' },
    { id: 'Find Quality Learning Programs', label: 'Find Learning Programs', desc: 'Discover guided courses and interactive paths' },
    { id: 'Access Expert Consultation Sessions', label: 'Consult with Experts', desc: 'Book direct calls with pediatric care specialists' },
  ];

  const TEEN_TOPICS = [
    'Body Changes & Puberty',
    'Daily Hygiene & Skincare',
    'Emotional Regulation & Moods',
    'Autonomy & Boundaries',
    'Friendships & Social Dynamics',
    'Nutrition & Healthy Eating',
    'Sleep & Physical Activity'
  ];

  const PARENT_TOPICS = [
    'Adolescent Development',
    'Mental Well-being',
    'Parenting Strategies',
    'Hormonal & Physical Health',
    'Social & Peer Dynamics',
    'Digital Safety & Screen Time'
  ];

  const currentGoals = isTeen ? TEEN_GOALS : PARENT_GOALS;
  const currentTopics = isTeen ? TEEN_TOPICS : PARENT_TOPICS;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Update/Upsert profile displayName and email
      await apiClient.put('/user/profile', {
        displayName,
        email: email.trim(),
      });

      // 2. Setup onboarding profile with birth details
      await apiClient.post('/onboarding/profile', {
        displayName,
        birthMonth: Number(birthMonth),
        birthYear: Number(birthYear),
        termsAccepted: true,
        privacyAccepted: true,
        marketingOptIn: false,
        locale: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      });

      // Advance to step 2
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalizationSubmit = async () => {
    if (selectedGoals.length === 0 || selectedTopics.length === 0) {
      setError('Please select at least one goal and one interest topic.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Save personalization details
      await apiClient.post('/onboarding/personalization', {
        goals: selectedGoals,
        interestTopics: selectedTopics,
        periodStatus: 'unsure',
        periodComfortScore: 3,
      });

      // 2. Complete onboarding
      await apiClient.post('/onboarding/complete');

      // 3. Fetch latest full user details from the backend
      const fullUser = await AuthService.getMe();

      toast.success('Onboarding completed successfully!');

      // 4. Update auth store with final values
      setAuth(token || '', refreshToken || '', {
        ...user,
        email: fullUser.email,
        profile: fullUser.profile,
        onboardingStep: fullUser.onboardingStep || 5,
        isOnboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString(),
        ageAtSignup: fullUser.ageAtSignup,
        contentTier: fullUser.contentTier,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to save preferences.');
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId) ? prev.filter(g => g !== goalId) : [...prev, goalId]
    );
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 3; y >= 1950; y--) {
    yearOptions.push(y);
  }

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100/80 overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Decorative background gradients */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        {/* Header with Steps */}
        <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-2">
              <Sparkles size={10} /> Initial Setup
            </span>
            <h2 className="text-xl font-black text-slate-800">
              {step === 1 && 'Welcome to Infano!'}
              {step === 2 && 'Personalize Your Focus'}
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Help us customize your workspace to suit your goals.
            </p>
          </div>

          {/* Stepper indicators */}
          <div className="flex items-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    s === step
                      ? 'bg-primary text-white scale-105 shadow-md shadow-primary/20'
                      : s < step
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {s < step ? <Check size={14} /> : s}
                </div>
                {s < 2 && (
                  <div
                    className={`w-6 h-0.5 transition-colors duration-300 ${
                      s < step ? 'bg-emerald-500' : 'bg-slate-100'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mx-6 sm:mx-8 mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-xl text-center shrink-0">
            {error}
          </div>
        )}

        {/* Content Scroll Area */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 relative z-10">
          {/* STEP 1: Profile Details */}
          {step === 1 && (
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 pl-0.5">
                  <User size={14} className="text-slate-400" /> What should we call you?
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none text-slate-800 text-sm font-semibold transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 pl-0.5">
                  <Mail size={14} className="text-slate-400" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none text-slate-800 text-sm font-semibold transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 pl-0.5">
                  Date of Birth
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <select
                      value={birthDay}
                      onChange={(e) => setBirthDay(Number(e.target.value))}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-350 text-slate-700 text-sm font-semibold"
                    >
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <select
                      value={birthMonth}
                      onChange={(e) => setBirthMonth(Number(e.target.value))}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-350 text-slate-700 text-sm font-semibold"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2020, i).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <select
                      value={birthYear}
                      onChange={(e) => setBirthYear(Number(e.target.value))}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-350 text-slate-700 text-sm font-semibold"
                    >
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Terms and Privacy removed as requested */}

              <div className="pt-4 border-t border-slate-100 flex justify-between shrink-0">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-6 py-3 text-slate-500 hover:text-slate-700 font-bold transition-all active:scale-95 duration-200 cursor-pointer"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={loading || !displayName.trim() || !email.trim()}
                  className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-primary/10 transition-all active:scale-95 disabled:opacity-50 duration-200 cursor-pointer"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      Next Preferences <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Preferences */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Goals */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-700 flex items-center gap-1.5">
                  {isTeen ? <Heart className="fill-purple-100 text-purple-655" size={16} /> : <Star className="fill-rose-100 text-rose-505" size={16} />}
                  Choose Your Main Goals (Select 1 or more)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentGoals.map((goal) => {
                    const selected = selectedGoals.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => toggleGoal(goal.id)}
                        className={`p-4 border rounded-xl text-left transition-all duration-200 flex flex-col gap-1 cursor-pointer group ${
                          selected
                            ? 'bg-primary/5 border-primary shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <span className={`text-xs font-bold ${selected ? 'text-primary' : 'text-slate-700 group-hover:text-slate-800'}`}>
                          {goal.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium leading-relaxed">
                          {goal.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topics */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-black text-slate-700 flex items-center gap-1.5">
                  <BookOpen size={16} className="text-slate-400" />
                  What topics are you interested in?
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentTopics.map((topic) => {
                    const selected = selectedTopics.includes(topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleTopic(topic)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                          selected
                            ? 'bg-primary border-primary text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350 hover:text-slate-700'
                        }`}
                      >
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 border border-slate-200 hover:bg-slate-55 text-slate-650 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-6 py-3 text-slate-500 hover:text-slate-700 font-bold transition-all active:scale-95 duration-200 cursor-pointer"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handlePersonalizationSubmit}
                  disabled={loading || selectedGoals.length === 0 || selectedTopics.length === 0}
                  className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-primary/10 transition-all active:scale-95 disabled:opacity-50 duration-200 cursor-pointer animate-pulse"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      Complete Setup <Check size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

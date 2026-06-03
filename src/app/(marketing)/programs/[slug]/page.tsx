'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Calendar,
  Shield,
  Sparkles,
  Check,
  Loader2,
  CheckCircle2,
  Users,
  User,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { ProgramsService, Program, ProgramSession } from '@/services/programs.service';
import { AuthService } from '@/services/auth.service';

// Standard themes map matching parent program display
const THEMES_MAP: Record<string, {
  accent: string;
  gradient: string;
  bgGlow: string;
  border: string;
  badge: string;
  bullet: string;
  btn: string;
}> = {
  'SPARK': {
    accent: 'text-rose-600',
    gradient: 'from-rose-500 to-pink-600',
    bgGlow: 'bg-rose-100/40',
    border: 'border-rose-100',
    badge: 'bg-rose-50 border-rose-100 text-rose-700',
    bullet: 'bg-rose-100 text-rose-600',
    btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 hover:shadow-rose-600/35',
  },
  'RISE': {
    accent: 'text-violet-600',
    gradient: 'from-violet-500 to-indigo-600',
    bgGlow: 'bg-violet-100/40',
    border: 'border-violet-100',
    badge: 'bg-violet-50 border-violet-100 text-violet-700',
    bullet: 'bg-violet-100 text-violet-600',
    btn: 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/20 hover:shadow-violet-600/35',
  },
  'BLOOM': {
    accent: 'text-emerald-600',
    gradient: 'from-emerald-500 to-teal-600',
    bgGlow: 'bg-emerald-100/40',
    border: 'border-emerald-100',
    badge: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    bullet: 'bg-emerald-100 text-emerald-600',
    btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:shadow-emerald-600/35',
  },
  'IGNITE': {
    accent: 'text-fuchsia-600',
    gradient: 'from-fuchsia-500 to-pink-600',
    bgGlow: 'bg-fuchsia-100/40',
    border: 'border-fuchsia-100',
    badge: 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-700',
    bullet: 'bg-fuchsia-100 text-fuchsia-600',
    btn: 'bg-primary hover:bg-fuchsia-700 shadow-primary/20 hover:shadow-primary/35',
  },
  'UNSTOPPABLE': {
    accent: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-600',
    bgGlow: 'bg-amber-100/40',
    border: 'border-amber-100',
    badge: 'bg-amber-50 border-amber-100 text-amber-700',
    bullet: 'bg-amber-100 text-amber-600',
    btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20 hover:shadow-amber-600/35',
  },
};

const DEFAULT_THEME = {
  accent: 'text-slate-800',
  gradient: 'from-slate-700 to-slate-900',
  bgGlow: 'bg-slate-100',
  border: 'border-slate-200',
  badge: 'bg-slate-50 border-slate-200 text-slate-700',
  bullet: 'bg-slate-100 text-slate-700',
  btn: 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20',
};

// STATIC_PROGRAMS removed to ensure all program curriculum data is backend driven.

const INTERESTS_OPTIONS = [
  "Body Unfiltered & Biology",
  "Periods & Hormonal Health",
  "Consent & Digital Safety",
  "Academic Anxiety & Moods",
  "Leadership & Public Poise",
  "Financial Basics & Growth"
];

const CHALLENGES_OPTIONS = [
  "Friendship shifts / Peer issues",
  "Doomscrolling / Device balance",
  "Social shyness / High stress",
  "Body image / Low confidence"
];

export default function ProgramDetailsPage() {
  const { slug } = useParams() as { slug: string };
  const id = slug;
  const router = useRouter();

  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [classRange, setClassRange] = useState('');
  const [confidence, setConfidence] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [hasMentor, setHasMentor] = useState('');
  const [challenges, setChallenges] = useState<string[]>([]);
  const [learningPref, setLearningPref] = useState('');
  const [parentInvolvement, setParentInvolvement] = useState('');
  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('');
  const [showSlotSelection, setShowSlotSelection] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Role selection step
  const [selectedRole, setSelectedRole] = useState<'PARENT' | 'TEEN'>('PARENT');

  const [userExists, setUserExists] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);

  useEffect(() => {
    const checkUserExists = async () => {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length >= 10) {
        try {
          setIsCheckingUser(true);
          const formattedPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12
            ? '+' + cleanPhone
            : (cleanPhone.length === 10 ? '+91' + cleanPhone : '+' + cleanPhone);
          const res = await AuthService.checkUser(formattedPhone);
          setUserExists(res.exists);
        } catch (e) {
          setUserExists(false);
        } finally {
          setIsCheckingUser(false);
        }
      } else {
        setUserExists(false);
      }
    };

    const timer = setTimeout(checkUserExists, 500);
    return () => clearTimeout(timer);
  }, [phone]);

  useEffect(() => {
    async function fetchProgramDetail() {
      try {
        setLoading(true);
        setErrorMsg(null);

        // Attempt backend fetch
        const data = await ProgramsService.getProgram(id);
        if (data) {
          setProgram(data);
          setClassRange(data.classRange);
        } else {
          throw new Error('Not found');
        }
      } catch (err: any) {
        console.error('Program details API fetch failed:', err);
        setErrorMsg(err.response?.data?.message || 'We couldn\'t find the program you were looking for. It may have been relocated or updated.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProgramDetail();
    }
  }, [id]);

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleChallenge = (challenge: string) => {
    setChallenges(prev =>
      prev.includes(challenge) ? prev.filter(c => c !== challenge) : [...prev, challenge]
    );
  };

  const handleBookDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!parentName.trim() || !phone.trim() || !classRange) {
      setFormError('Please fill out all required fields (Name, Phone, and Target Class).');
      return;
    }

    try {
      setSubmitting(true);
      const bookingData = {
        parentName,
        phone,
        email: email || null,
        classRange,
        confidence,
        interests,
        hasMentor,
        challenges,
        learningPref,
        parentInvolvement,
        suggestedPrograms: program ? [program.title] : [],
        slotDate: slotDate || null,
        slotTime: slotTime || null
      };

      const result = await ProgramsService.bookDemoSession(bookingData);
      if (result.success) {
        setSubmitted(true);
        // Reset states
        setFormError(null);
      } else {
        throw new Error('Booking failed');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred while saving your booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookDemoClick = (e: React.MouseEvent) => {
    if (!showSlotSelection) {
      e.preventDefault();
      if (!parentName.trim() || !phone.trim()) {
        setFormError('Please fill out Name and Phone Number first.');
        return;
      }
      setFormError(null);
      setShowSlotSelection(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFE] flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-semibold text-sm animate-pulse">Loading curriculum blueprint...</p>
      </div>
    );
  }

  if (errorMsg || !program) {
    return (
      <div className="min-h-screen bg-[#FAFBFE] flex flex-col items-center justify-center py-20 px-6">
        <div className="p-8 max-w-md bg-white border border-slate-100 rounded-3xl shadow-xl text-center">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Program Not Found</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">{errorMsg}</p>
          <Link
            href="/parents"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-fuchsia-700 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Parents
          </Link>
        </div>
      </div>
    );
  }

  const theme = THEMES_MAP[program.title.toUpperCase()] || DEFAULT_THEME;
  const sessionsList = program.sessionsList || [];

  return (
    <div className="min-h-screen bg-[#FAFBFE] text-slate-900 relative">

      {/* Decorative Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[10%] left-[-10%] w-[55%] h-[55%] bg-violet-200/25 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] bg-rose-200/25 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 py-12 relative z-10">

        {/* Navigation / Breadcrumb */}
        <div className="mb-10 flex items-center justify-between">
          <Link
            href="/parents"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-widest group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1 duration-300" />
            <span>Back to Programs</span>
          </Link>

          <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold border uppercase tracking-widest ${theme.badge}`}>
            {program.classRange}
          </span>
        </div>

        {/* Dynamic Split Screen Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* LEFT COLUMN: Program Details & Session Breakdown */}
          <div className="lg:col-span-7 flex flex-col">

            {/* Title & Tagline Header */}
            <div className="mb-10">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.badge} mb-4`}>
                <Sparkles size={10} />
                <span>Infano Master Cohort</span>
              </span>
              <h1 className={`text-5xl md:text-6xl font-black font-heading tracking-tight leading-[1.1] ${theme.accent} mb-5`}>
                {program.title}
              </h1>
              <p className="text-xl md:text-2xl font-semibold text-slate-800 italic leading-relaxed pl-4 border-l-4 border-slate-200">
                "{program.tagline}"
              </p>
            </div>

            {/* Description Card */}
            <div className="p-8 rounded-[2rem] bg-white border border-slate-100/80 shadow-md mb-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Program Overview</h3>
              <p className="text-slate-600 text-base leading-relaxed font-medium">
                {program.description || 'A structured cohort curriculum designed to guide and uplift young girls during critical development years.'}
              </p>

              {/* Core quick details list */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${theme.bullet}`}>
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Structure</h5>
                    <p className="text-slate-800 font-bold text-sm">{program.sessions} Sessions</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${theme.bullet}`}>
                    <Clock size={18} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</h5>
                    <p className="text-slate-800 font-bold text-sm">{program.duration}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${theme.bullet}`}>
                    <Shield size={18} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pillars</h5>
                    <p className="text-slate-800 font-bold text-sm">Clinical & Peer Led</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Curriculum Roadmap / Timeline */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-8">
                <h3 className="text-2xl font-bold font-heading text-slate-800 tracking-tight">
                  Curriculum Roadmap
                </h3>
                <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-slate-500 font-bold text-xs">
                  Session-by-Session
                </span>
              </div>

              {sessionsList.length > 0 ? (
                <div className="relative pl-6 border-l border-slate-200/80 space-y-6">
                  {sessionsList.map((session, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
                      className="p-6 md:p-7 bg-white hover:bg-white/80 border border-slate-100/90 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all duration-300 relative group"
                    >
                      {/* Floating glowing timeline bullet */}
                      <span className={`absolute -left-[39px] top-7 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white text-white bg-gradient-to-r ${theme.gradient} shadow-lg transition-transform group-hover:scale-110 duration-300`}>
                        {idx + 1}
                      </span>

                      <h4 className="text-base font-bold text-slate-800 mb-2 leading-snug group-hover:text-slate-900 transition-colors">
                        {session.title}
                      </h4>
                      <p className="text-slate-500 text-xs font-medium leading-relaxed">
                        {session.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-slate-400 font-semibold text-sm">Session schedule currently finalizing.</p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Demo Booking Form */}
          <div className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-24 self-start">

              <AnimatePresence mode="wait">
                {!submitted ? (
                  /* THE BOOKING FORM */
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="p-8 md:p-9 rounded-[2rem] bg-white border border-slate-100/80 shadow-2xl relative overflow-hidden backdrop-blur-xl"
                  >
                    {/* Tiny decorative gradient light bar */}
                    <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${theme.gradient}`} />

                    <div className="mb-6 relative z-10">

                      <h3 className="text-2xl font-bold font-heading text-slate-800 tracking-tight leading-tight">
                        Enroll for this program
                      </h3>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">
                        Its a safe space for young girls, surrounded by experts and peer mentors
                      </p>
                    </div>

                    {formError && (
                      <div className="mb-5 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-700 text-xs leading-relaxed font-semibold">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <form onSubmit={handleBookDemo} className="space-y-5">

                      {/* Role Selection Segment Control */}
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                          Enrolling As? <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <button
                            type="button"
                            onClick={() => setSelectedRole('PARENT')}
                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all shadow-sm ${selectedRole === 'PARENT'
                              ? 'border-primary bg-primary/5 text-primary font-black'
                              : 'border-slate-200 bg-[#FAFBFE] text-slate-500 hover:border-slate-350 hover:bg-slate-50'
                              }`}
                          >
                            <span>💜</span>
                            <span>I am a Parent</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRole('TEEN')}
                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all shadow-sm ${selectedRole === 'TEEN'
                              ? 'border-amber-400 bg-amber-50 text-amber-750 font-black'
                              : 'border-slate-200 bg-[#FAFBFE] text-slate-500 hover:border-slate-350 hover:bg-slate-50'
                              }`}
                          >
                            <span>✨</span>
                            <span>I am a Teen</span>
                          </button>
                        </div>
                      </div>

                      {/* Name input */}
                      <div>

                        <input
                          type="text"
                          required
                          value={parentName}
                          onChange={(e) => setParentName(e.target.value)}
                          placeholder="Your name"
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 text-sm font-semibold transition-colors bg-[#FAFBFE]"
                        />
                      </div>

                      {/* Flex grid for phone & email */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>

                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Phone Number"
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 text-sm font-semibold transition-colors bg-[#FAFBFE]"
                          />
                        </div>
                        <div>

                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email Address"
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 text-sm font-semibold transition-colors bg-[#FAFBFE]"
                          />
                        </div>
                      </div>

                      {/* Slot Booking Date and Time */}
                      {showSlotSelection && (
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                            Select Consultation Slot (Optional)
                          </span>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <input
                                type="date"
                                value={slotDate}
                                onChange={(e) => setSlotDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-slate-800 text-xs font-semibold bg-white"
                              />
                            </div>
                            <div>
                              <select
                                value={slotTime}
                                onChange={(e) => setSlotTime(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-slate-800 text-xs font-semibold bg-white"
                              >
                                <option value="">Select Time</option>
                                <option value="10:00 AM">10:00 AM</option>
                                <option value="11:30 AM">11:30 AM</option>
                                <option value="02:00 PM">02:00 PM</option>
                                <option value="03:30 PM">03:30 PM</option>
                                <option value="05:00 PM">05:00 PM</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions Column */}
                      <div className="flex flex-col gap-3 pt-2">
                        {/* Direct Enroll Link */}
                        {userExists ? (
                          <Link
                            href="/login"
                            className={`w-full inline-flex items-center justify-center gap-2 py-4 px-4 rounded-2xl text-white font-bold text-xs uppercase tracking-widest transition-all ${theme.btn} shadow-md text-center`}
                          >
                            <span>You are already a user, pls login</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/checkout?bookId=${program ? program.title.toLowerCase() : 'spark'}-${learningPref.includes('Private') || learningPref.includes('1:1') ? 'private' : 'group'}&name=${encodeURIComponent(parentName)}&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}&class=${encodeURIComponent(classRange)}&format=${encodeURIComponent(learningPref)}&date=${encodeURIComponent(slotDate)}&time=${encodeURIComponent(slotTime)}`}
                            onClick={(e) => {
                              if (!parentName || !phone) {
                                e.preventDefault();
                                setFormError("Please enter your name and phone number in the form above to enroll.");
                                const nameInput = document.querySelector('input[placeholder="Your name"]');
                                if (nameInput) (nameInput as HTMLInputElement).focus();
                              }
                            }}
                            className={`w-full inline-flex items-center justify-center gap-2 py-4 px-4 rounded-2xl text-white font-bold text-xs uppercase tracking-widest transition-all ${theme.btn} shadow-md text-center`}
                          >
                            <span>Enroll Now</span>
                          </Link>
                        )}

                        {/* Book Demo Button */}
                        <button
                          type={showSlotSelection ? "submit" : "button"}
                          onClick={handleBookDemoClick}
                          disabled={submitting}
                          className={`w-full inline-flex items-center justify-center gap-2 py-4 px-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all text-center disabled:opacity-50 ${(slotDate && slotTime)
                              ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200/80'
                            }`}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <span>Book Free Demo</span>
                          )}
                        </button>
                      </div>

                    </form>
                  </motion.div>
                ) : (
                  /* THE SUCCESS SCREEN */
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="p-8 md:p-10 rounded-[2rem] bg-white border border-slate-100/80 shadow-2xl text-center relative overflow-hidden backdrop-blur-xl"
                  >
                    {/* Tiny decorative success bar */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />

                    <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-md">
                      <CheckCircle2 size={44} strokeWidth={1.5} />
                    </div>

                    <h3 className="text-2xl font-bold font-heading text-slate-800 mb-3 tracking-tight">
                      Demo Session Confirmed!
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                      Thank you, <strong className="text-slate-800">{parentName}</strong>. Your inquiry for <strong className="text-slate-800">{program.title}</strong> has been successfully received. A certified coordinator will call you at <strong className="text-slate-800">{phone}</strong> within 24 hours to align your booking details.
                    </p>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 text-xs font-semibold space-y-2.5 text-left mb-6 shadow-inner">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Selected Program:</span>
                        <span>{program.title} ({program.classRange})</span>
                      </div>
                      {slotDate && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Preferred Slot:</span>
                          <span>{slotDate} at {slotTime || "10:00 AM"}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Learning Setting:</span>
                        <span>{learningPref || "Not Specified"}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setShowSlotSelection(false);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md"
                    >
                      Book Another Slot
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

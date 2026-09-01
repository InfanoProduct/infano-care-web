'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
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
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { ProgramsService, Program, ProgramSession } from '@/services/programs.service';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth-store';
import { DateTimePickerModal } from '@/components/common/DateTimePickerModal';

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

const getTomorrowString = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

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

const COUNTRIES = [
  { code: '+91', iso: 'in', name: 'India', digits: 10 },
  { code: '+1', iso: 'us', name: 'United States', digits: 10 },
  { code: '+44', iso: 'gb', name: 'United Kingdom', digits: 10 },
  { code: '+65', iso: 'sg', name: 'Singapore', digits: 8 },
  { code: '+971', iso: 'ae', name: 'United Arab Emirates', digits: 9 },
  { code: '+61', iso: 'au', name: 'Australia', digits: 9 }
];

export default function ProgramDetailsPage() {
  const { slug } = useParams() as { slug: string };
  const id = slug;
  const router = useRouter();
  const { user } = useAuthStore();

  const [program, setProgram] = useState<Program | null>(null);
  const [programIndex, setProgramIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+91');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ code: '+91', iso: 'in', name: 'India', digits: 10 });
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
  const [showSlotSelection, setShowSlotSelection] = useState(true);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);


  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);


  const [userExists, setUserExists] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);

  const getFullNormalizedPhone = () => {
    const cleanPhone = phone.replace(/\D/g, '');
    const normalizedMobile = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
    return `${selectedCountryCode}${normalizedMobile}`;
  };

  useEffect(() => {
    const checkUserExists = async () => {
      const cleanPhone = phone.replace(/\D/g, '');
      const normalizedMobile = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
      
      if (normalizedMobile.length >= 10) {
        try {
          setIsCheckingUser(true);
          const formattedPhone = `${selectedCountryCode}${normalizedMobile}`;
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
  }, [phone, selectedCountryCode]);

  // Prefill logged-in user profile details
  useEffect(() => {
    if (user) {
      setParentName(user.profile?.displayName || user.username || '');
      setEmail(user.email || '');
      
      let userPhone = user.phone || '';
      for (const country of COUNTRIES) {
        if (userPhone.startsWith(country.code)) {
          setSelectedCountry(country);
          setSelectedCountryCode(country.code);
          userPhone = userPhone.substring(country.code.length);
          break;
        }
      }
      setPhone(userPhone);
    }
  }, [user]);

  useEffect(() => {
    async function fetchProgramDetail() {
      try {
        setLoading(true);
        setErrorMsg(null);

        // Attempt backend fetch
        const [data, allPrograms] = await Promise.all([
          ProgramsService.getProgram(id),
          ProgramsService.getPrograms()
        ]);
        
        if (data) {
          setProgram(data);
          const targetSlug = decodeURIComponent(id).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const pIndex = allPrograms.findIndex(p => p.id === id || (p.slug && p.slug === targetSlug) || p.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === targetSlug);
          setProgramIndex(Math.max(0, pIndex));
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

  const validateForm = (): boolean => {
    setFormError(null);
    if (!parentName.trim()) {
      setFormError("Please enter your name.");
      return false;
    }
    if (parentName.trim().length < 2) {
      setFormError("Name must be at least 2 characters long.");
      return false;
    }
    if (!phone.trim()) {
      setFormError("Please enter your phone number.");
      return false;
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    const normalizedMobile = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
    
    if (selectedCountryCode === '+91') {
      if (normalizedMobile.length !== 10) {
        setFormError("Please enter a valid 10-digit mobile number.");
        return false;
      }
    } else {
      if (normalizedMobile.length < 7 || normalizedMobile.length > 15) {
        setFormError("Please enter a valid phone number (7 to 15 digits).");
        return false;
      }
    }
    
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setFormError("Please enter a valid email address.");
        return false;
      }
    }

    if (showSlotSelection) {
      if (!slotDate) {
        setFormError("Please select a date for your consultation slot.");
        return false;
      }
      const parts = slotDate.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts.map(Number);
        const selected = new Date(y, m - 1, d);
        selected.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const maxD = new Date(today);
        maxD.setDate(today.getDate() + 7);
        maxD.setHours(23, 59, 59, 999);

        if (selected < today) {
          setFormError("Cannot select a past date for demo booking.");
          return false;
        }
        if (selected > maxD) {
          setFormError("Demo sessions can only be booked up to 7 days in advance.");
          return false;
        }
      }
      if (!slotTime) {
        setFormError("Please select a time for your consultation slot.");
        return false;
      }
    }

    return true;
  };

  const handleBookDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setFormError(null);
      const bookingData = {
        parentName,
        phone: getFullNormalizedPhone(),
        email: email || null,
        classRange: classRange || "General",
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
        const razorpayInfo = result.razorpay;
        const normalizedPhone = getFullNormalizedPhone();

        // If Razorpay order is available and script loaded
        if (typeof (window as any).Razorpay !== 'undefined' && razorpayInfo?.orderId && !razorpayInfo.orderId.startsWith('demo_mock_')) {
          const options = {
            key: razorpayInfo.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: (razorpayInfo.amount || 9) * 100,
            currency: razorpayInfo.currency || 'INR',
            name: 'Infano Care',
            description: `Demo Session Booking: ${program?.title || 'Program'}`,
            order_id: razorpayInfo.orderId,
            handler: async function (response: any) {
              try {
                setSubmitting(true);
                await ProgramsService.verifyDemoPayment({
                  razorpayOrderId: response.razorpay_order_id || razorpayInfo.orderId,
                  razorpayPaymentId: response.razorpay_payment_id || '',
                  razorpaySignature: response.razorpay_signature || ''
                });
                router.push(`/programs/booking-success?name=${encodeURIComponent(parentName)}&program=${encodeURIComponent(program?.title || '')}&date=${encodeURIComponent(slotDate)}&time=${encodeURIComponent(slotTime)}&amount=9&paymentId=${encodeURIComponent(response.razorpay_payment_id || '')}`);
              } catch (err: any) {
                setFormError(err.message || 'Payment verification failed. If money was deducted, please contact support.');
                setSubmitting(false);
              }
            },
            prefill: {
              name: parentName,
              email: email || undefined,
              contact: normalizedPhone
            },
            modal: {
              ondismiss: () => {
                setSubmitting(false);
                setFormError('Payment was cancelled. You can complete booking whenever ready.');
              }
            }
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', function (resp: any) {
            setFormError(resp.error?.description || 'Payment failed. Please try again.');
            setSubmitting(false);
          });
          rzp.open();
        } else {
          // Fallback / mock mode payment completion
          if (razorpayInfo?.orderId) {
            await ProgramsService.verifyDemoPayment({
              razorpayOrderId: razorpayInfo.orderId,
              razorpayPaymentId: 'pay_mock_' + Date.now(),
              razorpaySignature: 'mock_signature'
            });
          }
          router.push(`/programs/booking-success?name=${encodeURIComponent(parentName)}&program=${encodeURIComponent(program?.title || '')}&date=${encodeURIComponent(slotDate)}&time=${encodeURIComponent(slotTime)}&amount=9&paymentId=pay_mock_${Date.now()}`);
        }
      } else {
        throw new Error('Booking initialization failed');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred while saving your booking. Please try again.');
      setSubmitting(false);
    }
  };

  const handleBookDemoClick = (e: React.MouseEvent) => {
    if (!showSlotSelection) {
      e.preventDefault();
      if (!validateForm()) return;
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

  const themeKeys = Object.keys(THEMES_MAP);
  const theme = THEMES_MAP[themeKeys[programIndex % themeKeys.length]] || DEFAULT_THEME;
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
        <div className="mb-10 flex items-center">
          <Link
            href="/parents"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-widest group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1 duration-300" />
            <span>Back to Programs</span>
          </Link>
        </div>

        {/* Dynamic Split Screen Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-y-16 lg:gap-x-12 lg:gap-x-16 items-start">

          {/* LEFT COLUMN: Program Details & Session Breakdown */}
          <div className="lg:col-span-7 lg:col-start-1 lg:row-start-1 order-1 flex flex-col">

            {/* Title & Tagline Header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.badge}`}>
                  <Sparkles size={10} />
                  <span>Infano Master Cohort</span>
                </span>
              </div>

              {program.thumbnailUrl && (
                <div className="w-full h-64 md:h-80 rounded-[2rem] overflow-hidden mb-8 shadow-xl border border-slate-200/50">
                  <img src={program.thumbnailUrl} alt={program.title} className="w-full h-full object-cover object-top" />
                </div>
              )}

              <h1 className={`text-4xl md:text-5xl font-black font-heading tracking-tight leading-[1.1] ${theme.accent} mb-5`}>
                {program.title}
              </h1>
              <p className="text-xl md:text-2xl font-semibold text-slate-800 italic leading-relaxed pl-4 border-l-4 border-slate-200">
                "{program.tagline}"
              </p>
            </div>

            {/* Description Card */}
            <div className="p-8 rounded-[2rem] bg-white border border-slate-100/80 shadow-md mb-0 lg:mb-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Program Overview</h3>
              <div className="relative">
                <p className={`text-slate-600 text-base leading-relaxed font-medium transition-all duration-300 ${!isOverviewExpanded ? 'line-clamp-4' : ''}`}>
                  {program.description || 'A structured cohort curriculum designed to guide and uplift young girls during critical development years.'}
                </p>
                <button 
                  onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                  className={`text-[11px] font-bold uppercase tracking-widest mt-4 ${theme.accent} hover:opacity-80 transition-opacity flex items-center gap-1`}
                >
                  {isOverviewExpanded ? '- Show Less' : '+ Show More'}
                </button>
              </div>

              {/* Core quick details list */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${theme.bullet}`}>
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Structure</h5>
                    <p className="text-slate-800 font-bold text-sm">{program.curriculum?.length || 8} Sessions</p>
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

                {Array.isArray(program.consultations) && program.consultations.length > 0 && (
                  <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${theme.bullet}`}>
                      <Shield size={18} />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consultations</h5>
                      <p className="text-slate-800 font-bold text-sm">
                        {program.consultations.length} Free Consultation{program.consultations.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Curriculum Roadmap / Timeline */}
          <div className="lg:col-span-7 lg:col-start-1 lg:row-start-2 order-3 lg:order-2 flex flex-col">
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
                <div className="relative space-y-6">
                  {sessionsList.map((session, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
                      className={`p-6 md:p-7 bg-white hover:bg-slate-50 border border-slate-100/90 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all duration-300 relative group flex items-center justify-between gap-5 overflow-hidden`}
                    >

                      {session.thumbnailUrl && (
                        <div className="w-28 h-28 shrink-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm hidden sm:block">
                          <img src={session.thumbnailUrl} alt={session.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h4 className="text-base font-bold text-slate-800 mb-2 leading-snug group-hover:text-slate-900 transition-colors relative z-10">
                          {session.title}
                        </h4>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed relative z-10">
                          {session.description}
                        </p>
                      </div>
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
          <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2 order-2 lg:order-3 relative">
            <div className="lg:sticky lg:top-24 self-start">

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


                      {/* Name input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-0.5">
                          Your Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={parentName}
                          onChange={(e) => setParentName(e.target.value)}
                          placeholder="Your name"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 text-sm font-normal transition-colors bg-[#FAFBFE] shadow-sm"
                        />
                      </div>

                      {/* Phone Input with Country Code Dropdown */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-0.5">
                          Phone Number <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex bg-[#FAFBFE] border border-slate-200 rounded-xl focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-primary/5 transition-colors overflow-visible relative shadow-sm">
                          {/* Dropdown Container */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setDropdownOpen(!dropdownOpen)}
                              className="flex items-center gap-1.5 pl-3.5 pr-2.5 py-3 border-r border-slate-200 bg-transparent hover:bg-slate-50 transition-colors cursor-pointer select-none h-full"
                            >
                              <img 
                                src={`https://flagcdn.com/w40/${selectedCountry.iso}.png`} 
                                className="w-5 h-3.5 object-cover rounded-sm shrink-0 border border-slate-200/50" 
                                alt={selectedCountry.name} 
                              />
                              <span className="text-sm font-bold text-slate-700">{selectedCountry.code}</span>
                              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {dropdownOpen && (
                              <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                {COUNTRIES.map((country) => (
                                  <button
                                    key={country.iso}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCountry(country);
                                      setSelectedCountryCode(country.code);
                                      setPhone('');
                                      setDropdownOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold hover:bg-slate-50 transition-colors text-slate-700"
                                  >
                                    <img 
                                      src={`https://flagcdn.com/w40/${country.iso}.png`} 
                                      className="w-5.5 h-4 object-cover rounded-sm border border-slate-200/50 shrink-0" 
                                      alt={country.name} 
                                    />
                                    <span className="flex-1">{country.name}</span>
                                    <span className="text-slate-400 font-bold text-xs">{country.code}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder={`Enter ${selectedCountry.digits}-digit number`}
                            maxLength={selectedCountry.digits}
                            className="w-full px-4 py-3 outline-none text-slate-800 text-sm font-normal bg-transparent"
                          />
                        </div>
                      </div>

                      {/* Email input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-0.5">
                          Email Address (Optional)
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email Address"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 text-sm font-normal transition-colors bg-[#FAFBFE] shadow-sm"
                        />
                      </div>

                      {/* Slot Booking Date and Time */}
                      {showSlotSelection && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Select Consultation Slot *
                          </span>
                          {slotDate && slotTime ? (
                            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                  <Calendar size={18} />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-primary/80 uppercase tracking-wider">Selected Slot</p>
                                  <p className="text-slate-800 font-extrabold text-sm mt-0.5">
                                    {new Date(slotDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {slotTime}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsDatePickerOpen(true)}
                                className="text-xs font-bold text-primary hover:text-primary/95 bg-white hover:bg-primary/5 border border-primary/20 px-3.5 py-2 rounded-xl transition-all shadow-sm"
                              >
                                Change
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setIsDatePickerOpen(true)}
                              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border border-dashed border-primary/30 hover:border-primary/55 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-sm transition-all"
                            >
                              <Calendar size={16} />
                              <span>Select Date & Time Slot</span>
                            </button>
                          )}

                          <DateTimePickerModal
                            isOpen={isDatePickerOpen}
                            onClose={() => setIsDatePickerOpen(false)}
                            onSelect={(date, time) => {
                              setSlotDate(date);
                              setSlotTime(time);
                            }}
                            initialDate={slotDate}
                            initialTime={slotTime}
                          />
                        </div>
                      )}

                      {/* Actions Column */}
                      <div className="flex flex-col gap-3 pt-2">
                        {/* Book Demo Button */}
                        <button
                          type="submit"
                          disabled={submitting || phone.length !== selectedCountry.digits}
                          className={`w-full inline-flex items-center justify-center gap-2 py-4 px-4 rounded-2xl text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md text-center disabled:opacity-50 ${theme.btn}`}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Processing (₹9)...</span>
                            </>
                          ) : (
                            <span>Pay ₹9 & Book Demo Session</span>
                          )}
                        </button>
                      </div>


                    </form>
                  </motion.div>

            </div>
          </div>

        </div>

      </div>

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  );
}

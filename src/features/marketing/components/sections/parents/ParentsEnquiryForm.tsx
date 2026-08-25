'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { 
  ChevronRight, ChevronLeft, CheckCircle2, Loader2, Sparkles, 
  BookOpen, Users, Calendar, ShieldCheck, Heart, Award, GraduationCap,
  MessageCircle, Target, HelpCircle, ArrowRight, Clock
} from 'lucide-react';
import { ProgramsService, Program } from '@/services/programs.service';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-hot-toast';
import { useRegion } from '@/hooks/use-region';

// PROGRAMS_METADATA removed to ensure all program curriculum data is backend driven.
const GRADIENTS_MAP: Record<string, string> = {
  'SPARK': 'from-orange-500 to-rose-500 shadow-orange-500/10',
  'RISE': 'from-purple-500 to-indigo-500 shadow-purple-500/10',
  'BLOOM': 'from-emerald-500 to-teal-500 shadow-emerald-500/10',
  'IGNITE': 'from-violet-600 to-fuchsia-600 shadow-violet-600/10',
  'UNSTOPPABLE': 'from-amber-500 to-yellow-600 shadow-amber-500/10',
};

// Definition of 7 empathetic questions
const QUESTIONS = [
  {
    id: 'classRange',
    title: "Which class is she in?",
    subtitle: "This helps us route her to the perfect, age-appropriate developmental curriculum.",
    type: 'select',
    options: [
      { value: '5', label: 'Class 5', desc: 'Ages 10-11 (Early pre-teen transition)' },
      { value: '6', label: 'Class 6', desc: 'Ages 11-12 (Middle school milestones)' },
      { value: '7', label: 'Class 7', desc: 'Ages 12-13 (Early high school adjustments)' },
      { value: '8', label: 'Class 8', desc: 'Ages 13-14 (Critical puberty & identity phases)' },
      { value: '9', label: 'Class 9', desc: 'Ages 14-15 (Preparing for senior high & beyond)' }
    ]
  },
  {
    id: 'confidence',
    title: "How would you describe her social confidence?",
    subtitle: "We tailor peer circle interactions to match her comfort zone.",
    type: 'multiselect',
    options: [
      { value: 'shy', label: 'Quiet & Observant', desc: 'Prefers small groups, takes time to open up to new circles.' },
      { value: 'selective', label: 'Thoughtful & Selective', desc: 'Warm and comfortable with close friends, but quiet in larger spaces.' },
      { value: 'balanced', label: 'Balanced & Easygoing', desc: 'Adapts well to different social circles and environments.' },
      { value: 'outgoing', label: 'Vibrant & Expressive', desc: 'Highly outgoing, loves making new friends and sharing ideas.' }
    ]
  },
  {
    id: 'interests',
    title: "What are your primary areas of interest for her development?",
    subtitle: "Select all that apply. This helps us customize her learning journey.",
    type: 'multiselect',
    options: [
      { value: 'puberty', label: 'Puberty & Body Changes', desc: 'Understanding physical growth, menstrual cycles, and safe boundaries.' },
      { value: 'emotional', label: 'Emotional Balance', desc: 'Managing big feelings, anxiety, school stress, and mood swings.' },
      { value: 'relationships', label: 'Social & Friendships', desc: 'Navigating peer circles, school friendships, and saying "no".' },
      { value: 'identity', label: 'Self-Esteem & Expression', desc: 'Building dynamic self-worth, positive body image, and voice.' },
      { value: 'digital', label: 'Digital Safety', desc: 'Formulating healthy screen time, safe texting, and social media habits.' }
    ]
  },
  {
    id: 'hasMentor',
    title: "Does she have a trusted mentor or safe adult outside the family?",
    subtitle: "A mentor provides a crucial sounding board during formative years.",
    type: 'select',
    options: [
      { value: 'yes', label: 'Yes, she has a wonderful mentor', desc: 'She regularly talks to a teacher, counselor, coach, or guide.' },
      { value: 'no_but_wanted', label: 'Not yet, but she would highly benefit from one', desc: 'We want a certified female mentor to guide her in a safe setting.' },
      { value: 'family_focused', label: 'She primarily relies on close family support', desc: 'We are very close as a family, and she talks primarily to us.' }
    ]
  },
  {
    id: 'challenges',
    title: "Has she faced any of these challenges in the past year?",
    subtitle: "Select all that apply. This lets our guides support her with extra care and empathy.",
    type: 'multiselect',
    options: [
      { value: 'peer_pressure', label: 'Peer pressure or feeling left out' },
      { value: 'body_image', label: 'Body image concerns or self-doubt' },
      { value: 'studies', label: 'Academic stress or exam anxiety' },
      { value: 'friendships', label: 'Friendship drama or navigating social groups' },
      { value: 'career_confusion', label: 'Career confusion or future worries' },
      { value: 'other', label: 'Other personal growth challenges' }
    ]
  },
  {
    id: 'learningPref',
    title: "How does she prefer to absorb and learn new things?",
    subtitle: "Select all that apply. We design our interactive workshops to respect her learning style.",
    type: 'multiselect',
    options: [
      { value: 'talking', label: 'Empathetic Discussion', desc: 'Sharing feelings and thoughts 1-on-1 in conversational circles.' },
      { value: 'doing', label: 'Hands-on Activities', desc: 'Interactive worksheets, practical goals, and self-discovery journals.' },
      { value: 'reading', label: 'Self-paced Reading/Watching', desc: 'Quiet reflection, videos, and reading structured insights.' },
      { value: 'group', label: 'Collaborative Groups', desc: 'Discussing, brainstorming, and sharing ideas with peer cohorts.' }
    ]
  },
  {
    id: 'parentInvolvement',
    title: "How involved would you like to be in her learning journey?",
    subtitle: "We believe parent alignment is key, but we respect your busy schedule.",
    type: 'select',
    options: [
      { value: 'weekly', label: 'Weekly Summary & Insights', desc: 'Send me weekly actionable reports and conversation starters.' },
      { value: 'monthly', label: 'Monthly Milestones Check-in', desc: 'Keep me aligned with a thoughtful monthly summary and call.' },
      { value: 'minimal', label: 'Supportive & Hands-off', desc: 'Just keep things running smoothly, I am happy to support behind the scenes.' }
    ]
  }
];

interface ParentsEnquiryFormProps {
  phase?: 'role-check' | 'questions' | 'recommendation' | 'success';
  onPhaseChange?: (phase: 'role-check' | 'questions' | 'recommendation' | 'success') => void;
}

export function ParentsEnquiryForm({ phase: propPhase, onPhaseChange }: ParentsEnquiryFormProps) {
  const router = useRouter();
  const [internalPhase, setInternalPhase] = useState<'role-check' | 'questions' | 'recommendation' | 'success'>('questions');
  const { formatPrice } = useRegion();
  
  const phase = propPhase !== undefined ? propPhase : internalPhase;
  const setPhase = (newPhase: 'role-check' | 'questions' | 'recommendation' | 'success') => {
    if (onPhaseChange) {
      onPhaseChange(newPhase);
    } else {
      setInternalPhase(newPhase);
    }
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [programsList, setProgramsList] = useState<Program[]>([]);

  useEffect(() => {
    const fetchProgramsList = async () => {
      try {
        const data = await ProgramsService.getPrograms();
        setProgramsList(data || []);
      } catch (err) {
        console.error("Failed to load programs list:", err);
      }
    };
    fetchProgramsList();
  }, []);
  
  // Form State
  const [answers, setAnswers] = useState({
    classRange: '',
    confidence: [] as string[],
    interests: [] as string[],
    hasMentor: '',
    challenges: [] as string[],
    learningPref: [] as string[],
    parentInvolvement: '',
  });

  // Recommendation & Contact details
  const { user } = useAuthStore();
  const [parentName, setParentName] = useState(user?.profile?.displayName || user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [selectedFormat, setSelectedFormat] = useState<'PRIVATE' | 'GROUP' | 'BOTH'>('PRIVATE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sync state if user data is fetched post-mount
  useEffect(() => {
    setParentName(prev => user?.profile?.displayName || user?.username || prev);
    setEmail(prev => user?.email || prev);
    setPhone(prev => user?.phone || prev);
  }, [user]);

  // Selected suggested program IDs state
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([]);
  const [activeProgramTab, setActiveProgramTab] = useState<string>('');

  // Slot Selection states
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0); // 0 to 3
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');

  const [userExists, setUserExists] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);

  useEffect(() => {
    const checkUserExists = async () => {
      const cleanPhone = phone.replace(/\D/g, '');
      const normalizedMobile = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
      if (normalizedMobile.length >= 10) {
        try {
          setIsCheckingUser(true);
          const formattedPhone = normalizedMobile.startsWith('91') && normalizedMobile.length === 12 
            ? '+' + normalizedMobile 
            : (normalizedMobile.length === 10 ? '+91' + normalizedMobile : '+' + normalizedMobile);
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

  // Update selected suggested program IDs when classRange changes
  useEffect(() => {
    if (answers.classRange) {
      const suggested = getSuggestedPrograms();
      setSelectedProgramIds(suggested.map((p) => p.id));
      if (suggested.length > 0) {
        setActiveProgramTab(suggested[0].id);
      }
    }
  }, [answers.classRange, programsList]);

  // Handle single-select question option selection
  const handleSelectOption = (questionId: string, optionValue: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionValue }));
    
    // Automatically advance steps for single-selects to keep it breezy
    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 200);
    } else {
      // Redirect to the recommended program details page
      setTimeout(() => {
        const suggested = getSuggestedPrograms();
        const targetProgramId = suggested[0]?.id || 'spark';
        router.push(`/programs/${targetProgramId}`);
      }, 300);
    }
  };

  // Handle multi-select toggle (e.g. for challenges)
  const handleToggleMultiOption = (questionId: string, optionValue: string) => {
    setAnswers((prev) => {
      const currentList = prev[questionId as keyof typeof prev] as string[] || [];
      const updatedList = currentList.includes(optionValue)
        ? currentList.filter((item) => item !== optionValue)
        : [...currentList, optionValue];
      return { ...prev, [questionId]: updatedList };
    });
  };

  const handleNextStep = () => {
    // Validate if current step has an answer
    const currentQuestion = QUESTIONS[currentStep];
    const currentAnswer = answers[currentQuestion.id as keyof typeof answers];
    
    if (currentQuestion.type === 'select' && !currentAnswer) {
      toast.error('Please select an option to continue');
      return;
    }
    if (currentQuestion.type === 'multiselect' && (!currentAnswer || (currentAnswer as string[]).length === 0)) {
      toast.error('Please select at least one option to continue');
      return;
    }

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const suggested = getSuggestedPrograms();
      const targetProgramId = suggested[0]?.id || 'spark';
      router.push(`/programs/${targetProgramId}`);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Find the appropriate program metadata based on class range selection
  const getSuggestedPrograms = () => {
    if (programsList.length === 0) return [];
    return [programsList[0]];
  };

  const suggestedPrograms = getSuggestedPrograms();

  // Booking submit handler
  const handleBookDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName || !phone) {
      toast.error('Parent Name and Phone Number are required');
      return;
    }
    if (!selectedDay || !selectedTime) {
      toast.error('Please select a preferred Date and Time slot');
      return;
    }
    if (selectedProgramIds.length === 0) {
      toast.error('Please select at least one program to book a demo');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Formulate suggested formats for storage
    const programFormats: string[] = [];
    suggestedPrograms.forEach((prog) => {
      if (selectedProgramIds.includes(prog.id)) {
        if (selectedFormat === 'PRIVATE' || selectedFormat === 'BOTH') programFormats.push(`${prog.title} (1:1 Private)`);
        if (selectedFormat === 'GROUP' || selectedFormat === 'BOTH') programFormats.push(`${prog.title} (Group Cohort)`);
      }
    });

    // Format date as YYYY-MM-DD
    const yyyy = selectedDay.getFullYear();
    const mm = String(selectedDay.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDay.getDate()).padStart(2, '0');
    const formattedDateStr = `${yyyy}-${mm}-${dd}`;
    const cleanPhone = phone.replace(/\D/g, '');
    const normalizedMobile = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
    const finalPhone = normalizedMobile.startsWith('91') && normalizedMobile.length === 12 
      ? '+' + normalizedMobile 
      : (normalizedMobile.length === 10 ? '+91' + normalizedMobile : '+' + normalizedMobile);

    try {
      const result = await ProgramsService.bookDemoSession({
        parentName,
        phone: finalPhone,
        email: email || null,
        classRange: `Class ${answers.classRange}`,
        confidence: answers.confidence.join(','),
        interests: answers.interests,
        hasMentor: answers.hasMentor,
        challenges: answers.challenges,
        learningPref: answers.learningPref.join(','),
        parentInvolvement: answers.parentInvolvement,
        suggestedPrograms: programFormats,
        slotDate: formattedDateStr,
        slotTime: selectedTime
      });

      const razorpayInfo = result.razorpay;

      if (typeof (window as any).Razorpay !== 'undefined' && razorpayInfo?.orderId && !razorpayInfo.orderId.startsWith('demo_mock_')) {
        const options = {
          key: razorpayInfo.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: (razorpayInfo.amount || 29) * 100,
          currency: razorpayInfo.currency || 'INR',
          name: 'Infano Care',
          description: `Demo Session Consultation (${programFormats.join(', ') || 'Learning Program'})`,
          order_id: razorpayInfo.orderId,
          handler: async function (response: any) {
            try {
              setIsSubmitting(true);
              await ProgramsService.verifyDemoPayment({
                razorpayOrderId: response.razorpay_order_id || razorpayInfo.orderId,
                razorpayPaymentId: response.razorpay_payment_id || '',
                razorpaySignature: response.razorpay_signature || ''
              });
              setPhase('success');
            } catch (err: any) {
              setError(err.message || 'Payment verification failed. Please contact support.');
              toast.error('Payment verification issue');
            } finally {
              setIsSubmitting(false);
            }
          },
          prefill: {
            name: parentName,
            email: email || undefined,
            contact: finalPhone
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false);
              toast('Payment cancelled. You can complete booking whenever ready.');
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setError(resp.error?.description || 'Payment failed. Please try again.');
          setIsSubmitting(false);
        });
        rzp.open();
      } else {
        // Fallback / mock mode
        if (razorpayInfo?.orderId) {
          await ProgramsService.verifyDemoPayment({
            razorpayOrderId: razorpayInfo.orderId,
            razorpayPaymentId: 'pay_mock_' + Date.now(),
            razorpaySignature: 'mock_signature'
          });
        }
        setPhase('success');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
      toast.error('Failed to book demo session');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* ─── PHASE 0: ROLE CHECK ─── */}
      {phase === 'role-check' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="space-y-6 text-center py-6"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight leading-tight">
            Who is enrolling today?
          </h3>
          <p className="text-sm font-medium text-slate-500 max-w-md mx-auto">
            Please select your role so we can guide you to the right experience.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 max-w-lg mx-auto">
            <button
              type="button"
              onClick={() => setPhase('questions')}
              className="p-5 rounded-2xl border-2 border-slate-100 hover:border-primary hover:bg-primary/5 transition-all group flex flex-col items-center gap-3 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-white group-hover:text-primary flex items-center justify-center text-slate-400 transition-colors shadow-sm">
                <Heart size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors">I am a Parent</h4>
                <p className="text-xs text-slate-500 mt-1">Enrolling for my daughter</p>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => {
                toast("This form is for parents. If you're a teen, please explore our programs directly!", { icon: "👋" });
                router.push('/programs');
              }}
              className="p-5 rounded-2xl border-2 border-slate-100 hover:border-fuchsia-500 hover:bg-fuchsia-50 transition-all group flex flex-col items-center gap-3 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-white group-hover:text-fuchsia-500 flex items-center justify-center text-slate-400 transition-colors shadow-sm">
                <Sparkles size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 group-hover:text-fuchsia-600 transition-colors">I am a Teen</h4>
                <p className="text-xs text-slate-500 mt-1">Exploring for myself</p>
              </div>
            </button>
          </div>
        </motion.div>
      )}

      {/* ─── PHASE 1: QUESTIONNAIRE ─── */}
      {phase === 'questions' && (
        <div>
          {/* Progress Bar & Indicators */}
          <div className="mb-5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-2">
              <span className="uppercase tracking-widest text-xs text-primary bg-primary/5 px-2.5 py-1 rounded-full font-bold">
                Step {currentStep + 1} of {QUESTIONS.length}
              </span>
              <span>{Math.round(((currentStep + 1) / QUESTIONS.length) * 100)}% Completed</span>
            </div>
            
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-primary to-accent h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 sm:space-y-5"
            >
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight leading-tight">
                  {QUESTIONS[currentStep].title}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 sm:mt-2">
                  {QUESTIONS[currentStep].subtitle}
                </p>
              </div>

              {/* Single Select Question */}
              {QUESTIONS[currentStep].type === 'select' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {QUESTIONS[currentStep].options.map((option, idx, arr) => {
                    const isSelected = answers[QUESTIONS[currentStep].id as keyof typeof answers] === option.value;
                    const isLastOdd = arr.length % 2 !== 0 && idx === arr.length - 1;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelectOption(QUESTIONS[currentStep].id, option.value)}
                        className={`p-3 sm:p-3.5 text-left rounded-2xl border-2 transition-all duration-200 group flex items-start gap-3 hover:shadow-lg hover:shadow-slate-100/30 ${
                          isSelected
                            ? 'border-primary bg-primary/[0.02] text-primary shadow-sm'
                            : 'border-slate-100 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                        } ${isLastOdd ? 'sm:col-span-2' : ''}`}
                      >
                        <div className={`w-4.5 h-4.5 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5 transition-all ${
                          isSelected ? 'border-primary bg-primary' : 'border-slate-300 group-hover:border-slate-400'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm sm:text-[14px] leading-tight ${isSelected ? 'text-primary' : 'text-slate-800'}`}>
                            {option.label}
                          </p>
                          {(option as any).desc && (
                            <p className={`text-[11px] mt-1 leading-relaxed ${isSelected ? 'text-primary/80 font-medium' : 'text-slate-500 font-normal'}`}>
                              {(option as any).desc}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Multi-Select Question */}
              {QUESTIONS[currentStep].type === 'multiselect' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {QUESTIONS[currentStep].options.map((option) => {
                      const selectedList = answers[QUESTIONS[currentStep].id as keyof typeof answers] as string[] || [];
                      const isSelected = selectedList.includes(option.value);
                      const hasDesc = !!(option as any).desc;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleToggleMultiOption(QUESTIONS[currentStep].id, option.value)}
                          className={`p-3 sm:p-3.5 text-left rounded-2xl border-2 transition-all duration-200 group flex items-start gap-3 hover:shadow-lg hover:shadow-slate-100/30 ${
                            isSelected
                              ? 'border-primary bg-primary/[0.02] text-primary shadow-sm shadow-primary/5'
                              : 'border-slate-100 hover:border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-4.5 h-4.5 rounded-md border-2 shrink-0 flex items-center justify-center mt-0.5 transition-all ${
                            isSelected ? 'border-primary bg-primary' : 'border-slate-300 group-hover:border-slate-400'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                          </div>
                          <div>
                            <p className={`font-semibold text-sm sm:text-[14px] leading-tight ${isSelected ? 'text-primary' : 'text-slate-800'}`}>
                              {option.label}
                            </p>
                            {hasDesc && (
                              <p className={`text-[11px] mt-1 leading-relaxed ${isSelected ? 'text-primary/80 font-medium' : 'text-slate-500 font-normal'}`}>
                                {(option as any).desc}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Multi-Select Next Trigger */}
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full btn-primary py-3 sm:py-3.5 rounded-2xl shadow-lg shadow-primary/10 flex items-center justify-center gap-2 group text-white bg-primary font-semibold text-sm"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              )}

              {/* Bottom Navigation */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-5">
                {currentStep > 0 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {QUESTIONS[currentStep].type !== 'multiselect' && (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-widest"
                  >
                    Skip / Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ─── PHASE 2: RECOMMENDATION & CONTACT FORM ─── */}
      {phase === 'recommendation' && (() => {
        // Generate list of 4 months (current month + next 3 months)
        const today = new Date();
        const availableMonths = [];
        for (let i = 0; i < 4; i++) {
          const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
          availableMonths.push({
            label: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
            month: d.getMonth(),
            year: d.getFullYear(),
          });
        }

        const currentSelectedMonth = availableMonths[selectedMonthIndex];

        // Helper to generate calendar days for selected month
        const getCalendarDays = () => {
          if (!currentSelectedMonth) return [];
          const { month, year } = currentSelectedMonth;
          
          // Find the starting day of the week (e.g. Wednesday = 3)
          const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday=0, Monday=1...
          
          // Find total days in the month
          const totalDays = new Date(year, month + 1, 0).getDate();
          
          const daysList = [];
          
          // Add empty placeholders for grid alignment
          for (let i = 0; i < firstDayIndex; i++) {
            daysList.push(null);
          }
          
          // Add real days
          for (let i = 1; i <= totalDays; i++) {
            const d = new Date(year, month, i);
            // Disable past days and current day for the current month
            const isPast = year === today.getFullYear() && month === today.getMonth() && i <= today.getDate();
            daysList.push({
              date: d,
              dayNum: i,
              isPast,
            });
          }
          
          return daysList;
        };

        const calendarDays = getCalendarDays();

        // Time slot options
        const TIME_SLOTS = [
          { value: '10:00 AM - 10:30 AM', label: '10:00 AM - 10:30 AM', period: 'Morning' },
          { value: '10:30 AM - 11:00 AM', label: '10:30 AM - 11:00 AM', period: 'Morning' },
          { value: '11:00 AM - 11:30 AM', label: '11:00 AM - 11:30 AM', period: 'Morning' },
          { value: '11:30 AM - 12:00 PM', label: '11:30 AM - 12:00 PM', period: 'Morning' },
          { value: '12:00 PM - 12:30 PM', label: '12:00 PM - 12:30 PM', period: 'Afternoon' },
          { value: '12:30 PM - 01:00 PM', label: '12:30 PM - 01:00 PM', period: 'Afternoon' },
          { value: '02:00 PM - 02:30 PM', label: '02:00 PM - 02:30 PM', period: 'Afternoon' },
          { value: '02:30 PM - 03:00 PM', label: '02:30 PM - 03:00 PM', period: 'Afternoon' },
          { value: '03:00 PM - 03:30 PM', label: '03:00 PM - 03:30 PM', period: 'Afternoon' },
          { value: '03:30 PM - 04:00 PM', label: '03:30 PM - 04:00 PM', period: 'Afternoon' },
          { value: '04:00 PM - 04:30 PM', label: '04:00 PM - 04:30 PM', period: 'Evening' },
          { value: '04:30 PM - 05:00 PM', label: '04:30 PM - 05:00 PM', period: 'Evening' },
          { value: '05:00 PM - 05:30 PM', label: '05:00 PM - 05:30 PM', period: 'Evening' },
          { value: '05:30 PM - 06:00 PM', label: '05:30 PM - 06:00 PM', period: 'Evening' },
          { value: '06:00 PM - 06:30 PM', label: '06:00 PM - 06:30 PM', period: 'Evening' },
          { value: '06:30 PM - 07:00 PM', label: '06:30 PM - 07:00 PM', period: 'Evening' },
        ];

        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5 animate-in fade-in duration-300"
          >
            {/* Centered Match Header */}
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-1.5">
                <Sparkles size={12} className="animate-pulse" />
                Perfect Match Found
              </span>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                Recommended Program for Her
              </h3>
              <p className="text-slate-500 font-medium text-xs mt-0.5">
                Based on Class {answers.classRange} and her customized social confidence profile.
              </p>
            </div>

            {/* Split Screen 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1 items-start">
              
              {/* LEFT COLUMN: Suggested Program Details (lg:col-span-5) */}
              <div className="lg:col-span-5 w-full flex flex-col gap-4">
                
                {/* Curriculum Tab Selector for Multi suggestions */}
                {suggestedPrograms.length > 1 && (
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider shadow-inner select-none w-full justify-between">
                    {suggestedPrograms.map((prog) => {
                      const isActive = activeProgramTab === prog.id;
                      return (
                        <button
                          key={prog.id}
                          type="button"
                          onClick={() => setActiveProgramTab(prog.id)}
                          className={`flex-1 text-center py-1.5 rounded-lg transition-all ${
                            isActive
                              ? 'bg-white text-primary shadow-sm font-semibold'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {prog.title}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Recommended Cards Stack */}
                <div className="flex flex-col gap-4">
                  {suggestedPrograms.map((prog) => {
                    const isSelected = selectedProgramIds.includes(prog.id);
                    const isActive = suggestedPrograms.length === 1 || activeProgramTab === prog.id;
                    if (!isActive) return null;
                    return (
                      <div 
                        key={prog.id}
                        onClick={() => {
                          toast.success(`Opening ${prog.title} curriculum details...`);
                          window.open(`/programs/${prog.id}`, '_blank');
                        }}
                        className={`group cursor-pointer p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col gap-3.5 bg-white shadow-md hover:shadow-xl hover:scale-[1.005] ${
                          isSelected 
                            ? 'border-primary bg-primary/[0.005] ring-1 ring-primary/5 shadow-primary/5' 
                            : 'border-slate-100 opacity-70 hover:opacity-100'
                        }`}
                      >
                        {/* Click Hover Hint */}
                        <div className="absolute top-4 right-4 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          View Details <ArrowRight size={11} />
                        </div>

                        {/* Gradient Top Banner Accent */}
                        <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${GRADIENTS_MAP[prog.title.toUpperCase()] || 'from-slate-500 to-slate-700'}`} />

                        {/* Title / Class */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                              <Calendar size={11} />
                              {prog.duration} • {prog.sessionsList?.length || 0} Sessions
                            </span>
                          </div>
                          
                          {/* Checkbox selector */}
                          <div className="flex items-center justify-between mt-0.5">
                            <h4 className="text-xl font-bold tracking-tight text-slate-800 group-hover:text-primary transition-colors">
                              {prog.title} Program
                            </h4>
                            
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProgramIds(prev => 
                                  prev.includes(prog.id) 
                                    ? prev.filter(id => id !== prog.id)
                                    : [...prev, prog.id]
                                );
                              }}
                              className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all ${
                                isSelected 
                                  ? 'border-primary bg-primary text-white shadow-sm' 
                                  : 'border-slate-300 hover:border-slate-400 text-transparent'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[3.5px]" />
                            </button>
                          </div>
                          
                          <p className="text-xs font-medium italic text-slate-400">
                            "{prog.tagline}"
                          </p>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          {prog.description}
                        </p>

                        {/* Curricular Focus */}
                        <div className="pt-0.5">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                            <BookOpen size={11} />
                            Key Topics She Will Cover:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {prog.topics.map((topic, i) => (
                              <span key={i} className="text-xs font-medium bg-slate-50 text-slate-600 border border-slate-100 px-2 py-0.5 rounded-md">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Pricing summary */}
                        <div className="border-t border-slate-100 pt-2 flex flex-wrap justify-between items-center gap-2 mt-0.5">
                          <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Price:</span>
                            <p className="text-xs font-bold text-slate-600 mt-0.5">
                              {formatPrice(prog.price || 0)} <span className="text-[10px] font-normal text-slate-400">/mo</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* RIGHT COLUMN: Interactive Demo Booking Form (lg:col-span-7) */}
              <div className="lg:col-span-7 w-full">
                <form onSubmit={handleBookDemo} className="bg-slate-50/50 p-4 sm:p-5 rounded-3xl border border-slate-100/60 shadow-sm flex flex-col gap-4">
                  <div className="text-center border-b border-slate-200/60 pb-2.5">
                    <h5 className="text-lg font-bold text-slate-800">Book Complimentary Demo Session</h5>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">Select a premium slot to experience a 15-minute live mentorship demo.</p>
                  </div>

                  {/* Format Preference consolidated inside Booking Card */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Learning Format Preference</label>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-sm text-center">
                      1:1 Private Mentoring
                    </div>
                  </div>

                  {/* Sub-grid: Sub-column 1 (Calendar) & Sub-column 2 (Slots + Contacts) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    
                    {/* Nested Sub-column 1: Calendar Date Slot Picker */}
                    <div className="space-y-3 max-w-[280px] mx-auto w-full">
                      <div className="flex items-center gap-2 text-slate-800">
                        <Calendar className="text-primary w-4 h-4 shrink-0" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">1. Select Date</span>
                      </div>

                      {/* Sleek Month Switcher */}
                      <div className="flex items-center justify-between bg-white px-2 py-1 rounded-xl border border-slate-200/60 shadow-sm">
                        <button
                          type="button"
                          disabled={selectedMonthIndex === 0}
                          onClick={() => {
                            setSelectedMonthIndex(prev => prev - 1);
                            setSelectedDay(null);
                            setSelectedTime('');
                          }}
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          {currentSelectedMonth.label.split(' ')[0]} {currentSelectedMonth.label.split(' ')[1]}
                        </span>
                        <button
                          type="button"
                          disabled={selectedMonthIndex === 3}
                          onClick={() => {
                            setSelectedMonthIndex(prev => prev + 1);
                            setSelectedDay(null);
                            setSelectedTime('');
                          }}
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      {/* Day Grid */}
                      <div className="border border-slate-100 rounded-xl p-2 bg-white shadow-sm">
                        {/* Day Names */}
                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-1.5">
                          <span>Su</span>
                          <span>Mo</span>
                          <span>Tu</span>
                          <span>We</span>
                          <span>Th</span>
                          <span>Fr</span>
                          <span>Sa</span>
                        </div>

                        {/* Calendar numbers */}
                        <div className="grid grid-cols-7 gap-1 text-center justify-items-center">
                          {calendarDays.map((d, idx) => {
                            if (d === null) {
                              return <div key={`empty-${idx}`} className="w-8 h-8" />;
                            }

                            const isSelected = selectedDay && selectedDay.getDate() === d.date.getDate() && selectedDay.getMonth() === d.date.getMonth() && selectedDay.getFullYear() === d.date.getFullYear();
                            
                            return (
                              <button
                                key={idx}
                                type="button"
                                disabled={d.isPast}
                                onClick={() => {
                                  setSelectedDay(d.date);
                                  setSelectedTime(''); // reset time when day changes
                                }}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all ${
                                  d.isPast
                                    ? 'text-slate-200 cursor-not-allowed bg-transparent font-normal'
                                    : isSelected
                                    ? 'bg-primary text-white font-bold shadow-sm scale-105'
                                    : 'bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-100/50'
                                }`}
                              >
                                {d.dayNum}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Nested Sub-column 2: Slots picker & Contact Info */}
                    <div className="space-y-3.5 w-full">
                      
                      {/* Available Slots */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Clock size={11} className="text-primary" />
                            2. Select Slot Time
                          </label>
                          {selectedDay && (
                            <span className="text-xs font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded">
                              {selectedDay.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </span>
                          )}
                        </div>

                        {!selectedDay ? (
                          <div className="bg-white border border-slate-100/80 rounded-xl p-3 text-center">
                            <p className="text-xs text-slate-400 italic">Select a date to unlock available time slots.</p>
                          </div>
                        ) : (
                          <div className="bg-white border border-slate-100/80 rounded-xl p-2.5 space-y-2">
                            {(['Morning', 'Afternoon', 'Evening'] as const).map((period) => {
                              const periodSlots = TIME_SLOTS.filter(s => s.period === period);
                              return (
                                <div key={period} className="space-y-0.5">
                                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{period} Slots</p>
                                  <div className="flex flex-wrap gap-1">
                                    {periodSlots.map((slot) => {
                                      const isSlotSelected = selectedTime === slot.value;
                                      return (
                                        <button
                                          key={slot.value}
                                          type="button"
                                          onClick={() => setSelectedTime(slot.value)}
                                          className={`px-2 py-0.5 rounded text-xs font-semibold transition-all border ${
                                            isSlotSelected
                                              ? 'bg-primary text-white border-primary shadow-sm shadow-primary/5'
                                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                          }`}
                                        >
                                          {slot.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <Users className="text-primary w-4 h-4 shrink-0" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">3. Contact Info</span>
                        </div>

                        <div className="bg-white border border-slate-100/80 rounded-xl p-2.5 space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-0.5">Parent's Full Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Anjali Sharma"
                              value={parentName}
                              onChange={(e) => setParentName(e.target.value)}
                              className="w-full bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-800 placeholder:text-slate-400 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-0.5">Phone Number *</label>
                            <input
                              type="tel"
                              required
                              placeholder="e.g. +91 98765 43210"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-800 placeholder:text-slate-400 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-0.5">Email Address (Optional)</label>
                            <input
                              type="email"
                              placeholder="e.g. parent@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-800 placeholder:text-slate-400 text-xs"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {error && <p className="text-red-500 text-xs font-semibold text-center mt-0.5">{error}</p>}

                  {/* Actions Grid */}
                  <div className="mt-0.5">
                    {/* Book Demo Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-primary py-3.5 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group text-white bg-primary font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing Payment...</span>
                        </>
                      ) : (
                        <>
                          Pay ₹29 & Book Demo Session
                          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Back link */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setPhase('questions')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Change Answers
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        );
      })()}

      {/* ─── PHASE 3: SUCCESS STATE ─── */}
      {phase === 'success' && (() => {
        const bookedPrograms = programsList.filter(p => selectedProgramIds.includes(p.id));
        const bookedProgramTitles = bookedPrograms.length > 0 
          ? bookedPrograms.map(p => p.title).join(' & ') 
          : (suggestedPrograms[0]?.title || 'SPARK');
        
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="text-center py-10 px-4 space-y-6"
          >
            {/* Celebrating icon */}
            <div className="relative w-24 h-24 mx-auto mb-4">
              <motion.div 
                className="absolute inset-0 bg-green-100 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 stroke-[2.5px]" />
              </div>
              {/* Mini sparkles */}
              <div className="absolute top-1 left-2 text-green-500 animate-bounce"><Sparkles size={16} /></div>
              <div className="absolute bottom-1 right-2 text-green-500 animate-pulse"><Sparkles size={14} /></div>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200/60 mb-1">
                <span>Paid ₹29</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Confirmed Booking</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Demo Session Booked!</h3>
              <p className="text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                Thank you for your booking. Our certified senior education guides will connect with you at <span className="text-primary font-bold">{phone}</span> to conduct your live 1:1 demo session.
              </p>
            </div>

            {/* Quick Recap / Summary Box */}
            <div className="max-w-md mx-auto bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left space-y-3.5">
              <h6 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Selected Profile Summary:</h6>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Recommended Package</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{bookedProgramTitles}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Class Cohort</p>
                  <p className="font-semibold text-slate-800 mt-0.5">Class {answers.classRange}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Learning Style</p>
                  <p className="font-semibold text-slate-800 mt-0.5 capitalize">
                    {answers.learningPref.map((pref: string) => {
                      if (pref === 'talking') return 'Empathetic Sharing';
                      if (pref === 'doing') return 'Hands-on Activities';
                      if (pref === 'reading') return 'Self-paced Reading';
                      if (pref === 'group') return 'Group Cohorts';
                      return pref;
                    }).join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Demo Request For</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    1:1 Private Mentoring
                  </p>
                </div>

                {/* Confirmed Slot Date & Time */}
                {selectedDay && selectedTime && (
                  <div className="col-span-2 border-t border-slate-100 pt-3">
                    <p className="text-slate-400 font-medium flex items-center gap-1">
                      <Calendar size={12} className="text-primary" /> Confirmed Demo Slot
                    </p>
                    <p className="font-semibold text-primary text-xs mt-1.5 flex items-center gap-1.5 bg-primary/5 px-3 py-2 rounded-xl border border-primary/10 w-fit">
                      <Clock size={13} />
                      {selectedDay.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })} at {selectedTime}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <button
                onClick={() => {
                  router.push('/parents');
                }}
                className="flex-1 btn-primary py-3.5 rounded-xl text-white bg-primary font-semibold text-xs shadow-md shadow-primary/10 transition-transform hover:scale-102"
              >
                Explore Parent Community
              </button>
              <button
                onClick={() => {
                  const firstId = bookedPrograms[0]?.id || suggestedPrograms[0]?.id || 'spark';
                  window.location.href = `/programs/${firstId}`;
                }}
                className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-800 font-semibold text-xs bg-white transition-all hover:bg-slate-50"
              >
                Read Curriculum Details
              </button>
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}

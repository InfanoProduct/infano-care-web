'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, ChevronLeft, CheckCircle2, Loader2, Sparkles, 
  BookOpen, Users, Calendar, ShieldCheck, Heart, Award, GraduationCap,
  MessageCircle, Target, HelpCircle, ArrowRight, Clock
} from 'lucide-react';
import { ProgramsService } from '@/services/programs.service';
import { toast } from 'react-hot-toast';

// 5 default premium programs data
const PROGRAMS_METADATA = [
  {
    id: 'spark',
    title: 'SPARK',
    classRange: 'Class 5-6',
    tagline: 'She wakes up to herself.',
    description: 'A transformative space designed to ease early adolescent girls into the physical, emotional, and social changes of puberty, building a bulletproof foundation of body confidence.',
    sessions: 8,
    duration: '2 Months',
    topics: ['My Body My Boundary', 'The Filter Lie', 'Feel It to Deal It', 'Body Unfiltered', 'Period. Full Stop.', 'Myth Busters'],
    pricePrivate: 6499,
    priceGroup: 3999,
    gradient: 'from-orange-500 to-rose-500 shadow-orange-500/10',
    bgLight: 'bg-orange-50/50 border-orange-100',
    accentColor: 'text-orange-500',
    pillBg: 'bg-orange-100/60 text-orange-600'
  },
  {
    id: 'rise',
    title: 'RISE',
    classRange: 'Class 6-7',
    tagline: 'She learns who she is - and who gets access.',
    description: 'An essential guide to digital safety, consent, and self-identity, helping middle-school girls map out healthy boundaries and understand red & green flags in their online and offline circles.',
    sessions: 10,
    duration: '2.5 Months',
    topics: ['Consent Is Not Just Sex', 'Grooming Has a Script', 'Your Digital Footprint', 'Red & Green Flags', 'Hormone Weather Report', 'Who Am I'],
    pricePrivate: 7999,
    priceGroup: 4999,
    gradient: 'from-purple-500 to-indigo-500 shadow-purple-500/10',
    bgLight: 'bg-purple-50/50 border-purple-100',
    accentColor: 'text-purple-500',
    pillBg: 'bg-purple-100/60 text-purple-600'
  },
  {
    id: 'bloom',
    title: 'BLOOM',
    classRange: 'Class 7-8',
    tagline: 'She faces the hard stuff before it faces her.',
    description: 'Tackling the intense academic and emotional hurdles of early high school. Focuses on friendship dynamics, body-image issues, social pressures, and healthy emotional coping mechanisms.',
    sessions: 10,
    duration: '2.5 Months',
    topics: ['Anxiety Is Real - Not Drama', 'Depression Decoded', 'Friendship Power Dynamics', 'Social Media & Self-Worth', 'Navigating Hard Talks'],
    pricePrivate: 9499,
    priceGroup: 5999,
    gradient: 'from-emerald-500 to-teal-500 shadow-emerald-500/10',
    bgLight: 'bg-emerald-50/50 border-emerald-100',
    accentColor: 'text-emerald-500',
    pillBg: 'bg-emerald-100/60 text-emerald-600'
  },
  {
    id: 'ignite',
    title: 'IGNITE',
    classRange: 'Class 8-9',
    tagline: 'She learns how the world works - and how to work it.',
    description: 'An advanced leadership, critical thinking, and financial intelligence curriculum, preparing young women to stand up against media bias, negotiate boundaries, and set real goals.',
    sessions: 12,
    duration: '3 Months',
    topics: ['Financial Literacy 101', 'Media Bias & Critical Thinking', 'Negotiation Skills', 'Goal Mapping', 'Saying No Comfortably'],
    pricePrivate: 8999,
    priceGroup: 5499,
    gradient: 'from-violet-600 to-fuchsia-600 shadow-violet-600/10',
    bgLight: 'bg-violet-50/50 border-violet-100',
    accentColor: 'text-violet-600',
    pillBg: 'bg-violet-100/60 text-violet-600'
  },
  {
    id: 'unstoppable',
    title: 'UNSTOPPABLE',
    classRange: 'Class 9-10',
    tagline: 'She walks into adult life prepared, not blindsided.',
    description: 'The ultimate preparatory milestone program focusing on career planning, college transition, independent adulting, stress mitigation, and maintaining healthy personal relationships.',
    sessions: 12,
    duration: '3 Months',
    topics: ['Career Path & Skill Mapping', 'Adulting 101', 'Healthy Relationship Circles', 'Stress & Time Allocation', 'College/Adult Transition'],
    pricePrivate: 10999,
    priceGroup: 6999,
    gradient: 'from-amber-500 to-yellow-600 shadow-amber-500/10',
    bgLight: 'bg-amber-50/50 border-amber-100',
    accentColor: 'text-amber-600',
    pillBg: 'bg-amber-100/60 text-amber-600'
  }
];

// Definition of 7 empathetic questions
const QUESTIONS = [
  {
    id: 'classRange',
    title: "Which class is she in?",
    subtitle: "This helps us route her to the perfect, age-appropriate developmental curriculum.",
    type: 'select',
    options: [
      { value: '5-6', label: 'Class 5 to 6', desc: 'Ages 10-12 (Early pre-teen transition)' },
      { value: '6-7', label: 'Class 6 to 7', desc: 'Ages 11-13 (Middle school milestones)' },
      { value: '7-8', label: 'Class 7 to 8', desc: 'Ages 12-14 (Early high school adjustments)' },
      { value: '8-9', label: 'Class 8 to 9', desc: 'Ages 13-15 (Critical puberty & identity phases)' },
      { value: '9-10', label: 'Class 9 to 10', desc: 'Ages 14-16 (Preparing for senior high & beyond)' }
    ]
  },
  {
    id: 'confidence',
    title: "How would you describe her social confidence?",
    subtitle: "We tailor peer circle interactions to match her comfort zone.",
    type: 'select',
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
    subtitle: "Pick the one that aligns closest with your immediate parenting focus.",
    type: 'select',
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
    subtitle: "We design our interactive workshops to respect her learning style.",
    type: 'select',
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
  phase?: 'questions' | 'recommendation' | 'success';
  onPhaseChange?: (phase: 'questions' | 'recommendation' | 'success') => void;
}

export function ParentsEnquiryForm({ phase: propPhase, onPhaseChange }: ParentsEnquiryFormProps) {
  const router = useRouter();
  const [internalPhase, setInternalPhase] = useState<'questions' | 'recommendation' | 'success'>('questions');
  
  const phase = propPhase !== undefined ? propPhase : internalPhase;
  const setPhase = (newPhase: 'questions' | 'recommendation' | 'success') => {
    if (onPhaseChange) {
      onPhaseChange(newPhase);
    } else {
      setInternalPhase(newPhase);
    }
  };

  const [currentStep, setCurrentStep] = useState(0);
  
  // Form State
  const [answers, setAnswers] = useState({
    classRange: '',
    confidence: '',
    interests: '',
    hasMentor: '',
    challenges: [] as string[],
    learningPref: '',
    parentInvolvement: '',
  });

  // Recommendation & Contact details
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'PRIVATE' | 'GROUP' | 'BOTH'>('BOTH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Selected suggested program IDs state
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([]);
  const [activeProgramTab, setActiveProgramTab] = useState<string>('');

  // Slot Selection states
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0); // 0 to 3
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Update selected suggested program IDs when classRange changes
  useEffect(() => {
    if (answers.classRange) {
      const suggested = getSuggestedPrograms();
      setSelectedProgramIds(suggested.map((p) => p.id));
      if (suggested.length > 0) {
        setActiveProgramTab(suggested[0].id);
      }
    }
  }, [answers.classRange]);

  // Handle single-select question option selection
  const handleSelectOption = (questionId: string, optionValue: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionValue }));
    
    // Automatically advance steps for single-selects to keep it breezy
    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 200);
    } else {
      // Transition to recommendation phase
      setTimeout(() => {
        setPhase('recommendation');
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
      setPhase('recommendation');
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Find the appropriate program metadata based on class range selection
  const getSuggestedPrograms = () => {
    const selectedClass = answers.classRange;
    if (!selectedClass) return [PROGRAMS_METADATA[0]]; // fallback
    if (selectedClass === '6-7') {
      // suggest both SPARK (Class 5-6) and RISE (Class 6-7)
      return PROGRAMS_METADATA.filter((p) => p.id === 'spark' || p.id === 'rise');
    }
    const matched = PROGRAMS_METADATA.find((p) => p.classRange.includes(selectedClass));
    return matched ? [matched] : [PROGRAMS_METADATA[0]];
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

    try {
      await ProgramsService.bookDemoSession({
        parentName,
        phone,
        email: email || null,
        classRange: `Class ${answers.classRange}`,
        confidence: answers.confidence,
        interests: [answers.interests],
        hasMentor: answers.hasMentor,
        challenges: answers.challenges,
        learningPref: answers.learningPref,
        parentInvolvement: answers.parentInvolvement,
        suggestedPrograms: programFormats,
        slotDate: formattedDateStr,
        slotTime: selectedTime
      });

      setPhase('success');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      toast.error('Failed to book demo session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
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
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleToggleMultiOption(QUESTIONS[currentStep].id, option.value)}
                          className={`p-3 sm:p-3.5 text-left rounded-2xl border-2 transition-all duration-200 group flex items-center gap-3 ${
                            isSelected
                              ? 'border-primary bg-primary/[0.02] text-primary shadow-sm shadow-primary/5'
                              : 'border-slate-100 hover:border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-4.5 h-4.5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all ${
                            isSelected ? 'border-primary bg-primary' : 'border-slate-300 group-hover:border-slate-400'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                          </div>
                          <span className={`text-[13px] sm:text-[14px] font-semibold tracking-tight ${isSelected ? 'text-primary' : 'text-slate-800'}`}>
                            {option.label}
                          </span>
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
            // Disable past days for the current month
            const isPast = year === today.getFullYear() && month === today.getMonth() && i < today.getDate();
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
          { value: '10:00 AM', label: '10:00 AM', period: 'Morning' },
          { value: '11:30 AM', label: '11:30 AM', period: 'Morning' },
          { value: '02:00 PM', label: '02:00 PM', period: 'Afternoon' },
          { value: '03:30 PM', label: '03:30 PM', period: 'Afternoon' },
          { value: '05:00 PM', label: '05:00 PM', period: 'Evening' },
          { value: '06:30 PM', label: '06:30 PM', period: 'Evening' },
          { value: '08:00 PM', label: '08:00 PM', period: 'Evening' },
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
                        <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${prog.gradient}`} />

                        {/* Title / Class */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-md">
                              {prog.classRange}
                            </span>
                            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                              <Calendar size={11} />
                              {prog.duration} • {prog.sessions} Sessions
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
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Learning Tiers:</span>
                            <p className="text-xs font-bold text-slate-600 mt-0.5">
                              ₹{prog.pricePrivate.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">/mo (Private)</span> • ₹{prog.priceGroup.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">/mo (Group)</span>
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
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold shadow-sm w-full select-none">
                      {(['PRIVATE', 'GROUP', 'BOTH'] as const).map((format) => (
                        <button
                          key={format}
                          type="button"
                          onClick={() => setSelectedFormat(format)}
                          className={`flex-1 text-center py-1.5 rounded-lg transition-all text-xs ${
                            selectedFormat === format
                              ? 'bg-primary text-white shadow-sm font-semibold'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {format === 'BOTH' ? 'Both Formats' : format === 'PRIVATE' ? '1:1 Private' : 'Group Cohort'}
                        </button>
                      ))}
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

                  {/* Submit demo slot */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary py-2.5 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group text-white bg-primary font-semibold text-xs transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75 mt-0.5"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Book Free Demo Session
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
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
        const bookedPrograms = PROGRAMS_METADATA.filter(p => selectedProgramIds.includes(p.id));
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
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Demo Booked Successfully!</h3>
              <p className="text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                Congratulations! You have taken a beautiful step for your child. Our certified senior guides will reach out to you at <span className="text-primary font-bold">{phone}</span> within the next 24 hours to schedule her complimentary demo.
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
                    {answers.learningPref === 'talking' ? 'Empathetic Sharing' : 
                     answers.learningPref === 'doing' ? 'Hands-on Activities' : 
                     answers.learningPref === 'reading' ? 'Self-paced Reading' : 'Group Cohorts'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Demo Request For</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {selectedFormat === 'BOTH' ? 'Private & Group' : selectedFormat === 'PRIVATE' ? '1:1 Private' : 'Group Cohort'}
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

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

// Rich Static Fallback Programs containing default sessions
const STATIC_PROGRAMS: Record<string, Omit<Program, 'id' | 'createdAt' | 'updatedAt'>> = {
  'spark': {
    title: 'SPARK',
    tagline: 'She wakes up to herself.',
    description: 'A foundational, sensitive entry point for girls beginning puberty. SPARK provides an empathetic space to discuss body changes, emotional growth, and basic social media navigation.',
    classRange: 'Class 5',
    minClass: 5,
    maxClass: 5,
    sessions: 8,
    duration: '2 Months',
    topics: ['Body Unfiltered', 'Period. Full Stop.', 'Myth Busters: Family Edition', 'My Body My Boundary', 'The Filter Lie', 'Feel It to Deal It'],
    pricePrivate: 6499,
    priceGroup: 3999,
    isActive: true,
    sessionsList: [
      { title: "Session 1: The Blueprint of You", description: "Understanding human growth as a natural, unique, and positive timeline for every individual." },
      { title: "Session 2: Body Unfiltered", description: "Demystifying the physical shifts, developmental stages, and growth spurts of early adolescence." },
      { title: "Session 3: Period. Full Stop.", description: "A complete, shame-free first period survival guide, from biological facts to practical management and comfort." },
      { title: "Session 4: Myth Busters: Family Edition", description: "Breaking down ancient taboos and cultural legends, and starting positive, open conversations at home." },
      { title: "Session 5: My Body, My Boundary", description: "Establishing strong, comfortable personal zones and mastering the art of the confident boundary." },
      { title: "Session 6: The Filter Lie", description: "Decoding social media perfection, airbrushing, and cultivating love for your authentic, unfiltered self." },
      { title: "Session 7: Feel It to Deal It", description: "Understanding emotional tides, mapping mood patterns, and practicing healthy coping mechanisms." },
      { title: "Session 8: Becoming My Own Champion", description: "Celebrating personal milestones, practicing self-compassion, and designing a path of ongoing confidence." }
    ]
  },
  'rise': {
    title: 'RISE',
    tagline: 'She learns who she is - and who gets access.',
    description: 'Empowers girls with digital safety, consent frameworks, and emotional regulation. RISE helps girls build a stronger sense of digital wellness and real-life boundaries.',
    classRange: 'Class 6',
    minClass: 6,
    maxClass: 6,
    sessions: 10,
    duration: '2.5 Months',
    topics: ['Consent Is Not Just About Sex', 'Grooming Has a Script', 'Your Digital Footprint Is Permanent', 'Red Flags & Green Flags', 'The Hormone Weather Report', 'Who Am I When No One Is Watching'],
    pricePrivate: 7999,
    priceGroup: 4999,
    isActive: true,
    sessionsList: [
      { title: "Session 1: Who Am I When No One is Watching?", description: "Deeply exploring self-identity, personal values, and defining your own core character." },
      { title: "Session 2: Consent is Not Just a Buzzword", description: "Setting robust rules for your own physical, emotional, and social boundaries." },
      { title: "Session 3: Grooming Has a Script", description: "Learning to spot early manipulation patterns, unsafe environments, and protect boundaries." },
      { title: "Session 4: Your Digital Footprint is Permanent", description: "Smart management of online reputation, private data, sharing habits, and screen ethics." },
      { title: "Session 5: Red Flags & Green Flags", description: "Identifying healthy, collaborative dynamics vs. toxic, manipulative patterns in peer relationships." },
      { title: "Session 6: The Hormone Weather Report", description: "Decoding chemical shifts and emotional weather reports to manage mood variability." },
      { title: "Session 7: Digital Wellness & Screen Balance", description: "Strategies to beat screen fatigue, doomscrolling, and establishing high-yield offline hobbies." },
      { title: "Session 8: Negotiating Peer Pressure", description: "Mastering custom scripts and assertive verbal templates to stay safe and true to yourself." },
      { title: "Session 9: The Power of Trusted Circles", description: "How to audit, assemble, and safely leverage your support system of parents and mentors." },
      { title: "Session 10: Stepping Into Your Voice", description: "Synthesizing the Rise curriculum with a personal boundary action plan and graduation." }
    ]
  },
  'bloom': {
    title: 'BLOOM',
    tagline: 'She faces the hard stuff before it faces her.',
    description: 'Equips older girls with tools to tackle adolescent mental health, academic stress, body image, and shifting friendship dynamics with professional psychology insights.',
    classRange: 'Class 7',
    minClass: 7,
    maxClass: 7,
    sessions: 10,
    duration: '2.5 Months',
    topics: ['Anxiety Is Real - Not Drama', 'Depression Doesn\'t Look Like the Movies', 'Friendship Expiry Dates', 'The Comparison Trap', 'PCOS & Pain: Unfiltered', 'Safe Havens: Finding Help'],
    pricePrivate: 9499,
    priceGroup: 5999,
    isActive: true,
    sessionsList: [
      { title: "Session 1: Mental Health is Not 'Drama'", description: "De-stigmatizing intense stress, mood fluctuations, and identifying the spectrum of anxiety and wellness." },
      { title: "Session 2: Depression Doesn't Look Like the Movies", description: "Spotting signs of prolonged sadness in yourself and friends, and understanding when to seek active help." },
      { title: "Session 3: Friendship Expiry Dates", description: "Gracefully navigating changing social dynamics, outgrowing school circles, and ending relationships safely." },
      { title: "Session 4: The Comparison Trap", description: "Breaking free from the toxic patterns of comparing grades, bodies, lifestyles, and aesthetics online." },
      { title: "Session 5: PCOS & Pain: Unfiltered", description: "Understanding reproductive health disorders, hormonal balance, and talking confidently to doctors." },
      { title: "Session 6: Safe Havens & Professional Support", description: "Demystifying therapy, student counseling, medical resources, and removing the fear of asking." },
      { title: "Session 7: Emotional First Aid", description: "Practical mindfulness, vagus nerve stimulation, and quick breathing techniques to halt panic states." },
      { title: "Session 8: Self-Compassion in Action", description: "Silencing the harsh inner critic and implementing daily habits of authentic self-acceptance." },
      { title: "Session 9: Parent-Teen Bridge Building", description: "Formulating mutual respect pathways, managing daily friction, and communicating emotional needs." },
      { title: "Session 10: Blooming Into Resilience", description: "Constructing a strong bounce-back architecture for academic and personal life, with graduation." }
    ]
  },
  'ignite': {
    title: 'IGNITE',
    tagline: 'She learns how the world works - and how to work it.',
    description: 'A powerful transition kit for leadership, confidence, media literacy, negotiation, and early financial intelligence.',
    classRange: 'Class 8',
    minClass: 8,
    maxClass: 8,
    sessions: 12,
    duration: '3 Months',
    topics: ['Feminism: Not A Bad Word', 'Financial Literacy for Teen Girls', 'Negotiating Your Worth', 'Unmasking Media Influence', 'Leadership Under Pressure', 'Designing My Future'],
    pricePrivate: 8999,
    priceGroup: 5499,
    isActive: true,
    sessionsList: [
      { title: "Session 1: Feminism: Decoded & Debunked", description: "Examining equity, historic struggles, modern stereotypes, and cultivating sisterhood and allyship." },
      { title: "Session 2: Financial Literacy: Part 1", description: "Understanding money flow, power of compound interest, basic personal savings, and budgeting." },
      { title: "Session 3: Financial Literacy: Part 2", description: "Decoding digital banking, cards, online safety, investment assets, and financial independence goals." },
      { title: "Session 4: Negotiating Your Worth", description: "Learning confident advocacy in academic, family, and social environments with structured talk paths." },
      { title: "Session 5: Unmasking Media Influence", description: "Analyzing hidden agendas, advertising psychology, body norms, and media bias." },
      { title: "Session 6: Leadership Under Pressure", description: "Making crucial, ethical choices, maintaining team performance, and staying resilient under crisis." },
      { title: "Session 7: Designing Your Future Vision", description: "Formulating long-term visions, career tracking, and identifying your natural passions and strengths." },
      { title: "Session 8: Communication Mastery", description: "Assertive body language, tone modulation, public confidence, and active listening scripts." },
      { title: "Session 9: Time Management & Focus Hacks", description: "Beating procrastination through custom workflows, calendars, and digital prioritization." },
      { title: "Session 10: Public Speaking & Pitching", description: "Structuring short speeches, presenting school projects, and pitching ideas with absolute poise." },
      { title: "Session 11: Mentor Relationship Building", description: "Identifying, approaching, and building collaborative relationships with professional mentors." },
      { title: "Session 12: Sparking Your Ignite Pitch", description: "Showcasing your personal leadership project, graduation celebration, and looking forward." }
    ]
  },
  'unstoppable': {
    title: 'UNSTOPPABLE',
    tagline: 'She walks into adult life prepared, not blindsided.',
    description: 'The ultimate preparatory package to step into independent adulthood with confidence, complete clarity, career blueprints, and relationship insights.',
    classRange: 'Class 9',
    minClass: 9,
    maxClass: 9,
    sessions: 12,
    duration: '3 Months',
    topics: ['Life on My Own Terms', 'Adulting 101: Survival Pack', 'Healthy Intimacy & Relationships', 'Career Blueprinting', 'Resilience: Bouncing Back Higher', 'Becoming My Own Anchor'],
    pricePrivate: 10999,
    priceGroup: 6999,
    isActive: true,
    sessionsList: [
      { title: "Session 1: Life on My Own Terms", description: "Developing your personal manifesto, establishing independent core values, and charting growth." },
      { title: "Session 2: Adulting 101: The Basics", description: "Essential home skills, nutrition planning, laundry, space organization, and independent routine setup." },
      { title: "Session 3: Adulting 101: Taxes & Rent", description: "Practical guide to rental agreements, tenant laws, tax brackets, utilities, and emergency funds." },
      { title: "Session 4: Healthy Intimacy & Love", description: "Safe boundaries, relationship safety, healthy dating patterns, and signs of mutual growth." },
      { title: "Session 5: Recognizing Toxic Dynamics", description: "Spotting manipulation, narcissism, gaslighting, emotional abuse, and enforcing swift exits." },
      { title: "Session 6: Career Blueprinting & CVs", description: "Crafting modern resumes, optimization of digital footprints (LinkedIn), and job interview simulation." },
      { title: "Session 7: Networking & Professional Circles", description: "Effective follow-ups, informational interviews, and leveraging standard professional networks." },
      { title: "Session 8: Bounce-Back Resilience", description: "Handling academic failure, job rejection, personal setbacks, and coping with dynamic shifts." },
      { title: "Session 9: Safe Travel & Solo Survival", description: "Navigating new cities, public transit safety, personal protection plans, and emergency response." },
      { title: "Session 10: Becoming Your Own Anchor", description: "Managing solitary transitions, building deep self-comfort, and prioritizing long-term mental wellness." },
      { title: "Session 11: Healthy Lifelong Habits", description: "Maintaining sleep integrity, periodic medical tests, balanced routines, and structural work-life harmony." },
      { title: "Session 12: Unstoppable Graduation", description: "Final reflection presentation, sharing positive cohort affirmations, and official program graduation." }
    ]
  }
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

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
        console.warn('Program details API fetch failed, trying static slug resolver:', err);
        
        // Resolve slug title fallback
        const slug = id.toLowerCase();
        const fallback = STATIC_PROGRAMS[slug];
        
        if (fallback) {
          setProgram({
            ...fallback,
            id: 'static-' + slug,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as Program);
          setClassRange(fallback.classRange);
        } else {
          setErrorMsg('We couldn\'t find the program you were looking for. It may have been relocated or updated.');
        }
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
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Book a Demo Session</span>
                      <h3 className="text-2xl font-bold font-heading text-slate-800 tracking-tight leading-tight">
                        Schedule a Consultation
                      </h3>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">
                        Meet our coordinators and discover the Infano curriculum difference customized for your daughter.
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
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                          Parent Name <span className="text-rose-500">*</span>
                        </label>
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
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                            Phone Number <span className="text-rose-500">*</span>
                          </label>
                          <input 
                            type="tel" 
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Mobile digits"
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 text-sm font-semibold transition-colors bg-[#FAFBFE]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                            Email ID (Optional)
                          </label>
                          <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="mail@domain.com"
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 text-sm font-semibold transition-colors bg-[#FAFBFE]"
                          />
                        </div>
                      </div>

                      {/* Dropdown for class target */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                            Her Class Range <span className="text-rose-500">*</span>
                          </label>
                          <select 
                            required
                            value={classRange}
                            onChange={(e) => setClassRange(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 text-sm font-semibold transition-colors bg-[#FAFBFE]"
                          >
                            <option value="">Select Grade</option>
                            <option value="Class 5">Class 5</option>
                            <option value="Class 6">Class 6</option>
                            <option value="Class 7">Class 7</option>
                            <option value="Class 8">Class 8</option>
                            <option value="Class 9">Class 9</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                            Learning Format
                          </label>
                          <select 
                            value={learningPref}
                            onChange={(e) => setLearningPref(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 text-sm font-semibold transition-colors bg-[#FAFBFE]"
                          >
                            <option value="">Preferred setting</option>
                            <option value="1:1 Mentoring">1:1 Private Mentoring</option>
                            <option value="Group Cohort">Group Cohort (4 Girls)</option>
                          </select>
                        </div>
                      </div>

                      {/* Slot Booking Date and Time */}
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

                      {/* Actions Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {/* Book Demo Button */}
                        <button
                          type="submit"
                          disabled={submitting}
                          className={`w-full inline-flex items-center justify-center gap-2 py-4 px-4 rounded-2xl text-white font-bold text-xs uppercase tracking-widest transition-all ${theme.btn} disabled:opacity-50 shadow-md`}
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

                        {/* Direct Enroll Link */}
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
                          className="w-full inline-flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md text-center"
                        >
                          <span>Enroll Now</span>
                        </Link>
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
                      onClick={() => setSubmitted(false)}
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

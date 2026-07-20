'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WebinarCheckoutModal } from '@/features/marketing/components/WebinarCheckoutModal';
import { ShopService, Webinar } from '@/services/shop.service';
import {
  Sparkles, Calendar, Clock, Video, CheckCircle2, ChevronDown,
  Users, MessageCircle, AlertCircle, Quote, ShieldCheck,
  Brain, Heart, ArrowRight, Award, DoorClosed, Smartphone, Loader2,
  Globe, FileText, CalendarCheck, MessageSquareX, Plus, Minus,
  Activity, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '@/lib/utils';

const FAQ_ITEMS = [
  {
    question: "Will this session be recorded?",
    answer: "No, this is a live-only interactive experience to protect the privacy of the parents sharing their stories. We recommend attending live, but we may offer a temporary 24-hour replay strictly for registered attendees who couldn't make it due to emergencies."
  },
  {
    question: "Is this appropriate if my daughter is 10 vs 15?",
    answer: "Yes. While a 10-year-old and a 15-year-old face different developmental milestones, the core '3 Silent Signals' framework applies across the entire adolescent range (Grades 5-9). The trainer will provide specific, age-appropriate examples and scripts for both early adolescence (ages 10-12) and late adolescence (ages 13-15)."
  },
  {
    question: "Will you be selling something during the webinar?",
    answer: "Yes, we want to be completely transparent. At the end of the webinar, we will share details about our comprehensive Grade-wise curriculum programs (Spark, Rise, Bloom, Ignite) for parents who want to go deeper. However, the webinar itself is packed with immediate, standalone value—there is absolutely no obligation to buy anything."
  },
  {
    question: "What if I can't attend live?",
    answer: "Since registrations are limited, please reserve a seat only if you intend to attend. If an emergency comes up, you can contact our support team, and we will do our best to share resources or fit you into a future cohort."
  }
];

const LEARN_POINTS = [
  {
    title: "The 3 Silent Signals Framework",
    desc: "Understand what changes in her Body, Mirror (self-image), and Mood, and how to spot early warning signs."
  },
  {
    title: "The Exact Script to Use",
    desc: "Verbatim phrases to say when she shuts the door or answers with a cold 'I'm fine', without invading her privacy."
  },
  {
    title: "The 2-Week Warning Rule",
    desc: "A reliable psychological rule of thumb to distinguish normal teenage moodiness from issues needing urgent attention."
  },
  {
    title: "What NOT to Say",
    desc: "Avoid common conversational traps like 'just stay positive' or 'others have it worse' that accidentally shut down dialogue."
  }
];

const PROBLEM_POINTS = [
  {
    title: "The 'I'm Fine' Door Slam",
    desc: "She used to share everything. Now, she retreats to her room, shuts the door, and communicates in one-word answers."
  },
  {
    title: "The Ambiguity Trap",
    desc: "You can't tell if her sudden tears or irritability are standard Grade 7 moodiness or early warning signs of stress."
  },
  {
    title: "The Screen Secrecy",
    desc: "She is constantly on her phone, hiding the screen when you walk in, leaving you anxious about what she's exposed to."
  }
];

const TIMELINE_POINTS = [
  { time: "0:00 - 0:15", title: "Unmasking the Pain", desc: "Setting the context, sharing real parenting struggles, and statistical benchmarks on adolescent anxiety." },
  { time: "0:15 - 0:50", title: "Decoding the Signals (Body & Mirror)", desc: "Biological hormones vs attitude, and a live audit of what a 12-year-old's Instagram feed is teaching her." },
  { time: "0:50 - 1:15", title: "The Mood Signal & Script Demo", desc: "Differentiating anxiety/depression, the 2-week rule, and a live role-play of exact scripts parents can use." },
  { time: "1:15 - 1:30", title: "Offer Bridge & Q&A Session", desc: "Introducing the full Grade curriculum, giving cohort bonuses, and addressing parental questions live." }
];

const AGENDA_LIST = [
  // Left side (right-aligned)
  {
    time: "0:00 - 0:15",
    title: "Welcome & Check-In",
    desc: "Setting expectations, statistics on modern parent-daughter disconnects, and a quick live poll.",
    icon: <Users size={20} strokeWidth={2.5} />,
    color: "rgba(74, 30, 127, 0.08)",
    textColor: "text-primary"
  },
  {
    time: "0:15 - 0:50",
    title: "Hormones vs Attitude",
    desc: "A scientific dive into adolescent neurobiology, puberty transitions, and hormonal changes.",
    icon: <Brain size={20} strokeWidth={2.5} />,
    color: "rgba(224, 83, 151, 0.08)",
    textColor: "text-rose-500"
  },
  {
    time: "0:50 - 1:15",
    title: "The 2-Week Warning Rule",
    desc: "A clinical diagnostic checklist to track persistent mood patterns versus routine mood swings.",
    icon: <CalendarCheck size={20} strokeWidth={2.5} />,
    color: "rgba(37, 99, 235, 0.08)",
    textColor: "text-blue-500"
  },
  // Right side (left-aligned)
  {
    time: "1:15 - 1:30",
    title: "Live Role-Play & Script Demo",
    desc: "Hands-on walkthrough of exact phrases to react when she shuts you out or slams her door.",
    icon: <MessageCircle size={20} strokeWidth={2.5} />,
    color: "rgba(224, 83, 151, 0.08)",
    textColor: "text-rose-500"
  },
  {
    time: "1:30 - 1:40",
    title: "What NOT to Say Checklist",
    desc: "Common conversational errors (dismissiveness, over-advising) that accidentally sever trust.",
    icon: <MessageSquareX size={20} strokeWidth={2.5} />,
    color: "rgba(16, 185, 129, 0.08)",
    textColor: "text-emerald-500"
  },
  {
    time: "1:40 - 1:45",
    title: "Live Q&A & Case Audits",
    desc: "Ask the child psychologists anything about your specific daughter's challenges.",
    icon: <Quote size={20} strokeWidth={2.5} />,
    color: "rgba(37, 99, 235, 0.08)",
    textColor: "text-blue-500"
  }
];

const EXPERT_MENTORS = [
  {
    name: "Shipra Chawla",
    role: "Soft Skills Trainer & Communication Coach",
    desc: "I am committed to empowering young minds with the confidence and voice they need to thrive. Through my work with Infano Care, I guide adolescent girls to build strong communication skills, emotional awareness, and essential life skills that protect their mental health and overall well-being.",
    achievement: "15+ Years Experience | 1,500+ Students Trained",
    avatar: "/uploads/assets/shipra.png",
    seed: "shipra",
    borderColor: "border-[#b8d5f2] hover:border-blue-400/50",
    shadowColor: "shadow-[0_12px_30px_rgba(184,213,242,0.45)] hover:shadow-[0_20px_40px_rgba(184,213,242,0.7)]"
  },
  {
    name: "Ms. Gazal Luthra",
    role: "Counselling Psychologist & Psychotherapist",
    desc: "I support adolescent girls in navigating and understanding their emotions during one of the most critical stages of their development. I provide a safe space where your daughters can express themselves openly, giving them practical coping strategies to build lasting self-confidence, emotional resilience, and mental wellness.",
    achievement: "Recognized by the India Book of Records (2020) for leading the longest-running virtual event on mental health.",
    avatar: "/uploads/assets/gazal.png",
    seed: "gazal",
    borderColor: "border-[#e3a8bd]/80 hover:border-rose-400/50",
    shadowColor: "shadow-[0_12px_30px_rgba(227,168,189,0.45)] hover:shadow-[0_20px_40px_rgba(227,168,189,0.7)]"
  },
  {
    name: "Dr. Neha Sharma",
    role: "Adolescent Psychiatrist",
    desc: "MD in Psychiatry with 10+ years specializing in teen mood dynamics, clinical anxiety management, and parent mediation.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha",
    seed: "neha"
  },
  {
    name: "Priya Nair",
    role: "Teen Life Coach & Counselor",
    desc: "Certified Life Coach with 7+ years of experience helping girls build self-esteem, body positivity, and digital boundaries.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    seed: "priya"
  },
  {
    name: "Dr. Amit Kapoor",
    role: "Pediatric Endocrinologist",
    desc: "Expert in hormonal growth and endocrine health, guiding parents through biological transitions with scientific clarity.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
    seed: "amit"
  }
];

interface WebinarDetailClientProps {
  initialWebinar: Webinar | null;
  slug: string;
}

export function WebinarDetailClient({ initialWebinar, slug }: WebinarDetailClientProps) {
  const router = useRouter();

  const [webinar, setWebinar] = useState<Webinar | null>(initialWebinar);
  const [loading, setLoading] = useState(!initialWebinar);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const formatTotalTimeLeft = () => {
    if (!timeLeft) return '00h : 00m';
    const { days, hours, minutes } = timeLeft;
    const totalHours = days * 24 + hours;
    return `${totalHours}h : ${String(minutes).padStart(2, '0')}m`;
  };

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!webinar?.date) return;

    const calculateTimeLeft = () => {
      const loopDurationMs = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
      const difference = loopDurationMs - (new Date().getTime() % loopDurationMs);
      return {
        days: 0,
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [webinar?.date]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    ShopService.getWebinarBySlug(slug)
      .then((data) => {
        if (slug === 'active' && data && data.slug) {
          router.replace(`/webinar/${data.slug}`);
          return;
        }
        setWebinar(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.message === 'Webinar not found') {
          console.warn(`Webinar not found for slug: ${slug}`);
        } else {
          console.error(err);
        }
        setError('Webinar not found or scheduled details are unavailable.');
        setLoading(false);
      });
  }, [slug, router]);

  useEffect(() => {
    const handleOpen = () => setModalOpen(true);
    window.addEventListener('open-webinar-registration', handleOpen);
    return () => window.removeEventListener('open-webinar-registration', handleOpen);
  }, []);


  useEffect(() => {
    if (loading || typeof window === 'undefined') return;

    const handleScroll = () => {
      setShowStickyCta(window.scrollY > 400);

      if (window.innerWidth < 1024) return;

      const cards = document.querySelectorAll('[data-section-2-card]');
      if (!cards.length) return;

      const viewportCenter = window.innerHeight / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;

      cards.forEach((card, idx) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distance = Math.abs(cardCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = idx;
        }
      });

      setActiveIndex(closestIndex);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [loading]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  const formatWebinarDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' });
    const day = parseInt(date.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'Asia/Kolkata' }));
    const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'Asia/Kolkata' });
    return `${weekday}, ${day}${getOrdinalSuffix(day)} ${month}`;
  };

  const formatWebinarTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const timeParts = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
    const [time, ampm] = timeParts.split(' ');
    const [hour, minute] = time.split(':');
    const formattedAmpm = ampm.toLowerCase();

    if (minute === '00') {
      return `${hour} ${formattedAmpm} (IST)`;
    }
    return `${hour}:${minute} ${formattedAmpm} (IST)`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="mt-4 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Loading webinar details...</p>
      </div>
    );
  }

  if (error || !webinar) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-4">
          <AlertCircle size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 font-heading">Webinar Not Found</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">{error || "This webinar cohort could not be found."}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 transition-opacity"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-clip relative">
      {/* HERO WRAPPER WITH BACKGROUND */}
      <div className="bg-[#FAF7F5] relative pt-24 pb-20 md:pb-28 border-b border-slate-100/60">
        {/* Background radial glow */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-200/20 rounded-full blur-[130px]" />
          <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-rose-200/15 rounded-full blur-[130px]" />
        </div>

        <div className="relative z-10 max-w-360 mx-auto px-6 md:px-12 lg:px-24">

          {/* HERO SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Column: Copy & Badges */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
                style={{ animationDelay: '50ms' }}
              >
                <Sparkles size={11} className="text-primary animate-pulse" />
                <span>Exclusive Live Parent Masterclass</span>
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-[3.5rem] lg:leading-[1.12] font-bold font-heading text-slate-900 tracking-tight animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
                style={{ animationDelay: '150ms' }}
              >
                {webinar.title
                  ? (() => {
                    const target = "Her Silence";
                    const idx = webinar.title.toLowerCase().indexOf(target.toLowerCase());
                    if (idx !== -1) {
                      const before = webinar.title.substring(0, idx);
                      const matched = webinar.title.substring(idx, idx + target.length);
                      const after = webinar.title.substring(idx + target.length);
                      return (
                        <>
                          <span>{before}</span>
                          <span className="text-[#E05397]">{matched}</span>
                          <span>{after}</span>
                        </>
                      );
                    }
                    return <span>{webinar.title}</span>;
                  })()
                  : webinar.title
                }
              </h1>

              <p
                className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed max-w-xl animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
                style={{ animationDelay: '250ms' }}
              >
                {webinar.description}
              </p>

              {/* Sub-features list */}
              <div
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
                style={{ animationDelay: '350ms' }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
                    <Brain size={14} />
                  </div>
                  <span className="text-xs sm:text-[13px] font-semibold text-slate-600 leading-snug">Understand the unspoken emotions</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
                    <Heart size={14} />
                  </div>
                  <span className="text-xs sm:text-[13px] font-semibold text-slate-600 leading-snug">Build trust & stronger connection</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
                    <ShieldCheck size={14} />
                  </div>
                  <span className="text-xs sm:text-[13px] font-semibold text-slate-600 leading-snug">Practical strategies you can start today</span>
                </div>
              </div>

              {/* Quick Info Capsule block */}
              <div
                className="bg-white rounded-[2rem] border border-slate-100 shadow-premium py-4 px-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 gap-4 sm:gap-0 max-w-2xl items-center animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
                style={{ animationDelay: '450ms' }}
              >
                <div className="flex items-center gap-3 sm:justify-center py-2 sm:py-0">
                  <Calendar size={16} className="text-primary shrink-0" />
                  <span className="text-xs font-bold text-slate-700 tracking-tight">{formatWebinarDate(webinar.date)}</span>
                </div>
                <div className="flex items-center gap-3 sm:justify-center py-2 sm:py-0 sm:px-2">
                  <Clock size={16} className="text-primary shrink-0" />
                  <span className="text-xs font-bold text-slate-700 tracking-tight">{formatWebinarTime(webinar.date)}</span>
                </div>
                <div className="flex items-center gap-3 sm:justify-center py-2 sm:py-0 sm:px-2">
                  <Video size={16} className="text-primary shrink-0" />
                  <span className="text-xs font-bold text-slate-700 tracking-tight">
                    {webinar.mode === 'ONLINE' ? 'Live on Zoom' : (webinar.link || 'In-Person Venue')}
                  </span>
                </div>
              </div>

              {/* CTA Action button & Countdown */}
              <div
                className="flex flex-col sm:flex-row sm:items-center gap-6 pt-4 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
                style={{ animationDelay: '550ms' }}
              >
                <div className="flex flex-col items-start gap-2.5">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 group cursor-pointer border-none"
                  >
                    <span>Reserve My Seat — ₹{webinar.price}/-</span>
                    <ArrowRight className="transition-transform group-hover:translate-x-1" size={16} />
                  </button>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1.5 ml-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>Limited Seats Remaining for this Cohort</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: Visual illustration */}
            <div className="lg:col-span-5 relative">
              <div className="relative w-full max-w-105 lg:max-w-none mx-auto aspect-[1.1] sm:aspect-square flex items-center justify-center">
                {/* Decorative blobs */}
                <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-accent/5 rounded-[3rem] -rotate-3 scale-95" />

                {/* Photo Frame */}
                <div className="relative w-[92%] h-[92%] rounded-[2.5rem] overflow-hidden border border-white shadow-md bg-white">
                  <img
                    src={getImageUrl('/uploads/assets/s1-heroimage.png')}
                    alt="Mother and Daughter sharing a warm bond"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating quotes card */}
                <div className="absolute bottom-4 -left-5 sm:-left-7.5 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-sm max-w-65 sm:max-w-70 transition-all hover:scale-102">
                  <p className="text-[11px] font-semibold text-slate-600 leading-normal">
                    Because every girl deserves to be heard,
                  </p>
                  <p className="text-2xl font-semibold text-pink-500 leading-none font-caveat tracking-wide mt-1">
                    understood & supported.
                  </p>
                  <div className="absolute right-3 bottom-3 text-pink-500/20">
                    <Heart size={20} fill="currentColor" />
                  </div>
                </div>

                {/* Floating social proof badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    <img className="h-5 w-5 rounded-full ring-2 ring-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=parent1" alt="" />
                    <img className="h-5 w-5 rounded-full ring-2 ring-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=parent2" alt="" />
                    <img className="h-5 w-5 rounded-full ring-2 ring-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=parent3" alt="" />
                  </div>
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">10K+ Parents</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Overlapping Trust Badges Capsule */}
      <div className="relative z-20 max-w-360 mx-auto px-6 md:px-12 lg:px-24 -mt-12 md:-mt-16 mb-16 md:mb-24">
        {/* BOTTOM ROW: TRUST BADGES (Capsule Style) */}
        <div className="bg-white rounded-none border border-slate-200 shadow-sm py-8 px-6 grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 gap-4 sm:gap-0 max-w-6xl mx-auto items-center text-center">
          <div className="flex flex-col items-center justify-center py-2 sm:py-0">
            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-2">
              <ShieldCheck size={18} />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wider">Secure & Private</span>
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase mt-1">Your stories are safe</span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 sm:py-0 sm:px-4">
            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-2">
              <Users size={18} />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wider">For Parents Like You</span>
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase mt-1">Grades 5 to 9</span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 sm:py-0 sm:px-4">
            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-2">
              <Award size={18} />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wider">Bonus Resources</span>
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase mt-1">Included guides & PDFs</span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 sm:py-0 sm:px-4">
            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-2">
              <MessageCircle size={18} />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wider">Live Q&A Session</span>
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase mt-1">Direct interact live</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-360 mx-auto px-6 md:px-12 lg:px-24">

        {/* SECTION 2: THE PROBLEM (AGITATION) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative pt-0 pb-16 md:pb-24 mb-0"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-3xl -z-10" />

          {/* Centered Heart Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
              <Heart size={18} />
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading text-slate-900 tracking-tight">
              <span>Does this sound </span><span className="text-primary">familiar?</span>
            </h3>
            <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed">
              Adolescence isn't just hard on girls—it's incredibly tough for parents trying to navigate it.
            </p>
          </div>

          {/* 3 cards in a line: image with text like card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {PROBLEM_POINTS.map((point, idx) => {
              const config = [
                {
                  iconBg: 'bg-primary/5 text-primary',
                  badgeBg: 'bg-primary text-white',
                  icon: <DoorClosed size={18} />
                },
                {
                  iconBg: 'bg-accent/5 text-accent',
                  badgeBg: 'bg-accent text-white',
                  icon: <Brain size={18} />
                },
                {
                  iconBg: 'bg-primary-light/5 text-primary-light',
                  badgeBg: 'bg-primary-light text-white',
                  icon: <Smartphone size={18} />
                }
              ][idx];

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group flex flex-col items-start text-left min-h-90"
                >
                  {/* Card Image */}
                  <div className="w-full h-40 rounded-2xl overflow-hidden mb-5 border border-slate-100 shadow-sm relative">
                    <img
                      src={[
                        getImageUrl('/uploads/assets/s2-1st.png'),
                        getImageUrl('/uploads/assets/s2-2nd.png'),
                        getImageUrl('/uploads/assets/s3-3rd.png')
                      ][idx]}
                      alt={point.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-slate-900/60 backdrop-blur-sm flex items-center justify-center text-white text-[10px] font-bold">
                      {idx + 1}
                    </div>
                  </div>

                  {/* Icon & Title Row */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-full ${config.iconBg} flex items-center justify-center shrink-0`}>
                      {config.icon}
                    </div>
                    <h4 className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight group-hover:text-primary transition-colors">
                      {point.title}
                    </h4>
                  </div>

                  <div className={`w-10 h-0.5 ${idx === 0 ? 'bg-primary' : idx === 1 ? 'bg-accent' : 'bg-primary-light'} rounded-full mb-3`} />
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
                    {point.desc}
                  </p>
                  <div className="absolute -bottom-6 -right-6 w-14 h-14 rounded-full bg-slate-50 group-hover:bg-primary/5 transition-colors -z-10" />
                </motion.div>
              );
            })}
          </div>

          {/* Redesigned bottom rose banner */}
          <div className="flex justify-center mt-6">
            <div className="rounded-2xl bg-rose-50 border border-rose-100 py-3.5 px-6 flex items-center justify-center gap-3 max-w-4xl w-auto">
              <Heart className="text-rose-500 shrink-0 fill-rose-500 animate-pulse" size={16} />
              <p className="text-rose-700 font-medium text-xs sm:text-sm text-center leading-relaxed">
                "Is it just a phase, or is something deeper wrong? Most parents don't find out until months later."
              </p>
            </div>
          </div>
        </motion.div>

      </div>

      {/* REASSURANCE & PROMISE BANNER - Light Blue full-width background */}
      <section className="w-full bg-[#F0F7FF] border-y border-blue-100/50 pt-6 pb-12 md:pt-16 md:pb-20 lg:pt-20 lg:pb-20 lg:min-h-[460px] relative overflow-hidden">
        {/* Soft background blurs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-purple-200/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] bg-blue-200/25 rounded-full blur-[120px] pointer-events-none" />

        {/* Absolute positioned image for desktop - sticks to the bottom of the section */}
        <img
          src={getImageUrl('/uploads/assets/banner.png')}
          alt="Meet Your Guides: Shipra and Ghazal"
          className="hidden lg:block absolute bottom-0 right-[2%] lg:right-[5%] xl:right-[8%] h-[95%] max-h-[420px] w-auto object-contain object-bottom pointer-events-none z-10 animate-in zoom-in-95 duration-500"
        />

        <div className="relative z-10 max-w-360 mx-auto px-6 md:px-12 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
          >

            {/* Mobile-only image container */}
            <div className="lg:hidden col-span-12 order-1 flex justify-center">
              <img
                src={getImageUrl('/uploads/assets/banner.png')}
                alt="Meet Your Guides: Shipra and Ghazal"
                className="w-full max-w-[280px] h-auto object-contain"
              />
            </div>

            {/* Spacer on desktop to reserve space for absolute image */}
            <div className="hidden lg:block lg:col-span-5 order-2" />

            {/* Copy column on left on desktop, bottom on mobile */}
            <div className="lg:col-span-7 order-2 lg:order-1 text-left space-y-6">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest block">
                Meet Your Guides: Shipra and Ghazal
              </span>
              <div className="relative pl-8 py-2 border-l-4 border-primary/25">
                <Quote size={20} className="absolute top-0 left-2 text-primary/30 transform rotate-180" />
                <h3 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-slate-800 leading-tight italic">
                  You&apos;re not failing at this. No one ever taught you how to read what&apos;s underneath.
                  <Quote size={20} className="text-primary/30 inline-block align-top ml-1.5" />
                </h3>
              </div>
              <p className="text-slate-500 text-sm md:text-base font-normal leading-relaxed">
                Our Promise: Learn the <span className="text-slate-900 font-semibold">3 Silent Signals</span> every daughter sends — and the <span className="text-slate-900 font-semibold">exact words to say back</span> — before a phase becomes a crisis.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setModalOpen(true)}
                  className="w-full sm:w-auto px-10 py-4 bg-primary text-white font-extrabold text-xs md:text-sm rounded-full shadow-lg hover:shadow-xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
                >
                  <span>Secure Your Spot</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Remaining sections container */}
      <div className="relative z-10 max-w-360 mx-auto px-6 md:px-12 lg:px-24 pt-12 pb-2 md:pt-20 md:pb-4">

        {/* SECTION 3: WHAT YOU WILL LEARN */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16 md:mb-24"
        >

          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Course Roadmap</span>
            </div>

            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading text-slate-900 tracking-tight">
              <span>What You Will Learn in this </span><span className="text-primary">90-Minute Masterclass</span>
            </h3>

            <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed max-w-lg">
              We sell hope, not just raw biology information. You will leave with a clear, decodable framework to handle your relationship with your daughter.
            </p>

            <div className="pt-2 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0 shadow-sm">
                  <CheckCircle2 size={14} className="stroke-[2.5]" />
                </div>
                <span className="text-slate-655 text-sm font-semibold">1:1 Free Consultation Call included</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0 shadow-sm">
                  <CheckCircle2 size={14} className="stroke-[2.5]" />
                </div>
                <span className="text-slate-655 text-sm font-semibold">Printable PDF Decision Card</span>
              </div>
            </div>
          </div>

          {/* Right Column: Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {LEARN_POINTS.map((point, idx) => {
              const cardConfig = [
                {
                  bgColor: 'bg-[#FAF8FD]',
                  borderColor: ' border-purple-300/80',
                  hoverShadow: 'hover:shadow-[0_15px_30px_-5px_rgba(74,30,127,0.12)]',
                  iconBg: 'bg-purple-50 border border-purple-100/40 text-purple-600',
                  pillBarColor: 'bg-purple-600',
                  icon: <Globe size={20} strokeWidth={1.5} />
                },
                {
                  bgColor: 'bg-[#FFF9F9]',
                  borderColor: ' border-rose-300/80',
                  hoverShadow: 'hover:shadow-[0_15px_30px_-5px_rgba(224,83,151,0.12)]',
                  iconBg: 'bg-rose-50 border border-rose-100/40 text-rose-500',
                  pillBarColor: 'bg-[#E05397]',
                  icon: <FileText size={20} strokeWidth={1.5} />
                },
                {
                  bgColor: 'bg-[#F7FAFC]',
                  borderColor: ' border-blue-300/80',
                  hoverShadow: 'hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.12)]',
                  iconBg: 'bg-blue-50 border border-blue-100/40 text-blue-600',
                  pillBarColor: 'bg-blue-600',
                  icon: <CalendarCheck size={20} strokeWidth={1.5} />
                },
                {
                  bgColor: 'bg-[#F8FDF9]',
                  borderColor: ' border-emerald-300/80',
                  hoverShadow: 'hover:shadow-[0_15px_30px_-5px_rgba(16,185,129,0.12)]',
                  iconBg: 'bg-emerald-50 border border-emerald-100/40 text-emerald-600',
                  pillBarColor: 'bg-emerald-600',
                  icon: <MessageSquareX size={20} strokeWidth={1.5} />
                }
              ][idx];

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: idx * 0.12 + 0.15 }}
                  className={`p-6 md:p-7 ${cardConfig.bgColor} border ${cardConfig.borderColor} ${cardConfig.hoverShadow} rounded-[2rem]  hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-start text-left gap-4 group`}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-2xl ${cardConfig.iconBg} flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105`}>
                    {cardConfig.icon}
                  </div>

                  {/* Header Title with vertical pill bar */}
                  <div className="flex items-start gap-2.5">
                    <span className={`w-1.5 h-5 ${cardConfig.pillBarColor} rounded-full shrink-0 mt-0.5`} />
                    <h4 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight leading-tight font-heading">
                      {point.title}
                    </h4>
                  </div>

                  {/* Description */}
                  <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                    {point.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </motion.div>
      </div>

      {/* SECTION 3.5: WHO THIS IS FOR */}
      <section className="w-full bg-[#FAF7F5] border-y border-slate-100/60 pt-16 pb-20 md:pt-24 md:pb-28 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-purple-200/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-rose-200/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-360 mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center max-w-3xl mx-auto space-y-5 mb-14">
            <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
              <span>Who This Is For</span>
            </div>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading text-slate-900 tracking-tight">
              Is This Masterclass <span className="text-primary">For You?</span>
            </h3>
            <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
              If you are raising a daughter in Grades 5 to 10 or aged between 10 to 16, you already know how fast things change. This masterclass is specifically designed for you if:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 rounded-[2rem] bg-[#FAF8FD] border border-purple-300/80 hover:shadow-[0_15px_30px_-5px_rgba(74,30,127,0.12)] transition-all duration-300 relative overflow-hidden group flex flex-col items-start text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100/40 flex items-center justify-center shrink-0 mb-6 text-purple-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <Activity size={24} strokeWidth={2} />
              </div>
              <h4 className="text-lg font-bold text-slate-800 tracking-tight mb-3 font-heading">
                You've noticed a shift
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Her mood, screen habits, or willingness to talk has changed over the last year.
              </p>
              <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-purple-600/5 transition-colors -z-10" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 rounded-[2rem] bg-[#FFF9F9] border border-rose-300/80 hover:shadow-[0_15px_30px_-5px_rgba(224,83,151,0.12)] transition-all duration-300 relative overflow-hidden group flex flex-col items-start text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100/40 flex items-center justify-center shrink-0 mb-6 text-rose-500 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <Users size={24} strokeWidth={2} />
              </div>
              <h4 className="text-lg font-bold text-slate-800 tracking-tight mb-3 font-heading">
                You feel the distance
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Whether she is just starting to change, right in the thick of it, or you feel like you've already lost the thread of the conversation.
              </p>
              <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-rose-500/5 transition-colors -z-10" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-8 rounded-[2rem] bg-[#F7FAFC] border border-blue-300/80 hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.12)] transition-all duration-300 relative overflow-hidden group flex flex-col items-start text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100/40 flex items-center justify-center shrink-0 mb-6 text-blue-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <Target size={24} strokeWidth={2} />
              </div>
              <h4 className="text-lg font-bold text-slate-800 tracking-tight mb-3 font-heading">
                You want a strategy
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                You are tired of second-guessing yourself and want a concrete plan instead of daily guesswork.
              </p>
              <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-blue-600/5 transition-colors -z-10" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-14 flex flex-col items-center text-center"
          >
            <p className="text-slate-700 text-base sm:text-lg font-semibold mb-8 max-w-2xl">
              No matter where you are in the journey, you don't have to navigate it blindly.
            </p>

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setModalOpen(true)}
                className="px-10 py-4 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer border-none"
              >
                <span>Reserve My Spot Now</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Join thousands of parents building stronger bonds.</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: AGENDA AT A GLANCE */}
      <section className="w-full bg-[#ffffff] border-y border-slate-100/60 pt-6 pb-12 md:pt-8 md:pb-16 relative overflow-hidden">
        <div className="relative z-10 max-w-360 mx-auto px-6 md:px-12 lg:px-24">

          <div className="text-center max-w-2xl mx-auto space-y-4 mb-14 relative z-10">
            <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
              <span>Run of Show</span>
            </div>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading text-slate-900 tracking-tight">
              <span>Agenda </span><span className="text-primary">at a Glance</span>
            </h3>
            <p className="text-slate-500 text-sm sm:text-base font-medium max-w-md mx-auto leading-relaxed">
              90 minutes designed to give you maximum clarity and actionable steps.
            </p>
          </div>

          {/* Desktop 3-column view */}
          <div className="hidden lg:grid grid-cols-12 gap-8 items-center relative z-10 max-w-7xl mx-auto px-4">

            {/* Left Column - 3 points (right-aligned) */}
            <div className="col-span-4 flex flex-col gap-6">
              {AGENDA_LIST.slice(0, 3).map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: idx * 0.15 + 0.1 }}
                  className="bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(74,30,127,0.05)] hover:shadow-[0_15px_30px_-5px_rgba(74,30,127,0.06)] rounded-3xl p-6 flex items-center justify-end transition-all duration-300 hover:-translate-y-0.5 group text-right"
                >
                  <div className="mr-5">
                    <h4 className="text-sm sm:text-base md:text-lg font-semibold text-slate-800 tracking-tight font-heading group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-extrabold uppercase tracking-wide mt-0.5">
                      {item.time}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mt-1.5 max-w-[320px]">
                      {item.desc}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105 ${item.textColor}`}
                    style={{ backgroundColor: item.color }}
                  >
                    {item.icon}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Center Column - Image illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
              className="col-span-4 flex justify-center"
            >
              <div className="relative w-full max-w-85 aspect-3/4 rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl bg-linear-to-b from-purple-50 to-rose-50">
                <img
                  src={getImageUrl('/uploads/assets/glance.png')}
                  alt="Agenda Insights"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-purple-950/20 to-transparent pointer-events-none" />
              </div>
            </motion.div>

            {/* Right Column - 3 points (left-aligned) */}
            <div className="col-span-4 flex flex-col gap-6">
              {AGENDA_LIST.slice(3, 6).map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: idx * 0.15 + 0.7 }}
                  className="bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(74,30,127,0.05)] hover:shadow-[0_15px_30px_-5px_rgba(74,30,127,0.06)] rounded-3xl p-6 flex items-center justify-start transition-all duration-300 hover:-translate-y-0.5 group text-left"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105 mr-5 ${item.textColor}`}
                    style={{ backgroundColor: item.color }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base md:text-lg font-semibold text-slate-800 tracking-tight font-heading group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-extrabold uppercase tracking-wide mt-0.5">
                      {item.time}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mt-1.5 max-w-[320px]">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>

          {/* Mobile responsive view (below lg) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex lg:hidden flex-col gap-8 px-6"
          >
            {/* Center Image */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-70 aspect-4/5 rounded-3xl overflow-hidden border border-slate-100 shadow-md">
                <img
                  src={getImageUrl('/uploads/assets/glance.png')}
                  alt="Agenda Insights"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* List of all points stacked */}
            <div className="flex flex-col gap-4">
              {AGENDA_LIST.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex items-center gap-4 text-left"
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.textColor}`}
                    style={{ backgroundColor: item.color }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight font-heading">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-0.5">
                      {item.time}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-550 leading-relaxed font-semibold mt-1">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Remaining sections container */}
      <div className="relative z-10 max-w-360 mx-auto px-6 md:px-12 lg:px-24 py-12 md:py-20">

        {/* SECTION 5: MEET YOUR TRAINERS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-360 mx-auto mb-16 md:mb-24 relative"
        >
          <div className="space-y-3 mb-10 max-w-4xl mx-auto px-6">
            <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
              <span>Your Guides</span>
            </div>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading text-slate-900 tracking-tight">
              <span>Meet Your </span><span className="text-primary">Expert Mentors</span>
            </h3>
            <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed">Lived experts specializing in adolescent psychology and girls' developmental health.</p>
          </div>

          {/* Grid of exactly 2 expert cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto px-6">
            {EXPERT_MENTORS.slice(0, 2).map((expert, idx) => (
              <div
                key={idx}
                className={`bg-white border ${expert.borderColor || 'border-slate-200/90'} ${expert.shadowColor || 'shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(74,30,127,0.12)] hover:border-slate-300'} hover:-translate-y-1.5 transition-all duration-300 rounded-[2rem] text-left flex flex-col group relative overflow-hidden`}
              >
                {/* Subtle background glow on hover */}
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">
                  {/* Image wrapper spanning full width at top */}
                  <div className="w-full h-64 sm:h-80 bg-primary/5 relative overflow-hidden border-b border-primary/5">
                    <img
                      src={getImageUrl(expert.avatar)}
                      alt={expert.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.seed}`;
                      }}
                    />
                    {/* Infano Care Expert Overlaid Pill */}
                    <span className="absolute top-4 right-4 z-20 inline-flex px-3 py-1 rounded-full bg-emerald-500 text-white border border-emerald-400/20 text-[10px] font-bold tracking-wider shadow-sm select-none animate-in fade-in duration-300">
                      Infano Care Expert
                    </span>
                  </div>

                  {/* Text content with padding */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col">
                    <h4 className="text-lg font-bold text-slate-800 font-heading tracking-tight group-hover:text-primary transition-colors duration-300">{expert.name}</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black tracking-wider">
                        {expert.role}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-normal mt-4">
                      "{expert.desc}"
                    </p>
                    {expert.achievement && (
                      <div className="mt-5 pt-4 border-t border-slate-100/80">
                        <span className="text-[9px] font-black tracking-widest text-slate-400 block mb-1.5">Key Achievements</span>
                        <p className="text-slate-700 text-xs sm:text-sm font-semibold italic flex items-start gap-1.5">
                          <span className="shrink-0">🏆</span>
                          <span>{expert.achievement}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* SECTION 7: SOCIAL PROOF / TESTIMONIALS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-16 md:mb-24 overflow-hidden relative"
        >
          <div className="max-w-360 mx-auto px-6 mb-8 text-center">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4">Real Stories</span>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading text-slate-900 tracking-tight mb-4">
              Hear From <span className="text-primary">Other Parents</span>
            </h3>
            <div className="flex items-center justify-center gap-1 text-amber-500 text-xs font-bold mt-4">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              <span className="text-slate-500 font-bold ml-1">5.0 Average Rating (500+ Attendees)</span>
            </div>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-6 sm:px-12 pb-12 max-w-360 mx-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-4">
            {[
              {
                quote: "When my Class 7 daughter started shutting me out, I didn't know what to do. Using their exact phrases, she finally opened up about her school stress. Truly a lifesaver for disconnected parents!",
                author: "Ananya Sharma",
                role: "Mother, New Delhi",
                icon: <MessageCircle size={32} />,
                colorClass: "text-purple-600 bg-purple-100",
                gradientBorder: "from-indigo-100 via-purple-300 to-fuchsia-100"
              },
              {
                quote: "Navigating my Class 6 daughter's changing moods felt impossible. This masterclass gave me practical scripts to handle high-tension moments calmly. She actually opened up during our next talk instead of shutting down!",
                author: "Rajesh Nair",
                role: "Father, Bengaluru",
                icon: <MessageCircle size={32} />,
                colorClass: "text-emerald-500 bg-emerald-100",
                gradientBorder: "from-emerald-100 via-emerald-300 to-teal-100"
              },
              {
                quote: "My Class 8 daughter's mood swings had us walking on eggshells. Their script for emotional outbursts worked like magic—we finally had a calm, honest conversation for the first time in months.",
                author: "Meera Kulkarni",
                role: "Mother, Pune",
                icon: <Users size={32} />,
                colorClass: "text-rose-500 bg-rose-100",
                gradientBorder: "from-rose-100 via-orange-300 to-rose-200"
              }
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="shrink-0 w-[85vw] sm:w-[400px] snap-center bg-white rounded-[2rem] p-8 md:p-10 relative flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 overflow-hidden group hover:-translate-y-1 transition-all duration-300"
              >
                {/* Bottom Gradient Border */}
                <div className={`absolute bottom-0 left-0 h-1.5 w-full bg-linear-to-r ${testimonial.gradientBorder}`} />

                {/* Top Quotes */}
                <Quote className="absolute top-8 right-8 text-primary/5 rotate-180" size={80} strokeWidth={0.5} />

                {/* Large Icon */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-8 relative z-10 ${testimonial.colorClass}`}>
                  {testimonial.icon}
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 text-amber-400 text-sm mb-6 relative z-10 bg-amber-50 w-max px-3 py-1.5 rounded-lg">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>

                {/* Quote text */}
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-8 relative z-10 flex-1">
                  "{testimonial.quote}"
                </p>

                {/* Divider & Author */}
                <div className="pt-6 border-t border-slate-100 mt-auto relative z-10 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${testimonial.colorClass} opacity-80`}>
                    <Users size={20} />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-900">{testimonial.author}</h5>
                    <p className="text-xs font-semibold text-primary mt-1">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* SECTION 7.5: VALUE STACK */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto mb-16 md:mb-24"
        >
          <div className="bg-[#FAF8FD] rounded-[2rem] border border-purple-200 shadow-xl overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

            <div className="p-8 md:p-12 relative z-10 text-center">
              <div className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6">
                <span>Value Stack</span>
              </div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading text-slate-900 tracking-tight mb-4">
                Everything You Get Today <span className="text-primary">For Just ₹{webinar ? webinar.price : 99}</span>
              </h3>
              <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto mb-8">
                Here is exactly what is included in your ticket, stacked with tools and resources to help you support your daughter:
              </p>

              <div className="bg-white rounded-2xl border border-purple-100 p-6 md:p-8 max-w-3xl mx-auto mb-8 text-left shadow-sm">
                <ul className="space-y-5">
                  <li className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-800">90-Minute LIVE Masterclass</h4>
                      <p className="text-sm text-slate-500 mt-1">Directly with child psychologists and experts.</p>
                    </div>
                    <div className="ml-auto text-base font-bold text-slate-400 line-through shrink-0">₹1,999</div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-800">The 3 Silent Signals Framework PDF</h4>
                      <p className="text-sm text-slate-500 mt-1">Printable cheat sheet for quick reference.</p>
                    </div>
                    <div className="ml-auto text-base font-bold text-slate-400 line-through shrink-0">₹499</div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-800">Parent-Daughter Conversation Scripts</h4>
                      <p className="text-sm text-slate-500 mt-1">Exact words to say during tough moments.</p>
                    </div>
                    <div className="ml-auto text-base font-bold text-slate-400 line-through shrink-0">₹799</div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-800">1:1 Free Consultation Call</h4>
                      <p className="text-sm text-slate-500 mt-1">Personalized guidance after the masterclass.</p>
                    </div>
                    <div className="ml-auto text-base font-bold text-slate-400 line-through shrink-0">₹999</div>
                  </li>
                </ul>

                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-base font-bold text-slate-500">Total Value</div>
                  <div className="text-2xl font-bold text-rose-500 line-through decoration-rose-300">₹4,296</div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 bg-rose-50 px-6 py-2.5 rounded-full border border-rose-100">
                  <Sparkles size={16} className="text-rose-500 animate-pulse" />
                  <span className="text-sm font-bold text-slate-800">Your Price Today: <span className="text-rose-600 text-lg font-black ml-1">Only ₹{webinar ? webinar.price : 99}</span></span>
                </div>

                <button
                  onClick={() => setModalOpen(true)}
                  className="px-10 py-4 bg-primary text-white rounded-full font-bold text-sm md:text-base hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer border-none mt-2 w-full sm:w-auto"
                >
                  <span>Claim Your Ticket For ₹{webinar ? webinar.price : 99}</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SECTION 8: FAQ ACCORDION */}
        <div className="max-w-3xl mx-auto mb-16 md:mb-24 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4">FAQ</span>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                  className={`border rounded-[2rem] transition duration-300 overflow-hidden ${isOpen ? 'border-primary bg-primary/2 shadow-xl shadow-primary/5' : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                >
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left group"
                  >
                    <span className={`text-base sm:text-lg font-bold tracking-tight transition-colors duration-300 ${isOpen ? 'text-primary' : 'text-slate-900'}`}>
                      {faq.question}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition duration-300 ${isOpen ? 'bg-primary text-white rotate-180 shadow-lg shadow-primary/30' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                      }`}>
                      {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      >
                        <div className="px-8 pb-8 text-slate-500 font-medium leading-relaxed border-t border-primary/5 pt-6 mx-8">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* SECTION 9: FINAL CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-xl mx-auto p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-primary via-primary-light to-accent" />

          <h3 className="text-lg md:text-xl font-bold font-heading text-slate-900 mb-2">Reserve Your Webinar Pass</h3>
          <p className="text-slate-500 text-xs leading-relaxed font-medium mb-6">
            Get the decodable signals framework + 1:1 call bonus + private parents community access.
          </p>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-4 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer border-none"
            >
              <span>Reserve My Seat — ₹{webinar.price}/-</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold pt-1">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Passes are backed by a satisfaction refund policy.</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RENDER RESERVATION CHECKOUT MODAL */}
      <WebinarCheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        webinar={webinar}
      />

      {/* FLOATING STICKY CTA */}
      <AnimatePresence>
        {showStickyCta && (
          <motion.div
            initial={{ opacity: 0, y: 100, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 100, x: '-50%' }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-3 md:bottom-6 left-1/2 z-40 w-[95%] md:w-[92%] max-w-3xl bg-white/95 backdrop-blur-xl border border-rose-100 shadow-premium rounded-2xl md:rounded-full p-3 md:py-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6 pointer-events-auto"
          >
            {/* Top Row on Mobile, Left/Mid on Desktop: Timer & Scarcity */}
            <div className="flex items-center justify-between w-full md:w-auto gap-3 shrink-0">
              {/* Timer Wrapper */}
              <div className="flex flex-col items-center md:items-start gap-1">
                <span className="text-[9px] md:text-[10px] font-bold text-[#ff1f56] tracking-wide select-none leading-none">
                  for limited time
                </span>
                <div className="flex items-center gap-1.5 bg-[#ff1f56] rounded-full px-3 md:px-4 py-1 md:py-1.5 text-white shadow-md font-mono font-bold text-xs md:text-base">
                  <Clock size={14} className="animate-pulse text-white md:w-4 md:h-4" />
                  <span>{formatTotalTimeLeft()}</span>
                </div>
              </div>

              {/* Scarcity Text */}
              <div className="flex items-center gap-1.5 md:gap-2.5 shrink-0">
                <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-rose-500"></span>
                </span>
                <span className="text-xs md:text-base font-extrabold text-slate-700">
                  Only 9 seats left!
                </span>
              </div>
            </div>

            {/* Right: CTA Button */}
            <div className="w-full md:w-auto shrink-0">
              <button
                onClick={() => setModalOpen(true)}
                className="w-full md:w-auto px-6 md:px-8 py-2.5 md:py-3 bg-[#ff1f56] text-white font-extrabold text-sm md:text-base rounded-full shadow-lg shadow-[#ff1f56]/20 hover:shadow-xl hover:bg-[#e0144c] hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
              >
                <span>Reserve My Seat for ₹{webinar ? webinar.price : 99}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

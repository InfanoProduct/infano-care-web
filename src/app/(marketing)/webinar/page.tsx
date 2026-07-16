'use client';

import { useState } from 'react';
import { WebinarCheckoutModal } from '@/features/marketing/components/WebinarCheckoutModal';
import { 
  Sparkles, Calendar, Clock, Video, CheckCircle2, ChevronDown, 
  Users, MessageCircle, AlertCircle, Quote, ShieldCheck,
  Brain, Heart, ArrowRight, Award, DoorClosed, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function WebinarLandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background text-slate-900 overflow-x-hidden relative">
      {/* Background radial glow */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-5%] left-[-10%] w-[60%] h-[50%] bg-purple-200/30 rounded-full blur-[130px]" />
        <div className="absolute top-[35%] right-[-10%] w-[50%] h-[50%] bg-rose-200/20 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 py-12 md:py-20">
        
        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16 md:mb-24">
          
          {/* Left Column: Copy & Badges */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-wider animate-fade-in">
              <Sparkles size={12} className="text-primary animate-pulse" />
              <span>Exclusive Live Parent Masterclass</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] lg:leading-[1.12] font-bold font-heading text-slate-900 tracking-tight">
              Is She Really <span className="text-[#E05397]">"Fine"?</span> <br className="hidden sm:inline" />
              Decode Her <span className="text-primary">Silence.</span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base font-semibold leading-relaxed max-w-xl">
              What's really going on behind your daughter's mood swings, screen time & silence — and what to do about it.
            </p>

            {/* Sub-features list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
                  <Brain size={14} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 leading-tight">Understand the unspoken emotions</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
                  <Heart size={14} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 leading-tight">Build trust & stronger connection</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
                  <ShieldCheck size={14} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 leading-tight">Practical strategies you can start today</span>
              </div>
            </div>

            {/* Quick Info Capsule block */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-premium py-4 px-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 gap-4 sm:gap-0 max-w-2xl items-center">
              <div className="flex items-center gap-3 sm:justify-center py-2 sm:py-0">
                <Calendar size={16} className="text-primary shrink-0" />
                <span className="text-xs font-extrabold text-slate-800 tracking-tight">Saturday, July 25</span>
              </div>
              <div className="flex items-center gap-3 sm:justify-center py-2 sm:py-0 sm:px-2">
                <Clock size={16} className="text-primary shrink-0" />
                <span className="text-xs font-extrabold text-slate-800 tracking-tight">05:00 PM (IST)</span>
              </div>
              <div className="flex items-center gap-3 sm:justify-center py-2 sm:py-0 sm:px-2">
                <Video size={16} className="text-primary shrink-0" />
                <span className="text-xs font-extrabold text-slate-800 tracking-tight">Live on Zoom</span>
              </div>
            </div>

            {/* CTA Action button */}
            <div className="flex flex-col items-start gap-2.5 pt-4">
              <button
                onClick={() => setModalOpen(true)}
                className="btn-primary w-full sm:w-auto px-10 py-4 shadow-xl shadow-primary/25 text-sm uppercase tracking-wider font-extrabold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
              >
                <span>Reserve My Seat for ₹99</span>
                <ArrowRight className="transition-transform group-hover:translate-x-1" size={16} />
              </button>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 ml-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>Limited Seats Remaining for this Cohort</span>
              </div>
            </div>

          </div>

          {/* Right Column: Visual illustration */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full max-w-[420px] lg:max-w-none mx-auto aspect-[1.1] sm:aspect-square flex items-center justify-center">
              {/* Decorative blobs */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 rounded-[3rem] -rotate-3 scale-95" />
              
              {/* Photo Frame */}
              <div className="relative w-[92%] h-[92%] rounded-[2.5rem] overflow-hidden border border-white shadow-2xl bg-white">
                <img 
                  src="/webinar-hero.png" 
                  alt="Mother and Daughter sharing a warm bond"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating quotes card */}
              <div className="absolute bottom-4 left-[-20px] sm:left-[-30px] bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-xl max-w-[260px] sm:max-w-[280px] transition-all hover:scale-102">
                <p className="text-[11px] font-bold text-slate-600 leading-normal">
                  Because every girl deserves to be heard,
                </p>
                <p className="text-2xl font-bold text-pink-500 leading-none font-caveat tracking-wide mt-1">
                  understood & supported.
                </p>
                <div className="absolute right-3 bottom-3 text-pink-500/20">
                  <Heart size={20} fill="currentColor" />
                </div>
              </div>

              {/* Floating social proof badge */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-100 shadow-lg flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  <img className="h-5 w-5 rounded-full ring-2 ring-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=parent1" alt="" />
                  <img className="h-5 w-5 rounded-full ring-2 ring-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=parent2" alt="" />
                  <img className="h-5 w-5 rounded-full ring-2 ring-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=parent3" alt="" />
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">10K+ Parents</span>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM ROW: TRUST BADGES */}
        <div className="border-t border-slate-150 pt-10 mb-16 md:mb-24 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0 shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-800">Secure & Private</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Your stories are safe</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0 shadow-sm">
              <Users size={20} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-800">For Parents Like You</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Grades 5 to 9</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0 shadow-sm">
              <Award size={20} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-800">Bonus Resources</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Included guides & PDFs</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0 shadow-sm">
              <MessageCircle size={20} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-800">Live Q&A Session</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Direct interact live</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: THE PROBLEM (AGITATION) */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100/80 shadow-2xl p-8 md:p-12 mb-16 md:mb-24 relative overflow-hidden bg-gradient-to-b from-white to-[#FFFCFA]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-3xl -z-10" />
          
          {/* Centered Heart Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
              <Heart size={18} />
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 tracking-tight">
              <span>Does this sound </span><span className="text-[#E05397]">familiar?</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Adolescence isn't just hard on girls—it's incredibly tough for parents trying to navigate it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
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
                <div key={idx} className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group flex flex-col items-start text-left min-h-[220px]">
                  {/* Top row with icon & numbered badge */}
                  <div className="flex items-center justify-between w-full mb-5">
                    <div className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center shrink-0`}>
                      {config.icon}
                    </div>
                    <div className={`w-6 h-6 rounded-full ${config.badgeBg} flex items-center justify-center text-xs font-bold`}>
                      {idx + 1}
                    </div>
                  </div>
                  {/* Title, Bar & Description */}
                  <div className="mt-2 space-y-3">
                    <h4 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight group-hover:text-primary transition-colors">
                      {point.title}
                    </h4>
                    {/* Horizontal Indicator Line */}
                    <div className={`w-10 h-[2px] ${idx === 0 ? 'bg-primary' : idx === 1 ? 'bg-accent' : 'bg-primary-light'} rounded-full`} />
                    <p className="text-slate-650 text-xs sm:text-sm leading-relaxed font-medium">
                      {point.desc}
                    </p>
                  </div>
                  {/* Subtle decorative circles */}
                  <div className="absolute -bottom-6 -right-6 w-14 h-14 rounded-full bg-slate-50 group-hover:bg-primary/5 transition-colors -z-10" />
                </div>
              );
            })}
          </div>

          {/* Redesigned bottom rose banner */}
          <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 flex items-center justify-center gap-3 mt-10">
            <Heart className="text-rose-500 shrink-0 fill-rose-500 animate-pulse" size={16} />
            <p className="text-rose-700 font-extrabold text-xs sm:text-sm text-center leading-relaxed">
              "Is it just a phase, or is something deeper wrong? Most parents don't find out until months later."
            </p>
          </div>
        </div>

        {/* SECTION 3: WHAT YOU WILL LEARN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16 md:mb-24">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
              <span>Course Roadmap</span>
            </div>
            <h2 className="text-3xl font-bold font-heading text-slate-900 tracking-tight leading-tight">
              What You Will Learn in this 90-Minute Masterclass
            </h2>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed">
              We sell hope, not just raw biology information. You will leave with a clear, decodable framework to handle your relationship with your daughter.
            </p>

            <div className="pt-2 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
                <span className="text-slate-700 text-xs font-bold">1:1 Free Consultation Call included</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
                <span className="text-slate-700 text-xs font-bold">Printable PDF Decision Card</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LEARN_POINTS.map((point, idx) => (
              <div key={idx} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h4 className="text-sm font-bold text-slate-850 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-primary rounded-full block" />
                  {point.title}
                </h4>
                <p className="text-slate-500 text-[11px] leading-relaxed font-semibold">{point.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 6: AGENDA AT A GLANCE */}
        <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-12 mb-16 md:mb-24 relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-light/10 rounded-full blur-[100px]" />
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-primary-light text-[10px] font-bold uppercase tracking-widest">Run of Show</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">Agenda at a Glance</h2>
            <p className="text-slate-400 text-xs font-semibold">90 minutes designed to give you maximum clarity and actionable steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            {TIMELINE_POINTS.map((point, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-primary-light text-[10px] font-black uppercase tracking-wider mb-2">{point.time}</div>
                <h4 className="text-sm font-bold mb-2">{point.title}</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed font-semibold">{point.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: MEET YOUR TRAINERS */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-24">
          <div className="space-y-3 mb-10">
            <span className="text-primary text-[10px] font-bold uppercase tracking-widest">Your Guides</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">Meet Your Expert Mentors</h2>
            <p className="text-slate-500 text-xs font-semibold">Lived experts specializing in adolescent psychology and girls' developmental health.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Trainer 1 */}
            <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 hover:shadow-md transition-shadow">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 mx-auto mb-4 overflow-hidden border border-slate-200">
                  <img src="/avatar-bhumika.png" alt="Bhumika Asrani" className="w-full h-full object-cover fallback-image" onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/adventurer/svg?seed=bhumika";
                  }} />
                </div>
                <h4 className="text-base font-bold text-slate-800">Bhumika Asrani</h4>
                <p className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1">Lead Child Psychologist</p>
              <p className="text-slate-500 text-xs leading-relaxed font-semibold mt-3">
                Over 8+ years of core experience in adolescent emotional regulation, helping girls bridge the communication gap with parents.
              </p>
            </div>

            {/* Trainer 2 */}
            <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 hover:shadow-md transition-shadow">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 mx-auto mb-4 overflow-hidden border border-slate-200">
                  <img src="/avatar-suman.png" alt="Suman Sikdar" className="w-full h-full object-cover fallback-image" onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/adventurer/svg?seed=suman";
                  }} />
                </div>
                <h4 className="text-base font-bold text-slate-800">Suman Sikdar</h4>
                <p className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1">Puberty Educator</p>
              <p className="text-slate-500 text-xs leading-relaxed font-semibold mt-3">
                Specializes in puberty transition biology and hormonal health. Passionate about empowering parents with correct biological frameworks.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 7: SOCIAL PROOF / TESTIMONIAL */}
        <div className="max-w-3xl mx-auto mb-16 md:mb-24">
          <div className="p-8 md:p-10 rounded-[2rem] bg-primary/5 border border-primary/10 text-center relative">
            <Quote className="absolute top-6 left-6 text-primary/10" size={44} />
            <div className="flex items-center justify-center gap-1 text-amber-500 text-xs font-bold mb-4">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              <span className="text-slate-650 font-bold ml-1">5.0 (500+ parents attended)</span>
            </div>
            <p className="text-slate-700 text-sm md:text-base font-semibold leading-relaxed italic mb-6">
              "My daughter was pulling away in Class 6. This webinar gave me the exact vocabulary to react when she slams the door. Using their scripts, she actually opened up to me the very next day. Highly recommended!"
            </p>
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-widest">— Ritu S., Mother of a 12-Year-Old</h5>
          </div>
        </div>

        {/* SECTION 8: FAQ ACCORDION */}
        <div className="max-w-2xl mx-auto mb-16 md:mb-24">
          <h2 className="text-2xl font-bold font-heading text-slate-900 tracking-tight text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-slate-800 hover:bg-slate-50/50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 border-t border-slate-100 text-slate-500 text-xs leading-relaxed font-semibold">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 9: FINAL CTA */}
        <div className="text-center max-w-xl mx-auto p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-light to-accent" />
          
          <h3 className="text-lg md:text-xl font-bold font-heading text-slate-900 mb-2">Reserve Your Webinar Pass</h3>
          <p className="text-slate-500 text-xs leading-relaxed font-semibold mb-6">
            Get the decodable signals framework + 1:1 call bonus + private parents community access.
          </p>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary w-full py-4 shadow-xl shadow-primary/20 text-sm uppercase tracking-wider font-bold transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Reserve Seat for ₹99
            </button>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold pt-1">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Passes are backed by a satisfaction refund policy.</span>
            </div>
          </div>
        </div>

      </div>

      {/* RENDER RESERVATION CHECKOUT MODAL */}
      <WebinarCheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

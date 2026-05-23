'use client';

import { motion } from 'framer-motion';
import { Stethoscope, Brain, HeartHandshake, Check } from 'lucide-react';

interface Pillar {
  id: string;
  badge: string;
  subheading: string;
  quote: string;
  bullets: string[];
  icon: React.ReactNode;
  theme: {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    bulletBg: string;
    bulletText: string;
    quoteBorder: string;
    iconBg: string;
    glow: string;
  };
}

const PILLARS: Pillar[] = [
  {
    id: 'gynaecologist',
    badge: 'Gynaecologist',
    subheading: 'Medical clarity. Zero stigma.',
    quote: 'Knowing your body is not optional. It is the first act of self-care.',
    bullets: [
      '1:1 private consultations included in every program',
      'Anonymous Q&A - she asks anything she has been afraid to ask',
      'PCOS and endometriosis awareness - early detection saves years',
      'First appointment prep: what to say and how to advocate for herself',
      'Normalising the gynaecologist visit before she turns 18',
      'Up to 3 consultations in senior programs (Bloom, Ignite, Unstoppable)'
    ],
    icon: <Stethoscope size={24} />,
    theme: {
      bg: 'bg-[#ECFDF5]',
      border: 'border-emerald-250/80 hover:border-emerald-350',
      text: 'text-emerald-950',
      badgeBg: 'bg-emerald-150',
      badgeText: 'text-emerald-900',
      bulletBg: 'bg-emerald-200/90',
      bulletText: 'text-emerald-800',
      quoteBorder: 'border-emerald-500',
      iconBg: 'bg-emerald-200/80 text-emerald-800',
      glow: 'rgba(16,185,129,0.06)',
    }
  },
  {
    id: 'psychologist',
    badge: 'Psychologist',
    subheading: 'Proactive, not crisis-driven.',
    quote: 'A girl who meets her psychologist before a crisis has a resource when one arrives.',
    bullets: [
      'Structured 1:1 sessions with a licensed child psychologist',
      'Final session: personalised mental health toolkit she keeps for life',
      'Session 1: Trust-building - not therapy, just getting to know her',
      'Covers anxiety, perfectionism, identity questions, transition anxiety',
      'Mid-program: check-in, toolkit refinement, active concerns addressed',
      'Up to 4 sessions in Unstoppable (Class 11-12)'
    ],
    icon: <Brain size={24} />,
    theme: {
      bg: 'bg-[#F5F2FF]',
      border: 'border-violet-250/80 hover:border-violet-350',
      text: 'text-violet-950',
      badgeBg: 'bg-violet-150',
      badgeText: 'text-violet-900',
      bulletBg: 'bg-violet-200/90',
      bulletText: 'text-violet-800',
      quoteBorder: 'border-violet-500',
      iconBg: 'bg-violet-200/80 text-violet-800',
      glow: 'rgba(139,92,246,0.06)',
    }
  },
  {
    id: 'peer-mentor',
    badge: 'Peer Mentor',
    subheading: 'The conversation adults cannot have.',
    quote: 'Sometimes the most powerful thing is someone who says: I felt exactly that too.',
    bullets: [
      '1:1 with a trained older girl (Class 9-12) who has completed the program',
      'Peer mentors are trained, supervised, and matched for age-group fit',
      'Monthly 30-45 min sessions - safe space for what she cannot tell parents',
      'No agenda, no curriculum - pure empathic listening and shared experience',
      'Covers: friendship drama, family pressure, school stress, relationships',
      'One session per program is deliberately unstructured - just space to breathe'
    ],
    icon: <HeartHandshake size={24} />,
    theme: {
      bg: 'bg-[#FFF0F2]',
      border: 'border-rose-250/80 hover:border-rose-350',
      text: 'text-rose-950',
      badgeBg: 'bg-rose-150',
      badgeText: 'text-rose-900',
      bulletBg: 'bg-rose-200/90',
      bulletText: 'text-rose-800',
      quoteBorder: 'border-rose-500',
      iconBg: 'bg-rose-200/80 text-rose-800',
      glow: 'rgba(244,63,94,0.06)',
    }
  }
];

export function SupportSystem() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-[#FFFCFA] text-slate-900 relative overflow-hidden border-t border-slate-100/50">
      {/* Background Graphic Elements for Depth */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[25%] left-[-10%] w-[45%] h-[40%] bg-emerald-100/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[45%] h-[40%] bg-rose-100/20 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        
        {/* Header Block */}
        <div className="w-full mb-20 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full mb-8">
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Support Ecosystem</span>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight leading-[1.15] text-slate-900 w-full"
          >
            More Than Sessions. <br className="hidden md:block" />
            <span className="text-primary">A Complete Support System.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-md text-slate-500 leading-relaxed font-medium w-full max-w-3xl"
          >
            Every EmpowerHer program includes expert consultations and peer support as core - not add-ons.
          </motion.p>
        </div>

        {/* Pillars Vertical Stack */}
        <div className="space-y-10">
          {PILLARS.map((pillar, index) => {
            const t = pillar.theme;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`group rounded-[2.2rem] border ${t.bg} ${t.border} p-8 md:p-12 relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col lg:grid lg:grid-cols-12 lg:gap-12 items-center`}
                style={{
                  boxShadow: `0 20px 40px -15px ${t.glow}`
                }}
              >
                {/* Visual Glow Circle inside Card */}
                <div
                  className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[45px] pointer-events-none opacity-40 transition-all group-hover:scale-125 duration-500"
                  style={{ backgroundColor: t.glow.replace('0.04', '0.2') }}
                />

                {/* Left Side: Badge, Subheading, Quote (lg:col-span-5) */}
                <div className="w-full lg:col-span-5 flex flex-col justify-center mb-8 lg:mb-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${t.iconBg}`}>
                      {pillar.icon}
                    </div>
                    <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-white/60 ${t.badgeBg} ${t.badgeText}`}>
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className={`text-2xl md:text-3xl font-bold font-heading mt-5 leading-tight ${t.text}`}>
                    {pillar.subheading}
                  </h3>

                  <div className={`mt-6 pl-4 border-l-2 ${t.quoteBorder} italic text-slate-700 font-bold text-sm md:text-base leading-relaxed`}>
                    "{pillar.quote}"
                  </div>
                </div>

                {/* Divider Line for Responsive View */}
                <div className="w-full h-[1px] bg-slate-200 lg:hidden mb-8" />

                {/* Right Side: Bullets Grid (lg:col-span-7) */}
                <div className="w-full lg:col-span-7">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {pillar.bullets.map((bullet, bulletIdx) => (
                      <li key={bulletIdx} className="flex items-start gap-3.5 text-slate-900 text-sm font-semibold leading-relaxed">
                        <span className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${t.bulletBg} ${t.bulletText} mt-0.5 shadow-sm`}>
                          <Check size={10} strokeWidth={3} />
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

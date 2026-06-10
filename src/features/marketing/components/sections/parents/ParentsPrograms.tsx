'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Clock, Users, User, ChevronRight, Check } from 'lucide-react';
import { ProgramsService, Program } from '@/services/programs.service';

const STYLES_MAP: Record<string, {
  bg: string;
  border: string;
  text: string;
  iconBg: string;
  glow: string;
  badge: string;
  btnBg: string;
  bulletBg: string;
  pricingBg: string;
  metaBg: string;
}> = {
  'SPARK': {
    bg: 'bg-[#FFF0F2]',
    border: 'border-rose-100 hover:border-rose-250',
    text: 'text-rose-600',
    iconBg: 'bg-rose-100/70',
    glow: 'rgba(244,63,94,0.06)',
    badge: 'bg-rose-50 border-rose-100 text-rose-700',
    btnBg: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/10 hover:shadow-rose-600/25',
    bulletBg: 'bg-rose-100 text-rose-600',
    pricingBg: 'bg-white border-rose-100/30',
    metaBg: 'bg-white border-rose-100/30',
  },
  'RISE': {
    bg: 'bg-[#F5F2FF]',
    border: 'border-violet-100 hover:border-violet-250',
    text: 'text-violet-600',
    iconBg: 'bg-violet-100/70',
    glow: 'rgba(124,58,237,0.06)',
    badge: 'bg-violet-50 border-violet-100 text-violet-700',
    btnBg: 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/10 hover:shadow-violet-600/25',
    bulletBg: 'bg-violet-100 text-violet-600',
    pricingBg: 'bg-white border-violet-100/30',
    metaBg: 'bg-white border-violet-100/30',
  },
  'BLOOM': {
    bg: 'bg-[#ECFDF5]',
    border: 'border-emerald-100 hover:border-emerald-250',
    text: 'text-emerald-600',
    iconBg: 'bg-emerald-100/70',
    glow: 'rgba(5,150,105,0.06)',
    badge: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    btnBg: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10 hover:shadow-emerald-600/25',
    bulletBg: 'bg-emerald-100 text-emerald-600',
    pricingBg: 'bg-white border-emerald-100/30',
    metaBg: 'bg-white border-emerald-100/30',
  },
  'IGNITE': {
    bg: 'bg-[#FDF2FF]',
    border: 'border-fuchsia-100 hover:border-fuchsia-250',
    text: 'text-primary',
    iconBg: 'bg-fuchsia-100/70',
    glow: 'rgba(192,38,211,0.06)',
    badge: 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-700',
    btnBg: 'bg-primary hover:bg-fuchsia-700 shadow-primary/10 hover:shadow-primary/25',
    bulletBg: 'bg-fuchsia-100 text-primary',
    pricingBg: 'bg-white border-fuchsia-100/30',
    metaBg: 'bg-white border-fuchsia-100/30',
  },
  'UNSTOPPABLE': {
    bg: 'bg-[#FFFDF0]',
    border: 'border-amber-100 hover:border-amber-250',
    text: 'text-amber-600',
    iconBg: 'bg-amber-100/70',
    glow: 'rgba(217,119,6,0.06)',
    badge: 'bg-amber-50 border-amber-100 text-amber-700',
    btnBg: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/10 hover:shadow-amber-600/25',
    bulletBg: 'bg-amber-100 text-amber-600',
    pricingBg: 'bg-white border-amber-100/30',
    metaBg: 'bg-white border-amber-100/30',
  },
};

const DEFAULT_STYLE = {
  bg: 'bg-slate-50',
  border: 'border-slate-200 hover:border-slate-350',
  text: 'text-slate-600',
  iconBg: 'bg-slate-100/70',
  glow: 'rgba(71,85,105,0.04)',
  badge: 'bg-slate-50 border-slate-200 text-slate-700',
  btnBg: 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/10 hover:shadow-slate-900/25',
  bulletBg: 'bg-slate-100 text-slate-600',
  pricingBg: 'bg-white border-slate-100',
  metaBg: 'bg-white border-slate-100',
};

// STATIC_FALLBACK_PROGRAMS removed to ensure all program curriculum data is backend driven.

export function ParentsPrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        setLoading(true);
        const data = await ProgramsService.getPrograms();
        if (data && data.length > 0) {
          setPrograms(data);
        } else {
          setError(true);
          setPrograms([]);
        }
      } catch (err) {
        console.error('Programs dynamic fetch failed:', err);
        setError(true);
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPrograms();
  }, []);

  return (
    <section id="programs-showcase" className="py-24 bg-white text-slate-900 relative overflow-hidden border-t border-slate-100/60">
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-violet-200/30 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[45%] h-[45%] bg-rose-200/30 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">

        {/* Header Block */}
        <div className="w-full mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full mb-8">
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Our Curriculum</span>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight leading-[1.15] text-slate-900 w-full"
          >
            5 Programs. <span className="text-primary">One Complete Journey.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-md text-slate-500 leading-relaxed font-medium max-w-3xl"
          >
            Each program builds on the last. Every girl starts exactly where she is. Guided by qualified educators, we deliver age-aligned clinical insights, life skills, and interactive learning cohorts.
          </motion.p>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="p-8 bg-white/70 border border-slate-100 rounded-3xl animate-pulse flex flex-col gap-6">
                <div className="h-6 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-5/6" />
                </div>
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                </div>
                <div className="h-10 bg-slate-200 rounded mt-auto" />
              </div>
            ))}
          </div>
        ) : (
          /* Programs Card Deck Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {programs.map((program, i) => {
              const styles = STYLES_MAP[program.title] || DEFAULT_STYLE;
              const formattedPricePrivate = program.pricePrivate.toLocaleString('en-IN');
              const formattedPriceGroup = program.priceGroup.toLocaleString('en-IN');

              return (
                <motion.div
                  key={program.id || program.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`p-8 md:p-9 rounded-3xl border ${styles.bg} ${styles.border} shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col group relative overflow-hidden`}
                  style={{
                    boxShadow: `0 20px 40px -15px ${styles.glow}`,
                    backgroundImage: program.thumbnailUrl
                      ? `linear-gradient(to bottom, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.94)), url(${program.thumbnailUrl})`
                      : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Decorative glow circle */}
                  <div
                    className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-[40px] pointer-events-none opacity-40 transition-all group-hover:scale-125 duration-500"
                    style={{ backgroundColor: styles.glow.replace('0.06', '0.2').replace('0.05', '0.15').replace('0.15', '0.3') }}
                  />

                  {/* Header: Title and Class Range */}
                  <div className="flex items-center justify-between mb-5 relative z-10">
                    <h3 className={`text-3xl font-bold tracking-tight ${styles.text}`}>
                      {program.title}
                    </h3>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${styles.badge}`}>
                      {program.classRange}
                    </span>
                  </div>

                  {/* Tagline */}
                  <p className="text-slate-800 font-semibold italic text-base leading-relaxed mb-6 min-h-[48px] relative z-10">
                    "{program.tagline}"
                  </p>

                  {/* Session / Duration details bar */}
                  <div className={`flex items-center gap-4 py-3 px-4 ${styles.metaBg} rounded-2xl border shadow-sm mb-6 text-slate-600 text-xs font-bold relative z-10`}>
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={14} className={styles.text} />
                      <span>{program.sessions} Sessions</span>
                    </div>
                    <div className="h-3 w-[1px] bg-slate-200" />
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className={styles.text} />
                      <span>{program.duration}</span>
                    </div>
                  </div>

                  {/* Topics covered block */}
                  <div className="mb-8 flex-1 relative z-10">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">What she will cover:</h4>
                    <ul className="space-y-2.5">
                      {program.topics.map((topic, topicIdx) => (
                        <li key={topicIdx} className="flex items-start gap-2.5 text-slate-600 text-sm font-medium leading-tight">
                          <span className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${styles.bulletBg} mt-0.5`}>
                            <Check size={10} strokeWidth={3} />
                          </span>
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing details Block */}
                  {/* <div className="border-t border-slate-100 pt-6 mb-8 relative z-10">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Pricing Options:</h4>
                    <div className="grid grid-cols-2 gap-4">
                     
                      <div className={`p-3 ${styles.pricingBg} rounded-2xl border shadow-sm hover:shadow transition-all duration-300`}>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          <User size={10} className={styles.text} />
                          <span>1:1 Private</span>
                        </div>
                        <div className="text-slate-900 font-bold text-base leading-none">
                          ₹{formattedPricePrivate}
                          <span className="text-[10px] font-semibold text-slate-400">/mo</span>
                        </div>
                      </div>

             
                      <div className={`p-3 ${styles.pricingBg} rounded-2xl border shadow-sm hover:shadow transition-all duration-300`}>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          <Users size={10} className={styles.text} />
                          <span>Group (4 girls)</span>
                        </div>
                        <div className="text-slate-900 font-bold text-base leading-none">
                          ₹{formattedPriceGroup}
                          <span className="text-[10px] font-semibold text-slate-400">/mo</span>
                        </div>
                      </div>
                    </div>
                  </div> */}

                  {/* Direct Link CTA */}
                  <Link
                    href={`/programs/${program.title.toLowerCase()}`}
                    className={`w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-white font-semibold  transition-all ${styles.btnBg} relative z-10`}
                  >
                    <span>Enroll Now</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 duration-300" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

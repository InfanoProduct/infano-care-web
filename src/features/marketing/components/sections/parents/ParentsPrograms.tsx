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

function StaticList({ items, styles, title, isExpanded }: { items: string[], styles: any, title: string, isExpanded: boolean }) {
  return (
    <div className={`h-full p-5 rounded-2xl bg-white border ${styles.border} shadow-sm flex flex-col`}>
      <h4 className={`text-[11px] font-bold uppercase tracking-widest mb-4 ${styles.text} flex items-center gap-2`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
        {title}
      </h4>
      <ul className="space-y-3.5 flex-1">
        {items.map((item, idx) => (
          <li key={idx} className={`items-start gap-3 text-slate-700 ${isExpanded ? 'flex' : (idx < 2 ? 'flex' : (idx < 4 ? 'hidden md:flex' : 'hidden'))}`}>
            <span className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${styles.bulletBg} shadow-sm mt-0.5`}>
              <Check size={12} strokeWidth={3} />
            </span>
            <span className="text-sm font-semibold leading-snug">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProgramCard({ program, index }: { program: Program; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const themeKeys = Object.keys(STYLES_MAP);
  const styles = STYLES_MAP[themeKeys[index % themeKeys.length]] || DEFAULT_STYLE;

  const consultationsCount = Array.isArray(program.consultations)
    ? program.consultations.length
    : 0;
  const remainingFeatures = (program.features && program.features.length > 0)
    ? program.features
    : [
      "1 physical book",
      "Digital learning access",
      "Safe community led by experts",
      "Menstrual Tracker"
    ];
  const programIncludesItems = [
    `${program.sessionsList?.length || 0} Sessions by trained experts`,
    `${consultationsCount} Consultation`,
    ...remainingFeatures
  ];

  const hasMoreItems = program.topics.length > 2 || programIncludesItems.length > 2;
  const hasMoreThanFourItems = program.topics.length > 4 || programIncludesItems.length > 4;

  return (
    <motion.div
      key={program.id || program.title}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`rounded-3xl border ${styles.bg} ${styles.border} shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col lg:flex-row group relative overflow-hidden`}
      style={{
        boxShadow: `0 20px 40px -15px ${styles.glow}`,
      }}
    >
      <div
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-[40px] pointer-events-none opacity-40 transition-all group-hover:scale-125 duration-500 z-0"
        style={{ backgroundColor: styles.glow.replace('0.06', '0.2').replace('0.05', '0.15').replace('0.15', '0.3') }}
      />

      {program.thumbnailUrl && (
        <div className="w-full lg:w-[35%] h-64 lg:h-auto relative overflow-hidden shrink-0 border-b lg:border-b-0 lg:border-r border-white/40">
          <img src={program.thumbnailUrl} alt={program.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
        </div>
      )}

      <div className="p-8 md:p-9 flex flex-col flex-1 relative z-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 md:mb-8 relative z-10 gap-5 md:gap-4">
          <div className="flex flex-col gap-2 md:gap-1.5 flex-1">
            <div className="flex items-start gap-2 md:gap-3">
              <h3 className={`text-2xl md:text-3xl font-bold tracking-tight ${styles.text}`}>
                {program.title}
              </h3>
            </div>
            <p className="text-slate-800 font-semibold text-sm md:text-[15px] leading-snug">
              "{program.tagline}"
            </p>
          </div>

          <div className="shrink-0 self-start md:pt-1">
            <div className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl bg-white/80 border ${styles.border} shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] backdrop-blur-md`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Users size={14} className={styles.text} />
                <span className={`text-sm font-black ${styles.text}`}>{(program.enrolledCount || 1200).toLocaleString()}+</span>
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Enrolled</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 flex-1 relative z-10">
          <StaticList items={program.topics} styles={styles} title="What She Will Cover" isExpanded={isExpanded} />
          <StaticList items={programIncludesItems} styles={styles} title="Program Includes" isExpanded={isExpanded} />
        </div>

        {hasMoreItems && (
          <div className="flex justify-center mb-6 z-10 relative">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`text-[11px] font-bold uppercase tracking-widest ${styles.text} hover:opacity-80 transition-opacity flex items-center gap-1 py-2 px-6 rounded-full bg-white/50 border border-white shadow-sm ${!hasMoreThanFourItems ? 'md:hidden' : ''}`}
            >
              {isExpanded ? '- Show Less' : '+ Show More'}
            </button>
          </div>
        )}

        <Link
          href={`/programs/${program.slug || program.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
          className={`w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-white font-semibold  transition-all ${styles.btnBg} relative z-10`}
        >
          <span>Enroll Now</span>
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 duration-300" />
        </Link>
      </div>
    </motion.div>
  );
}

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
            <span className="text-primary">One Complete Journey.</span>
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
          <div className="flex flex-col gap-8">
            {[1, 2].map((idx) => (
              <div key={idx} className="p-8 bg-white/70 border border-slate-100 rounded-3xl animate-pulse flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-1/3 h-52 lg:h-auto min-h-[250px] bg-slate-200 rounded-2xl" />
                <div className="flex flex-col flex-1 gap-6">
                  <div className="h-6 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-full" />
                      <div className="h-3 bg-slate-200 rounded w-5/6" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-full" />
                      <div className="h-3 bg-slate-200 rounded w-5/6" />
                    </div>
                  </div>
                  <div className="h-12 bg-slate-200 rounded mt-auto w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Programs Card Deck Grid */
          <div className="flex flex-col gap-8 lg:gap-10">
            {programs.map((program, i) => (
              <ProgramCard key={program.id || program.title} program={program} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

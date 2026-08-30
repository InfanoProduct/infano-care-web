'use client';

import { motion } from 'framer-motion';
import { Sparkles, Brain, ShieldAlert, ShieldCheck, Coins, Activity } from 'lucide-react';

const CARDS = [
  {
    num: "1",
    title: "Body & Puberty",
    text: "Most girls face their first period without being told what it actually is. Cramps are dismissed. Body changes are left unspoken and shrouded in myth.",
    icon: <Sparkles className="text-rose-600" size={24} />,
    color: 'bg-rose-50/60',
    iconBg: 'bg-rose-100/80'
  },
  {
    num: "2",
    title: "Mental Health",
    text: "Anxiety and depression in girls peak at 13-15. Most go unrecognised for years because no one taught them - or their parents - what the signs actually look like.",
    icon: <Brain className="text-violet-600" size={24} />,
    color: 'bg-violet-50/60',
    iconBg: 'bg-violet-100/80'
  },
  {
    num: "3",
    title: "Digital Safety",
    text: "1 in 3 girls has received unwanted contact online. Sexting consequences, grooming patterns, and cybercrime rights are never taught in any Indian school syllabus.",
    icon: <ShieldAlert className="text-emerald-600" size={24} />,
    color: 'bg-emerald-50/60',
    iconBg: 'bg-emerald-100/80'
  },
  {
    num: "4",
    title: "Consent & Boundaries",
    text: "The FRIES model of consent. Grooming recognition. How to say no to a familiar adult. None of this appears in any CBSE or ICSE syllabus - not a single line.",
    icon: <ShieldCheck className="text-amber-600" size={24} />,
    color: 'bg-amber-50/60',
    iconBg: 'bg-amber-100/80'
  },
  {
    num: "5",
    title: "Financial Literacy",
    text: "Girls who understand money before they earn it are 3x more likely to negotiate their first salary. Financial independence is rarely framed as a feminist right.",
    icon: <Coins className="text-orange-600" size={24} />,
    color: 'bg-orange-50/60',
    iconBg: 'bg-orange-100/80'
  },
  {
    num: "6",
    title: "Reproductive Health",
    text: "PCOS affects 1 in 5 Indian girls. Average diagnosis: 7 years. Endometriosis affects 1 in 10. Most girls suffer in silence because no one named these conditions.",
    icon: <Activity className="text-sky-600" size={24} />,
    color: 'bg-sky-50/60',
    iconBg: 'bg-sky-100/80'
  }
];

const STATS = [
  { value: "1 in 7", label: "Indians will face a mental health condition", color: "text-rose-500" },
  { value: "7 years", label: "Average delay in PCOS diagnosis in India", color: "text-violet-500" },
  { value: "1 in 3", label: "Girls receive unwanted online contact", color: "text-emerald-500" },
  { value: "0", label: "Syllabus topics on consent in India", color: "text-amber-500" }
];

export function WhatSchoolsMiss() {
  return (
    <section className="py-10 md:py-24 bg-[#FFFCFA] text-slate-900 relative overflow-hidden border-t border-slate-100/50">
      {/* Background Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[10%] left-[-5%] w-[45%] h-[45%] bg-rose-200/20 rounded-full blur-[130px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] bg-violet-200/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">

        {/* Header Block */}
        <div className="w-full md:mb-20 mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full mb-8">
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">The Problem We're Solving</span>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight leading-[1.15] text-slate-900 w-full"
          >
            What Schools Miss.
            <span className="text-primary">What She Needs.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-md text-slate-500 leading-relaxed font-medium w-full"
          >
            Your daughter will face puberty, peer pressure, mental health challenges, digital safety threats,
            and a world that has very specific - and often unfair - expectations of her. School teaches her academic equations,
            but who prepares her for life?
          </motion.p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mb-10 md:mb-20">
          {CARDS.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group p-8 md:p-10 ${card.color} backdrop-blur-xl rounded-2xl border border-white shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col justify-start`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 md:w-14 md:h-14 ${card.iconBg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
                  {card.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 tracking-tight">{card.num}. {card.title}</h4>
              </div>
              <p className="text-slate-500 leading-relaxed font-medium">{card.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Dark Purple/Navy Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden mb-10 md:mb-20 bg-primary border border-violet-950 p-8 md:p-12 text-center shadow-2xl"
        >
          {/* Inner Glows */}
          <div className="absolute top-[-50%] left-[-20%] w-[60%] h-[100%] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-50%] right-[-20%] w-[60%] h-[100%] bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight leading-tight">
              The conversations that matter most <br className="hidden md:block" /> are the ones no one is having.
            </h3>
            <p className="text-violet-200/80 font-semibold text-sm tracking-wide uppercase">
              Infano exists to have every single one of them.
            </p>
          </div>
        </motion.div>

        {/* 4 Stats Column Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 border-t border-slate-100 pt-8 md:pt-16">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center flex flex-col items-center justify-start group"
            >
              <div className={`text-4xl md:text-5xl font-bold ${stat.color} mb-3 font-heading tracking-tight leading-none group-hover:scale-105 transition-transform duration-300`}>
                {stat.value}
              </div>
              <p className="text-slate-500 text-sm md:text-md font-semibold leading-snug max-w-[200px]">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

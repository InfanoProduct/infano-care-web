'use client';

import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';

const STATS = [
  {
    value: '25%',
    arrow: 'down',
    label: 'Period-related school absence',
    span: 'col-span-2',
  },
  {
    value: '3X',
    arrow: 'up',
    label: 'More likely to report unsafe situations',
    span: 'col-span-1',
  },
  {
    value: '79%',
    arrow: 'up',
    label: 'Weekly Learning engagement rate',
    span: 'col-span-1',
  },
  {
    value: '68%',
    arrow: 'up',
    label: 'Girls identify a trusted adult in Session 1',
    span: 'col-span-1',
  },
  {
    value: '5 Yr',
    arrow: 'up',
    label: 'Progressive curriculum: No other program does',
    span: 'col-span-1',
  },
];

export function ImpactSection() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Decorative arcs */}
      <div className="absolute bottom-0 left-0 w-28 h-40 pointer-events-none opacity-30">
        <svg viewBox="0 0 120 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="0" cy="180" r="120" stroke="#C084FC" strokeWidth="2" fill="none" />
          <circle cx="0" cy="180" r="90" stroke="#E67E22" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-28 h-28 pointer-events-none opacity-50">
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="120" cy="0" r="80" stroke="#C084FC" strokeWidth="24" fill="none" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">

          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-[42%] shrink-0"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-2 font-heading">
              The Impact
            </h2>
            <p className="text-base text-slate-500 font-medium mb-6">
              What Changes For Your Girls
            </p>
            <blockquote className="text-sm text-slate-600 italic leading-relaxed border-l-0">
              &ldquo;By the time she finishes Grade 9, she has managed her period independently for 4 years, named and sought help for her anxiety, practiced saying no, and written a letter to her 25-year-old self. That letter will arrive at her door on her 19th birthday.&rdquo;
            </blockquote>
          </motion.div>

          {/* Right: Stats Grid */}
          <div className="w-full lg:w-[58%] grid grid-cols-2 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`${stat.span} bg-[#F8F4FF] border border-white rounded-2xl p-5 flex flex-col gap-2 hover:shadow-sm transition-all duration-300`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-[#E67E22] font-heading leading-none">
                    {stat.value}
                  </span>
                  {stat.arrow === 'down' ? (
                    <TrendingDown className="text-[#4A1E7F]" size={20} strokeWidth={2.5} />
                  ) : (
                    <TrendingUp className="text-green-500" size={20} strokeWidth={2.5} />
                  )}
                </div>
                <p className="text-xs text-slate-600 font-medium leading-snug">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

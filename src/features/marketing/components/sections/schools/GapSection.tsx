'use client';

import { motion } from 'framer-motion';
import { XCircle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

const SCHOOL_OFFERS = [
  "A one-time 'health talk' in Grade 6",
  "A biology chapter on reproduction",
  "A counselor—available 1 day/week",
  "Parent-teacher meetings on academics",
  "No structured mental health support",
  "No digital safety education",
  "No consent or body safety curriculum"
];

const GIRLS_NEED = [
  "Age-progressive guidance, grades 5 → 9",
  "Honest menstrual & body health literacy",
  "Mental health awareness & early support",
  "Digital safety & consent education",
  "Identity, self-esteem & resilience tools",
  "A trusted adult who is trained to help",
  "A parent who is equipped, not clueless"
];

export function GapSection() {
  return (
    <section className="py-24 bg-[#FAF9FF] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black text-[#4A1E7F] italic font-heading">
            The Gap That School Hasn't Closed—YET
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-0 relative">
          {/* Vertical Divider */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 hidden md:block" />

          {/* Left Column: What Most Schools Offer */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:pr-16"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 relative shrink-0">
                <Image src="/schools/gap-school.png" alt="School icon" fill className="object-contain" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 font-heading">
                What Most Schools Offer Today
              </h3>
            </div>

            <ul className="space-y-6">
              {SCHOOL_OFFERS.map((item, i) => (
                <li key={i} className="flex items-center gap-4">
                  <XCircle className="text-red-500 shrink-0" size={24} />
                  <span className="text-lg text-slate-600 italic leading-tight">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right Column: What Girls Actually Need */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:pl-16"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="w-20 h-20 relative shrink-0">
                <Image src="/schools/gap-girls.png" alt="Girls icon" fill className="object-contain" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 font-heading">
                What Girls Actually Need
              </h3>
            </div>

            <ul className="space-y-6">
              {GIRLS_NEED.map((item, i) => (
                <li key={i} className="flex items-center gap-4">
                  <CheckCircle2 className="text-green-500 shrink-0" size={24} />
                  <span className="text-lg text-slate-600 italic leading-tight font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Decorative Dots - Top Right */}
      <div className="absolute top-10 right-10 flex gap-3">
        <div className="w-5 h-5 bg-[#E67E22] rounded-full" />
        <div className="w-5 h-5 bg-[#E67E22] rounded-full" />
        <div className="w-5 h-5 bg-[#E67E22] rounded-full" />
      </div>

      {/* Decorative Plant - Bottom Center */}
      <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-30 pointer-events-none z-0">
        <Image src="/schools/gap-plant.png" alt="Decorative plant" fill className="object-contain" />
      </div>

      {/* Decorative Sparkles - Bottom Left */}
      <div className="absolute bottom-10 left-10 w-32 h-32 opacity-20 pointer-events-none z-0">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M50 0L54 46L100 50L54 54L50 100L46 54L0 50L46 46L50 0Z" fill="#4A1E7F" />
        </svg>
      </div>

      {/* Bottom Right Arcs */}
      <div className="absolute bottom-[-5%] right-[-5%] w-64 h-64 opacity-20 pointer-events-none">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="200" cy="200" r="150" stroke="#E67E22" strokeWidth="2" />
          <circle cx="200" cy="200" r="120" stroke="#E67E22" strokeWidth="2" />
        </svg>
      </div>
    </section>
  );
}

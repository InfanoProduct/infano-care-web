'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2 } from 'lucide-react';

export function LearningPillar() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Graphics */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-50/30 -skew-x-12 translate-x-1/2" />
      <div className="absolute top-20 right-[15%] opacity-[0.05]">
        <div className="grid grid-cols-5 gap-4">
          {[...Array(25)].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-emerald-600" />
          ))}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1 relative"
          >
            <div className="absolute -inset-10 bg-emerald-100/50 blur-[100px] rounded-full scale-75" />
            <div className="relative mx-auto w-full max-w-[520px]">
              <Image
                src="/Ecosystem2.png"
                alt="Mobile interface"
                width={520}
                height={1060}
                className="object-contain"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-3xl shadow-lg shadow-emerald-900/5 border border-emerald-100 shrink-0">
                <BookOpen size={28} />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tighter leading-none">Story-Based <br /> Learning Journeys</h2>
            </div>
            <div className="w-16 h-1 bg-emerald-400 rounded-full mb-8" />
            <p className="text-sm md:text-base text-slate-500 mb-10 leading-relaxed font-medium max-w-xl">
              Learning that feels like living. Our journeys use narrative power to teach life skills—from self-worth to career exploration.
            </p>

            <div className="grid gap-6 mb-12">
              {[
                { title: 'Interactive Choices', desc: 'Branching narratives where her choices shape the outcome.' },
                { title: '12+ Unique Worlds', desc: 'Designed for ages 10–21 with age-appropriate themes.' },
                { title: 'Progress Rewards', desc: 'Badges and unlocks that celebrate every chapter finished.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 mb-1 tracking-tight">{item.title}</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000" />
              <h4 className="font-bold mb-4 text-[10px] uppercase tracking-[0.3em] text-white/40">Popular Collections</h4>
              <div className="flex flex-wrap gap-2">
                {['Body Talks', 'Her Money Mind', 'Unfiltered', 'Friendship Lab'].map((tag) => (
                  <span key={tag} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-white hover:bg-primary hover:border-primary transition-all cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

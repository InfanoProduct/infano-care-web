'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2 } from 'lucide-react';

export function EducationPillar() {
  return (
    <section className="py-16 lg:py-24 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #0ea5e9 2px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-0 left-0 w-64 h-64 bg-sky-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <div className="mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-2 relative"
          >
            <div className="absolute -inset-10 bg-emerald-100/50 blur-[100px] rounded-full scale-75" />
            <div className="relative mx-auto w-full ">
              <Image
                src="/eco-3.png"
                alt="Mobile interface"
                width={500}
                height={600}
                className="object-contain max-h-[400px] lg:max-h-[600px] w-auto mx-auto"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-1"
          >
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-sky-900/5 border border-sky-100 shrink-0">
                <Zap size={28} />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold font-heading text-slate-900 tracking-tighter leading-none">Gamified <br /> Education</h2>
            </div>
            <div className="w-16 h-1 bg-sky-400 rounded-full mb-8" />
            <p className="text-sm md:text-base text-slate-500 mb-10 leading-relaxed font-medium max-w-xl">
              Learning that doesn't feel like learning. We believe education sticks when it's joyful.
            </p>

            <div className="grid gap-6 mb-12">
              {[
                { title: 'Daily Quests', desc: 'Short modules (5–10 mins) that fit her daily routine.' },
                { title: 'Achievement Badges', desc: 'Unlock milestones across 20+ life skill categories.' },
                { title: 'Level Based Growth', desc: 'Different levels based on the age and learning ability.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 shrink-0 border border-sky-100 group-hover:bg-sky-500 group-hover:text-white transition-all duration-500">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold font-heading text-slate-900 mb-1 tracking-tight">{item.title}</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

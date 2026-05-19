'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Activity, Zap, Shield } from 'lucide-react';

export function WellnessPillar() {
  return (
    <section className="py-16 lg:py-24 bg-[#FAF9FF] relative overflow-hidden">
      {/* Enhanced Background Graphic */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-full h-[800px] bg-[radial-gradient(circle_at_center,_#FFE4E6_0%,_transparent_70%)] opacity-30 blur-3xl" />
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      <div className="mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 place-items-center  ">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="flex items-center gap-6 mb-6 ">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-3xl shadow-lg shadow-rose-900/5 border border-rose-100 shrink-0">
                <Activity size={28} />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold font-heading text-slate-900 tracking-tighter leading-none">AI Wellness <br /> & Cycle Tracker</h2>
            </div>
            <div className="w-16 h-1 bg-rose-400 rounded-full mb-8" />
            <p className="text-sm md:text-base text-slate-500 mb-10 leading-relaxed font-medium max-w-xl">
              Know your body. Trust your mind. Our tracker identifies patterns in mood and energy to provide personalised medical-grade insights.
            </p>

            {/* Mobile Image */}
            <div className="lg:hidden relative mx-auto w-full mb-10">
              <div className="absolute -inset-10 bg-emerald-100/50 blur-[100px] rounded-full scale-75" />
              <Image
                src="/Ecosystem3.png"
                alt="Mobile interface"
                width={500}
                height={500}
                className="object-contain w-[920px] relative z-10"
              />
            </div>

            <div className="grid gap-6 mb-12">
              {[
                { title: 'Medically Backed', desc: 'Content reviewed by gynaecologists and wellness experts.' },
                { title: 'Daily Check-ins', desc: 'Mood, symptoms, and energy tracking with AI insights.' },
                { title: 'Safety Protocols', desc: 'Proactive wellness support and trusted adult alerts.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 border border-rose-100 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold font-heading text-slate-900 mb-1 tracking-tight">{item.title}</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-rose-500 text-white p-8 rounded-[2.5rem] shadow-xl shadow-rose-900/20 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000" />
              <h4 className="font-bold text-white mb-3 text-lg tracking-tight flex items-center gap-3 font-heading">
                <Shield size={20} /> Privacy First
              </h4>
              <p className="text-sm text-rose-50 leading-relaxed font-medium">
                Fully encrypted and private. Girls control their data—we never share health logs with third parties without explicit consent.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden lg:block order-2 lg:order-1 relative  "
          >
            <div className="absolute -inset-10 bg-emerald-100/50 blur-[100px] rounded-full scale-75" />
            <div className="relative mx-auto w-full ">
              <Image
                src="/eco-2.png"
                alt="Mobile interface"
                width={500}
                height={600}
                className="object-contain max-h-[400px] lg:max-h-[600px] w-auto mx-auto"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

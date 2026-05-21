"use client";

import { motion } from 'framer-motion';

export default function AboutMission() {
  return (
    <section className="py-32 bg-white relative">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:auto-rows-[240px]">
          {/* Our Mission - Large Feature Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="md:col-span-8 md:row-span-2 bg-[#F3F0FF] rounded-[3rem] p-12 md:p-16 flex flex-col justify-center relative overflow-hidden group"
          >
            <div className="absolute top-10 right-10 w-24 h-24 bg-white/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="text-5xl mb-8">🎯</div>
            <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Our Mission</h3>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl font-medium">
              To empower every adolescent and young adult girl to become an independent, confident, and empowered woman—through knowledge, community, and care.
            </p>
          </motion.div>

          {/* Our Vision - Tall Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-4 md:row-span-2 bg-[#E8F9F1] rounded-[3rem] p-10 flex flex-col justify-between"
          >
            <div>
              <div className="text-4xl mb-6">🔭</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                A world where no girl grows up feeling alone in her journey—where every question is welcomed and every emotion is valid.
              </p>
            </div>
            <div className="h-1 w-12 bg-emerald-200 rounded-full" />
          </motion.div>

          {/* Our Philosophy - Wide Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-6 md:row-span-1 bg-[#E0F2FE] rounded-[3rem] p-10 flex items-center gap-8"
          >
            <div className="text-4xl">💜</div>
            <div>
              <h3 className="text-xl font-bold font-heading text-slate-900 mb-2 tracking-tight">Girl-First Design</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Every product and piece of content is created with her dignity and agency at the centre.
              </p>
            </div>
          </motion.div>

          {/* Our Promise - Wide Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-6 md:row-span-1 bg-[#FEF3E2] rounded-[3rem] p-10 flex items-center gap-8"
          >
            <div className="text-4xl">🔒</div>
            <div>
              <h3 className="text-xl font-bold font-heading text-slate-900 mb-2 tracking-tight">Our Promise</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Safe. Expert-backed. Stigma-free. A space where her questions are celebrated.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

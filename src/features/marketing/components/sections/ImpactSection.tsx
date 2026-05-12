'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Users } from 'lucide-react';

export function ImpactSection() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Graphic Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-sky-50 blur-[140px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-40" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-rose-50 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 opacity-40" />
      
      {/* Subtle Decorative Circles */}
      <div className="absolute top-20 left-10 w-64 h-64 border border-[#111827]/5 rounded-full" />
      <div className="absolute bottom-40 -right-20 w-96 h-96 border border-[#111827]/5 rounded-full" />
      <div className="absolute top-1/2 right-1/4 w-32 h-32 border border-[#111827]/5 rounded-full" />
      <div className="absolute -bottom-10 left-1/3 w-48 h-48 border border-[#111827]/5 rounded-full" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="text-center mb-20">
           <h2 className="text-5xl md:text-7xl font-bold font-heading tracking-tight text-[#111827]">
              Real girls. <span className="text-[#111827]/20">Real change.</span>
           </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
           {/* Main Testimonial Box */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             whileHover={{ y: -5 }}
             className="md:col-span-8 bg-[#F3F0FF] rounded-[2.5rem] p-10 md:p-16 flex flex-col justify-between relative overflow-hidden group min-h-[440px]"
           >
              <div className="absolute top-8 left-8 text-[12rem] font-serif text-white/40 select-none leading-none opacity-50">“</div>
              <p className="text-2xl md:text-3xl font-bold text-[#111827] leading-[1.3] relative z-10 tracking-tight max-w-[90%] mt-8">
                 "Before Infano, I thought what I was feeling was just me being dramatic. Now I know my emotions are real — and I have the tools to understand them."
              </p>
              <div className="flex items-center gap-4 relative z-10">
                 <div className="w-12 h-12 rounded-full bg-[#111827]/5 flex items-center justify-center">
                    <Users size={20} className="text-[#111827]/40" />
                 </div>
                 <div>
                    <p className="font-bold text-[#111827] text-lg">Priya, 15</p>
                    <p className="text-[10px] text-[#111827]/40 font-bold uppercase tracking-[0.2em]">Mumbai, India</p>
                 </div>
              </div>
           </motion.div>

           {/* Stat 1: Top Right */}
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             whileHover={{ y: -5 }}
             className="md:col-span-4 bg-[#E8F9F1] rounded-[2.5rem] p-10 flex flex-col justify-center"
           >
              <div className="text-7xl md:text-8xl font-bold text-[#059669] mb-4 tracking-tighter">94%</div>
              <p className="text-sm md:text-base text-[#111827] font-bold leading-snug">
                 of girls reported feeling more confident about their bodies after 8 weeks
              </p>
           </motion.div>

           {/* Stat 2: Bottom Left */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             whileHover={{ y: -5 }}
             className="md:col-span-4 bg-[#E0F2FE] rounded-[2.5rem] p-10 flex flex-col justify-center min-h-[220px]"
           >
              <div className="text-6xl md:text-7xl font-bold text-[#0284C7] mb-4 tracking-tighter">87%</div>
              <p className="text-sm md:text-base text-[#111827] font-bold leading-tight">
                 improvement in classroom emotional regulation reported by principals
              </p>
           </motion.div>

           {/* Stat 3: Bottom Center */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             whileHover={{ y: -5 }}
             className="md:col-span-4 bg-[#FEF3E2] rounded-[2.5rem] p-10 flex flex-col justify-center min-h-[220px]"
           >
              <div className="text-6xl md:text-7xl font-bold text-[#EA580C] mb-4 tracking-tighter">89%</div>
              <p className="text-sm md:text-base text-[#111827] font-bold leading-tight">
                 parents felt better connected to their daughter's inner world
              </p>
           </motion.div>

           {/* CTA Box: Bottom Right */}
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             whileHover={{ scale: 1.02 }}
             className="md:col-span-4 bg-[#111827] rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center group"
           >
              <Link href="/impact" className="text-white font-bold group/btn flex flex-col items-center gap-4">
                 <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Impact Stories</span>
                 <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:text-[#111827]">
                    <ArrowRight size={24} />
                 </div>
                 <span className="text-lg">Read More</span>
              </Link>
           </motion.div>
        </div>
      </div>
    </section>
  );
}

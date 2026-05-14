'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Shield, Users, BookOpen } from 'lucide-react';

export function BookSection() {
  return (
    <section className="py-32 bg-[#FFFBF7] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-orange-50 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Book Image & Testimonial */}
          <div className="flex flex-col gap-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full scale-90" />
              <motion.div
                whileHover={{ rotateY: -5, rotateX: 2, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="relative z-10 w-full max-w-xl mx-auto h-[400px] md:h-[550px]"
              >
                <Image
                  src="/S5Img1.png"
                  alt="A story of Every Adolescent Girl - Book Bundle"
                  fill
                  className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.1)]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
            </motion.div>

            {/* Testimonial Quote - Elegant & Compact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50 relative max-w-lg mx-auto lg:mx-0"
            >
              <div className="text-primary/10 text-6xl font-serif absolute -top-2 left-6 leading-none select-none italic">“</div>
              <p className="text-slate-500 italic text-base leading-relaxed relative z-10  mb-4">
                "Reading this with my daughter turned awkward questions into honest chats. The illustrations kept her engaged, and the prompts helped me guide the conversation."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Users size={14} />
                </div>
                <div>
                  <p className="text-slate-900 font-bold text-sm leading-none">Ananya S.</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Parent</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Editorial Content */}
          <div className="flex flex-col lg:pl-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-px w-6 bg-primary/20" />
              <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                India's first book on Adolescent Girls
              </span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 leading-tight tracking-tight text-slate-900">
              A story of Every <br /> <span className="text-primary/40">Adolescent Girl</span>
            </h2>

            <p className="text-base text-slate-500 leading-relaxed font-medium mb-10 max-w-lg">
              A warm, illustrated guide to the adolescent journey—built to spark reflection, confidence, and conversations at home. Short chapters, friendly visuals, and practical prompts.
            </p>

            {/* Stats Summary - Sleek UI */}
            <div className="flex gap-10 mb-10">
              <div>
                <span className="block text-2xl font-bold text-slate-900">230</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Illustrated Pages</span>
              </div>
              <div className="w-px h-10 bg-slate-100" />
              <div>
                <span className="block text-2xl font-bold text-slate-900">10–17</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Target Age Group</span>
              </div>
            </div>

            {/* Inside the Book Checklist - Refined */}
            <div className="space-y-4 mb-12">
              {[
                "Co-created with counsellors & teachers",
                "Empathetic stories that help teens open up",
                "Inclusive, culturally-aware guidance"
              ].map((text, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-base font-bold text-slate-700 tracking-tight">{text}</span>
                </motion.div>
              ))}
            </div>

            {/* Price and CTA - Elegant */}
            <div className="flex flex-col sm:flex-row items-center gap-8 pt-8 border-t border-slate-100">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 tracking-tighter">₹499</span>
                  <span className="text-slate-300 line-through text-lg font-bold">₹999</span>
                </div>
                <span className="text-emerald-500 font-bold text-[9px] uppercase tracking-widest mt-1">
                  Special 50% Launch Offer
                </span>
              </div>

              <div className="flex gap-4 w-full sm:w-auto">
                <Link href="/the-book" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-base hover:bg-primary transition-all shadow-lg shadow-slate-900/5 active:scale-95 group">
                  Buy Now <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/the-book#read" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold text-sm hover:bg-slate-50 transition-all active:scale-95">
                  <BookOpen size={18} className="text-primary" /> Read Sample
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


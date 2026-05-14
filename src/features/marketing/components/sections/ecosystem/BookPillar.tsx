'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';

export function BookPillar() {
  return (
    <section className="py-40 bg-slate-900 relative overflow-hidden">
      {/* Background Graphics */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-accent/10 blur-[150px] rounded-full -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="max-w-4xl mx-auto bg-white rounded-[4rem] p-12 md:p-20 text-center shadow-[0_50px_100px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-primary/10 rounded-full mb-8">
              <BookOpen size={18} className="text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">The Offline Companion</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tighter leading-none">Pillar 6: The Book</h2>
            <p className="text-sm md:text-base text-slate-500 mb-10 leading-relaxed font-medium max-w-2xl mx-auto">
              A beautiful, honest, and expert-backed guide covering everything an adolescent girl deserves to understand.
            </p>
            <Link href="/the-book" className="px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-bold text-xl hover:bg-primary transition-all shadow-2xl active:scale-95 inline-flex items-center gap-4 group">
              Explore The Book <ArrowRight size={24} className="transition-transform group-hover:translate-x-2" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

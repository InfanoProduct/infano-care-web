"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function AboutCta() {
  return (
    <section className="py-20 bg-[#FFFBF7] relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-[#FEF3E2] blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-primary/5 blur-[100px] rounded-full opacity-50" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-12 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl shadow-orange-900/5 text-2xl"
        >
          🇮🇳
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900"
        >
          India has over 120 million <br /> adolescent girls.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-base md:text-md text-slate-500 leading-relaxed font-medium mb-8"
        >
          Most navigate puberty, body image, and mental health without safe, accurate support.
          Infano.care is the responsible, expert-backed alternative that parents trust, schools adopt, and girls love.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/contact" className="px-12 py-6 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-primary transition-all shadow-2xl shadow-slate-900/20 active:scale-95 inline-flex items-center gap-3 group">
            Join Our Mission <ArrowRight className="transition-transform group-hover:translate-x-2" size={20} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

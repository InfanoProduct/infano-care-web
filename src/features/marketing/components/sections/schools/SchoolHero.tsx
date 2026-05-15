'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { School, ArrowRight } from 'lucide-react';

export function SchoolHero() {
  return (
    <section className="relative pt-20 pb-24  lg:pb-32 overflow-hidden bg-white">
      {/* Background Decorations */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-50 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] left-[-10%] w-[45%] h-[45%] bg-primary/5 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-8"
            >
              <School size={14} className="text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-[0.2em]">Institutional Partnerships</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-5xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900"
            >
              Redefining the standard of <br />
              <span className="text-primary font-bold">Holistic Growth.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-base md:text-md text-slate-500 leading-relaxed font-medium mb-8"
            >
              A structured wellness integration programme for leading educational institutions focused on adolescent empowerment and life skills.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center gap-6"
            >
              <Link href="/contact" className="btn-primary w-full sm:w-auto text-sm px-8 py-3.5 group shadow-lg shadow-primary/20">
                Request Consultation <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
              </Link>
              <Link href="#" className="btn-outline w-full sm:w-auto text-sm px-8 py-3.5 backdrop-blur-md bg-white/50 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300">
                Partnership Guide
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl shadow-emerald-900/10 border border-white">
              <Image
                src="https://images.unsplash.com/photo-1523050335192-ce1273591790?auto=format&fit=crop&q=80"
                alt="Institutional campus"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-emerald-100/50 rounded-full blur-xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

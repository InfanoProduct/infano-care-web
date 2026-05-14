'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Smartphone, ArrowRight } from 'lucide-react';

export function EcosystemHero() {
  return (
    <section className="relative pt-32 overflow-hidden bg-[#FAF9FF]">
      {/* Background Graphics - Enriched */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[5%] left-[-5%] w-[45%] h-[45%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />

        {/* Animated Graphic Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-[40%_60%_70%_30%/40%_50%_60%_40%] blur-[80px]"
        />

        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #6366f1 1.5px, transparent 0)', backgroundSize: '48px 48px' }} />

        {/* Floating Decorative Elements */}
        <div className="absolute top-[15%] right-[5%] opacity-20">
          <div className="w-24 h-24 border-2 border-primary rounded-full animate-spin-slow" />
        </div>
        <div className="absolute top-[30%] right-[40%] opacity-20">
          <div className="w-10 h-10 border-2 border-primary rounded-full animate-spin-slow" />
        </div>
        <div className="absolute bottom-[10%] right-[10%] opacity-20">
          <div className="w-32 h-32 border-2 border-accent rounded-2xl rotate-45 animate-bounce-slow" />
        </div>
      </div>

      <div className="mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-full mb-10 shadow-md"
            >
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Smartphone size={12} />
              </div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.25em]">The Infano Mobile Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold font-heading text-slate-900 mb-8 leading-[1.05] tracking-tighter"
            >
              Six pillars. <br />
              <span className="text-primary">One universe.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-base md:text-lg text-slate-500 mb-12 leading-relaxed font-medium max-w-xl"
            >
              The Infano ecosystem is a holistic digital home for every girl—blending technology, stories, and guidance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center gap-8"
            >
              <Link href="#pillars" className="px-12 py-6 bg-primary text-white rounded-full font-bold text-xl hover:bg-primary transition-all shadow-2xl shadow-slate-900/30 active:scale-95 flex items-center gap-3 group">
                Explore the Pillars <ArrowRight size={24} className="transition-transform group-hover:translate-x-2" />
              </Link>
            </motion.div>
          </div>

          <div>
            <Image
              src="/Ecosystem1.png"
              alt="Mobile interface"
              width={500}
              height={500}
              className="object-cover w-[580px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

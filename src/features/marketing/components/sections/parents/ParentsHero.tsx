'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Shield, Users } from 'lucide-react';

export function ParentsHero() {
  return (
    <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden bg-[#FFFCFA]">
      {/* Background Graphic Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px]" />
        
        {/* Floatable Elements */}
        <motion.div 
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-[10%] w-16 h-16 bg-white shadow-xl rounded-2xl flex items-center justify-center text-primary z-10 hidden lg:flex"
        >
          <Heart size={24} />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-[15%] w-12 h-12 bg-white shadow-lg rounded-xl flex items-center justify-center text-accent z-10 hidden lg:flex"
        >
          <Shield size={20} />
        </motion.div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full mb-8"
            >
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">For Families & Caregivers</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-slate-900 mb-8 leading-[1.2] tracking-tight"
            >
              You love her. <br />
              <span className="text-primary">You want to understand her.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-lg text-slate-600 mb-12 max-w-xl leading-relaxed font-medium"
            >
              Infano.care is the safe, expert-supported companion that helps your daughter navigate the questions, emotions, and changes she's facing.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center gap-6"
            >
              <Link href="/contact" className="btn-primary w-full sm:w-auto text-lg px-10 py-5 group shadow-xl shadow-primary/10 rounded-xl">
                Enrol Your Daughter <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
              </Link>
              <Link href="#" className="btn-outline w-full sm:w-auto text-lg px-10 py-5 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
                How it Works
              </Link>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="relative aspect-[5/4] rounded-2xl overflow-hidden shadow-2xl border border-white">
              <Image 
                src="https://images.unsplash.com/photo-1536640712247-c575830589b0?auto=format&fit=crop&q=80" 
                alt="Parent and daughter"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Floating Info Card */}
            <motion.div 
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-2xl border border-slate-50 flex items-center gap-4 z-20 max-w-[240px]"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <Users size={24} />
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-900">10k+ Families</span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Trusted Ecosystem</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

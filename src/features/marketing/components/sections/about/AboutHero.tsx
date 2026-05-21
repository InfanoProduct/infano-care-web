"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function AboutHero() {
  return (
    <section className="relative pt-20 pb-24 lg:pt-20 lg:pb-20 overflow-hidden bg-[#FAF9FF]">
      {/* Decorative Background Graphics */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Large Soft Circles */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-white rounded-full opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white rounded-full opacity-50" />

        {/* Geometric Graphic Elements */}
        <div className="absolute top-[15%] right-[10%] w-32 h-32 border border-primary/10 rounded-full flex items-center justify-center">
          <div className="w-16 h-16 border border-primary/5 rounded-full" />
        </div>

        <div className="absolute bottom-[20%] left-[15%] flex gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-1.5 h-12 bg-primary/10 rounded-full" style={{ opacity: 1 - i * 0.3 }} />
          ))}
        </div>

        <div className="absolute top-[40%] right-[15%] grid grid-cols-4 gap-4 opacity-20">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
          ))}
        </div>

        {/* Subtle Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #6366f1 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-2 items-center">
          <div className="max-w-2xl">
            <div
              className="inline-flex items-center gap-3 px-4 py-1.5 bg-white border border-slate-100 rounded-full mb-12 shadow-sm animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both"
            >
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles size={10} className="text-primary" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Our Founding Philosophy</span>
            </div>

            <h1
              className="text-4xl md:text-5xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
              style={{ animationDelay: '100ms' }}
            >
              We started because we <br />
              <span className="text-primary">remembered</span> what it <br /> felt like.
            </h1>

            <p
              className="text-base md:text-md text-slate-500 leading-relaxed font-medium mb-8 max-w-lg animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
              style={{ animationDelay: '200ms' }}
            >
              Infano.care was born from a deeply personal understanding of what adolescent girls go through—and a fierce belief that they deserve better tools, better conversations, and better support.
            </p>
          </div>

          <div
            className="relative aspect-video lg:aspect-video rounded-3xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-700 fill-mode-both"
            style={{ animationDelay: '150ms' }}
          >
            <Image
              src="/about.webp"
              alt="Our founding story"
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
}

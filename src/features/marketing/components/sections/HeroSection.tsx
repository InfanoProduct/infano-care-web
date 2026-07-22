'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SliderCard } from '../cards/SliderCard';
import { SLIDER_DATA } from '../../data/marketing';

export function HeroSection() {
  const [cards, setCards] = useState(SLIDER_DATA);
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const moveToEnd = useCallback((from: number) => {
    setCards((prev) => {
      const newCards = [...prev];
      const card = newCards.splice(from, 1)[0];
      newCards.push(card);
      return newCards;
    });
    setActiveTab((prev) => (prev + 1) % SLIDER_DATA.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => moveToEnd(0), 5000);
    return () => clearInterval(interval);
  }, [isPaused, moveToEnd]);

  return (
    <section className="relative pt-6 pb-6 lg:pt-10 lg:pb-20 overflow-hidden bg-white">
      {/* Background Graphics — GPU-promoted, no JS animations */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" style={{ contain: 'strict' }}>
        {/* Subtle Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #4a1e7f 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 xl:px-24 relative z-20">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-center">

          {/* Left Column: Content */}
          <div className="xl:col-span-4 text-center xl:text-left z-30">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50/80 backdrop-blur-sm border border-slate-100 rounded-full mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
            >
              <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">The Leader in Girls' Wellness</span>
            </div>

            <h1
              className="text-4xl md:text-5xl xl:text-5xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
              style={{ animationDelay: '100ms' }}
            >
              <span className="text-primary">From Girlhood → Adulthood → Womanhood </span>
            </h1>

            <p
              className="text-base md:text-md text-slate-500 leading-relaxed font-medium mb-0 xl:mb-8 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
              style={{ animationDelay: '200ms' }}
            >
              Infano.care is India's most holistic ecosystem for girls—blending story-led learning, wellness tracking, and expert guidance into one safe space.
            </p>

            {/* Desktop CTA: Visible only on XL+ */}
            <div
              className="hidden xl:flex flex-col sm:flex-row items-center justify-start gap-4 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
              style={{ animationDelay: '300ms' }}
            >
              <Link href="/program-enrollment" className="btn-primary w-full sm:w-auto text-sm px-8 py-3.5 group shadow-lg shadow-primary/20">
                Explore Journeys <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={16} />
              </Link>
              <Link href="/parents" className="btn-outline w-full sm:w-auto text-sm px-8 py-3.5 bg-white/50 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300">
                For Parents
              </Link>
            </div>
          </div>

          {/* Center Column: Spacer for Image (hidden on mobile) */}
          <div className="hidden xl:block xl:col-span-4 h-[500px]" />

          {/* Right Column: Cards & Slider (4 cols) */}
          <div className="xl:col-span-4 flex flex-col relative h-auto xl:h-[500px] items-center justify-center xl:justify-end z-30 xl:mt-0">
            <div className="relative w-full max-w-[320px] sm:max-w-[360px] xl:max-w-[340px] h-[400px] sm:h-[440px] xl:h-[450px] flex items-center justify-center">
              <AnimatePresence mode="sync">
                {cards.map((card, index) => {
                  const isFirst = index === 0;
                  return (
                    <SliderCard
                      key={card.id}
                      card={card}
                      index={index}
                      isFirst={isFirst}
                      onDragEnd={() => moveToEnd(index)}
                      onClick={() => isFirst && moveToEnd(0)}
                    />
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Slider Progress Indicators - Attached below slider */}
            <div className="mt-8 flex gap-2 z-40 bg-white/80 px-3 py-1.5 xl:px-4 xl:py-2 rounded-2xl border border-slate-100 shadow-sm">
              {SLIDER_DATA.map((_, index) => (
                <div key={index} className="relative h-1 xl:h-1.5 w-8 xl:w-10 bg-slate-100/50 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-primary"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: activeTab === index ? 1 : 0 }}
                    transition={{ duration: activeTab === index ? 5 : 0, ease: "linear" }}
                    style={{ originX: 0 }}
                  />
                </div>
              ))}
            </div>

            {/* Mobile CTA: Visible only below XL */}
            <div
              className="flex xl:hidden flex-col items-center gap-4 w-full max-w-[320px] mt-8 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
              style={{ animationDelay: '300ms' }}
            >
              <Link href="/program-enrollment" className="btn-primary w-full text-sm px-8 py-3.5 group shadow-lg shadow-primary/20 text-center">
                Explore Journeys <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={16} />
              </Link>
              <Link href="/parents" className="btn-outline w-full text-sm px-8 py-3.5 bg-white/50 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-center">
                For Parents
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Layered Absolute Subject Image (The Girl) */}
      <div className="hidden xl:block absolute bottom-0 left-1/2 -translate-x-1/2 z-10 w-full max-w-[600px] 2xl:max-w-[700px] h-[90%] xl:h-[95%] pointer-events-none">
        <div className="relative w-full h-full flex items-end justify-center">
          <div className="absolute bottom-[10%] w-[70%] h-[20%] bg-primary/10 rounded-full blur-2xl z-0" />
          <div
            className="relative z-10 h-full w-full animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
            style={{ animationDelay: '150ms' }}
          >
            <Image
              src="/heroImage1.png"
              alt="Student"
              fill
              className="object-contain object-bottom drop-shadow-[0_15px_40px_rgba(0,0,0,0.12)]"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
}

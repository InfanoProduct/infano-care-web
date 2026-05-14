'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Shield, Users, Star } from 'lucide-react';
import { SliderCard } from '../cards/SliderCard';
import { SLIDER_DATA } from '../../data/marketing';

export function HeroSection() {
  const [cards, setCards] = useState(SLIDER_DATA);
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const moveToEnd = (from: number) => {
    setCards((prev) => {
      const newCards = [...prev];
      const card = newCards.splice(from, 1)[0];
      newCards.push(card);
      return newCards;
    });
    setActiveTab((prev) => (prev + 1) % SLIDER_DATA.length);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      moveToEnd(0);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="relative pt-6 pb-12 lg:pt-10 lg:pb-24 overflow-hidden bg-white">
      {/* Advanced Background Graphics */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] bg-accent/10 rounded-full blur-[100px] animate-pulse" />

        {/* Subtle Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #4a1e7f 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        {/* Floating Decorative Particles */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-[15%] w-10 h-10 border-2 border-primary/20 rounded-xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 left-[5%] w-6 h-6 border-2 border-accent/20 rounded-full"
        />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left Column: Content */}
          <div className="lg:col-span-4 text-center lg:text-left z-30">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50/80 backdrop-blur-sm border border-slate-100 rounded-full mb-6"
            >
              <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">The Leader in Girls' Wellness</span>
            </motion.div>
 
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-6 leading-[1.1] tracking-tight"
            >
              Build The Skills To <br />
              <span className="text-primary">Bloom With Confidence.</span>
            </motion.h1>
 
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-base md:text-lg text-slate-500 mb-10 max-w-sm leading-relaxed font-medium mx-auto lg:mx-0"
            >
              Infano.care is India's most holistic ecosystem for girls—blending story-led learning, wellness tracking, and expert guidance into one safe space.
            </motion.p>

            {/* Desktop CTA: Visible only on LG+ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:flex flex-col sm:flex-row items-center justify-start gap-4"
            >
              <Link href="/contact" className="btn-primary w-full sm:w-auto text-sm px-8 py-3.5 group shadow-lg shadow-primary/20">
                Explore Journeys <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={16} />
              </Link>
              <Link href="/parents" className="btn-outline w-full sm:w-auto text-sm px-8 py-3.5 backdrop-blur-md bg-white/50 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300">
                For Parents
              </Link>
            </motion.div>
          </div>

          {/* Center Column: Spacer for Image (hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-4 h-[500px]" />

          {/* Right Column: Cards & Slider (4 cols) */}
          <div className="lg:col-span-4 flex flex-col relative h-auto lg:h-[500px] items-center justify-center lg:justify-end z-30 mt-10 lg:mt-0">
            <div className="relative w-full max-w-[280px] sm:max-w-[340px] h-[380px] sm:h-[420px] lg:h-[450px] flex items-center justify-center">
              <AnimatePresence mode="popLayout">
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
            <div className="mt-4 lg:mt-8 flex gap-2 z-40 bg-white/60 backdrop-blur-md px-3 py-1.5 lg:px-4 lg:py-2 rounded-2xl border border-slate-100 shadow-sm">
              {SLIDER_DATA.map((_, index) => (
                <div key={index} className="relative h-1 lg:h-1.5 w-8 lg:w-10 bg-slate-100/50 rounded-full overflow-hidden">
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

            {/* Mobile CTA: Visible only below LG */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex lg:hidden flex-col items-center gap-4 w-full max-w-[280px] mt-20"
            >
              <Link href="/contact" className="btn-primary w-full text-sm px-8 py-3.5 group shadow-lg shadow-primary/20 text-center">
                Explore Journeys <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={16} />
              </Link>
              <Link href="/parents" className="btn-outline w-full text-sm px-8 py-3.5 backdrop-blur-md bg-white/50 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-center">
                For Parents
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Layered Absolute Subject Image (The Girl) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 w-full max-w-[700px] h-[65%] lg:h-[95%] pointer-events-none">
        <div className="relative w-full h-full flex items-end justify-center">
          <div className="absolute bottom-[10%] w-[80%] h-[30%] bg-primary/10 rounded-full blur-3xl z-0" />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 1.5, delay: 0.3 }}
            className="relative z-10 h-full w-full"
          >
            <Image
              src="/hero.png"
              alt="Student"
              fill
              className="object-contain object-bottom drop-shadow-[0_15px_40px_rgba(0,0,0,0.12)]"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Heart, BookOpen, Sparkles, Award, BarChart3 } from 'lucide-react';

const MOCKUP_IMAGES = [
  '/eco-1.png',
  '/eco-2.png',
  '/eco-3.png',
];

const FEATURES = [
  {
    title: 'Daily Mood Check-In',
    desc: '3 taps. Under 10 seconds. Builds self-awareness. Feeds the school dashboard.',
    icon: Heart,
    color: 'text-pink-500',
    bg: 'bg-pink-50',
  },
  {
    title: 'Weekly Content Module',
    desc: 'Grade-specific stories, videos & activities continuing the session\'s theme.',
    icon: BookOpen,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    title: 'Expert Q&A Library',
    desc: '10+ video per grade. Experts answer the questions girls are too shy to ask aloud.',
    icon: Sparkles,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    title: 'Milestones & Badges',
    desc: 'Celebrates progress, not performance. Habit-forming without pressure.',
    icon: Award,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    title: 'School Dashboard',
    desc: 'Principals & coordinators see aggregate class well-being trends in real time.',
    icon: BarChart3,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
];

export function DigitalPlatformSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % MOCKUP_IMAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 opacity-[0.03] pointer-events-none">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="400" cy="0" r="350" fill="#4A1E7F" />
          <circle cx="400" cy="0" r="380" stroke="#E67E22" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row   ">

          {/* Left: Mobile Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-[45%] relative flex justify-center lg:justify-start"
          >
            <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
              {/* Decorative Arcs behind phone */}
              <div className="absolute -top-10 -left-10 w-40 h-40 opacity-20 pointer-events-none -z-10">
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="100" r="80" stroke="#E67E22" strokeWidth="2" strokeDasharray="8 8" />
                </svg>
              </div>

              {/* Phone Frame Decoration */}
              <div className="absolute -inset-10 bg-gradient-to-tr from-[#4A1E7F]/5 to-orange-500/5 rounded-[4rem] blur-3xl -z-20" />

              {/* Realistic Phone Container */}
              <div className="relative aspect-[9/18.5] w-full rounded-[2.8rem] sm:rounded-[3.2rem] border-[4px] border-slate-700 bg-slate-950 p-[5px] sm:p-[6px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] shadow-slate-950/70">

                {/* Hardware Buttons */}
                {/* Silent Switch */}
                <div className="absolute top-16 -left-[5px] sm:-left-[6px] w-[2px] h-6 bg-slate-500 rounded-l" />
                {/* Volume Up */}
                <div className="absolute top-28 -left-[5px] sm:-left-[6px] w-[2px] h-12 bg-slate-500 rounded-l" />
                {/* Volume Down */}
                <div className="absolute top-44 -left-[5px] sm:-left-[6px] w-[2px] h-12 bg-slate-500 rounded-l" />
                {/* Power Button */}
                <div className="absolute top-32 -right-[5px] sm:-right-[6px] w-[2px] h-16 bg-slate-500 rounded-r" />

                {/* Screen Container with Bezels */}
                <div className="relative w-full h-full rounded-[2.3rem] sm:rounded-[2.7rem] overflow-hidden bg-slate-900 border-[2px] sm:border-[2px] border-slate-950">

                  {/* Notch / Dynamic Island */}
                  <div className="absolute top-1.5 sm:top-2 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-2 sm:h-2.5 bg-slate-950 rounded-full z-30 flex items-center justify-center gap-1 shadow-inner">
                    <span className="w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full bg-slate-900/80" />
                    <span className="w-0.5 h-0.5 rounded-full bg-[#0a1520]" />
                  </div>

                  {/* Speaker Ear Piece */}
                  <div className="absolute top-0.5 sm:top-1 left-1/2 -translate-x-1/2 w-4 sm:w-12 h-0.5 bg-slate-800/80 rounded-full z-30" />

                  <AnimatePresence initial={false}>
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={MOCKUP_IMAGES[currentImageIndex]}
                        alt={`Digital Platform App Mockup ${currentImageIndex + 1}`}
                        fill
                        className="object-cover"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Dot Indicators */}
              <div className="flex justify-center gap-2 mt-6 relative z-20">
                {MOCKUP_IMAGES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex
                      ? 'w-6 bg-primary'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Decorative Floating Element */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center p-3 z-20"
              >
                <div className="w-full h-full bg-pink-50 rounded-xl flex items-center justify-center">
                  <Heart className="text-pink-500" fill="currentColor" size={24} />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <div className="w-full lg:w-[55%]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 text-center lg:text-left"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-heading leading-tight">
                The Digital Platform
              </h2>
              <p className="text-base md:text-md text-slate-500 font-medium">
                The Session Never Really Ends
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`group p-5 sm:p-6 rounded-[2rem] border border-slate-100 bg-white/50 backdrop-blur-sm hover:border-[#4A1E7F]/20 hover:shadow-xl hover:shadow-[#4A1E7F]/5 transition-all duration-300 ${i === 4 ? 'sm:col-span-2' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-2xl ${feature.bg} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                      <feature.icon className={feature.color} size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl  font-bold text-primary mb-1 font-heading">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600  sm:text-sm leading-relaxed  text-sm">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

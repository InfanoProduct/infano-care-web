'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';

const CHAPTERS = [
  {
    id: 1,
    title: "MIND MATTERS",
    desc: "Break the silence. Spill the truth. From overthinking spirals to self-care rituals—this chapter is your vibe check on mental health, because Gen Z minds? They seriously matter."
  },
  {
    id: 2,
    title: "HEART-TO-HEART",
    desc: "Deep dive into relationships, empathy, and how to communicate your needs effectively to family and friends."
  },
  {
    id: 3,
    title: "CYBER SAFE",
    desc: "Navigating the digital world safely, understanding privacy, and dealing with online pressure or bullying."
  },
  {
    id: 4,
    title: "PUBERTY Unplugged",
    desc: "Everything you need to know about growing up, without the awkwardness or misinformation."
  },
  {
    id: 5,
    title: "THE RED DOT JOURNEY - 1",
    desc: "Part one of our comprehensive guide to periods, cycle tracking, and menstrual health."
  },
  {
    id: 6,
    title: "THE RED DOT JOURNEY - 2",
    desc: "Understanding your body's rhythm and how to manage physical symptoms with confidence."
  },
  {
    id: 7,
    title: "THE RED DOT JOURNEY - 3",
    desc: "Breaking taboos and feeling empowered throughout your cycle every single month."
  },
  {
    id: 8,
    title: "BREAKING THE PRESSURE",
    desc: "Dealing with academic stress, peer pressure, and expectations while staying true to yourself."
  },
  {
    id: 9,
    title: "SMART CHOICES",
    desc: "Building decision-making skills that will serve you throughout your adult life."
  }
];

export function BookChapters() {
  const [openId, setOpenId] = useState<number | null>(1);

  return (
    <section className="py-24 bg-[#EEF1FF] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-200/50 blur-[80px] rounded-full -translate-x-1/4 translate-y-1/4" />
        
        {/* Floating Soft Blurs instead of boxes */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -20, 0],
              x: [0, 15, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 6 + i, 
              ease: "easeInOut",
              delay: i * 1
            }}
            className="absolute w-20 h-20 bg-white/40 rounded-full blur-xl"
            style={{ 
              top: `${15 + i * 20}%`, 
              left: `${5 + (i * 25) % 90}%`,
            }}
          />
        ))}
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-heading text-slate-900 tracking-tight"
          >
            Chapters We've Covered
          </motion.h2>
          <div className="w-16 h-1 bg-primary/30 mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Book Cover */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-primary/5 blur-[40px] rounded-[2rem]" />
              <div className="relative w-[300px] md:w-[420px] aspect-[0.8] rounded-[2rem] overflow-hidden shadow-xl shadow-indigo-900/10 border-4 border-white">
                <Image 
                  src="/book-bundle.png"
                  alt="The Awkward Age Book Cover"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
          </div>

          {/* Right: Accordion */}
          <div className="lg:col-span-7 space-y-3">
            {CHAPTERS.map((chapter) => (
              <div 
                key={chapter.id}
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                  openId === chapter.id 
                    ? 'bg-white border-primary/20 shadow-lg' 
                    : 'bg-white/40 border-slate-200/50 hover:bg-white/60'
                }`}
              >
                <button
                  onClick={() => setOpenId(openId === chapter.id ? null : chapter.id)}
                  className="w-full flex items-center justify-between p-5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      openId === chapter.id ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {chapter.id}
                    </span>
                    <span className={`font-bold text-base tracking-tight transition-all ${
                      openId === chapter.id ? 'text-slate-900' : 'text-slate-600'
                    }`}>
                      {chapter.title}
                    </span>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    openId === chapter.id ? 'bg-primary/10 text-primary rotate-180' : 'text-slate-400'
                  }`}>
                    <ChevronDown size={14} />
                  </div>
                </button>

                <AnimatePresence>
                  {openId === chapter.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="bg-slate-50/30"
                    >
                      <div className="px-6 pb-6 pt-0 text-slate-500 text-sm leading-relaxed font-medium">
                        {chapter.desc}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

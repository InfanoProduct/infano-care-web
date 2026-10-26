'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';

const CHAPTERS = [
  {
    id: 1,
    title: "Mind Matters",
    desc: "Break the silence. Spill the truth. From overthinking spirals to self-care rituals—this chapter is your vibe check on mental health, because Gen Z minds? They seriously matter."
  },
  {
    id: 2,
    title: "Heart-to-Heart",
    desc: "Deep dive into relationships, empathy, and how to communicate your needs effectively to family and friends."
  },
  {
    id: 3,
    title: "Cyber Safe",
    desc: "Navigating the digital world safely, understanding privacy, and dealing with online pressure or bullying."
  },
  {
    id: 4,
    title: "Puberty Unplugged",
    desc: "Everything you need to know about growing up, without the awkwardness or misinformation."
  },
  {
    id: 5,
    title: "The Red Dot Journey – 1",
    desc: "Part one of our comprehensive guide to periods, cycle tracking, and menstrual health."
  },
  {
    id: 6,
    title: "The Red Dot Journey – 2",
    desc: "Understanding your body's rhythm and how to manage physical symptoms with confidence."
  },
  {
    id: 7,
    title: "The Red Dot Journey – 3",
    desc: "Breaking taboos and feeling empowered throughout your cycle every single month."
  },
  {
    id: 8,
    title: "Breaking the Pressure",
    desc: "Dealing with academic stress, peer pressure, and expectations while staying true to yourself."
  },
  {
    id: 9,
    title: "Smart Choices",
    desc: "Building decision-making skills that will serve you throughout your adult life."
  }
];

export function BookChapters() {
  const [openId, setOpenId] = useState<number | null>(1);

  return (
    <section className="py-20 lg:py-24 bg-gradient-to-b from-[#F5F3FF]/70 via-white to-[#F5F3FF]/50 relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary/6 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-pink-500/6 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-12 lg:mb-16">
          <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px] bg-primary/8 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-primary/10">
            Curriculum Overview
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-slate-900 tracking-tight mb-3">
            Chapters We've Covered
          </h2>
          <p className="text-slate-500 text-sm sm:text-base md:text-lg font-medium leading-relaxed">
            9 thoughtfully structured chapters guiding her through emotional, physical, and social growth with warmth and scientific clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Left: Floating Book Bundle Image (Vertically Centered) */}
          <div className="lg:col-span-5 flex justify-center items-center self-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative group w-full flex justify-center items-center"
            >
              {/* Soft purple ambient back-glow */}
              <div className="absolute inset-0 bg-primary/12 blur-[70px] rounded-full scale-90 pointer-events-none" />
              
              <Image 
                src="https://res.cloudinary.com/dhg6sjxug/image/upload/v1792952568/infano-assets/book-workbook-2-Photoroom_mqhi96.png"
                alt="The Awkward Age Book and Workbook"
                width={912}
                height={1173}
                className="relative z-10 w-full max-w-[310px] sm:max-w-[350px] lg:max-w-[375px] xl:max-w-[395px] h-auto drop-shadow-[0_25px_50px_rgba(88,56,140,0.18)] hover:scale-[1.02] transition-transform duration-500 block"
                unoptimized
              />
            </motion.div>
          </div>

          {/* Right: Accordion (Vertically Centered) */}
          <div className="lg:col-span-7 space-y-1.5 self-center">
            {CHAPTERS.map((chapter) => {
              const isOpen = openId === chapter.id;
              return (
                <div 
                  key={chapter.id}
                  className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                    isOpen 
                      ? 'bg-white border-primary/30 shadow-[0_6px_20px_-4px_rgba(88,56,140,0.12)] ring-1 ring-primary/10' 
                      : 'bg-white/85 hover:bg-white border-slate-200/75 hover:border-primary/25 shadow-[0_1px_4px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : chapter.id)}
                    className="w-full flex items-center justify-between py-2.5 px-3.5 sm:py-3 sm:px-4 transition-all cursor-pointer group text-left"
                    suppressHydrationWarning
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-[11px] font-bold transition-all shrink-0 ${
                        isOpen 
                          ? 'bg-primary text-white shadow-xs' 
                          : 'bg-primary/8 text-primary group-hover:bg-primary group-hover:text-white'
                      }`}>
                        {String(chapter.id).padStart(2, '0')}
                      </span>
                      <span className={`font-heading font-semibold text-xs sm:text-sm tracking-tight transition-colors ${
                        isOpen ? 'text-primary-dark font-bold' : 'text-slate-800 group-hover:text-primary'
                      }`}>
                        {chapter.title}
                      </span>
                    </div>

                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      isOpen ? 'bg-primary/10 text-primary rotate-180' : 'text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-700'
                    }`}>
                      <ChevronDown size={13} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <div className="px-3.5 sm:px-4 pb-3.5 pt-1 pl-[2.75rem] sm:pl-[3.25rem] text-slate-600 text-xs sm:text-[13px] leading-relaxed font-normal border-t border-slate-100/80">
                          {chapter.desc}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}


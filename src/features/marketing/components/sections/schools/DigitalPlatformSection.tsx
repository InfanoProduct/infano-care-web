'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart, BookOpen, Sparkles, Award, BarChart3 } from 'lucide-react';

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
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
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
              
              <div className="relative aspect-[9/18.5] w-full rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden border-[6px] sm:border-[8px] border-slate-900 shadow-2xl">
                <Image 
                  src="/schools/digital-platform.png" 
                  alt="Digital Platform App Mockup" 
                  fill
                  className="object-cover"
                />
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
              <h2 className="text-3xl md:text-5xl font-black text-[#4A1E7F] mb-4 font-heading leading-tight">
                The Digital Platform
              </h2>
              <p className="text-lg md:text-2xl text-slate-500 font-medium italic">
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
                      <h3 className="text-base sm:text-lg font-bold text-[#4A1E7F] mb-1 font-heading">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed italic">
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

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const STATS = [
  {
    value: '30%',
    desc: 'of Indian girls had never heard of menstruation before their first period arrived.',
    image: '/schools/stat-menstruation.png',
  },
  {
    value: '25%',
    desc: 'miss school every month because of period-related stigma, pain & lack of support.',
    image: '/schools/stat-school-miss.png',
  },
  {
    value: '62%',
    desc: 'of adolescents do not know where to get help if they are cyberbullied online.',
    image: '/schools/stat-cyberbullying.png',
  }
];

export function RealitySection() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Decorative Arcs - Top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 opacity-20 pointer-events-none">
        <svg viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="720" cy="-400" r="550" stroke="#E67E22" strokeWidth="2" />
          <circle cx="720" cy="-400" r="450" stroke="#E67E22" strokeWidth="2" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex justify-between items-start mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary leading-tight font-heading">
              The Reality We Are Not Talking About
            </h2>
          </motion.div>
          
          {/* Top Right Dots */}
          <div className="hidden md:flex gap-3 mt-4">
            <div className="w-5 h-5 bg-[#E67E22] rounded-full" />
            <div className="w-5 h-5 bg-[#E67E22] rounded-full" />
            <div className="w-5 h-5 bg-[#E67E22] rounded-full" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {STATS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#FAF9FF] p-10 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
            >
              <div className="relative w-full aspect-square mb-8 overflow-hidden rounded-3xl">
                <Image 
                  src={item.image} 
                  alt={`Statistic illustration ${i + 1}`} 
                  fill
                  className="object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="flex items-center justify-center gap-4 mb-4 w-full">
                <span className="text-5xl md:text-6xl font-black text-[#E67E22] font-heading">
                  {item.value}
                </span>
              </div>
              <p className="text-slate-600 italic text-lg leading-relaxed px-2">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <div className="bg-[#E8E2F3] px-12 py-5 rounded-full shadow-sm">
            <p className="text-primary text-base md:text-lg font-bold italic text-center">
              These are your students. They are navigating this alone
            </p>
          </div>
        </motion.div>
      </div>

      {/* Background Decorations */}
      {/* Bottom Left Circles */}
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#E8E2F3] rounded-full opacity-40 blur-3xl -z-10" />
      <div className="absolute bottom-10 left-10 w-40 h-40 border-[20px] border-[#E8E2F3]/30 rounded-full -z-10" />
      
      {/* Bottom Right Sparkles/Stars */}
      <div className="absolute bottom-12 right-12 w-48 h-48 opacity-20 pointer-events-none -z-10">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M50 0L54 46L100 50L54 54L50 100L46 54L0 50L46 46L50 0Z" fill="#4A1E7F" />
          <path d="M80 70L82 88L100 90L82 92L80 110L78 92L60 90L78 88L80 70Z" fill="#4A1E7F" />
        </svg>
      </div>
    </section>
  );
}

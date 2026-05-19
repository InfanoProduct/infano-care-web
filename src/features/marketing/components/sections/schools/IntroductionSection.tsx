'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const FEATURES = [
  {
    title: 'In-School Expert Sessions ',
    desc: 'Structured in-school sessions Grades 5-9 every year',
    image: '/IntroducingCard.png',
  },
  {
    title: 'Digital Platform',
    desc: 'Structured learning app for girls with a safe community',
    image: '/schools/intro-digital.png',
  },
  {
    title: 'Teacher\'s Training',
    desc: 'Trained adults who know how to help, not dismiss',
    image: '/schools/intro-teacher.png',
  }
];

export function IntroductionSection() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Decorative Elements - Top */}
      <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-[#F2EBFF] rounded-full opacity-60 blur-3xl" />

      <div className="absolute top-0 right-0 w-80 h-40 opacity-20 pointer-events-none">
        <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="450" cy="-50" r="250" stroke="#E67E22" strokeWidth="2" />
          <circle cx="450" cy="-50" r="200" stroke="#E67E22" strokeWidth="2" />
        </svg>
      </div>

      {/* Top Right Dots */}
      <div className="absolute top-8 right-12 flex gap-3 z-20">
        <div className="w-4 h-4 bg-[#E67E22] rounded-full" />
        <div className="w-4 h-4 bg-[#E67E22] rounded-full" />
        <div className="w-4 h-4 bg-[#E67E22] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs font-bold text-primary mb-2 block uppercase tracking-[0.2em]">Introducing</span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-heading">
            Infano.Care
          </h2>
          <p className="text-base md:text-md text-slate-500 leading-relaxed font-medium max-w-2xl mx-auto">
            India’s First Age-Progressive Wellness Program <br className="hidden md:block" /> for Adolescent Girls in Schools
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#FAF9FF] p-6 rounded-[2rem] border border-slate-100 group hover:shadow-lg transition-all duration-300"
            >
              <div className="relative w-full aspect-[4/3] mb-6 overflow-hidden rounded-2xl">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2 font-heading text-center">
                {item.title}
              </h3>
              <p className="text-slate-600 italic text-center px-4">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative Wavy Shapes - Bottom Right */}
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[300px] opacity-30 pointer-events-none z-0">
        <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M400 150C350 100 250 100 200 150C150 200 50 200 0 150V300H400V150Z" fill="#E8E2F3" />
          <path d="M400 180C360 140 280 140 240 180C200 220 120 220 80 180V300H400V180Z" fill="#DCD0EF" />
        </svg>
      </div>
    </section>
  );
}

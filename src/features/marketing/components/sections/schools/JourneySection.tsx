'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const JOURNEY_STEPS = [
  {
    grade: 'Grade 5',
    age: 'Age 10-11',
    title: 'My Body, My Story',
    desc: 'Body literacy, puberty, and menstruation readiness',
    image: '/schools/journey-5.png',
    color: 'bg-[#FDF2F8]/60',
    height: 'min-h-[400px]',
    imgHeight: 'h-40 md:h-48',
  },
  {
    grade: 'Grade 6',
    age: 'Age 11-12',
    title: 'Emotions Are My Superpower',
    desc: 'Emotional intelligence, social media reality',
    image: '/schools/journey-6.png',
    color: 'bg-[#F5F3FF]/60',
    height: 'min-h-[430px]',
    imgHeight: 'h-44 md:h-52',
  },
  {
    grade: 'Grade 7',
    age: 'Age 12-13',
    title: 'My Relationships, My Rules',
    desc: 'Consent, digital safety, and grooming awareness',
    image: '/schools/journey-7.png',
    color: 'bg-[#F0F9FF]/60',
    height: 'min-h-[460px]',
    imgHeight: 'h-48 md:h-56',
  },
  {
    grade: 'Grade 8',
    age: 'Age 13-14',
    title: 'I know who I am',
    desc: 'Mental health, identity, self-esteem',
    image: '/schools/journey-8.png',
    color: 'bg-[#ECFDF5]/60',
    height: 'min-h-[490px]',
    imgHeight: 'h-52 md:h-60',
  },
  {
    grade: 'Grade 9',
    age: 'Age 14-15',
    title: 'Ready for the World',
    desc: 'Reproductive health, ambition, and life skills',
    image: '/schools/journey-9.png',
    color: 'bg-[#FFFBEB]/60',
    height: 'min-h-[520px]',
    imgHeight: 'h-56 md:h-64',
  }
];

export function JourneySection() {
  return (
    <section className="py-24 bg-[#FAF9FF] relative overflow-hidden">
      {/* Decorative Arcs - Top Left & Bottom Left */}
      <div className="absolute top-[-5%] left-[-5%] w-80 h-80 bg-[#E8E2F3] rounded-full opacity-30 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] border-[40px] border-[#E8E2F3]/20 rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-[#4A1E7F] mb-4 font-heading">
            A 5-Year Journey — Not A One-Day Talk
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 mb-20 items-end">
          {JOURNEY_STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`${step.color} ${step.height} p-6 rounded-[2.5rem] border border-white flex flex-col items-center justify-end text-center group hover:shadow-xl transition-all duration-500`}
            >
              <div className={`relative w-full ${step.imgHeight} mb-6 overflow-hidden rounded-3xl shrink-0`}>
                <Image 
                  src={step.image} 
                  alt={step.grade} 
                  fill
                  className="object-contain p-2 group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="space-y-1 mb-4">
                <span className="text-2xl font-black text-[#E67E22] block font-heading">{step.grade}</span>
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{step.age}</span>
              </div>
              <h3 className="text-xl font-bold text-[#4A1E7F] mb-3 leading-tight font-heading">
                {step.title}
              </h3>
              <p className="text-sm text-slate-600 italic leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-xl md:text-2xl text-slate-800 font-medium italic">
            Each year builds on the last. By <span className="text-[#4A1E7F] font-black not-italic">Grade 9</span>, she is equipped — <span className="text-[#4A1E7F] font-black">not just informed.</span>
          </p>
        </motion.div>
      </div>

      {/* Top Right Decoration - Flare */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
           <circle cx="450" cy="-50" r="400" fill="#4A1E7F" />
        </svg>
      </div>

      {/* Decoration: Dots - Bottom Right */}
      <div className="absolute bottom-10 right-10 flex gap-3">
        <div className="w-5 h-5 bg-[#E67E22] rounded-full opacity-80" />
        <div className="w-5 h-5 bg-[#E67E22] rounded-full opacity-80" />
        <div className="w-5 h-5 bg-[#E67E22] rounded-full opacity-80" />
      </div>
    </section>
  );
}

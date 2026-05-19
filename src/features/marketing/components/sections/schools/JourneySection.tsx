'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const JOURNEY_STEPS = [
  {
    grade: 'Grade 5',
    age: 'Age 10-11',
    title: 'My Body, My Story',
    desc: 'Body literacy, puberty, and menstruation readiness',
    image: '/5th Grade.png',
    color: 'bg-[#FDE8F4]',
    border: 'border-pink-200',
    height: 'min-h-[400px]',
    imgHeight: 'h-40 md:h-48',
  },
  {
    grade: 'Grade 6',
    age: 'Age 11-12',
    title: 'Emotions Are My Superpower',
    desc: 'Emotional intelligence, social media reality',
    image: '/6th Grade.png',
    color: 'bg-[#EDE9FF]',
    border: 'border-purple-200',
    height: 'min-h-[430px]',
    imgHeight: 'h-44 md:h-52',
  },
  {
    grade: 'Grade 7',
    age: 'Age 12-13',
    title: 'My Relationships, My Rules',
    desc: 'Consent, digital safety, and grooming awareness',
    image: '/7th Grade.png',
    color: 'bg-[#E0F2FE]',
    border: 'border-sky-200',
    height: 'min-h-[460px]',
    imgHeight: 'h-48 md:h-56',
  },
  {
    grade: 'Grade 8',
    age: 'Age 13-14',
    title: 'I know who I am',
    desc: 'Mental health, identity, self-esteem',
    image: '/8th Grade.png',
    color: 'bg-[#D1FAE5]',
    border: 'border-emerald-200',
    height: 'min-h-[490px]',
    imgHeight: 'h-52 md:h-60',
  },
  {
    grade: 'Grade 9',
    age: 'Age 14-15',
    title: 'Ready for the World',
    desc: 'Reproductive health, ambition, and life skills',
    image: '/9th Grade.png',
    color: 'bg-[#FEF3C7]',
    border: 'border-amber-200',
    height: 'min-h-[520px]',
    imgHeight: 'h-56 md:h-64',
  }
];

export function JourneySection() {
  return (
    <section className="py-24 bg-[#E8E1F5] relative overflow-hidden">
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
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-heading">
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
              className={`${step.color} ${step.height} p-6 rounded-[2.5rem] border ${step.border} shadow-md flex flex-col items-center justify-start text-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-500`}
            >
              <div className={`relative w-full ${step.imgHeight} mb-6 overflow-hidden rounded-3xl shrink-0 shadow-sm`}>
                <Image
                  src={step.image}
                  alt={step.grade}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="mt-auto flex flex-col items-center w-full">
                <div className="space-y-1 mb-4">
                  <span className="text-lg font-black text-[#303030] block font-heading">{step.grade}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{step.age}</span>
                </div>
                <h3 className="text-base font-bold text-[#4A1E7F] mb-2 leading-tight font-heading">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-base md:text-md text-slate-600 font-medium">
            Each year builds on the last. By <span className="text-primary font-bold">Grade 9</span>, she is equipped — <span className="text-primary font-bold">not just informed.</span>
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

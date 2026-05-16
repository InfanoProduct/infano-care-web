'use client';

import { motion } from 'framer-motion';

const SESSION_STEPS = [
  {
    number: '01',
    title: 'Entry Ritual',
    desc: 'Seating—anonymous emotion check-in. No textbooks.',
  },
  {
    number: '02',
    title: 'Story Hook',
    desc: 'A fictional girl the same age. Her story. What should she do?',
  },
  {
    number: '03',
    title: 'Core Activity',
    desc: 'Hands-on: card sorts, body maps, timelines, strength maps.',
  },
  {
    number: '04',
    title: 'Discussion',
    desc: 'Every response is valid. Safe space to connect.',
  },
  {
    number: '05',
    title: 'Girls-Only',
    desc: 'Deeper, bolder. Menstruation, consent, safety, mental health',
  },
  {
    number: '06',
    title: 'Platform Bridge',
    desc: 'Knowledge about digital learning and app usage',
  }
];

export function SessionSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative Arcs & Flare */}
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 opacity-10 pointer-events-none">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
           <circle cx="0" cy="400" r="350" fill="#4A1E7F" />
           <circle cx="0" cy="400" r="380" stroke="#E67E22" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="absolute right-0 top-1/4 w-64 h-full opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="250" cy="300" r="250" stroke="#E67E22" strokeWidth="40" opacity="0.5" />
        </svg>
      </div>

      {/* Top Right Dots */}
      <div className="absolute top-10 right-12 flex gap-3 z-20">
        <div className="w-5 h-5 bg-[#E67E22] rounded-full" />
        <div className="w-5 h-5 bg-[#E67E22] rounded-full" />
        <div className="w-5 h-5 bg-[#E67E22] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-[#4A1E7F] mb-6 font-heading">
            Inside The Session—What Actually Happens
          </h2>
          <p className="text-lg md:text-xl text-slate-600 font-medium">
            Every session is 45 minutes. Expert-facilitated. Activity-based. Nothing like a class.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {SESSION_STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#F8F4FF] p-10 rounded-[2.5rem] border border-white shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <span className="text-2xl font-black text-[#E67E22] block mb-6 font-heading group-hover:scale-110 transition-transform origin-left">
                {step.number}
              </span>
              <h3 className="text-2xl font-bold text-[#4A1E7F] mb-4 font-heading">
                {step.title}
              </h3>
              <p className="text-lg text-slate-600 italic leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { Package, Smartphone, BookOpen, Video } from 'lucide-react';

const PARENT_STEPS = [
  {
    number: '1',
    title: 'The Welcome Packet',
    desc: 'A beautiful physical kit — warm card, app QR code, a data postcard & a small goodie. Delivered to parents. Zero school effort.',
    icon: Package,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    number: '2',
    title: 'App Onboarding',
    desc: 'Parent scans QR code. Enters daughter\'s access code. Receives weekly insights + conversation starters — never surveillance.',
    icon: Smartphone,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    number: '3',
    title: 'Weekly Learning Journey',
    desc: '\'This week Priya learned about managing her emotions. Here\'s one question to ask her tonight.\' Warm. Non-intrusive. Practical.',
    icon: BookOpen,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    number: '4',
    title: 'Monthly Expert Session',
    desc: 'Live 45-min webinar for parents on topics they struggle with: \'How to talk about consent with a 12-year-old.\'',
    icon: Video,
    color: 'text-pink-500',
    bg: 'bg-pink-50',
  },
];

export function ParentLayerSection() {
  return (
    <section className="py-20 bg-[#F8F4FF] relative overflow-hidden">
      {/* Decorative arc - top right */}
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-60">
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="120" cy="0" r="80" stroke="#C084FC" strokeWidth="28" fill="none" />
        </svg>
      </div>
      {/* Decorative arc - bottom left */}
      <div className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none opacity-40">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="0" cy="100" r="70" stroke="#E67E22" strokeWidth="3" fill="none" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-2 font-heading">
            The Parent Layer
          </h2>
          <p className="text-base text-slate-500 font-medium mb-3">
            Bringing Home Into The Journey
          </p>
          <p className="text-sm text-slate-500 italic max-w-2xl mx-auto leading-relaxed">
            The most powerful thing a girl can have is a parent who actually understands what she is going through.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {PARENT_STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md hover:border-[#4A1E7F]/15 transition-all duration-300 group flex flex-col"
            >
              {/* Step Number */}
              <span className="text-3xl font-black text-[#E67E22] leading-none mb-4 font-heading">
                {step.number}
              </span>

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl ${step.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <step.icon className={step.color} size={20} />
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-primary mb-2 font-heading">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-slate-500 italic leading-relaxed flex-grow">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-xs text-slate-400 italic">
            The school distributes the Welcome Packet During The Session. Infano.Care handles everything else.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

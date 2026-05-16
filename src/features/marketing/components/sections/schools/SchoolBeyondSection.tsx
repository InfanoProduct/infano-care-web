'use client';

import { motion } from 'framer-motion';
import { Award, Newspaper, Share2, Megaphone } from 'lucide-react';

const BENEFITS = [
  {
    title: 'Infano.Care Certified School',
    desc: 'Famed certificate + lobby plaque. Annual renewal badge. India\'s most visible girls\' wellness credential.',
    icon: Award,
  },
  {
    title: 'Media Coverage',
    desc: 'Proactive PR in parenting & education media. Principal quoted as a thought leader. Min 1 feature per year.',
    icon: Newspaper,
  },
  {
    title: 'Social Media Content Pack',
    desc: 'Professional reels, a photo gallery, monthly posts & an annual impact video—ready to post.',
    icon: Share2,
  },
  {
    title: 'Parent Community Activation',
    desc: 'Parents become engaged advocates. School-community connection beyond report cards.',
    icon: Megaphone,
  },
];

export function SchoolBeyondSection() {
  return (
    <section className="py-20 bg-[#FAF9FF] relative overflow-hidden">
      {/* Decorative dots - top right */}
      <div className="absolute top-8 right-10 flex gap-2 z-20">
        <div className="w-3 h-3 bg-[#E67E22] rounded-full opacity-80" />
        <div className="w-3 h-3 bg-[#E67E22] rounded-full opacity-80" />
        <div className="w-3 h-3 bg-[#E67E22] rounded-full opacity-80" />
      </div>

      {/* Decorative arcs - bottom left */}
      <div className="absolute bottom-0 left-0 w-28 h-36 pointer-events-none opacity-40">
        <svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="0" cy="160" r="110" stroke="#C084FC" strokeWidth="30" fill="none" />
          <circle cx="0" cy="160" r="130" stroke="#E67E22" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Decorative arc - right */}
      <div className="absolute top-1/4 right-0 w-20 h-48 pointer-events-none opacity-20">
        <svg viewBox="0 0 80 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="100" r="80" stroke="#E8BFBF" strokeWidth="40" fill="none" />
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
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-3 font-heading">
            What Your School Gets—Beyond The Program
          </h2>
          <p className="text-base md:text-md text-slate-500 font-medium">
            Every session is 45 minutes. Expert-facilitated. Activity-based. Nothing like a class.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 gap-5">
          {BENEFITS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md hover:border-[#4A1E7F]/15 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-11 h-11 shrink-0 rounded-xl bg-orange-50 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                  <item.icon className="text-[#E67E22]" size={20} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 font-heading">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed italic">
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Info, MessageSquare, HelpCircle } from 'lucide-react';
import Image from 'next/image';

const SITUATIONS = [
  {
    title: 'The Incident',
    icon: '😢',
    desc: 'Riya got her period during a school trip. She didn\'t know what was happening.',
    highlight: 'She stayed silent.',
    color: 'bg-[#FDF2F8]', // Light pinkish
  },
  {
    title: 'The Escalation',
    icon: '💬',
    desc: 'Weeks later, someone she trusted online crossed a line.',
    highlight: 'She didn\'t know she could say no.',
    color: 'bg-[#F5F3FF]', // Light purple
    showPhone: true
  },
  {
    title: 'The Blind Spots',
    icon: '❓',
    content: (
      <div className="space-y-6 flex-grow">
        <p className="text-lg italic text-slate-600 leading-snug">
          <strong className="text-[#4A1E7F] block not-italic mb-1">School:</strong> No structured curriculum. <br /> No trained response.
        </p>
        <p className="text-lg italic text-slate-600 leading-snug">
          <strong className="text-[#4A1E7F] block not-italic mb-1">Parents:</strong> Assume she is "too young" for these conversations.
        </p>
      </div>
    ),
    color: 'bg-[#F8FAFC]', // Light slate
  }
];

export function SituationSection() {
  return (
    <section className="py-24 bg-[#FAF9FF] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-[#4A1E7F] mb-4 font-heading">
            The Situation
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16 relative">
          {SITUATIONS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`${item.color} p-10 rounded-[2rem] shadow-sm relative group hover:shadow-md transition-shadow duration-300 min-h-[300px] flex flex-col border border-white/50`}
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl">{item.icon}</span>
                <h3 className="text-2xl font-bold text-[#4A1E7F] font-heading">{item.title}</h3>
              </div>
              
              {item.desc && (
                <div className="flex-grow">
                  <p className="text-slate-600 italic leading-relaxed mb-4 text-lg">
                    {item.desc}
                  </p>
                  <p className="text-[#4A1E7F] font-bold italic text-lg">
                    {item.highlight}
                  </p>
                </div>
              )}

              {item.content && (
                <div className="flex-grow">
                  {item.content}
                </div>
              )}

              {item.showPhone && (
                <div className="absolute -bottom-10 -right-10 w-40 h-40 opacity-90 group-hover:opacity-100 transition-all group-hover:scale-105 z-20">
                  <Image 
                    src="/schools/phone-chat.png" 
                    alt="Phone chat icon" 
                    width={160} 
                    height={160}
                    className="object-contain"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#FDF2F8]/40 backdrop-blur-sm border border-white p-12 rounded-[2.5rem] shadow-sm max-w-4xl mx-auto relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle className="text-red-500" size={40} />
            </div>
            <div className="flex-grow">
              <h3 className="text-3xl md:text-4xl font-black text-[#4A1E7F] mb-8 font-heading">
                This is not just a student issue.
              </h3>
              <div className="grid sm:grid-cols-2 gap-x-16 gap-y-4">
                {[
                  'Reputation risk',
                  'Safety liability',
                  'Parent dissatisfaction',
                  'Missed well-being outcomes'
                ].map((point, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-slate-900 rounded-full shrink-0" />
                    <span className="text-slate-700 font-medium italic text-lg leading-tight">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative Image - Sad Girl */}
      <div className="absolute bottom-[-5%] left-[-5%] w-[350px] h-[350px] z-0 hidden lg:block pointer-events-none">
        <div className="relative w-full h-full">
           <Image 
            src="/schools/situation-girl.png" 
            alt="Student reflecting" 
            fill
            className="object-cover rounded-[4rem] transform rotate-[-8deg] border-[12px] border-white shadow-2xl"
          />
        </div>
      </div>

      {/* Decoration: Dots */}
      <div className="absolute bottom-8 right-12 flex gap-3 z-20">
        <div className="w-5 h-5 bg-[#E67E22] rounded-full opacity-80" />
        <div className="w-5 h-5 bg-[#E67E22] rounded-full opacity-80" />
        <div className="w-5 h-5 bg-[#E67E22] rounded-full opacity-80" />
      </div>
    </section>
  );
}

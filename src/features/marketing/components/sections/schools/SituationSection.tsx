'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, MessageSquare, Search } from 'lucide-react';

const SITUATIONS = [
  {
    title: 'The Incident',
    icon: <AlertCircle size={22} />,
    iconColor: 'text-pink-600',
    desc: 'Riya got her period during a school trip. She didn\'t know what was happening.',
    highlight: 'She stayed silent.',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
  },
  {
    title: 'The Escalation',
    icon: <MessageSquare size={22} />,
    iconColor: 'text-purple-600',
    desc: 'Weeks later, someone she trusted online crossed a line.',
    highlight: 'She didn\'t know she could say no.',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  {
    title: 'The Blind Spots',
    icon: <Search size={22} />,
    iconColor: 'text-slate-600',
    schoolText: 'No structured curriculum. No trained response.',
    parentText: 'Assume she is "too young" for these conversations.',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
  },
];

export function SituationSection() {
  return (
    <section className="py-16 bg-[#FAF9FF] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-primary mb-3">
            The Situation
          </h2>
          <p className="text-base md:text-md text-slate-500 font-medium">
            This is not a hypothetical. This is happening in your school right now.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {SITUATIONS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`${item.bg} ${item.border} border p-7 rounded-2xl shadow-sm flex flex-col gap-4`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-white ${item.iconColor}`}>
                  {item.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight font-heading">{item.title}</h3>
              </div>

              {item.desc && (
                <div className="space-y-2">
                  <p className="text-slate-500 leading-relaxed text-xs md:text-sm font-medium">{item.desc}</p>
                  <p className="text-xs md:text-sm font-bold text-primary">{item.highlight}</p>
                </div>
              )}

              {item.schoolText && (
                <div className="space-y-3">
                  <div>
                    <span className="text-xs md:text-sm font-bold text-primary block mb-0.5">School:</span>
                    <p className="text-slate-500 leading-relaxed text-xs md:text-sm font-medium">{item.schoolText}</p>
                  </div>
                  <div>
                    <span className="text-xs md:text-sm font-bold text-primary block mb-0.5">Parents:</span>
                    <p className="text-slate-500 leading-relaxed text-xs md:text-sm font-medium">{item.parentText}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm max-w-3xl mx-auto"
        >
          <div className="flex items-start gap-5">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="text-red-500" size={20} />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight font-heading mb-4">
                This is not just a student issue.
              </h3>
              <div className="grid sm:grid-cols-2 gap-x-10 gap-y-3">
                {['Reputation risk', 'Safety liability', 'Parent dissatisfaction', 'Missed well-being outcomes'].map((point, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0" />
                    <span className="text-slate-500 leading-relaxed text-xs md:text-sm font-medium">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

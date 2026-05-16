'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, HeartHandshake, EyeOff, BellRing } from 'lucide-react';

const RESPONSES = [
  {
    q: "'Is it safe?'",
    a: "Completely. No ads, no strangers, no public spaces. Everything is moderated.",
    icon: <ShieldCheck className="text-rose-600" size={24} />,
    color: 'bg-rose-50/60',
    iconBg: 'bg-rose-100/80'
  },
  {
    q: "'Will it replace me?'",
    a: "Never. Infano helps girls open up — often, that means talking more, not less, with you.",
    icon: <HeartHandshake className="text-amber-600" size={24} />,
    color: 'bg-amber-50/60',
    iconBg: 'bg-amber-100/80'
  },
  {
    q: "'What will she see?'",
    a: "Only age-appropriate, expert-reviewed content — thoughtfully designed to inform and empower.",
    icon: <EyeOff className="text-sky-600" size={24} />,
    color: 'bg-sky-50/60',
    iconBg: 'bg-sky-100/80'
  },
  {
    q: "'Will I know what's happening?'",
    a: "You have a parent dashboard showing her progress (not her private journal entries or health data).",
    icon: <BellRing className="text-violet-600" size={24} />,
    color: 'bg-violet-50/60',
    iconBg: 'bg-violet-100/80'
  },
];

export function ParentsResponse() {
  return (
    <section className="py-20 bg-[#FFFCFA] relative overflow-hidden">
      {/* Background Graphic Elements for Glass Effect */}
      <div className="absolute top-1/4 right-0 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 left-0 w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title"
          >
            We heard you. <br />
            <span className="text-primary">This is how Infano responds.</span>
          </motion.h2>
          <p className="section-subtitle">
            We understand the delicate balance of protection and independence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {RESPONSES.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group p-10 ${item.color} backdrop-blur-xl rounded-2xl border border-white shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex items-start gap-8`}
            >
              <div className={`w-14 h-14 ${item.iconBg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
                {item.icon}
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{item.q}</h4>
                <p className="text-slate-500 leading-relaxed font-medium">{item.a}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

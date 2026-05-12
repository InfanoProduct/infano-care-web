'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, HeartHandshake, EyeOff, BellRing } from 'lucide-react';

const RESPONSES = [
  { q: "'Is it safe?'", a: "Completely. No ads, no strangers, no public spaces. Everything is moderated.", icon: <ShieldCheck className="text-primary" size={24} />, color: 'bg-primary/5' },
  { q: "'Will it replace me?'", a: "Never. Infano helps girls open up — often, that means talking more, not less, with you.", icon: <HeartHandshake className="text-accent" size={24} />, color: 'bg-accent/5' },
  { q: "'What will she see?'", a: "Only age-appropriate, expert-reviewed content — thoughtfully designed to inform and empower.", icon: <EyeOff className="text-blue-500" size={24} />, color: 'bg-blue-50' },
  { q: "'Will I know what's happening?'", a: "You have a parent dashboard showing her progress (not her private journal entries or health data).", icon: <BellRing className="text-purple-500" size={24} />, color: 'bg-purple-50' },
];

export function ParentsResponse() {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-6 tracking-tight"
          >
            We heard you. <br />
            <span className="text-primary">This is how Infano responds.</span>
          </motion.h2>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
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
              className="group p-10 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:border-primary/20 transition-all duration-500 flex items-start gap-8"
            >
              <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
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

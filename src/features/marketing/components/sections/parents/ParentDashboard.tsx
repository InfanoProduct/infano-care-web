'use client';

import { motion } from 'framer-motion';
import { ChartBar, ShieldAlert, Target, MessageSquare } from 'lucide-react';

const FEATURES = [
  { title: 'Weekly Summary', desc: 'Learning modules completed and topics explored', icon: <ChartBar size={24} /> },
  { title: 'Wellness Flags', desc: 'If our system detects a concern (and she consents), you are notified', icon: <ShieldAlert size={24} /> },
  { title: 'Monthly Progress', desc: 'Skills developed, milestones reached', icon: <Target size={24} /> },
  { title: 'Curated Prompts', desc: 'Weekly conversation starter suggestions to use at home', icon: <MessageSquare size={24} /> },
];

export function ParentDashboard() {
  return (
    <section className="py-32 bg-[#F8FAFC]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-6 tracking-tight"
          >
            Stay informed <span className="text-primary">without invading.</span>
          </motion.h2>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Your parent dashboard gives you a meaningful, non-intrusive view of your daughter's Infano journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {FEATURES.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-xl border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary/5 text-primary rounded-lg flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-white p-12 rounded-2xl border border-slate-100 shadow-2xl shadow-slate-200/40 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
          <p className="text-xl md:text-2xl font-medium text-slate-700 italic mb-8 leading-relaxed">
            "Infano has given me a bridge back to my daughter. We use the weekly prompts over dinner and she actually talks to me now."
          </p>
          <div className="flex items-center justify-center gap-4">
             <div className="w-10 h-px bg-slate-200" />
             <span className="font-bold text-primary tracking-widest uppercase text-xs">Parent, Bengaluru</span>
             <div className="w-10 h-px bg-slate-200" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { ChartBar, ShieldAlert, Target, MessageSquare } from 'lucide-react';

const FEATURES = [
  { 
    title: 'Weekly Summary', 
    desc: 'Learning modules completed and topics explored', 
    icon: <ChartBar size={24} />,
    color: 'bg-violet-50/60 text-violet-600',
    borderColor: 'border-violet-100'
  },
  { 
    title: 'Wellness Flags', 
    desc: 'If our system detects a concern (and she consents), you are notified', 
    icon: <ShieldAlert size={24} />,
    color: 'bg-rose-50/60 text-rose-600',
    borderColor: 'border-rose-100'
  },
  { 
    title: 'Monthly Progress', 
    desc: 'Skills developed, milestones reached', 
    icon: <Target size={24} />,
    color: 'bg-emerald-50/60 text-emerald-600',
    borderColor: 'border-emerald-100'
  },
  { 
    title: 'Curated Prompts', 
    desc: 'Weekly conversation starter suggestions to use at home', 
    icon: <MessageSquare size={24} />,
    color: 'bg-amber-50/60 text-amber-600',
    borderColor: 'border-amber-100'
  },
];

export function ParentDashboard() {
  return (
    <section className="py-24 bg-[#FFFCFA] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title"
          >
            Stay informed <span className="text-primary">without invading.</span>
          </motion.h2>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Your parent dashboard gives you a meaningful, non-intrusive view of your daughter's Infano journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {FEATURES.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`backdrop-blur-xl ${feature.color} p-8 rounded-3xl border ${feature.borderColor} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
            >
              <div className="w-12 h-12 bg-white/80 text-inherit rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                {feature.icon}
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">{feature.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-white/40 backdrop-blur-xl p-10 md:p-14 rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/30 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-primary/20" />
          <p className="text-xl md:text-2xl font-medium text-slate-700 italic mb-10 leading-relaxed relative z-10">
            "Infano has given me a bridge back to my daughter. We use the weekly prompts over dinner and she actually talks to me now."
          </p>
          <div className="flex items-center justify-center gap-4 relative z-10">
             <div className="w-8 h-px bg-primary/20" />
             <span className="font-bold text-primary tracking-widest uppercase text-[10px]">Parent, Bengaluru</span>
             <div className="w-8 h-px bg-primary/20" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, BarChart3, Globe2, BookOpen, Users } from 'lucide-react';

const ADVANTAGES = [
  { 
    title: 'NEP 2020 Aligned', 
    desc: 'Mapped to socio-emotional learning (SEL) and life skills mandates.',
    icon: <BookOpen className="text-emerald-500" size={24} />,
    color: 'bg-emerald-50'
  },
  { 
    title: 'Data-Driven Insights', 
    desc: 'Proprietary dashboards for institutional wellness tracking.',
    icon: <BarChart3 className="text-blue-500" size={24} />,
    color: 'bg-blue-50'
  },
  { 
    title: 'Expert Facilitation', 
    desc: 'Direct access to certified adolescent health and wellness experts.',
    icon: <Users className="text-purple-500" size={24} />,
    color: 'bg-purple-50'
  },
  { 
    title: 'Privacy Focused', 
    desc: 'Enterprise-grade security and DPDP compliance.',
    icon: <ShieldCheck className="text-primary" size={24} />,
    color: 'bg-primary/5'
  }
];

export function SchoolAdvantage() {
  return (
    <section className="py-32 bg-slate-50/30">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-4 sticky top-32">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-6 inline-block"
            >
              Why Partner With Us
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-8 leading-tight">
              The Infano <br /> Advantage.
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed font-medium">
              We provide the technical and expert infrastructure required to implement a world-class wellness programme without increasing teacher workload.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {ADVANTAGES.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 group hover:shadow-2xl transition-all duration-500"
              >
                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                  {item.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">{item.title}</h4>
                <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

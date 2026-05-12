'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, School, Home, Gift } from 'lucide-react';

const OPTIONS = [
  { 
    title: 'Through Your School', 
    desc: "If your daughter's school is an Infano partner, she may already have access. Ask your school's wellness coordinator.",
    icon: <School size={32} />,
    linkText: 'Contact Coordinator',
    color: 'bg-slate-50'
  },
  { 
    title: 'Direct Family Access', 
    desc: "Enrol directly through the website or app. Includes full app access for your daughter and the parent dashboard.",
    icon: <Home size={32} />,
    linkText: 'Enrol Now',
    color: 'bg-primary/5',
    featured: true
  },
  { 
    title: 'Gift the Book', 
    desc: "Start the conversation with the Infano book — a beautiful, honest guide for adolescent girls.",
    icon: <Gift size={32} />,
    linkText: 'Buy the Book',
    color: 'bg-slate-50'
  },
];

export function AccessOptions() {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-6 tracking-tight"
          >
            Access Options for Parents.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {OPTIONS.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-12 rounded-xl border ${item.featured ? 'border-primary/20 shadow-2xl' : 'border-slate-100 shadow-xl shadow-slate-200/20'} ${item.color} flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-500`}
            >
              <div className={`w-20 h-20 ${item.featured ? 'bg-primary text-white' : 'bg-white text-slate-400'} rounded-2xl flex items-center justify-center mb-8 shadow-lg transition-transform group-hover:scale-110`}>
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium mb-10 flex-1">
                {item.desc}
              </p>
              <Link 
                href="/contact" 
                className={`inline-flex items-center gap-3 font-bold uppercase tracking-widest text-xs py-4 px-8 rounded-lg transition-all ${
                  item.featured 
                  ? 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20' 
                  : 'bg-slate-900 text-white hover:bg-primary'
                }`}
              >
                {item.linkText} <ArrowRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

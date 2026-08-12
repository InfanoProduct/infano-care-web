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
    href: '/contact',
    color: 'bg-emerald-50/60',
    borderColor: 'border-emerald-100',
    iconColor: 'text-emerald-500'
  },
  {
    title: 'Direct Family Access',
    desc: "Enrol directly through the website or app. Includes full app access for your daughter and the parent dashboard.",
    icon: <Home size={32} />,
    linkText: 'Enrol Now',
    href: '/programs/the unfiltered journey',
    color: 'bg-primary/10',
    borderColor: 'border-primary/20',
    iconColor: 'text-primary',
    featured: true
  },
  {
    title: 'Gift the Book',
    desc: "Start the conversation with the Infano book — a beautiful, honest guide for adolescent girls.",
    icon: <Gift size={32} />,
    linkText: 'Buy the Book',
    href: '/gigi-the-awkward-age-book',
    color: 'bg-amber-50/60',
    borderColor: 'border-amber-100',
    iconColor: 'text-amber-500'
  },
];

export function AccessOptions() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900"
          >
            Access Options <span className="text-primary">for Parents.</span>
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
              className={`p-10 rounded-3xl border backdrop-blur-xl ${item.color} ${item.borderColor} ${item.featured ? 'shadow-2xl shadow-primary/10' : 'shadow-xl shadow-slate-200/20'} flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-500`}
            >
              <div className={`w-20 h-20 bg-white/80 ${item.iconColor} rounded-[2rem] flex items-center justify-center mb-8 shadow-sm transition-transform group-hover:scale-110`}>
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium mb-10 flex-1">
                {item.desc}
              </p>
              <Link
                href={item.href}
                className={`inline-flex items-center gap-3 font-bold uppercase tracking-widest text-[10px] py-4 px-10 rounded-2xl transition-all shadow-xl ${item.featured
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                  : 'bg-slate-900 text-white hover:bg-primary shadow-slate-900/10'
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

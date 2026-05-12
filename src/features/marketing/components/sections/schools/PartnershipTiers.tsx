'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const TIERS = [
  { 
    tier: 'Tier 01', 
    title: 'Digital', 
    features: ['Standard App Access', 'Basic Reporting', 'Self-Serve Portal'],
    desc: 'Empower students with self-paced digital wellness tools.',
    color: 'border-slate-100'
  },
  { 
    tier: 'Tier 02', 
    title: 'Blended', 
    features: ['Expert-led Circles', 'Infano Book copies', 'Parent Workshops'],
    desc: 'A mix of digital tools and live expert guidance.',
    color: 'border-primary/20 bg-primary/[0.02]',
    popular: true
  },
  { 
    tier: 'Tier 03', 
    title: 'Full', 
    features: ['On-campus Orientation', 'Custom Content', 'Priority Support'],
    desc: 'Deep integration with on-ground support and custom curriculum.',
    color: 'border-accent/20 bg-accent/[0.02]'
  }
];

export function PartnershipTiers() {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold font-heading text-slate-900 mb-6 tracking-tight"
          >
            Partnership Structures.
          </motion.h2>
          <p className="text-lg text-slate-500 font-medium">
            Choose the level of integration that fits your institution's goals and infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {TIERS.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-10 lg:p-14 rounded-[3rem] border ${item.color} flex flex-col h-full group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-700`}
            >
              {item.popular && (
                <div className="absolute top-8 right-8 px-4 py-1.5 bg-primary text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">{item.tier}</span>
              <h3 className="text-3xl font-bold text-slate-900 mb-6">{item.title}</h3>
              <p className="text-slate-500 mb-10 leading-relaxed font-medium">
                {item.desc}
              </p>
              
              <div className="space-y-5 mb-12 flex-1">
                 {item.features.map((f, idx) => (
                   <div key={idx} className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <CheckCircle2 size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{f}</span>
                   </div>
                 ))}
              </div>

              <Link 
                href="/contact" 
                className={`w-full py-5 rounded-full text-center font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 ${
                  item.popular 
                  ? 'bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary-dark' 
                  : 'bg-slate-900 text-white hover:bg-primary'
                }`}
              >
                 Inquire Now <ArrowRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

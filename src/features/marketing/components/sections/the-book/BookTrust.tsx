'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, GraduationCap, Heart } from 'lucide-react';

const TRUST_POINTS = [
  {
    icon: <ShieldCheck className="text-primary" size={32} />,
    title: "Medically Verified",
    desc: "Content vetted by child psychologists and gynecologists for age-appropriate accuracy."
  },
  {
    icon: <GraduationCap className="text-primary" size={32} />,
    title: "Expert Designed",
    desc: "Curriculum developed by educators to align with modern adolescent development needs."
  },
  {
    icon: <Heart className="text-primary" size={32} />,
    title: "Empathy First",
    desc: "A warm, sisterly tone that makes sensitive topics easy to discuss and understand."
  }
];

export function BookTrust() {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-4"
          >
            Why Parents Trust Infano
          </motion.h2>
          <div className="w-12 h-1 bg-primary/20 mx-auto rounded-full" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TRUST_POINTS.map((point, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                {point.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{point.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium">{point.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

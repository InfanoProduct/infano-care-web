'use client';

import { motion } from 'framer-motion';
import { FaqSection } from '../FaqSection';
import { SCHOOL_FAQS } from '../../../data/faqs';

export function GovernanceSection() {
  const sideContent = (
    <div>
      <motion.span 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-6 inline-block"
      >
        Security & Compliance
      </motion.span>
      <h2 className="text-4xl md:text-6xl font-bold font-heading text-slate-900 mb-8 leading-tight tracking-tight">
        Governance & <br /> Safeguarding.
      </h2>
      <p className="text-lg text-slate-500 leading-relaxed font-medium max-w-lg mb-12">
        Student safety is our highest priority. We maintain enterprise-grade security protocols and rigorous content moderation.
      </p>
      
      <div className="flex flex-wrap gap-10">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-slate-900 mb-1">DPDP</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Act Compliant</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-slate-900 mb-1">AES-256</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Encryption</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-slate-900 mb-1">24/7</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Moderation</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-primary-light)_0%,_transparent_70%)] opacity-[0.03] pointer-events-none" />
      <FaqSection 
        items={SCHOOL_FAQS}
        theme="transparent"
        layout="split"
        sideContent={sideContent}
      />
    </div>
  );
}

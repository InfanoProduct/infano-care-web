'use client';

import { motion } from 'framer-motion';
import { PeerLineHeroAction } from '@/components/marketing/PeerLineHeroAction';

export function PeerBanner() {
  return (
    <section className="py-24 bg-primary/5 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 inline-block">
            Join the Movement
          </span>
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight text-slate-900">
            Want to lead? <br />
            <span className="text-primary">Become a Peer Mentor</span>
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed font-medium mb-12">
            Step up and make a difference. Train with experts, build your leadership skills, and guide younger girls in our secure, supportive community.
          </p>
          
          <PeerLineHeroAction />
        </motion.div>
      </div>
    </section>
  );
}

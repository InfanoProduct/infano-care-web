"use client";

import { motion } from 'framer-motion';
import { Beaker, Users, ShieldCheck, Globe } from 'lucide-react';

export default function AboutApproach() {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight text-slate-900"
          >
            Built on evidence. <br />
            <span className="text-slate-400 font-medium italic">Delivered with heart.</span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Beaker,
              title: "Evidence-Based",
              desc: "Grounded in adolescent psychology and trauma-informed care principles.",
              color: "bg-[#F3F0FF]",
              iconColor: "text-indigo-600"
            },
            {
              icon: Users,
              title: "Co-Created",
              desc: "Every feature is tested with real girls to ensure it speaks their language.",
              color: "bg-[#FFF0F3]",
              iconColor: "text-rose-600"
            },
            {
              icon: ShieldCheck,
              title: "Safety First",
              desc: "End-to-end encrypted and COPPA-aligned with strict moderation.",
              color: "bg-[#F0FFF4]",
              iconColor: "text-emerald-600"
            },
            {
              icon: Globe,
              title: "Local Context",
              desc: "Designed for the Indian context, sensitive to regional and cultural norms.",
              color: "bg-[#FFF9F0]",
              iconColor: "text-amber-600"
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`p-10 rounded-[2.5rem] ${item.color} group hover:scale-[1.02] transition-all duration-500`}
            >
              <div className={`w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${item.iconColor}`}>
                <item.icon size={32} />
              </div>
              <h4 className="text-xl font-bold font-heading text-slate-900 mb-4 tracking-tight">{item.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

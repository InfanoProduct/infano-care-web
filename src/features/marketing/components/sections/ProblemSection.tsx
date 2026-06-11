'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ProblemCard } from '../cards/ProblemCard';

const PROBLEMS = [
  {
    title: "1 in 2",
    desc: "Adolescent girls experience anxiety or low self-esteem by age 14",
    color: "bg-[#FEF9C3]",
    image: "/HS2-1.png",
    link: "/impact",
    tags: ["Mental Health", "Adolescence", "Self-Esteem", "Support"]
  },
  {
    title: "73%",
    desc: "Of girls have no trusted adult to discuss menstrual health with",
    color: "bg-[#F5F3FF]",
    image: "/HS2-2.png",
    link: "/impact",
    tags: ["Health Literacy", "Support Gap", "Menstrual Health", "Guidance"]
  },
  {
    title: "Only 9%",
    desc: "Of schools offer structured emotional wellness programs for girls",
    color: "bg-[#FFEDD5]",
    image: "/HS2-3.png",
    link: "/impact",
    tags: ["Education", "Wellness", "Empowerment", "Awareness"]
  }
];

export function ProblemSection() {
  return (
    <section className="pt-8 pb-8 lg:pt-10 lg:pb-20 bg-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-accent/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-8"
          >
            The Reality
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900">
            Adolescence is the most <br /> <span className="text-primary">defining chapter</span> in a girl's life.
          </h2>
          <p className="text-base md:text-md text-slate-500 leading-relaxed font-medium">
            Yet, it is often the most neglected. Between ages 10 and 21, she navigates a world that often tells her to be <span className="text-slate-900 font-semibold">quieter, smaller, and less.</span>
          </p>
          <div className="mt-12 h-1 w-24 bg-primary/20 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {PROBLEMS.map((problem, index) => (
            <ProblemCard
              key={index}
              index={index}
              {...problem}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

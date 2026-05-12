'use client';

import { motion } from 'framer-motion';
import { PartnerEditorialCard } from '../cards/PartnerEditorialCard';

const AUDIENCES = [
  {
    title: "For Schools",
    icon: "🏫",
    desc: "Integrate Infano.care as a structured wellness and life-skills programme. Curriculum-aligned, safe, and measurable impact.",
    image: "/editorial-1.png",
    link: "/schools",
    themeColor: "emerald-400",
    features: [
      { label: "Teacher Dashboard" },
      { label: "Impact Reporting" },
      { label: "Safe Peer Groups" },
      { label: "Curriculum Alignment" },
    ]
  },
  {
    title: "For Parents & Carers",
    icon: "👩‍👧",
    desc: "Give your daughter a private, expert-supported space to grow, while staying informed and connected as a family.",
    image: "/editorial-2.png",
    link: "/parents",
    themeColor: "rose-300",
    features: [
      { label: "Expert-Verified Content" },
      { label: "Growth Tracking" },
      { label: "Parent Resources" },
      { label: "Family Connection" },
    ]
  }
];

export function AudienceSection() {
  return (
    <section className="py-32 bg-[#FAF9FF] relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
        
        {/* Floating Graphics */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[10%] w-20 h-20 border-2 border-primary/10 rounded-3xl"
        />
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] left-[5%] w-16 h-16 bg-accent/5 rounded-full"
        />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold font-heading mb-6 tracking-tight text-slate-900"
          >
            Every girl. Every school. <br /> <span className="text-primary">Every family.</span>
          </motion.h2>
          <p className="text-lg text-slate-500 font-medium">
            We've built Infano.care to be the missing piece in the puzzle of adolescent growth, 
            connecting the dots between education, wellness, and home.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {AUDIENCES.map((audience, index) => (
            <PartnerEditorialCard 
              key={index}
              {...audience}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

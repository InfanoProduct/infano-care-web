'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, HeartHandshake, Sparkles } from 'lucide-react';

const ABOUT_POINTS = [
  {
    step: "01",
    badge: "Medical Rigour",
    icon: ShieldCheck,
    iconColor: "text-indigo-600 group-hover:text-indigo-700",
    iconBg: "bg-indigo-500/10 border-indigo-500/15 group-hover:bg-indigo-500/15",
    topAccent: "from-indigo-500 via-purple-500 to-indigo-500",
    glowColor: "from-indigo-500/10 via-purple-500/5 to-transparent",
    title: "Medically Accurate",
    desc: "Verified by doctors, child psychologists, and counsellors for age-appropriate, scientific accuracy.",
    highlight: "Doctor & counsellor approved"
  },
  {
    step: "02",
    badge: "Cultural Nuance",
    icon: HeartHandshake,
    iconColor: "text-violet-600 group-hover:text-violet-700",
    iconBg: "bg-violet-500/10 border-violet-500/15 group-hover:bg-violet-500/15",
    topAccent: "from-violet-500 via-pink-500 to-violet-500",
    glowColor: "from-violet-500/10 via-pink-500/5 to-transparent",
    title: "Culturally Aware",
    desc: "Designed specifically for the nuances, language, and everyday reality of modern Indian families.",
    highlight: "Tailored for Indian homes"
  },
  {
    step: "03",
    badge: "Active Learning",
    icon: Sparkles,
    iconColor: "text-pink-600 group-hover:text-pink-700",
    iconBg: "bg-pink-500/10 border-pink-500/15 group-hover:bg-pink-500/15",
    topAccent: "from-pink-500 via-rose-500 to-pink-500",
    glowColor: "from-pink-500/10 via-rose-500/5 to-transparent",
    title: "Interactive Growth",
    desc: "Packed with exercises, reflection prompts, and guided activities that spark authentic confidence.",
    highlight: "Action-driven workbook"
  }
];

export function BookAbout() {
  return (
    <section className="py-24 bg-gradient-to-b from-white via-[#FAF9FF]/60 to-white relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px] bg-primary/8 px-3.5 py-1.5 rounded-full inline-block mb-4 border border-primary/10">
            A New Standard
          </span>
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 leading-tight tracking-tight text-slate-900">
            Why every girl deserves this guide.
          </h2>
          <p className="text-base md:text-lg text-slate-500 leading-relaxed font-medium">
            Most books for girls either treat them as too young to know the truth or too fragile to handle it.
            The Infano book speaks to girls as the intelligent, curious, and capable young women they are.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {ABOUT_POINTS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="group relative bg-white rounded-xl p-8 border border-slate-200/80 hover:border-primary/30 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(88,56,140,0.12)] transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1.5"
              >
                {/* Top accent line on hover */}
                <div
                  className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${item.topAccent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />

                {/* Subtle corner glow */}
                <div
                  className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${item.glowColor} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                />

                <div className="relative z-10">
                  {/* Card Header: Icon & Step Counter */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-xs ${item.iconBg} ${item.iconColor}`}
                    >
                      <Icon size={22} className="transition-transform group-hover:scale-110 duration-300" />
                    </div>
                    <span className="text-xs font-mono font-bold tracking-widest text-slate-300 group-hover:text-primary/50 transition-colors">
                      {item.step}
                    </span>
                  </div>

                  {/* Micro Category Badge */}
                  <div className="mb-2.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                      {item.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold font-heading text-xl text-slate-900 mb-3 tracking-tight group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-500 text-sm sm:text-[14.5px] leading-relaxed font-normal mb-8">
                    {item.desc}
                  </p>
                </div>

                {/* Card Footer Micro-proof */}
                <div className="relative z-10 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{item.highlight}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


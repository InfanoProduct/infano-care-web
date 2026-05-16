'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const SCHEDULE = [
  { day: '🌅 Monday', desc: "10-minute story chapter from 'The Courage Code'. Reflective prompt in her journal.", color: 'bg-rose-50/70', iconBg: 'bg-rose-100' },
  { day: '🌙 Tuesday', desc: "Period tracker log. AI provides a wellness tip based on her cycle day.", color: 'bg-amber-50/70', iconBg: 'bg-amber-100' },
  { day: '🎮 Wednesday', desc: "Gamified quiz on emotional intelligence. Earns a 'Self-Awareness' badge.", color: 'bg-sky-50/70', iconBg: 'bg-sky-100' },
  { day: '🤝 Thursday', desc: "Joins a live Expert Circle on managing exam stress. Asks an anonymous question.", color: 'bg-emerald-50/70', iconBg: 'bg-emerald-100' },
  { day: '👯 Friday', desc: "Shares a thought in her school's Infano community. Gets encouragement from peers.", color: 'bg-violet-50/70', iconBg: 'bg-violet-100' },
];

export function DaughterExperience() {
  return (
    <section className="py-24 bg-[#FFFCFA] text-slate-900 relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4 inline-block"
            >
              The Journey
            </motion.span>
            <h2 className="section-title">
              What Your Daughter <br /> Will Experience.
            </h2>
            <p className="section-subtitle max-w-lg">
              From the moment she opens Infano, she enters a world designed entirely for her—guided gently and celebrated genuinely.
            </p>

            <div className="space-y-3">
              {SCHEDULE.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl ${item.color} backdrop-blur-md border border-white shadow-sm hover:shadow-md transition-all duration-300`}
                >
                  <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-inner`}>
                    {item.day.split(' ')[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-0.5">{item.day.split(' ')[1]}</span>
                    <p className="text-slate-600 text-[13px] font-medium leading-snug">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-20 aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white"
            >
              <Image
                src="/ParentsImg2.png"
                alt="Empowered girl"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent opacity-60" />

              {/* Overlay Badge */}
              <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl">
                <span className="text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-2 block text-center">Safe Space</span>
                <p className="text-slate-800 text-sm font-semibold leading-relaxed text-center italic">
                  "I finally feel like there's a place where I can ask anything without being judged."
                </p>
              </div>
            </motion.div>

            {/* Floating Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}

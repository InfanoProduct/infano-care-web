'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const SCHEDULE = [
  { day: '🌅 Monday', desc: "10-minute story chapter from 'The Courage Code'. Reflective prompt in her journal." },
  { day: '🌙 Tuesday', desc: "Period tracker log. AI provides a wellness tip based on her cycle day." },
  { day: '🎮 Wednesday', desc: "Gamified quiz on emotional intelligence. Earns a 'Self-Awareness' badge." },
  { day: '🤝 Thursday', desc: "Joins a live Expert Circle on managing exam stress. Asks an anonymous question." },
  { day: '👯 Friday', desc: "Shares a thought in her school's Infano community. Gets encouragement from peers." },
];

export function DaughterExperience() {
  return (
    <section className="py-32 bg-[#0F172A] text-white relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-[150px]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-primary font-black uppercase tracking-[0.4em] text-xs mb-6 inline-block"
            >
              The Journey
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-bold font-heading mb-8 leading-tight tracking-tight">
              What Your Daughter <br /> Will Experience.
            </h2>
            <p className="text-lg text-slate-400 mb-12 leading-relaxed font-medium">
              From the moment she opens Infano, she enters a world designed entirely for her—guided gently and celebrated genuinely.
            </p>
            
            <div className="space-y-4">
              {SCHEDULE.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="text-xl shrink-0">{item.day.split(' ')[0]}</div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{item.day.split(' ')[1]}</span>
                    <p className="text-slate-300 text-sm font-medium">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative">
            {/* Image Overlay with Contrast */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-20 aspect-[4/5] rounded-2xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/10"
            >
              <Image 
                src="https://images.unsplash.com/photo-1517230814606-2e3d00dad623?auto=format&fit=crop&q=80" 
                alt="Empowered girl"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-60" />
              
              {/* Overlay Badge */}
              <div className="absolute bottom-10 left-10 right-10 p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2 block">Safe Space</span>
                <p className="text-sm font-medium leading-relaxed">
                  "I finally feel like there's a place where I can ask anything without being judged."
                </p>
              </div>
            </motion.div>
            
            {/* Floating Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { Layers, BookOpen, Star, Sparkles } from 'lucide-react';

const ACHIEVEMENTS = [
  {
    icon: <Layers size={20} className="text-slate-600" />,
    title: "Build Real-World Confidence",
    desc: "Discover how to handle emotions, friendships, and self-doubt with courage."
  },
  {
    icon: <BookOpen size={20} className="text-slate-600" />,
    title: "Strengthen Parent-Child Connection",
    desc: "Open honest conversations that make growing up easier for both sides."
  },
  {
    icon: <Star size={20} className="text-slate-600" />,
    title: "Embrace Self-Love & Identity",
    desc: "Learn to accept your unique journey and celebrate your authentic self."
  },
  {
    icon: <Sparkles size={20} className="text-slate-600" />,
    title: "Develop Emotional Intelligence",
    desc: "Understand feelings deeply, respond wisely, and grow into balanced adulthood."
  }
];

export function BookAchieve() {
  return (
    <section className="py-24 bg-[#f3f1ff] relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-heading text-slate-900 tracking-tight"
          >
            What you'll achieve with this book
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ACHIEVEMENTS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Decorative Glow */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/10 blur-2xl rounded-full transition-transform group-hover:scale-150" />

              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-6 relative z-10">
                {item.icon}
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-4 leading-tight">
                {item.title}
              </h3>

              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

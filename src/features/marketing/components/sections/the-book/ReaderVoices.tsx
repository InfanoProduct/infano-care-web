import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Quote } from 'lucide-react';

const VOICES = [
  { quote: "I didn't know a book could feel like a hug. I've read mine three times already.", author: "Sneha, 14", location: "Pune" },
  { quote: "I bought a copy for every girl in my daughter's class. It started conversations we'd never had before.", author: "Meera", location: "Chennai" },
  { quote: "We've added the Infano book to our Grade 8 wellness curriculum. The girls are asking more questions.", author: "Dr. Kavita", location: "School Principal" },
  { quote: "The interactive prompts made it so much easier for me to journal my feelings. It feels like a friend who understands.", author: "Aisha, 13", location: "Delhi" },
  { quote: "Finally, a book that doesn't talk down to us. The illustrations are beautiful and the advice is actually useful.", author: "Riya, 16", location: "Bangalore" },
  { quote: "My daughter and I read a chapter every Sunday. It's become our favorite bonding time.", author: "Rajesh", location: "Parent" },
];

export function ReaderVoices() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % VOICES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-[#02003a] relative overflow-hidden">
      {/* Background Graphic Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft Vibrant Blurs - Increased visibility for dark bg */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-400/20 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4" />

        {/* Subtle Decorative Grid - Light for dark bg */}
        <div className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />

        {/* Floating Soft Shapes */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              repeat: Infinity,
              duration: 7 + i,
              ease: "easeInOut",
              delay: i * 0.8
            }}
            className="absolute w-32 h-32 bg-white/10 rounded-full blur-2xl"
            style={{
              top: `${15 + i * 20}%`,
              left: `${10 + (i * 25) % 80}%`,
            }}
          />
        ))}
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-heading mb-4 tracking-tight text-white uppercase tracking-[0.1em]"
          >
            Reader Voices
          </motion.h2>
          {/* Glowing Underline */}
          <div className="w-24 h-1.5 bg-primary rounded-full mx-auto shadow-[0_0_15px_rgba(147,51,234,0.6)]" />
        </div>

        <div className="max-w-3xl mx-auto relative min-h-[300px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white p-10 md:p-14 rounded-[3rem] relative border border-white shadow-2xl shadow-primary/5 text-center flex flex-col items-center"
            >
              <Quote className="text-primary/10 absolute top-8 left-8" size={60} />

              <p className="text-xl md:text-2xl font-medium italic text-slate-600 mb-10 relative z-10 leading-relaxed max-w-2xl">
                "{VOICES[index].quote}"
              </p>

              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-primary shadow-inner">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-slate-900 font-bold text-lg leading-none mb-2">{VOICES[index].author}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{VOICES[index].location}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress Indicators */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
            {VOICES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-primary shadow-sm' : 'w-2 bg-white/30'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

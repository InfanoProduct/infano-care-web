'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Shield, Users, Activity } from 'lucide-react';

export function BookSection() {
  return (
    <section className="py-32 bg-[#FFFBF7] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-orange-50 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3" />
      
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Premium Book Mockup */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative group cursor-pointer"
          >
             <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full scale-75 group-hover:scale-90 transition-transform duration-1000" />
             <motion.div
              whileHover={{ rotateY: -10, rotateX: 5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="relative z-10 w-full max-w-xl mx-auto h-[400px] md:h-[600px]"
             >
                <Image 
                  src="/book-mockup.png"
                  alt="The Companion Guide Book"
                  fill
                  className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.15)] rounded-2xl"
                />
             </motion.div>
             
             {/* Floating Badge */}
             <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-10 right-0 lg:-right-10 bg-white p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3 border border-slate-50"
             >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                   <Heart size={20} />
                </div>
                <span className="font-bold text-sm text-slate-800 tracking-tight">Warm & Honest Advice</span>
             </motion.div>
          </motion.div>

          {/* Right: Editorial Content */}
          <div className="flex flex-col">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-8"
            >
              On Her Bookshelf
            </motion.span>
            <h2 className="text-4xl md:text-6xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900">
              The companion guide <br /> every girl deserves.
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed font-medium mb-12">
              Alongside the app and school programme, Infano.care has authored a thoughtfully crafted book for adolescent girls — a warm, honest, and empowering guide that tackles the questions girls are afraid to ask and the answers they deserve to hear.
            </p>

            {/* Inside the Book Checklist */}
            <div className="space-y-6 mb-12">
              {[
                 { icon: <Shield size={18} />, text: "Science-backed insights on wellness" },
                 { icon: <Users size={18} />, text: "Real-world advice from experts" },
                 { icon: <Activity size={18} />, text: "Interactive growth exercises" },
              ].map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className="flex items-center gap-4 group"
                >
                   <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      {item.icon}
                   </div>
                   <span className="text-lg font-bold text-slate-700">{item.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="pt-4">
              <Link href="/the-book" className="inline-flex items-center gap-4 px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-primary transition-all shadow-2xl shadow-slate-900/20 active:scale-95 group">
                Discover the Book <ArrowRight className="transition-transform group-hover:translate-x-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

export function CommunityPillar() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-[0.02]" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-pink-100/30 rounded-full blur-[120px] translate-x-1/2" />

      <div className=" mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden lg:block order-2 lg:order-1 relative"
          >
            <div className="absolute -inset-10 bg-emerald-100/50 blur-[100px] rounded-full scale-75" />
            <div className="relative mx-auto w-full ">
              <Image
                src="/Ecosystem6.png"
                alt="Mobile interface"
                width={500}
                height={500}
                className="object-contain w-[920px]"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center text-3xl shadow-lg shadow-pink-900/5 border border-pink-100 shrink-0">
                <Users size={28} />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold font-heading text-slate-900 tracking-tight leading-none">PeerLine <br /> Connect</h2>
            </div>
            <div className="w-16 h-1 bg-pink-400 rounded-full mb-8" />
            <p className="text-sm md:text-base text-slate-500 mb-10 leading-relaxed font-medium max-w-xl">
              Connect with girls who get it. A moderated environment designed for genuine friendship and mutual growth.
            </p>

            {/* Mobile Image */}
            <div className="lg:hidden relative mx-auto w-full mb-10">
              <div className="absolute -inset-10 bg-emerald-100/50 blur-[100px] rounded-full scale-75" />
              <Image
                src="/Ecosystem6.png"
                alt="Mobile interface"
                width={500}
                height={500}
                className="object-contain w-[920px] relative z-10"
              />
            </div>

            <div className="grid gap-6">
              {[
                { title: 'Interest-Based Groups', desc: 'Art, sport, coding, books, and wellness-focused circles.' },
                { title: 'Safe & Moderated Chat', desc: 'Fully moderated & safe chat with trained peers.' },
                { title: 'Positive Feedback', desc: 'Structured around achievement and growth, not comparison.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 shrink-0 border border-pink-100 group-hover:bg-pink-500 group-hover:text-white transition-all duration-500">
                    <Users size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold font-heading text-slate-900 mb-1 tracking-tight">{item.title}</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

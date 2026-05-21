'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export function BookPillar() {
  return (
    <section className="py-20 lg:py-40 bg-slate-900 relative overflow-hidden">
      {/* Thematic Image Overlay with Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B4D] via-[#4A2B8A] to-[#2D1B4D] mix-blend-multiply opacity-90" />
        <Image
          src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80"
          alt="School environment"
          fill
          className="object-cover mix-blend-overlay opacity-30"
          sizes="100vw"
        />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="hidden lg:block mb-12 lg:mb-0">
          <Image
            src='/girl-standing-with-book.png'
            alt="Book"
            width={500}
            height={600}
            className="relative lg:absolute z-10 lg:bottom-0 lg:right-[48%] max-h-[400px] lg:max-h-[600px] w-auto object-contain "
          />
        </div>
        <div className="max-w-4xl mx-auto bg-white rounded-[2rem] md:rounded-[4rem] p-6 sm:p-8 md:p-12 lg:p-20 shadow-[0_50px_100px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className='ml-0 lg:ml-[40%]'
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-primary/10 rounded-full mb-8 ">

              <BookOpen size={18} className="text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">The Offline Companion</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold font-heading text-slate-900 mb-6 tracking-tighter leading-none">Pillar 6: The Book</h2>
            <p className="text-sm md:text-base text-slate-500 mb-10 leading-relaxed font-medium max-w-2xl mx-auto">
              A beautiful, honest, and expert-backed guide covering everything an adolescent girl deserves to understand.
            </p>
            <Link href="/gigi-the-awkward-age-book" className="px-6 md:px-12 py-3 md:py-4 bg-primary text-white rounded-[2rem] font-bold text-sm sm:text-base md:text-xl hover:bg-primary transition-all shadow-2xl active:scale-95 inline-flex items-center justify-center gap-2 md:gap-4 group whitespace-nowrap w-fit">
              Explore The Book <ArrowRight className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-2 shrink-0" />
            </Link>

          </motion.div>
        </div>
      </div>
    </section>
  );
}

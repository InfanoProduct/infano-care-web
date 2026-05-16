'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Book } from '@/services/shop.service';

interface BookHeroProps {
  book: Book | null;
}

export function BookHero({ book }: BookHeroProps) {
  return (
    <section className="pt-10 pb-0 bg-[#F5F3FF] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-white/40 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Book Bundle Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="relative lg:order-1 self-end lg:-ml-12"
          >
            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full scale-90" />
            <Image
              src="/girl-standing-with-book.png"
              alt="The Awkward Age Book Bundle"
              width={900}
              height={900}
              className="relative z-10 drop-shadow-[0_40px_80px_rgba(0,0,0,0.1)] block w-full h-auto"
              priority
            />
          </motion.div>

          {/* Right: Content */}
          <div className="flex flex-col lg:order-2 py-16 lg:py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-px w-6 bg-primary/20" />
              <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                India's first book on Adolescent Girls
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900"
            >
              A story of Every <br /> <span className="text-primary/80">Adolescent Girl</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-slate-500 leading-relaxed font-medium mb-10 max-w-lg"
            >
              A warm, illustrated guide to the adolescent journey—built to spark reflection, confidence, and conversations at home. Short chapters, friendly visuals, and practical prompts.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link href={book ? `/checkout?bookId=${book.id}` : '#'} className="px-10 py-4 bg-primary text-white rounded-full font-bold text-base hover:bg-primary transition-all shadow-xl shadow-slate-900/10 active:scale-95 group flex items-center gap-2">
                Buy Now <span className="opacity-50">₹499</span> <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                onClick={() => document.getElementById('read')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold text-base hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2"
              >
                <BookOpen size={18} className="text-primary" /> Read Sample
              </button>
            </motion.div>

            {/* Trust Indicator */}
            <div className="mt-12 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="relative w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden">
                    <Image 
                      src={`/experts/1 (${i}).png`}
                      alt={`Expert ${i}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                Trusted by 2,000+ families
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

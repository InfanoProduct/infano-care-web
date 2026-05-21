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
          <div
            className="relative lg:order-1 self-end lg:-ml-12 animate-in fade-in zoom-in-95 duration-700 fill-mode-both"
            style={{ animationDelay: '150ms' }}
          >
            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full scale-90" />
            <Image
              src="/girl-standing-with-book.png"
              alt="The Awkward Age Book Bundle"
              width={900}
              height={900}
              className="relative z-10 drop-shadow-[0_40px_80px_rgba(0,0,0,0.1)] block w-full h-auto"
              priority
              unoptimized
            />
          </div>

          {/* Right: Content */}
          <div className="flex flex-col lg:order-2 py-16 lg:py-20">
            <div
              className="flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both"
            >
              <div className="h-px w-6 bg-primary/20" />
              <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                India's first book on Adolescent Girls
              </span>
            </div>

            <h1
              className="text-4xl md:text-5xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
              style={{ animationDelay: '100ms' }}
            >
              The Awkward Age
            </h1>

            <p
              className="text-base md:text-lg text-slate-500 leading-relaxed font-medium mb-10 max-w-lg animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
              style={{ animationDelay: '200ms' }}
            >
              Let’s make the best investment—an investment in companionship, love, and loyalty. In a world that’s constantly changing, there is no friend as loyal, comforting, and true as
            </p>

            <div
              className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
              style={{ animationDelay: '300ms' }}
            >
              <Link href={book ? `/checkout?bookId=${book.id}` : '/checkout'} className="px-10 py-4 bg-primary text-white rounded-full font-bold text-base hover:bg-primary transition-all shadow-xl shadow-slate-900/10 active:scale-95 group flex items-center gap-2">
                Buy Now <span className="opacity-50">₹499</span> <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                onClick={() => document.getElementById('read')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold text-base hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2"
              >
                <BookOpen size={18} className="text-primary" /> Read Sample
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

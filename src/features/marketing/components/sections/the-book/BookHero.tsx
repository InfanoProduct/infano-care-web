'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, BookCheck } from 'lucide-react';
import { Book } from '@/services/shop.service';
import { useRegion, getBookPrice } from '@/hooks/use-region';

interface BookHeroProps {
  book: Book | null;
}

export function BookHero({ book }: BookHeroProps) {
  const { region, formatPrice, getLocalizedLink } = useRegion();

  return (
    <section className="pt-10 pb-0 bg-[#F5F3FF] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-white/40 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-360 mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Book Bundle Image */}
          <div
            className="relative lg:order-1 self-end flex justify-center animate-in fade-in zoom-in-95 duration-700 fill-mode-both"
            style={{ animationDelay: '150ms' }}
          >
            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full scale-90" />
            <Image
              src="https://res.cloudinary.com/dhg6sjxug/image/upload/v1792952851/infano-assets/book-hero-Photoroom_l1llx5.webp"
              alt="The Awkward Age Book Bundle"
              width={912}
              height={1173}
              className="relative z-10 drop-shadow-[0_40px_80px_rgba(0,0,0,0.1)] block w-full max-w-[340px] sm:max-w-[390px] lg:max-w-[430px] xl:max-w-[460px] h-auto mx-auto"
              priority
              unoptimized
            />
          </div>

          {/* Right: Content */}
          <div className="flex flex-col lg:order-2 py-16 lg:py-20">
            {/* Animated Social Proof Badge */}
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: [0, -6, 0],
                x: [0, 3, 0],
                rotate: [-0.5, 0.5, -0.5]
              }}
              whileHover={{ scale: 1.03, rotate: 0.5, transition: { duration: 0.2 } }}
              transition={{
                y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                x: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: 6, ease: "easeInOut" },
                opacity: { duration: 0.6 },
                scale: { duration: 0.6 }
              }}
              className="w-fit flex items-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 bg-primary/8 backdrop-blur-md text-primary-dark rounded-full mb-6 border border-primary/15 relative overflow-hidden group cursor-pointer hover:bg-primary/12 transition-colors"
            >
              <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shimmerSweep {
                  0% { left: -100%; }
                  30% { left: 150%; }
                  100% { left: 150%; }
                }
              `}} />
              {/* Shimmer Sweep Effect */}
              <div
                className="absolute top-0 bottom-0 w-1/2 bg-linear-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                style={{ animation: 'shimmerSweep 4s infinite ease-in-out' }}
              />

              {/* Pulsing live indicator */}
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>

              <span className="font-semibold text-[9.5px] sm:text-xs tracking-wide select-none whitespace-nowrap flex items-center">
                <span className="text-pink-600 font-extrabold tracking-wider  drop-shadow-[0_1px_3px_rgba(219,39,119,0.15)] mr-1">700 COPIES</span> ordered in the past 15 days! <span className="bg-primary text-white px-1.5 sm:px-2 py-0.5 rounded-full text-[7.5px] sm:text-[10px] uppercase font-bold tracking-widest ml-1 sm:ml-1.5 shadow-sm group-hover:bg-primary-dark transition-colors inline-block">Join the family</span>
              </span>
            </motion.div>

            <div
              className="flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both"
            >
              <div className="h-px w-6 bg-primary/20" />
              <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                {region === 'IN' ? "India's first book on Adolescent Girls" : "The premier guidebook on female puberty"}
              </span>
            </div>

            <h1
              className="text-4xl md:text-5xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
              style={{ animationDelay: '100ms' }}
            >
              The Awkward Age
            </h1>

            <p
              className="text-base md:text-lg text-slate-500 leading-relaxed font-medium mb-6 max-w-lg animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
              style={{ animationDelay: '200ms' }}
            >
              Let’s make the best investment—an investment in companionship, love, and loyalty. In a world that’s constantly changing, there is no friend as loyal, comforting, and true as
            </p>

            {/* Book & Workbook Cards */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-lg mb-8 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
              style={{ animationDelay: '250ms' }}
            >
              {/* Book Card */}
              <div className="group p-4 bg-gradient-to-br from-[#EDE9FE]/85 via-[#F5F3FF]/75 to-white/90 backdrop-blur-md border border-purple-200/80 rounded-xl shadow-[0_4px_20px_-4px_rgba(88,56,140,0.08)] hover:shadow-[0_12px_28px_-6px_rgba(88,56,140,0.16)] hover:border-purple-300 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white text-primary shadow-xs border border-purple-100 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-200">
                    <BookOpen size={14} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-primary">Book</span>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-medium">
                  The book helps her <strong className="font-bold text-primary-dark">understand</strong> growing up.
                </p>
              </div>

              {/* Workbook Card */}
              <div className="group p-4 bg-gradient-to-br from-[#FCE7F3]/85 via-[#FFF1F2]/75 to-white/90 backdrop-blur-md border border-pink-200/80 rounded-xl shadow-[0_4px_20px_-4px_rgba(219,39,119,0.08)] hover:shadow-[0_12px_28px_-6px_rgba(219,39,119,0.16)] hover:border-pink-300 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white text-pink-600 shadow-xs border border-pink-100 flex items-center justify-center shrink-0 group-hover:bg-pink-600 group-hover:text-white group-hover:border-pink-600 transition-all duration-200">
                    <BookCheck size={14} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-pink-600">Workbook</span>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-medium">
                  This workbook helps her <strong className="font-bold text-pink-700">practise</strong> it, one chapter at a time.
                </p>
              </div>
            </div>

            <div
              className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
              style={{ animationDelay: '300ms' }}
            >
              <Link href={getLocalizedLink(book ? `/checkout?bookId=${book.id}` : '/checkout')} className="px-10 py-4 bg-primary text-white rounded-full font-bold text-base hover:bg-primary transition-all shadow-xl shadow-slate-900/10 active:scale-95 group flex items-center gap-2">
                Buy Now <span className="opacity-50">{formatPrice(getBookPrice(book, region), false)}</span> <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                onClick={() => document.getElementById('read')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold text-base hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2"
                suppressHydrationWarning
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

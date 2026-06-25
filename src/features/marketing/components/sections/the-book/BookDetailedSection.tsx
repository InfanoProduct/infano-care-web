'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingCart, BookOpen, Quote, ArrowRight, Users } from 'lucide-react';
import { Book } from '@/services/shop.service';

interface BookDetailedSectionProps {
  book: Book | null;
}

export function BookDetailedSection({ book }: BookDetailedSectionProps) {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">

          {/* Left Column: Book Image & Testimonial */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative w-full max-w-lg mb-12"
            >
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-110" />
              <Image
                src="/BookwithCover.png"
                alt="The Awkward Age Book"
                width={800}
                height={800}
                className="relative z-10 drop-shadow-[0_30px_60px_rgba(0,0,0,0.1)] transition-transform hover:scale-[1.02] duration-500 w-full h-auto"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="w-full  bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 relative mt-[-60px] lg:mt-[-80px] z-20"
            >
              <div className="text-primary/10 text-6xl font-serif absolute top-4 left-8 leading-none select-none italic">“</div>
              <p className="text-slate-600 italic text-sm leading-relaxed relative z-10 mb-8 pt-4">
                "Reading this with my daughter turned awkward questions into honest chats. The illustrations kept her engaged, and the prompts helped me guide the conversation."
              </p>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-slate-900 font-bold text-base leading-none uppercase tracking-tight">Ananya S.</p>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Parent</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Content & Pricing */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-6 bg-primary/20" />
                <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                  India's first book on Adolescent Girls
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold font-heading mb-8 leading-tight tracking-tight text-slate-900">
                A story of Every <br /> <span className="text-primary">Adolescent Girl</span>
              </h2>

              <p className="text-base md:text-md text-slate-500 leading-relaxed font-medium mb-8 max-w-lg">
                A warm, illustrated guide to the adolescent journey—built to spark reflection, confidence, and conversations at home. Short chapters, friendly visuals, and practical prompts.
              </p>

              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                <div className="bg-[#FAF9FF] p-6 rounded-2xl border border-slate-100">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pages</h4>
                  <p className="text-slate-600 text-sm font-medium"><span className="font-bold text-slate-900">230 pages</span> of illustrated guidance</p>
                </div>
                <div className="bg-[#FAF9FF] p-6 rounded-2xl border border-slate-100">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Who it's for</h4>
                  <p className="text-slate-600 text-sm font-medium"><span className="font-bold text-slate-900">Ages 10–17</span> Trusted by parents & teachers</p>
                </div>
              </div>

              {/* Checklist */}
              <div className="mb-10">
                <div className="space-y-4">
                  {[
                    "Co-created with counsellors & teachers",
                    "Empathetic stories that help teens open up",
                    "Inclusive, culturally-aware guidance"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
                      <span className="text-slate-600 font-bold tracking-tight">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Buttons Box */}
              <div className="bg-[#F5F3FF] p-8 rounded-[2.5rem] border border-primary/10  relative overflow-hidden group">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold text-slate-900">₹499</span>
                      <span className="text-lg text-slate-400 line-through">₹999</span>
                    </div>
                    <span className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest">50% off launch offer</span>
                  </div>

                  <div className="flex flex-wrap gap-4 justify-center">
                    <Link
                      href={book ? `/checkout?bookId=${book.id}` : '/checkout'}
                      className="px-8 py-4 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary transition-all shadow-lg active:scale-95 flex items-center gap-2"
                    >
                      Buy Now <ArrowRight size={16} />
                    </Link>
                    <button
                      onClick={() => document.getElementById('read')?.scrollIntoView({ behavior: 'smooth' })}
                      className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2"
                      suppressHydrationWarning
                    >
                      <BookOpen size={16} className="text-primary" /> Read Sample
                    </button>
                  </div>
                </div>
              </div>

              {/* Trusted Footer */}
              <p className="mt-8 text-center lg:text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Trusted by 2,000+ families • Endorsed by educators
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

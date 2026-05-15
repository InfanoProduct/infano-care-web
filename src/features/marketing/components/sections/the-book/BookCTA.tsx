'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Book } from '@/services/shop.service';

interface BookCTAProps {
  book: Book | null;
}

export function BookCTA({ book }: BookCTAProps) {
  return (
    <section className="py-24 bg-[#FFF1F2] relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 text-center">
         <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6 tracking-tight text-slate-900">
              Ready to start the journey?
            </h2>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
              Order your copy today and get a private, expert-supported space for your girl to grow.
            </p>
            <Link href={book ? `/checkout?bookId=${book.id}` : '#'} className="px-12 py-6 bg-rose-500 text-white rounded-full font-bold text-xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 active:scale-95 inline-flex items-center gap-3">
               <ShoppingCart size={24} /> Get My Copy ₹499
            </Link>
         </div>
      </div>
    </section>
  );
}

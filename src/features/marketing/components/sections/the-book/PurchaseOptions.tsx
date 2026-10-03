'use client';

import Link from 'next/link';
import { ShoppingCart, Book as BookIcon, Gift, ArrowRight } from 'lucide-react';
import { Book } from '@/services/shop.service';
import { useRegion } from '@/hooks/use-region';

interface PurchaseOptionsProps {
  book: Book | null;
}

export function PurchaseOptions({ book }: PurchaseOptionsProps) {
  const { getLocalizedLink } = useRegion();

  return (
    <section className="py-32 bg-white relative overflow-hidden">
       <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center mb-20">
             <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6 tracking-tight text-slate-900">Get the Book</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
             <div className="flex flex-col items-center text-center p-8 bg-[#FAF9FF] rounded-[2.5rem] border border-slate-50 transition-transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                   <ShoppingCart size={32} />
                </div>
                <h3 className="font-bold font-heading text-xl mb-4 text-slate-900 tracking-tight">Individual Purchase</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">Buy online — delivered to your door. Available in English, Hindi, Tamil, and Telugu.</p>
                <Link href={getLocalizedLink(book ? `/checkout?bookId=${book.id}` : '/checkout')} className="mt-auto text-primary font-bold hover:underline flex items-center gap-2">Order Now <ArrowRight size={16} /></Link>
             </div>

             <div className="flex flex-col items-center text-center p-8 bg-[#F0FDF4] rounded-[2.5rem] border border-slate-50 transition-transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
                   <BookIcon size={32} />
                </div>
                <h3 className="font-bold font-heading text-xl mb-4 text-slate-900 tracking-tight">School Adoption</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">Bulk orders for schools with curriculum guidance, discussion guides, and teacher notes included.</p>
                <Link href={getLocalizedLink("/contact")} className="mt-auto text-emerald-600 font-bold hover:underline flex items-center gap-2">Contact Sales <ArrowRight size={16} /></Link>
             </div>

             <div className="flex flex-col items-center text-center p-8 bg-[#FFF1F2] rounded-[2.5rem] border border-slate-50 transition-transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
                   <Gift size={32} />
                </div>
                <h3 className="font-bold font-heading text-xl mb-4 text-slate-900 tracking-tight">Gift a Copy</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">Beautiful gift packaging available. Give the gift of self-knowledge to a girl you care about.</p>
                <Link href={getLocalizedLink(book ? `/checkout?bookId=${book.id}&gift=true` : '/checkout?gift=true')} className="mt-auto text-rose-500 font-bold hover:underline flex items-center gap-2">Send as Gift <ArrowRight size={16} /></Link>
             </div>
          </div>
       </div>
    </section>
  );
}

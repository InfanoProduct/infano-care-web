'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, BookOpen, Gift, ArrowRight, Sparkles, Check, Truck, KeyRound, ExternalLink } from 'lucide-react';
import { Book } from '@/services/shop.service';
import { useRegion, getBookPrice } from '@/hooks/use-region';

interface PurchaseOptionsProps {
  book: Book | null;
}

export function PurchaseOptions({ book }: PurchaseOptionsProps) {
  const { region, formatPrice, getLocalizedLink } = useRegion();
  const [selectedFormat, setSelectedFormat] = useState<'physical' | 'ebook'>('physical');

  const ebookPrice = region === 'US' ? 9.99 : (region === 'UK' ? 7.99 : 249);
  const physicalPrice = getBookPrice(book, region) || (region === 'US' ? 19.99 : (region === 'UK' ? 14.99 : 499));

  return (
    <section className="py-24 bg-gradient-to-b from-white via-slate-50/50 to-white relative overflow-hidden" id="get-the-book">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-4">
            <Sparkles size={14} />
            <span>Choose Your Preferred Edition</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black font-heading mb-4 tracking-tight text-slate-900">
            Available in <span className="text-primary">Print & Digital</span>
          </h2>
          <p className="text-slate-600 text-sm md:text-base font-medium">
            Whether you love the tactile feel of physical pages or instant interactive reading on your phone or tablet, we have you covered.
          </p>
        </div>

        {/* 2 Core Formats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Card 1: Physical Book */}
          <div className={`relative flex flex-col p-8 sm:p-10 rounded-[2.5rem] transition-all duration-300 border-2 bg-white ${
            selectedFormat === 'physical' 
              ? 'border-primary shadow-2xl shadow-primary/10 scale-[1.02]' 
              : 'border-slate-200 hover:border-slate-300 shadow-md'
          }`}>
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <ShoppingCart size={28} />
              </div>
              <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-black uppercase tracking-wider">
                Doorstep Delivery
              </span>
            </div>

            <h3 className="font-black font-heading text-2xl mb-2 text-slate-900">Physical Paperback Edition</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
              High-quality tactile print with full-color illustrations, keepsake binding, and bookmarks. Shipped to India, USA, and UK.
            </p>

            <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Check size={14} className="text-emerald-500 shrink-0" />
                <span>Premium matte printed cover & thick art pages</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Check size={14} className="text-emerald-500 shrink-0" />
                <span>Express courier tracking with SMS/WhatsApp updates</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Truck size={14} className="text-primary shrink-0" />
                <span>Available for Cash on Delivery in India</span>
              </div>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Unit Price</p>
                <p className="text-2xl font-black text-slate-900">{formatPrice(physicalPrice, false)}</p>
              </div>
              <Link 
                href={getLocalizedLink(book ? `/checkout?bookId=${book.id}&format=physical` : '/checkout?format=physical')}
                className="px-6 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              >
                <span>Order Physical Book</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Card 2: Digital Interactive eBook */}
          <div className={`relative flex flex-col p-8 sm:p-10 rounded-[2.5rem] transition-all duration-300 border-2 bg-white ${
            selectedFormat === 'ebook' 
              ? 'border-purple-600 shadow-2xl shadow-purple-600/10 scale-[1.02]' 
              : 'border-slate-200 hover:border-slate-300 shadow-md'
          }`}>
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-700">
                <BookOpen size={28} />
              </div>
              <span className="px-3.5 py-1 rounded-full bg-purple-100 text-purple-700 text-[11px] font-black uppercase tracking-wider">
                ⚡ Instant Cloud Access
              </span>
            </div>

            <h3 className="font-black font-heading text-2xl mb-2 text-slate-900">Digital Interactive eBook</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
              Read instantly anywhere on your mobile phone, tablet, or laptop. Cloud bookmarks, search, and zero shipping fee.
            </p>

            <div className="mb-6 p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Check size={14} className="text-purple-600 shrink-0" />
                <span>Instant unlock upon checkout — zero wait time</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Check size={14} className="text-purple-600 shrink-0" />
                <span>Interactive chapter reader with progress tracking</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Check size={14} className="text-purple-600 shrink-0" />
                <span>$0 / ₹0 Shipping — worldwide instantaneous access</span>
              </div>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Digital Price</p>
                <p className="text-2xl font-black text-purple-700">{formatPrice(ebookPrice, false)}</p>
              </div>
              <Link 
                href={getLocalizedLink(book ? `/checkout?bookId=${book.id}&format=ebook` : '/checkout?format=ebook')}
                className="px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all hover:scale-105 active:scale-95"
              >
                <span>Get Instant eBook</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Etsy Buyer Callout Banner */}
        <div className="max-w-4xl mx-auto rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-purple-300 shrink-0">
              <KeyRound size={24} />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white">Purchased on Etsy?</h4>
              <p className="text-xs sm:text-sm text-purple-200 font-medium">
                Enter your Etsy order receipt code to instantly activate your digital eBook reader access.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/library"
            className="px-6 py-3 rounded-xl bg-white text-slate-950 font-extrabold text-xs shrink-0 hover:bg-slate-100 transition shadow-md flex items-center gap-2"
          >
            <span>Claim on Infano</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

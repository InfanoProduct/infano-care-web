'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Sparkles, Star } from 'lucide-react';
import { Book } from '@/services/shop.service';

interface FloatingBuyWidgetProps {
  book?: Book | null;
}

export function FloatingBuyWidget({ book }: FloatingBuyWidgetProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 400px (past the hero section)
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkoutHref = book ? `/checkout?bookId=${book.id}` : '/checkout';
  const price = book?.price ?? 499;

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          key="floating-buy-widget"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl"
        >
          {/* Glass card */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-white/95 backdrop-blur-md">
            {/* Top accent gradient strip */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#ba3c78] via-[#e06ba8] to-[#f0a0c8]" />

            <div className="flex items-center gap-4 px-5 py-4">
              {/* Book thumbnail indicator */}
              <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#ba3c78] to-[#e06ba8] flex items-center justify-center shadow-lg shadow-pink-200">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>

              {/* Text block */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 truncate">
                    Gigi: The Awkward Age
                  </p>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-100 shrink-0">
                    <Sparkles className="w-2.5 h-2.5" /> 50% OFF
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900 leading-none">
                    ₹{price}
                  </span>
                  <span className="text-sm text-slate-400 line-through leading-none">
                    ₹{price * 2}
                  </span>
                  <span className="hidden sm:flex items-center gap-0.5 text-amber-500 text-[10px] font-bold">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <Star className="w-3 h-3 fill-amber-500" />
                    <Star className="w-3 h-3 fill-amber-500" />
                    <Star className="w-3 h-3 fill-amber-500" />
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span className="text-slate-500 ml-1">(2000+)</span>
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <a
                href={checkoutHref}
                className="shrink-0 inline-flex items-center gap-2 bg-[#ba3c78] hover:bg-[#a03065] active:scale-95 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-pink-200/50 whitespace-nowrap"
              >
                <ShoppingBag className="w-4 h-4" />
                Buy Now
              </a>

              {/* Dismiss button */}
              <button
                onClick={() => setDismissed(true)}
                aria-label="Dismiss"
                className="shrink-0 ml-1 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

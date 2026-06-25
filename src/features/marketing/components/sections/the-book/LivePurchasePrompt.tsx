'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { ShopService } from '@/services/shop.service';

interface Purchase {
  name: string;
  bookTitle: string;
  createdAt: string;
}

export function LivePurchasePrompt() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [relativeTimeStr, setRelativeTimeStr] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch recent purchases
  const fetchPurchases = async () => {
    try {
      const data = await ShopService.getRecentPurchases();
      // Only set if we have actual purchases
      if (data && data.length > 0) {
        setPurchases(data);

        // Determine starting index based on the last shown purchase key
        let startIndex = 0;
        try {
          const lastShownKey = localStorage.getItem('last_shown_purchase_key');
          if (lastShownKey) {
            const lastIdx = data.findIndex(
              (p) => `${p.name}-${p.createdAt}` === lastShownKey
            );
            if (lastIdx !== -1) {
              // Start from the next purchase in sequence to cycle on reload
              startIndex = (lastIdx + 1) % data.length;
            }
          }
        } catch (e) {
          console.error('Error reading last_shown_purchase_key:', e);
        }

        setCurrentIndex(startIndex);
      } else {
        setPurchases([]);
      }
    } catch (error) {
      console.error('Failed to fetch recent purchases:', error);
    }
  };

  useEffect(() => {
    fetchPurchases();

    // Re-fetch fresh data every 5 minutes
    const fetchInterval = setInterval(fetchPurchases, 5 * 60 * 1000);
    return () => clearInterval(fetchInterval);
  }, []);

  // Save the last shown purchase key to localStorage whenever the index or purchases change
  useEffect(() => {
    if (purchases.length > 0 && purchases[currentIndex]) {
      const purchase = purchases[currentIndex];
      const key = `${purchase.name}-${purchase.createdAt}`;
      try {
        localStorage.setItem('last_shown_purchase_key', key);
      } catch (e) {
        console.error('Error setting last_shown_purchase_key:', e);
      }
    }
  }, [currentIndex, purchases]);

  useEffect(() => {
    if (purchases.length === 0 || isDismissed) {
      setIsVisible(false);
      return;
    }

    // Delay 3 seconds before displaying the first notification on page load
    const initialDelay = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    // After the initial display, hide after 7 seconds
    const hideTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 10000); // 3s delay + 7s active

    // Start 40-second cycle scheduler
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        return nextIndex >= purchases.length ? 0 : nextIndex;
      });
      setIsVisible(true);

      // Hide after 7 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 7000);
    }, 40000);


    return () => {
      clearTimeout(initialDelay);
      clearTimeout(hideTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [purchases, isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Safe formatting for relative timestamps (strictly relative for live counters)
  const getRelativeTimeStr = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = Math.max(0, now.getTime() - date.getTime());
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));


      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`;
      if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;

      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;

      return date.toLocaleDateString();
    } catch {
      return 'recently';
    }
  };

  const currentPurchase = purchases[currentIndex];

  // Dynamic ticking relative time updates
  useEffect(() => {
    if (!currentPurchase) return;

    const updateTime = () => {
      setRelativeTimeStr(getRelativeTimeStr(currentPurchase.createdAt));
    };

    updateTime();

    // Re-verify and update the elapsed time every 10 seconds
    const elapsedTimer = setInterval(updateTime, 10 * 1000);
    return () => clearInterval(elapsedTimer);
  }, [currentPurchase]);

  if (!currentPurchase || isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9, x: 0 }}
          animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-50 w-80 sm:w-85 glass-card rounded-2xl p-4 flex items-start gap-4 select-none font-sans overflow-hidden hover:shadow-glow hover:-translate-y-0.5 hover:border-primary/20"
        >

          {/* Premium Gradient Icon Block */}
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/15 text-primary shrink-0 relative shadow-sm">
            <ShoppingBag size={20} className="stroke-[2.2] text-primary-light" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          {/* Text Content */}
          <div className="flex-1 pr-5">
            <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed font-semibold">
              <span className="font-heading font-extrabold text-slate-900 tracking-tight text-[13px] sm:text-[14.5px]">
                {currentPurchase.name}
              </span>{' '}
              ordered{' '}
              <span className="font-heading font-black italic text-primary tracking-tight">
                &apos;{currentPurchase.bookTitle}&apos;
              </span>{' '}
              book.
            </p>
            {/* Live Indicator Dot & Time */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {relativeTimeStr}
              </span>
            </div>
          </div>

          {/* Dismiss close button */}
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all p-1 rounded-full absolute top-2.5 right-2.5 hover:scale-105 active:scale-95"
            aria-label="Dismiss notification"
            suppressHydrationWarning
          >
            <X size={14} className="stroke-[2.5]" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


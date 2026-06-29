'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ShopService, Book } from '@/services/shop.service';
import { BookHero } from '@/features/marketing/components/sections/the-book/BookHero';
import { BookAbout } from '@/features/marketing/components/sections/the-book/BookAbout';
import { BookPreview } from '@/features/marketing/components/sections/the-book/BookPreview';
import { ReaderVoices } from '@/features/marketing/components/sections/the-book/ReaderVoices';
import { PurchaseOptions } from '@/features/marketing/components/sections/the-book/PurchaseOptions';
import { BookCTA } from '@/features/marketing/components/sections/the-book/BookCTA';
import { BookDetailedSection } from '@/features/marketing/components/sections/the-book/BookDetailedSection';
import { BookAchieve } from '@/features/marketing/components/sections/the-book/BookAchieve';
import { BookChapters } from '@/features/marketing/components/sections/the-book/BookChapters';
import { BookTrust } from '@/features/marketing/components/sections/the-book/BookTrust';
import { FloatingBuyWidget } from '@/features/marketing/components/sections/the-book/FloatingBuyWidget';
import { LivePurchasePrompt } from '@/features/marketing/components/sections/the-book/LivePurchasePrompt';

export function TheBookClient() {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const books = await ShopService.getBooks();
        if (books && books.length > 0) {
          const targetBook = books.find(b => b.id === '7e248707-c9e8-462c-a716-99f3852ef8c0') || books[0];
          setBook(targetBook);
        }
      } catch (error) {
        console.error('Failed to load book data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && book) {
      const windowObj = window as any;
      windowObj.dataLayer = windowObj.dataLayer || [];
      windowObj.dataLayer.push({ ecommerce: null });
      windowObj.dataLayer.push({
        event: 'view_item',
        ecommerce: {
          currency: 'INR',
          value: book.price,
          items: [{
            item_id: book.id,
            item_name: book.title,
            price: book.price,
            quantity: 1
          }]
        }
      });
    }
  }, [book]);

  if (loading || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <FloatingBuyWidget book={book} />
      <LivePurchasePrompt />
      <BookHero book={book} />
      <BookAbout />
      <BookDetailedSection book={book} />
      <BookAchieve />
      <BookChapters />
      <BookPreview book={book} />
      <BookTrust />
      <ReaderVoices />
      <PurchaseOptions book={book} />
      <BookCTA book={book} />
    </div>
  );
}


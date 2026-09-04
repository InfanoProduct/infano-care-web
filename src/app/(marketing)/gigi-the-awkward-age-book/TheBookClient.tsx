'use client';

import { useState, useEffect } from 'react';
import { ShopService, Book } from '@/services/shop.service';
import { useRegion } from '@/hooks/use-region';
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
import { isAnalyticsEnabled } from '@/components/common/Analytics';

const DEFAULT_BOOK: Book = {
  id: 'gigi-the-awkward-age',
  title: 'Gigi — The Awkward Age',
  description: "India's first illustrated guidebook addressing female puberty with scientific clarity, body-positivity, and self-love. 230 pages of empathetic stories, practical prompts, and expert-backed guidance for girls aged 10–17.",
  price: 499,
  priceUS: 19.99,
  priceUK: 14.99,
  imageUrl: '/Page-1.png',
  stock: 100,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export function TheBookClient() {
  const [book, setBook] = useState<Book>(DEFAULT_BOOK);
  const { region, currencyCode, bookPrice } = useRegion();

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const books = await ShopService.getBooks();
        if (isMounted && books && books.length > 0) {
          const targetBook = books.find(b => b.isActive) || books[0];
          setBook(targetBook);
        }
      } catch (error) {
        console.error('Failed to load book data:', error);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && book) {
      const windowObj = window as any;
      windowObj.dataLayer = windowObj.dataLayer || [];
      windowObj.dataLayer.push({ ecommerce: null });
      windowObj.dataLayer.push({
        event: 'view_item',
        ecommerce: {
          currency: currencyCode,
          value: region === 'IN' ? book.price : bookPrice,
          items: [{
            item_id: book.id,
            item_name: book.title,
            price: region === 'IN' ? book.price : bookPrice,
            quantity: 1
          }]
        }
      });
    }
  }, [book, region, currencyCode, bookPrice]);

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


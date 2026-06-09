'use client';

import { useState, useEffect } from 'react';
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

const DEFAULT_BOOK: Book = {
  id: '7e248707-c9e8-462c-a716-99f3852ef8c0',
  title: 'The Awkward Age',
  description: 'A story of Every Adolescent Girl',
  price: 499,
  stock: 100,
  isActive: true
};

export function TheBookClient() {
  const [book, setBook] = useState<Book>(DEFAULT_BOOK);

  useEffect(() => {
    const loadData = async () => {
      try {
        const books = await ShopService.getBooks();
        if (books && books.length > 0) {
          const targetBook = books.find(b => b.id === DEFAULT_BOOK.id) || books[0];
          setBook(targetBook);
        }
      } catch (error) {
        console.error('Failed to load book data:', error);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <FloatingBuyWidget book={book} />
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

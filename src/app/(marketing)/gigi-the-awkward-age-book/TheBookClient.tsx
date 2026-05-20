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
import { BookReaders } from '@/features/marketing/components/sections/the-book/BookReaders';
import { BookTrust } from '@/features/marketing/components/sections/the-book/BookTrust';

export function TheBookClient() {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const books = await ShopService.getBooks();
        if (books && books.length > 0) {
          setBook(books[0]);
        } else {
          setBook({
            id: '7e248707-c9e8-462c-a716-99f3852ef8c0',
            title: 'The Awkward Age',
            description: 'A story of Every Adolescent Girl',
            price: 499,
            stock: 100,
            isActive: true
          });
        }
      } catch (error) {
        console.error('Failed to load book data:', error);
        setBook({
          id: '7e248707-c9e8-462c-a716-99f3852ef8c0',
          title: 'The Awkward Age',
          description: 'A story of Every Adolescent Girl',
          price: 499,
          stock: 100,
          isActive: true
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <BookHero book={book} />
      <BookAbout />
      <BookDetailedSection book={book} />
      <BookAchieve />
      <BookChapters />
      <BookPreview />
      <BookTrust />
      <BookReaders />
      <ReaderVoices />
      <PurchaseOptions book={book} />
      <BookCTA book={book} />
    </div>
  );
}

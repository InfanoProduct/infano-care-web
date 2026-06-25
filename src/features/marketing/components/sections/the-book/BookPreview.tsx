'use client';

import React, { useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Book } from '@/services/shop.service';

const BOOK_PAGES: string[] = [
  '/book/Page-1.png',
  '/book/Page-1.png',
  '/book/Page-2.png',
  'https://infano-prod.duckdns.org/images/page-3.png',
  '/book/Page-4.png',
  '/book/Page-5.png',
  '/book/Page-6.png',
  '/book/last_page.png',
];

const pagesWithFiller =
  BOOK_PAGES.length % 2 === 0 ? BOOK_PAGES : [...BOOK_PAGES, 'blank'];

interface BookPreviewProps {
  book?: Book | null;
}

export function BookPreview({ book }: BookPreviewProps = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  const [page, setPage] = useState(1);

  const next = () => bookRef.current?.pageFlip().flipNext();
  const prev = () => bookRef.current?.pageFlip().flipPrev();

  // HTMLFlipBook fires onFlip with the index of the first page visible.
  // We divide by 2 if we want to show spread count, or just use the raw page index.
  const isLastPage = page >= pagesWithFiller.length - 2;

  return (
    <section id="read" className="py-24 bg-slate-50/50 relative overflow-hidden scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight text-[#313645]">
            Read a few pages free
          </h2>
          <p className="text-slate-500 text-lg">
            Flip through a few pages from the book right here. Like what you see? Order your copy below.
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl flex flex-col items-center">
          {/* Background glow */}
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-pink-200/40 via-violet-200/40 to-emerald-200/40 blur-2xl" />

          {/* Book Wrapper */}
          <div className="rounded-2xl border border-slate-200/60 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col items-center p-4 relative w-full">
            {/* FlipBook */}
            {/* @ts-ignore - react-pageflip types are often incomplete */}
            <HTMLFlipBook
              width={450}
              height={600}
              size="stretch"
              minWidth={315}
              maxWidth={900}
              minHeight={400}
              maxHeight={900}
              drawShadow={true}
              showCover={true}
              startPage={1}
              mobileScrollSupport={true}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onFlip={(e: any) => setPage(e.data)}
              ref={bookRef}
              className="rounded-xl mx-auto"
              style={{ margin: '0 auto' }}
            >
              {pagesWithFiller.map((src, idx) => (
                <div
                  key={idx}
                  className="relative flex items-center justify-center bg-white shadow-sm overflow-hidden"
                >
                  {src === 'blank' ? (
                    <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-400 italic border border-slate-100">
                      Blank Page
                    </div>
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Book page ${idx + 1}`}
                        className="h-full w-full object-fill rounded-xl"
                      />

                      {/* ✅ CTA only on last page */}
                      {idx === pagesWithFiller.length - 1 && (
                        <div className="absolute md:bottom-[55px] bottom-[20px] md:left-[30px] left-[25px]">
                          <a
                            href={book ? `/checkout?bookId=${book.id}` : '/checkout'}
                            className="bg-[#ba3c78] text-white font-semibold px-6 py-3 rounded-xl shadow transition hover:bg-[#a03065]"
                          >
                            Book Now
                          </a>
                          <p className="mt-4 md:text-base text-sm font-medium text-slate-800">
                            Loved by 2000+ girls | Safe | Expert Led
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </HTMLFlipBook>

            {/* Controls */}
            <div className="mt-8 flex flex-col items-center gap-2 text-sm w-full">
              <div className="flex items-center gap-6">
                <button
                  onClick={prev}
                  disabled={page === 0}
                  className="rounded-full bg-slate-100 hover:bg-slate-200 transition-colors p-3 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  suppressHydrationWarning
                >
                  <ArrowLeft className="h-5 w-5 text-slate-700" />
                </button>

                <div className="text-slate-600 font-medium">
                  Page <b className="text-slate-900">{page + 1}</b> of <b className="text-slate-900">{pagesWithFiller.length}</b>
                </div>

                <button
                  onClick={next}
                  disabled={isLastPage}
                  className="rounded-full bg-slate-100 hover:bg-slate-200 transition-colors p-3 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  suppressHydrationWarning
                >
                  <ArrowRight className="h-5 w-5 text-slate-700" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

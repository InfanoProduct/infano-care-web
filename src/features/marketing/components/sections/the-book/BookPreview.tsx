'use client';

import React, { useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Book } from '@/services/shop.service';
import { useRegion } from '@/hooks/use-region';

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

const WORKBOOK_PAGES: string[] = [
  'https://res.cloudinary.com/dhg6sjxug/image/upload/v1792952570/infano-assets/1-Gigi-Field-Guide-21x27-00-Front-Cover_qpkhza.png',
  'https://res.cloudinary.com/dhg6sjxug/image/upload/v1792952570/infano-assets/1-Gigi-Field-Guide-21x27-00-Front-Cover_qpkhza.png',
  'https://res.cloudinary.com/dhg6sjxug/image/upload/v1792952570/infano-assets/2-Gigi-Field-Guide-21x27-Page-002-How-to-use_kpp2kp.png',
  'https://res.cloudinary.com/dhg6sjxug/image/upload/v1792952569/infano-assets/3-Gigi-Field-Guide-21x27-Page-009-Calm-Quest_zk9dvx.png',
  'https://res.cloudinary.com/dhg6sjxug/image/upload/v1792952571/infano-assets/4-Gigi-Field-Guide-21x27-Page-011-Myth-or-Fact_eklea8.png',
  'https://res.cloudinary.com/dhg6sjxug/image/upload/v1792952568/infano-assets/5-Gigi-Field-Guide-21x27-Page-018-My-Bubble-Map_jywlc4.png',
  'https://res.cloudinary.com/dhg6sjxug/image/upload/v1792952567/infano-assets/6-Gigi-Field-Guide-21x27-Page-020-Heart-to-Heart-Crossword_z9yapq.png',
  'https://res.cloudinary.com/dhg6sjxug/image/upload/v1792952569/infano-assets/7-Gigi-Field-Guide-21x27-Page-028-Troll-Maze_obd7mu.png',
  'https://res.cloudinary.com/dhg6sjxug/image/upload/v1792952570/infano-assets/8-Gigi-Field-Guide-21x27-Page-106-Sticker-Sheet_fzmcro.png',
  'https://res.cloudinary.com/dhg6sjxug/image/upload/v1792952571/infano-assets/9-Gigi-Field-Guide-21x27-99-Back-Cover_wvjwfb.png',
]

interface BookPreviewProps {
  book?: Book | null;
}

export function BookPreview({ book }: BookPreviewProps = {}) {
  const { getLocalizedLink } = useRegion();

  // Main Book flip state & ref
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  const [page, setPage] = useState(1);
  const next = () => bookRef.current?.pageFlip().flipNext();
  const prev = () => bookRef.current?.pageFlip().flipPrev();
  const isLastPage = page >= pagesWithFiller.length - 2;

  // Workbook flip state & ref
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workbookRef = useRef<any>(null);
  const [workbookPage, setWorkbookPage] = useState(1);
  const nextWorkbook = () => workbookRef.current?.pageFlip().flipNext();
  const prevWorkbook = () => workbookRef.current?.pageFlip().flipPrev();
  const isWorkbookLastPage = workbookPage >= WORKBOOK_PAGES.length - 2;

  return (
    <section id="read" className="py-24 bg-slate-50/50 relative overflow-hidden scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight text-[#313645]">
            Read a few pages free
          </h2>
          <p className="text-slate-500 text-lg">
            Flip through sample pages from both the main guide and companion workbook. Like what you see? Order your copy below.
          </p>
        </div>

        {/* 1. Main Book Preview */}
        <div className="mb-20">
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider mb-2">
              Guidebook
            </span>
            <h3 className="text-2xl md:text-3xl font-bold font-heading text-slate-900 tracking-tight">
              Gigi — The Awkward Age
            </h3>
          </div>

          <div className="relative mx-auto max-w-4xl flex flex-col items-center">
            {/* Background glow */}
            <div className="absolute -inset-6 -z-10 rounded-2xl bg-gradient-to-br from-pink-200/40 via-violet-200/40 to-emerald-200/40 blur-2xl" />

            {/* Book Wrapper */}
            <div className="rounded-xl border border-slate-200/60 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col items-center p-4 relative w-full">
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
                              href={getLocalizedLink(book ? `/checkout?bookId=${book.id}` : '/checkout')}
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

        {/* 2. Workbook Preview */}
        <div className="pt-16 border-t border-slate-200/80">
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-800 font-bold text-xs uppercase tracking-wider mb-2">
              Companion Workbook
            </span>
            <h3 className="text-2xl md:text-3xl font-bold font-heading text-slate-900 tracking-tight">
              Gigi — The Activity Field Guide & Workbook
            </h3>
          </div>

          <div className="relative mx-auto max-w-4xl flex flex-col items-center">
            {/* Background glow */}
            <div className="absolute -inset-6 -z-10 rounded-2xl bg-gradient-to-br from-violet-200/40 via-purple-200/40 to-amber-200/40 blur-2xl" />

            {/* Book Wrapper */}
            <div className="rounded-xl border border-slate-200/60 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col items-center p-4 relative w-full">
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
                onFlip={(e: any) => setWorkbookPage(e.data)}
                ref={workbookRef}
                className="rounded-xl mx-auto"
                style={{ margin: '0 auto' }}
              >
                {WORKBOOK_PAGES.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative flex items-center justify-center bg-white shadow-sm overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Workbook page ${idx + 1}`}
                      className="h-full w-full object-fill rounded-xl"
                    />
                  </div>
                ))}
              </HTMLFlipBook>

              {/* Controls */}
              <div className="mt-8 flex flex-col items-center gap-2 text-sm w-full">
                <div className="flex items-center gap-6">
                  <button
                    onClick={prevWorkbook}
                    disabled={workbookPage === 0}
                    className="rounded-full bg-slate-100 hover:bg-slate-200 transition-colors p-3 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    suppressHydrationWarning
                  >
                    <ArrowLeft className="h-5 w-5 text-slate-700" />
                  </button>

                  <div className="text-slate-600 font-medium">
                    Page <b className="text-slate-900">{workbookPage + 1}</b> of <b className="text-slate-900">{WORKBOOK_PAGES.length}</b>
                  </div>

                  <button
                    onClick={nextWorkbook}
                    disabled={isWorkbookLastPage}
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
      </div>
    </section>
  );
}

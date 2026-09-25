"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Moon,
  Sun,
  Type,
  List,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Sliders,
  Sparkles
} from "lucide-react";
import { 
  LibraryService, 
  BookReaderData, 
  ChapterContentResponse 
} from "@/services/library.service";

type ReaderTheme = "light" | "sepia" | "dark";
type ReaderFont = "serif" | "sans";

export default function BookReaderPage() {
  const params = useParams();
  const router = useRouter();
  const bookIdOrSlug = (params?.bookId as string) || "gigi-the-book";

  // Data State
  const [bookData, setBookData] = useState<BookReaderData | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [chapterContent, setChapterContent] = useState<ChapterContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reader Settings State
  const [theme, setTheme] = useState<ReaderTheme>("sepia");
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<ReaderFont>("serif");
  const [showTocDrawer, setShowTocDrawer] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const readerContainerRef = useRef<HTMLDivElement>(null);

  // Anti-piracy / DRM protection handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Print (Ctrl+P / Cmd+P)
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
      }
      // Prevent Save (Ctrl+S / Cmd+S)
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 1. Fetch Book Metadata & Reading State
  useEffect(() => {
    const fetchMetadata = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await LibraryService.getBookDetails(bookIdOrSlug);
        setBookData(data);

        // Find chapter corresponding to lastReadPage if available
        const lastPage = data.readingState.lastReadPage || 1;
        const matchedIdx = data.book.tableOfContents.findIndex(
          (ch) => lastPage >= ch.pageStart && lastPage <= ch.pageEnd
        );
        const startIdx = matchedIdx >= 0 ? matchedIdx : 0;
        setCurrentChapterIndex(startIdx);
        await loadChapter(startIdx);
      } catch (err: any) {
        console.error("Failed to load reader metadata", err);
        setError(err.response?.data?.message || err.message || "Failed to load book reader.");
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [bookIdOrSlug]);

  // 2. Load Single Chapter Content
  const loadChapter = async (index: number) => {
    setChapterLoading(true);
    try {
      const data = await LibraryService.getChapterContent(bookIdOrSlug, index);
      setChapterContent(data);
      setCurrentChapterIndex(index);
      
      // Auto-save reading progress
      if (bookData?.book.tableOfContents[index]) {
        const ch = bookData.book.tableOfContents[index];
        const percent = Math.min(100, Math.round((ch.pageEnd / bookData.book.totalPages) * 100));
        LibraryService.updateProgress(bookIdOrSlug, {
          lastReadPage: ch.pageStart,
          progressPercent: percent
        }).catch(console.error);
      }

      // Scroll reader to top
      if (readerContainerRef.current) {
        readerContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      console.error("Failed to load chapter", err);
    } finally {
      setChapterLoading(false);
    }
  };

  const handleNextChapter = () => {
    if (!bookData) return;
    if (currentChapterIndex < bookData.book.tableOfContents.length - 1) {
      loadChapter(currentChapterIndex + 1);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      loadChapter(currentChapterIndex - 1);
    }
  };

  const handleToggleBookmark = async () => {
    const pageToBookmark = chapterContent?.chapter.pageStart || 1;
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    try {
      await LibraryService.updateProgress(bookIdOrSlug, {
        bookmark: { page: pageToBookmark, note: chapterContent?.chapter.title }
      });
    } catch (err) {
      console.error("Failed to update bookmark", err);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  // Theme style classes
  const themeClasses = {
    light: "bg-white text-slate-900 border-slate-200",
    sepia: "bg-[#FAF7F0] text-[#3E2723] border-[#E8DFC9]",
    dark: "bg-[#18181B] text-[#E4E4E7] border-[#27272A]",
  }[theme];

  const headerBg = {
    light: "bg-white/90 border-b border-slate-200 text-slate-800",
    sepia: "bg-[#FAF7F0]/90 border-b border-[#E8DFC9] text-[#3E2723]",
    dark: "bg-[#18181B]/90 border-b border-[#27272A] text-[#E4E4E7]",
  }[theme];

  const fontStyle = fontFamily === "serif" ? "font-serif" : "font-sans";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
        <p className="text-sm font-medium text-slate-400">Opening secure eBook reader...</p>
      </div>
    );
  }

  if (error || !bookData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-900 space-y-6">
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 max-w-md">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p className="text-sm">{error || "Unable to access book."}</p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/dashboard/library"
            className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm shadow hover:bg-purple-700 transition"
          >
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  const toc = bookData.book.tableOfContents;
  const currentChapter = toc[currentChapterIndex];

  return (
    <div
      className={`min-h-screen flex flex-col ${themeClasses} select-none transition-colors duration-300`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* ── Top Header Navigation Bar ────────────────────────────────────────── */}
      <header className={`sticky top-0 z-40 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between ${headerBg}`}>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/library"
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition"
            title="Back to Library"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold truncate max-w-[200px] md:max-w-xs lg:max-w-md">
              {bookData.book.title}
            </h1>
            <p className="text-[11px] opacity-70">
              {currentChapter ? currentChapter.title : "Reading"}
            </p>
          </div>
        </div>

        {/* Reader Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Table of Contents Trigger */}
          <button
            onClick={() => setShowTocDrawer(true)}
            className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition text-sm font-medium flex items-center gap-1.5"
            title="Table of Contents"
          >
            <List className="w-4 h-4" />
            <span className="hidden md:inline text-xs">Chapters</span>
          </button>

          {/* Bookmark Toggle */}
          <button
            onClick={handleToggleBookmark}
            className={`p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition ${
              isBookmarked ? "text-purple-600" : ""
            }`}
            title="Bookmark Page"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-purple-600 fill-purple-600" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>

          {/* Appearance / Font Settings Trigger */}
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition"
            title="Reader Settings"
          >
            <Type className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:inline-flex p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── Settings Dropdown Drawer ────────────────────────────────────────── */}
      {showSettingsDrawer && (
        <div className="sticky top-14 z-30 px-6 py-4 border-b shadow-lg bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-slate-800 dark:text-zinc-100 flex flex-wrap items-center justify-between gap-6 border-slate-200 dark:border-zinc-800 animate-in slide-in-from-top duration-200">
          {/* Theme Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Theme:</span>
            <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-zinc-800 gap-1">
              <button
                onClick={() => setTheme("light")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  theme === "light" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
              <button
                onClick={() => setTheme("sepia")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  theme === "sepia" ? "bg-[#FAF7F0] text-[#3E2723] shadow-sm font-serif" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                📖 Sepia
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  theme === "dark" ? "bg-zinc-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Dark
              </button>
            </div>
          </div>

          {/* Font Size Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Font Size:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 font-bold text-sm hover:bg-slate-200 transition"
              >
                A-
              </button>
              <span className="text-xs font-mono w-8 text-center">{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 font-bold text-sm hover:bg-slate-200 transition"
              >
                A+
              </button>
            </div>
          </div>

          {/* Font Family Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Font:</span>
            <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-zinc-800 gap-1">
              <button
                onClick={() => setFontFamily("serif")}
                className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold transition ${
                  fontFamily === "serif" ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm" : ""
                }`}
              >
                Book (Serif)
              </button>
              <button
                onClick={() => setFontFamily("sans")}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition ${
                  fontFamily === "sans" ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm" : ""
                }`}
              >
                Modern (Sans)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Chapter Content Reader ─────────────────────────────────────── */}
      <main
        ref={readerContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-16 lg:px-24 py-10 max-w-4xl mx-auto w-full"
      >
        {chapterLoading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-3 opacity-70">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <p className="text-xs font-medium">Loading chapter...</p>
          </div>
        ) : chapterContent ? (
          <article className={`space-y-6 ${fontStyle} leading-relaxed transition-all duration-300`}>
            {/* Chapter Header */}
            <div className="space-y-2 pb-6 border-b border-current/10">
              <span className="text-xs font-bold uppercase tracking-widest opacity-60">
                Chapter {currentChapterIndex + 1} of {toc.length}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                {chapterContent.chapter.title}
              </h2>
              <div className="flex items-center gap-3 text-xs opacity-70">
                <span>Pages {chapterContent.chapter.pageStart} – {chapterContent.chapter.pageEnd}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Protected eBook
                </span>
              </div>
            </div>

            {/* Chapter Body Content (Rendered with selected typography) */}
            <div
              style={{ fontSize: `${fontSize}px`, lineHeight: "1.85" }}
              className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-inherit"
              dangerouslySetInnerHTML={{ __html: chapterContent.chapter.contentHtml }}
            />

            {/* Chapter Bottom Navigation */}
            <div className="pt-12 mt-12 border-t border-current/10 flex items-center justify-between gap-4">
              <button
                onClick={handlePrevChapter}
                disabled={currentChapterIndex === 0}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none font-semibold text-xs sm:text-sm transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Chapter</span>
              </button>

              <span className="text-xs font-mono opacity-60">
                {currentChapterIndex + 1} / {toc.length}
              </span>

              <button
                onClick={handleNextChapter}
                disabled={currentChapterIndex === toc.length - 1}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-30 disabled:pointer-events-none text-white font-semibold text-xs sm:text-sm shadow-md transition"
              >
                <span>Next Chapter</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        ) : null}
      </main>

      {/* ── Table of Contents Sidebar Modal Drawer ─────────────────────────── */}
      {showTocDrawer && (
        <div className="fixed inset-0 z-50 flex bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-xs sm:max-w-sm h-full bg-white dark:bg-zinc-900 p-6 flex flex-col justify-between shadow-2xl border-r border-slate-200 dark:border-zinc-800 animate-in slide-in-from-left duration-200"
          >
            <div className="space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Table of Contents
                  </h3>
                </div>
                <button
                  onClick={() => setShowTocDrawer(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Chapters List */}
              <div className="space-y-2">
                {toc.map((ch, idx) => {
                  const isActive = idx === currentChapterIndex;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        loadChapter(idx);
                        setShowTocDrawer(false);
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl transition flex flex-col gap-1 ${
                        isActive
                          ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800/50"
                          : "hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 text-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs opacity-60">
                        <span>Chapter {idx + 1}</span>
                        <span>Pages {ch.pageStart}–{ch.pageEnd}</span>
                      </div>
                      <span className="line-clamp-1">{ch.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Info */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 text-center">
              <p className="text-[11px] text-slate-400">
                Protected Cloud eBook • Infano Care
              </p>
            </div>
          </div>
          <div className="flex-1" onClick={() => setShowTocDrawer(false)} />
        </div>
      )}
    </div>
  );
}

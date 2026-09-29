"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Search,
  Sparkles,
  Highlighter,
  MessageSquare,
  Clock,
  Settings2,
  X,
  Share2,
  Palette
} from "lucide-react";
import { 
  LibraryService, 
  BookReaderData, 
  ChapterContentResponse 
} from "@/services/library.service";
import { useAuthStore } from "@/store/auth-store";

type ReaderTheme = "white" | "sepia" | "mint" | "charcoal" | "amoled";
type ReaderFont = "serif" | "sans" | "mono";
type ReaderMargin = "narrow" | "normal" | "wide";
type ReaderLineHeight = "tight" | "normal" | "relaxed";

interface UserHighlight {
  id: string;
  text: string;
  color: "yellow" | "pink" | "green" | "purple";
  note?: string;
  chapterIndex: number;
  createdAt: string;
}

export default function KindleEbookReader() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const bookIdOrSlug = (params?.bookId as string) || "gigi-the-book";

  // Data State
  const [bookData, setBookData] = useState<BookReaderData | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [chapterContent, setChapterContent] = useState<ChapterContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kindle UI & Chrome Visibility (Auto-hide on read)
  const [uiVisible, setUiVisible] = useState(true);
  const [theme, setTheme] = useState<ReaderTheme>("sepia");
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<ReaderFont>("serif");
  const [marginWidth, setMarginWidth] = useState<ReaderMargin>("normal");
  const [lineHeight, setLineHeight] = useState<ReaderLineHeight>("normal");
  
  // Drawers
  const [showTocDrawer, setShowTocDrawer] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showSearchDrawer, setShowSearchDrawer] = useState(false);
  const [showHighlightsDrawer, setShowHighlightsDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Highlighting & Bookmarks
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [highlights, setHighlights] = useState<UserHighlight[]>([]);
  const [selectedText, setSelectedText] = useState("");
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);
  const [highlightNote, setHighlightNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  // Text-To-Speech (TTS) Engine
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState<number>(1.0);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);
  const readerContainerRef = useRef<HTMLDivElement>(null);

  // Anti-piracy / DRM protection handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Print (Ctrl+P / Cmd+P)
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P")) e.preventDefault();
      // Prevent Save (Ctrl+S / Cmd+S)
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) e.preventDefault();
      // Arrow navigation
      if (e.key === "ArrowRight") handleNextChapter();
      if (e.key === "ArrowLeft") handlePrevChapter();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentChapterIndex, bookData]);

  // Initialize Web Speech API for TTS
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // 1. Fetch Book Metadata & Reading State
  useEffect(() => {
    const fetchMetadata = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await LibraryService.getBookDetails(bookIdOrSlug);
        setBookData(data);

        // Load highlights from reading state if stored
        const rawBookmarks = (data.readingState.bookmarks as any[]) || [];
        const loadedHighlights: UserHighlight[] = rawBookmarks
          .filter((b) => b.highlightText)
          .map((b, idx) => ({
            id: `hl-${idx}`,
            text: b.highlightText,
            color: b.color || "yellow",
            note: b.note,
            chapterIndex: b.chapterIndex || 0,
            createdAt: b.createdAt || new Date().toISOString()
          }));
        setHighlights(loadedHighlights);

        // Find chapter corresponding to lastReadPage
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
    stopTts();
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

  // Text-To-Speech Narration Handler
  const handleToggleTts = () => {
    if (!synthRef.current || !chapterContent) return;

    if (isTtsPlaying) {
      synthRef.current.pause();
      setIsTtsPlaying(false);
    } else {
      if (synthRef.current.paused) {
        synthRef.current.resume();
        setIsTtsPlaying(true);
      } else {
        // Strip HTML for clear speech
        const plainText = chapterContent.chapter.contentHtml
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        const utterance = new SpeechSynthesisUtterance(plainText);
        utterance.rate = ttsSpeed;
        utterance.pitch = 1.0;
        
        utterance.onend = () => setIsTtsPlaying(false);
        utterance.onerror = () => setIsTtsPlaying(false);

        utteranceRef.current = utterance;
        synthRef.current.cancel(); // clear previous
        synthRef.current.speak(utterance);
        setIsTtsPlaying(true);
      }
    }
  };

  const stopTts = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsTtsPlaying(false);
    }
  };

  const handleTtsSpeedChange = (speed: number) => {
    setTtsSpeed(speed);
    if (utteranceRef.current && isTtsPlaying) {
      stopTts();
      handleToggleTts();
    }
  };

  // Highlighting & Annotation Handler
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedText("");
      setSelectionPosition(null);
      return;
    }

    const text = selection.toString().trim();
    if (text.length > 2) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setSelectionPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    }
  };

  const saveHighlight = (color: "yellow" | "pink" | "green" | "purple") => {
    if (!selectedText) return;

    const newHl: UserHighlight = {
      id: `hl-${Date.now()}`,
      text: selectedText,
      color,
      note: highlightNote || undefined,
      chapterIndex: currentChapterIndex,
      createdAt: new Date().toISOString()
    };

    setHighlights((prev) => [newHl, ...prev]);
    setSelectedText("");
    setSelectionPosition(null);
    setHighlightNote("");
    setShowNoteInput(false);

    // Persist bookmark / highlight to backend
    LibraryService.updateProgress(bookIdOrSlug, {
      bookmark: {
        page: chapterContent?.chapter.pageStart || 1,
        note: `[Highlight: ${color.toUpperCase()}] "${newHl.text.substring(0, 60)}..." ${highlightNote ? "- Note: " + highlightNote : ""}`
      }
    }).catch(console.error);
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

  // Reading estimation calculation (~200 words/min)
  const estimatedMinsLeft = useMemo(() => {
    if (!chapterContent) return 3;
    const wordCount = chapterContent.chapter.contentHtml.replace(/<[^>]+>/g, " ").split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [chapterContent]);

  // Theme style mappings
  const themeStyles = {
    white: {
      bg: "bg-[#FFFFFF]",
      text: "text-[#1E293B]",
      header: "bg-white/95 border-slate-200 text-slate-800 shadow-sm",
      footer: "bg-white/95 border-slate-200 text-slate-700",
      drawer: "bg-white text-slate-900 border-slate-200",
      accent: "bg-purple-600 text-white"
    },
    sepia: {
      bg: "bg-[#FAF7F0]",
      text: "text-[#3E2723]",
      header: "bg-[#FAF7F0]/95 border-[#E8DFC9] text-[#3E2723] shadow-sm",
      footer: "bg-[#FAF7F0]/95 border-[#E8DFC9] text-[#4E342E]",
      drawer: "bg-[#FAF7F0] text-[#3E2723] border-[#E8DFC9]",
      accent: "bg-[#8D6E63] text-white"
    },
    mint: {
      bg: "bg-[#F0FDF4]",
      text: "text-[#14532D]",
      header: "bg-[#F0FDF4]/95 border-[#BBF7D0] text-[#14532D] shadow-sm",
      footer: "bg-[#F0FDF4]/95 border-[#BBF7D0] text-[#166534]",
      drawer: "bg-[#F0FDF4] text-[#14532D] border-[#BBF7D0]",
      accent: "bg-emerald-600 text-white"
    },
    charcoal: {
      bg: "bg-[#1E293B]",
      text: "text-[#F1F5F9]",
      header: "bg-[#1E293B]/95 border-slate-700 text-slate-100 shadow-sm",
      footer: "bg-[#1E293B]/95 border-slate-700 text-slate-300",
      drawer: "bg-[#1E293B] text-slate-100 border-slate-700",
      accent: "bg-purple-500 text-white"
    },
    amoled: {
      bg: "bg-[#09090B]",
      text: "text-[#E4E4E7]",
      header: "bg-[#09090B]/95 border-zinc-800 text-zinc-100 shadow-sm",
      footer: "bg-[#09090B]/95 border-zinc-800 text-zinc-300",
      drawer: "bg-[#09090B] text-zinc-100 border-zinc-800",
      accent: "bg-purple-600 text-white"
    }
  }[theme];

  const fontClass = {
    serif: "font-serif",
    sans: "font-sans",
    mono: "font-mono"
  }[fontFamily];

  const marginClass = {
    narrow: "max-w-2xl px-6",
    normal: "max-w-3xl px-6 sm:px-10",
    wide: "max-w-5xl px-8 sm:px-16"
  }[marginWidth];

  const lineSpacingClass = {
    tight: "leading-relaxed",
    normal: "leading-[1.85]",
    relaxed: "leading-[2.2]"
  }[lineHeight];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
        <p className="text-sm font-medium text-slate-400">Opening Amazon Kindle-style cloud reader...</p>
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
        <Link
          href="/dashboard/library"
          className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm shadow hover:bg-purple-700 transition"
        >
          Back to Library
        </Link>
      </div>
    );
  }

  const toc = bookData.book.tableOfContents;
  const currentChapter = toc[currentChapterIndex];

  return (
    <div
      className={`min-h-screen flex flex-col ${themeStyles.bg} ${themeStyles.text} select-text transition-colors duration-300 relative overflow-x-hidden`}
      onContextMenu={(e) => e.preventDefault()}
      onMouseUp={handleTextSelection}
    >
      {/* ── DRM Subtle Anti-Leak Background Watermark ──────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.025] flex flex-wrap gap-24 p-8 overflow-hidden select-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="text-xs font-mono tracking-widest uppercase rotate-[-25deg]">
            {user?.phone || user?.email || "Infano Secure Reader"} • #{bookData.book.id.substring(0, 8)}
          </span>
        ))}
      </div>

      {/* ── Top Kindle Header Bar (Toggleable / Sticky) ────────────────────────── */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md px-4 sm:px-6 py-3 border-b flex items-center justify-between transition-all duration-300 ${
          themeStyles.header
        } ${uiVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}`}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/library"
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition"
            title="Back to Library"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xs sm:text-sm font-bold truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {bookData.book.title}
            </h1>
            <p className="text-[11px] opacity-70 truncate max-w-[180px]">
              {currentChapter ? currentChapter.title : "Reading"}
            </p>
          </div>
        </div>

        {/* Right Header Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Table of Contents */}
          <button
            onClick={() => setShowTocDrawer(true)}
            className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition flex items-center gap-1.5"
            title="Table of Contents"
          >
            <List className="w-4 h-4" />
            <span className="hidden md:inline text-xs font-medium">Contents</span>
          </button>

          {/* Search inside Book */}
          <button
            onClick={() => setShowSearchDrawer(true)}
            className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition"
            title="Search Book"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Highlights & Notes */}
          <button
            onClick={() => setShowHighlightsDrawer(true)}
            className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition relative"
            title="My Highlights & Notes"
          >
            <Highlighter className="w-4 h-4" />
            {highlights.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500" />
            )}
          </button>

          {/* Text-To-Speech Voice Narrator */}
          <button
            onClick={handleToggleTts}
            className={`p-2.5 rounded-xl transition flex items-center gap-1.5 ${
              isTtsPlaying ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold" : "hover:bg-black/5 dark:hover:bg-white/10"
            }`}
            title={isTtsPlaying ? "Pause Read Aloud" : "Listen to Chapter"}
          >
            {isTtsPlaying ? <Volume2 className="w-4 h-4 animate-pulse text-purple-600" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden lg:inline text-xs">{isTtsPlaying ? "Playing" : "Listen"}</span>
          </button>

          {/* Typography & Kindle Appearance Settings */}
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`p-2.5 rounded-xl transition ${
              showSettingsDrawer ? "bg-black/10 dark:bg-white/15" : "hover:bg-black/5 dark:hover:bg-white/10"
            }`}
            title="Reader Display Settings"
          >
            <Type className="w-4 h-4" />
          </button>

          {/* Fullscreen Mode */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:inline-flex p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── Kindle Floating Highlighting & Annotation Toolbar ───────────────── */}
      {selectedText && selectionPosition && (
        <div
          style={{
            top: `${Math.max(60, selectionPosition.y - 45)}px`,
            left: `${selectionPosition.x}px`,
            transform: "translateX(-50%)"
          }}
          className="fixed z-50 bg-slate-900 text-white rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 border border-slate-700 animate-in fade-in duration-150"
        >
          <button
            onClick={() => saveHighlight("yellow")}
            className="w-7 h-7 rounded-full bg-yellow-400 hover:scale-110 transition shadow-sm"
            title="Yellow Highlight"
          />
          <button
            onClick={() => saveHighlight("pink")}
            className="w-7 h-7 rounded-full bg-pink-400 hover:scale-110 transition shadow-sm"
            title="Pink Highlight"
          />
          <button
            onClick={() => saveHighlight("green")}
            className="w-7 h-7 rounded-full bg-emerald-400 hover:scale-110 transition shadow-sm"
            title="Mint Highlight"
          />
          <button
            onClick={() => saveHighlight("purple")}
            className="w-7 h-7 rounded-full bg-purple-400 hover:scale-110 transition shadow-sm"
            title="Purple Highlight"
          />
          <div className="w-[1px] h-5 bg-slate-700 mx-1" />
          <button
            onClick={() => setShowNoteInput(!showNoteInput)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-xs flex items-center gap-1 text-slate-200"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Note
          </button>
          <button
            onClick={() => { setSelectedText(""); setSelectionPosition(null); }}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Kindle Appearance & Font Drawer ─────────────────────────────────── */}
      {showSettingsDrawer && (
        <div className={`sticky top-14 z-30 px-6 py-5 border-b shadow-xl backdrop-blur-md ${themeStyles.header} animate-in slide-in-from-top duration-200`}>
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
            {/* 1. Theme Color Palette */}
            <div className="space-y-2">
              <span className="font-bold opacity-70 uppercase tracking-wider">Theme</span>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: "white", label: "White", bg: "bg-white", border: "border-slate-300" },
                  { id: "sepia", label: "Sepia", bg: "bg-[#FAF7F0]", border: "border-[#E8DFC9]" },
                  { id: "mint", label: "Mint", bg: "bg-[#F0FDF4]", border: "border-[#BBF7D0]" },
                  { id: "charcoal", label: "Dark", bg: "bg-[#1E293B]", border: "border-slate-700" },
                  { id: "amoled", label: "Black", bg: "bg-[#09090B]", border: "border-zinc-800" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as ReaderTheme)}
                    className={`h-9 rounded-xl border flex items-center justify-center font-bold text-[10px] transition ${t.bg} ${t.border} ${
                      theme === t.id ? "ring-2 ring-purple-600 scale-105" : "opacity-80"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Font Size Scale */}
            <div className="space-y-2">
              <span className="font-bold opacity-70 uppercase tracking-wider">Size: {fontSize}px</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFontSize(Math.max(13, fontSize - 2))}
                  className="flex-1 py-2 rounded-xl bg-black/5 dark:bg-white/10 font-bold hover:bg-black/10 transition text-sm"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                  className="flex-1 py-2 rounded-xl bg-black/5 dark:bg-white/10 font-bold hover:bg-black/10 transition text-base"
                >
                  A+
                </button>
              </div>
            </div>

            {/* 3. Font Family */}
            <div className="space-y-2">
              <span className="font-bold opacity-70 uppercase tracking-wider">Font Typeface</span>
              <div className="flex rounded-xl p-1 bg-black/5 dark:bg-white/10 gap-1">
                <button
                  onClick={() => setFontFamily("serif")}
                  className={`flex-1 py-1.5 rounded-lg font-serif font-bold transition ${
                    fontFamily === "serif" ? "bg-white dark:bg-zinc-800 shadow-sm" : "opacity-70"
                  }`}
                >
                  Bookerly
                </button>
                <button
                  onClick={() => setFontFamily("sans")}
                  className={`flex-1 py-1.5 rounded-lg font-sans font-bold transition ${
                    fontFamily === "sans" ? "bg-white dark:bg-zinc-800 shadow-sm" : "opacity-70"
                  }`}
                >
                  Modern
                </button>
              </div>
            </div>

            {/* 4. Page Margins & Spacing */}
            <div className="space-y-2">
              <span className="font-bold opacity-70 uppercase tracking-wider">Margins & Line Height</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMarginWidth(marginWidth === "narrow" ? "normal" : marginWidth === "normal" ? "wide" : "narrow")}
                  className="flex-1 py-2 rounded-xl bg-black/5 dark:bg-white/10 font-semibold hover:bg-black/10 transition"
                >
                  Margin ({marginWidth})
                </button>
                <button
                  onClick={() => setLineHeight(lineHeight === "tight" ? "normal" : lineHeight === "normal" ? "relaxed" : "tight")}
                  className="flex-1 py-2 rounded-xl bg-black/5 dark:bg-white/10 font-semibold hover:bg-black/10 transition"
                >
                  Spacing ({lineHeight})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Book Chapter Content Area ───────────────────────────────────── */}
      <main
        ref={readerContainerRef}
        onClick={() => setUiVisible(!uiVisible)}
        className={`flex-1 overflow-y-auto py-12 ${marginClass} mx-auto w-full transition-all duration-300 cursor-text`}
      >
        {chapterLoading ? (
          <div className="py-36 flex flex-col items-center justify-center space-y-3 opacity-70">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <p className="text-xs font-medium font-mono">Loading chapter...</p>
          </div>
        ) : chapterContent ? (
          <article className={`space-y-6 ${fontClass} ${lineSpacingClass} transition-all duration-300`}>
            {/* Chapter Header Banner */}
            <div className="space-y-2 pb-6 border-b border-current/10">
              <div className="flex items-center justify-between text-xs font-mono opacity-60">
                <span className="uppercase tracking-widest font-bold">
                  Chapter {currentChapterIndex + 1} of {toc.length}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> ~{estimatedMinsLeft} min left in chapter
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                {chapterContent.chapter.title}
              </h2>
            </div>

            {/* Chapter Body Content */}
            <div
              style={{ fontSize: `${fontSize}px` }}
              className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-inherit select-text"
              dangerouslySetInnerHTML={{ __html: chapterContent.chapter.contentHtml }}
            />

            {/* Chapter Navigation Buttons */}
            <div className="pt-12 mt-12 border-t border-current/10 flex items-center justify-between gap-4 select-none">
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevChapter(); }}
                disabled={currentChapterIndex === 0}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-20 disabled:pointer-events-none font-semibold text-xs sm:text-sm transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Chapter</span>
              </button>

              <span className="text-xs font-mono opacity-60">
                {currentChapterIndex + 1} / {toc.length}
              </span>

              <button
                onClick={(e) => { e.stopPropagation(); handleNextChapter(); }}
                disabled={currentChapterIndex === toc.length - 1}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-20 disabled:pointer-events-none text-white font-semibold text-xs sm:text-sm shadow-md transition"
              >
                <span>Next Chapter</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        ) : null}
      </main>

      {/* ── Bottom Reading Progress Bar (Kindle Style) ────────────────────────── */}
      <footer
        className={`sticky bottom-0 z-40 backdrop-blur-md px-6 py-3 border-t flex items-center justify-between text-xs font-mono transition-all duration-300 ${
          themeStyles.footer
        } ${uiVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"}`}
      >
        <div className="flex items-center gap-3">
          <span>Page {currentChapter ? currentChapter.pageStart : 1} of {bookData.book.totalPages}</span>
          <span className="opacity-40">•</span>
          <span className="text-purple-600 dark:text-purple-400 font-bold">
            {Math.round(((currentChapterIndex + 1) / toc.length) * 100)}% Complete
          </span>
        </div>

        {/* Mini progress track */}
        <div className="w-36 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full bg-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(6, ((currentChapterIndex + 1) / toc.length) * 100)}%` }}
          />
        </div>
      </footer>

      {/* ── Table of Contents Modal Drawer ─────────────────────────────────── */}
      {showTocDrawer && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-sm h-full ${themeStyles.drawer} p-6 flex flex-col justify-between shadow-2xl border-r animate-in slide-in-from-left duration-200`}>
            <div className="space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-current/10">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-base">Table of Contents</h3>
                </div>
                <button onClick={() => setShowTocDrawer(false)} className="p-1 rounded-lg opacity-60 hover:opacity-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {toc.map((ch, idx) => {
                  const isActive = idx === currentChapterIndex;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => { loadChapter(idx); setShowTocDrawer(false); }}
                      className={`w-full text-left p-3.5 rounded-2xl transition flex flex-col gap-1 ${
                        isActive
                          ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20"
                          : "hover:bg-black/5 dark:hover:bg-white/10 text-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs opacity-70 font-mono">
                        <span>Chapter {idx + 1}</span>
                        <span>Pages {ch.pageStart}–{ch.pageEnd}</span>
                      </div>
                      <span className="line-clamp-1">{ch.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="pt-4 border-t border-current/10 text-center text-xs opacity-50 font-mono">
              Protected Cloud Edition • Infano Care
            </div>
          </div>
          <div className="flex-1" onClick={() => setShowTocDrawer(false)} />
        </div>
      )}

      {/* ── Highlights & Notes Drawer ───────────────────────────────────────── */}
      {showHighlightsDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-sm h-full ${themeStyles.drawer} p-6 flex flex-col justify-between shadow-2xl border-l animate-in slide-in-from-right duration-200`}>
            <div className="space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-current/10">
                <div className="flex items-center gap-2">
                  <Highlighter className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-base">My Highlights ({highlights.length})</h3>
                </div>
                <button onClick={() => setShowHighlightsDrawer(false)} className="p-1 rounded-lg opacity-60 hover:opacity-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {highlights.length === 0 ? (
                <div className="py-20 text-center space-y-2 opacity-60">
                  <Highlighter className="w-8 h-8 mx-auto" />
                  <p className="text-xs">Select any text in the book to create colorful highlights and notes.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {highlights.map((hl) => (
                    <div
                      key={hl.id}
                      onClick={() => { loadChapter(hl.chapterIndex); setShowHighlightsDrawer(false); }}
                      className="p-3.5 rounded-2xl border border-current/10 bg-black/5 dark:bg-white/5 space-y-2 cursor-pointer hover:border-purple-400 transition"
                    >
                      <div className="flex items-center justify-between text-[11px] opacity-60 font-mono">
                        <span>Chapter {hl.chapterIndex + 1}</span>
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          hl.color === "yellow" ? "bg-yellow-400" : hl.color === "pink" ? "bg-pink-400" : hl.color === "green" ? "bg-emerald-400" : "bg-purple-400"
                        }`} />
                      </div>
                      <p className="text-xs italic leading-relaxed">"{hl.text}"</p>
                      {hl.note && (
                        <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 pt-1 border-t border-current/10">
                          Note: {hl.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1" onClick={() => setShowHighlightsDrawer(false)} />
        </div>
      )}
    </div>
  );
}

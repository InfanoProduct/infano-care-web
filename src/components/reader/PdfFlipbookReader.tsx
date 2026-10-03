"use client";

import React, { useState, useEffect, useRef, useCallback, forwardRef } from "react";
import HTMLFlipBook from "react-pageflip";
const FlipBook = HTMLFlipBook as any;
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  LayoutGrid,
  FileText,
  BookOpen,
  Sparkles,
  X,
  Layers,
  ChevronFirst,
  ChevronLast,
  Moon,
  Sun
} from "lucide-react";

interface PdfFlipbookReaderProps {
  bookId?: string;
  pdfUrl?: string;
  title: string;
  author?: string;
  totalPages?: number;
  userIdentifier?: string;
}

// ── Ultra-Realistic Paper Flip Sound Synthesizer & WAV Pool ──────────────
function generatePaperFlipWav(): string {
  const sampleRate = 22050;
  const duration = 0.22;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, numSamples * 2, true);

  let lastNoise = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = i / numSamples;
    const env = Math.pow(Math.sin(progress * Math.PI), 1.1) * Math.exp(-progress * 2.0);
    const flexRumble = Math.sin(2 * Math.PI * 160 * t) * Math.exp(-t * 20) * 0.45;
    const whoosh = Math.sin(2 * Math.PI * (420 + 260 * (1 - progress)) * t) * env * 0.35;
    const rawNoise = Math.random() * 2 - 1;
    lastNoise = lastNoise * 0.6 + rawNoise * 0.4;
    const rustle = lastNoise * env * 0.85;
    const sampleVal = Math.max(-1, Math.min(1, flexRumble + whoosh + rustle));
    view.setInt16(44 + i * 2, sampleVal < 0 ? sampleVal * 0x8000 : sampleVal * 0x7fff, true);
  }

  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof btoa !== "undefined" ? "data:audio/wav;base64," + btoa(binary) : "";
}

let cachedAudioPool: HTMLAudioElement[] = [];
let audioPoolIndex = 0;
let globalAudioCtx: AudioContext | null = null;

function initAudioEngine() {
  if (typeof window === "undefined") return;
  if (cachedAudioPool.length === 0) {
    try {
      // 1. Primary: Use custom /sound/flipsound.ogg file
      for (let i = 0; i < 5; i++) {
        const a = new Audio("/sound/flipsound.ogg");
        a.volume = 1.0;
        a.preload = "auto";
        cachedAudioPool.push(a);
      }
    } catch {}
  }

  if (!globalAudioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      try {
        globalAudioCtx = new AudioCtx();
      } catch {}
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === "suspended") {
    globalAudioCtx.resume().catch(() => {});
  }
}

function playPageFlipSound() {
  initAudioEngine();

  // 1. Instant playback via Audio Element Pool (/sound/flipsound.ogg)
  if (cachedAudioPool.length > 0) {
    try {
      const audio = cachedAudioPool[audioPoolIndex];
      audioPoolIndex = (audioPoolIndex + 1) % cachedAudioPool.length;
      audio.currentTime = 0;
      audio.volume = 1.0;
      const p = audio.play();
      if (p !== undefined) {
        p.catch(() => {});
      }
      return;
    } catch {}
  }

  // 2. Fallback Web Audio API synthesizer
  try {
    if (!globalAudioCtx) return;
    const ctx = globalAudioCtx;
    const playSynth = () => {
      const now = ctx.currentTime;
      const duration = 0.18;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const p = i / bufferSize;
        data[i] = (Math.random() * 2 - 1) * Math.sin(p * Math.PI) * Math.exp(-p * 2.2);
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.setValueAtTime(1100, now);
      bandpass.Q.setValueAtTime(1.2, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      source.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);
      source.start(now);
    };

    if (ctx.state === "suspended") {
      ctx.resume().then(playSynth).catch(() => {});
    } else {
      playSynth();
    }
  } catch {}
}

// FlipPage Component for StPageFlip (forwardRef is strictly required)
interface FlipPageProps {
  pageNum: number;
  pageUrl: string;
  totalPages: number;
  userIdentifier: string;
  title: string;
  isHardCover?: boolean;
}

const FlipPage = forwardRef<HTMLDivElement, FlipPageProps>(
  ({ pageNum, pageUrl, totalPages, userIdentifier, title, isHardCover }, ref) => {
    const isLeft = pageNum % 2 === 0;

    return (
      <div
        ref={ref}
        className={`page bg-[#fdfcfb] relative select-none ${
          pageNum === 1
            ? "rounded-r-2xl rounded-l-sm shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]"
            : pageNum === totalPages
            ? "rounded-l-2xl rounded-r-sm shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]"
            : isLeft
            ? "rounded-l-xl shadow-[0_20px_45px_-10px_rgba(0,0,0,0.4)]"
            : "rounded-r-xl shadow-[0_20px_45px_-10px_rgba(0,0,0,0.4)]"
        }`}
        data-density={isHardCover ? "hard" : "soft"}
        style={{ width: "100%", height: "100%", overflow: "hidden" }}
      >
        <div className="relative w-full h-full flex items-center justify-center bg-[#fdfcfb]">
          <img
            src={pageUrl}
            alt={`Page ${pageNum}`}
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
            loading={pageNum <= 4 ? "eager" : "lazy"}
          />

          {/* Anti-piracy dynamic watermark */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.035] rotate-[-25deg] select-none">
            <span className="text-xs sm:text-sm font-mono tracking-widest uppercase font-black text-black">
              {userIdentifier} • {title} • Page {pageNum}
            </span>
          </div>

          {/* Center Spine gradient shadow (Right edge of left pages, Left edge of right pages) */}
          {!isHardCover && (
            <div
              className={`pointer-events-none absolute inset-y-0 w-12 ${
                isLeft
                  ? "right-0 bg-gradient-to-l from-black/25 via-black/10 to-transparent"
                  : "left-0 bg-gradient-to-r from-black/25 via-black/10 to-transparent"
              }`}
            />
          )}

          {/* Outer edge subtle paper shadow */}
          <div
            className={`pointer-events-none absolute inset-y-0 w-5 ${
              isLeft
                ? "left-0 bg-gradient-to-r from-black/10 to-transparent"
                : "right-0 bg-gradient-to-l from-black/10 to-transparent"
            }`}
          />
        </div>
      </div>
    );
  }
);
FlipPage.displayName = "FlipPage";

export default function PdfFlipbookReader({
  bookId = "gigi-the-book",
  title,
  author = "Infano Care",
  totalPages = 120,
  userIdentifier = "Infano Reader",
}: PdfFlipbookReaderProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // 0-indexed in react-pageflip
  const [isDesktop, setIsDesktop] = useState(true);
  const [bookDimensions, setBookDimensions] = useState({ width: 520, height: 735 });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isAutoFlipping, setIsAutoFlipping] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenControls, setShowFullscreenControls] = useState(true);
  const [viewMode, setViewMode] = useState<"flipbook" | "scroll" | "standard">("flipbook");
  const [stageTheme, setStageTheme] = useState<"dark" | "charcoal" | "sepia" | "light">("dark");
  const [isMounted, setIsMounted] = useState(false);

  const flipBookRef = useRef<any>(null);
  const autoFlipTimerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimerRef = useRef<any>(null);

  // Compute responsive large book dimensions utilizing full outer viewport
  const updateDimensions = useCallback(() => {
    if (typeof window === "undefined") return;
    const desktop = window.innerWidth >= 768;
    setIsDesktop(desktop);

    // In fullscreen, minimal top/bottom padding gives an expansive IMAX feel
    const availableH = isFullscreen ? window.innerHeight - 8 : window.innerHeight - 100;
    const availableW = isFullscreen ? window.innerWidth - 16 : window.innerWidth - (desktop ? 64 : 20);

    let pageH: number;
    let pageW: number;

    const ratio = 0.72; // Standard book page width-to-height ratio

    if (desktop) {
      // 2-page spread: total spread width is pageW * 2
      const targetPageH = availableH;
      const targetPageW = Math.floor(targetPageH * ratio);

      if (targetPageW * 2 > availableW) {
        pageW = Math.floor(availableW / 2);
        pageH = Math.floor(pageW / ratio);
      } else {
        pageH = targetPageH;
        pageW = targetPageW;
      }
    } else {
      // Mobile / portrait single-page view
      const targetPageW = availableW;
      const targetPageH = Math.floor(targetPageW / ratio);
      if (targetPageH > availableH) {
        pageH = availableH;
        pageW = Math.floor(pageH * ratio);
      } else {
        pageW = targetPageW;
        pageH = targetPageH;
      }
    }

    setBookDimensions({
      width: Math.max(240, pageW),
      height: Math.max(340, pageH),
    });
  }, [isFullscreen]);

  useEffect(() => {
    setIsMounted(true);
    updateDimensions();
    initAudioEngine();

    const handleUnlockAudio = () => {
      initAudioEngine();
    };

    window.addEventListener("click", handleUnlockAudio, { passive: true });
    window.addEventListener("keydown", handleUnlockAudio, { passive: true });
    window.addEventListener("touchstart", handleUnlockAudio, { passive: true });
    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("click", handleUnlockAudio);
      window.removeEventListener("keydown", handleUnlockAudio);
      window.removeEventListener("touchstart", handleUnlockAudio);
      window.removeEventListener("resize", updateDimensions);
    };
  }, [updateDimensions]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (!isFs) {
        setShowFullscreenControls(true);
      }
      updateDimensions();
      setTimeout(updateDimensions, 60);
      setTimeout(updateDimensions, 180);
    };

    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, [updateDimensions]);

  // Auto-hide controls in fullscreen after mouse inactivity (YouTube style)
  const handleUserActivity = useCallback(() => {
    setShowFullscreenControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (isFullscreen) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowFullscreenControls(false);
      }, 3000);
    }
  }, [isFullscreen]);

  const getPageUrl = useCallback(
    (pageNum: number) => {
      return `/api/reader/page?bookId=${encodeURIComponent(bookId)}&page=${pageNum}&v=${totalPages}`;
    },
    [bookId, totalPages]
  );

  // Preload adjacent pages
  useEffect(() => {
    const cur = currentPageIndex + 1;
    const toPreload = [cur + 1, cur + 2, cur + 3, cur + 4, cur + 5, cur + 6].filter((p) => p <= totalPages);
    toPreload.forEach((p) => {
      const img = new Image();
      img.src = getPageUrl(p);
    });
  }, [currentPageIndex, totalPages, getPageUrl]);

  const lastSoundPlayRef = useRef<number>(0);
  const triggerPageFlipSound = useCallback(() => {
    if (!soundEnabled) return;
    const now = Date.now();
    if (now - lastSoundPlayRef.current < 220) return; // Prevent double trigger
    lastSoundPlayRef.current = now;
    playPageFlipSound();
  }, [soundEnabled]);

  // FlipBook Page Turns - sound plays instantly on interaction
  const handleNext = useCallback(() => {
    initAudioEngine();
    triggerPageFlipSound();
    if (flipBookRef.current) {
      try {
        flipBookRef.current.pageFlip().flipNext();
      } catch {}
    }
  }, [triggerPageFlipSound]);

  const handlePrev = useCallback(() => {
    initAudioEngine();
    triggerPageFlipSound();
    if (flipBookRef.current) {
      try {
        flipBookRef.current.pageFlip().flipPrev();
      } catch {}
    }
  }, [triggerPageFlipSound]);

  const jumpToPage = (pageNum: number) => {
    initAudioEngine();
    triggerPageFlipSound();
    const targetIdx = Math.max(0, Math.min(totalPages - 1, pageNum - 1));
    if (flipBookRef.current) {
      try {
        flipBookRef.current.pageFlip().turnToPage(targetIdx);
      } catch {}
    }
    setCurrentPageIndex(targetIdx);
    setShowThumbnails(false);
  };

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      initAudioEngine();
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Home") {
        jumpToPage(1);
      } else if (e.key === "End") {
        jumpToPage(totalPages);
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "m" || e.key === "M") {
        setSoundEnabled((s) => !s);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, totalPages]);

  // Auto-flip slideshow handler
  useEffect(() => {
    if (isAutoFlipping) {
      autoFlipTimerRef.current = setInterval(() => {
        if (flipBookRef.current) {
          const cur = flipBookRef.current.pageFlip().getCurrentPageIndex();
          const total = flipBookRef.current.pageFlip().getPageCount();
          if (cur < total - 1) {
            triggerPageFlipSound();
            flipBookRef.current.pageFlip().flipNext();
          } else {
            triggerPageFlipSound();
            flipBookRef.current.pageFlip().turnToPage(0);
          }
        }
      }, 4500);
    } else {
      if (autoFlipTimerRef.current) clearInterval(autoFlipTimerRef.current);
    }
    return () => {
      if (autoFlipTimerRef.current) clearInterval(autoFlipTimerRef.current);
    };
  }, [isAutoFlipping, triggerPageFlipSound]);

  const toggleFullscreen = () => {
    initAudioEngine();
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const onChangeState = (e: any) => {
    if (e.data === "flipping") {
      triggerPageFlipSound();
    }
  };

  const onFlip = (e: any) => {
    setCurrentPageIndex(e.data);
  };

  // Page display badge (e.g. "1/312" or "2-3/312")
  const getPageDisplayBadge = () => {
    if (currentPageIndex === 0) {
      return `1/${totalPages}`;
    }
    if (!isDesktop) {
      return `${currentPageIndex + 1}/${totalPages}`;
    }
    const leftNum = currentPageIndex % 2 === 1 ? currentPageIndex + 1 : currentPageIndex;
    const rightNum = leftNum + 1 <= totalPages ? leftNum + 1 : leftNum;
    if (leftNum === rightNum) {
      return `${leftNum}/${totalPages}`;
    }
    return `${leftNum}-${rightNum}/${totalPages}`;
  };

  // Calculate cover center translation offset
  // When on cover (page 1) in desktop 2-page mode, shift left by half page width so cover is centered perfectly
  const isCoverActive = isDesktop && currentPageIndex === 0;
  const isBackCoverActive = isDesktop && currentPageIndex === totalPages - 1 && totalPages % 2 === 1;

  const stageThemes = {
    dark: "bg-[#45494d]",
    charcoal: "bg-[#202225]",
    sepia: "bg-[#443831]",
    light: "bg-[#e5e8ec]",
  };

  return (
    <div
      ref={containerRef}
      onClick={() => initAudioEngine()}
      onMouseMove={handleUserActivity}
      onTouchStart={handleUserActivity}
      className={`fixed inset-0 z-50 w-screen h-screen flex flex-col ${stageThemes[stageTheme]} select-none overflow-hidden transition-colors duration-300 text-white cursor-default`}
    >
      <style>{`
        .flipbook-canvas {
          background: transparent !important;
          background-color: transparent !important;
          box-shadow: none !important;
        }
        .stf__parent,
        .stf__wrapper,
        .stf__block {
          background: transparent !important;
          background-color: transparent !important;
          box-shadow: none !important;
          border: none !important;
          outline: none !important;
        }
        .stf__item {
          background: transparent !important;
          background-color: transparent !important;
        }
      `}</style>

      {/* ── Top Floating Minimal Header (Auto-hides in Fullscreen) ──────────── */}
      <header
        className={`w-full h-12 bg-black/50 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between border-b border-white/10 z-40 shrink-0 transition-all duration-300 ${
          isFullscreen && !showFullscreenControls ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        }`}
      >
        {/* Left: Back Link & Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/library"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs font-bold active:scale-95"
            title="Back to My Library"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Library</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xs sm:text-sm font-bold truncate max-w-[200px] sm:max-w-md text-white">
              {title}
            </h1>
            <span className="hidden md:inline text-[11px] text-white/60">({totalPages} Pages)</span>
          </div>
        </div>

        {/* Right: Theme Switcher & View Modes */}
        <div className="flex items-center gap-2">
          {/* Stage Background Themes */}
          <div className="flex items-center bg-black/30 p-1 rounded-xl gap-1">
            <button
              onClick={() => setStageTheme("dark")}
              className={`p-1.5 rounded-lg text-xs transition ${stageTheme === "dark" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"}`}
              title="Dark Stage"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setStageTheme("charcoal")}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${stageTheme === "charcoal" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"}`}
              title="OLED Charcoal Stage"
            >
              OLED
            </button>
            <button
              onClick={() => setStageTheme("sepia")}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${stageTheme === "sepia" ? "bg-[#d6c7b2] text-[#3e2f26]" : "text-white/60 hover:text-white"}`}
              title="Sepia Stage"
            >
              Sepia
            </button>
            <button
              onClick={() => setStageTheme("light")}
              className={`p-1.5 rounded-lg text-xs transition ${stageTheme === "light" ? "bg-white text-slate-800" : "text-white/60 hover:text-white"}`}
              title="Light Stage"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* View Mode */}
          <div className="hidden sm:flex items-center bg-black/30 p-1 rounded-xl gap-1">
            <button
              onClick={() => setViewMode("flipbook")}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
                viewMode === "flipbook" ? "bg-rose-600 text-white shadow-sm" : "text-white/60 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>3D Flip</span>
            </button>
            <button
              onClick={() => setViewMode("scroll")}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
                viewMode === "scroll" ? "bg-rose-600 text-white shadow-sm" : "text-white/60 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Scroll</span>
            </button>
          </div>

          {/* Fullscreen Button (Top Header) */}
          <button
            onClick={toggleFullscreen}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
              isFullscreen
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── Main 3D Book Stage ───────────────────────────────────────────────── */}
      <main
        onDoubleClick={toggleFullscreen}
        className="flex-1 relative flex items-center justify-center overflow-hidden p-0 sm:p-1"
      >
        {viewMode === "flipbook" ? (
          <div
            className="relative flex items-center justify-center max-w-full max-h-full transition-transform duration-200"
            style={{ transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined }}
          >
            {/* Left Floating Nav Arrow */}
            <button
              onClick={handlePrev}
              disabled={currentPageIndex === 0}
              className={`fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 hover:bg-black/80 disabled:opacity-0 text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group ${
                isFullscreen && !showFullscreenControls ? "opacity-0 hover:opacity-100" : "opacity-100"
              }`}
              title="Previous Page (Left Arrow)"
            >
              <ChevronLeft className="w-7 h-7 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* Right Floating Nav Arrow */}
            <button
              onClick={handleNext}
              disabled={currentPageIndex >= totalPages - 1}
              className={`fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 hover:bg-black/80 disabled:opacity-0 text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group ${
                isFullscreen && !showFullscreenControls ? "opacity-0 hover:opacity-100" : "opacity-100"
              }`}
              title="Next Page (Right Arrow / Space)"
            >
              <ChevronRight className="w-7 h-7 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* ── HTMLFlipBook Real 3D Interactive Engine ────────────────────── */}
            {isMounted && (
              <div
                className="relative transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{
                  transform: isCoverActive
                    ? `translateX(-${bookDimensions.width / 2}px)`
                    : isBackCoverActive
                    ? `translateX(${bookDimensions.width / 2}px)`
                    : "translateX(0px)",
                }}
              >
                <div className="relative bg-transparent">
                  <FlipBook
                    key={`flipbook-${bookDimensions.width}x${bookDimensions.height}-${isFullscreen ? "fs" : "normal"}`}
                    ref={flipBookRef}
                    width={bookDimensions.width}
                    height={bookDimensions.height}
                    size="fixed"
                    minWidth={200}
                    maxWidth={2400}
                    minHeight={300}
                    maxHeight={3000}
                    maxShadowOpacity={0.6}
                    showCover={true}
                    mobileScrollSupport={true}
                    useMouseEvents={true}
                    flippingTime={500}
                    drawShadow={true}
                    usePortrait={!isDesktop}
                    startPage={currentPageIndex}
                    onFlip={onFlip}
                    onChangeState={onChangeState}
                    className="flipbook-canvas"
                    style={{ margin: "0 auto", background: "transparent" }}
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <FlipPage
                        key={pageNum}
                        pageNum={pageNum}
                        pageUrl={getPageUrl(pageNum)}
                        totalPages={totalPages}
                        userIdentifier={userIdentifier}
                        title={title}
                        isHardCover={pageNum === 1 || pageNum === totalPages}
                      />
                    ))}
                  </FlipBook>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Continuous Scroll View Mode */
          <div className="w-full max-w-3xl space-y-6 overflow-y-auto max-h-[calc(100vh-120px)] px-4 py-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const url = getPageUrl(p);
              return (
                <div
                  key={p}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden border border-black/10 relative min-h-[400px] flex items-center justify-center"
                >
                  <img src={url} alt={`Page ${p}`} className="w-full h-auto object-contain" loading="lazy" />
                  <div className="absolute bottom-3 right-4 px-2.5 py-1 rounded-md bg-black/60 text-white font-mono text-[10px]">
                    Page {p} of {totalPages}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Slide-Out Lazy Thumbnails Drawer ─────────────────────────────────── */}
      {showThumbnails && (
        <div className="absolute bottom-14 inset-x-0 z-40 bg-black/90 backdrop-blur-xl border-t border-white/10 p-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="max-w-6xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                Page Thumbnails ({totalPages} Pages)
              </span>
              <button
                onClick={() => setShowThumbnails(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const thumbUrl = getPageUrl(p);
                return (
                  <button
                    key={p}
                    onClick={() => jumpToPage(p)}
                    className={`flex flex-col items-center shrink-0 group rounded-xl p-1 border-2 transition ${
                      currentPageIndex + 1 === p
                        ? "border-rose-500 ring-2 ring-rose-500/20 scale-105"
                        : "border-white/20 hover:border-white"
                    }`}
                  >
                    <div className="w-20 h-28 bg-white rounded-lg overflow-hidden shadow-sm flex items-center justify-center">
                      <img src={thumbUrl} alt={`Thumb ${p}`} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <span className="text-[10px] font-mono font-bold mt-1 text-white/60 group-hover:text-white">
                      {p}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Floating Scrubber Bar (Auto-hides in Fullscreen) ──────────── */}
      <footer
        className={`w-full h-12 bg-black/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between border-t border-white/10 z-40 shrink-0 text-xs text-white transition-all duration-300 ${
          isFullscreen && !showFullscreenControls ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        }`}
      >
        {/* Left: Page Indicator Badge (e.g. 1/312 or 2-3/312) */}
        <div className="flex items-center gap-3 min-w-[80px]">
          <span className="font-mono text-xs font-bold tracking-wider text-white">
            {getPageDisplayBadge()}
          </span>
        </div>

        {/* Center: Interactive Scrubber Slider */}
        <div className="flex-1 max-w-xl mx-4 sm:mx-8 flex items-center gap-3">
          <input
            type="range"
            min="1"
            max={totalPages}
            value={currentPageIndex + 1}
            onChange={(e) => jumpToPage(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-white hover:accent-rose-500 transition"
          />
        </div>

        {/* Right: Controls (Thumbnails, Audio, Zoom, Fullscreen) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Thumbnails Drawer Toggle */}
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-2 rounded-xl transition ${
              showThumbnails ? "bg-rose-600 text-white" : "hover:bg-white/10 text-white/80 hover:text-white"
            }`}
            title="Page Thumbnails"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              initAudioEngine();
              setSoundEnabled(!soundEnabled);
            }}
            className={`p-2 rounded-xl transition ${
              soundEnabled ? "hover:bg-white/10 text-white/80 hover:text-white" : "bg-rose-500/20 text-rose-400"
            }`}
            title={soundEnabled ? "Mute Page-Flip Sound (M)" : "Enable Page-Flip Sound (M)"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Auto-Play */}
          <button
            onClick={() => setIsAutoFlipping(!isAutoFlipping)}
            className={`p-2 rounded-xl transition ${
              isAutoFlipping ? "bg-rose-600 text-white font-bold" : "hover:bg-white/10 text-white/80 hover:text-white"
            }`}
            title={isAutoFlipping ? "Pause Slideshow" : "Auto-Play Slideshow"}
          >
            {isAutoFlipping ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Zoom Controls */}
          <div className="hidden md:flex items-center gap-1 bg-white/10 px-1 py-0.5 rounded-xl">
            <button
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] font-bold px-1 min-w-[34px] text-center">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl transition ${
              isFullscreen ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/80 hover:text-white"
            }`}
            title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </footer>
    </div>
  );
}

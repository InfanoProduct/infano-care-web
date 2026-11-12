"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Settings2,
  Volume2,
  VolumeX,
  AlertCircle,
} from "lucide-react";

export interface PauseCue {
  id: string;
  at_seconds: number;
  asked?: boolean;
}

export interface HlsCourseVideoPlayerHandle {
  seekTo: (sec: number) => void;
  play: () => void;
  pause: () => void;
}

interface HlsCourseVideoPlayerProps {
  src?: string | null;
  poster?: string | null;
  initialTime?: number;
  totalDurationSec: number;
  borderColor?: string;
  accentColor?: string;
  captionText?: string;
  ccEnabled: boolean;
  onToggleCc: () => void;
  pauseCues?: PauseCue[];
  speed: number;
  onSpeedChange: (nextSpeed: number) => void;
  isPlaying: boolean;
  onPlayingChange: (playing: boolean) => void;
  currentTime: number;
  onTimeUpdate: (timeSec: number) => void;
  onUserSeek: (targetSec: number) => void;
  blockedByModal?: boolean;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5];

const formatSec = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export const HlsCourseVideoPlayer = forwardRef<
  HlsCourseVideoPlayerHandle,
  HlsCourseVideoPlayerProps
>(function HlsCourseVideoPlayer(
  {
    src,
    poster,
    initialTime = 0,
    totalDurationSec,
    borderColor = "#D8ECF8",
    captionText,
    ccEnabled,
    onToggleCc,
    pauseCues = [],
    speed,
    onSpeedChange,
    isPlaying,
    onPlayingChange,
    currentTime,
    onTimeUpdate,
    onUserSeek,
    blockedByModal = false,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<any>(null);
  const scrubBarRef = useRef<HTMLDivElement | null>(null);

  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [bufferedPct, setBufferedPct] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [levels, setLevels] = useState<{ index: number; label: string }[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 = Auto
  const [menuOpen, setMenuOpen] = useState<"speed" | "quality" | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(totalDurationSec);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const initialTimeRef = useRef(initialTime);
  const appliedInitialSeekRef = useRef(false);

  useEffect(() => {
    initialTimeRef.current = initialTime;
    const video = videoRef.current;
    if (
      !appliedInitialSeekRef.current &&
      video &&
      initialTime > 0 &&
      Number.isFinite(initialTime) &&
      video.readyState >= 1
    ) {
      try {
        video.currentTime = initialTime;
        appliedInitialSeekRef.current = true;
      } catch {
        // ignore
      }
    }
  }, [initialTime]);

  const hasRealVideo = Boolean(src && src.trim().length > 0);
  const effectiveDuration =
    hasRealVideo && videoDuration > 0 ? videoDuration : totalDurationSec;

  const isHlsUrl = Boolean(src && src.toLowerCase().includes(".m3u8"));

  // Initialize HLS.js or native playback dynamically for top performance
  useEffect(() => {
    const video = videoRef.current;
    if (!hasRealVideo || !src || !video) return;

    let cancelled = false;
    setStreamError(null);
    setLevels([]);
    setCurrentLevel(-1);

    const applyInitialSeek = () => {
      const target = initialTimeRef.current;
      if (!appliedInitialSeekRef.current && target > 0 && Number.isFinite(target)) {
        try {
          video.currentTime = target;
          appliedInitialSeekRef.current = true;
        } catch {
          // ignore if not seekable yet
        }
      }
    };

    const setupPlayer = async () => {
      // Cleanup any prior instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (isHlsUrl) {
        // Prefer native HLS on Safari / iOS if supported
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          video.addEventListener("loadedmetadata", applyInitialSeek, { once: true });
          return;
        }

        try {
          const HlsModule = await import("hls.js");
          const Hls = HlsModule.default;

          if (cancelled) return;

          if (Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: false,
              backBufferLength: 30,
              maxBufferLength: 30,
              startPosition: initialTime > 0 ? initialTime : -1,
            });
            hlsRef.current = hls;

            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, (_evt: any, data: any) => {
              if (cancelled) return;
              if (Array.isArray(data?.levels) && data.levels.length > 0) {
                const mapped = data.levels
                  .map((lvl: any, idx: number) => ({
                    index: idx,
                    label: lvl.height ? `${lvl.height}p` : `Level ${idx + 1}`,
                  }))
                  .sort((a: any, b: any) => parseInt(b.label) - parseInt(a.label));
                setLevels(mapped);
              }
            });

            hls.on(Hls.Events.ERROR, (_evt: any, data: any) => {
              if (!data?.fatal) return;
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                setStreamError("Unable to stream this lesson video right now.");
                setBuffering(false);
              }
            });
          } else {
            setStreamError("Your browser does not support HLS video streaming.");
          }
        } catch {
          if (!cancelled) {
            setStreamError("Failed to initialize the video player.");
          }
        }
      } else {
        video.src = src;
        video.addEventListener("loadedmetadata", applyInitialSeek, { once: true });
      }
    };

    setupPlayer();

    return () => {
      cancelled = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, hasRealVideo, isHlsUrl]);

  // Sync playbackRate when speed changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Sync volume & mute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
      videoRef.current.volume = volume;
    }
  }, [muted, volume]);

  // Pause underlying video if a modal (Pause & Think) interrupts
  useEffect(() => {
    if (blockedByModal && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  }, [blockedByModal]);

  // Fullscreen listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const seekTo = useCallback(
    (target: number) => {
      const clamped = Math.max(0, Math.min(effectiveDuration, target));
      if (hasRealVideo && videoRef.current) {
        videoRef.current.currentTime = clamped;
      }
      onUserSeek(clamped);
    },
    [effectiveDuration, hasRealVideo, onUserSeek]
  );

  const play = useCallback(() => {
    if (blockedByModal) return;
    if (hasRealVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
    onPlayingChange(true);
  }, [blockedByModal, hasRealVideo, onPlayingChange]);

  const pause = useCallback(() => {
    if (hasRealVideo && videoRef.current) {
      videoRef.current.pause();
    }
    onPlayingChange(false);
  }, [hasRealVideo, onPlayingChange]);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  useImperativeHandle(
    ref,
    () => ({
      seekTo,
      play,
      pause,
    }),
    [seekTo, play, pause]
  );

  const handleSelectQuality = (levelIdx: number) => {
    setCurrentLevel(levelIdx);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIdx;
    }
    setMenuOpen(null);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    } catch {
      // ignore fullscreen errors
    }
  };

  // Pointer scrubbing on progress bar
  const computeScrubTime = (clientX: number) => {
    if (!scrubBarRef.current) return 0;
    const rect = scrubBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * effectiveDuration;
  };

  const handleScrubStart = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    seekTo(computeScrubTime(e.clientX));
  };

  const handleScrubMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    seekTo(computeScrubTime(e.clientX));
  };

  const handleScrubEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    setIsScrubbing(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const progressPct = Math.min(100, (currentTime / Math.max(1, effectiveDuration)) * 100);

  return (
    <div
      ref={containerRef}
      style={{ borderColor }}
      className={`rounded-[26px] overflow-hidden bg-[#23182D] border-[5px] shadow-xl flex flex-col select-none ${
        isFullscreen ? "rounded-none border-0 w-screen h-screen justify-between" : ""
      }`}
    >
      {/* Video Viewport */}
      <div
        onClick={togglePlay}
        className={`relative bg-[#1E1428] grid place-items-center cursor-pointer overflow-hidden ${
          isFullscreen ? "flex-1 min-h-0" : "aspect-video w-full"
        }`}
      >
        {hasRealVideo ? (
          <video
            ref={videoRef}
            poster={poster || undefined}
            playsInline
            preload="metadata"
            className="w-full h-full object-contain bg-black"
            onPlay={() => onPlayingChange(true)}
            onPause={() => onPlayingChange(false)}
            onWaiting={() => setBuffering(true)}
            onPlaying={() => setBuffering(false)}
            onCanPlay={() => setBuffering(false)}
            onLoadedMetadata={(e) => {
              const dur = e.currentTarget.duration;
              if (Number.isFinite(dur) && dur > 0) {
                setVideoDuration(dur);
              }
            }}
            onProgress={(e) => {
              const v = e.currentTarget;
              if (v.buffered.length > 0 && effectiveDuration > 0) {
                const end = v.buffered.end(v.buffered.length - 1);
                setBufferedPct(Math.min(100, (end / effectiveDuration) * 100));
              }
            }}
            onTimeUpdate={(e) => {
              onTimeUpdate(e.currentTarget.currentTime);
            }}
          />
        ) : (
          /* Clean SVG Studio Placeholder when seeded lesson doesn't have an m3u8 URL yet */
          <div className="w-full h-full relative flex flex-col items-center justify-center bg-gradient-to-br from-[#2C1E38] via-[#23182D] to-[#1A1023] p-6">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_30%_25%,#F4A3B4,transparent_45%),radial-gradient(circle_at_75%_80%,#8EBFE0,transparent_45%)]" />
            <svg width="136" height="124" viewBox="0 0 104 96" aria-hidden="true" className="relative z-10 drop-shadow-md">
              <circle cx="52" cy="40" r="40" fill="#3A2A47" />
              <circle cx="34" cy="34" r="10" fill="#1F1428" />
              <circle cx="70" cy="34" r="10" fill="#1F1428" />
              <circle cx="52" cy="26" r="12" fill="#1F1428" />
              <circle cx="52" cy="42" r="17" fill="#B9785A" />
              <path d="M22 96c4-18 16-26 30-26s26 8 30 26z" fill="#E8738A" />
            </svg>
            <span className="relative z-10 mt-3 bg-white/12 backdrop-blur-xs text-white/90 rounded-full px-3.5 py-1 text-xs font-semibold tracking-wide">
              {isPlaying ? "Playing lesson preview..." : "Interactive lesson preview · Tap play"}
            </span>
          </div>
        )}

        {/* Buffering Indicator */}
        {buffering && !streamError && (
          <div className="absolute inset-0 bg-black/35 grid place-items-center pointer-events-none z-10">
            <Loader2 size={36} className="animate-spin text-white" />
          </div>
        )}

        {/* Stream Error Banner */}
        {streamError && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 bg-[#1E1428]/90 grid place-items-center p-6 text-center z-20"
          >
            <div className="max-w-sm flex flex-col items-center gap-3 text-white">
              <AlertCircle size={32} className="text-[#F4A3B4]" />
              <p className="text-sm font-medium text-white/90 m-0">{streamError}</p>
              <button
                type="button"
                onClick={() => {
                  setStreamError(null);
                  hlsRef.current?.startLoad();
                  play();
                }}
                className="px-5 py-2 rounded-full bg-[#C2456A] text-white text-xs font-bold cursor-pointer"
              >
                Retry stream
              </button>
            </div>
          </div>
        )}

        {/* Live CC Overlay */}
        {ccEnabled && captionText && (
          <div className="absolute left-4 right-4 bottom-4 text-center pointer-events-none z-10">
            <span className="inline-block bg-black/75 backdrop-blur-xs text-white rounded-xl px-3.5 py-1.5 text-xs sm:text-sm md:text-base font-medium shadow-md max-w-2xl">
              {captionText}
            </span>
          </div>
        )}

        {/* Big Center Play Button when paused */}
        {!isPlaying && !blockedByModal && !streamError && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              play();
            }}
            aria-label="Play video"
            className="absolute z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 hover:scale-105 active:scale-95 grid place-items-center text-[#3D2C4A] shadow-2xl cursor-pointer transition-transform"
          >
            <Play size={30} fill="currentColor" className="ml-1" />
          </button>
        )}
      </div>

      {/* Control Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="px-4 sm:px-5 py-3 bg-[#3D2C4A] text-white relative z-20"
      >
        {/* Scrubbing Timeline */}
        <div
          ref={scrubBarRef}
          onPointerDown={handleScrubStart}
          onPointerMove={handleScrubMove}
          onPointerUp={handleScrubEnd}
          className="relative h-7 flex items-center cursor-pointer touch-none group"
        >
          {/* Track Background */}
          <div className="w-full h-1.5 group-hover:h-2 transition-all rounded-full bg-white/20 relative overflow-hidden">
            {/* Buffered Progress */}
            {hasRealVideo && (
              <div
                style={{ width: `${bufferedPct}%` }}
                className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
              />
            )}
            {/* Watched Fill */}
            <div
              style={{ width: `${progressPct}%` }}
              className="absolute inset-y-0 left-0 bg-[#F4A3B4] rounded-full"
            />
          </div>

          {/* 80% Unlock Marker */}
          <span
            title="Play unlocks here (80%)"
            style={{ left: "80%" }}
            className="absolute top-1 bottom-1 w-0.5 bg-[#A8D8BE] pointer-events-none"
          />

          {/* Pause & Think Diamond Cues */}
          {pauseCues.map((pq, idx) => (
            <span
              key={pq.id}
              title={`Pause & think ${idx + 1}`}
              style={{
                left: `${Math.min(99, (pq.at_seconds / Math.max(1, effectiveDuration)) * 100)}%`,
              }}
              className={`absolute w-3 h-3 -translate-x-1.5 rotate-45 rounded-[3px] shadow-xs pointer-events-none transition-colors ${
                pq.asked ? "bg-[#FFE08A]" : "bg-white"
              }`}
            />
          ))}

          {/* Scrub Knob */}
          <span
            style={{ left: `${progressPct}%` }}
            className="absolute w-3.5 h-3.5 -translate-x-1.5 rounded-full bg-white shadow-md scale-0 group-hover:scale-100 transition-transform pointer-events-none"
          />
        </div>

        {/* Bottom Controls Row */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 mt-1">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 grid place-items-center cursor-pointer transition-colors"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
          </button>

          <button
            type="button"
            onClick={() => seekTo(currentTime - 10)}
            aria-label="Back 10 seconds"
            className="h-9 px-2.5 sm:px-3 rounded-full bg-white/12 hover:bg-white/22 text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw size={13} />
            <span>10s</span>
          </button>

          <button
            type="button"
            onClick={() => seekTo(currentTime + 10)}
            aria-label="Forward 10 seconds"
            className="hidden sm:inline-flex h-9 px-2.5 sm:px-3 rounded-full bg-white/12 hover:bg-white/22 text-xs font-bold items-center gap-1 cursor-pointer transition-colors"
          >
            <span>10s</span>
            <RotateCw size={13} />
          </button>

          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-1.5 group/vol">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute" : "Mute"}
              className="w-9 h-9 rounded-full hover:bg-white/15 grid place-items-center cursor-pointer"
            >
              {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                if (v > 0 && muted) setMuted(false);
              }}
              aria-label="Volume"
              className="w-0 group-hover/vol:w-16 opacity-0 group-hover/vol:opacity-100 transition-all accent-[#F4A3B4] cursor-pointer"
            />
          </div>

          <span className="text-xs sm:text-sm font-semibold tabular-nums text-white/90 ml-1">
            {formatSec(currentTime)} / {formatSec(effectiveDuration)}
          </span>

          <span className="flex-1" />

          {/* HLS Quality Selector (shown when stream has multiple renditions) */}
          {levels.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((m) => (m === "quality" ? null : "quality"))}
                aria-label="Video quality"
                className="h-8 px-2.5 rounded-full bg-white/15 hover:bg-white/25 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Settings2 size={13} />
                <span>
                  {currentLevel === -1
                    ? "Auto"
                    : levels.find((l) => l.index === currentLevel)?.label || "Auto"}
                </span>
              </button>
              {menuOpen === "quality" && (
                <div className="absolute right-0 bottom-10 w-28 bg-[#2E2039] border border-white/15 rounded-xl py-1 shadow-2xl z-30 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => handleSelectQuality(-1)}
                    className={`w-full text-left px-3 py-1.5 hover:bg-white/10 cursor-pointer ${
                      currentLevel === -1 ? "text-[#F4A3B4] font-bold" : "text-white"
                    }`}
                  >
                    Auto
                  </button>
                  {levels.map((lvl) => (
                    <button
                      key={lvl.index}
                      type="button"
                      onClick={() => handleSelectQuality(lvl.index)}
                      className={`w-full text-left px-3 py-1.5 hover:bg-white/10 cursor-pointer ${
                        currentLevel === lvl.index ? "text-[#F4A3B4] font-bold" : "text-white"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Speed Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((m) => (m === "speed" ? null : "speed"))}
              aria-label="Playback speed"
              className="h-8 px-2.5 rounded-full bg-white/15 hover:bg-white/25 text-xs font-bold cursor-pointer"
            >
              {speed}x
            </button>
            {menuOpen === "speed" && (
              <div className="absolute right-0 bottom-10 w-24 bg-[#2E2039] border border-white/15 rounded-xl py-1 shadow-2xl z-30 text-xs font-semibold">
                {SPEED_OPTIONS.map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => {
                      onSpeedChange(sp);
                      setMenuOpen(null);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-white/10 cursor-pointer ${
                      speed === sp ? "text-[#F4A3B4] font-bold" : "text-white"
                    }`}
                  >
                    {sp}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Captions Toggle */}
          <button
            type="button"
            onClick={onToggleCc}
            aria-pressed={ccEnabled}
            className={`h-8 px-2.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
              ccEnabled ? "bg-white text-[#3D2C4A]" : "bg-white/15 text-white hover:bg-white/25"
            }`}
          >
            CC
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 grid place-items-center cursor-pointer transition-colors"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
});


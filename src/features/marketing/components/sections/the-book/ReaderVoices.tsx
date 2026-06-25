'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

const TESTIMONIALS = [
  { videoUrl: '/uploads/assets/testimonial-1.mp4', name: 'Sneha', age: 14, location: 'Pune' },
  { videoUrl: '/uploads/assets/testimonial-2.mp4', name: 'Zoya', age: 12, location: 'Mumbai' },
  { videoUrl: '/uploads/assets/testimonial-3.mp4', name: 'Isha', age: 15, location: 'Delhi' }
];

interface VideoPlayerProps {
  videoUrl: string;
  name: string;
  age?: number;
  location: string;
}

export function VideoPlayer({ videoUrl, name, age, location }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    // Reset play state when URL changes, but do not autoplay
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [videoUrl]);

  const togglePlay = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e && 'stopPropagation' in e) e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error(err);
          }
          setIsPlaying(false);
        });
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const formatTime = (secs: number) =>
    `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;

  const fullUrl = getImageUrl(videoUrl);
  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="relative w-full aspect-[9/16] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 bg-slate-950 group"
      role="region"
      aria-label={`Testimonial video by ${name}${age ? `, age ${age}` : ''}, from ${location}`}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={fullUrl}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        playsInline
        muted={isMuted}
        onCanPlay={() => setIsReady(true)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
      />

      {/* Click-to-play hit area — below controls overlay (z-10) */}
      <div
        role="button"
        tabIndex={0}
        aria-label={isPlaying ? 'Pause video' : 'Play video'}
        onClick={(e) => togglePlay(e)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            togglePlay(e as unknown as React.KeyboardEvent);
          }
        }}
        className="absolute inset-0 cursor-pointer z-10"
        suppressHydrationWarning
      />

      {/* Loading Spinner */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-20" aria-live="polite" aria-label="Loading video">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      )}

      {/* Centre Play/Pause (hover ghost button) */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={togglePlay}
          className="w-16 h-16 bg-white/25 hover:bg-white/35 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-95 border border-white/15 pointer-events-auto cursor-pointer shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          tabIndex={-1}
          suppressHydrationWarning
        >
          {isPlaying ? <Pause size={28} className="fill-white" /> : <Play size={28} className="fill-white translate-x-0.5" />}
        </button>
      </div>

      {/* Bottom Controls Overlay — z-30 so it sits ABOVE the click-to-play div */}
      <div
        className="absolute inset-x-0 bottom-0 z-30 px-4 pb-5 pt-12 bg-gradient-to-t from-black/90 via-black/55 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Seek / Progress Bar ── */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.05}
          value={currentTime}
          onChange={(e) => {
            const t = parseFloat(e.target.value);
            if (videoRef.current) videoRef.current.currentTime = t;
            setCurrentTime(t);
          }}
          aria-label="Seek video"
          aria-valuemin={0}
          aria-valuemax={Math.floor(duration)}
          aria-valuenow={Math.floor(currentTime)}
          aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
          className="rv-seeker w-full cursor-pointer"
          style={{ '--rv-progress': `${progressPct}%` } as React.CSSProperties}
          suppressHydrationWarning
        />

        {/* ── Buttons + Time + Badge ── */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="w-9 h-9 bg-white/20 hover:bg-white/35 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 border border-white/15 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
              suppressHydrationWarning
            >
              {isPlaying
                ? <Pause size={14} className="fill-white" />
                : <Play size={14} className="fill-white translate-x-0.5" />}
            </button>

            {/* Mute / Unmute */}
            <button
              onClick={toggleMute}
              className="w-9 h-9 bg-white/20 hover:bg-white/35 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 border border-white/15 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              aria-pressed={!isMuted}
              suppressHydrationWarning
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            {/* Time */}
            <span
              className="text-white/70 text-[10px] font-mono tabular-nums select-none leading-none"
              aria-live="off"
              aria-label={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            >
              {formatTime(currentTime)}&nbsp;/&nbsp;{formatTime(duration)}
            </span>
          </div>

          {/* Badge */}
          <div
            className="shrink-0 text-white/80 text-[10px] font-bold bg-black/50 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md"
            aria-hidden="true"
          >
            Testimonial
          </div>
        </div>
      </div>

      {/* Scoped styles for the range input — cross-browser thumb + track */}
      <style>{`
        .rv-seeker {
          -webkit-appearance: none;
          appearance: none;
          height: 20px;
          background: transparent;
          outline: none;
          display: block;
        }
        .rv-seeker::-webkit-slider-runnable-track {
          height: 4px;
          border-radius: 9999px;
          background: linear-gradient(
            to right,
            hsl(262 83% 68%) var(--rv-progress, 0%),
            rgba(255,255,255,0.3) var(--rv-progress, 0%)
          );
        }
        .rv-seeker::-moz-range-track {
          height: 4px;
          border-radius: 9999px;
          background: rgba(255,255,255,0.3);
        }
        .rv-seeker::-moz-range-progress {
          height: 4px;
          border-radius: 9999px;
          background: hsl(262 83% 68%);
        }
        .rv-seeker::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          margin-top: -5px;
          border-radius: 50%;
          background: #ffffff;
          border: 2.5px solid hsl(262 83% 68%);
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .rv-seeker:hover::-webkit-slider-thumb,
        .rv-seeker:focus::-webkit-slider-thumb {
          transform: scale(1.4);
          box-shadow: 0 0 0 4px rgba(147,51,234,0.35), 0 2px 8px rgba(0,0,0,0.6);
        }
        .rv-seeker::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ffffff;
          border: 2.5px solid hsl(262 83% 68%);
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .rv-seeker:hover::-moz-range-thumb,
        .rv-seeker:focus::-moz-range-thumb {
          transform: scale(1.4);
          box-shadow: 0 0 0 4px rgba(147,51,234,0.35), 0 2px 8px rgba(0,0,0,0.6);
        }
        .rv-seeker:focus-visible {
          outline: 2px solid hsl(262 83% 68%);
          outline-offset: 3px;
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
}

export function ReaderVoices() {
  return (
    <section className="py-24 bg-[#02003a] relative overflow-hidden">
      {/* Background Graphic Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft Vibrant Blurs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-400/20 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4" />

        {/* Subtle Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />

        {/* Floating Soft Shapes */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              repeat: Infinity,
              duration: 7 + i,
              ease: "easeInOut",
              delay: i * 0.8
            }}
            className="absolute w-32 h-32 bg-white/10 rounded-full blur-2xl"
            style={{
              top: `${15 + i * 20}%`,
              left: `${10 + (i * 25) % 80}%`,
            }}
          />
        ))}
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-heading mb-4 tracking-tight text-white uppercase tracking-[0.1em]"
          >
            Reader Voices
          </motion.h2>
          {/* Glowing Underline */}
          <div className="w-24 h-1.5 bg-primary rounded-full mx-auto shadow-[0_0_15px_rgba(147,51,234,0.6)]" />
        </div>

        {/* 3-Column Portrait Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {TESTIMONIALS.map((t) => (
            <div key={t.videoUrl} className="w-full max-w-[320px] mx-auto">
              <VideoPlayer
                videoUrl={t.videoUrl}
                name={t.name}
                age={t.age}
                location={t.location}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

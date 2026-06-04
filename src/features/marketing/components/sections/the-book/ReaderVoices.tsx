'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';

const TESTIMONIALS = [
  { videoId: 'ScMzIvxBSi4', name: 'Sneha', age: 14, location: 'Pune' },
  { videoId: '95a2NLIk9mU', name: 'Zoya', age: 12, location: 'Mumbai' },
  { videoId: 'KeZ-b48_Nog', name: 'Isha', age: 15, location: 'Delhi' }
];

interface YouTubePlayerProps {
  videoId: string;
  name: string;
  age?: number;
  location: string;
}

export function YouTubePlayer({ videoId, name, age, location }: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const containerId = `yt-player-${videoId}`;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if the script is already loaded
    const windowAny = window as any;
    if (!windowAny.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Set up callback
    const previousCallback = windowAny.onYouTubeIframeAPIReady;
    windowAny.onYouTubeIframeAPIReady = () => {
      if (previousCallback) previousCallback();
      initPlayer();
    };

    // If script is already loaded and YT is available
    if (windowAny.YT && windowAny.YT.Player) {
      initPlayer();
    }

    function initPlayer() {
      const wAny = window as any;
      if (playerRef.current || !wAny.YT || !wAny.YT.Player) return;

      playerRef.current = new wAny.YT.Player(containerId, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          rel: 0,
          showinfo: 0,
          loop: 1,
          playlist: videoId,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true);
            setIsMuted(true);
            event.target.playVideo();
            setIsPlaying(true);
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.PLAYING = 1, YT.PlayerState.PAUSED = 2
            if (event.data === 1) {
              setIsPlaying(true);
            } else if (event.data === 2) {
              setIsPlaying(false);
            }
          },
        },
      });
    }

    return () => {
      // Clean up player on unmount
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, containerId]);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!playerRef.current || !isReady) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!playerRef.current || !isReady) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  return (
    <div className="relative w-full aspect-[9/16] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 bg-slate-950 group">
      {/* YouTube Player Target - Cropped to Portrait Aspect Ratio */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 aspect-video h-full [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:w-full [&>iframe]:h-full">
          <div id={containerId} className="w-full h-full" />
        </div>
      </div>

      {/* Click to play/pause hit area */}
      <div onClick={() => togglePlay()} className="absolute inset-0 cursor-pointer z-10" />

      {/* User Info Tag Overlay */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3 bg-black/45 border border-white/10 backdrop-blur-md py-2.5 px-4 rounded-full shadow-lg">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-xs font-black shadow-inner animate-pulse">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-white font-extrabold text-xs leading-none">{name}{age ? `, ${age}` : ''}</p>
          <p className="text-[9px] text-white/70 font-semibold tracking-wider mt-0.5 uppercase leading-none">{location}</p>
        </div>
      </div>

      {/* Loading Spinner */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-10">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      )}

      {/* Center Media Control (Play/Pause on hover) */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={togglePlay}
          className="w-16 h-16 bg-white/25 hover:bg-white/35 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-95 border border-white/15 pointer-events-auto cursor-pointer shadow-lg animate-fade-in"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={28} className="fill-white" /> : <Play size={28} className="fill-white translate-x-0.5" />}
        </button>
      </div>

      {/* Bottom Controls Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-95 border border-white/10 cursor-pointer"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={16} className="fill-white" /> : <Play size={16} className="fill-white translate-x-0.5" />}
          </button>

          <button
            onClick={toggleMute}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-95 border border-white/10 cursor-pointer"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        <div className="text-white/80 text-xs font-bold bg-black/40 px-3.5 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
          Testimonial
        </div>
      </div>
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
            <div key={t.videoId} className="w-full max-w-[320px] mx-auto">
              <YouTubePlayer
                videoId={t.videoId}
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

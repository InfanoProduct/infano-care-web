"use client";

import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
// @ts-ignore
import "videojs-contrib-quality-levels";
// @ts-ignore
import "videojs-hls-quality-selector";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
}

/**
 * Strip query params/hash and detect MIME type from the clean URL path.
 * This fixes MEDIA_ERR_SRC_NOT_SUPPORTED for signed cloud URLs that have
 * query parameters after the extension (e.g. ?token=xxx&expires=yyy).
 */
function getMimeType(src: string): string {
  try {
    const cleanPath = new URL(src, "http://x").pathname.toLowerCase();
    if (cleanPath.endsWith(".m3u8")) return "application/x-mpegURL";
    if (cleanPath.endsWith(".mpd"))  return "application/dash+xml";
    if (cleanPath.endsWith(".webm")) return "video/webm";
    if (cleanPath.endsWith(".ogv"))  return "video/ogg";
    if (cleanPath.endsWith(".mp4"))  return "video/mp4";
  } catch {
    // URL parsing failed — fall through to string checks
  }
  // Fallback: check the raw URL string for known patterns
  if (src.includes(".m3u8")) return "application/x-mpegURL";
  if (src.includes(".mpd"))  return "application/dash+xml";
  // Safest generic fallback
  return "video/mp4";
}

export function VideoPlayer({ src, poster, autoPlay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!src) return;

    const type = getMimeType(src);

    if (!playerRef.current && videoRef.current) {
      // First mount — create the player
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(
        videoElement,
        {
          autoplay: autoPlay,
          controls: true,
          responsive: true,
          fill: true,
          poster: poster,
          html5: {
            vhs: {
              overrideNative: true,
              withCredentials: false,
            },
            nativeVideoTracks: false,
            nativeAudioTracks: false,
            nativeTextTracks: false,
          },
          playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
          sources: [{ src, type }],
        },
        () => {
          videojs.log("player is ready");
          if ((player as any).hlsQualitySelector) {
            (player as any).hlsQualitySelector({ displayCurrentQuality: true });
          }
        }
      ));
    } else if (playerRef.current) {
      // Source changed — update without re-creating the player
      const player = playerRef.current;
      player.autoplay(autoPlay);
      player.src([{ src, type }]);
      if (poster) player.poster(poster);
    }
  }, [src, poster, autoPlay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const player = playerRef.current;
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full bg-black">
      <div data-vjs-player className="w-full h-full">
        <div ref={videoRef} className="w-full h-full" />
      </div>
    </div>
  );
}

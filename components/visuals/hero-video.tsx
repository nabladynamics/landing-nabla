"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

const PLAYBACK_RATE = 0.5;

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRequested, setPlaybackRequested] = useState<boolean | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let onScreen = false;

    const syncPlayback = () => {
      video.defaultPlaybackRate = PLAYBACK_RATE;
      video.playbackRate = PLAYBACK_RATE;

      const shouldPlay = playbackRequested ?? !motion.matches;
      if (shouldPlay && onScreen && !document.hidden) {
        // Muted autoplay can still be blocked by a browser or power-saving mode.
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.05 },
    );

    observer.observe(video);
    video.addEventListener("loadedmetadata", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    motion.addEventListener("change", syncPlayback);

    return () => {
      observer.disconnect();
      video.removeEventListener("loadedmetadata", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      motion.removeEventListener("change", syncPlayback);
      video.pause();
    };
  }, [playbackRequested]);

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* The extra width crops the source's right edge at every aspect ratio,
            keeping the corner logo outside the visible area, including the poster. */}
        <video
          ref={videoRef}
          className="absolute inset-y-0 left-0 h-full w-[115%] max-w-none object-cover object-center"
          src="/videos/meshing-video.mp4"
          poster="/videos/meshing-poster.jpg"
          muted
          loop
          playsInline
          preload="none"
          tabIndex={-1}
          onPlaying={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setHasError(true)}
        />
        <div className="absolute inset-0 bg-void/35" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,13,0.88)_0%,rgba(5,7,13,0.65)_38%,rgba(5,7,13,0.12)_75%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,13,0.8)_0%,transparent_24%,transparent_65%,#05070d_100%)]" />
      </div>

      {!hasError && (
        <button
          type="button"
          onClick={() => setPlaybackRequested(!isPlaying)}
          aria-label={isPlaying ? "Pause background video" : "Play background video"}
          className="absolute bottom-8 right-6 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-void/50 text-frost backdrop-blur-sm transition-colors hover:border-white/50 hover:bg-void/80 sm:right-8"
        >
          {isPlaying ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
        </button>
      )}
    </>
  );
}

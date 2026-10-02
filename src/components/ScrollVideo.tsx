import React, { useRef, useEffect, useState, useCallback } from 'react';

export interface VideoChapter {
  id: string;
  src: string;
  poster?: string;
  label?: string;
}

export interface ScrollVideoProps {
  src?: string;
  poster?: string;
  videos?: VideoChapter[];
  scrollHeight?: string; // e.g. "800vh" for multi-chapter sequence
  className?: string;
  children?: React.ReactNode | ((progress: number, activeIndex: number, localProgress: number) => React.ReactNode);
  onProgress?: (progress: number, activeIndex: number, localProgress: number) => void;
  onComplete?: () => void;
}

export default function ScrollVideo({
  src,
  poster,
  videos,
  scrollHeight = '400vh',
  className = '',
  children,
  onProgress,
  onComplete,
}: ScrollVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize chapters array
  const chapters: VideoChapter[] = React.useMemo(() => {
    if (videos && videos.length > 0) return videos;
    if (src) return [{ id: 'video-0', src, poster }];
    return [];
  }, [videos, src, poster]);

  const numChapters = chapters.length;
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  // High-performance scroll tracking refs (NO re-renders on scroll)
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const currentActiveIndexRef = useRef(0);
  const currentLocalProgressRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const isUpdatingRef = useRef(false);
  const hasCompletedRef = useRef(false);

  // Synchronize active video currentTime to scroll progress
  const syncFrame = useCallback(() => {
    if (numChapters === 0) return;

    // Smooth lerp to eliminate jitter and produce cinematic fluid scrub
    const diff = targetProgressRef.current - currentProgressRef.current;
    if (Math.abs(diff) > 0.0005) {
      currentProgressRef.current += diff * 0.35;
    } else {
      currentProgressRef.current = targetProgressRef.current;
    }

    const P = Math.min(Math.max(currentProgressRef.current, 0), 1);
    const rawIndex = P * numChapters;
    const activeIndex = Math.min(Math.floor(rawIndex), numChapters - 1);
    const localProgress = Math.min(Math.max(rawIndex - activeIndex, 0), 1);

    currentActiveIndexRef.current = activeIndex;
    currentLocalProgressRef.current = localProgress;

    // Direct, unblocked currentTime update on active video with seek-guard
    const activeVideo = videoRefs.current[activeIndex];
    if (activeVideo && !activeVideo.seeking) {
      const dur = activeVideo.duration;
      if (dur && !isNaN(dur) && dur > 0) {
        const targetTime = Math.min(Math.max(localProgress * dur, 0), dur);
        if (Math.abs(activeVideo.currentTime - targetTime) > 0.02) {
          activeVideo.currentTime = targetTime;
        }
      }
    }

    // Set boundary frames for inactive videos
    for (let i = 0; i < numChapters; i++) {
      const v = videoRefs.current[i];
      if (!v || v.seeking) continue;
      if (i < activeIndex) {
        if (v.duration && !isNaN(v.duration) && Math.abs(v.currentTime - v.duration) > 0.05) {
          v.currentTime = v.duration;
        }
      } else if (i > activeIndex) {
        if (v.currentTime > 0.05) {
          v.currentTime = 0;
        }
      }
    }

    // Preload next chapter video dynamically
    if (activeIndex + 1 < numChapters) {
      const nextVideo = videoRefs.current[activeIndex + 1];
      if (nextVideo && nextVideo.preload !== 'auto') {
        nextVideo.preload = 'auto';
      }
    }

    // Notify callback
    if (onProgress) {
      onProgress(P, activeIndex, localProgress);
    }

    // Switch active chapter state if changed
    setActiveChapterIndex((prev) => (prev !== activeIndex ? activeIndex : prev));

    // Check completion
    if (P >= 0.99 && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      if (onComplete) onComplete();
    } else if (P < 0.97) {
      hasCompletedRef.current = false;
    }

    // Keep RAF loop running until caught up
    if (Math.abs(diff) > 0.0005) {
      rafIdRef.current = requestAnimationFrame(syncFrame);
    } else {
      isUpdatingRef.current = false;
    }
  }, [numChapters, onProgress, onComplete]);

  const requestSync = useCallback(() => {
    if (!isUpdatingRef.current) {
      isUpdatingRef.current = true;
      rafIdRef.current = requestAnimationFrame(syncFrame);
    }
  }, [syncFrame]);

  // Track container scroll position
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const totalScrollable = rect.height - window.innerHeight;
    if (totalScrollable <= 0) return;

    const scrolled = -rect.top;
    const progress = Math.min(Math.max(scrolled / totalScrollable, 0), 1);

    targetProgressRef.current = progress;
    requestSync();
  }, [requestSync]);

  // Initialize and prime all video elements on mount
  useEffect(() => {
    chapters.forEach((_, idx) => {
      const video = videoRefs.current[idx];
      if (video) {
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        // Only preload active and next chapter
        video.preload = idx <= 1 ? 'auto' : 'metadata';
        if (idx === 0 && video.readyState < 1) {
          video.load();
        }
      }
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [chapters, handleScroll]);

  return (
    <div
      ref={containerRef}
      style={{ height: scrollHeight }}
      className={`relative w-full ${className}`}
    >
      {/* Pinned Fullscreen Presentation */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-black flex items-center justify-center select-none">
        {/* Render Video Chapters */}
        {chapters.map((ch, idx) => {
          const isActive = idx === activeChapterIndex;

          return (
            <div
              key={ch.id || idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-200 pointer-events-none ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <video
                ref={(el) => {
                  videoRefs.current[idx] = el;
                }}
                src={ch.src}
                poster={ch.poster}
                playsInline
                muted
                preload="auto"
                onLoadedMetadata={() => requestSync()}
                onCanPlay={() => requestSync()}
                className="w-full h-full object-cover pointer-events-none select-none"
                style={{ willChange: 'contents' }}
              />
            </div>
          );
        })}

        {/* Overlays / Children */}
        {typeof children === 'function'
          ? children(targetProgressRef.current, currentActiveIndexRef.current, currentLocalProgressRef.current)
          : children}
      </div>
    </div>
  );
}

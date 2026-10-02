import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Sparkles,
  Heart,
} from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

interface FinalVideoProps {
  onReplayStory?: () => void;
}

/**
 * Entrance phases:
 *   'flash'     — White overlay dissolves out (carried over from MoonInteraction flash)
 *   'darkness'  — Brief moment of total darkness
 *   'text'      — "and i smile when i think of all the times we had"
 *   'reveal'    — Video fades in and begins playback
 *   'playing'   — Video is playing, normal player mode
 */
type EntrancePhase = 'flash' | 'darkness' | 'text' | 'reveal' | 'playing';

export default function FinalVideo({ onReplayStory }: FinalVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cinematic entrance state
  const [entrancePhase, setEntrancePhase] = useState<EntrancePhase>('flash');

  // Video playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const videoSource = siteConfig.finalVideo?.src || '/videos/final-video.mp4';

  /* ──────────────────────────────────────────────────────── */
  /* Cinematic Entrance Sequence                             */
  /* flash → darkness → text → reveal → playing             */
  /* ──────────────────────────────────────────────────────── */
  useEffect(() => {
    // Phase 1: White flash dissolves out (1.2s)
    const t1 = setTimeout(() => {
      setEntrancePhase('darkness');
    }, 200);

    // Phase 2: Sit in darkness briefly (0.8s of pure dark)
    const t2 = setTimeout(() => {
      setEntrancePhase('text');
    }, 1200);

    // Phase 3: Text holds for ~3.5 seconds, then begins fading
    const t3 = setTimeout(() => {
      setEntrancePhase('reveal');
    }, 5200);

    // Phase 4: Video has faded in (1.5s transition), now fully playing
    const t4 = setTimeout(() => {
      setEntrancePhase('playing');
    }, 6800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  /* ──────────────────────────────────────────────────────── */
  /* Start video playback when reveal phase begins           */
  /* ──────────────────────────────────────────────────────── */
  useEffect(() => {
    if (entrancePhase !== 'reveal') return;

    const v = videoRef.current;
    if (!v) return;

    // Reset to beginning
    v.currentTime = 0;
    // Volume is always 1 at initial playback; subsequent changes go through handleVolumeChange
    v.volume = 1;

    const playPromise = v.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Autoplay blocked with audio — try muted
          v.muted = true;
          setIsMuted(true);
          v.play()
            .then(() => {
              setIsPlaying(true);
              setNeedsUserInteraction(true);
            })
            .catch(() => {
              setIsPlaying(false);
              setNeedsUserInteraction(true);
            });
        });
    }
  }, [entrancePhase]);

  /* ──────────────────────────────────────────────────────── */
  /* Auto-hide controls after inactivity                     */
  /* ──────────────────────────────────────────────────────── */
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isEnded) {
        setShowControls(false);
      }
    }, 2800);
  }, [isPlaying, isEnded]);

  useEffect(() => {
    const timeoutId = controlsTimeoutRef.current;
    resetControlsTimeout();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimeout]);

  /* ──────────────────────────────────────────────────────── */
  /* Fullscreen change listener                              */
  /* ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  /* ──────────────────────────────────────────────────────── */
  /* Cleanup: pause video on unmount                         */
  /* ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const v = videoRef.current;
    return () => {
      if (v) {
        v.pause();
        v.currentTime = 0;
      }
    };
  }, []);

  /* ──────────────────────────────────────────────────────── */
  /* Video event handlers                                    */
  /* ──────────────────────────────────────────────────────── */
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setIsEnded(true);
    setShowControls(true);
  };

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.pause();
      setIsPlaying(false);
    } else {
      v.play()
        .then(() => {
          setIsPlaying(true);
          setIsEnded(false);
        })
        .catch(() => {
          setVideoError(true);
        });
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const newMuted = !isMuted;
    v.muted = newMuted;
    setIsMuted(newMuted);
    setNeedsUserInteraction(false);
  }, [isMuted]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    setVolume(val);
    v.muted = val === 0;
    setIsMuted(val === 0);
    setNeedsUserInteraction(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = val;
    setCurrentTime(val);
  };

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore fullscreen rejection
    }
  }, []);

  /* ──────────────────────────────────────────────────────── */
  /* Keyboard accessibility                                  */
  /* ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      // Only handle keyboard controls once the video is actually showing
      if (entrancePhase !== 'reveal' && entrancePhase !== 'playing') return;
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen, entrancePhase]);

  const restartVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play();
    setIsEnded(false);
    setIsPlaying(true);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Are we still in the entrance sequence (before or during text)?
  const isPreVideo = entrancePhase === 'flash' || entrancePhase === 'darkness' || entrancePhase === 'text';
  // Should the video be visible?
  const videoVisible = entrancePhase === 'reveal' || entrancePhase === 'playing';

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
      className="fixed inset-0 w-full h-full bg-black z-50 flex items-center justify-center overflow-hidden select-none"
    >
      {/* ──────────────────────────────────────────────────────── */}
      {/* Phase 1: White Flash Dissolve (from MoonInteraction)    */}
      {/* ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {entrancePhase === 'flash' && (
          <motion.div
            key="entrance-white-flash"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-0 z-[60] bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────── */}
      {/* Phase 3: Emotional Text                                 */}
      {/* "and i smile when i think of all the times we had"     */}
      {/* ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {entrancePhase === 'text' && (
          <motion.div
            key="emotional-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(8px)' }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-[55] flex flex-col items-center justify-center p-8 text-center pointer-events-none select-none"
          >
            <div className="space-y-5 max-w-xl">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 1.0 }}
                className="text-amber-200/50 text-xl block"
              >
                ✦
              </motion.span>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                className="font-handwritten text-3xl sm:text-5xl text-cream/95 leading-relaxed drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
              >
                "and i smile when i think of all the times we had"
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1.0 }}
                className="text-[10px] tracking-[0.4em] uppercase font-mono text-rose-200/40"
              >
                {siteConfig.herName}'s story
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────── */}
      {/* HTML5 Video Player                                      */}
      {/* Hidden during entrance, fades in during 'reveal'        */}
      {/* ──────────────────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: videoVisible ? 1 : 0 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      >
        <video
          ref={videoRef}
          src={videoSource}
          className="w-full h-full cursor-pointer"
          style={{ objectFit: 'contain' }}
          playsInline
          preload="metadata"
          onClick={videoVisible ? togglePlay : undefined}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={() => setVideoError(true)}
        />
      </motion.div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* Video load error fallback                               */}
      {/* ──────────────────────────────────────────────────────── */}
      {videoError && !isPreVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white p-6 text-center z-20">
          <Heart className="w-12 h-12 text-rose-400 mb-3 animate-pulse" />
          <h2 className="font-display text-2xl mb-2">Our Birthday Video</h2>
          <p className="font-handwritten text-rose-200/80 text-lg max-w-md mb-4">
            Place your final video file at:
          </p>
          <code className="px-3 py-1.5 rounded bg-white/10 text-xs font-mono text-amber-200 mb-6">
            public/videos/final-video.mp4
          </code>
          <button
            onClick={() => {
              setVideoError(false);
              videoRef.current?.load();
            }}
            className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs tracking-wider uppercase transition-colors cursor-pointer"
          >
            Retry Loading Video ↺
          </button>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* Initial "Happy Birthday" Floating Overlay                */}
      {/* Shows briefly once the video is playing, then vanishes  */}
      {/* ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {entrancePhase === 'playing' && !isEnded && currentTime < 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30 p-6 text-center"
          >
            <div className="space-y-3 drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-[11px] tracking-[0.3em] uppercase text-rose-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                <span>{siteConfig.finalVideo?.badge || 'FOR THE BIRTHDAY GIRL'}</span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-semibold text-white tracking-tight leading-tight">
                Happy Birthday,
                <br />
                <span className="font-handwritten text-5xl sm:text-7xl md:text-8xl text-rose-300 font-normal">
                  {siteConfig.herName} ❤️
                </span>
              </h1>

              <p className="font-handwritten text-xl sm:text-2xl text-cream/80 max-w-lg mx-auto">
                {siteConfig.finalVideo?.subtitle || "Our story continues with you..."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────── */}
      {/* Unmute Prompt (if autoplay started muted)               */}
      {/* ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {needsUserInteraction && isMuted && !isEnded && videoVisible && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={toggleMute}
            className="absolute top-8 right-8 z-40 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white text-xs tracking-wider uppercase font-medium shadow-2xl transition-all cursor-pointer"
          >
            <VolumeX className="w-4 h-4 text-amber-300" />
            <span>Tap to unmute sound ✦</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────── */}
      {/* Minimalist Floating Controls                            */}
      {/* ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showControls && !isEnded && videoVisible && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute bottom-6 sm:bottom-10 inset-x-4 sm:inset-x-auto sm:w-[620px] max-w-full sm:left-1/2 sm:-translate-x-1/2 z-40 px-5 py-3.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 shadow-[0_15px_50px_rgba(0,0,0,0.8)] flex flex-col gap-2"
          >
            {/* Scrubber Progress Bar */}
            <div className="flex items-center gap-3 w-full">
              <span className="text-[11px] font-mono text-white/60 min-w-[36px]">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-rose-400 focus:outline-none"
              />
              <span className="text-[11px] font-mono text-white/40 min-w-[36px]">
                {formatTime(duration)}
              </span>
            </div>

            {/* Bottom Row Controls */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-4">
                {/* Play / Pause Button */}
                <button
                  onClick={togglePlay}
                  className="p-1.5 text-white/90 hover:text-white transition-colors cursor-pointer"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
                </button>

                {/* Volume & Mute */}
                <div className="flex items-center gap-2 group/vol">
                  <button
                    onClick={toggleMute}
                    className="p-1.5 text-white/80 hover:text-white transition-colors cursor-pointer"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 sm:w-20 h-1 bg-white/20 rounded appearance-none cursor-pointer accent-rose-400"
                    aria-label="Volume"
                  />
                </div>
              </div>

              {/* Right Side: Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 text-white/80 hover:text-white transition-colors cursor-pointer"
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────── */}
      {/* FINAL CONCLUSION OVERLAY (When Video Ends)              */}
      {/* ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isEnded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6 max-w-lg mx-auto"
            >
              <div className="w-14 h-14 rounded-full bg-rose-500/15 border border-rose-400/30 flex items-center justify-center mx-auto text-rose-300 shadow-[0_0_30px_rgba(217,108,139,0.3)]">
                <Heart className="w-7 h-7 text-rose-400" />
              </div>

              <div className="space-y-2">
                <h2 className="font-display text-3xl sm:text-5xl text-white font-normal">
                  Happy Birthday,
                </h2>
                <p className="font-handwritten text-4xl sm:text-5xl text-rose-300">
                  {siteConfig.herName} ❤️
                </p>
              </div>

              <p className="font-handwritten text-xl sm:text-2xl text-cream/90 leading-relaxed px-4">
                "{siteConfig.finalMessage}"
              </p>

              <p className="font-handwritten text-lg sm:text-xl text-rose-200/70 italic">
                {siteConfig.finalSubMessage}
              </p>

              <div className="pt-2">
                <p className="text-white/40 text-xs tracking-widest uppercase font-mono">
                  With all my love,
                </p>
                <p className="font-handwritten text-2xl text-rose-300 mt-1">
                  {siteConfig.yourName}
                </p>
              </div>

              {/* Gentle Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">

                <button
                  onClick={restartVideo}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs tracking-wider uppercase font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Replay Video</span>
                </button>

                {onReplayStory && (
                  <button
                    onClick={onReplayStory}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white/70 hover:text-white text-xs tracking-wider uppercase font-medium transition-all cursor-pointer"
                  >
                    <span>Replay Our Story ✦</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Mouse, ArrowRight } from 'lucide-react';
import ScrollVideo, { type VideoChapter } from './ScrollVideo';
import { siteConfig } from '../config/siteConfig';
import { audioManager } from '../utils/audioManager';

interface CinematicWorldProps {
  onNext?: () => void;
}

const NYC_CHAPTERS: (VideoChapter & {
  badge: string;
  title: string;
  subtitle: string;
  quote: string;
})[] = [
  {
    id: 'nyc-reveal',
    src: '/videos/world-reveal.mp4',
    poster: '/videos/world-reveal-poster.jpg',
    badge: siteConfig.nyc?.badge || 'SCENE 01 • NEW YORK CITY • GOLDEN HOUR',
    title: siteConfig.nyc?.title || 'The City of Eight Million',
    subtitle: siteConfig.nyc?.subtitle || 'Late Afternoon in Central Park',
    quote: "Out of eight million people in this city, you're the only one I ever look for.",
  },
];

export default function CinematicWorld({ onNext }: CinematicWorldProps) {
  const [introPhase, setIntroPhase] = useState<'darkness' | 'softLight' | 'revealed'>('darkness');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    audioManager.transitionToStage('nyc');
    const t1 = setTimeout(() => setIntroPhase('softLight'), 350);
    const t2 = setTimeout(() => setIntroPhase('revealed'), 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const lastUpdateRef = useRef(0);
  const handleScrollProgress = (P: number) => {
    const last = lastUpdateRef.current;
    if (Math.abs(P - last) > 0.006 || P === 0 || P >= 0.99) {
      lastUpdateRef.current = P;
    }
  };

  const chapterData = NYC_CHAPTERS[0];

  return (
    <div className="relative w-full bg-black text-white select-none">
      {/* 1. INITIAL SOFT LIGHT ENTRANCE TRANSITION */}
      <AnimatePresence>
        {introPhase !== 'revealed' && (
          <motion.div
            key="intro-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-black"
          >
            {introPhase === 'softLight' && (
              <motion.div
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: [0.2, 1.8, 2.5], opacity: [0, 0.9, 0] }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="w-96 h-96 rounded-full bg-gradient-to-r from-amber-200 via-rose-300 to-amber-100 blur-3xl"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. CONTINUOUS SCROLL VIDEO SEQUENCE (NYC Central Park Reveal) */}
      <ScrollVideo
        videos={NYC_CHAPTERS}
        scrollHeight="220vh"
        onProgress={handleScrollProgress}
      >
        {/* 3. CINEMATIC OVERLAY & STORY TEXT */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 sm:p-10 z-20">
          {/* Subtle cinematic vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                linear-gradient(180deg, rgba(8,5,15,0.7) 0%, transparent 25%, transparent 70%, rgba(8,5,15,0.85) 100%),
                radial-gradient(ellipse at center, transparent 40%, rgba(5,3,10,0.6) 100%)
              `,
            }}
          />

          {/* Top Bar: Scene Metadata & Postcard */}
          <header className="relative z-30 flex flex-wrap justify-between items-start gap-4 w-full">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] sm:text-xs tracking-[0.25em] text-rose-200 uppercase font-medium">
                <Compass className="w-3.5 h-3.5 text-amber-300" />
                <span>{chapterData.badge}</span>
              </div>
              {/* Subtle NYC Postcard Note */}
              <div className="inline-block transform -rotate-1 px-3 py-1 rounded bg-amber-100/10 backdrop-blur-md border border-amber-200/20 shadow-md">
                <p className="font-handwritten text-xs sm:text-sm text-amber-200/90 tracking-wide">
                  "oh to be young and in nyc"
                </p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <p className="font-handwritten text-lg sm:text-xl text-rose-200/90 drop-shadow">
                For {siteConfig.herName} ❤️
              </p>
              {/* Cassette easter egg */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-mono text-rose-300/80">
                <span>♫</span>
                <span>cardigan</span>
              </div>
            </div>
          </header>

          {/* Environmental stickers / sticky notes on sides (tasteful and subtle) */}
          <div className="relative z-25 pointer-events-none hidden md:flex justify-between items-center w-full px-2">
            {/* Left side subtle notes */}
            <div className="space-y-4 max-w-[200px]">
              <div className="transform -rotate-2 p-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 shadow-lg pointer-events-auto">
                <p className="text-[10px] font-mono text-amber-300/80 uppercase tracking-wider mb-0.5">Note</p>
                <p className="font-handwritten text-xs text-rose-200/90 leading-tight">
                  "people with glasses are hot"
                </p>
              </div>

              <div className="transform rotate-1 p-2 rounded-xl bg-black/30 backdrop-blur-md border border-white/5 pointer-events-auto">
                <p className="font-handwritten text-xs text-cream/70">
                  "low iron, high lore"
                </p>
              </div>
            </div>

            {/* Right side subtle street art sticker */}
            <div className="space-y-3 max-w-[200px] text-right">
              <div className="transform rotate-2 p-2.5 rounded-xl bg-gradient-to-r from-rose-950/40 to-black/50 backdrop-blur-md border border-rose-500/20 shadow-lg pointer-events-auto">
                <p className="font-mono text-[9px] text-rose-400/80 tracking-widest uppercase mb-0.5">Central Park graffiti</p>
                <p className="font-handwritten text-xs text-rose-200/95 font-medium leading-tight">
                  "be petrol and set the shit on fire"
                </p>
              </div>
            </div>
          </div>

          {/* Center Dynamic Story Card */}
          <div className="relative z-30 max-w-xl mx-auto text-center px-4 my-auto">
            <div className="space-y-3 bg-black/35 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
              <span className="text-[11px] tracking-[0.3em] uppercase text-amber-300/80 font-medium block">
                {chapterData.subtitle}
              </span>
              <h1 className="font-display text-3xl sm:text-5xl text-cream font-normal tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
                {chapterData.title}
              </h1>
              <p className="font-handwritten text-xl sm:text-2xl text-rose-200 drop-shadow">
                "{chapterData.quote}"
              </p>

              <p className="font-handwritten text-sm text-white/50 italic pt-1">
                what a weird year... but we made it here.
              </p>

              {/* Advance CTA Button */}
              {onNext && (
                <div className="pt-4 pointer-events-auto">
                  <button
                    onClick={onNext}
                    className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white font-medium text-sm tracking-wide shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                  >
                    <span>{siteConfig.nyc.buttonText || 'Watch the Sunset Together →'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar: Scroll Direction Hint & Walking Dog */}
          <footer className="relative z-30 flex flex-col items-center gap-2">
            {/* Friendly walking pup in Central Park */}
            <motion.div
              animate={{ x: [-40, 40, -40] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center gap-1.5 opacity-60 text-[11px] text-amber-200/70 font-mono tracking-wider"
              title="A dog walking along the Central Park path"
            >
              <svg width="18" height="14" viewBox="0 0 24 18" fill="none" className="text-amber-200/70">
                <path
                  d="M3 13L4 10C4 9 5 8 7 8H12L15 4H18L17 7L19 9L21 8.5L20 10.5L18 11L17 14L16 16L14 16L15 13H8L7 16H5L6 13H3Z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-[10px] text-white/40">central park stroll</span>
            </motion.div>

            <div className="flex items-center gap-2 text-xs text-rose-200/70 font-medium tracking-wide bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/5">
              <Mouse className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
              <span>Scroll down to explore • or continue to sunset above</span>
            </div>
          </footer>
        </div>
      </ScrollVideo>
    </div>
  );
}

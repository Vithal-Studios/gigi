import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { sunsetConfig, type SunsetMilestone } from '../config/sunsetConfig';

interface SunsetTextProps {
  progress: number;
  onNext?: () => void;
}

export const SunsetText: React.FC<SunsetTextProps> = ({ progress, onNext }) => {
  // Find matching milestone based on progress
  const currentMilestone: SunsetMilestone | undefined = sunsetConfig.milestones.find(
    (m) => progress >= m.start && progress < m.end
  ) || (progress >= 0.9 ? sunsetConfig.milestones[sunsetConfig.milestones.length - 1] : undefined);

  const isFinalState = progress >= 0.90;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* ─── Top Header Badge ─── */}
      <header className="w-full flex items-center justify-between text-xs tracking-widest text-white/50 uppercase font-mono">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span className="text-[11px] sm:text-xs text-rose-200/90">{sunsetConfig.badge}</span>
        </div>

        {/* Minimal progress indicator */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <span className="text-[10px] text-white/40 tracking-wider">SUNSET</span>
          <span className="text-xs font-semibold text-amber-200">{Math.round(progress * 100)}%</span>
        </div>
      </header>

      {/* ─── Ephemeral delicate whisper as sun touches horizon ─── */}
      <AnimatePresence>
        {progress >= 0.74 && progress <= 0.88 && (
          <motion.div
            key="ephemeral-whisper"
            initial={{ opacity: 0, y: 6, letterSpacing: '0.2em' }}
            animate={{ opacity: 0.8, y: 0, letterSpacing: '0.45em' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
            transition={{ duration: 0.8 }}
            className="absolute top-[26%] sm:top-[28%] inset-x-0 text-center pointer-events-none z-30"
          >
            <span className="font-serif italic text-xs sm:text-sm text-amber-200/70 lowercase tracking-[0.45em] drop-shadow">
              ephemeral
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Center Cinematic Story Text ─── */}
      <div className="w-full flex flex-col items-center justify-center my-auto px-4 text-center">
        <AnimatePresence mode="wait">
          {currentMilestone && !isFinalState && (
            <motion.div
              key={currentMilestone.id}
              initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl mx-auto space-y-3 bg-black/35 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl"
            >
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-cream font-normal leading-snug drop-shadow-md">
                "{currentMilestone.text}"
              </h2>
              {currentMilestone.subtext && (
                <p className="font-handwritten text-lg sm:text-2xl text-rose-200/85">
                  {currentMilestone.subtext}
                </p>
              )}
            </motion.div>
          )}

          {/* ─── Final Sunset State Card & CTA ─── */}
          {isFinalState && (
            <motion.div
              key="final-sunset-card"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="max-w-lg mx-auto bg-black/55 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-rose-300/20 shadow-2xl shadow-rose-950/60 text-center space-y-5 pointer-events-auto"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-300/20 flex items-center justify-center mx-auto text-rose-200 shadow-inner">
                <Sparkles className="w-5 h-5 text-amber-200 animate-spin" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-2xl sm:text-3xl text-cream">
                  {currentMilestone?.text || "Maybe this is one of those moments."}
                </h3>
                <p className="font-handwritten text-xl text-rose-200/90">
                  {currentMilestone?.subtext || sunsetConfig.finalPrompt}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onNext}
                  className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white font-medium text-sm tracking-wide shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                >
                  <span>{sunsetConfig.finalButtonText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <p className="text-[11px] text-white/35 font-mono tracking-wider uppercase">
                [ NIGHT FALLS • TWO PEOPLE UNDER THE LANTERN ]
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Bottom Scroll Hint ─── */}
      <footer className="w-full flex justify-center text-center">
        {!isFinalState ? (
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/5 text-[11px] sm:text-xs text-white/45 font-sans"
          >
            <span>{sunsetConfig.scrollHint}</span>
            <ChevronDown className="w-3.5 h-3.5 text-rose-300/70" />
          </motion.div>
        ) : (
          <div className="text-[11px] text-white/30 font-handwritten">
            (scroll back up anytime to watch the daylight return)
          </div>
        )}
      </footer>
    </div>
  );
};

export default SunsetText;

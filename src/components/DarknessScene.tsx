import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../utils/audioManager';

interface DarknessSceneProps {
  onNext?: () => void;
}

/**
 * DarknessScene — A minimal, atmospheric stage between sunset and moon.
 * The screen is almost entirely black with subtle ambient presence,
 * building anticipation before the moon reveal.
 */
export default function DarknessScene({ onNext }: DarknessSceneProps) {
  const [showContent, setShowContent] = useState(false);
  const [autoTransition, setAutoTransition] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    audioManager.transitionToStage('darkness');

    // Reveal atmospheric text after a breath
    const t1 = setTimeout(() => setShowContent(true), 1200);

    // Auto-transition to moon after a cinematic pause
    const t2 = setTimeout(() => setAutoTransition(true), 5500);
    const t3 = setTimeout(() => {
      onNext?.();
    }, 7000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onNext]);

  const faintStars = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      size: (i % 3) * 0.5 + 0.8,
      left: `${(i * 19) % 94 + 3}%`,
      top: `${(i * 29) % 94 + 3}%`,
      duration: 3 + (i % 4) * 1.5,
      delay: (i % 5) * 0.7,
    }));
  }, []);

  return (
    <div
      onClick={() => onNext?.()}
      className="fixed inset-0 bg-[#030308] flex flex-col items-center justify-center text-center p-6 select-none overflow-hidden cursor-pointer"
      style={{ touchAction: 'none' }}
    >
      {/* Extremely subtle ambient glow — barely visible */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '60vw',
          height: '60vw',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(120, 130, 170, 0.04) 0%, transparent 70%)',
        }}
      />

      {/* Faint twinkling stars */}
      <div className="absolute inset-0 pointer-events-none">
        {faintStars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              width: star.size,
              height: star.size,
              left: star.left,
              top: star.top,
            }}
            animate={{
              opacity: [0.05, 0.3, 0.05],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
            }}
          />
        ))}
      </div>

      {/* Main atmospheric content */}
      <AnimatePresence>
        {showContent && !autoTransition && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5 max-w-md z-10"
          >
            <motion.div
              className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto"
              animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-amber-200/60 text-lg">✦</span>
            </motion.div>

            <p className="font-handwritten text-2xl sm:text-3xl text-rose-200/55 leading-relaxed">
              "between dreams and reality"
            </p>

            <p className="text-[11px] text-white/25 tracking-[0.35em] uppercase font-mono">
              Night falls over the city • something is glowing in the darkness
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fade out to complete darkness before moon transition */}
      <AnimatePresence>
        {autoTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="fixed inset-0 bg-black z-20"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

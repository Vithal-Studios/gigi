import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { audioManager } from '../utils/audioManager';

export default function MusicPlayer() {
  const [isMuted, setIsMuted] = useState(() => audioManager.getMuted());
  const [isUnlocked, setIsUnlocked] = useState(() => audioManager.getUnlocked());

  // Periodically check unlock state or update on interaction
  useEffect(() => {
    const checkState = () => {
      setIsUnlocked(audioManager.getUnlocked());
      setIsMuted(audioManager.getMuted());
    };

    window.addEventListener('click', checkState, { passive: true });
    window.addEventListener('keydown', checkState, { passive: true });

    return () => {
      window.removeEventListener('click', checkState);
      window.removeEventListener('keydown', checkState);
    };
  }, []);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Also unlock audio if not already unlocked
    audioManager.unlockAudio();
    const newMuted = audioManager.toggleMute();
    setIsMuted(newMuted);
    setIsUnlocked(true);
  };

  return (
    <aside aria-label="Audio controls">
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        onClick={handleToggleMute}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-1.5 rounded-full
                   bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/15
                   text-white/80 hover:text-white transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)]
                   cursor-pointer select-none text-xs font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-rose-300/40"
        aria-label={isMuted ? 'Unmute ambient sound' : 'Mute ambient sound'}
        title={isMuted ? 'Sound is muted — click to unmute' : 'Sound is active — click to mute'}
      >
        <AnimatePresence mode="wait">
          {isMuted ? (
            <motion.span
              key="muted-icon"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-rose-400"
            >
              <VolumeX size={14} />
            </motion.span>
          ) : (
            <motion.span
              key="sound-icon"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-amber-300"
            >
              <Volume2 size={14} />
            </motion.span>
          )}
        </AnimatePresence>

        <span className="text-[11px] font-sans font-medium text-white/70">
          {isMuted ? 'Muted' : isUnlocked ? 'Sound On' : 'Tap for Sound'}
        </span>

        {/* Delicate Audio Wave Pulsing Bars */}
        {!isMuted && isUnlocked && (
          <span className="flex items-center gap-0.5 ml-0.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-0.5 bg-gradient-to-t from-rose-400 to-amber-300 rounded-full"
                animate={{ height: [2, 8 + (i % 2) * 3, 2] }}
                transition={{
                  duration: 0.65 + i * 0.1,
                  repeat: Infinity,
                  delay: i * 0.12,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </span>
        )}
      </motion.button>
    </aside>
  );
}

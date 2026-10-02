import React from 'react';
import { motion } from 'framer-motion';

interface SunsetOverlayProps {
  progress: number; // 0.0 to 1.0
}

export const SunsetOverlay: React.FC<SunsetOverlayProps> = ({ progress }) => {
  // Stars opacity increases in twilight (> 0.45)
  const starsOpacity = Math.max(0, Math.min(1, (progress - 0.4) / 0.5));

  // Ambient darkness / dusk bloom
  const duskOpacity = Math.max(0, Math.min(0.55, progress * 0.6));

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Dynamic twilight dusk wash */}
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 50% 100%, rgba(255, 140, 80, ${Math.max(0, 0.25 - progress * 0.25)}) 0%, transparent 60%),
            radial-gradient(ellipse at 50% 20%, rgba(35, 15, 55, ${duskOpacity}) 0%, transparent 80%)
          `,
        }}
      />

      {/* Cinematic Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(8, 6, 12, 0.75) 100%)',
        }}
      />

      {/* Twilight Twinkling Stars */}
      <div
        className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
        style={{ opacity: starsOpacity }}
      >
        {Array.from({ length: 32 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-100"
            style={{
              top: `${(i * 13) % 42}%`,
              left: `${(i * 29) % 96}%`,
              width: `${(i % 3) * 0.8 + 1.2}px`,
              height: `${(i % 3) * 0.8 + 1.2}px`,
              boxShadow: '0 0 6px rgba(254, 240, 138, 0.8)',
            }}
            animate={{
              opacity: [(i % 4) * 0.2 + 0.3, 0.95, (i % 4) * 0.2 + 0.3],
              scale: [0.9, 1.2, 0.9],
            }}
            transition={{
              duration: 2.5 + (i % 4) * 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: (i % 7) * 0.4,
            }}
          />
        ))}
      </div>

      {/* Subtle floating dust/light motes */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-rose-200/30 blur-[0.5px]"
            style={{
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              left: `${(i * 23) % 92}%`,
              top: `${(i * 17) % 85}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, (i % 2 === 0 ? 15 : -15), 0],
              opacity: [0.1, 0.45, 0.1],
            }}
            transition={{
              duration: 6 + (i % 3) * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Distant dog silhouette trotting along the distant shore path */}
      {progress > 0.22 && progress < 0.88 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 0.38, x: 0 }}
          exit={{ opacity: 0 }}
          className="absolute pointer-events-none z-10"
          style={{
            top: '55.2%',
            left: '20%',
          }}
          title="A friendly pup enjoying golden hour"
        >
          <svg width="20" height="15" viewBox="0 0 24 18" fill="none" className="text-[#15111c]">
            <path
              d="M3 13L4 10C4 9 5 8 7 8H12L15 4H18L17 7L19 9L21 8.5L20 10.5L18 11L17 14L16 16L14 16L15 13H8L7 16H5L6 13H3Z"
              fill="currentColor"
            />
          </svg>
        </motion.div>
      )}
    </div>
  );
};

export default SunsetOverlay;

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ScrollSequence } from 'scroll-frame-sequence';
import 'scroll-frame-sequence/style.css';
import { sunsetConfig } from '../config/sunsetConfig';

interface SunsetScrollSequenceProps {
  onProgressChange?: (progress: number) => void;
  children?: (progress: number) => React.ReactNode;
}

export const SunsetScrollSequence: React.FC<SunsetScrollSequenceProps> = ({
  onProgressChange,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [slotElement, setSlotElement] = useState<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);

  const lastProgressRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Generate frame URLs array: f_001.webp through f_140.webp
    const frameUrls = Array.from(
      { length: sunsetConfig.frameCount },
      (_, i) => `/sunset/frames/f_${String(i + 1).padStart(3, '0')}.webp`
    );

    const sequence = new ScrollSequence(containerRef.current, {
      frames: frameUrls,
      poster: sunsetConfig.posterUrl,
      sheetUrl: sunsetConfig.sheetUrl,
      sheetCols: sunsetConfig.sheetCols,
      sheetRows: sunsetConfig.sheetRows,
      heightVh: sunsetConfig.heightVh,
      dim: 0.15,
      mobileBreakpoint: sunsetConfig.mobileBreakpoint,
      mobileFrameCount: sunsetConfig.mobileFrameCount,
      respectReducedMotion: true,
      onProgress: (p: number) => {
        // Performance throttle: update React state only on noticeable delta or bounds
        const last = lastProgressRef.current;
        if (
          Math.abs(p - last) >= 0.006 ||
          p === 0 ||
          p >= 0.99 ||
          (p >= 0.88 && last < 0.88) ||
          (p < 0.88 && last >= 0.88)
        ) {
          lastProgressRef.current = p;
          setProgress(p);
          onProgressChange?.(p);
        }
      },
    });

    if (sequence.overlay) {
      setSlotElement(sequence.overlay);
    }

    return () => {
      sequence.destroy();
    };
  }, [onProgressChange]);

  return (
    <div className="relative w-full bg-[#0a080f]">
      {/* ScrollSequence DOM target */}
      <div ref={containerRef} className="w-full" />

      {/* Render children inside the sticky sequence overlay slot via Portal */}
      {slotElement && children && createPortal(children(progress), slotElement)}
    </div>
  );
};

export default SunsetScrollSequence;

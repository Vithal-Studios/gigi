import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon } from 'lucide-react';
import { playMoonCatchChime, playMoonDodgeSound } from '../utils/paperAudio';
import { siteConfig } from '../config/siteConfig';

interface MoonInteractionProps {
  onMoonCaught: () => void;
}

const DODGE_MESSAGES = [
  siteConfig.moon?.dodgeMessages?.[0] ?? 'Almost.',
  siteConfig.moon?.dodgeMessages?.[1] ?? 'Not yet.',
  siteConfig.moon?.dodgeMessages?.[2] ?? 'Seriously?',
];

const CATCHABLE_HINT = siteConfig.moon?.catchableHint ?? 'Okay okay... come get me ✦';
const CAUGHT_MESSAGE = siteConfig.moon?.caughtMessage ?? 'You caught the moon.';

type Phase = 'entrance' | 'idle' | 'dodging' | 'catchable' | 'caught' | 'pause' | 'buildup' | 'flash';

// Generate a new random position within the viewport, avoiding edges
function randomPosition(avoid?: { x: number; y: number }): { x: number; y: number } {
  const margin = 15; // % from edges
  let x: number, y: number;
  let attempts = 0;
  do {
    x = margin + Math.random() * (100 - margin * 2);
    y = margin + Math.random() * (100 - margin * 2);
    attempts++;
  } while (
    avoid &&
    Math.hypot(x - avoid.x, y - avoid.y) < 25 &&
    attempts < 20
  );
  return { x, y };
}

export default function MoonInteraction({ onMoonCaught }: MoonInteractionProps) {
  const [phase, setPhase] = useState<Phase>('entrance');
  const [dodgeCount, setDodgeCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [moonPos, setMoonPos] = useState({ x: 50, y: 40 }); // center-ish
  const [moonScale, setMoonScale] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('idle');
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  // Show a transient message
  const showMessage = useCallback((msg: string, duration = 2000) => {
    setMessage(msg);
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => setMessage(null), duration);
  }, []);

  // Handle moon click/tap
  const handleMoonClick = useCallback(() => {
    if (phase === 'entrance') return;

    if (phase === 'caught' || phase === 'flash') return;

    if (phase === 'catchable') {
      // Moon is caught!
      setPhase('caught');
      playMoonCatchChime();
      setMoonScale(28);
      setMoonPos({ x: 50, y: 50 });
      showMessage(CAUGHT_MESSAGE, 2000);

      // 1. Quiet pause: let the scale settle and darkness/stars breathe
      setTimeout(() => {
        setPhase('pause');
      }, 1600);

      // 2. Emotional buildup line appears: "and i smile when i think of all the times we had"
      setTimeout(() => {
        setPhase('buildup');
      }, 2800);

      // 3. Dissolve to white flash
      setTimeout(() => {
        setPhase('flash');
      }, 6200);

      // 4. Transition to final video
      setTimeout(() => {
        onMoonCaught();
      }, 7600);

      return;
    }

    // Dodge!
    const newDodgeCount = dodgeCount + 1;
    setDodgeCount(newDodgeCount);
    setPhase('dodging');

    playMoonDodgeSound();

    // Show dodge message
    const msgIdx = Math.min(newDodgeCount - 1, DODGE_MESSAGES.length - 1);
    showMessage(DODGE_MESSAGES[msgIdx], 1800);

    // Move moon to a new random position
    const newPos = randomPosition(moonPos);
    setMoonPos(newPos);

    // After dodge animation, decide next state
    setTimeout(() => {
      if (newDodgeCount >= 3) {
        // Become catchable
        setPhase('catchable');
        showMessage(CATCHABLE_HINT, 3500);
        // Moon drifts to a gentle position
        setMoonPos(randomPosition(newPos));
      } else {
        setPhase('idle');
      }
    }, 800);
  }, [phase, dodgeCount, moonPos, showMessage, onMoonCaught]);

  // Pulsing glow intensity based on phase
  const glowIntensity = phase === 'catchable' ? 1.5 : phase === 'caught' ? 3 : 1;

  const backgroundStars = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      size: (i % 3) * 0.7 + 1.2,
      left: `${(i * 17) % 96 + 2}%`,
      top: `${(i * 23) % 94 + 2}%`,
      duration: 2.5 + (i % 4) * 1.0,
      delay: (i % 5) * 0.5,
    }));
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-[#050510] overflow-hidden select-none"
      style={{ touchAction: 'none' }}
    >
      {/* Subtle star dots in background */}
      <div className="absolute inset-0 pointer-events-none">
        {backgroundStars.map((star) => (
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
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
            }}
          />
        ))}
      </div>

      {/* Delicate Dog Constellation (Canis Major easter egg for Gayathri) */}
      <div className="absolute top-10 right-8 sm:top-14 sm:right-20 pointer-events-none opacity-40 hover:opacity-80 transition-opacity">
        <svg width="86" height="66" viewBox="0 0 90 70" fill="none">
          <polyline
            points="15,45 35,40 55,30 75,18 82,32 70,48 50,52 35,40"
            stroke="rgba(254, 240, 138, 0.4)"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />
          <line x1="75" y1="18" x2="68" y2="8" stroke="rgba(254, 240, 138, 0.4)" strokeWidth="0.8" strokeDasharray="2 2" />
          <line x1="15" y1="45" x2="8" y2="58" stroke="rgba(254, 240, 138, 0.4)" strokeWidth="0.8" strokeDasharray="2 2" />
          <line x1="50" y1="52" x2="48" y2="64" stroke="rgba(254, 240, 138, 0.4)" strokeWidth="0.8" strokeDasharray="2 2" />
          {[[15,45], [35,40], [55,30], [75,18], [68,8], [82,32], [70,48], [50,52], [8,58], [48,64]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={i === 3 ? "2.2" : "1.4"} fill="#fef08a" opacity={i === 3 ? "0.9" : "0.7"} />
          ))}
        </svg>
        <span className="text-[9px] text-amber-200/40 tracking-[0.25em] font-mono uppercase block -mt-1 text-right">
          ✦ canis
        </span>
      </div>

      {/* Moonlight ambient glow — grows when caught */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: `${moonPos.x}%`,
          top: `${moonPos.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          width: phase === 'caught' ? '250vmax' : phase === 'catchable' ? '60vw' : '40vw',
          height: phase === 'caught' ? '250vmax' : phase === 'catchable' ? '60vw' : '40vw',
          opacity: phase === 'caught' ? 0.6 : 0.15 * glowIntensity,
        }}
        transition={{ duration: phase === 'caught' ? 1.8 : 0.8, ease: 'easeOut' }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(200, 210, 255, 0.4) 0%, rgba(160, 180, 230, 0.15) 30%, transparent 70%)`,
          }}
        />
      </motion.div>

      {/* The Moon */}
      <motion.div
        className="absolute cursor-pointer z-20"
        style={{
          left: `${moonPos.x}%`,
          top: `${moonPos.y}%`,
        }}
        initial={{ scale: 0, opacity: 0, x: '-50%', y: '-50%' }}
        animate={{
          scale: phase === 'entrance' ? [0, 0.5, 1] : moonScale,
          opacity: 1,
          x: '-50%',
          y: '-50%',
        }}
        transition={{
          scale: { duration: phase === 'entrance' ? 1.8 : phase === 'caught' ? 1.6 : 0.5, ease: [0.22, 1, 0.36, 1] },
          left: { duration: phase === 'caught' ? 1.3 : 0.6, ease: [0.34, 1.56, 0.64, 1] },
          top: { duration: phase === 'caught' ? 1.3 : 0.6, ease: [0.34, 1.56, 0.64, 1] },
        }}
        onClick={handleMoonClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleMoonClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Interactive moon — tap to catch"
        whileHover={phase === 'catchable' ? { scale: 1.12 } : undefined}
        whileTap={phase === 'catchable' ? { scale: 0.95 } : undefined}
      >
        {/* Moon body */}
        <div
          className="relative"
          style={{
            width: 'clamp(100px, 20vw, 180px)',
            height: 'clamp(100px, 20vw, 180px)',
          }}
        >
          {/* Outer corona glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              transform: 'scale(1.5)',
              background: `radial-gradient(circle, rgba(200, 215, 255, ${0.15 * glowIntensity}) 0%, transparent 70%)`,
              filter: 'blur(15px)',
            }}
          />

          {/* Moon surface */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              background: `
                radial-gradient(circle at 35% 35%, #f0f0f5 0%, #d8dce8 40%, #b8bdd0 70%, #9ca3b8 100%)
              `,
              boxShadow: `
                inset -15px -10px 30px rgba(0, 0, 0, 0.2),
                inset 8px 8px 20px rgba(255, 255, 255, 0.3),
                0 0 ${30 * glowIntensity}px rgba(200, 215, 255, ${0.4 * glowIntensity}),
                0 0 ${60 * glowIntensity}px rgba(180, 195, 240, ${0.2 * glowIntensity}),
                0 0 ${100 * glowIntensity}px rgba(160, 175, 220, ${0.1 * glowIntensity})
              `,
            }}
          >
            {/* Crater 1 */}
            <div
              className="absolute rounded-full"
              style={{
                width: '22%',
                height: '22%',
                left: '25%',
                top: '20%',
                background: 'radial-gradient(circle, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.03) 60%, transparent 100%)',
                boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.06)',
              }}
            />
            {/* Crater 2 */}
            <div
              className="absolute rounded-full"
              style={{
                width: '15%',
                height: '15%',
                left: '55%',
                top: '35%',
                background: 'radial-gradient(circle, rgba(0,0,0,0.06) 0%, transparent 70%)',
                boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.05)',
              }}
            />
            {/* Crater 3 */}
            <div
              className="absolute rounded-full"
              style={{
                width: '18%',
                height: '18%',
                left: '40%',
                top: '60%',
                background: 'radial-gradient(circle, rgba(0,0,0,0.07) 0%, transparent 65%)',
                boxShadow: 'inset 1px 2px 3px rgba(0,0,0,0.04)',
              }}
            />
            {/* Crater 4 (small) */}
            <div
              className="absolute rounded-full"
              style={{
                width: '10%',
                height: '10%',
                left: '68%',
                top: '55%',
                background: 'radial-gradient(circle, rgba(0,0,0,0.05) 0%, transparent 70%)',
              }}
            />

            {/* Subtle surface texture (maria) */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `
                  radial-gradient(ellipse at 30% 50%, rgba(0,0,0,0.04) 0%, transparent 50%),
                  radial-gradient(ellipse at 60% 40%, rgba(0,0,0,0.03) 0%, transparent 40%)
                `,
              }}
            />
          </div>

          {/* Breathing pulse animation for catchable state */}
          {phase === 'catchable' && (
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                border: '2px solid rgba(200, 215, 255, 0.4)',
                boxShadow: '0 0 30px rgba(200, 215, 255, 0.3)',
              }}
            />
          )}
        </div>
      </motion.div>

      {/* Message overlay */}
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 bottom-[15%] -translate-x-1/2 z-30 pointer-events-none"
          >
            <div className="px-8 py-4 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              <p className="font-handwritten text-2xl sm:text-3xl text-white/90 text-center whitespace-nowrap">
                {message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entrance caption */}
      <AnimatePresence>
        {phase === 'entrance' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="fixed inset-x-0 bottom-[24%] z-10 text-center pointer-events-none space-y-1.5"
          >
            <p className="text-xs text-white/30 tracking-[0.3em] uppercase font-mono">
              <Moon className="w-3 h-3 inline-block mr-2 -mt-0.5" />
              {siteConfig.moon?.badge ?? 'ACT VII • THE MOON'}
            </p>
            <p className="font-handwritten text-lg sm:text-xl text-rose-200/50">
              "between dreams and reality"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle hint */}
      <AnimatePresence>
        {phase === 'idle' && dodgeCount === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
            className="fixed inset-x-0 bottom-[8%] z-10 text-center pointer-events-none"
          >
            <p className="font-handwritten text-lg text-white/40">
              {siteConfig.moon?.idleHint ?? 'Try to catch the moon...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Emotional buildup line before final video ─── */}
      <AnimatePresence>
        {phase === 'buildup' && (
          <motion.div
            key="buildup-line"
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center p-8 text-center bg-black/70 backdrop-blur-md pointer-events-none select-none"
          >
            <div className="space-y-4 max-w-xl">
              <span className="text-amber-200/60 text-xl block">✦</span>
              <p className="font-handwritten text-3xl sm:text-5xl text-cream/95 leading-relaxed drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
                "and i smile when i think of all the times we had"
              </p>
              <p className="text-[10px] tracking-[0.4em] uppercase font-mono text-rose-200/40">
                Gayathri's story
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* White flash overlay when moon is caught */}
      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 1.4, ease: 'easeIn' }}
            className="fixed inset-0 z-50 bg-white"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

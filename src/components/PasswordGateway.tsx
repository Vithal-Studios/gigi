import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, ArrowRight, Sparkles, Heart, HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { playTumblerClickSound, playUnlockSuccessChime, playErrorBuzz } from '../utils/audioSystem';
import GiraffeLegoIllustration from './GiraffeLegoIllustration';

interface PasswordGatewayProps {
  onUnlock: () => void;
}

export default function PasswordGateway({ onUnlock }: PasswordGatewayProps) {
  // 3-digit lock state
  const [digits, setDigits] = useState<string[]>(['', '', '']);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [isShaking, setIsShaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [fadeToBlack, setFadeToBlack] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the active input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const validateCombination = useCallback(
    (combo: string) => {
      if (isUnlocked) return;

      const trimmed = combo.trim();
      const isCorrect = trimmed === '317' || trimmed === siteConfig.password.code;

      if (isCorrect) {
        setIsUnlocked(true);
        setErrorMessage('');
        playUnlockSuccessChime();

        // Cinematic dissolve into NYC
        setTimeout(() => {
          setFadeToBlack(true);
        }, 750);

        setTimeout(() => {
          onUnlock();
        }, 2200);
      } else {
        setIsShaking(true);
        playErrorBuzz();
        setErrorMessage("That combination isn't quite right... try again, Gayathri.");

        setTimeout(() => {
          setIsShaking(false);
          setDigits(['', '', '']);
          setActiveSlot(0);
          inputRefs.current[0]?.focus();
        }, 650);
      }
    },
    [isUnlocked, onUnlock]
  );

  const handleDigitInput = (index: number, val: string) => {
    if (isUnlocked) return;

    // Only allow numeric 0-9
    const clean = val.replace(/\D/g, '');
    const char = clean.slice(-1);

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    if (char) {
      playTumblerClickSound();
      if (errorMessage) setErrorMessage('');

      // Auto-advance to next wheel
      if (index < 2) {
        setActiveSlot(index + 1);
        inputRefs.current[index + 1]?.focus();
      }

      // Check if all 3 digits filled
      const full = newDigits.join('');
      if (full.length === 3 && !newDigits.includes('')) {
        validateCombination(full);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isUnlocked) return;

    if (e.key === 'Backspace') {
      if (digits[index] === '' && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        setActiveSlot(index - 1);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      setActiveSlot(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 2) {
      e.preventDefault();
      setActiveSlot(index + 1);
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      stepDigit(index, 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      stepDigit(index, -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      validateCombination(digits.join(''));
    }
  };

  const stepDigit = (index: number, delta: number) => {
    if (isUnlocked) return;
    playTumblerClickSound();

    const currNum = digits[index] === '' ? 0 : parseInt(digits[index], 10);
    const nextNum = (currNum + delta + 10) % 10;

    const newDigits = [...digits];
    newDigits[index] = String(nextNum);
    setDigits(newDigits);

    if (errorMessage) setErrorMessage('');

    // If all 3 are filled, auto-check
    const full = newDigits.join('');
    if (full.length === 3 && !newDigits.includes('')) {
      validateCombination(full);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (isUnlocked) return;

    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (!pasted) return;

    playTumblerClickSound();
    const chars = pasted.slice(0, 3).split('');
    const newDigits = ['', '', ''];
    chars.forEach((c, i) => {
      newDigits[i] = c;
    });

    setDigits(newDigits);

    const lastIdx = Math.min(chars.length, 2);
    setActiveSlot(lastIdx);
    inputRefs.current[lastIdx]?.focus();

    if (chars.length === 3) {
      validateCombination(newDigits.join(''));
    }
  };

  const enteredCode = digits.join('');

  return (
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row overflow-x-hidden bg-[#0a0810] text-white select-none">
      {/* ─── Golden sparkle burst upon unlock ─── */}
      {isUnlocked && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 42 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-3.5 rounded-sm"
              style={{
                top: '50%',
                left: '50%',
                backgroundColor: ['#f59e0b', '#fbbf24', '#f43f5e', '#ec4899', '#fde047', '#fb7185'][i % 6],
              }}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{
                scale: [0, 1.2, 0.8],
                x: Math.cos((i * Math.PI) / 21) * (220 + (i % 4) * 60),
                y: Math.sin((i * Math.PI) / 21) * (220 + (i % 4) * 60) - 80,
                rotate: i * 45,
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* LEFT PANEL (~55% Desktop, Top on Mobile)                     */}
      {/* Two Characters Building Giraffe LEGO                         */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="relative w-full lg:w-[55%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 bg-gradient-to-b from-[#100d18] via-[#0c0914] to-[#0a0810]">
        {/* Subtle background grain & warm radial illumination */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: 'radial-gradient(circle at 50% 40%, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
          }}
        />

        {/* Top Story Badge */}
        <header className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-rose-300 text-xs font-mono tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Chapter 00 • Where It All Began</span>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono tracking-widest text-white/40 uppercase">
              Gayathri's Universe
            </span>
          </div>
        </header>

        {/* Giraffe LEGO Illustration (Canonical Two Characters Sitting Together) */}
        <div className="relative z-10 w-full my-auto py-4 flex items-center justify-center">
          <GiraffeLegoIllustration />
        </div>

      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* RIGHT PANEL (~45% Desktop, Bottom on Mobile)                 */}
      {/* 3-Digit Physical Number Lock                                 */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="relative w-full lg:w-[45%] flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 z-10">
        {/* Subtle cosmic background glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 -z-10"
          style={{
            background: `
              radial-gradient(circle at 70% 30%, rgba(244, 63, 94, 0.2) 0%, transparent 60%),
              radial-gradient(circle at 30% 70%, rgba(245, 158, 11, 0.15) 0%, transparent 55%)
            `,
          }}
        />

        {/* Main Number Lock Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-stone-950/70 border border-white/10 backdrop-blur-2xl rounded-3xl p-7 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-center relative flex flex-col items-center"
        >
          {/* Mechanical Lock Bezel Shackle Emblem */}
          <motion.div
            animate={
              isUnlocked
                ? { scale: [1, 1.25, 1.1], rotate: [0, -10, 0] }
                : { y: [0, -2, 0] }
            }
            transition={
              isUnlocked
                ? { duration: 0.8, ease: 'easeOut' }
                : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
            }
            className="relative mb-5"
          >
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 border ${
                isUnlocked
                  ? 'bg-amber-500/20 border-amber-300 text-amber-200 shadow-[0_0_30px_rgba(251,191,36,0.6)]'
                  : 'bg-white/5 border-white/15 text-rose-200/80 shadow-inner'
              }`}
            >
              {isUnlocked ? (
                <Unlock className="w-8 h-8 text-amber-300 animate-bounce" />
              ) : (
                <Lock className="w-7 h-7 text-rose-200/90" />
              )}
            </div>
            <div className="absolute inset-0 rounded-2xl bg-amber-500/20 blur-xl -z-10" />
          </motion.div>

          {/* Heading & Subtitle */}
          <div className="space-y-2 mb-7">
            <span className="text-[10px] sm:text-xs text-amber-300/80 tracking-[0.35em] uppercase font-mono font-medium block">
              GAYATHRI
            </span>

            <h1 className="font-display text-2xl sm:text-3xl text-cream font-normal tracking-tight">
              A little world made for Gayathri.
            </h1>

            <p className="font-handwritten text-lg sm:text-xl text-rose-200/75 max-w-xs mx-auto">
              Three numbers. One tiny secret.
            </p>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* 3-DIGIT COMBINATION LOCK TUMBLERS                        */}
          {/* ──────────────────────────────────────────────────────── */}
          <motion.div
            animate={isShaking ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.5 }}
            onPaste={handlePaste}
            className="w-full space-y-6"
          >
            {/* The Physical Tumbler Housing Container */}
            <div className="relative p-4 rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-black border-2 border-stone-800 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8),0_10px_30px_rgba(0,0,0,0.6)]">
              {/* Metallic Screws at 4 corners */}
              <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-stone-700 border border-stone-600" />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-stone-700 border border-stone-600" />
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-stone-700 border border-stone-600" />
              <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-stone-700 border border-stone-600" />

              <div className="flex justify-center items-center gap-3 sm:gap-4">
                {[0, 1, 2].map((idx) => {
                  const val = digits[idx];
                  const isCurrent = activeSlot === idx;

                  return (
                    <div key={idx} className="flex flex-col items-center">
                      {/* Step Up Button */}
                      <button
                        type="button"
                        disabled={isUnlocked}
                        onClick={() => stepDigit(idx, 1)}
                        className="p-1 text-white/40 hover:text-amber-300 transition-colors disabled:opacity-30 cursor-pointer active:scale-90"
                        title={`Scroll wheel ${idx + 1} up`}
                        aria-label={`Increment wheel ${idx + 1}`}
                      >
                        <ChevronUp size={18} />
                      </button>

                      {/* Cylindrical Tumbler Cylinder */}
                      <div
                        onClick={() => {
                          setActiveSlot(idx);
                          inputRefs.current[idx]?.focus();
                        }}
                        className={`relative w-16 h-22 sm:w-18 sm:h-24 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden border ${
                          isUnlocked
                            ? 'bg-gradient-to-b from-amber-950/60 via-amber-900/30 to-amber-950/60 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]'
                            : isCurrent
                            ? 'bg-stone-900 border-amber-300/60 shadow-[0_0_15px_rgba(251,191,36,0.25)] ring-2 ring-amber-400/20'
                            : 'bg-stone-900/90 border-stone-700 hover:border-stone-500'
                        }`}
                      >
                        {/* Mechanical graduation tick marks on left & right margins */}
                        <div className="absolute left-1.5 inset-y-2 flex flex-col justify-between opacity-30 pointer-events-none">
                          <span className="w-1.5 h-[1px] bg-white" />
                          <span className="w-2.5 h-[1px] bg-amber-300" />
                          <span className="w-1.5 h-[1px] bg-white" />
                          <span className="w-2.5 h-[1px] bg-amber-300" />
                          <span className="w-1.5 h-[1px] bg-white" />
                        </div>
                        <div className="absolute right-1.5 inset-y-2 flex flex-col justify-between opacity-30 pointer-events-none">
                          <span className="w-1.5 h-[1px] bg-white" />
                          <span className="w-2.5 h-[1px] bg-amber-300" />
                          <span className="w-1.5 h-[1px] bg-white" />
                          <span className="w-2.5 h-[1px] bg-amber-300" />
                          <span className="w-1.5 h-[1px] bg-white" />
                        </div>

                        {/* Top and Bottom cylindrical shadow gradients */}
                        <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
                        <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                        {/* Center horizontal reflective highlight strip */}
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 bg-white/[0.04] border-y border-white/[0.08] pointer-events-none" />

                        {/* Hidden/Transparent Input for accessibility & direct typing */}
                        <input
                          ref={(el) => {
                            inputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={val}
                          disabled={isUnlocked}
                          onChange={(e) => handleDigitInput(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          onFocus={() => setActiveSlot(idx)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label={`Digit wheel ${idx + 1}`}
                        />

                        {/* Visible Mechanical Number with rolling animation */}
                        <AnimatePresence mode="popLayout">
                          <motion.span
                            key={val || 'empty'}
                            initial={{ y: 16, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -16, opacity: 0 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className={`font-mono text-3xl sm:text-4xl font-bold select-none ${
                              isUnlocked
                                ? 'text-amber-200 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                                : val
                                ? 'text-white'
                                : 'text-stone-600'
                            }`}
                          >
                            {val || '0'}
                          </motion.span>
                        </AnimatePresence>
                      </div>

                      {/* Step Down Button */}
                      <button
                        type="button"
                        disabled={isUnlocked}
                        onClick={() => stepDigit(idx, -1)}
                        className="p-1 text-white/40 hover:text-amber-300 transition-colors disabled:opacity-30 cursor-pointer active:scale-90"
                        title={`Scroll wheel ${idx + 1} down`}
                        aria-label={`Decrement wheel ${idx + 1}`}
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="font-handwritten text-base text-rose-300 text-center"
                >
                  {errorMessage}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Unlock Button */}
            <button
              type="button"
              disabled={isUnlocked || enteredCode.length < 3}
              onClick={() => validateCombination(enteredCode)}
              className={`w-full py-4 rounded-2xl font-medium tracking-wide text-sm flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer shadow-lg
                ${
                  isUnlocked
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-amber-500/40 cursor-default'
                    : enteredCode.length === 3
                    ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-white shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-white/10 text-white/30 cursor-not-allowed border border-white/5'
                }`}
            >
              {isUnlocked ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-stone-950" />
                  <span>Lock Released • Entering Our World...</span>
                </>
              ) : (
                <>
                  <span>[ UNLOCK ]</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>

          {/* Hint Accordion */}
          <div className="mt-5 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-rose-200/50 hover:text-rose-200/90 transition-colors flex items-center gap-1.5 cursor-pointer py-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? 'Hide secret hint' : 'Need a hint?'}</span>
            </button>

            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -4 }}
                  className="overflow-hidden mt-2"
                >
                  <div className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-rose-200/80 font-handwritten">
                    {siteConfig.password.hint}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Handwritten notes below the lock */}
        <div className="mt-6 flex flex-wrap justify-center gap-3 max-w-sm text-center">
          <span className="font-handwritten text-xs text-rose-300/60 bg-white/[0.03] px-3 py-1 rounded-full border border-white/5">
            "lowkey elegant soul, baddie in a nutshell."
          </span>
          <span className="font-handwritten text-xs text-amber-200/50 bg-white/[0.03] px-3 py-1 rounded-full border border-white/5">
            "a weirdo but im real tho"
          </span>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* CINEMATIC FADE-TO-BLACK TRANSITION OVERLAY                   */}
      {/* ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {fadeToBlack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-center p-6 select-none pointer-events-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 1.0 }}
              className="space-y-4 max-w-sm"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-400/20 flex items-center justify-center mx-auto text-amber-200">
                <Heart className="w-6 h-6 text-rose-400 animate-pulse fill-rose-400" />
              </div>

              <div className="space-y-1">
                <p className="font-handwritten text-3xl text-rose-200/90 leading-snug">
                  Welcome, Gayathri...
                </p>
                <p className="font-handwritten text-lg text-cream/70">
                  "Out of eight million people in this city, you are my favorite story."
                </p>
              </div>

              <p className="text-[11px] text-white/35 font-mono tracking-[0.25em] uppercase">
                [ ENTERING CENTRAL PARK AT GOLDEN HOUR ]
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

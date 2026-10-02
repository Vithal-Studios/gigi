/**
 * Comprehensive Audio System for the Birthday Experience
 * Powered by Web Audio API & Native Audio Elements.
 * 100% self-contained, offline-capable, cross-platform, zero external dependencies.
 */

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

// Global master sound effects volume (0.0 to 1.0)
let sfxVolume = 0.8;
let sfxMuted = false;

export function setSfxVolume(vol: number): void {
  sfxVolume = Math.max(0, Math.min(1, vol));
}

export function setSfxMuted(muted: boolean): void {
  sfxMuted = muted;
}

export function isSfxMuted(): boolean {
  return sfxMuted;
}

/* ========================================================================= */
/* 1. PASSWORD GATEWAY SOUND EFFECTS                                        */
/* ========================================================================= */

/**
 * Play a delicate, soft typewriter / keyboard key click when typing.
 */
export function playKeyPressSound(): void {
  if (sfxMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    // Subtle pitch variance to sound organic
    const pitch = 400 + Math.random() * 80;
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);

    gain.gain.setValueAtTime(0.04 * sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch {
    // Graceful error ignore
  }
}

/**
 * Play a tactile, physical mechanical tumbler wheel click.
 */
export function playTumblerClickSound(): void {
  if (sfxMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    const pitch = 720 + Math.random() * 60;
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.025);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(400, now);

    gain.gain.setValueAtTime(0.06 * sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  } catch {
    // Graceful error ignore
  }
}

/**
 * Play an uplifting, warm golden chime when the password successfully unlocks.
 */
export function playUnlockSuccessChime(): void {
  if (sfxMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Ascending radiant major chord: D4, F#4, A4, D5, F#5
    const freqs = [293.66, 369.99, 440.0, 587.33, 739.99];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = idx * 0.09;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime((0.08 / (idx * 0.4 + 1)) * sfxVolume, now + delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 1.45);
    });
  } catch {
    // Gracefully ignore
  }
}

/**
 * Play a gentle low dull thud on incorrect password attempt.
 */
export function playErrorBuzz(): void {
  if (sfxMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.18);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, now);

    gain.gain.setValueAtTime(0.06 * sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch {
    // Gracefully ignore
  }
}

/* ========================================================================= */
/* 2. MOON INTERACTION SOUND EFFECTS                                        */
/* ========================================================================= */

/**
 * Play a playful, ethereal pitch-slide whoosh when the moon dodges.
 */
export function playMoonDodgeSound(): void {
  if (sfxMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Ethereal sliding frequency
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.35);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.06 * sfxVolume, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch {
    // Gracefully ignore
  }
}

/**
 * Play a resonant, ethereal ascending chime when the moon is caught.
 */
export function playMoonCatchChime(): void {
  if (sfxMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Ascending ethereal chord: C5, E5, G5, B5, D6
    const freqs = [523.25, 659.25, 783.99, 987.77, 1174.66];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = idx * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime((0.07 / (idx * 0.5 + 1)) * sfxVolume, now + delay + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 2.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 2.1);
    });
  } catch {
    // Gracefully ignore
  }
}

/**
 * Soft cinematic transition whoosh between major story acts.
 */
export function playTransitionWhoosh(): void {
  if (sfxMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const dur = 0.45;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.linearRampToValueAtTime(900, now + dur * 0.5);
    filter.frequency.linearRampToValueAtTime(200, now + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.06 * sfxVolume, now + dur * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  } catch {
    // Gracefully ignore
  }
}

/**
 * Soft button click sound for interactive elements.
 */
export function playButtonClickSound(): void {
  if (sfxMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.05);

    gain.gain.setValueAtTime(0.05 * sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch {
    // Gracefully ignore
  }
}

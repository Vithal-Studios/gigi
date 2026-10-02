/**
 * Global Audio Manager
 * Manages stage-specific ambient audio layers, sound effects, and master mute state.
 * Fully compliant with browser autoplay policies: only begins playback after first user interaction.
 */

import { getAudioContext, setSfxMuted } from './audioSystem';

export type StageName =
  | 'password'
  | 'nyc'
  | 'sunset'
  | 'icecream'
  | 'darkness'
  | 'moon'
  | 'finalVideo';

// Master audio state
class GlobalAudioManager {
  private isMuted: boolean = false;
  private isUnlocked: boolean = false;
  private currentStage: StageName = 'password';
  private masterGain: GainNode | null = null;

  // Active ambient nodes per layer
  private activeAmbientNodes: {
    oscillators: OscillatorNode[];
    sources: AudioBufferSourceNode[];
    gains: GainNode[];
    filters: BiquadFilterNode[];
    stopTimeout?: ReturnType<typeof setTimeout>;
  } = {
    oscillators: [],
    sources: [],
    gains: [],
    filters: [],
  };

  // Background HTML5 Audio Element for high-fidelity soundtrack
  private soundtrackAudio: HTMLAudioElement | null = null;
  private isSoundtrackPlaying: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Setup HTML5 soundtrack with graceful loading
      this.soundtrackAudio = new Audio('/assets/music/background.mp3');
      this.soundtrackAudio.loop = true;
      this.soundtrackAudio.volume = 0.35;
      this.soundtrackAudio.preload = 'auto';

      this.soundtrackAudio.addEventListener('error', () => {
        // Fallback to .wav if .mp3 is unavailable
        if (this.soundtrackAudio && this.soundtrackAudio.src.endsWith('.mp3')) {
          this.soundtrackAudio.src = '/assets/music/background.wav';
          this.soundtrackAudio.load();
        }
      });
    }
  }

  /**
   * Unlock AudioContext on first user gesture (e.g. typing password or clicking).
   */
  public unlockAudio(): void {
    if (this.isUnlocked) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, ctx.currentTime);
      this.masterGain.connect(ctx.destination);
    }

    this.isUnlocked = true;

    // Start appropriate ambient layer for current stage
    this.transitionToStage(this.currentStage);
  }

  public getUnlocked(): boolean {
    return this.isUnlocked;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    setSfxMuted(this.isMuted);

    const ctx = getAudioContext();
    if (this.masterGain && ctx) {
      const now = ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.8, now + 0.2);
    }

    if (this.soundtrackAudio) {
      if (this.isMuted) {
        this.soundtrackAudio.volume = 0;
      } else {
        this.soundtrackAudio.volume = 0.35;
      }
    }

    return this.isMuted;
  }

  public isSoundtrackActive(): boolean {
    return this.isSoundtrackPlaying;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Smoothly transitions ambient soundscapes between story stages.
   */
  public transitionToStage(stage: StageName): void {
    this.currentStage = stage;
    if (!this.isUnlocked) return;

    const ctx = getAudioContext();
    if (!ctx || !this.masterGain) return;

    // Clean up previous ambient nodes with a smooth 0.6s fade-out
    this.fadeStopCurrentAmbient(0.6);

    // Switch sound layer based on stage
    switch (stage) {
      case 'password':
        // Subtle atmospheric drone / mystery room tone
        this.playAtmosphericDrone();
        this.stopSoundtrack();
        break;

      case 'nyc':
        // Soft wind + distant park breeze + gentle water murmur
        this.playNycAtmosphere();
        this.stopSoundtrack();
        break;

      case 'sunset':
      case 'icecream':
        // Calm cinematic music / warm golden hour pads
        this.playSunsetChords();
        this.startSoundtrack(0.25);
        break;

      case 'darkness':
        // Quiet, intimate dark room tone
        this.playIntimateDarkness();
        this.stopSoundtrack();
        break;

      case 'moon':
        // Cosmic lunar hum and celestial harmonics
        this.playLunarAmbience();
        this.startSoundtrack(0.35);
        break;

      case 'finalVideo':
        // FINAL VIDEO: Use the video's own audio!
        // Silence all ambient layers and pause soundtrack completely.
        this.stopAllLayersForVideo();
        break;

      default:
        break;
    }
  }

  /* ------------------------------------------------------------------------- */
  /* AMBIENT LAYERS GENERATORS (Web Audio API Synthesizers)                    */
  /* ------------------------------------------------------------------------- */

  /**
   * PASSWORD: Subtle atmospheric low-frequency drone (intimate, quiet).
   */
  private playAtmosphericDrone(): void {
    const ctx = getAudioContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(65.41, now); // C2

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(98.0, now); // G2

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.06, now + 1.2);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);

    this.activeAmbientNodes.oscillators.push(osc1, osc2);
    this.activeAmbientNodes.gains.push(gainNode);
    this.activeAmbientNodes.filters.push(filter);
  }

  /**
   * NYC: Soft wind + distant city breeze + gentle water murmur.
   */
  private playNycAtmosphere(): void {
    const ctx = getAudioContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    // 1. Soft wind buffer (filtered pink-ish noise with slow sinusoidal modulation)
    const dur = 4;
    const bufferSize = ctx.sampleRate * dur;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter approximation
      lastOut = lastOut * 0.95 + white * 0.05;
      data[i] = lastOut;
    }

    const windSource = ctx.createBufferSource();
    windSource.buffer = buffer;
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(320, now);
    windFilter.Q.setValueAtTime(1.8, now);

    // LFO for gentle wind breathing
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, now); // 5-second cycle
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(120, now);
    lfo.connect(lfoGain);
    lfoGain.connect(windFilter.frequency);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.001, now);
    windGain.gain.linearRampToValueAtTime(0.05, now + 1.5);

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.masterGain);

    windSource.start(now);
    lfo.start(now);

    this.activeAmbientNodes.sources.push(windSource);
    this.activeAmbientNodes.oscillators.push(lfo);
    this.activeAmbientNodes.gains.push(windGain, lfoGain);
    this.activeAmbientNodes.filters.push(windFilter);
  }

  /**
   * SUNSET: Calm cinematic music (warm ambient chords).
   */
  private playSunsetChords(): void {
    const ctx = getAudioContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    // Warm sunset pad chords: Fmaj7 (F3, A3, C4, E4)
    const freqs = [174.61, 220.0, 261.63, 329.63];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.03 / (idx + 1), now + 1.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);

      this.activeAmbientNodes.oscillators.push(osc);
      this.activeAmbientNodes.gains.push(gain);
      this.activeAmbientNodes.filters.push(filter);
    });
  }

  /**
   * MOON: Cosmic lunar hum and celestial harmonics.
   */
  private playLunarAmbience(): void {
    const ctx = getAudioContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(146.83, now); // D3

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 1.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);

    this.activeAmbientNodes.oscillators.push(osc);
    this.activeAmbientNodes.gains.push(gain);
    this.activeAmbientNodes.filters.push(filter);
  }

  /**
   * DARKNESS: Intimate low stillness.
   */
  private playIntimateDarkness(): void {
    const ctx = getAudioContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(55.0, now); // A1 sub

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.02, now + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);

    this.activeAmbientNodes.oscillators.push(osc);
    this.activeAmbientNodes.gains.push(gain);
  }

  /**
   * FINAL VIDEO: Silence all ambient layers and pause soundtrack completely.
   */
  private stopAllLayersForVideo(): void {
    this.fadeStopCurrentAmbient(0.3);
    this.stopSoundtrack();
  }

  /**
   * Smoothly fades out and stops current active ambient synthesizers.
   */
  private fadeStopCurrentAmbient(duration = 0.5): void {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const { oscillators, sources, gains } = this.activeAmbientNodes;

    gains.forEach((g) => {
      try {
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      } catch {
        // Ignore ramp error
      }
    });

    setTimeout(() => {
      oscillators.forEach((o) => {
        try {
          o.stop();
          o.disconnect();
        } catch {
          // Ignore already stopped
        }
      });
      sources.forEach((s) => {
        try {
          s.stop();
          s.disconnect();
        } catch {
          // Ignore
        }
      });
    }, duration * 1000 + 50);

    this.activeAmbientNodes = {
      oscillators: [],
      sources: [],
      gains: [],
      filters: [],
    };
  }

  /* ------------------------------------------------------------------------- */
  /* SOUNDTRACK AUDIO ELEMENT CONTROL                                          */
  /* ------------------------------------------------------------------------- */

  private startSoundtrack(targetVol = 0.35): void {
    if (!this.soundtrackAudio || this.isMuted) return;
    try {
      this.soundtrackAudio.volume = targetVol;
      if (this.soundtrackAudio.paused) {
        this.soundtrackAudio.play().then(() => {
          this.isSoundtrackPlaying = true;
        }).catch(() => {
          this.isSoundtrackPlaying = false;
        });
      }
    } catch {
      this.isSoundtrackPlaying = false;
    }
  }

  private stopSoundtrack(): void {
    if (!this.soundtrackAudio) return;
    try {
      this.soundtrackAudio.pause();
      this.isSoundtrackPlaying = false;
    } catch {
      // Ignore
    }
  }
}

// Global singleton instance
export const audioManager = new GlobalAudioManager();

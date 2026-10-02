// Generates a 60-second seamless stereo 16-bit 44.1kHz ambient soundscape WAV
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const DURATION = 60; // 60 seconds loop
const NUM_SAMPLES = SAMPLE_RATE * DURATION;
const NUM_CHANNELS = 2;
const BYTES_PER_SAMPLE = 2; // 16-bit
const BLOCK_ALIGN = NUM_CHANNELS * BYTES_PER_SAMPLE;
const BYTE_RATE = SAMPLE_RATE * BLOCK_ALIGN;
const DATA_SIZE = NUM_SAMPLES * BLOCK_ALIGN;

const buffer = Buffer.alloc(44 + DATA_SIZE);

// Write WAV header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + DATA_SIZE, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // PCM chunk size
buffer.writeUInt16LE(1, 20); // Audio format 1 = PCM
buffer.writeUInt16LE(NUM_CHANNELS, 22);
buffer.writeUInt32LE(SAMPLE_RATE, 24);
buffer.writeUInt32LE(BYTE_RATE, 28);
buffer.writeUInt16LE(BLOCK_ALIGN, 32);
buffer.writeUInt16LE(BYTES_PER_SAMPLE * 8, 34);
buffer.write('data', 36);
buffer.writeUInt32LE(DATA_SIZE, 40);

// Chord progression: 4 chords, 15 seconds each
// Cmaj7 -> Am7 -> Fmaj7 -> Gsus4/G
const CHORDS = [
  // Cmaj7 (C3, G3, B3, E4, G4)
  [130.81, 196.00, 246.94, 329.63, 392.00],
  // Am7 (A2, E3, G3, C4, E4)
  [110.00, 164.81, 196.00, 261.63, 329.63],
  // Fmaj7 (F2, C3, E3, A3, C4)
  [87.31, 130.81, 164.81, 220.00, 261.63],
  // G6 (G2, D3, G3, B3, E4)
  [98.00, 146.83, 196.00, 246.94, 329.63],
];

// Pentatonic high sparkle notes for occasional starlight pings
const SPARKLE_NOTES = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51];
const SPARKLE_EVENTS = [];
// Generate 24 random sparkle events across the 60s
for (let i = 0; i < 28; i++) {
  SPARKLE_EVENTS.push({
    time: (i * 2.14 + (Math.sin(i * 3.7) * 0.8 + 0.8)) % DURATION,
    freq: SPARKLE_NOTES[i % SPARKLE_NOTES.length],
    pan: Math.sin(i * 1.9) * 0.7,
  });
}

let offset = 44;
for (let i = 0; i < NUM_SAMPLES; i++) {
  const t = i / SAMPLE_RATE;
  
  // Which chord are we in?
  const chordIdx = Math.floor((t / 15) % 4);
  const nextChordIdx = (chordIdx + 1) % 4;
  const chordT = (t % 15) / 15;
  
  // Crossfade between chords over the last 3 seconds
  let blend = 0;
  if (chordT > 0.8) {
    blend = (chordT - 0.8) / 0.2;
    blend = 0.5 - 0.5 * Math.cos(blend * Math.PI); // smooth hermite
  }
  
  const currentChord = CHORDS[chordIdx];
  const nextChord = CHORDS[nextChordIdx];
  
  // Warm analog pad synthesis (sine + soft triangle + slight detune)
  let padL = 0;
  let padR = 0;
  
  // Breathing LFO
  const lfo = 0.75 + 0.25 * Math.sin(2 * Math.PI * 0.12 * t);
  
  for (let c = 0; c < currentChord.length; c++) {
    const f1 = currentChord[c];
    const f2 = nextChord[c];
    
    // Voice 1 (left-leaning detune)
    const phaseL = 2 * Math.PI * (f1 * 0.998) * t;
    const s1L = Math.sin(phaseL) * 0.6 + Math.sin(phaseL * 2) * 0.15;
    
    // Voice 2 (right-leaning detune)
    const phaseR = 2 * Math.PI * (f1 * 1.002) * t;
    const s1R = Math.sin(phaseR) * 0.6 + Math.sin(phaseR * 2) * 0.15;
    
    // Next chord voices for crossfade
    const phaseL2 = 2 * Math.PI * (f2 * 0.998) * t;
    const s2L = Math.sin(phaseL2) * 0.6 + Math.sin(phaseL2 * 2) * 0.15;
    const phaseR2 = 2 * Math.PI * (f2 * 1.002) * t;
    const s2R = Math.sin(phaseR2) * 0.6 + Math.sin(phaseR2 * 2) * 0.15;
    
    const vL = s1L * (1 - blend) + s2L * blend;
    const vR = s1R * (1 - blend) + s2R * blend;
    
    const amp = 0.08 / (c + 1);
    padL += vL * amp;
    padR += vR * amp;
  }
  
  // Add gentle high starlight pings
  let sparkleL = 0;
  let sparkleR = 0;
  for (const s of SPARKLE_EVENTS) {
    const dt = t - s.time;
    if (dt >= 0 && dt < 1.8) {
      const env = Math.exp(-dt * 3.5);
      const tone = Math.sin(2 * Math.PI * s.freq * dt) * env * 0.04;
      sparkleL += tone * (1 - s.pan) * 0.5;
      sparkleR += tone * (1 + s.pan) * 0.5;
    }
  }
  
  // Combine & apply master LFO breathing
  let finalL = (padL * lfo + sparkleL) * 0.85;
  let finalR = (padR * lfo + sparkleR) * 0.85;
  
  // Soft limiter to prevent clipping
  finalL = Math.tanh(finalL);
  finalR = Math.tanh(finalR);
  
  // Convert to 16-bit PCM integer (-32768 to 32767)
  const intL = Math.max(-32768, Math.min(32767, Math.floor(finalL * 32767)));
  const intR = Math.max(-32768, Math.min(32767, Math.floor(finalR * 32767)));
  
  buffer.writeInt16LE(intL, offset);
  buffer.writeInt16LE(intR, offset + 2);
  offset += 4;
}

const outDir = path.resolve(__dirname, '../../public/assets/music');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const wavPath = path.join(outDir, 'background.wav');
const mp3Path = path.join(outDir, 'background.mp3');

fs.writeFileSync(wavPath, buffer);
// Also copy as background.mp3 so both paths resolve
fs.copyFileSync(wavPath, mp3Path);

console.log('Successfully generated ambient soundscape:', wavPath, 'Size:', (buffer.length / 1024 / 1024).toFixed(2), 'MB');

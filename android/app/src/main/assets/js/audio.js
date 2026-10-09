/**
 * Audio Engine for Hill Climb Rush
 * Procedural Web Audio API sound synthesis (100% offline, zero external MP3 assets)
 * Soft Hill Climb Countryside Background Music (BGM) & Thrilling Nitro Rocket Boost SFX
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.musicEnabled = true;

    // Engine synth nodes
    this.engineOsc = null;
    this.engineSubOsc = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.isEngineRunning = false;

    // Rocket Boost synth nodes
    this.boostNoise = null;
    this.boostOsc = null;
    this.boostGain = null;
    this.isBoosting = false;

    // Procedural BGM Engine
    this.bgmTimer = null;
    this.bgmGain = null;
    this.isBgmPlaying = false;
    this.bgmStep = 0;
    this.bgmTempo = 118; // Catchy, soft, upbeat country tempo

    this.initAudioContext();
    this.bindUnlockEvents();
  }

  initAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass && !this.ctx) {
      this.ctx = new AudioContextClass();
    }
  }

  ensureContext() {
    if (!this.ctx) {
      this.initAudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  bindUnlockEvents() {
    const unlock = () => {
      this.ensureContext();
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('touchend', unlock);
      document.removeEventListener('mousedown', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('touchstart', unlock, { passive: true, once: true });
    document.addEventListener('touchend', unlock, { passive: true, once: true });
    document.addEventListener('mousedown', unlock, { passive: true, once: true });
    document.addEventListener('keydown', unlock, { passive: true, once: true });
  }

  // ==========================================
  // 1. PROCEDURAL BACKGROUND MUSIC (BGM)
  // Soft, catchy, cheerful Hill Climb countryside theme
  // ==========================================
  startBGM() {
    if (!this.musicEnabled || this.isBgmPlaying) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      this.isBgmPlaying = true;
      this.bgmStep = 0;

      if (!this.bgmGain) {
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(0.16, this.ctx.currentTime);
        this.bgmGain.connect(this.ctx.destination);
      } else {
        this.bgmGain.gain.setTargetAtTime(0.16, this.ctx.currentTime, 0.1);
      }

      this.scheduleBgmLoop();
    } catch (e) {
      console.warn('BGM start error:', e);
    }
  }

  scheduleBgmLoop() {
    if (!this.isBgmPlaying || !this.musicEnabled || !this.ctx) return;

    // 16-step musical sequence (4/4 time, 4 bars total)
    // Melody notes (soft whistling / acoustic glockenspiel)
    // Scale: C Major / A Minor (C4=261.63, D4=293.66, E4=329.63, G4=392.00, A4=440.00, C5=523.25, D5=587.33, E5=659.25, G5=783.99)
    const melodySeq = [
      // Bar 1 (C Major cheerful bounce)
      { note: 523.25, dur: 0.18, type: 'sine' },      // C5
      { note: 392.00, dur: 0.14, type: 'sine' },      // G4
      { note: 440.00, dur: 0.16, type: 'triangle' },  // A4
      { note: 523.25, dur: 0.22, type: 'sine' },      // C5
      // Bar 2 (F / G walkup)
      { note: 587.33, dur: 0.18, type: 'sine' },      // D5
      { note: 523.25, dur: 0.14, type: 'sine' },      // C5
      { note: 440.00, dur: 0.16, type: 'triangle' },  // A4
      { note: 392.00, dur: 0.26, type: 'sine' },      // G4
      // Bar 3 (High cheerful arc)
      { note: 659.25, dur: 0.18, type: 'sine' },      // E5
      { note: 587.33, dur: 0.14, type: 'sine' },      // D5
      { note: 523.25, dur: 0.16, type: 'sine' },      // C5
      { note: 440.00, dur: 0.18, type: 'triangle' },  // A4
      // Bar 4 (Playful cadence turnaround)
      { note: 392.00, dur: 0.14, type: 'triangle' },  // G4
      { note: 440.00, dur: 0.14, type: 'triangle' },  // A4
      { note: 587.33, dur: 0.18, type: 'sine' },      // D5
      { note: 523.25, dur: 0.32, type: 'sine' }       // C5
    ];

    // Bouncy acoustic bassline (C2=65.41, G2=98.00, F2=87.31, A2=110.00)
    const bassSeq = [
      65.41, 130.81, 98.00, 130.81,  // C2 - C3 - G2 - C3
      87.31, 174.61, 87.31, 130.81,  // F2 - F3 - F2 - C3
      110.00, 220.00, 98.00, 196.00, // A2 - A3 - G2 - G3
      98.00, 146.83, 65.41, 130.81   // G2 - D3 - C2 - C3
    ];

    // Chords (soft warm pad stabs on off-beats)
    const chords = [
      [261.63, 329.63, 392.00], // C maj
      [261.63, 329.63, 392.00],
      [220.00, 261.63, 349.23], // F maj
      [220.00, 261.63, 349.23],
      [220.00, 261.63, 329.63], // A min
      [220.00, 261.63, 329.63],
      [196.00, 246.94, 293.66], // G maj
      [196.00, 246.94, 293.66]
    ];

    const stepTime = (60 / this.bgmTempo) * 0.5; // Eighth note step (~0.254s)
    const idx = this.bgmStep % 16;
    const now = this.ctx.currentTime;

    // 1. Play Melody Note
    const m = melodySeq[idx];
    if (m && m.note) {
      this.playSynthNote(m.note, m.dur, m.type || 'sine', 0.12, now);
    }

    // 2. Play Bouncy Bass Note
    const bNote = bassSeq[idx];
    if (bNote) {
      this.playBassNote(bNote, 0.18, now);
    }

    // 3. Play Chord Stabs on offbeats
    if (idx % 2 === 1) {
      const chordIdx = Math.floor(idx / 2);
      const chord = chords[chordIdx];
      if (chord) {
        this.playChordStab(chord, 0.15, now);
      }
    }

    // 4. Soft Percussion Brush / Shaker
    this.playSoftPercussion(idx, now);

    this.bgmStep++;

    // Schedule next step
    this.bgmTimer = setTimeout(() => {
      this.scheduleBgmLoop();
    }, stepTime * 1000);
  }

  playSynthNote(freq, dur, type = 'sine', vol = 0.12, startTime) {
    if (!this.ctx || !this.bgmGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, startTime);
      filter.Q.setValueAtTime(1.5, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(startTime);
      osc.stop(startTime + dur + 0.05);
    } catch (e) {}
  }

  playBassNote(freq, dur, startTime) {
    if (!this.ctx || !this.bgmGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(startTime);
      osc.stop(startTime + dur + 0.05);
    } catch (e) {}
  }

  playChordStab(notes, dur, startTime) {
    if (!this.ctx || !this.bgmGain) return;
    try {
      notes.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.045, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.04);
      });
    } catch (e) {}
  }

  playSoftPercussion(stepIdx, startTime) {
    if (!this.ctx || !this.bgmGain) return;
    try {
      // Soft brush / shaker noise
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(stepIdx % 4 === 2 ? 3800 : 6200, startTime);
      filter.Q.setValueAtTime(3.0, startTime);

      const gain = this.ctx.createGain();
      const vol = stepIdx % 4 === 2 ? 0.06 : 0.035; // Snare brush accent on beats 2 and 4
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.045);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      noise.start(startTime);
      noise.stop(startTime + 0.05);
    } catch (e) {}
  }

  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.bgmGain && this.ctx) {
      try {
        this.bgmGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
      } catch (e) {}
    }
  }

  pauseBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  resumeBGM() {
    if (this.musicEnabled && !this.isBgmPlaying) {
      this.startBGM();
    }
  }

  // ==========================================
  // 2. NITRO ROCKET BOOST SOUND EFFECT
  // Powerful thruster roar + high frequency jet stream
  // ==========================================
  startBoost() {
    if (!this.sfxEnabled || this.isBoosting || !this.ctx) return;
    this.ensureContext();

    try {
      const now = this.ctx.currentTime;

      // Rocket whoosh noise
      const bufferSize = this.ctx.sampleRate * 1.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      this.boostNoise = this.ctx.createBufferSource();
      this.boostNoise.buffer = buffer;
      this.boostNoise.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(800, now);
      noiseFilter.frequency.linearRampToValueAtTime(1400, now + 0.3);
      noiseFilter.Q.setValueAtTime(2.0, now);

      // Rocket sub-oscillator for raw thruster power
      this.boostOsc = this.ctx.createOscillator();
      this.boostOsc.type = 'sawtooth';
      this.boostOsc.frequency.setValueAtTime(95, now);
      this.boostOsc.frequency.linearRampToValueAtTime(160, now + 0.4);

      const oscFilter = this.ctx.createBiquadFilter();
      oscFilter.type = 'lowpass';
      oscFilter.frequency.setValueAtTime(320, now);

      this.boostGain = this.ctx.createGain();
      this.boostGain.gain.setValueAtTime(0.01, now);
      this.boostGain.gain.linearRampToValueAtTime(0.25, now + 0.08);

      this.boostNoise.connect(noiseFilter);
      noiseFilter.connect(this.boostGain);

      this.boostOsc.connect(oscFilter);
      oscFilter.connect(this.boostGain);

      this.boostGain.connect(this.ctx.destination);

      this.boostNoise.start(now);
      this.boostOsc.start(now);
      this.isBoosting = true;
    } catch (e) {
      console.warn('Boost sound start failed:', e);
    }
  }

  stopBoost() {
    if (!this.isBoosting) return;
    try {
      const now = this.ctx ? this.ctx.currentTime : 0;
      if (this.boostGain && this.ctx) {
        this.boostGain.gain.setTargetAtTime(0.001, now, 0.06);
      }
      setTimeout(() => {
        if (this.boostNoise) {
          try { this.boostNoise.stop(); this.boostNoise.disconnect(); } catch (e) {}
          this.boostNoise = null;
        }
        if (this.boostOsc) {
          try { this.boostOsc.stop(); this.boostOsc.disconnect(); } catch (e) {}
          this.boostOsc = null;
        }
        this.isBoosting = false;
      }, 70);
    } catch (e) {
      this.isBoosting = false;
    }
  }

  // ==========================================
  // 3. ENGINE SOUND & VEHICLE AUDIO
  // ==========================================
  startEngine() {
    if (!this.sfxEnabled || this.isEngineRunning || !this.ctx) return;
    this.ensureContext();

    try {
      const now = this.ctx.currentTime;

      // Engine oscillator 1: Sawtooth for rich engine purr
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(55, now); // Idle rumble (~55Hz)

      // Sub oscillator 2: Triangle for deep chassis vibration
      this.engineSubOsc = this.ctx.createOscillator();
      this.engineSubOsc.type = 'triangle';
      this.engineSubOsc.frequency.setValueAtTime(27.5, now);

      // Filter: Low-pass to shape harsh high frequencies
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(320, now);
      this.engineFilter.Q.setValueAtTime(3, now);

      // Engine gain
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.08, now);

      // Connect
      this.engineOsc.connect(this.engineFilter);
      this.engineSubOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start(now);
      this.engineSubOsc.start(now);
      this.isEngineRunning = true;
    } catch (e) {
      console.warn('Audio engine start failed:', e);
    }
  }

  stopEngine() {
    if (!this.isEngineRunning) return;
    try {
      const now = this.ctx ? this.ctx.currentTime : 0;
      if (this.engineGain && this.ctx) {
        this.engineGain.gain.setTargetAtTime(0, now, 0.05);
      }
      setTimeout(() => {
        if (this.engineOsc) {
          try { this.engineOsc.stop(); this.engineOsc.disconnect(); } catch (e) {}
          this.engineOsc = null;
        }
        if (this.engineSubOsc) {
          try { this.engineSubOsc.stop(); this.engineSubOsc.disconnect(); } catch (e) {}
          this.engineSubOsc = null;
        }
        this.isEngineRunning = false;
      }, 80);
    } catch (e) {
      this.isEngineRunning = false;
    }
  }

  updateEngine(speed, throttle, maxSpeed = 30) {
    if (!this.isEngineRunning || !this.engineOsc || !this.ctx) return;

    const normSpeed = Math.min(Math.abs(speed) / maxSpeed, 1.2);
    const targetFreq = 50 + (normSpeed * 110) + (throttle ? 70 : 0);
    const targetFilter = 280 + (normSpeed * 600) + (throttle ? 400 : 0);
    const targetGain = this.sfxEnabled ? (0.05 + (normSpeed * 0.08) + (throttle ? 0.07 : 0)) : 0;

    const now = this.ctx.currentTime;
    this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.06);
    if (this.engineSubOsc) {
      this.engineSubOsc.frequency.setTargetAtTime(targetFreq * 0.5, now, 0.06);
    }
    if (this.engineFilter) {
      this.engineFilter.frequency.setTargetAtTime(targetFilter, now, 0.06);
    }
    if (this.engineGain) {
      this.engineGain.gain.setTargetAtTime(targetGain, now, 0.06);
    }
  }

  playCoin() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  playGem() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    try {
      const now = this.ctx.currentTime;
      const notes = [587.33, 880, 1174.66, 1760]; // D5, A5, D6, A6 sparkle
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.12, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.4);
      });
    } catch (e) {}
  }

  playFuelRefill() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch (e) {}
  }

  playFuelLow() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(750, now);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  playCrash() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.46);

      // Noise burst for crunch
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(800, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
    } catch (e) {}
  }

  playFanfare() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 triumph
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.18, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.3);
      });
    } catch (e) {}
  }

  setSfxEnabled(val) {
    this.sfxEnabled = val;
    if (!val) {
      this.stopEngine();
      this.stopBoost();
    }
  }

  setMusicEnabled(val) {
    this.musicEnabled = val;
    if (!val) {
      this.stopBGM();
    } else if (this.isEngineRunning) {
      this.startBGM();
    }
  }
}

// Global audio singleton
const soundEngine = new SoundEngine();

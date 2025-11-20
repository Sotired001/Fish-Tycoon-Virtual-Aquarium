import { Biome } from '../types';

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    // We defer initialization until first interaction
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.3; // Master volume

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.connect(this.masterGain);
      this.ambientGain.gain.value = 0.2; // Ambient volume

      this.isInitialized = true;
      console.log('Audio initialized');
    } catch (e) {
      console.error('Web Audio API not supported', e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.3, this.ctx!.currentTime, 0.1);
    }
  }

  playSFX(type: 'COIN' | 'BUBBLE' | 'EAT' | 'UI_CLICK' | 'SPLASH' | 'SELL') {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    switch (type) {
      case 'COIN':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(1800, t + 0.1);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;

      case 'BUBBLE':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.linearRampToValueAtTime(800, t + 0.1);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;

      case 'EAT':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;

      case 'UI_CLICK':
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, t);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;

      case 'SPLASH':
        // Noise buffer for splash would be better, but let's use low sine sweep for now
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.linearRampToValueAtTime(50, t + 0.3);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;

      case 'SELL':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        // Double ping
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(this.masterGain);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1200, t + 0.1);
        osc2.frequency.exponentialRampToValueAtTime(1600, t + 0.2);
        gain2.gain.setValueAtTime(0.3, t + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc2.start(t + 0.1);
        osc2.stop(t + 0.3);
        break;
    }
  }

  updateAmbient(biomeId: string) {
    if (!this.ctx || !this.ambientGain || this.isMuted) return;

    // Stop previous ambient
    this.ambientOscillators.forEach(o => {
      try { o.stop(); } catch(e) {}
    });
    this.ambientOscillators = [];

    const t = this.ctx.currentTime;

    // Basic Ocean Drone (Pink Noise approximation using multiple oscillators)
    // Since generating real noise buffers is verbose, we'll use low frequency FM synthesis

    const carrier = this.ctx.createOscillator();
    const mod = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    carrier.type = 'sine';
    carrier.frequency.value = 50; // Low rumble

    mod.type = 'sawtooth';
    mod.frequency.value = 0.2; // Slow wave

    const modGain = this.ctx.createGain();
    modGain.gain.value = 20;

    mod.connect(modGain);
    modGain.connect(carrier.frequency);

    carrier.connect(gain);
    gain.connect(this.ambientGain);

    gain.gain.value = 0.1;

    carrier.start(t);
    mod.start(t);

    this.ambientOscillators.push(carrier, mod);
  }
}

export const soundManager = new SoundManager();

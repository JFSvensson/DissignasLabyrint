/**
 * Lightweight sound effects using the Web Audio API.
 * Generates tones procedurally — no audio files needed.
 */
export class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private musicGain: GainNode | null = null;
  private musicOscillators: OscillatorNode[] = [];
  private musicPlaying: boolean = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stopMusic();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public isMusicPlaying(): boolean {
    return this.musicPlaying;
  }

  /** Start ambient background music loop */
  public startMusic(): void {
    if (!this.enabled || this.musicPlaying) return;

    try {
      const ctx = this.getContext();
      this.musicGain = ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.06, ctx.currentTime);
      this.musicGain.connect(ctx.destination);

      // Simple ambient chord: C3, E3, G3 with slow shimmer
      const frequencies = [130.81, 164.81, 196.0];
      this.musicOscillators = frequencies.map(freq => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.connect(this.musicGain!);
        osc.start();
        return osc;
      });

      this.musicPlaying = true;
    } catch {
      // Silently ignore audio errors
    }
  }

  /** Stop background music */
  public stopMusic(): void {
    if (!this.musicPlaying) return;
    try {
      this.musicOscillators.forEach(osc => {
        try { osc.stop(); } catch { /* already stopped */ }
      });
      this.musicOscillators = [];
      if (this.musicGain) {
        this.musicGain.disconnect();
        this.musicGain = null;
      }
    } catch {
      // Silently ignore
    }
    this.musicPlaying = false;
  }

  /** Toggle music on/off */
  public toggleMusic(): void {
    if (this.musicPlaying) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  /** Short rising tone for correct answer */
  public playCorrect(): void {
    this.playTone(523.25, 0.12, 'sine');   // C5
    this.playTone(659.25, 0.12, 'sine', 0.12); // E5
  }

  /** Short descending tone for wrong answer */
  public playIncorrect(): void {
    this.playTone(330, 0.15, 'square', 0, 0.15);
    this.playTone(260, 0.2, 'square', 0.15, 0.12);
  }

  /** Fanfare for completing the maze */
  public playVictory(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      this.playTone(freq, 0.2, 'sine', i * 0.15, 0.25);
    });
  }

  /** Short click for UI interaction */
  public playMove(): void {
    this.playTone(440, 0.05, 'sine', 0, 0.08);
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    delay: number = 0,
    volume: number = 0.2
  ): void {
    if (!this.enabled) return;

    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime + delay);
      oscillator.stop(ctx.currentTime + delay + duration + 0.05);
    } catch {
      // Silently ignore audio errors (e.g. autoplay policy)
    }
  }
}

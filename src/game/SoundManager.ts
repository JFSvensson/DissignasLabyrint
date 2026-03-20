/**
 * Lightweight sound effects using the Web Audio API.
 * Generates tones procedurally — no audio files needed.
 */
export class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
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

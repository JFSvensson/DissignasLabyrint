export interface IAudioService {
  setEnabled(enabled: boolean): void;
  isEnabled(): boolean;
  playCorrect(): void;
  playIncorrect(): void;
  playVictory(): void;
  playMove(): void;
  startMusic(): void;
  stopMusic(): void;
  toggleMusic(): void;
  isMusicPlaying(): boolean;
}

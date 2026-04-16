export class GameTimer {
  private remainingSeconds: number;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private display: HTMLDivElement;
  private onTimeUp: () => void;

  constructor(seconds: number, onTimeUp: () => void) {
    this.remainingSeconds = seconds;
    this.onTimeUp = onTimeUp;
    this.display = this.createDisplay();
  }

  private createDisplay(): HTMLDivElement {
    const container = document.createElement('div');
    container.id = 'timer-display';
    container.className = 'game-timer';
    container.textContent = this.formatTime(this.remainingSeconds);
    return container;
  }

  public getElement(): HTMLDivElement {
    return this.display;
  }

  public start(): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      this.remainingSeconds--;
      this.display.textContent = this.formatTime(this.remainingSeconds);

      if (this.remainingSeconds <= 30) {
        this.display.className = 'game-timer game-timer--danger';
        this.display.style.animation = 'none';
        // Trigger reflow for pulse effect
        void this.display.offsetWidth;
      } else if (this.remainingSeconds <= 60) {
        this.display.className = 'game-timer game-timer--warning';
      }

      if (this.remainingSeconds <= 0) {
        this.stop();
        this.onTimeUp();
      }
    }, 1000);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public getRemainingSeconds(): number {
    return this.remainingSeconds;
  }

  public addTime(seconds: number): void {
    this.remainingSeconds += seconds;
    this.display.textContent = this.formatTime(this.remainingSeconds);
    if (this.remainingSeconds > 60) {
      this.display.className = 'game-timer';
    } else if (this.remainingSeconds > 30) {
      this.display.className = 'game-timer game-timer--warning';
    }
  }

  private formatTime(seconds: number): string {
    const m = Math.floor(Math.max(0, seconds) / 60);
    const s = Math.max(0, seconds) % 60;
    return `⏱ ${m}:${s.toString().padStart(2, '0')}`;
  }
}

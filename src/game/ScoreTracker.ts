export class ScoreTracker {
  private score: number = 0;
  private attempts: number = 0;
  private correctAnswers: number = 0;
  private incorrectAnswers: number = 0;

  public recordAnswer(correct: boolean): void {
    this.attempts++;
    if (correct) {
      this.correctAnswers++;
      this.score += 10; // 10 points per correct answer
    } else {
      this.incorrectAnswers++;
    }
  }

  public getScore(): number {
    return this.score;
  }

  public getAttempts(): number {
    return this.attempts;
  }

  public getCorrectAnswers(): number {
    return this.correctAnswers;
  }

  public getIncorrectAnswers(): number {
    return this.incorrectAnswers;
  }

  public getAccuracy(): number {
    if (this.attempts === 0) return 0;
    return Math.round((this.correctAnswers / this.attempts) * 100);
  }

  public reset(): void {
    this.score = 0;
    this.attempts = 0;
    this.correctAnswers = 0;
    this.incorrectAnswers = 0;
  }
}

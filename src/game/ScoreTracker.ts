export class ScoreTracker {
  private score: number = 0;
  private attempts: number = 0;
  private correctAnswers: number = 0;
  private incorrectAnswers: number = 0;
  private streak: number = 0;
  private bestStreak: number = 0;

  public recordAnswer(correct: boolean): void {
    this.attempts++;
    if (correct) {
      this.correctAnswers++;
      this.streak++;
      if (this.streak > this.bestStreak) {
        this.bestStreak = this.streak;
      }
      // Base 10 points + streak bonus (5 extra per consecutive correct after 2)
      const streakBonus = this.streak > 2 ? (this.streak - 2) * 5 : 0;
      this.score += 10 + streakBonus;
    } else {
      this.incorrectAnswers++;
      this.streak = 0;
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

  public getStreak(): number {
    return this.streak;
  }

  public getBestStreak(): number {
    return this.bestStreak;
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
    this.streak = 0;
    this.bestStreak = 0;
  }
}

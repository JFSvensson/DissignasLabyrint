import { MathDifficulty } from './GameConfig';

export interface GameResult {
  level: number;
  score: number;
  accuracy: number;
  bestStreak: number;
  mazeSize: number;
  difficulty: MathDifficulty;
  timeRemaining?: number;
  starCount?: number;
  date: string;
}

export interface GameStats {
  highScores: GameResult[];
  highestLevel: number;
  totalGamesPlayed: number;
  totalGamesWon: number;
  bestStars: Record<number, number>;
}

const STORAGE_KEY = 'dissignas-labyrint-stats';
const MAX_HIGH_SCORES = 10;

export class StatsManager {
  private static instance: StatsManager;

  public static getInstance(): StatsManager {
    if (!StatsManager.instance) {
      StatsManager.instance = new StatsManager();
    }
    return StatsManager.instance;
  }

  public getStats(): GameStats {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (this.isValidStats(data)) {
          return data;
        }
      }
    } catch {
      // Corrupt data — fall through to default
    }
    return this.createDefaultStats();
  }

  public saveGameResult(result: GameResult): boolean {
    const stats = this.getStats();
    stats.totalGamesPlayed++;
    stats.totalGamesWon++;

    if (result.level > stats.highestLevel) {
      stats.highestLevel = result.level;
    }

    const isNewHighScore = stats.highScores.length < MAX_HIGH_SCORES ||
      result.score > stats.highScores[stats.highScores.length - 1].score;

    stats.highScores.push(result);
    stats.highScores.sort((a, b) => b.score - a.score);
    stats.highScores = stats.highScores.slice(0, MAX_HIGH_SCORES);

    this.saveStats(stats);
    return isNewHighScore;
  }

  public getHighestLevel(): number {
    return this.getStats().highestLevel;
  }

  public getHighScores(): GameResult[] {
    return this.getStats().highScores;
  }

  public clearStats(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  public saveBestStars(level: number, stars: number): void {
    const stats = this.getStats();
    if (!stats.bestStars) stats.bestStars = {};
    if (stars > (stats.bestStars[level] ?? 0)) {
      stats.bestStars[level] = stars;
      this.saveStats(stats);
    }
  }

  public getBestStars(level: number): number {
    const stats = this.getStats();
    return stats.bestStars?.[level] ?? 0;
  }

  private saveStats(stats: GameStats): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }

  private createDefaultStats(): GameStats {
    return {
      highScores: [],
      highestLevel: 0,
      totalGamesPlayed: 0,
      totalGamesWon: 0,
      bestStars: {},
    };
  }

  private isValidStats(data: unknown): data is GameStats {
    if (typeof data !== 'object' || data === null) return false;
    const d = data as Record<string, unknown>;
    return Array.isArray(d.highScores) &&
      typeof d.highestLevel === 'number' &&
      typeof d.totalGamesPlayed === 'number' &&
      typeof d.totalGamesWon === 'number';
  }
}

export const stats = StatsManager.getInstance();

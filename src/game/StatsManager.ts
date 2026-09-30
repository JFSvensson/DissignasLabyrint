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

export interface StatsStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function createBrowserStorage(): StatsStorage {
  return {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: (key) => localStorage.removeItem(key),
  };
}

export class StatsManager {
  private static instance: StatsManager;
  private readonly storage: StatsStorage;

  constructor(storage: StatsStorage = createBrowserStorage()) {
    this.storage = storage;
  }

  public static getInstance(): StatsManager {
    if (!StatsManager.instance) {
      StatsManager.instance = new StatsManager(createBrowserStorage());
    }
    return StatsManager.instance;
  }

  public getStats(): GameStats {
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (this.isValidStats(data)) {
          return this.normalizeStats(data);
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
    this.storage.removeItem(STORAGE_KEY);
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
    this.storage.setItem(STORAGE_KEY, JSON.stringify(stats));
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
      d.highScores.every(result => this.isValidGameResult(result)) &&
      this.isNonNegativeFiniteNumber(d.highestLevel) &&
      this.isNonNegativeFiniteNumber(d.totalGamesPlayed) &&
      this.isNonNegativeFiniteNumber(d.totalGamesWon) &&
      (d.bestStars === undefined || this.isValidBestStars(d.bestStars));
  }

  private isValidGameResult(result: unknown): result is GameResult {
    if (typeof result !== 'object' || result === null) return false;
    const value = result as Record<string, unknown>;
    return this.isNonNegativeFiniteNumber(value.level) &&
      typeof value.score === 'number' && Number.isFinite(value.score) &&
      typeof value.accuracy === 'number' && Number.isFinite(value.accuracy) &&
      this.isNonNegativeFiniteNumber(value.bestStreak) &&
      this.isNonNegativeFiniteNumber(value.mazeSize) &&
      typeof value.difficulty === 'string' &&
      typeof value.date === 'string';
  }

  private isValidBestStars(value: unknown): value is Record<number, number> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
    return Object.values(value).every(stars => this.isNonNegativeFiniteNumber(stars));
  }

  private isNonNegativeFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
  }

  private normalizeStats(data: GameStats): GameStats {
    return {
      ...data,
      bestStars: data.bestStars ?? {},
    };
  }
}

export const stats = StatsManager.getInstance();

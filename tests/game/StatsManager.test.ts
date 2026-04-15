import { StatsManager, GameResult } from '../../src/game/StatsManager';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

function createResult(overrides: Partial<GameResult> = {}): GameResult {
  return {
    level: 1,
    score: 100,
    accuracy: 80,
    bestStreak: 3,
    mazeSize: 9,
    difficulty: 'medium',
    date: new Date().toISOString(),
    ...overrides,
  };
}

describe('StatsManager', () => {
  let manager: StatsManager;

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    // Create fresh instance by accessing getInstance after clearing singleton
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (StatsManager as any).instance = undefined;
    manager = StatsManager.getInstance();
  });

  describe('singleton', () => {
    it('should return the same instance', () => {
      const a = StatsManager.getInstance();
      const b = StatsManager.getInstance();
      expect(a).toBe(b);
    });
  });

  describe('getStats', () => {
    it('should return default stats when empty', () => {
      const stats = manager.getStats();
      expect(stats.highScores).toEqual([]);
      expect(stats.highestLevel).toBe(0);
      expect(stats.totalGamesPlayed).toBe(0);
      expect(stats.totalGamesWon).toBe(0);
    });

    it('should return default stats on corrupt data', () => {
      localStorageMock.setItem('dissignas-labyrint-stats', 'not-json');
      const stats = manager.getStats();
      expect(stats.highScores).toEqual([]);
    });

    it('should return default stats on invalid structure', () => {
      localStorageMock.setItem('dissignas-labyrint-stats', JSON.stringify({ foo: 'bar' }));
      const stats = manager.getStats();
      expect(stats.highScores).toEqual([]);
    });
  });

  describe('saveGameResult', () => {
    it('should save a result and increment counters', () => {
      const result = createResult();
      manager.saveGameResult(result);
      const stats = manager.getStats();
      expect(stats.totalGamesPlayed).toBe(1);
      expect(stats.totalGamesWon).toBe(1);
      expect(stats.highScores).toHaveLength(1);
      expect(stats.highScores[0].score).toBe(100);
    });

    it('should update highestLevel', () => {
      manager.saveGameResult(createResult({ level: 3 }));
      expect(manager.getHighestLevel()).toBe(3);

      manager.saveGameResult(createResult({ level: 1 }));
      expect(manager.getHighestLevel()).toBe(3); // Should not decrease
    });

    it('should return true for new high score', () => {
      const isNew = manager.saveGameResult(createResult({ score: 200 }));
      expect(isNew).toBe(true);
    });

    it('should sort high scores descending', () => {
      manager.saveGameResult(createResult({ score: 50 }));
      manager.saveGameResult(createResult({ score: 200 }));
      manager.saveGameResult(createResult({ score: 100 }));

      const scores = manager.getHighScores();
      expect(scores[0].score).toBe(200);
      expect(scores[1].score).toBe(100);
      expect(scores[2].score).toBe(50);
    });

    it('should limit to 10 high scores', () => {
      for (let i = 0; i < 15; i++) {
        manager.saveGameResult(createResult({ score: i * 10 }));
      }
      expect(manager.getHighScores()).toHaveLength(10);
    });

    it('should return false when score is below top 10', () => {
      for (let i = 0; i < 10; i++) {
        manager.saveGameResult(createResult({ score: 1000 + i * 10 }));
      }
      const isNew = manager.saveGameResult(createResult({ score: 5 }));
      expect(isNew).toBe(false);
    });

    it('should persist to localStorage', () => {
      manager.saveGameResult(createResult());
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'dissignas-labyrint-stats',
        expect.any(String)
      );
    });
  });

  describe('getHighScores', () => {
    it('should return empty array initially', () => {
      expect(manager.getHighScores()).toEqual([]);
    });
  });

  describe('getHighestLevel', () => {
    it('should return 0 initially', () => {
      expect(manager.getHighestLevel()).toBe(0);
    });
  });

  describe('clearStats', () => {
    it('should remove data from localStorage', () => {
      manager.saveGameResult(createResult());
      manager.clearStats();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('dissignas-labyrint-stats');
      expect(manager.getStats().highScores).toEqual([]);
    });
  });

  describe('timeRemaining', () => {
    it('should store timeRemaining in result', () => {
      manager.saveGameResult(createResult({ timeRemaining: 45 }));
      const scores = manager.getHighScores();
      expect(scores[0].timeRemaining).toBe(45);
    });
  });
});

import { GameConfig, MathDifficulty, LEVELS, DEFAULT_CONFIG, mathDifficultyToBase, LevelDefinition } from '../../src/game/GameConfig';

describe('GameConfig', () => {
  describe('LEVELS', () => {
    it('should have at least 5 levels', () => {
      expect(LEVELS.length).toBeGreaterThanOrEqual(5);
    });

    it('should have increasing or equal maze sizes', () => {
      for (let i = 1; i < LEVELS.length; i++) {
        expect(LEVELS[i].mazeSize).toBeGreaterThanOrEqual(LEVELS[i - 1].mazeSize);
      }
    });

    it('should have odd maze sizes', () => {
      LEVELS.forEach(level => {
        expect(level.mazeSize % 2).toBe(1);
      });
    });

    it('should have valid math difficulties', () => {
      const validDifficulties: MathDifficulty[] = ['easy', 'medium', 'hard'];
      LEVELS.forEach(level => {
        expect(validDifficulties).toContain(level.mathDifficulty);
      });
    });

    it('should have non-negative timer seconds', () => {
      LEVELS.forEach(level => {
        expect(level.timerSeconds).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have sequential level numbers starting from 1', () => {
      LEVELS.forEach((level, idx) => {
        expect(level.level).toBe(idx + 1);
      });
    });
  });

  describe('DEFAULT_CONFIG', () => {
    it('should have a valid maze size', () => {
      expect(DEFAULT_CONFIG.mazeSize).toBeGreaterThanOrEqual(5);
      expect(DEFAULT_CONFIG.mazeSize % 2).toBe(1);
    });

    it('should have timer disabled by default', () => {
      expect(DEFAULT_CONFIG.timerEnabled).toBe(false);
      expect(DEFAULT_CONFIG.timerSeconds).toBe(0);
    });

    it('should have medium difficulty by default', () => {
      expect(DEFAULT_CONFIG.mathDifficulty).toBe('medium');
    });
  });

  describe('mathDifficultyToBase', () => {
    it('should return 0 for easy', () => {
      expect(mathDifficultyToBase('easy')).toBe(0);
    });

    it('should return 1 for medium', () => {
      expect(mathDifficultyToBase('medium')).toBe(1);
    });

    it('should return 2 for hard', () => {
      expect(mathDifficultyToBase('hard')).toBe(2);
    });
  });
});

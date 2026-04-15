import { QuestionGenerator } from '../../src/game/QuestionGenerator';

describe('QuestionGenerator', () => {
  const generator = new QuestionGenerator();

  describe('getDifficulty', () => {
    it('should return 1 for positions near start (1,1)', () => {
      expect(generator.getDifficulty({ x: 1, z: 1 }, 9, 9)).toBe(1);
      expect(generator.getDifficulty({ x: 2, z: 1 }, 9, 9)).toBe(1);
    });

    it('should return 2 for positions in the middle', () => {
      expect(generator.getDifficulty({ x: 4, z: 4 }, 9, 9)).toBe(2);
    });

    it('should return 3 for positions near the goal', () => {
      expect(generator.getDifficulty({ x: 7, z: 7 }, 9, 9)).toBe(3);
    });

    it('should scale with maze size', () => {
      expect(generator.getDifficulty({ x: 2, z: 2 }, 21, 21)).toBe(1);
      expect(generator.getDifficulty({ x: 19, z: 19 }, 21, 21)).toBe(3);
    });
  });

  describe('getMaxForDifficulty', () => {
    it('should return 10 for difficulty 1', () => {
      expect(generator.getMaxForDifficulty(1)).toBe(10);
    });

    it('should return 20 for difficulty 2', () => {
      expect(generator.getMaxForDifficulty(2)).toBe(20);
    });

    it('should return 50 for difficulty 3', () => {
      expect(generator.getMaxForDifficulty(3)).toBe(50);
    });

    it('should return 10 for unknown difficulty', () => {
      expect(generator.getMaxForDifficulty(0)).toBe(10);
      expect(generator.getMaxForDifficulty(99)).toBe(10);
    });
  });

  describe('getOperationsForDifficulty', () => {
    it('should return only addition and subtraction for difficulty 1', () => {
      const ops = generator.getOperationsForDifficulty(1);
      expect(ops.length).toBe(2);
      const names = ops.map(o => o.getName());
      expect(names).toContain('math.operations.addition');
      expect(names).toContain('math.operations.subtraction');
    });

    it('should return all four operations for difficulty 2', () => {
      const ops = generator.getOperationsForDifficulty(2);
      expect(ops.length).toBe(4);
      const names = ops.map(o => o.getName());
      expect(names).toContain('math.operations.addition');
      expect(names).toContain('math.operations.subtraction');
      expect(names).toContain('math.operations.multiplication');
      expect(names).toContain('math.operations.division');
    });

    it('should return all six operations for difficulty 3', () => {
      const ops = generator.getOperationsForDifficulty(3);
      expect(ops.length).toBe(6);
      const names = ops.map(o => o.getName());
      expect(names).toContain('math.operations.multiplication');
      expect(names).toContain('math.operations.division');
      expect(names).toContain('math.operations.modulo');
      expect(names).toContain('math.operations.power');
    });
  });

  describe('getDifficulty with baseDifficulty', () => {
    it('should increase difficulty near start with baseDifficulty=1', () => {
      const base0 = generator.getDifficulty({ x: 1, z: 1 }, 9, 9, 0);
      const base1 = generator.getDifficulty({ x: 1, z: 1 }, 9, 9, 1);
      expect(base1).toBeGreaterThan(base0);
    });

    it('should cap difficulty at 3', () => {
      expect(generator.getDifficulty({ x: 7, z: 7 }, 9, 9, 2)).toBe(3);
    });

    it('should shift mid-range positions up', () => {
      expect(generator.getDifficulty({ x: 4, z: 4 }, 9, 9, 0)).toBe(2);
      expect(generator.getDifficulty({ x: 4, z: 4 }, 9, 9, 1)).toBe(3);
    });
  });

  describe('constructor injection', () => {
    it('should use custom operations when provided', () => {
      const { Addition } = require('../../src/operations/Addition');
      const customGen = new QuestionGenerator([new Addition()]);
      const ops = customGen.getOperationsForDifficulty(1);
      expect(ops.length).toBe(1);
      expect(ops[0].getName()).toBe('math.operations.addition');
    });
  });
});

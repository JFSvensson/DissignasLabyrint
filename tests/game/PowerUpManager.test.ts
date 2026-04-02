import { PowerUpManager } from '../../src/game/PowerUpManager';

describe('PowerUpManager', () => {
  let manager: PowerUpManager;

  // Simple 5x5 maze: 0 = open, 1 = wall
  const mazeLayout = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ];

  beforeEach(() => {
    manager = new PowerUpManager();
  });

  describe('placePowerUps', () => {
    test('should place requested number of power-ups', () => {
      manager.placePowerUps(mazeLayout, 3);
      expect(manager.getPowerUps().length).toBe(3);
    });

    test('should not place more than available open cells', () => {
      // 5x5 maze has 8 open cells, minus start(1,1) and goal(3,3) = 6
      manager.placePowerUps(mazeLayout, 100);
      expect(manager.getPowerUps().length).toBeLessThanOrEqual(6);
    });

    test('should not place on start or goal positions', () => {
      manager.placePowerUps(mazeLayout, 10);
      for (const pu of manager.getPowerUps()) {
        expect(pu.position.x === 1 && pu.position.z === 1).toBe(false);
        expect(pu.position.x === 3 && pu.position.z === 3).toBe(false);
      }
    });

    test('should not place on walls', () => {
      manager.placePowerUps(mazeLayout, 10);
      for (const pu of manager.getPowerUps()) {
        expect(mazeLayout[pu.position.x][pu.position.z]).toBe(0);
      }
    });

    test('all power-ups should start uncollected', () => {
      manager.placePowerUps(mazeLayout, 3);
      for (const pu of manager.getPowerUps()) {
        expect(pu.collected).toBe(false);
      }
    });

    test('should cycle through power-up types', () => {
      manager.placePowerUps(mazeLayout, 3);
      const types = manager.getPowerUps().map(p => p.type);
      expect(types).toContain('hint');
      expect(types).toContain('timeBonus');
      expect(types).toContain('scoreMultiplier');
    });

    test('should reset state on re-place', () => {
      manager.placePowerUps(mazeLayout, 3);
      manager.collectAtPosition(manager.getPowerUps()[0].position);
      manager.placePowerUps(mazeLayout, 2);
      expect(manager.getPowerUps().length).toBe(2);
      expect(manager.getUncollectedPowerUps().length).toBe(2);
    });
  });

  describe('collectAtPosition', () => {
    test('should collect power-up at position', () => {
      manager.placePowerUps(mazeLayout, 3);
      const first = manager.getPowerUps()[0];
      const collected = manager.collectAtPosition(first.position);
      expect(collected).not.toBeNull();
      expect(collected!.type).toBe(first.type);
      expect(first.collected).toBe(true);
    });

    test('should return null if no power-up at position', () => {
      manager.placePowerUps(mazeLayout, 1);
      const result = manager.collectAtPosition({ x: 0, z: 0 });
      expect(result).toBeNull();
    });

    test('should not collect already collected power-up', () => {
      manager.placePowerUps(mazeLayout, 3);
      const first = manager.getPowerUps()[0];
      manager.collectAtPosition(first.position);
      const again = manager.collectAtPosition(first.position);
      expect(again).toBeNull();
    });
  });

  describe('getUncollectedPowerUps', () => {
    test('should decrease after collection', () => {
      manager.placePowerUps(mazeLayout, 3);
      expect(manager.getUncollectedPowerUps().length).toBe(3);
      manager.collectAtPosition(manager.getPowerUps()[0].position);
      expect(manager.getUncollectedPowerUps().length).toBe(2);
    });
  });

  describe('score multiplier', () => {
    test('should return 1 when no multiplier active', () => {
      expect(manager.getScoreMultiplier()).toBe(1);
    });

    test('should return 2 after collecting scoreMultiplier', () => {
      manager.placePowerUps(mazeLayout, 3);
      const multiplierPU = manager.getPowerUps().find(p => p.type === 'scoreMultiplier');
      if (multiplierPU) {
        manager.collectAtPosition(multiplierPU.position);
        expect(manager.getScoreMultiplier()).toBe(2);
      }
    });

    test('should decrement remaining on consumeMultiplierUse', () => {
      manager.placePowerUps(mazeLayout, 3);
      const multiplierPU = manager.getPowerUps().find(p => p.type === 'scoreMultiplier');
      if (multiplierPU) {
        manager.collectAtPosition(multiplierPU.position);
        expect(manager.getScoreMultiplier()).toBe(2);
        manager.consumeMultiplierUse();
        expect(manager.getScoreMultiplier()).toBe(2); // 2 remaining
        manager.consumeMultiplierUse();
        expect(manager.getScoreMultiplier()).toBe(2); // 1 remaining
        manager.consumeMultiplierUse();
        expect(manager.getScoreMultiplier()).toBe(1); // expired
      }
    });

    test('consumeMultiplierUse should be safe when no multiplier active', () => {
      manager.consumeMultiplierUse();
      expect(manager.getScoreMultiplier()).toBe(1);
    });
  });

  describe('getHintAnswer', () => {
    test('should return one of the questions', () => {
      const questions = [
        { direction: 'NORTH' as const, answer: 5 },
        { direction: 'SOUTH' as const, answer: 10 },
      ];
      const hint = manager.getHintAnswer(questions);
      expect(hint).not.toBeNull();
      expect(questions).toContainEqual(hint);
    });

    test('should return null for empty questions', () => {
      expect(manager.getHintAnswer([])).toBeNull();
    });
  });
});

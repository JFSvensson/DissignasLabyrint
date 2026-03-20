import { PlayerLogic } from '../../src/game/PlayerLogic';

describe('PlayerLogic', () => {
  let playerLogic: PlayerLogic;

  beforeEach(() => {
    playerLogic = new PlayerLogic({ x: 1, y: 0.3, z: 1 });
  });

  describe('initial state', () => {
    test('should start at the given position', () => {
      expect(playerLogic.getCurrentPosition()).toEqual({ x: 1, y: 0.3, z: 1 });
    });

    test('should return correct maze position', () => {
      expect(playerLogic.getMazePosition()).toEqual({ x: 1, z: 1 });
    });
  });

  describe('move', () => {
    test('should move NORTH (z decreases)', () => {
      playerLogic.move('NORTH');
      expect(playerLogic.getMazePosition()).toEqual({ x: 1, z: 0 });
    });

    test('should move SOUTH (z increases)', () => {
      playerLogic.move('SOUTH');
      expect(playerLogic.getMazePosition()).toEqual({ x: 1, z: 2 });
    });

    test('should move EAST (x increases)', () => {
      playerLogic.move('EAST');
      expect(playerLogic.getMazePosition()).toEqual({ x: 2, z: 1 });
    });

    test('should move WEST (x decreases)', () => {
      playerLogic.move('WEST');
      expect(playerLogic.getMazePosition()).toEqual({ x: 0, z: 1 });
    });

    test('should preserve y coordinate after move', () => {
      playerLogic.move('NORTH');
      expect(playerLogic.getCurrentPosition().y).toBe(0.3);
    });

    test('should handle multiple moves', () => {
      playerLogic.move('NORTH');
      playerLogic.move('EAST');
      playerLogic.move('EAST');
      expect(playerLogic.getMazePosition()).toEqual({ x: 3, z: 0 });
    });
  });

  describe('resetPosition', () => {
    test('should reset to previous position after move', () => {
      playerLogic.move('NORTH');
      playerLogic.resetPosition();
      expect(playerLogic.getMazePosition()).toEqual({ x: 1, z: 1 });
    });

    test('should reset to the position before the last move only', () => {
      playerLogic.move('NORTH');
      playerLogic.move('EAST');
      playerLogic.resetPosition();
      expect(playerLogic.getMazePosition()).toEqual({ x: 1, z: 0 });
    });
  });
});

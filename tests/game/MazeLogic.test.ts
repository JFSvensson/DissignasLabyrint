import { MazeLogic } from '../../src/game/MazeLogic';
import { MazeQuestion } from '../../src/game/types';

// Mock Player since it depends on Three.js (browser-only)
jest.mock('../../src/game/Player', () => {
  return {
    Player: jest.fn().mockImplementation(() => ({
      getMesh: jest.fn(),
      move: jest.fn(),
      resetPosition: jest.fn(),
      getMazePosition: jest.fn().mockReturnValue({ x: 1, z: 1 })
    }))
  };
});

describe('MazeLogic', () => {
  // Simple 5x5 maze:
  // 1 = wall, 0 = open
  const mazeLayout = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
  ];

  let mazeLogic: MazeLogic;

  beforeEach(() => {
    mazeLogic = new MazeLogic(mazeLayout);
  });

  describe('getAvailableDirections', () => {
    test('should return all open directions from center', () => {
      // Position (1,1) has open: SOUTH (1,2), EAST (2,1)
      const dirs = mazeLogic.getAvailableDirections({ x: 1, z: 1 });
      expect(dirs).toContain('SOUTH');
      expect(dirs).toContain('EAST');
      expect(dirs).not.toContain('NORTH');
      expect(dirs).not.toContain('WEST');
    });

    test('should return correct directions from open area', () => {
      // Position (3,1) has open: SOUTH (3,2), WEST (2,1)
      const dirs = mazeLogic.getAvailableDirections({ x: 3, z: 1 });
      expect(dirs).toContain('SOUTH');
      expect(dirs).toContain('WEST');
    });

    test('should return no directions if surrounded by walls', () => {
      // Create a tiny maze where a cell is surrounded by walls
      const tinyMaze = [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1]
      ];
      const logic = new MazeLogic(tinyMaze);
      const dirs = logic.getAvailableDirections({ x: 1, z: 1 });
      expect(dirs).toHaveLength(0);
    });

    test('should treat out-of-bounds as walls', () => {
      const dirs = mazeLogic.getAvailableDirections({ x: 0, z: 0 });
      expect(dirs).toHaveLength(0);
    });
  });

  describe('setQuestionForDirection / getQuestionsAtPosition', () => {
    test('should set and retrieve questions for a position', () => {
      mazeLogic.setQuestionForDirection({ x: 1, z: 1 }, 'SOUTH', '2 + 3', 5);
      const questions = mazeLogic.getQuestionsAtPosition({ x: 1, z: 1 });
      expect(questions).toHaveLength(1);
      expect(questions[0]).toEqual({
        question: '2 + 3',
        answer: 5,
        direction: 'SOUTH'
      });
    });

    test('should support multiple questions at same position', () => {
      mazeLogic.setQuestionForDirection({ x: 1, z: 1 }, 'SOUTH', '2 + 3', 5);
      mazeLogic.setQuestionForDirection({ x: 1, z: 1 }, 'EAST', '4 * 2', 8);
      const questions = mazeLogic.getQuestionsAtPosition({ x: 1, z: 1 });
      expect(questions).toHaveLength(2);
    });

    test('should return empty array for position with no questions', () => {
      const questions = mazeLogic.getQuestionsAtPosition({ x: 3, z: 3 });
      expect(questions).toHaveLength(0);
    });
  });

  describe('goal', () => {
    test('should default goal to bottom-right corner', () => {
      const goal = mazeLogic.getGoalPosition();
      expect(goal).toEqual({ x: 3, z: 3 });
    });

    test('should accept custom goal position', () => {
      const logic = new MazeLogic(mazeLayout, { x: 1, z: 3 });
      expect(logic.getGoalPosition()).toEqual({ x: 1, z: 3 });
    });

    test('should detect when goal is reached', () => {
      expect(mazeLogic.isGoalReached({ x: 3, z: 3 })).toBe(true);
    });

    test('should detect when goal is not reached', () => {
      expect(mazeLogic.isGoalReached({ x: 1, z: 1 })).toBe(false);
    });
  });

  describe('player management', () => {
    test('should have a player', () => {
      expect(mazeLogic.getPlayer()).toBeDefined();
    });

    test('movePlayer should call player.move', () => {
      const player = mazeLogic.getPlayer();
      mazeLogic.movePlayer('NORTH');
      expect(player.move).toHaveBeenCalledWith('NORTH');
    });

    test('resetPlayerPosition should call player.resetPosition', () => {
      const player = mazeLogic.getPlayer();
      mazeLogic.resetPlayerPosition();
      expect(player.resetPosition).toHaveBeenCalled();
    });
  });

  describe('events', () => {
    test('updateAvailableDirections should emit directionsUpdated', () => {
      const listener = jest.fn();
      mazeLogic.on('directionsUpdated', listener);

      mazeLogic.setQuestionForDirection({ x: 1, z: 1 }, 'SOUTH', '1 + 1', 2);
      mazeLogic.updateAvailableDirections();

      expect(listener).toHaveBeenCalledTimes(1);
      const emittedQuestions: MazeQuestion[] = listener.mock.calls[0][0];
      expect(emittedQuestions).toHaveLength(1);
      expect(emittedQuestions[0].direction).toBe('SOUTH');
    });

    test('movePlayer should emit directionsUpdated', () => {
      const listener = jest.fn();
      mazeLogic.on('directionsUpdated', listener);

      mazeLogic.movePlayer('SOUTH');

      expect(listener).toHaveBeenCalledTimes(1);
    });

    test('resetPlayerPosition should emit directionsUpdated', () => {
      const listener = jest.fn();
      mazeLogic.on('directionsUpdated', listener);

      mazeLogic.resetPlayerPosition();

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});

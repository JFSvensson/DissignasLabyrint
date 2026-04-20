import { ExplorationTracker } from '../../src/game/ExplorationTracker';

// Simple 5×5 maze (DFS-style):
// 1 = wall, 0 = path
const simpleMaze = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
];

describe('ExplorationTracker', () => {
  let tracker: ExplorationTracker;

  beforeEach(() => {
    tracker = new ExplorationTracker(simpleMaze);
  });

  describe('initialization', () => {
    it('should count all path cells', () => {
      // Path cells: (1,1),(1,2),(1,3),(2,1),(2,3),(3,1),(3,2),(3,3) = 8
      expect(tracker.getTotalCells()).toBe(8);
    });

    it('should count total questions (open neighbor pairs)', () => {
      // Each pair of adjacent path cells counts once per direction.
      // (1,1)↔(1,2), (1,2)↔(1,3), (1,1)↔(2,1), (1,3)↔(2,3),
      // (2,1)↔(3,1), (2,3)↔(3,3), (3,1)↔(3,2), (3,2)↔(3,3)
      // Each pair contributes 2 directions = 16 total questions
      expect(tracker.getTotalQuestions()).toBe(16);
    });

    it('should start with start cell visited', () => {
      expect(tracker.getVisitedCount()).toBe(1);
    });
  });

  describe('markVisited', () => {
    it('should increment visited count', () => {
      tracker.markVisited({ x: 1, z: 2 });
      expect(tracker.getVisitedCount()).toBe(2);
    });

    it('should not double-count same cell', () => {
      tracker.markVisited({ x: 1, z: 2 });
      tracker.markVisited({ x: 1, z: 2 });
      expect(tracker.getVisitedCount()).toBe(2);
    });

    it('should not double-count start cell', () => {
      tracker.markVisited({ x: 1, z: 1 });
      expect(tracker.getVisitedCount()).toBe(1);
    });
  });

  describe('getPercentage', () => {
    it('should return percentage of visited cells', () => {
      // 1 of 8 = 13%
      expect(tracker.getPercentage()).toBe(13);
    });

    it('should return 100 when all cells visited', () => {
      // Visit all 8 path cells (start already counted)
      tracker.markVisited({ x: 1, z: 2 });
      tracker.markVisited({ x: 1, z: 3 });
      tracker.markVisited({ x: 2, z: 1 });
      tracker.markVisited({ x: 2, z: 3 });
      tracker.markVisited({ x: 3, z: 1 });
      tracker.markVisited({ x: 3, z: 2 });
      tracker.markVisited({ x: 3, z: 3 });
      expect(tracker.getPercentage()).toBe(100);
    });

    it('should handle empty maze', () => {
      const emptyTracker = new ExplorationTracker([[1, 1], [1, 1]]);
      expect(emptyTracker.getPercentage()).toBe(100);
    });
  });

  describe('isFullyExplored', () => {
    it('should return false initially', () => {
      expect(tracker.isFullyExplored()).toBe(false);
    });

    it('should return true when all cells visited', () => {
      tracker.markVisited({ x: 1, z: 2 });
      tracker.markVisited({ x: 1, z: 3 });
      tracker.markVisited({ x: 2, z: 1 });
      tracker.markVisited({ x: 2, z: 3 });
      tracker.markVisited({ x: 3, z: 1 });
      tracker.markVisited({ x: 3, z: 2 });
      tracker.markVisited({ x: 3, z: 3 });
      expect(tracker.isFullyExplored()).toBe(true);
    });
  });
});

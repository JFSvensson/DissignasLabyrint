import { MazeGenerator } from '../../src/game/MazeGenerator';

describe('MazeGenerator', () => {
  describe('generate', () => {
    it('should return a maze with correct dimensions', () => {
      const maze = MazeGenerator.generate(9, 9);
      expect(maze.length).toBe(9);
      expect(maze[0].length).toBe(9);
    });

    it('should enforce minimum size of 5x5', () => {
      const maze = MazeGenerator.generate(3, 3);
      expect(maze.length).toBeGreaterThanOrEqual(5);
      expect(maze[0].length).toBeGreaterThanOrEqual(5);
    });

    it('should enforce odd dimensions', () => {
      const maze = MazeGenerator.generate(8, 10);
      expect(maze.length % 2).toBe(1);
      expect(maze[0].length % 2).toBe(1);
    });

    it('should have walls on all outer edges', () => {
      const maze = MazeGenerator.generate(9, 9);
      const h = maze.length;
      const w = maze[0].length;

      // Top and bottom rows
      for (let c = 0; c < w; c++) {
        expect(maze[0][c]).toBe(1);
        expect(maze[h - 1][c]).toBe(1);
      }
      // Left and right columns
      for (let r = 0; r < h; r++) {
        expect(maze[r][0]).toBe(1);
        expect(maze[r][w - 1]).toBe(1);
      }
    });

    it('should have start position (1,1) open', () => {
      const maze = MazeGenerator.generate(9, 9);
      expect(maze[1][1]).toBe(0);
    });

    it('should have goal position open', () => {
      const maze = MazeGenerator.generate(9, 9);
      const h = maze.length;
      const w = maze[0].length;
      // Default goal is (h-2, w-2)
      expect(maze[h - 2][w - 2]).toBe(0);
    });

    it('should have a path from start to goal', () => {
      const maze = MazeGenerator.generate(9, 9);
      const h = maze.length;
      const w = maze[0].length;

      // BFS to verify connectivity
      const visited = Array.from({ length: h }, () => Array(w).fill(false));
      const queue: [number, number][] = [[1, 1]];
      visited[1][1] = true;

      while (queue.length > 0) {
        const [r, c] = queue.shift()!;
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < h && nc >= 0 && nc < w && !visited[nr][nc] && maze[nr][nc] === 0) {
            visited[nr][nc] = true;
            queue.push([nr, nc]);
          }
        }
      }

      expect(visited[h - 2][w - 2]).toBe(true);
    });

    it('should generate different mazes on successive calls', () => {
      const mazes = Array.from({ length: 5 }, () => MazeGenerator.generate(9, 9));
      const serialized = mazes.map(m => JSON.stringify(m));
      // At least 2 unique mazes out of 5 (extremely unlikely all identical)
      const unique = new Set(serialized);
      expect(unique.size).toBeGreaterThan(1);
    });

    it('should work with larger dimensions', () => {
      const maze = MazeGenerator.generate(21, 21);
      expect(maze.length).toBe(21);
      expect(maze[0].length).toBe(21);
      expect(maze[1][1]).toBe(0);
      expect(maze[19][19]).toBe(0);
    });

    it('should only contain 0s and 1s', () => {
      const maze = MazeGenerator.generate(11, 11);
      for (const row of maze) {
        for (const cell of row) {
          expect(cell === 0 || cell === 1).toBe(true);
        }
      }
    });
  });
});

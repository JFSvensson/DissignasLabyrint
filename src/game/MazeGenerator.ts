export class MazeGenerator {
  /**
   * Generates a random maze layout using recursive backtracking (DFS).
   * @param width - Total width of the maze (must be odd, >= 5)
   * @param height - Total height of the maze (must be odd, >= 5)
   * @returns number[][] where 1 = wall, 0 = open path
   */
  static generate(width: number, height: number): number[][] {
    // Ensure odd dimensions for proper wall/path grid (min 5x5)
    width = Math.max(5, width % 2 === 0 ? width + 1 : width);
    height = Math.max(5, height % 2 === 0 ? height + 1 : height);

    // Initialize grid filled with walls
    const maze: number[][] = Array.from({ length: height }, () =>
      Array(width).fill(1)
    );

    // Carve paths using recursive backtracking
    this.carve(maze, 1, 1, width, height);

    return maze;
  }

  private static carve(
    maze: number[][],
    row: number,
    col: number,
    width: number,
    height: number
  ): void {
    maze[row][col] = 0;

    const directions = this.shuffleDirections();

    for (const [dr, dc] of directions) {
      const newRow = row + dr * 2;
      const newCol = col + dc * 2;

      if (
        newRow > 0 &&
        newRow < height - 1 &&
        newCol > 0 &&
        newCol < width - 1 &&
        maze[newRow][newCol] === 1
      ) {
        // Carve the wall between current and next cell
        maze[row + dr][col + dc] = 0;
        this.carve(maze, newRow, newCol, width, height);
      }
    }
  }

  private static shuffleDirections(): [number, number][] {
    const directions: [number, number][] = [
      [-1, 0], // up
      [1, 0],  // down
      [0, -1], // left
      [0, 1],  // right
    ];

    // Fisher-Yates shuffle
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }

    return directions;
  }
}

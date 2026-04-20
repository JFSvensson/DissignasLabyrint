import { MazePosition } from './types';

export class ExplorationTracker {
  private readonly totalCells: number;
  private readonly totalQuestions: number;
  private readonly visited: Set<string> = new Set();

  constructor(mazeLayout: number[][]) {
    let cells = 0;
    let questions = 0;

    for (let x = 0; x < mazeLayout.length; x++) {
      for (let z = 0; z < mazeLayout[x].length; z++) {
        if (mazeLayout[x][z] === 0) {
          cells++;
          // Count open neighbor directions (each = one question)
          if (x > 0 && mazeLayout[x - 1][z] === 0) questions++;
          if (x < mazeLayout.length - 1 && mazeLayout[x + 1][z] === 0) questions++;
          if (z > 0 && mazeLayout[x][z - 1] === 0) questions++;
          if (z < mazeLayout[x].length - 1 && mazeLayout[x][z + 1] === 0) questions++;
        }
      }
    }

    this.totalCells = cells;
    this.totalQuestions = questions;
    // Mark start cell as visited
    this.visited.add('1,1');
  }

  public markVisited(pos: MazePosition): void {
    this.visited.add(`${pos.x},${pos.z}`);
  }

  public getVisitedCount(): number {
    return this.visited.size;
  }

  public getTotalCells(): number {
    return this.totalCells;
  }

  public getTotalQuestions(): number {
    return this.totalQuestions;
  }

  public getPercentage(): number {
    if (this.totalCells === 0) return 100;
    return Math.round((this.visited.size / this.totalCells) * 100);
  }

  public isFullyExplored(): boolean {
    return this.visited.size >= this.totalCells;
  }
}

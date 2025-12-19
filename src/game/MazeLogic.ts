import { Direction, MazePosition, MazeQuestion, MazeCell } from './types';

export class MazeLogic {
  private maze: MazeCell[][];
  private goalPosition: MazePosition;

  constructor(mazeLayout: number[][], goalPosition?: MazePosition) {
    this.maze = this.initializeMaze(mazeLayout);
    // Default goal is bottom-right corner (before last wall)
    this.goalPosition = goalPosition || { x: mazeLayout.length - 2, z: mazeLayout[0].length - 2 };
  }

  private initializeMaze(layout: number[][]): MazeCell[][] {
    return layout.map((row, x) => 
      row.map((cell, z) => ({
        position: { x, z },
        questions: [],
        isWall: cell === 1
      }))
    );
  }

  public getAvailableDirections(position: MazePosition): Direction[] {
    const directions: Direction[] = [];
    
    if (!this.isWall({ x: position.x, z: position.z - 1 })) directions.push('NORTH');
    if (!this.isWall({ x: position.x, z: position.z + 1 })) directions.push('SOUTH');
    if (!this.isWall({ x: position.x - 1, z: position.z })) directions.push('WEST');
    if (!this.isWall({ x: position.x + 1, z: position.z })) directions.push('EAST');
    
    return directions;
  }

  private isWall(position: MazePosition): boolean {
    if (position.x < 0 || position.x >= this.maze.length || 
        position.z < 0 || position.z >= this.maze[0].length) {
      return true;
    }
    return this.maze[position.x][position.z].isWall;
  }

  public getQuestionsAtPosition(position: MazePosition): MazeQuestion[] {
    return this.maze[position.x][position.z].questions;
  }

  public setQuestionForDirection(
    position: MazePosition,
    direction: Direction,
    question: string,
    answer: number
  ): void {
    const cell = this.maze[position.x][position.z];
    cell.questions.push({ question, answer, direction });
  }

  public isGoalReached(position: MazePosition): boolean {
    return position.x === this.goalPosition.x && position.z === this.goalPosition.z;
  }

  public getGoalPosition(): MazePosition {
    return { ...this.goalPosition };
  }
}

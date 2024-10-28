import { Direction, MazePosition, MazeQuestion, MazeCell } from './types';

export class MazeLogic {
  private maze: MazeCell[][];

  constructor(mazeLayout: number[][]) {
    this.maze = this.initializeMaze(mazeLayout);
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
    
    if (!this.isWall({ x: position.x, z: position.z - 1 })) directions.push('FORWARD');
    if (!this.isWall({ x: position.x, z: position.z + 1 })) directions.push('BACK');
    if (!this.isWall({ x: position.x - 1, z: position.z })) directions.push('LEFT');
    if (!this.isWall({ x: position.x + 1, z: position.z })) directions.push('RIGHT');
    
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
}

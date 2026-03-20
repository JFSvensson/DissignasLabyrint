import { MazeLogic } from './MazeLogic';
import { Direction, MazePosition } from './types';
import { Addition } from '../operations/Addition';
import { Subtraction } from '../operations/Subtraction';
import { Multiplication } from '../operations/Multiplication';
import { Division } from '../operations/Division';
import { Operation } from '../operations/Operation';

export class QuestionGenerator {
  private static easyOperations: Operation[] = [
    new Addition(),
    new Subtraction()
  ];

  private static allOperations: Operation[] = [
    new Addition(),
    new Subtraction(),
    new Multiplication(),
    new Division()
  ];

  /**
   * Returns a difficulty level (1-3) based on Manhattan distance from start (1,1)
   * to the given position, relative to the goal position.
   */
  public static getDifficulty(position: MazePosition, mazeWidth: number, mazeHeight: number): number {
    const maxDistance = (mazeWidth - 2) + (mazeHeight - 2); // distance from (1,1) to goal
    const distance = Math.abs(position.x - 1) + Math.abs(position.z - 1);
    const ratio = distance / maxDistance;

    if (ratio < 0.33) return 1;
    if (ratio < 0.66) return 2;
    return 3;
  }

  /**
   * Returns max number for operations based on difficulty level.
   */
  public static getMaxForDifficulty(difficulty: number): number {
    switch (difficulty) {
      case 1: return 10;
      case 2: return 20;
      case 3: return 50;
      default: return 10;
    }
  }

  /**
   * Returns available operations based on difficulty level.
   * Easy (1): addition, subtraction only.
   * Medium+ (2-3): all four operations.
   */
  public static getOperationsForDifficulty(difficulty: number): Operation[] {
    return difficulty <= 1 ? this.easyOperations : this.allOperations;
  }

  public static generateQuestionsForMaze(mazeLogic: MazeLogic, mazeLayout: number[][]): void {
    const mazeHeight = mazeLayout.length;
    const mazeWidth = mazeLayout[0].length;

    for (let x = 0; x < mazeHeight; x++) {
      for (let z = 0; z < mazeWidth; z++) {
        if (mazeLayout[x][z] === 0) {
          const position: MazePosition = { x, z };
          const difficulty = this.getDifficulty(position, mazeWidth, mazeHeight);
          const max = this.getMaxForDifficulty(difficulty);
          const operations = this.getOperationsForDifficulty(difficulty);
          const availableDirections = mazeLogic.getAvailableDirections(position);
          
          availableDirections.forEach(direction => {
            const operation = operations[Math.floor(Math.random() * operations.length)];
            const [a, b] = operation.generateNumbers(max);
            const question = operation.formatQuestion(a, b);
            const answer = operation.calculate(a, b);
            mazeLogic.setQuestionForDirection(position, direction, question, answer);
          });
        }
      }
    }
  }
}

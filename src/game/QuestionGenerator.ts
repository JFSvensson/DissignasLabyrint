import { MazeLogic } from './MazeLogic';
import { Direction, MazePosition } from './types';
import { Addition } from '../operations/Addition';
import { Subtraction } from '../operations/Subtraction';
import { Multiplication } from '../operations/Multiplication';
import { Division } from '../operations/Division';
import { Modulo } from '../operations/Modulo';
import { Power } from '../operations/Power';
import { Operation } from '../operations/Operation';
import { MathDifficulty, mathDifficultyToBase } from './GameConfig';

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

  private static hardOperations: Operation[] = [
    new Addition(),
    new Subtraction(),
    new Multiplication(),
    new Division(),
    new Modulo(),
    new Power()
  ];

  /**
   * Returns a difficulty level (1-3) based on Manhattan distance from start (1,1)
   * to the given position, relative to the goal position.
   * The baseDifficulty parameter shifts the range up (0=normal, 1=medium, 2=hard).
   */
  public static getDifficulty(position: MazePosition, mazeWidth: number, mazeHeight: number, baseDifficulty: number = 0): number {
    const maxDistance = (mazeWidth - 2) + (mazeHeight - 2);
    const distance = Math.abs(position.x - 1) + Math.abs(position.z - 1);
    const ratio = distance / maxDistance;

    let level: number;
    if (ratio < 0.33) level = 1;
    else if (ratio < 0.66) level = 2;
    else level = 3;

    return Math.min(3, level + baseDifficulty);
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
    if (difficulty <= 1) return this.easyOperations;
    if (difficulty <= 2) return this.allOperations;
    return this.hardOperations;
  }

  public static generateQuestionsForMaze(mazeLogic: MazeLogic, mazeLayout: number[][], mathDifficulty?: MathDifficulty): void {
    const mazeHeight = mazeLayout.length;
    const mazeWidth = mazeLayout[0].length;
    const baseDiff = mathDifficulty ? mathDifficultyToBase(mathDifficulty) : 0;

    for (let x = 0; x < mazeHeight; x++) {
      for (let z = 0; z < mazeWidth; z++) {
        if (mazeLayout[x][z] === 0) {
          const position: MazePosition = { x, z };
          const difficulty = this.getDifficulty(position, mazeWidth, mazeHeight, baseDiff);
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

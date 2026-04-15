import { MazeLogic } from './MazeLogic';
import { Direction, MazePosition } from './types';
import { Operation, Addition, Subtraction, Multiplication, Division, Modulo, Power } from '../operations';
import { MathDifficulty, mathDifficultyToBase } from './GameConfig';

export class QuestionGenerator {
  private readonly easyOperations: Operation[];
  private readonly allOperations: Operation[];
  private readonly hardOperations: Operation[];

  constructor(
    easyOperations?: Operation[],
    allOperations?: Operation[],
    hardOperations?: Operation[]
  ) {
    this.easyOperations = easyOperations ?? [new Addition(), new Subtraction()];
    this.allOperations = allOperations ?? [new Addition(), new Subtraction(), new Multiplication(), new Division()];
    this.hardOperations = hardOperations ?? [new Addition(), new Subtraction(), new Multiplication(), new Division(), new Modulo(), new Power()];
  }

  public getDifficulty(position: MazePosition, mazeWidth: number, mazeHeight: number, baseDifficulty: number = 0): number {
    const maxDistance = (mazeWidth - 2) + (mazeHeight - 2);
    const distance = Math.abs(position.x - 1) + Math.abs(position.z - 1);
    const ratio = distance / maxDistance;

    let level: number;
    if (ratio < 0.33) level = 1;
    else if (ratio < 0.66) level = 2;
    else level = 3;

    return Math.min(3, level + baseDifficulty);
  }

  public getMaxForDifficulty(difficulty: number): number {
    switch (difficulty) {
      case 1: return 10;
      case 2: return 20;
      case 3: return 50;
      default: return 10;
    }
  }

  public getOperationsForDifficulty(difficulty: number): Operation[] {
    if (difficulty <= 1) return this.easyOperations;
    if (difficulty <= 2) return this.allOperations;
    return this.hardOperations;
  }

  public generateQuestionsForMaze(mazeLogic: MazeLogic, mazeLayout: number[][], mathDifficulty?: MathDifficulty): void {
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

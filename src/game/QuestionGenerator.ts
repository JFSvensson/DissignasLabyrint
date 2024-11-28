import { MazeLogic } from './MazeLogic';
import { Direction, MazePosition } from './types';
import { Addition } from '../operations/Addition';
import { Subtraction } from '../operations/Subtraction';
import { Multiplication } from '../operations/Multiplication';
import { Division } from '../operations/Division';
import { Operation } from '../operations/Operation';

export class QuestionGenerator {
  private static operations: Operation[] = [
    new Addition(),
    new Subtraction(),
    new Multiplication(),
    new Division()
  ];

  public static generateQuestionsForMaze(mazeLogic: MazeLogic, mazeLayout: number[][]): void {
    for (let x = 0; x < mazeLayout.length; x++) {
      for (let z = 0; z < mazeLayout[x].length; z++) {
        if (mazeLayout[x][z] === 0) {
          const position: MazePosition = { x, z };
          const availableDirections = mazeLogic.getAvailableDirections(position);
          
          availableDirections.forEach(direction => {
            const operation = this.operations[Math.floor(Math.random() * this.operations.length)];
            const [a, b] = operation.generateNumbers(10);
            const question = operation.formatQuestion(a, b);
            const answer = operation.calculate(a, b);
            mazeLogic.setQuestionForDirection(position, direction, question, answer);
          });
        }
      }
    }
  }
}

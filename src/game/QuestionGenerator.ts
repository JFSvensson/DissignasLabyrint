import { MazeLogic } from './MazeLogic';
import { Direction, MazePosition } from './types';

export class QuestionGenerator {
  private static operations = [
    { 
      operator: '+', 
      generate: (max = 10) => {
        const a = Math.floor(Math.random() * max);
        const b = Math.floor(Math.random() * max);
        return {
          question: `${a} + ${b}`,
          answer: a + b
        };
      }
    },
    { 
      operator: '-',
      generate: (max = 10) => {
        const b = Math.floor(Math.random() * max);
        const a = Math.floor(Math.random() * max) + b; // Säkerställ positivt svar
        return {
          question: `${a} - ${b}`,
          answer: a - b
        };
      }
    },
    { 
      operator: '*',
      generate: (max = 10) => {
        const a = Math.floor(Math.random() * (max/2)) + 1;
        const b = Math.floor(Math.random() * (max/2)) + 1;
        return {
          question: `${a} × ${b}`,
          answer: a * b
        };
      }
    }
  ];

  public static generateQuestionsForMaze(mazeLogic: MazeLogic, mazeLayout: number[][]): void {
    for (let x = 0; x < mazeLayout.length; x++) {
      for (let z = 0; z < mazeLayout[x].length; z++) {
        if (mazeLayout[x][z] === 0) { // Om det är en gångbar ruta
          const position: MazePosition = { x, z };
          const availableDirections = mazeLogic.getAvailableDirections(position);
          
          availableDirections.forEach(direction => {
            const operation = this.operations[Math.floor(Math.random() * this.operations.length)];
            const { question, answer } = operation.generate();
            mazeLogic.setQuestionForDirection(position, direction, question, answer);
          });
        }
      }
    }
  }
}

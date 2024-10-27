import { MathOperation } from '../interfaces/MathOperation';
import { MathQuestion } from '../interfaces/MathQuestion';

export class Addition implements MathOperation {
  generate(max: number): MathQuestion {
    const a = this.generateRandomNumber(max);
    const b = this.generateRandomNumber(max);
    return {
      question: `${a} + ${b}`,
      answer: a + b
    };
  }

  private generateRandomNumber(max: number): number {
    return Math.floor(Math.random() * max);
  }
}


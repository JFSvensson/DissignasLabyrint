import { MathOperation } from './interfaces/MathOperation';
import { MathQuestion } from './interfaces/MathQuestion';

export class MathQuestionGenerator {
  private operation: MathOperation;

  constructor(operation: MathOperation) {
    this.operation = operation;
  }

  generateQuestion(max: number = 10): MathQuestion {
    return this.operation.generate(max);
  }

  setOperation(operation: MathOperation): void {
    this.operation = operation;
  }
}


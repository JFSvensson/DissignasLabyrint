import { MathQuestion } from './MathQuestion';

export interface MathOperation {
  generate(max: number): MathQuestion;
}


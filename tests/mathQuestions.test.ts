import { QuestionGenerator } from '../src/game/QuestionGenerator';
import { Addition } from '../src/operations/Addition';

describe('Addition', () => {
  let operation: Addition;

  beforeEach(() => {
    operation = new Addition();
  });

  test('should generate an addition question', () => {
    const [a, b] = operation.generateNumbers(10);
    const question = operation.formatQuestion(a, b);
    const answer = operation.calculate(a, b);
    
    expect(question).toMatch(/^\d+ \+ \d+$/);
    expect(typeof answer).toBe('number');
    expect(operation.calculate(a, b)).toBe(a + b);
  });

  test('should generate numbers within max value', () => {
    const max = 5;
    const [a, b] = operation.generateNumbers(max);
    
    expect(a).toBeLessThan(max);
    expect(b).toBeLessThan(max);
  });
});

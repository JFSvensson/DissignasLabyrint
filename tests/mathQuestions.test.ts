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

  test('should handle zero values correctly', () => {
    const [a, b] = [0, 5];
    
    expect(operation.formatQuestion(a, b)).toBe('0 + 5');
    expect(operation.calculate(a, b)).toBe(5);
  });

  test('should handle negative numbers if allowed', () => {
    const [a, b] = [-3, 5];
    
    expect(operation.formatQuestion(a, b)).toBe('-3 + 5');
    expect(operation.calculate(a, b)).toBe(2);
  });

  test('should validate input parameters', () => {
    expect(() => operation.generateNumbers(-1)).toThrow();
  });
});

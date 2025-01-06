import { Multiplication } from '../../src/operations/Multiplication';

describe('Multiplication', () => {
  const multiplication = new Multiplication();

  test('should multiply two positive numbers', () => {
    expect(multiplication.calculate(4, 3)).toBe(12);
  });

  test('should handle zero', () => {
    expect(multiplication.calculate(5, 0)).toBe(0);
    expect(multiplication.calculate(0, 5)).toBe(0);
  });

  test('should format question correctly', () => {
    expect(multiplication.formatQuestion(4, 3)).toBe('4 × 3');
  });
});

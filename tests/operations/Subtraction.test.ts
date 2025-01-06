import { Subtraction } from '../../src/operations/Subtraction';

describe('Subtraction', () => {
  const subtraction = new Subtraction();

  test('should subtract two positive numbers', () => {
    expect(subtraction.calculate(5, 3)).toBe(2);
  });

  test('should handle zero', () => {
    expect(subtraction.calculate(5, 0)).toBe(5);
    expect(subtraction.calculate(0, 5)).toBe(-5);
  });

  test('should format question correctly', () => {
    expect(subtraction.formatQuestion(5, 3)).toBe('5 - 3');
  });
});

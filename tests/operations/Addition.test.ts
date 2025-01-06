import { Addition } from '../../src/operations/Addition';

describe('Addition', () => {
  const addition = new Addition();

  test('should add two positive numbers', () => {
    expect(addition.calculate(5, 3)).toBe(8);
  });

  test('should handle zero', () => {
    expect(addition.calculate(5, 0)).toBe(5);
    expect(addition.calculate(0, 5)).toBe(5);
  });

  test('should format question correctly', () => {
    expect(addition.formatQuestion(5, 3)).toBe('5 + 3');
  });
});

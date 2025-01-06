import { Division } from '../../src/operations/Division';

describe('Division', () => {
  const division = new Division();

  test('should divide two numbers correctly', () => {
    expect(division.calculate(6, 2)).toBe(3);
    expect(division.calculate(8, 4)).toBe(2);
  });

  test('should format question correctly', () => {
    expect(division.formatQuestion(6, 2)).toBe('6 ÷ 2');
  });

  describe('generateNumbers', () => {
    test('should generate valid division pairs', () => {
      const [a, b] = division.generateNumbers(10);
      expect(b).not.toBe(0);
      expect(a % b).toBe(0);
      expect(a).toBeLessThanOrEqual(10);
      expect(b).toBeLessThanOrEqual(10);
    });

    test('should always return numbers that divide evenly', () => {
      for (let i = 0; i < 100; i++) {  // Testa många gånger för att säkerställa
        const [a, b] = division.generateNumbers(10);
        expect(Number.isInteger(a / b)).toBe(true);
      }
    });

    test('should respect max limit', () => {
      for (let i = 0; i < 50; i++) {
        const [a, b] = division.generateNumbers(10);
        expect(a).toBeLessThanOrEqual(10);
        expect(b).toBeLessThanOrEqual(10);
      }
    });
  });
});
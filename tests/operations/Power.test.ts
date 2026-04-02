import { Power } from '../../src/operations/Power';

describe('Power', () => {
  const power = new Power();

  test('should calculate power correctly', () => {
    expect(power.calculate(2, 3)).toBe(8);
    expect(power.calculate(5, 2)).toBe(25);
    expect(power.calculate(3, 3)).toBe(27);
    expect(power.calculate(1, 2)).toBe(1);
    expect(power.calculate(10, 2)).toBe(100);
  });

  test('should format question correctly', () => {
    expect(power.formatQuestion(5, 2)).toBe('5^2');
    expect(power.formatQuestion(3, 3)).toBe('3^3');
  });

  test('should return correct name', () => {
    expect(power.getName()).toBe('math.operations.power');
  });

  describe('generateNumbers', () => {
    test('should generate base between 1 and max(10)', () => {
      for (let i = 0; i < 50; i++) {
        const [a] = power.generateNumbers(20);
        expect(a).toBeGreaterThanOrEqual(1);
        expect(a).toBeLessThanOrEqual(10);
      }
    });

    test('should generate exponent 2 or 3', () => {
      const exponents = new Set<number>();
      for (let i = 0; i < 100; i++) {
        const [, b] = power.generateNumbers(10);
        exponents.add(b);
        expect(b === 2 || b === 3).toBe(true);
      }
    });

    test('should respect max for small values', () => {
      for (let i = 0; i < 50; i++) {
        const [a] = power.generateNumbers(5);
        expect(a).toBeGreaterThanOrEqual(1);
        expect(a).toBeLessThanOrEqual(5);
      }
    });
  });
});

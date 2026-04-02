import { Modulo } from '../../src/operations/Modulo';

describe('Modulo', () => {
  const modulo = new Modulo();

  test('should calculate modulo correctly', () => {
    expect(modulo.calculate(10, 3)).toBe(1);
    expect(modulo.calculate(8, 4)).toBe(0);
    expect(modulo.calculate(7, 2)).toBe(1);
    expect(modulo.calculate(15, 6)).toBe(3);
  });

  test('should format question correctly', () => {
    expect(modulo.formatQuestion(10, 3)).toBe('10 mod 3');
    expect(modulo.formatQuestion(7, 2)).toBe('7 mod 2');
  });

  test('should return correct name', () => {
    expect(modulo.getName()).toBe('math.operations.modulo');
  });

  describe('generateNumbers', () => {
    test('should generate valid number pairs', () => {
      for (let i = 0; i < 50; i++) {
        const [a, b] = modulo.generateNumbers(20);
        expect(b).toBeGreaterThanOrEqual(2);
        expect(a).toBeGreaterThanOrEqual(b);
      }
    });

    test('should keep b within reasonable bounds', () => {
      for (let i = 0; i < 50; i++) {
        const [, b] = modulo.generateNumbers(10);
        expect(b).toBeGreaterThanOrEqual(2);
        expect(b).toBeLessThanOrEqual(7); // max/2 + 2 ceiling
      }
    });
  });
});

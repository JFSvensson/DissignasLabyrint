import { Addition } from '../src/operations/Addition';
import { Subtraction } from '../src/operations/Subtraction';
import { Multiplication } from '../src/operations/Multiplication';

describe('Mathematical Operations', () => {
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
});
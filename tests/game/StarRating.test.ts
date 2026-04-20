import { calcStarRating, calcExplorationBonus } from '../../src/game/StarRating';

describe('calcStarRating', () => {
  it('returns 3 stars for 100% explored and ≥80% accuracy', () => {
    expect(calcStarRating(100, 80)).toBe(3);
    expect(calcStarRating(100, 95)).toBe(3);
  });

  it('returns 2 stars for ≥75% explored and ≥60% accuracy', () => {
    expect(calcStarRating(75, 60)).toBe(2);
    expect(calcStarRating(90, 70)).toBe(2);
    expect(calcStarRating(99, 79)).toBe(2);
  });

  it('returns 1 star for lower values', () => {
    expect(calcStarRating(50, 50)).toBe(1);
    expect(calcStarRating(74, 60)).toBe(1);
    expect(calcStarRating(75, 59)).toBe(1);
    expect(calcStarRating(10, 10)).toBe(1);
  });

  it('returns 2 (not 3) for 100% explored with <80% accuracy', () => {
    expect(calcStarRating(100, 79)).toBe(2);
    expect(calcStarRating(100, 60)).toBe(2);
  });
});

describe('calcExplorationBonus', () => {
  it('returns 50% of base score at 100% exploration', () => {
    expect(calcExplorationBonus(100, 100)).toBe(50);
    expect(calcExplorationBonus(200, 100)).toBe(100);
  });

  it('returns 25% of base score at 75-99% exploration', () => {
    expect(calcExplorationBonus(100, 75)).toBe(25);
    expect(calcExplorationBonus(100, 99)).toBe(25);
  });

  it('returns 10% of base score at 50-74% exploration', () => {
    expect(calcExplorationBonus(100, 50)).toBe(10);
    expect(calcExplorationBonus(100, 74)).toBe(10);
  });

  it('returns 0 for <50% exploration', () => {
    expect(calcExplorationBonus(100, 49)).toBe(0);
    expect(calcExplorationBonus(100, 0)).toBe(0);
  });

  it('rounds to nearest integer', () => {
    expect(calcExplorationBonus(33, 100)).toBe(17); // 33 * 0.5 = 16.5 → 17
    expect(calcExplorationBonus(33, 75)).toBe(8);   // 33 * 0.25 = 8.25 → 8
  });
});

/**
 * Calculate star rating based on exploration and accuracy.
 *
 * ★☆☆ = reached the goal
 * ★★☆ = ≥75 % explored AND ≥60 % accuracy
 * ★★★ = 100 % explored AND ≥80 % accuracy
 */
export function calcStarRating(explorationPct: number, accuracy: number): number {
  if (explorationPct >= 100 && accuracy >= 80) return 3;
  if (explorationPct >= 75 && accuracy >= 60) return 2;
  return 1;
}

/**
 * Calculate exploration bonus as a fraction of the base score.
 *
 * 100 % → +50 %
 *  75 % → +25 %
 *  50 % → +10 %
 *   <50 → 0
 */
export function calcExplorationBonus(baseScore: number, explorationPct: number): number {
  if (explorationPct >= 100) return Math.round(baseScore * 0.5);
  if (explorationPct >= 75) return Math.round(baseScore * 0.25);
  if (explorationPct >= 50) return Math.round(baseScore * 0.1);
  return 0;
}

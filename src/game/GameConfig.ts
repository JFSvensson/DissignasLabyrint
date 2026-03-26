export interface GameConfig {
  mazeSize: number;
  mathDifficulty: MathDifficulty;
  timerEnabled: boolean;
  timerSeconds: number;
}

export type MathDifficulty = 'easy' | 'medium' | 'hard';

export interface LevelDefinition {
  level: number;
  mazeSize: number;
  mathDifficulty: MathDifficulty;
  timerSeconds: number;
}

export const LEVELS: LevelDefinition[] = [
  { level: 1, mazeSize: 5,  mathDifficulty: 'easy',   timerSeconds: 0 },
  { level: 2, mazeSize: 7,  mathDifficulty: 'easy',   timerSeconds: 0 },
  { level: 3, mazeSize: 7,  mathDifficulty: 'medium', timerSeconds: 0 },
  { level: 4, mazeSize: 9,  mathDifficulty: 'medium', timerSeconds: 0 },
  { level: 5, mazeSize: 9,  mathDifficulty: 'hard',   timerSeconds: 180 },
  { level: 6, mazeSize: 11, mathDifficulty: 'hard',   timerSeconds: 240 },
  { level: 7, mazeSize: 13, mathDifficulty: 'hard',   timerSeconds: 300 },
];

export const DEFAULT_CONFIG: GameConfig = {
  mazeSize: 9,
  mathDifficulty: 'medium',
  timerEnabled: false,
  timerSeconds: 0,
};

/** Map MathDifficulty to a base difficulty multiplier for QuestionGenerator */
export function mathDifficultyToBase(difficulty: MathDifficulty): number {
  switch (difficulty) {
    case 'easy': return 0;
    case 'medium': return 1;
    case 'hard': return 2;
  }
}

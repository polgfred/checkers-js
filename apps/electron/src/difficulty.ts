export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export const DEFAULT_DIFFICULTY: Difficulty = 'easy';

export const DIFFICULTY_DEPTH: Record<Difficulty, number> = {
  easy: 6,
  medium: 9,
  hard: 12,
};

export function isDifficulty(value: string): value is Difficulty {
  return (DIFFICULTIES as readonly string[]).includes(value);
}

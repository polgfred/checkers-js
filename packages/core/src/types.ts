export const SideType = {
  RED: 1,
  WHT: -1,
} as const;

type ValueOf<T> = T[keyof T];

export type SideType = ValueOf<typeof SideType>;

export const PieceType = {
  EMPTY: 0,
  RED_PIECE: 1,
  RED_KING: 2,
  WHT_PIECE: -1,
  WHT_KING: -2,
} as const;

export type PieceType = ValueOf<typeof PieceType>;

type RowType = [
  PieceType,
  PieceType,
  PieceType,
  PieceType,
  PieceType,
  PieceType,
  PieceType,
  PieceType,
];

export type BoardType = readonly [
  RowType,
  RowType,
  RowType,
  RowType,
  RowType,
  RowType,
  RowType,
  RowType,
];

export type StartType = readonly [number, number];
export type StepType = readonly [number, number];
export type JumpStepType = readonly [number, number, number, number];

export type MoveType = {
  readonly kind: 'move';
  readonly start: StartType;
  readonly end: StepType;
};

export type JumpType = {
  readonly kind: 'jump';
  readonly start: StartType;
  readonly steps: readonly JumpStepType[];
};

export type PlayType = MoveType | JumpType;

export interface TreeType {
  [key: string]: TreeType;
}

export type FormationEntry = {
  readonly dx: number;
  readonly dy: number;
  readonly value: 0 | 1 | 2 | 3 | -1 | -2 | -3;
};

export type FormationType = readonly FormationEntry[];

export type ScoreEntry = {
  readonly formation: FormationType;
  readonly score: number;
};

export type ScoresType = readonly ScoreEntry[][][];

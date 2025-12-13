export const SideType = {
  RED: 1,
  WHT: -1,
} as const;

export type SideType = typeof SideType.RED | typeof SideType.WHT;

export const PieceType = {
  EMPTY: 0,
  RED_PIECE: 1,
  RED_KING: 2,
  RED_EITHER: 3,
  WHT_PIECE: -1,
  WHT_KING: -2,
  WHT_EITHER: -3,
} as const;

export type PieceType =
  | typeof PieceType.EMPTY
  | typeof PieceType.RED_PIECE
  | typeof PieceType.RED_KING
  | typeof PieceType.RED_EITHER
  | typeof PieceType.WHT_PIECE
  | typeof PieceType.WHT_KING
  | typeof PieceType.WHT_EITHER;

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

export type SegmentType =
  | readonly [number, number]
  | readonly [number, number, number, number];

export type MoveType = readonly SegmentType[];

export interface TreeType {
  [key: string]: TreeType;
}

export type FormationType = readonly [number, number, PieceType][];
export type ScoresType = readonly [FormationType, number][][][];
